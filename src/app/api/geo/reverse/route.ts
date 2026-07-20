import { NextResponse } from "next/server";
import type { ApiResult, Place } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function res(data: ApiResult<Place>, status = 200) {
  return NextResponse.json(data, { status });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return res(
      { ok: false, data: null, source: "none", fallbackUsed: false, error: "lat/lon required" },
      400,
    );
  }

  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", lat);
    url.searchParams.set("lon", lon);
    url.searchParams.set("zoom", "10");
    url.searchParams.set("addressdetails", "1");

    const r = await fetch(url, {
      headers: {
        // Nominatim usage policy requires an identifying User-Agent.
        "User-Agent": "KisanSathi/1.0 (farmer assistance app)",
        "Accept-Language": "en",
      },
      // Cache identical lookups at the edge for a day.
      next: { revalidate: 86400 },
    });

    if (!r.ok) throw new Error(`Nominatim ${r.status}`);
    const j = (await r.json()) as {
      display_name?: string;
      address?: Record<string, string>;
    };
    const a = j.address ?? {};

    const place: Place = {
      state: a.state ?? a.region ?? "",
      district:
        a.state_district ??
        a.district ??
        a.county ??
        a.city ??
        a.town ??
        a.village ??
        "",
      village: a.village ?? a.hamlet ?? a.suburb ?? a.town ?? undefined,
      displayName: j.display_name ?? "",
    };

    return res({ ok: true, data: place, source: "OpenStreetMap Nominatim", fallbackUsed: false });
  } catch (err) {
    return res({
      ok: false,
      data: null,
      source: "none",
      fallbackUsed: false,
      error: err instanceof Error ? err.message : "reverse geocode failed",
    });
  }
}
