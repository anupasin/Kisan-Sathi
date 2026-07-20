import { NextResponse } from "next/server";
import type { ApiResult, WeatherData } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function advice(
  temp: number,
  rain: number,
  humidity: number,
): { en: string; hi: string } {
  if (rain >= 10)
    return {
      en: "Good rain recently — hold off on irrigation and check fields for waterlogging.",
      hi: "हाल में अच्छी बारिश — सिंचाई रोकें और खेत में जलभराव जाँचें।",
    };
  if (temp >= 38)
    return {
      en: "Very hot — irrigate early morning or evening and mulch to save moisture.",
      hi: "बहुत गर्मी — सुबह या शाम सिंचाई करें और नमी बचाने हेतु मल्चिंग करें।",
    };
  if (humidity >= 80)
    return {
      en: "High humidity — watch for fungal disease and ensure good air flow between plants.",
      hi: "अधिक नमी — फफूँद रोग पर नज़र रखें और पौधों के बीच हवा का आवागमन रखें।",
    };
  if (temp <= 10)
    return {
      en: "Cold spell — protect seedlings from frost with light irrigation at evening.",
      hi: "ठंड — शाम को हल्की सिंचाई कर पौध को पाले से बचाएँ।",
    };
  return {
    en: "Weather is favourable for most field work today.",
    hi: "आज अधिकांश खेती कार्य के लिए मौसम अनुकूल है।",
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json(
      { ok: false, data: null, source: "none", fallbackUsed: false, error: "lat/lon required" },
      { status: 400 },
    );
  }

  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", lat);
    url.searchParams.set("longitude", lon);
    url.searchParams.set(
      "current",
      "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m",
    );
    url.searchParams.set("daily", "precipitation_sum");
    url.searchParams.set("timezone", "auto");
    url.searchParams.set("forecast_days", "1");

    const r = await fetch(url, { next: { revalidate: 1800 } });
    if (!r.ok) throw new Error(`open-meteo ${r.status}`);
    const j = (await r.json()) as {
      current?: Record<string, number>;
      daily?: { precipitation_sum?: number[] };
    };
    const c = j.current ?? {};
    const temperature = Math.round(c.temperature_2m ?? 0);
    const humidity = Math.round(c.relative_humidity_2m ?? 0);
    const rainfall = Number(
      (j.daily?.precipitation_sum?.[0] ?? c.precipitation ?? 0).toFixed(1),
    );
    const windspeed = Math.round(c.wind_speed_10m ?? 0);

    const data: WeatherData = {
      temperature,
      humidity,
      rainfall,
      windspeed,
      code: c.weather_code ?? 0,
      advice: advice(temperature, rainfall, humidity),
    };

    return NextResponse.json({
      ok: true,
      data,
      source: "Open-Meteo",
      fallbackUsed: false,
    } satisfies ApiResult<WeatherData>);
  } catch (err) {
    return NextResponse.json({
      ok: false,
      data: null,
      source: "none",
      fallbackUsed: false,
      error: err instanceof Error ? err.message : "weather failed",
    } satisfies ApiResult<WeatherData>);
  }
}
