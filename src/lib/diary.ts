import { getSupabaseBrowser } from "./supabase/client";
import type { Season } from "./types";

export type DiaryCrop = {
  id: string;
  crop_id: string;
  season: Season;
  year: number;
  area_acres: number | null;
  is_closed: boolean;
  created_at: string;
};

export type DiaryEntry = {
  id: string;
  crop_id: string;
  kind: "activity" | "expense" | "income";
  amount_inr: number | null;
  note: string | null;
  entry_date: string;
};

type Result<T> = { ok: boolean; data: T | null; error?: string };

function wrap<T>(data: T | null, error: { message: string } | null): Result<T> {
  return error ? { ok: false, data: null, error: error.message } : { ok: true, data };
}

export async function listCrops(): Promise<Result<DiaryCrop[]>> {
  const { data, error } = await getSupabaseBrowser()
    .from("diary_crops")
    .select("*")
    .order("created_at", { ascending: false });
  return wrap(data as DiaryCrop[] | null, error);
}

export async function addCrop(input: {
  crop_id: string;
  season: Season;
  year: number;
  area_acres: number | null;
  user_id: string;
}): Promise<Result<DiaryCrop>> {
  const { data, error } = await getSupabaseBrowser()
    .from("diary_crops")
    .insert(input)
    .select()
    .single();
  return wrap(data as DiaryCrop | null, error);
}

export async function deleteCrop(id: string): Promise<Result<null>> {
  const { error } = await getSupabaseBrowser()
    .from("diary_crops")
    .delete()
    .eq("id", id);
  return wrap(null, error);
}

export async function listEntries(
  cropId: string,
): Promise<Result<DiaryEntry[]>> {
  const { data, error } = await getSupabaseBrowser()
    .from("diary_entries")
    .select("*")
    .eq("crop_id", cropId)
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false });
  return wrap(data as DiaryEntry[] | null, error);
}

/** Entries across all crops — used by the premium reports page. */
export async function listAllEntries(): Promise<Result<DiaryEntry[]>> {
  const { data, error } = await getSupabaseBrowser()
    .from("diary_entries")
    .select("*");
  return wrap(data as DiaryEntry[] | null, error);
}

export async function addEntry(input: {
  crop_id: string;
  kind: DiaryEntry["kind"];
  amount_inr: number | null;
  note: string | null;
  entry_date: string;
  user_id: string;
}): Promise<Result<DiaryEntry>> {
  const { data, error } = await getSupabaseBrowser()
    .from("diary_entries")
    .insert(input)
    .select()
    .single();
  return wrap(data as DiaryEntry | null, error);
}

export async function deleteEntry(id: string): Promise<Result<null>> {
  const { error } = await getSupabaseBrowser()
    .from("diary_entries")
    .delete()
    .eq("id", id);
  return wrap(null, error);
}

/** Totals for a set of entries (₹). */
export function totals(entries: DiaryEntry[]): {
  expense: number;
  income: number;
  profit: number;
} {
  let expense = 0;
  let income = 0;
  for (const e of entries) {
    if (e.kind === "expense") expense += Number(e.amount_inr ?? 0);
    if (e.kind === "income") income += Number(e.amount_inr ?? 0);
  }
  return { expense, income, profit: income - expense };
}
