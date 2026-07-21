"use client";

import { useMemo, useState } from "react";
import { Calculator, Info } from "lucide-react";
import { useLang } from "@/i18n/language-provider";
import { CROPS } from "@/data/crops";
import {
  ACRES_PER_HECTARE,
  BAG_KG,
  FERTILIZER_RECS,
  computeDose,
} from "@/data/fertilizer";
import { PageHeading } from "@/components/bits";
import { Card, CardHeader, Stat } from "@/components/ui";

type Unit = "acre" | "hectare";

const fmt = (n: number) =>
  n >= 100 ? String(Math.round(n)) : (Math.round(n * 10) / 10).toString();

export default function CalculatorPage() {
  const { t, lang } = useLang();
  const [cropId, setCropId] = useState("rice");
  const [area, setArea] = useState("1");
  const [unit, setUnit] = useState<Unit>("acre");

  const crops = useMemo(
    () => CROPS.filter((c) => FERTILIZER_RECS[c.id]),
    [],
  );

  const acres =
    (Number(area) || 0) * (unit === "hectare" ? ACRES_PER_HECTARE : 1);
  const dose = computeDose(cropId, acres);

  return (
    <div className="space-y-4">
      <PageHeading
        title={t("calculator.title")}
        subtitle={t("calculator.subtitle")}
        icon={<Calculator className="size-6" />}
      />

      <Card>
        <div className="space-y-3 p-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">
              {t("calculator.crop")}
            </span>
            <select
              value={cropId}
              onChange={(e) => setCropId(e.target.value)}
              className="w-full rounded-[var(--radius-md)] border border-border bg-card px-3 py-2.5 text-sm"
            >
              {crops.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.name[lang]}
                </option>
              ))}
            </select>
          </label>

          <div className="flex gap-2">
            <label className="flex-1">
              <span className="mb-1 block text-sm font-medium">
                {t("calculator.area")}
              </span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full rounded-[var(--radius-md)] border border-border bg-card px-3 py-2.5 text-sm"
              />
            </label>
            <div className="flex items-end">
              <div className="flex rounded-full border border-border bg-card p-0.5 text-sm font-medium">
                {(
                  [
                    ["acre", t("calculator.acres")],
                    ["hectare", t("calculator.hectares")],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setUnit(value)}
                    aria-pressed={unit === value}
                    className={`rounded-full px-3 py-1.5 transition ${
                      unit === value
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {dose ? (
        <>
          <Card>
            <CardHeader title={t("calculator.needed")} />
            <div className="grid grid-cols-3 gap-2 p-4 pt-1">
              <Stat
                label={t("calculator.nitrogen")}
                value={fmt(dose.need.n)}
                unit={t("calculator.kg")}
              />
              <Stat
                label={t("calculator.phosphorus")}
                value={fmt(dose.need.p)}
                unit={t("calculator.kg")}
              />
              <Stat
                label={t("calculator.potassium")}
                value={fmt(dose.need.k)}
                unit={t("calculator.kg")}
              />
            </div>
          </Card>

          <Card>
            <CardHeader title={t("calculator.bags")} />
            <div className="grid grid-cols-3 gap-2 p-4 pt-1">
              {(
                [
                  [t("calculator.urea"), dose.ureaKg],
                  [t("calculator.dap"), dose.dapKg],
                  [t("calculator.mop"), dose.mopKg],
                ] as const
              ).map(([label, kg]) => (
                <Stat
                  key={label}
                  label={label}
                  value={fmt(kg)}
                  unit={`${t("calculator.kg")} · ${fmt(kg / BAG_KG)} ${t("calculator.bagsUnit")}`}
                />
              ))}
            </div>
            <p className="px-4 pb-3 text-[11px] text-muted-foreground">
              {t("calculator.bagNote")}
            </p>
          </Card>

          <Card>
            <CardHeader title={t("calculator.timing")} />
            <ul className="space-y-2 p-4 pt-1 text-sm text-muted-foreground">
              <li>• {t("calculator.timingBasal")}</li>
              <li>• {t("calculator.timingSplit")}</li>
            </ul>
          </Card>
        </>
      ) : null}

      <p className="flex items-start gap-2 rounded-[var(--radius-md)] bg-muted/50 p-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" />
        {t("calculator.disclaimer")}
      </p>
    </div>
  );
}
