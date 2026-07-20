import type { Season } from "./types";

/**
 * Indian cropping seasons:
 *  - Kharif: sown Jun–Jul with the monsoon, harvested Sep–Oct
 *  - Rabi:   sown Oct–Nov, harvested Mar–Apr
 *  - Zaid:   short summer season Mar–Jun
 */
export function currentSeason(date = new Date()): Season {
  const m = date.getMonth(); // 0 = Jan
  if (m >= 5 && m <= 9) return "kharif"; // Jun–Oct
  if (m >= 2 && m <= 4) return "zaid"; // Mar–May
  return "rabi"; // Nov–Feb
}

export const MONTHS_EN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const MONTHS_HI = [
  "जन",
  "फ़र",
  "मार्च",
  "अप्रैल",
  "मई",
  "जून",
  "जुल",
  "अग",
  "सित",
  "अक्टू",
  "नव",
  "दिस",
];

/** Format a [startMonthIndex, endMonthIndex] window as "Jun – Oct". */
export function monthRange(
  range: [number, number],
  lang: "en" | "hi",
): string {
  const names = lang === "hi" ? MONTHS_HI : MONTHS_EN;
  return `${names[range[0]]} – ${names[range[1]]}`;
}
