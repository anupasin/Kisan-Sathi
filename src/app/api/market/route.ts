import { NextResponse } from "next/server";
import type { ApiResult, MarketRow } from "@/lib/types";
import { fetchMandiRows } from "@/lib/market-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get("state") ?? "";
  const commodity = searchParams.get("commodity") ?? "";

  try {
    const rows = await fetchMandiRows(state, commodity);
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
