import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { ApiResult } from "@/lib/types";
import { getUser, isPremium } from "@/lib/dal";
import { currentSeason } from "@/lib/season";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  hi: "Hindi (Devanagari script)",
  te: "Telugu (Telugu script)",
  kn: "Kannada (Kannada script)",
  ta: "Tamil (Tamil script)",
};

const BodySchema = z.object({
  question: z.string().min(1).max(600),
  lang: z.enum(["en", "hi", "te", "kn", "ta"]).default("en"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(2000),
      }),
    )
    .max(6)
    .default([]),
  // Optional device-known context; keeps the route free of extra lookups.
  context: z
    .object({
      place: z.string().max(120).optional(),
      soil: z.string().max(60).optional(),
    })
    .optional(),
});

function fail(error: string, status = 200) {
  return NextResponse.json(
    { ok: false, data: null, source: "none", fallbackUsed: false, error },
    { status },
  );
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return fail("missing_api_key");

  const user = await getUser();
  if (!user) return fail("auth_required", 401);
  if (!(await isPremium(user.id))) return fail("premium_required", 402);

  let parsed;
  try {
    parsed = BodySchema.parse(await request.json());
  } catch {
    return fail("bad_request", 400);
  }

  const season = currentSeason();
  const contextBits = [
    `Current Indian cropping season: ${season}.`,
    parsed.context?.place ? `Farmer's location: ${parsed.context.place}.` : "",
    parsed.context?.soil ? `Farmer's soil type: ${parsed.context.soil}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 800,
      system:
        `You are Kisan Sathi, a friendly expert agronomist assistant for Indian small farmers. ` +
        `${contextBits} Answer the farmer's question with practical, affordable, India-specific advice. ` +
        `Answer in ${LANGUAGE_NAMES[parsed.lang]}, in simple words a farmer understands. ` +
        `Keep answers under 120 words unless the question needs step-by-step detail. ` +
        `If the question is not about farming, gently steer back to farming topics. ` +
        `For serious crop damage or financial decisions, remind them to confirm with their local Krishi Vigyan Kendra.`,
      messages: [
        ...parsed.history.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        { role: "user" as const, content: parsed.question },
      ],
    });

    const text = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    if (!text) return fail("no_result");

    return NextResponse.json({
      ok: true,
      data: { answer: text },
      source: MODEL,
      fallbackUsed: false,
    } satisfies ApiResult<{ answer: string }>);
  } catch (err) {
    return fail(err instanceof Error ? err.message : "ask_failed");
  }
}
