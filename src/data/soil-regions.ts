// Representative topsoil composition per Indian state, used as a fallback when
// the live SoilGrids point query is unavailable. Values approximate the
// dominant soil group of each state (alluvial, black, red, laterite, desert).
// sand/silt/clay are %, ph is 1-14, oc is organic carbon g/kg.

export type SoilProfile = {
  sand: number;
  silt: number;
  clay: number;
  ph: number;
  oc: number;
};

const alluvialLoam: SoilProfile = { sand: 40, silt: 40, clay: 20, ph: 7.2, oc: 5.5 };
const blackClay: SoilProfile = { sand: 25, silt: 27, clay: 48, ph: 7.8, oc: 6.5 };
const redLoam: SoilProfile = { sand: 55, silt: 25, clay: 20, ph: 6.3, oc: 4.0 };
const laterite: SoilProfile = { sand: 45, silt: 20, clay: 35, ph: 5.6, oc: 5.0 };
const desertSandy: SoilProfile = { sand: 82, silt: 10, clay: 8, ph: 8.0, oc: 2.5 };
const silty: SoilProfile = { sand: 25, silt: 58, clay: 17, ph: 6.8, oc: 6.0 };
const mountain: SoilProfile = { sand: 45, silt: 35, clay: 20, ph: 6.0, oc: 8.0 };

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z]/g, "");
}

const RAW: Record<string, SoilProfile> = {
  "Punjab": alluvialLoam,
  "Haryana": alluvialLoam,
  "Uttar Pradesh": alluvialLoam,
  "Bihar": silty,
  "Delhi": alluvialLoam,
  "Chandigarh": alluvialLoam,
  "Uttarakhand": mountain,
  "Himachal Pradesh": mountain,
  "Jammu and Kashmir": mountain,
  "Ladakh": mountain,
  "West Bengal": silty,
  "Assam": silty,
  "Arunachal Pradesh": mountain,
  "Meghalaya": laterite,
  "Manipur": mountain,
  "Mizoram": mountain,
  "Nagaland": mountain,
  "Tripura": laterite,
  "Sikkim": mountain,
  "Jharkhand": redLoam,
  "Odisha": redLoam,
  "Chhattisgarh": redLoam,
  "Madhya Pradesh": blackClay,
  "Maharashtra": blackClay,
  "Gujarat": blackClay,
  "Rajasthan": desertSandy,
  "Telangana": redLoam,
  "Andhra Pradesh": redLoam,
  "Karnataka": redLoam,
  "Tamil Nadu": redLoam,
  "Kerala": laterite,
  "Goa": laterite,
  "Puducherry": redLoam,
  "Dadra and Nagar Haveli and Daman and Diu": blackClay,
  "Andaman and Nicobar Islands": laterite,
  "Lakshadweep": desertSandy,
};

const LOOKUP: Record<string, SoilProfile> = Object.fromEntries(
  Object.entries(RAW).map(([k, v]) => [norm(k), v]),
);

/** National default (fertile alluvial loam) when a state can't be matched. */
export const DEFAULT_SOIL: SoilProfile = alluvialLoam;

export function soilProfileForState(state?: string | null): {
  profile: SoilProfile;
  matched: boolean;
} {
  if (!state) return { profile: DEFAULT_SOIL, matched: false };
  const key = norm(state);
  const direct = LOOKUP[key];
  if (direct) return { profile: direct, matched: true };
  // Loose contains-match for names like "State of Punjab".
  const partial = Object.keys(LOOKUP).find(
    (k) => key.includes(k) || k.includes(key),
  );
  if (partial) return { profile: LOOKUP[partial], matched: true };
  return { profile: DEFAULT_SOIL, matched: false };
}
