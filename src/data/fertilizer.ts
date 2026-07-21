/**
 * General ICAR-style nutrient recommendations per crop, in kg/acre of
 * N, P₂O₅ and K₂O. These are guidance-level defaults — actual doses should
 * follow a soil test (Soil Health Card).
 */
export type NpkPerAcre = { n: number; p: number; k: number };

export const FERTILIZER_RECS: Record<string, NpkPerAcre> = {
  rice: { n: 48, p: 24, k: 24 },
  maize: { n: 48, p: 24, k: 16 },
  cotton: { n: 40, p: 20, k: 20 },
  soybean: { n: 12, p: 30, k: 12 },
  groundnut: { n: 10, p: 20, k: 18 },
  bajra: { n: 24, p: 16, k: 8 },
  sugarcane: { n: 100, p: 40, k: 48 },
  wheat: { n: 48, p: 24, k: 16 },
  gram: { n: 8, p: 20, k: 8 },
  mustard: { n: 32, p: 16, k: 8 },
  potato: { n: 48, p: 32, k: 40 },
  onion: { n: 40, p: 20, k: 20 },
  tomato: { n: 48, p: 32, k: 20 },
  lentil: { n: 8, p: 16, k: 8 },
  greengram: { n: 8, p: 16, k: 8 },
  watermelon: { n: 40, p: 20, k: 20 },
  cucumber: { n: 32, p: 16, k: 16 },
  turmeric: { n: 24, p: 20, k: 48 },
};

// Nutrient content of the common straight fertilizers.
const UREA_N = 0.46;
const DAP_N = 0.18;
const DAP_P = 0.46;
const MOP_K = 0.6;
export const BAG_KG = 50;

export const ACRES_PER_HECTARE = 2.47105;

export type DoseResult = {
  /** Total nutrient need for the given area, kg. */
  need: NpkPerAcre;
  /** Product quantities, kg (urea already reduced by DAP's nitrogen). */
  ureaKg: number;
  dapKg: number;
  mopKg: number;
};

/** Compute nutrient need and product quantities for a crop over `acres`. */
export function computeDose(cropId: string, acres: number): DoseResult | null {
  const rec = FERTILIZER_RECS[cropId];
  if (!rec || !(acres > 0)) return null;
  const need = {
    n: rec.n * acres,
    p: rec.p * acres,
    k: rec.k * acres,
  };
  const dapKg = need.p / DAP_P;
  const nFromDap = dapKg * DAP_N;
  const ureaKg = Math.max(0, (need.n - nFromDap) / UREA_N);
  const mopKg = need.k / MOP_K;
  return { need, ureaKg, dapKg, mopKg };
}
