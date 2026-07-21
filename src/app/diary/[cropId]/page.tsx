"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { NotebookPen, Plus, Trash2 } from "lucide-react";
import { useLang } from "@/i18n/language-provider";
import { useAuth } from "@/components/auth-provider";
import { CROPS } from "@/data/crops";
import {
  addEntry,
  deleteEntry,
  listCrops,
  listEntries,
  totals,
  type DiaryCrop,
  type DiaryEntry,
} from "@/lib/diary";
import { PageHeading } from "@/components/bits";
import { Card, Stat, Spinner, Badge } from "@/components/ui";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export default function DiaryCropPage() {
  const { t, lang } = useLang();
  const { user, loading: authLoading } = useAuth();
  const params = useParams<{ cropId: string }>();
  const cropId = params.cropId;
  const [crop, setCrop] = useState<DiaryCrop | null>(null);
  const [entries, setEntries] = useState<DiaryEntry[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    kind: "expense" as DiaryEntry["kind"],
    amount: "",
    note: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const refresh = useCallback(async () => {
    const [cropsRes, entriesRes] = await Promise.all([
      listCrops(),
      listEntries(cropId),
    ]);
    if (cropsRes.ok)
      setCrop(cropsRes.data?.find((c) => c.id === cropId) ?? null);
    if (entriesRes.ok) setEntries(entriesRes.data ?? []);
  }, [cropId]);

  useEffect(() => {
    if (user) void refresh();
  }, [user, refresh]);

  if (authLoading || !user) return null;

  const cropInfo = crop ? CROPS.find((c) => c.id === crop.crop_id) : null;
  const sums = totals(entries ?? []);

  const submit = async () => {
    const amount = Number(form.amount);
    const res = await addEntry({
      crop_id: cropId,
      kind: form.kind,
      amount_inr:
        form.kind === "activity" ? null : amount > 0 ? amount : null,
      note: form.note.trim() || null,
      entry_date: form.date,
      user_id: user.id,
    });
    if (res.ok) {
      setAdding(false);
      setForm({ ...form, amount: "", note: "" });
      void refresh();
    }
  };

  return (
    <div className="space-y-4">
      <PageHeading
        title={
          cropInfo && crop
            ? `${cropInfo.emoji} ${cropInfo.name[lang]} · ${crop.year}`
            : t("diary.title")
        }
        subtitle={crop ? t(`crops.seasonNames.${crop.season}`) : undefined}
        icon={<NotebookPen className="size-6" />}
      />

      <div className="grid grid-cols-3 gap-2">
        <Stat label={t("diary.totalExpense")} value={inr(sums.expense)} />
        <Stat label={t("diary.totalIncome")} value={inr(sums.income)} />
        <Stat
          label={t("diary.profit")}
          value={inr(sums.profit)}
        />
      </div>

      <button
        type="button"
        onClick={() => setAdding((a) => !a)}
        className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
      >
        <Plus className="size-4" />
        {t("diary.addEntry")}
      </button>

      {adding ? (
        <Card className="space-y-3 p-4">
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">
                {t("diary.kind")}
              </span>
              <select
                value={form.kind}
                onChange={(e) =>
                  setForm({
                    ...form,
                    kind: e.target.value as DiaryEntry["kind"],
                  })
                }
                className="w-full rounded-[var(--radius-md)] border border-border bg-card px-3 py-2.5 text-sm"
              >
                <option value="expense">{t("diary.expense")}</option>
                <option value="income">{t("diary.income")}</option>
                <option value="activity">{t("diary.activity")}</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">
                {t("diary.date")}
              </span>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full rounded-[var(--radius-md)] border border-border bg-card px-3 py-2.5 text-sm"
              />
            </label>
          </div>
          {form.kind !== "activity" ? (
            <label className="block">
              <span className="mb-1 block text-sm font-medium">
                {t("diary.amount")}
              </span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full rounded-[var(--radius-md)] border border-border bg-card px-3 py-2.5 text-sm"
              />
            </label>
          ) : null}
          <label className="block">
            <span className="mb-1 block text-sm font-medium">
              {t("diary.note")}
            </span>
            <input
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="w-full rounded-[var(--radius-md)] border border-border bg-card px-3 py-2.5 text-sm"
            />
          </label>
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

      {entries == null ? (
        <div className="grid place-items-center py-10">
          <Spinner />
        </div>
      ) : entries.length === 0 ? (
        <p className="rounded-[var(--radius-lg)] border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
          {t("diary.noEntries")}
        </p>
      ) : (
        <div className="space-y-2">
          {entries.map((e) => (
            <div
              key={e.id}
              className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-card p-3.5 shadow-sm"
            >
              <Badge
                tone={
                  e.kind === "income"
                    ? "success"
                    : e.kind === "expense"
                      ? "warning"
                      : "muted"
                }
              >
                {t(`diary.${e.kind}`)}
              </Badge>
              <div className="min-w-0 flex-1">
                {e.note ? (
                  <p className="truncate text-sm">{e.note}</p>
                ) : null}
                <p className="text-xs text-muted-foreground">{e.entry_date}</p>
              </div>
              {e.amount_inr != null ? (
                <p
                  className={`shrink-0 text-sm font-semibold ${
                    e.kind === "income" ? "text-success" : ""
                  }`}
                >
                  {e.kind === "expense" ? "−" : "+"}
                  {inr(Number(e.amount_inr))}
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  void deleteEntry(e.id).then(refresh);
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
