import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { ApiResult, ScanResult } from "@/lib/types";
import { getUser, isPremium } from "@/lib/dal";
import { getServiceClient, getSupabaseServer } from "@/lib/supabase/server";
import { cropHealthConfigured, identifyCrop } from "@/lib/plant-id";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

const FREE_SCANS_PER_MONTH = 30;
// Effectively unlimited; still counted for usage stats.
const PREMIUM_SCAN_LIMIT = 1_000_000;

const BodySchema = z.object({
  image: z.string().min(10), // base64, no data: prefix
  mediaType: z
    .enum(["image/jpeg", "image/png", "image/webp"])
    .default("image/jpeg"),
  lang: z.enum(["en", "hi", "te", "kn", "ta"]).default("en"),
  // Optional 96px JPEG data-URL thumbnail, stored for premium cloud history.
  thumb: z.string().max(100_000).optional(),
});

/** How each language is described to the model in the system prompt. */
const LANGUAGE_NAMES: Record<z.infer<typeof BodySchema>["lang"], string> = {
  en: "English",
  hi: "Hindi (Devanagari script)",
  te: "Telugu (Telugu script)",
  kn: "Kannada (Kannada script)",
  ta: "Tamil (Tamil script)",
};

const ResultSchema = z.object({
  isPlant: z.boolean(),
  plant: z.string(),
  stage: z.string(),
  health: z.enum(["healthy", "unhealthy", "unsure"]),
  disease: z.string(),
  cause: z.string(),
  cure: z.string(),
  prevention: z.string(),
  tips: z.string(),
  confidence: z.enum(["low", "medium", "high"]),
});

const TOOL: Anthropic.Tool = {
  name: "report_plant",
  description:
    "Report the structured analysis of the plant photo for a farmer.",
  input_schema: {
    type: "object",
    properties: {
      isPlant: {
        type: "boolean",
        description: "True only if the image clearly shows a plant/crop/leaf.",
      },
      plant: { type: "string", description: "Likely crop/plant name, or empty." },
      stage: {
        type: "string",
        description:
          "Growth stage in plain words (e.g. seedling, vegetative, flowering, fruiting, maturity).",
      },
      health: { type: "string", enum: ["healthy", "unhealthy", "unsure"] },
      disease: {
        type: "string",
        description: "Disease/pest/deficiency name if unhealthy, else empty.",
      },
      cause: { type: "string", description: "Likely cause, or empty." },
      cure: {
        type: "string",
        description:
          "Concrete treatment steps a small farmer can follow, including organic and chemical options with example inputs. Empty if healthy.",
      },
      prevention: {
        type: "string",
        description: "Practical prevention advice for future crops.",
      },
      tips: { type: "string", description: "One or two extra useful tips." },
      confidence: { type: "string", enum: ["low", "medium", "high"] },
    },
    required: [
      "isPlant",
      "plant",
      "stage",
      "health",
      "disease",
      "cause",
      "cure",
      "prevention",
      "tips",
      "confidence",
    ],
  },
};

