import { NextResponse } from "next/server";
import webpush from "web-push";
import { getServiceClient } from "@/lib/supabase/server";
import { fetchMandiRows } from "@/lib/market-server";
import { dictionaries, isLang, type Lang } from "@/i18n/dictionaries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

type PushRow = { endpoint: string; p256dh: string; auth: string };

function notifTexts(lang: string) {
  const d = dictionaries[isLang(lang) ? (lang as Lang) : "en"];
  return d.alerts;
}

/**
 * Daily alerts cron (Vercel Cron → GET with Bearer CRON_SECRET).
 *  1. Price alerts: check mandi modal prices against user targets.
 *  2. Weather alerts: severe rain / heat / frost for opted-in users.
 *  3. Housekeeping: flip expired subscriptions, prune dead push endpoints.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (
    !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
    !process.env.VAPID_PRIVATE_KEY ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json({ skipped: "not_configured" });
  }

  webpush.setVapidDetails(
    "mailto:birupia@gmail.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );

  const service = getServiceClient();
  const stats = { price: 0, weather: 0, pruned: 0, expired: 0 };

  const sendToUser = async (
    userId: string,
    payload: { title: string; body: string; url: string },
  ) => {
    const { data: subs } = await service
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", userId);
    for (const sub of (subs ?? []) as PushRow[]) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload),
        );
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await service
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", sub.endpoint);
          stats.pruned++;
        }
      }
    }
  };

  // --- 1. Price alerts (dedupe: max one per alert per ~20h) ---
  const cutoff = new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString();
  const { data: alerts } = await service
    .from("price_alerts")
    .select("id, user_id, commodity, state, direction, target_price")
    .eq("active", true)
    .or(`last_notified_at.is.null,last_notified_at.lt.${cutoff}`);

  const priceCache = new Map<string, number | null>();
  for (const alert of alerts ?? []) {
    const key = `${alert.state}|${alert.commodity}`;
    if (!priceCache.has(key)) {
      try {
        const rows = await fetchMandiRows(alert.state, alert.commodity);
        const prices = rows
          .map((r) => r.modalPrice)
          .filter((p) => p > 0)
          .sort((a, b) => a - b);
        priceCache.set(
          key,
          prices.length > 0 ? prices[Math.floor(prices.length / 2)] : null,
        );
      } catch {
        priceCache.set(key, null);
      }
    }
    const price = priceCache.get(key);
    if (price == null) continue;

    const hit =
      alert.direction === "above"
        ? price >= Number(alert.target_price)
        : price <= Number(alert.target_price);
    if (!hit) continue;

    const { data: profile } = await service
      .from("profiles")
      .select("lang")
      .eq("id", alert.user_id)
      .maybeSingle();
    const texts = notifTexts(profile?.lang ?? "en");
    await sendToUser(alert.user_id, {
      title: texts.notifPriceTitle,
      body: `${alert.commodity}: ₹${price.toLocaleString("en-IN")} (${
        alert.direction === "above" ? "≥" : "≤"
      } ₹${Number(alert.target_price).toLocaleString("en-IN")})`,
      url: "/crops",
    });
    await service
      .from("price_alerts")
      .update({ last_notified_at: new Date().toISOString() })
      .eq("id", alert.id);
    stats.price++;
  }

  // --- 2. Severe weather for opted-in users ---
  const { data: weatherUsers } = await service
    .from("profiles")
    .select("id, lang, location")
    .eq("weather_alerts", true)
    .not("location", "is", null);

  const forecastCache = new Map<
    string,
    { rain: number; tmax: number; tmin: number } | null
  >();
  for (const profile of weatherUsers ?? []) {
    const coords = (
      profile.location as { coords?: { lat?: number; lon?: number } } | null
    )?.coords;
    if (!coords?.lat || !coords?.lon) continue;
    const key = `${coords.lat.toFixed(1)},${coords.lon.toFixed(1)}`;
    if (!forecastCache.has(key)) {
      try {
        const url = new URL("https://api.open-meteo.com/v1/forecast");
        url.searchParams.set("latitude", String(coords.lat));
        url.searchParams.set("longitude", String(coords.lon));
        url.searchParams.set(
          "daily",
          "precipitation_sum,temperature_2m_max,temperature_2m_min",
        );
        url.searchParams.set("timezone", "auto");
        url.searchParams.set("forecast_days", "2");
        const r = await fetch(url);
        const j = (await r.json()) as {
          daily?: {
            precipitation_sum?: number[];
            temperature_2m_max?: number[];
            temperature_2m_min?: number[];
          };
        };
        const idx = 1; // tomorrow
        forecastCache.set(key, {
          rain: j.daily?.precipitation_sum?.[idx] ?? 0,
          tmax: j.daily?.temperature_2m_max?.[idx] ?? 0,
          tmin: j.daily?.temperature_2m_min?.[idx] ?? 99,
        });
      } catch {
        forecastCache.set(key, null);
      }
    }
    const forecast = forecastCache.get(key);
    if (!forecast) continue;

    const texts = notifTexts(profile.lang ?? "en");
    let body: string | null = null;
    if (forecast.rain >= 50) body = texts.notifRain;
    else if (forecast.tmax >= 42) body = texts.notifHeat;
    else if (forecast.tmin <= 2) body = texts.notifFrost;
    if (!body) continue;

    await sendToUser(profile.id, {
      title: texts.notifWeatherTitle,
      body,
      url: "/",
    });
    stats.weather++;
  }

  // --- 3. Housekeeping: expire stale premium subscriptions ---
  const { data: expired } = await service
    .from("subscriptions")
    .update({ status: "expired" })
    .eq("status", "active")
    .lt("expires_at", new Date().toISOString())
    .select("id");
  stats.expired = expired?.length ?? 0;

  return NextResponse.json({ ok: true, stats });
}
