export type Coords = { lat: number; lon: number };

export type Place = {
  state: string;
  district: string;
  village?: string;
  displayName: string;
};

export type SoilData = {
  /** USDA texture class key, e.g. "clay_loam" */
  textureKey: string;
  textureName: { en: string; hi: string };
  soilGroup: { en: string; hi: string };
  ph: number | null;
  organicCarbon: number | null; // g/kg
  sand: number | null; // %
  silt: number | null; // %
  clay: number | null; // %
  fertility: "low" | "medium" | "high";
  suitability: { en: string; hi: string };
};

export type WeatherData = {
  temperature: number;
  humidity: number;
  rainfall: number; // last 24h mm
  windspeed: number;
  code: number;
  advice: { en: string; hi: string };
};

export type MarketRow = {
  commodity: string;
  market: string;
  state: string;
  district: string;
  modalPrice: number;
  minPrice: number;
  maxPrice: number;
  date: string;
};

export type Season = "kharif" | "rabi" | "zaid";

export type ScanResult = {
  isPlant: boolean;
  plant: string;
  stage: string;
  health: "healthy" | "unhealthy" | "unsure";
  disease: string;
  cause: string;
  cure: string;
  prevention: string;
  tips: string;
  confidence: "low" | "medium" | "high";
};

/** Standard envelope returned by every API route. */
export type ApiResult<T> = {
  ok: boolean;
  data: T | null;
  source: string;
  fallbackUsed: boolean;
  error?: string;
};
