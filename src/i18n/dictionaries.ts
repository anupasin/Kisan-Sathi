import { en, type Dict } from "./dicts/en";
import { hi } from "./dicts/hi";
import { te } from "./dicts/te";
import { kn } from "./dicts/kn";
import { ta } from "./dicts/ta";

export type { Dict };

export const LANGS = [
  { code: "en", label: "English", short: "EN" },
  { code: "hi", label: "हिन्दी", short: "हि" },
  { code: "te", label: "తెలుగు", short: "తె" },
  { code: "kn", label: "ಕನ್ನಡ", short: "ಕ" },
  { code: "ta", label: "தமிழ்", short: "த" },
] as const;

export type Lang = (typeof LANGS)[number]["code"];

export function isLang(value: unknown): value is Lang {
  return LANGS.some((l) => l.code === value);
}

export const dictionaries: Record<Lang, Dict> = { en, hi, te, kn, ta };
