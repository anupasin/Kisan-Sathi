import type { Lang } from "@/i18n/dictionaries";
import type {
  ApiResult,
  Coords,
  MarketRow,
  ScanResult,
  SoilData,
  WeatherData,
} from "./types";

async function getJson<T>(url: string): Promise<ApiResult<T>> {
  try {
    const r = await fetch(url);
    return (await r.json()) as ApiResult<T>;
  } catch (err) {
    return {
      ok: false,
      data: null,
      source: "none",
      fallbackUsed: false,
      error: err instanceof Error ? err.message : "network error",
    };
  }
}

export function fetchSoil(coords: Coords, state?: string) {
  const q = new URLSearchParams({
    lat: String(coords.lat),
    lon: String(coords.lon),
  });
  if (state) q.set("state", state);
  return getJson<SoilData>(`/api/soil?${q.toString()}`);
}

export function fetchWeather(coords: Coords) {
  return getJson<WeatherData>(
    `/api/weather?lat=${coords.lat}&lon=${coords.lon}`,
  );
}

export function fetchMarket(state?: string, commodity?: string) {
  const q = new URLSearchParams();
  if (state) q.set("state", state);
  if (commodity) q.set("commodity", commodity);
  return getJson<MarketRow[]>(`/api/market?${q.toString()}`);
}

export async function scanPlant(input: {
  image: string;
  mediaType: string;
  lang: Lang;
  /** Optional 96px JPEG data-URL, stored server-side for premium history. */
  thumb?: string;
}): Promise<ApiResult<ScanResult>> {
  try {
    const r = await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return (await r.json()) as ApiResult<ScanResult>;
  } catch (err) {
    return {
      ok: false,
      data: null,
      source: "none",
      fallbackUsed: false,
      error: err instanceof Error ? err.message : "network error",
    };
  }
}
