import { NextResponse } from "next/server";
import type { ApiResult, SoilData } from "@/lib/types";
import { buildSoilData } from "@/lib/soil";
import { soilProfileForState } from "@/data/soil-regions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SOILGRIDS = "https://rest.isric.org/soilgrids/v2.0/properties/query";

type SoilGridsResponse = {
  properties?: {
    layers?: {
      name: string;
      depths?: { label: string; values?: { mean?: number | null } }[];
    }[];
  };
};

/** Read the 0–5cm mean for a SoilGrids property. */
function readLayer(json: SoilGridsResponse, name: string): number | null {
  const layer = json.properties?.layers?.find((l) => l.name === name);
  const top = layer?.depths?.find((d) => d.label === "0-5cm") ?? layer?.depths?.[0];
  const v = top?.values?.mean;
  return typeof v === "number" ? v : null;
}

async function trySoilGrids(lat: string, lon: string): Promise<SoilData | null> {
  const url = new URL(SOILGRIDS);
  url.searchParams.set("lat", lat);
  url.searchParams.set("lon", lon);
  for (const p of ["clay", "sand", "silt", "phh2o", "soc"])
    url.searchParams.append("property", p);
  url.searchParams.set("depth", "0-5cm");
  url.searchParams.set("value", "mean");

  const controller = new AbortController();
  // Keep this short: SoilGrids' REST API is paused (2026), so most calls will
  // time out and we want the regional fallback to appear quickly.
  const timer = setTimeout(() => controller.abort(), 3500);
  try {
    const r = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      next: { revalidate: 604800 },
    });
    if (!r.ok) return null;
    const j = (await r.json()) as SoilGridsResponse;

    // SoilGrids returns g/kg for texture (÷10 → %), pH×10, SOC in dg/kg (÷10 → g/kg).
    const clay = readLayer(j, "clay");
    const sand = readLayer(j, "sand");
    const silt = readLayer(j, "silt");
    const ph = readLayer(j, "phh2o");
    const soc = readLayer(j, "soc");
    if (clay == null && sand == null && silt == null) return null;

    return buildSoilData({
      sand: sand != null ? sand / 10 : null,
      silt: silt != null ? silt / 10 : null,
      clay: clay != null ? clay / 10 : null,
      ph: ph != null ? Number((ph / 10).toFixed(1)) : null,
      organicCarbon: soc != null ? Number((soc / 10).toFixed(1)) : null,
    });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const state = searchParams.get("state");

  if (!lat || !lon) {
    return NextResponse.json(
      { ok: false, data: null, source: "none", fallbackUsed: false, error: "lat/lon required" },
      { status: 400 },
    );
  }

  const live = await trySoilGrids(lat, lon);
  if (live) {
    return NextResponse.json({
      ok: true,
      data: live,
      source: "ISRIC SoilGrids",
      fallbackUsed: false,
    } satisfies ApiResult<SoilData>);
  }

  // Fallback: representative profile for the detected state.
  const { profile, matched } = soilProfileForState(state);
  const data = buildSoilData({
    sand: profile.sand,
    silt: profile.silt,
    clay: profile.clay,
    ph: profile.ph,
    organicCarbon: profile.oc,
  });

  return NextResponse.json({
    ok: true,
    data,
    source: matched
      ? "Regional soil estimate"
      : "National soil estimate",
    fallbackUsed: true,
  } satisfies ApiResult<SoilData>);
}
