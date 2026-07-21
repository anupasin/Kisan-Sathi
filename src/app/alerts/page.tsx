"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BellRing, Plus, Trash2, Crown, CloudRainWind } from "lucide-react";
import { useLang } from "@/i18n/language-provider";
import { useAuth } from "@/components/auth-provider";
import { useLocation } from "@/lib/location-provider";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { CROPS } from "@/data/crops";
import { PageHeading } from "@/components/bits";
import { PushManager } from "@/components/push-manager";
import { Card, Badge, Spinner } from "@/components/ui";

type PriceAlert = {
  id: string;
  commodity: string;
  state: string;
  direction: "above" | "below";
  target_price: number;
  active: boolean;
};

export default function AlertsPage() {
  const { t, lang } = useLang();
  const { user, premium, loading: authLoading } = useAuth();
  const { place } = useLocation();
  const [alerts, setAlerts] = useState<PriceAlert[] | null>(null);
  const [weatherOn, setWeatherOn] = useState<boolean | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    commodity: CROPS[0].commodity,
    direction: "above" as "above" | "below",
    target: "",
  });

  const refresh = useCallback(async () => {
    const supabase = getSupabaseBrowser();
    const [{ data: rows }, { data: profile }] = await Promise.all([
      supabase
        .from("price_alerts")
        .select("id, commodity, state, direction, target_price, active")
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("weather_alerts").maybeSingle(),
    ]);
    setAlerts((rows ?? []) as PriceAlert[]);
    setWeatherOn(profile?.weather_alerts ?? false);
  }, []);

  useEffect(() => {
    if (user) void refresh();
  }, [user, refresh]);

  if (authLoading || !user) return null;

  const gatedForFree = premium === false;

  const toggleWeather = async () => {
    if (gatedForFree) return;
    const next = !weatherOn;
    setWeatherOn(next);
    await getSupabaseBrowser()
      .from("profiles")
      .update({ weather_alerts: next })
      .eq("id", user.id);
  };

  const submit = async () => {
    const target = Number(form.target);
    if (!(target > 0) || !place?.state) return;
    const { error } = await getSupabaseBrowser().from("price_alerts").insert({
      user_id: user.id,
      commodity: form.commodity,
      state: place.state,
      direction: form.direction,
      target_price: target,
    });
    if (!error) {
      setAdding(false);
      setForm({ ...form, target: "" });
      void refresh();
    }
  };

  const remove = async (id: string) => {
    await getSupabaseBrowser().from("price_alerts").delete().eq("id", id);
    void refresh();
  };

  return (
    <div className="space-y-4">
      <PageHeading
        title={t("alerts.title")}
        subtitle={t("alerts.subtitle")}
        icon={<BellRing className="size-6" />}
      />

      {gatedForFree ? (
        <div className="space-y-3 rounded-[var(--radius-lg)] border border-border bg-card p-5 text-sm shadow-sm">
          <p className="font-medium">{t("alerts.premiumOnly")}</p>
          <Link
            href="/premium"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 font-semibold text-primary-foreground"
          >
            <Crown className="size-4" />
            {t("scan.goPremium")}
          </Link>
        </div>
      ) : (
        <>
          <PushManager />

          <button
            type="button"
            onClick={() => void toggleWeather()}
            className={`flex w-full items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-border p-4 text-sm shadow-sm transition ${
              weatherOn ? "bg-primary/8" : "bg-card"
            }`}
          >
            <span className="flex items-center gap-2 font-medium">
              <CloudRainWind
                className={`size-5 ${weatherOn ? "text-primary" : "text-muted-foreground"}`}
              />
              {t("alerts.weatherToggle")}
            </span>
            <Badge tone={weatherOn ? "success" : "muted"}>
              {weatherOn ? t("alerts.pushOn") : t("alerts.off")}
            </Badge>
          </button>

          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{t("alerts.priceAlerts")}</h2>
            <button
              type="button"
              onClick={() => setAdding((a) => !a)}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground"
            >
              <Plus className="size-4" />
              {t("alerts.addAlert")}
            </button>
          </div>

          {adding ? (
            <Card className="space-y-3 p-4">
              <label className="block">
                <span className="mb-1 block text-sm font-medium">
                  {t("crops.commodity")}
                </span>
                <select
                  value={form.commodity}
                  onChange={(e) =>
                    setForm({ ...form, commodity: e.target.value })
                  }
                  className="w-full rounded-[var(--radius-md)] border border-border bg-card px-3 py-2.5 text-sm"
                >
                  {CROPS.map((c) => (
                    <option key={c.id} value={c.commodity}>
                      {c.emoji} {c.name[lang]}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium">
                    {t("alerts.direction")}
                  </span>
                  <select
                    value={form.direction}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        direction: e.target.value as "above" | "below",
                      })
                    }
                    className="w-full rounded-[var(--radius-md)] border border-border bg-card px-3 py-2.5 text-sm"
                  >
                    <option value="above">{t("alerts.above")}</option>
                    <option value="below">{t("alerts.below")}</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium">
                    {t("alerts.target")}
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={form.target}
                    onChange={(e) =>
                      setForm({ ...form, target: e.target.value })
                    }
                    className="w-full rounded-[var(--radius-md)] border border-border bg-card px-3 py-2.5 text-sm"
                  />
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void submit()}
                  disabled={!place?.state}
                  className="flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
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
              {!place?.state ? (
                <p className="text-xs text-muted-foreground">
                  {t("location.permissionBody")}
                </p>
              ) : null}
            </Card>
          ) : null}

          {alerts == null ? (
            <div className="grid place-items-center py-6">
              <Spinner />
            </div>
          ) : alerts.length === 0 ? (
            <p className="rounded-[var(--radius-lg)] border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
              {t("alerts.empty")}
            </p>
          ) : (
            <div className="space-y-2">
              {alerts.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-card p-3.5 shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {a.commodity}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {a.direction === "above"
                        ? t("alerts.above")
                        : t("alerts.below")}{" "}
                      ₹{Number(a.target_price).toLocaleString("en-IN")} ·{" "}
                      {a.state}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void remove(a.id)}
                    aria-label={t("diary.delete")}
                    className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
