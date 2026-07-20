import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { ApiResult, ScanResult } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

const BodySchema = z.object({
  image: z.string().min(10), // base64, no data: prefix
  mediaType: z
    .enum(["image/jpeg", "image/png", "image/webp"])
    .default("image/jpeg"),
  lang: z.enum(["en", "hi"]).default("en"),
});

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

  const languageName = parsed.lang === "hi" ? "Hindi (Devanagari script)" : "English";

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system:
        `You are an expert agronomist helping Indian small farmers. Analyse the plant photo. ` +
        `Identify the crop, its growth stage, and whether it is healthy. If unhealthy, name the ` +
        `disease/pest/deficiency and give practical, affordable treatment and prevention suited to ` +
        `Indian farming. Write ALL text field values in ${languageName}, in simple words a farmer ` +
        `understands. Be honest about uncertainty. Always call the report_plant tool.`,
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
    if (!toolUse) return fail("no_result");

    const result = ResultSchema.parse(toolUse.input) as ScanResult;
    return NextResponse.json({
      ok: true,
      data: result,
      source: MODEL,
      fallbackUsed: false,
    } satisfies ApiResult<ScanResult>);
  } catch (err) {
    return fail(err instanceof Error ? err.message : "scan_failed");
  }
}
