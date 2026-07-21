"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BarChart3, Crown } from "lucide-react";
import { useLang } from "@/i18n/language-provider";
import { useAuth } from "@/components/auth-provider";
import { CROPS } from "@/data/crops";
import {
  listAllEntries,
  listCrops,
  totals,
  type DiaryCrop,
  type DiaryEntry,
} from "@/lib/diary";
import { PageHeading } from "@/components/bits";
import { Card, Spinner } from "@/components/ui";

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

export default function DiaryReportsPage() {
  const { t, lang } = useLang();
  const { user, premium, loading: authLoading } = useAuth();
  const [crops, setCrops] = useState<DiaryCrop[] | null>(null);
  const [entries, setEntries] = useState<DiaryEntry[] | null>(null);

  useEffect(() => {
    if (!user || !premium) return;
    void Promise.all([listCrops(), listAllEntries()]).then(
      ([cropsRes, entriesRes]) => {
        if (cropsRes.ok) setCrops(cropsRes.data ?? []);
        if (entriesRes.ok) setEntries(entriesRes.data ?? []);
      },
    );
  }, [user, premium]);

  const report = useMemo(() => {
    if (!crops || !entries) return null;
    const byCrop = new Map<string, DiaryEntry[]>();
    for (const e of entries) {
      const list = byCrop.get(e.crop_id) ?? [];
      list.push(e);
      byCrop.set(e.crop_id, list);
    }
    return crops.map((c) => {
      const sums = totals(byCrop.get(c.id) ?? []);
      return { crop: c, ...sums };
    });
  }, [crops, entries]);

  const maxAbs = useMemo(
    () =>
      Math.max(1, ...(report ?? []).map((r) => Math.abs(r.profit))),
    [report],
  );

  const cropLabel = (c: DiaryCrop) => {
    const info = CROPS.find((x) => x.id === c.crop_id);
    return `${info?.emoji ?? "🌱"} ${info?.name[lang] ?? c.crop_id} · ${t(
      `crops.seasonNames.${c.season}`,
    )} ${c.year}`;
  };

  return (
    <div className="space-y-4">
      <PageHeading
        title={t("diary.reports")}
        icon={<BarChart3 className="size-6" />}
      />

      {authLoading ? null : !user || premium === false ? (
        <div className="space-y-3 rounded-[var(--radius-lg)] border border-border bg-card p-5 text-sm shadow-sm">
          <p className="font-medium">{t("diary.reportsPremium")}</p>
          <Link
            href={user ? "/premium" : "/login?next=/diary/reports"}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 font-semibold text-primary-foreground"
          >
            <Crown className="size-4" />
            {user ? t("scan.goPremium") : t("auth.signIn")}
          </Link>
        </div>
      ) : report == null ? (
        <div className="grid place-items-center py-10">
          <Spinner />
        </div>
      ) : report.length === 0 ? (
        <p className="rounded-[var(--radius-lg)] border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
          {t("diary.empty")}
        </p>
      ) : (
        <div className="space-y-2">
          {report.map((r) => (
            <Card key={r.crop.id} className="p-4">
              <p className="truncate text-sm font-semibold">
                {cropLabel(r.crop)}
              </p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("diary.totalExpense")}
                  </p>
                  <p className="font-medium">{inr(r.expense)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("diary.totalIncome")}
                  </p>
                  <p className="font-medium text-success">{inr(r.income)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("diary.profit")}
                    {r.crop.area_acres
                      ? ` (${t("diary.perAcre")}: ${inr(r.profit / Number(r.crop.area_acres))})`
                      : ""}
                  </p>
                  <p
                    className={`font-semibold ${r.profit >= 0 ? "text-success" : "text-danger"}`}
                  >
                    {inr(r.profit)}
                  </p>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full ${r.profit >= 0 ? "bg-success" : "bg-danger"}`}
                  style={{
                    width: `${Math.min(100, (Math.abs(r.profit) / maxAbs) * 100)}%`,
                  }}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
