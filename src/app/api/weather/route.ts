import { NextResponse } from "next/server";
import type { ApiResult, Localized, WeatherData } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADVICE: Record<"rain" | "heat" | "humid" | "cold" | "fine", Localized> = {
  rain: {
    en: "Good rain recently — hold off on irrigation and check fields for waterlogging.",
    hi: "हाल में अच्छी बारिश — सिंचाई रोकें और खेत में जलभराव जाँचें।",
    te: "ఇటీవల మంచి వర్షం — సాగునీరు ఆపి, పొలంలో నీటి నిల్వను తనిఖీ చేయండి.",
    kn: "ಇತ್ತೀಚೆಗೆ ಒಳ್ಳೆಯ ಮಳೆ — ನೀರಾವರಿ ನಿಲ್ಲಿಸಿ, ಹೊಲದಲ್ಲಿ ನೀರು ನಿಂತಿದೆಯೇ ಪರಿಶೀಲಿಸಿ.",
    ta: "சமீபத்தில் நல்ல மழை — நீர்ப்பாசனத்தை நிறுத்தி வயலில் நீர் தேக்கத்தைச் சரிபார்க்கவும்.",
  },
  heat: {
    en: "Very hot — irrigate early morning or evening and mulch to save moisture.",
    hi: "बहुत गर्मी — सुबह या शाम सिंचाई करें और नमी बचाने हेतु मल्चिंग करें।",
    te: "చాలా వేడి — ఉదయం లేదా సాయంత్రం నీరు పెట్టండి, తేమ కాపాడేందుకు మల్చింగ్ చేయండి.",
    kn: "ತುಂಬಾ ಬಿಸಿ — ಬೆಳಿಗ್ಗೆ ಅಥವಾ ಸಂಜೆ ನೀರು ಹಾಯಿಸಿ, ತೇವಾಂಶ ಉಳಿಸಲು ಮಲ್ಚಿಂಗ್ ಮಾಡಿ.",
    ta: "மிகவும் வெப்பம் — அதிகாலை அல்லது மாலையில் நீர் பாய்ச்சி, ஈரப்பதம் காக்க மல்ச்சிங் செய்யவும்.",
  },
  humid: {
    en: "High humidity — watch for fungal disease and ensure good air flow between plants.",
    hi: "अधिक नमी — फफूँद रोग पर नज़र रखें और पौधों के बीच हवा का आवागमन रखें।",
    te: "అధిక తేమ — శిలీంధ్ర రోగాలపై నిఘా ఉంచండి, మొక్కల మధ్య గాలి ఆడేలా చూడండి.",
    kn: "ಹೆಚ್ಚು ತೇವಾಂಶ — ಶಿಲೀಂಧ್ರ ರೋಗದ ಬಗ್ಗೆ ಎಚ್ಚರವಿರಲಿ, ಗಿಡಗಳ ನಡುವೆ ಗಾಳಿ ಆಡುವಂತೆ ನೋಡಿಕೊಳ್ಳಿ.",
    ta: "அதிக ஈரப்பதம் — பூஞ்சை நோய்களைக் கவனிக்கவும், செடிகளுக்கு இடையே காற்றோட்டம் இருக்கட்டும்.",
  },
  cold: {
    en: "Cold spell — protect seedlings from frost with light irrigation at evening.",
    hi: "ठंड — शाम को हल्की सिंचाई कर पौध को पाले से बचाएँ।",
    te: "చలి — సాయంత్రం తేలికపాటి నీరు పెట్టి నారు మొక్కలను మంచు నుంచి కాపాడండి.",
    kn: "ಚಳಿ — ಸಂಜೆ ಲಘು ನೀರಾವರಿ ಮಾಡಿ ಸಸಿಗಳನ್ನು ಇಬ್ಬನಿಯಿಂದ ರಕ್ಷಿಸಿ.",
    ta: "குளிர் — மாலையில் இலேசாக நீர் பாய்ச்சி நாற்றுகளை பனியிலிருந்து காக்கவும்.",
  },
  fine: {
    en: "Weather is favourable for most field work today.",
    hi: "आज अधिकांश खेती कार्य के लिए मौसम अनुकूल है।",
    te: "ఈరోజు చాలా వ్యవసాయ పనులకు వాతావరణం అనుకూలంగా ఉంది.",
    kn: "ಇಂದು ಹೆಚ್ಚಿನ ಕೃಷಿ ಕೆಲಸಗಳಿಗೆ ಹವಾಮಾನ ಅನುಕೂಲವಾಗಿದೆ.",
    ta: "இன்று பெரும்பாலான வயல் வேலைகளுக்கு வானிலை சாதகமாக உள்ளது.",
  },
};

function advice(temp: number, rain: number, humidity: number): Localized {
  if (rain >= 10) return ADVICE.rain;
  if (temp >= 38) return ADVICE.heat;
  if (humidity >= 80) return ADVICE.humid;
  if (temp <= 10) return ADVICE.cold;
  return ADVICE.fine;
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
