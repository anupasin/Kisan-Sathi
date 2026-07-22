import "server-only";

/**
 * Stage 1 of the scan pipeline: a dedicated crop-ID API (Kindwise crop.health)
 * does the fine-grained visual classification — species/cultivar and disease —
 * that general-purpose vision models are weaker at. Its label + confidence is
 * then handed to Claude (stage 2) as a strong prior for the farmer-facing advice.
 *
 * Docs: https://crop.kindwise.com/docs — POST /api/v1/identification with an
 * `Api-Key` header; returns result.crop.suggestions and result.disease.suggestions,
 * each `{ name, probability }`. Parsing is defensive so shape drift degrades to a
 * graceful failure (→ Claude identifies from the photo alone) rather than a crash.
 */

const ENDPOINT = "https://crop.kindwise.com/api/v1/identification";
const TIMEOUT_MS = 15_000;

export type CropIdData = {
  /** Whether the image is a plant at all (top is_plant probability ≥ 0.5). */
  isPlant: boolean;
  /** Most likely crop/species common name, or null. */
  crop: string | null;
  /** Most likely disease/pest name, or null when healthy / none found. */
  disease: string | null;
  /** True/false when the API reports health; null when it doesn't. */
  isHealthy: boolean | null;
  /** 0..1 confidence of the reported condition (disease prob, else crop prob). */
  confidence: number;
};

export type CropIdOutcome =
  | { ok: true; data: CropIdData }
  | {
      ok: false;
      /** Why stage 1 could not produce a usable label. */
      reason: "not_configured" | "timeout" | "rate_limited" | "error";
    };

type Suggestion = { name?: unknown; probability?: unknown };

function topSuggestion(node: unknown): { name: string; probability: number } | null {
  const suggestions = (node as { suggestions?: unknown })?.suggestions;
  if (!Array.isArray(suggestions) || suggestions.length === 0) return null;
  const first = suggestions[0] as Suggestion;
  const name = typeof first.name === "string" ? first.name.trim() : "";
  const probability =
    typeof first.probability === "number" ? first.probability : 0;
  if (!name) return null;
  return { name, probability };
}

export function cropHealthConfigured(): boolean {
  return Boolean(process.env.CROP_HEALTH_API_KEY);
}

/**
 * Send a photo to crop.health. Never throws — all failures resolve to a typed
 * `{ ok: false }` so the caller can fall back to Claude-only identification.
 */
export async function identifyCrop(params: {
  /** Base64 image data with no `data:` prefix. */
  image: string;
  mediaType: string;
  lang: string;
}): Promise<CropIdOutcome> {
  const apiKey = process.env.CROP_HEALTH_API_KEY;
  if (!apiKey) return { ok: false, reason: "not_configured" };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const url = `${ENDPOINT}?details=common_names&language=${encodeURIComponent(
      params.lang,
    )}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": apiKey,
      },
      body: JSON.stringify({
        // crop.health accepts a plain base64 string or a data URL.
        images: [`data:${params.mediaType};base64,${params.image}`],
        similar_images: false,
      }),
      signal: controller.signal,
    });

    if (res.status === 429) return { ok: false, reason: "rate_limited" };
    if (!res.ok) return { ok: false, reason: "error" };

    const json = (await res.json()) as {
      result?: {
        is_plant?: { probability?: number; binary?: boolean };
        is_healthy?: { probability?: number; binary?: boolean };
        crop?: unknown;
        disease?: unknown;
      };
    };
    const result = json.result ?? {};

    const isPlant =
      result.is_plant?.binary ??
      (typeof result.is_plant?.probability === "number"
        ? result.is_plant.probability >= 0.5
        : true);

    const cropTop = topSuggestion(result.crop);
    const diseaseTop = topSuggestion(result.disease);
    const isHealthy = result.is_healthy?.binary ?? null;

    return {
      ok: true,
      data: {
        isPlant,
        crop: cropTop?.name ?? null,
        disease: diseaseTop?.name ?? null,
        isHealthy,
        confidence: diseaseTop?.probability ?? cropTop?.probability ?? 0,
      },
    };
  } catch (err) {
    // AbortError → timeout; anything else → generic error.
    const timedOut =
      err instanceof Error && err.name === "AbortError";
    return { ok: false, reason: timedOut ? "timeout" : "error" };
  } finally {
    clearTimeout(timer);
  }
}
