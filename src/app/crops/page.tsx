"use client";

import { useEffect, useMemo, useState } from "react";
import { Wheat, CalendarDays, TrendingUp } from "lucide-react";
import { useLang } from "@/i18n/language-provider";
import { useLocation } from "@/lib/location-provider";
import { fetchSoil, fetchMarket } from "@/lib/api";
import type { ApiResult, MarketRow, SoilData } from "@/lib/types";
import { currentSeason } from "@/lib/season";
import { recommendCrops, type Crop } from "@/data/crops";
import { PageHeading, SourceBadge } from "@/components/bits";
import { LocationBar } from "@/components/location-bar";
import { CropCard } from "@/components/crop-card";
import { Badge, Card, CardHeader, Skeleton } from "@/components/ui";

export default function CropsPage() {
  const { t, lang } = useLang();
  const { coords, place } = useLocation();

  const [soil, setSoil] = useState<ApiResult<SoilData> | null>(null);
  const [market, setMarket] = useState<ApiResult<MarketRow[]> | null>(null);
  const [loading, setLoading] = useState(false);

  const season = currentSeason();

  useEffect(() => {
    if (!coords) return;
    let active = true;
    setLoading(true);
    Promise.all([
      fetchSoil(coords, place?.state),
      fetchMarket(place?.state),
    ]).then(([s, m]) => {
      if (!active) return;
      setSoil(s);
      setMarket(m);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [coords, place?.state]);

  const textureKey = soil?.data?.textureKey ?? "loam";
  const { recommended, others } = useMemo(
    () => recommendCrops(season, textureKey),
    [season, textureKey],
  );

  // Map commodity -> modal price from live mandi rows.
  const priceFor = useMemo(() => {
    const rows = market?.data ?? [];
    return (crop: Crop): number | null => {
      const target = crop.commodity.toLowerCase();
      const cropName = crop.name.en.toLowerCase().split("(")[0].trim();
      const match = rows.find((r) => {
        const c = r.commodity.toLowerCase();
        return (
          c === target ||
          c.includes(cropName) ||
          target.includes(c) ||
          c.includes(target.split("(")[0].trim())
        );
      });
      return match && match.modalPrice > 0 ? match.modalPrice : null;
    };
  }, [market]);

  return (
    <div className="space-y-4">
      <PageHeading
        title={t("crops.title")}
        subtitle={t("crops.subtitle")}
        icon={<Wheat className="size-6" />}
      />

      <LocationBar />

      <div className="flex items-center gap-2 rounded-[var(--radius-lg)] bg-primary/8 px-4 py-3">
        <CalendarDays className="size-5 text-primary" />
        <div>
          <p className="text-xs text-muted-foreground">
            {t("crops.currentSeason")}
          </p>
          <p className="font-semibold text-primary">
            {t(`crops.seasonNames.${season}`)}
          </p>
        </div>
      </div>

      {!coords ? null : loading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-[var(--radius-lg)]" />
          <Skeleton className="h-28 w-full rounded-[var(--radius-lg)]" />
        </div>
      ) : (
        <>
          {recommended.length > 0 ? (
            <section>
              <h2 className="mb-2 flex items-center gap-2 font-semibold">
                {t("crops.recommended")}
                <Badge tone="success">{recommended.length}</Badge>
              </h2>
              <div className="space-y-3">
                {recommended.map((c) => (
                  <CropCard key={c.id} crop={c} price={priceFor(c)} />
                ))}
              </div>
            </section>
          ) : null}

          {others.length > 0 ? (
            <section>
              <h2 className="mb-2 font-semibold text-muted-foreground">
                {t("crops.otherCrops")}
              </h2>
              <div className="space-y-3">
                {others.map((c) => (
                  <CropCard key={c.id} crop={c} price={priceFor(c)} />
                ))}
              </div>
            </section>
          ) : null}

          <MandiTable result={market} />
        </>
      )}
    </div>
  );
}

function MandiTable({ result }: { result: ApiResult<MarketRow[]> | null }) {
  const { t } = useLang();
  const rows = (result?.data ?? []).filter((r) => r.modalPrice > 0).slice(0, 12);

  return (
    <Card>
      <CardHeader
        title={t("crops.mandi")}
        subtitle={t("crops.mandiSubtitle")}
        icon={<TrendingUp className="size-5" />}
        action={
          result ? (
            <SourceBadge
              ok={result.ok && rows.length > 0}
              fallbackUsed={false}
              source={result.source}
            />
          ) : null
        }
      />
      <div className="p-4 pt-3">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("crops.noPrices")}</p>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="pb-2 font-medium">{t("crops.commodity")}</th>
                  <th className="pb-2 font-medium">{t("crops.market")}</th>
                  <th className="pb-2 text-right font-medium">
                    {t("crops.modal")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="py-2 pr-2 font-medium">{r.commodity}</td>
                    <td className="py-2 pr-2 text-muted-foreground">
                      {r.market}
                    </td>
                    <td className="py-2 text-right font-semibold whitespace-nowrap">
                      ₹{r.modalPrice.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-[11px] text-muted-foreground">
          {t("crops.priceNote")} {t("crops.perQuintal")}.
        </p>
      </div>
    </Card>
  );
}
