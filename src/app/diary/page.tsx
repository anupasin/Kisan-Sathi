"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { NotebookPen, Plus, Trash2, BarChart3, ChevronRight } from "lucide-react";
import { useLang } from "@/i18n/language-provider";
import { useAuth } from "@/components/auth-provider";
import { CROPS } from "@/data/crops";
import { currentSeason } from "@/lib/season";
import {
  addCrop,
  deleteCrop,
  listCrops,
  type DiaryCrop,
} from "@/lib/diary";
import type { Season } from "@/lib/types";
import { PageHeading } from "@/components/bits";
import { Card, Spinner } from "@/components/ui";

export default function DiaryPage() {
  const { t, lang } = useLang();
  const { user, loading: authLoading } = useAuth();
  const [crops, setCrops] = useState<DiaryCrop[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    crop_id: CROPS[0].id,
    season: currentSeason() as Season,
    year: new Date().getFullYear(),
    area: "",
  });

  const refresh = useCallback(async () => {
    const res = await listCrops();
    if (res.ok) setCrops(res.data ?? []);
  }, []);

  useEffect(() => {
    if (user) void refresh();
  }, [user, refresh]);

  if (authLoading) return null;
  if (!user) return null; // proxy redirects; guard for client nav

  const cropName = (id: string) =>
    CROPS.find((c) => c.id === id)?.name[lang] ?? id;
  const cropEmoji = (id: string) => CROPS.find((c) => c.id === id)?.emoji ?? "🌱";

  const submit = async () => {
    const area = Number(form.area);
    const res = await addCrop({
      crop_id: form.crop_id,
      season: form.season,
      year: form.year,
      area_acres: area > 0 ? area : null,
      user_id: user.id,
    });
    if (res.ok) {
      setAdding(false);
      void refresh();
    }
  };

  return (
    <div className="space-y-4">
      <PageHeading
        title={t("diary.title")}
        subtitle={t("diary.subtitle")}
        icon={<NotebookPen className="size-6" />}
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setAdding((a) => !a)}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="size-4" />
          {t("diary.addCrop")}
        </button>
        <Link
          href="/diary/reports"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold"
        >
          <BarChart3 className="size-4" />
          {t("diary.reports")}
        </Link>
      </div>

      {adding ? (
        <Card className="space-y-3 p-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">
              {t("diary.cropName")}
            </span>
            <select
              value={form.crop_id}
              onChange={(e) => setForm({ ...form, crop_id: e.target.value })}
              className="w-full rounded-[var(--radius-md)] border border-border bg-card px-3 py-2.5 text-sm"
            >
              {CROPS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.name[lang]}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-3 gap-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">
                {t("diary.season")}
              </span>
              <select
                value={form.season}
                onChange={(e) =>
                  setForm({ ...form, season: e.target.value as Season })
                }
                className="w-full rounded-[var(--radius-md)] border border-border bg-card px-3 py-2.5 text-sm"
              >
                {(["kharif", "rabi", "zaid"] as const).map((s) => (
                  <option key={s} value={s}>
                    {t(`crops.seasonNames.${s}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">
                {t("diary.year")}
              </span>
              <input
                type="number"
                value={form.year}
                onChange={(e) =>
                  setForm({ ...form, year: Number(e.target.value) })
                }
                className="w-full rounded-[var(--radius-md)] border border-border bg-card px-3 py-2.5 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">
                {t("diary.area")}
              </span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
                className="w-full rounded-[var(--radius-md)] border border-border bg-card px-3 py-2.5 text-sm"
              />
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void submit()}
              className="flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              {t("diary.save")}
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="flex-1 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold"
            >
              {t("diary.cancel")}
            </button>
          </div>
        </Card>
      ) : null}

      {crops == null ? (
        <div className="grid place-items-center py-10">
          <Spinner />
        </div>
      ) : crops.length === 0 ? (
        <p className="rounded-[var(--radius-lg)] border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
          {t("diary.empty")}
        </p>
      ) : (
        <div className="space-y-2">
          {crops.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-card p-4 shadow-sm"
            >
              <Link
                href={`/diary/${c.id}`}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <span className="text-2xl">{cropEmoji(c.crop_id)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">
                    {cropName(c.crop_id)}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {t(`crops.seasonNames.${c.season}`)} {c.year}
                    {c.area_acres
                      ? ` · ${c.area_acres} ${t("calculator.acres")}`
                      : ""}
                  </span>
                </span>
                <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  void deleteCrop(c.id).then(refresh);
                }}
                aria-label={t("diary.delete")}
                className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
