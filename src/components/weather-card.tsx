"use client";

import { CloudSun, Thermometer, Droplets, CloudRain, Wind, Lightbulb } from "lucide-react";
import { useLang } from "@/i18n/language-provider";
import type { ApiResult, WeatherData } from "@/lib/types";
import { Card, CardHeader, Skeleton, Stat } from "./ui";
import { SourceBadge } from "./bits";

export function WeatherCard({
  result,
  loading,
}: {
  result: ApiResult<WeatherData> | null;
  loading: boolean;
}) {
  const { t, lang } = useLang();

  if (loading || !result) {
    return (
      <Card className="animate-in">
        <CardHeader title={t("home.weather")} icon={<CloudSun className="size-5" />} />
        <div className="p-4">
          <Skeleton className="h-20 w-full" />
        </div>
      </Card>
    );
  }

  const w = result.data;
  if (!w) return null;

  return (
    <Card className="animate-in">
      <CardHeader
        title={t("home.weather")}
        icon={<CloudSun className="size-5" />}
        action={
          <SourceBadge ok={result.ok} fallbackUsed={result.fallbackUsed} source={result.source} />
        }
      />
      <div className="p-4 pt-3">
        <div className="grid grid-cols-2 gap-2">
          <Stat
            label={
              <span className="inline-flex items-center gap-1">
                <Thermometer className="size-3.5" /> {t("home.temperature")}
              </span>
            }
            value={`${w.temperature}°`}
            unit="C"
          />
          <Stat
            label={
              <span className="inline-flex items-center gap-1">
                <Droplets className="size-3.5" /> {t("home.humidity")}
              </span>
            }
            value={`${w.humidity}%`}
          />
          <Stat
            label={
              <span className="inline-flex items-center gap-1">
                <CloudRain className="size-3.5" /> {t("home.rainfall")}
              </span>
            }
            value={w.rainfall}
            unit="mm"
          />
          <Stat
            label={
              <span className="inline-flex items-center gap-1">
                <Wind className="size-3.5" /> {t("home.wind")}
              </span>
            }
            value={w.windspeed}
            unit="km/h"
          />
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-[var(--radius-md)] bg-accent/10 p-3 text-sm text-accent">
          <Lightbulb className="mt-0.5 size-4 shrink-0" />
          <span className="text-foreground/90">{w.advice[lang]}</span>
        </div>
      </div>
    </Card>
  );
}
