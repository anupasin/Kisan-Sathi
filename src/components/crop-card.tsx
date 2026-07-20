"use client";

import { Sprout, Scissors, Clock, Droplets, IndianRupee } from "lucide-react";
import { useLang } from "@/i18n/language-provider";
import type { Crop } from "@/data/crops";
import { monthRange } from "@/lib/season";
import { Badge } from "./ui";

export function CropCard({
  crop,
  price,
}: {
  crop: Crop;
  price?: number | null;
}) {
  const { t, lang } = useLang();
  const waterLabel = t(`home.lowHigh.${crop.water}`);

  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-card p-3.5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-muted text-xl">
            {crop.emoji}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold">{crop.name[lang]}</p>
            <p className="text-xs text-muted-foreground">
              {crop.durationDays} {t("crops.days")}
            </p>
          </div>
        </div>
        {price ? (
          <Badge tone="primary" className="shrink-0">
            <IndianRupee className="size-3" />
            {price.toLocaleString("en-IN")}
          </Badge>
        ) : null}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <Info
          icon={<Sprout className="size-3.5" />}
          label={t("crops.sowing")}
          value={monthRange(crop.sowing, lang)}
        />
        <Info
          icon={<Scissors className="size-3.5" />}
          label={t("crops.harvest")}
          value={monthRange(crop.harvest, lang)}
        />
        <Info
          icon={<Clock className="size-3.5" />}
          label={t("crops.duration")}
          value={`${crop.durationDays} ${t("crops.days")}`}
        />
        <Info
          icon={<Droplets className="size-3.5" />}
          label={t("crops.water")}
          value={waterLabel}
        />
      </div>
    </div>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[var(--radius-sm)] bg-muted/50 px-2.5 py-2">
      <div className="flex items-center gap-1 text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-0.5 font-medium text-foreground">{value}</div>
    </div>
  );
}
