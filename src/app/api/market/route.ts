import { NextResponse } from "next/server";
import type { ApiResult, MarketRow } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// data.gov.in "Current daily price of various commodities from various markets".
const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";
// data.gov.in's public sample key works out of the box (heavily rate-limited).
// Set DATA_GOV_IN_API_KEY in .env.local for reliable access.
const SAMPLE_KEY = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b";

// This resource's field names are lowercase; filters are case-sensitive.
type Record_ = Record<string, string | undefined>;

// Some states are stored under a different spelling than Nominatim returns.
const STATE_ALIASES: Record<string, string> = {
  kerala: "Keralam",
  "jammu and kashmir": "Jammu and Kashmir",
  "andaman and nicobar islands": "Andaman and Nicobar",
  pondicherry: "Puducherry",
};

function apiState(state: string): string {
  return STATE_ALIASES[state.toLowerCase()] ?? state;
}

function num(v: string | undefined): number {
  const n = Number(String(v ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function toRow(rec: Record_): MarketRow {
  return {
    commodity: rec.commodity ?? "",
    market: rec.market ?? "",
    state: rec.state ?? "",
    district: rec.district ?? "",
    modalPrice: num(rec.modal_price),
    minPrice: num(rec.min_price),
    maxPrice: num(rec.max_price),
    date: rec.arrival_date ?? "",
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get("state") ?? "";
  const commodity = searchParams.get("commodity") ?? "";
  const apiKey = process.env.DATA_GOV_IN_API_KEY || SAMPLE_KEY;

  const build = (opts: { filtered: boolean; limit: number }) => {
    const url = new URL(`https://api.data.gov.in/resource/${RESOURCE_ID}`);
    url.searchParams.set("api-key", apiKey);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", String(opts.limit));
    if (opts.filtered && state)
      url.searchParams.set("filters[state]", apiState(state));
    if (opts.filtered && commodity)
      url.searchParams.set("filters[commodity]", commodity);
    return url;
  };

  const load = async (opts: { filtered: boolean; limit: number }) => {
    const r = await fetch(build(opts), { next: { revalidate: 3600 } });
    if (!r.ok) throw new Error(`data.gov.in ${r.status}`);
    const j = (await r.json()) as { records?: Record_[] };
    return j.records ?? [];
  };

  try {
    // Primary: server-side state/commodity filter (efficient).
    let records = await load({ filtered: true, limit: 100 });

    // Fallback: if the filter matched nothing (e.g. a state-name mismatch),
    // pull a wider unfiltered set and match the state name client-side.
    if (state && records.length === 0) {
      const wide = await load({ filtered: false, limit: 500 });
      const key = state.toLowerCase();
      const alias = apiState(state).toLowerCase();
      records = wide.filter((rec) => {
        const s = (rec.state ?? "").toLowerCase();
        return s.includes(key) || s.includes(alias) || key.includes(s);
      });
    }

    const rows = records.map(toRow);

    return NextResponse.json({
      ok: true,
      data: rows,
      source: "data.gov.in Agmarknet",
      fallbackUsed: false,
    } satisfies ApiResult<MarketRow[]>);
  } catch (err) {
    return NextResponse.json({
      ok: false,
      data: null,
      source: "none",
      fallbackUsed: false,
      error: err instanceof Error ? err.message : "market fetch failed",
    } satisfies ApiResult<MarketRow[]>);
  }
}
