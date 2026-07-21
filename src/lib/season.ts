import type { Lang } from "@/i18n/dictionaries";
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

export const MONTHS: Record<Lang, string[]> = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  hi: ["जन", "फ़र", "मार्च", "अप्रैल", "मई", "जून", "जुल", "अग", "सित", "अक्टू", "नव", "दिस"],
  te: ["జన", "ఫిబ్ర", "మార్చి", "ఏప్రి", "మే", "జూన్", "జులై", "ఆగ", "సెప్టెం", "అక్టో", "నవం", "డిసెం"],
  kn: ["ಜನ", "ಫೆಬ್ರ", "ಮಾರ್ಚ್", "ಏಪ್ರಿ", "ಮೇ", "ಜೂನ್", "ಜುಲೈ", "ಆಗ", "ಸೆಪ್ಟೆಂ", "ಅಕ್ಟೋ", "ನವೆಂ", "ಡಿಸೆಂ"],
  ta: ["ஜன", "பிப்", "மார்ச்", "ஏப்", "மே", "ஜூன்", "ஜூலை", "ஆக", "செப்", "அக்", "நவ்", "டிச"],
};

/** Format a [startMonthIndex, endMonthIndex] window as "Jun – Oct". */
export function monthRange(range: [number, number], lang: Lang): string {
  const names = MONTHS[lang];
  return `${names[range[0]]} – ${names[range[1]]}`;
}
