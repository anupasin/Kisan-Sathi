"use client";

import { useEffect, useState } from "react";
import { Sprout, Wheat, Landmark, ScanLine } from "lucide-react";
import Link from "next/link";
import { useLang } from "@/i18n/language-provider";
import { useLocation } from "@/lib/location-provider";
import { fetchSoil, fetchWeather } from "@/lib/api";
import type { ApiResult, SoilData, WeatherData } from "@/lib/types";
import { PageHeading } from "@/components/bits";
import { LocationBar } from "@/components/location-bar";
import { SoilCard } from "@/components/soil-card";
import { WeatherCard } from "@/components/weather-card";

export default function HomePage() {
  const { t } = useLang();
  const { coords, place } = useLocation();

  const [soil, setSoil] = useState<ApiResult<SoilData> | null>(null);
  const [weather, setWeather] = useState<ApiResult<WeatherData> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!coords) return;
    let active = true;
    setLoading(true);
    Promise.all([
      fetchSoil(coords, place?.state),
      fetchWeather(coords),
    ]).then(([s, w]) => {
      if (!active) return;
      setSoil(s);
      setWeather(w);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [coords, place?.state]);

  return (
    <div className="space-y-4">
      <PageHeading
        title={t("home.title")}
        subtitle={t("home.subtitle")}
        icon={<Sprout className="size-6" />}
      />

      <LocationBar />

      {coords ? (
        <>
          <SoilCard result={soil} loading={loading} />
          <WeatherCard result={weather} loading={loading} />
        </>
      ) : (
        <WelcomeCard />
      )}
    </div>
  );
}

function WelcomeCard() {
  const { t } = useLang();
  const items = [
    { icon: Sprout, key: "nav.home", href: "/" },
    { icon: Wheat, key: "nav.crops", href: "/crops" },
    { icon: Landmark, key: "nav.support", href: "/support" },
    { icon: ScanLine, key: "nav.scan", href: "/scan" },
  ] as const;
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-border p-5 text-center">
      <p className="text-sm text-muted-foreground">
        {t("location.permissionBody")}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {items.map(({ icon: Icon, key, href }) => (
          <Link
            key={key}
            href={href}
            className="flex items-center gap-2 rounded-[var(--radius-md)] border border-border bg-card px-3 py-2.5 text-sm font-medium"
          >
            <Icon className="size-4 text-primary" />
            {t(key)}
          </Link>
        ))}
      </div>
    </div>
  );
}