function fail(error: string, status = 200) {
  return NextResponse.json(
    { ok: false, data: null, source: "none", fallbackUsed: false, error },
    { status },
  );
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return fail("missing_api_key");

  let parsed;
  try {
    parsed = BodySchema.parse(await request.json());
  } catch {
    return fail("bad_request", 400);
  }

  const user = await getUser();
  if (!user) return fail("auth_required", 401);

  const premium = await isPremium(user.id);
  const supabase = await getSupabaseServer();

  // Atomic consume; NULL data means the monthly quota is exhausted.
  const { data: newCount, error: quotaError } = await supabase.rpc(
    "consume_scan",
    { p_limit: premium ? PREMIUM_SCAN_LIMIT : FREE_SCANS_PER_MONTH },
  );
  if (quotaError) return fail("quota_check_failed");
  if (newCount == null) return fail("quota_exceeded", 402);

  // Refunds are service-role-only (a user-callable refund would allow quota
  // resets). Without the service key, a failed model call burns one scan.
  const refund = async () => {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;
    try {
      await getServiceClient().rpc("refund_scan", { p_user: user.id });
    } catch {
      /* best-effort */
    }
  };

  const languageName = LANGUAGE_NAMES[parsed.lang];

  // --- Stage 1: dedicated crop-ID model (never throws) ---
  const idOutcome = cropHealthConfigured()
    ? await identifyCrop({
        image: parsed.image,
        mediaType: parsed.mediaType,
        lang: parsed.lang,
      })
    : ({ ok: false, reason: "not_configured" } as const);
  const idUsed = idOutcome.ok;

  // Build the prior Claude reasons from. Claude always also sees the photo, so
  // a failed/low-confidence stage-1 degrades to Claude identifying on its own.
  let priorNote: string;
  if (idOutcome.ok && idOutcome.data.isPlant) {
    const d = idOutcome.data;
    const pct = Math.round(d.confidence * 100);
    const finding = d.disease
      ? `the most likely problem is "${d.disease}"`
      : d.isHealthy === true
        ? "it judged the plant healthy"
        : "it did not pin down a specific disease";
    priorNote =
      `A specialist crop-identification model analysed this photo first. Treat its finding as a ` +
      `strong prior, but you also have the photo — confirm or correct it. It reports: crop = ` +
      `"${d.crop ?? "uncertain"}"; ${finding}; specialist confidence = ${pct}%. If that confidence ` +
      `is low (roughly below 50%) or its finding conflicts with what you see, HEDGE clearly: tell ` +
      `the farmer what it looks like and exactly what to check to confirm, and set the confidence ` +
      `field to "low".`;
  } else if (idOutcome.ok) {
    priorNote =
      `A specialist crop-identification model did not detect a plant in this image. If you agree it ` +
      `is not a plant/crop/leaf, set isPlant false; otherwise identify it yourself and be cautious.`;
  } else {
    priorNote =
      `(The specialist crop-identification service was unavailable for this photo — identify the crop, ` +
      `growth stage and any disease directly from the image yourself, and be honest about uncertainty.)`;
  }

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system:
        `You are an expert agronomist helping Indian small farmers. ${priorNote} ` +
        `Using the specialist finding above together with the photo, identify the crop, its growth ` +
        `stage, and whether it is healthy. If unhealthy, name the disease/pest/deficiency and give ` +
        `practical, affordable treatment and prevention suited to Indian farming. Write ALL text ` +
        `field values in ${languageName}, in simple words a farmer understands. Be honest about ` +
        `uncertainty. Always call the report_plant tool.`,
      tools: [TOOL],
      tool_choice: { type: "tool", name: "report_plant" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: parsed.mediaType,
                data: parsed.image,
              },
            },
            {
              type: "text",
              text: "Analyse this plant for me and fill the report.",
            },
          ],
        },
      ],
    });

    const toolUse = message.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
    );
    if (!toolUse) {
      await refund();
      return fail("no_result");
    }

    const result = ResultSchema.parse(toolUse.input) as ScanResult;

    // Premium perk: persist history (and thumbnail) server-side so it syncs
    // across devices. Failures here must never break the scan response.
    if (premium && result.isPlant) {
      try {
        let thumbPath: string | null = null;
        const thumbMatch = parsed.thumb?.match(
          /^data:image\/jpeg;base64,(.+)$/,
        );
        if (thumbMatch) {
          thumbPath = `${user.id}/${crypto.randomUUID()}.jpg`;
          const { error: uploadError } = await supabase.storage
            .from("scan-thumbs")
            .upload(thumbPath, Buffer.from(thumbMatch[1], "base64"), {
              contentType: "image/jpeg",
            });
          if (uploadError) thumbPath = null;
        }
        await supabase.from("scan_history").insert({
          user_id: user.id,
          lang: parsed.lang,
          result,
          thumb_path: thumbPath,
        });
      } catch {
        /* history is best-effort */
      }
    }

    return NextResponse.json({
      ok: true,
      data: result,
      source: idUsed ? `crop.health+${MODEL}` : MODEL,
      // The crop-ID stage was skipped/unavailable; Claude-only was the fallback.
      fallbackUsed: !idUsed,
    } satisfies ApiResult<ScanResult>);
  } catch (err) {
    await refund();
    return fail(err instanceof Error ? err.message : "scan_failed");
  }
}
