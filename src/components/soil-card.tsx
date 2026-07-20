"use client";

import { Layers, Droplets, Sprout, FlaskConical } from "lucide-react";
import { useLang } from "@/i18n/language-provider";
import type { ApiResult, SoilData } from "@/lib/types";
import { phBand } from "@/lib/soil";
import { Card, CardHeader, Skeleton, Stat, CompositionBar, Badge } from "./ui";
import { SourceBadge, SourceNote } from "./bits";

export function SoilCard({
  result,
  loading,
}: {
  result: ApiResult<SoilData> | null;
  loading: boolean;
}) {
  const { t, lang } = useLang();

  if (loading || !result) {
    return (
      <Card className="animate-in">
        <CardHeader title={t("home.soil")} icon={<Layers className="size-5" />} />
        <div className="space-y-3 p-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </Card>
    );
  }

  const s = result.data;
  if (!s) {
    return (
      <Card>
        <CardHeader title={t("home.soil")} icon={<Layers className="size-5" />} />
        <p className="p-4 text-sm text-muted-foreground">{t("common.na")}</p>
      </Card>
    );
  }

  const fert = t(`home.lowHigh.${s.fertility}`);
  const ph = s.ph;
  const phLabel =
    phBand(ph) === "acidic"
      ? t("home.phAcidic")
      : phBand(ph) === "alkaline"
        ? t("home.phAlkaline")
        : t("home.phNeutral");

  return (
    <Card className="animate-in overflow-hidden">
      <CardHeader
        title={t("home.soil")}
        icon={<Layers className="size-5" />}
        action={
          <SourceBadge
            ok={result.ok}
            fallbackUsed={result.fallbackUsed}
            source={result.source}
          />
        }
      />

      <div className="p-4 pt-3">
        {/* Headline soil type */}
        <div className="rounded-[var(--radius-md)] bg-primary/8 p-3">
          <p className="text-xs text-muted-foreground">{t("home.soilType")}</p>
          <p className="text-lg font-bold text-primary">
            {s.soilGroup[lang]}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("home.texture")}: {s.textureName[lang]}
          </p>
        </div>

        {/* Key stats */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Stat
            label={
              <span className="inline-flex items-center gap-1">
                <FlaskConical className="size-3.5" /> {t("home.ph")}
              </span>
            }
            value={ph != null ? ph.toFixed(1) : "—"}
            unit={ph != null ? phLabel : undefined}
          />
          <Stat
            label={
              <span className="inline-flex items-center gap-1">
                <Sprout className="size-3.5" /> {t("home.fertility")}
              </span>
            }
            value={fert}
          />
        </div>

        {/* Composition */}
        {s.sand != null && s.clay != null ? (
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{t("home.composition")}</span>
            </div>
            <CompositionBar
              segments={[
                { value: s.sand ?? 0, color: "bg-amber-400", label: t("home.sand") },
                { value: s.silt ?? 0, color: "bg-emerald-400", label: t("home.silt") },
                { value: s.clay ?? 0, color: "bg-orange-700", label: t("home.clay") },
              ]}
            />
            <div className="mt-2 flex justify-between text-xs">
              <Legend color="bg-amber-400" label={t("home.sand")} value={s.sand} />
              <Legend color="bg-emerald-400" label={t("home.silt")} value={s.silt} />
              <Legend color="bg-orange-700" label={t("home.clay")} value={s.clay} />
            </div>
          </div>
        ) : null}

        {/* Suitability */}
        <div className="mt-4 rounded-[var(--radius-md)] border border-border bg-muted/40 p-3">
          <div className="mb-1 flex items-center gap-1.5 text-sm font-semibold">
            <Droplets className="size-4 text-primary" />
            {t("home.suitability")}
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {s.suitability[lang]}
          </p>
        </div>

        {s.organicCarbon != null ? (
          <div className="mt-3">
            <Badge tone="muted">
              {t("home.organicCarbon")}: {s.organicCarbon} g/kg
            </Badge>
          </div>
        ) : null}
      </div>
      <SourceNote source={result.source} />
    </Card>
  );
}

function Legend({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number | null;
}) {
  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground">
      <span className={`size-2.5 rounded-full ${color}`} />
      {label} {value != null ? `${Math.round(value)}%` : ""}
    </span>
  );
}
