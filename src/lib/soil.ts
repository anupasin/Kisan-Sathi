import type { SoilData } from "./types";

type Bilingual = { en: string; hi: string };

type TextureInfo = {
  key: string;
  name: Bilingual;
  group: Bilingual;
  suitability: Bilingual;
};

// USDA texture classes mapped to a farmer-friendly soil group + what it suits.
const TEXTURES: Record<string, TextureInfo> = {
  sand: {
    key: "sand",
    name: { en: "Sandy", hi: "बलुई" },
    group: { en: "Sandy / Arid soil", hi: "बलुई / शुष्क मिट्टी" },
    suitability: {
      en: "Drains fast and warms early. Good for groundnut, bajra, watermelon and vegetables with drip irrigation. Needs frequent watering and organic manure.",
      hi: "जल्दी सूखती और गर्म होती है। मूँगफली, बाजरा, तरबूज़ और सब्ज़ियों के लिए अच्छी (ड्रिप सिंचाई के साथ)। बार-बार पानी और गोबर खाद चाहिए।",
    },
  },
  loamy_sand: {
    key: "loamy_sand",
    name: { en: "Loamy sand", hi: "बलुई दोमट" },
    group: { en: "Light sandy loam", hi: "हल्की बलुई दोमट" },
    suitability: {
      en: "Light and easy to work. Suits groundnut, potato, bajra and pulses. Add compost to hold moisture and nutrients.",
      hi: "हल्की और जोतने में आसान। मूँगफली, आलू, बाजरा और दालों के लिए उपयुक्त। नमी बनाए रखने हेतु कम्पोस्ट डालें।",
    },
  },
  sandy_loam: {
    key: "sandy_loam",
    name: { en: "Sandy loam", hi: "बलुई दोमट" },
    group: { en: "Fertile sandy loam", hi: "उपजाऊ बलुई दोमट" },
    suitability: {
      en: "A versatile, easy-to-till soil. Excellent for vegetables, maize, cotton, pulses and horticulture with balanced water.",
      hi: "बहुउपयोगी और आसानी से जुतने वाली मिट्टी। सब्ज़ियों, मक्का, कपास, दालों और बागवानी के लिए उत्तम।",
    },
  },
  loam: {
    key: "loam",
    name: { en: "Loam", hi: "दोमट" },
    group: { en: "Loamy soil", hi: "दोमट मिट्टी" },
    suitability: {
      en: "The ideal all-round soil — holds moisture yet drains well. Great for wheat, sugarcane, vegetables, pulses and most crops.",
      hi: "सबसे आदर्श मिट्टी — नमी रखती है और पानी भी निकालती है। गेहूँ, गन्ना, सब्ज़ियाँ, दालें और अधिकांश फसलों के लिए बढ़िया।",
    },
  },
  silt_loam: {
    key: "silt_loam",
    name: { en: "Silt loam", hi: "गादयुक्त दोमट" },
    group: { en: "Silty fertile soil", hi: "गादयुक्त उपजाऊ मिट्टी" },
    suitability: {
      en: "Rich and moisture-retentive, common near rivers. Ideal for paddy, wheat, sugarcane and vegetables. Watch for surface crusting.",
      hi: "उपजाऊ और नमीयुक्त, नदियों के पास आम। धान, गेहूँ, गन्ना और सब्ज़ियों के लिए आदर्श। ऊपरी परत सख़्त होने का ध्यान रखें।",
    },
  },
  silt: {
    key: "silt",
    name: { en: "Silty", hi: "गादयुक्त" },
    group: { en: "Silty alluvial soil", hi: "गादयुक्त जलोढ़ मिट्टी" },
    suitability: {
      en: "Very fertile riverine soil. Excellent for paddy, wheat and vegetables. Improve drainage and structure with organic matter.",
      hi: "बहुत उपजाऊ नदी की मिट्टी। धान, गेहूँ और सब्ज़ियों के लिए उत्तम। जैविक खाद से जल-निकास सुधारें।",
    },
  },
  sandy_clay_loam: {
    key: "sandy_clay_loam",
    name: { en: "Sandy clay loam", hi: "बलुई चिकनी दोमट" },
    group: { en: "Medium-heavy soil", hi: "मध्यम-भारी मिट्टी" },
    suitability: {
      en: "Holds nutrients well with fair drainage. Good for cotton, pulses, sorghum, wheat and oilseeds.",
      hi: "पोषक तत्व अच्छे रखती है, जल-निकास ठीक। कपास, दालों, ज्वार, गेहूँ और तिलहन के लिए अच्छी।",
    },
  },
  clay_loam: {
    key: "clay_loam",
    name: { en: "Clay loam", hi: "चिकनी दोमट" },
    group: { en: "Heavy fertile soil", hi: "भारी उपजाऊ मिट्टी" },
    suitability: {
      en: "Nutrient-rich and moisture-holding. Well suited to wheat, paddy, sugarcane, gram and cotton. Needs good drainage.",
      hi: "पोषक व नमीयुक्त। गेहूँ, धान, गन्ना, चना और कपास के लिए उपयुक्त। अच्छे जल-निकास की ज़रूरत।",
    },
  },
  silty_clay_loam: {
    key: "silty_clay_loam",
    name: { en: "Silty clay loam", hi: "गादयुक्त चिकनी दोमट" },
    group: { en: "Heavy fertile soil", hi: "भारी उपजाऊ मिट्टी" },
    suitability: {
      en: "Fertile and moisture-retentive. Strong for paddy, wheat and sugarcane. Avoid working when waterlogged.",
      hi: "उपजाऊ और नमीयुक्त। धान, गेहूँ और गन्ने के लिए बढ़िया। जलभराव में जुताई न करें।",
    },
  },
  clay: {
    key: "clay",
    name: { en: "Clay", hi: "चिकनी" },
    group: { en: "Heavy clay / Black soil", hi: "भारी चिकनी / काली मिट्टी" },
    suitability: {
      en: "Holds water and nutrients strongly (black cotton type). Excellent for cotton, soybean, gram, sorghum and wheat. Drains slowly — manage waterlogging.",
      hi: "पानी व पोषक तत्व मज़बूती से रखती है (काली कपास मिट्टी)। कपास, सोयाबीन, चना, ज्वार और गेहूँ के लिए उत्तम। धीरे सूखती है — जलभराव संभालें।",
    },
  },
  sandy_clay: {
    key: "sandy_clay",
    name: { en: "Sandy clay", hi: "बलुई चिकनी" },
    group: { en: "Heavy soil", hi: "भारी मिट्टी" },
    suitability: {
      en: "Firm, nutrient-holding soil. Suits cotton, pulses, sorghum and wheat with careful tillage.",
      hi: "मज़बूत, पोषक रखने वाली मिट्टी। कपास, दालों, ज्वार और गेहूँ के लिए उपयुक्त।",
    },
  },
  silty_clay: {
    key: "silty_clay",
    name: { en: "Silty clay", hi: "गादयुक्त चिकनी" },
    group: { en: "Heavy fertile soil", hi: "भारी उपजाऊ मिट्टी" },
    suitability: {
      en: "Very fertile, moisture-holding delta-type soil. Ideal for paddy, jute, sugarcane and wheat.",
      hi: "बहुत उपजाऊ, नमीयुक्त डेल्टा-प्रकार की मिट्टी। धान, जूट, गन्ना और गेहूँ के लिए आदर्श।",
    },
  },
};

/**
 * Classify a soil into a USDA texture class from sand/silt/clay percentages,
 * using the standard texture-triangle boundaries.
 */
export function classifyTexture(
  sand: number,
  silt: number,
  clay: number,
): TextureInfo {
  const key = ((): string => {
    if (clay >= 40) {
      if (silt >= 40) return "silty_clay";
      if (sand >= 45) return "sandy_clay";
      return "clay";
    }
    if (clay >= 27) {
      if (sand >= 45) return "sandy_clay_loam";
      if (silt >= 40) return "silty_clay_loam";
      return "clay_loam";
    }
    if (clay >= 20 && clay < 27 && sand > 45 && silt < 28)
      return "sandy_clay_loam";
    if (silt >= 80 && clay < 12) return "silt";
    if (silt >= 50 && clay < 27) return "silt_loam";
    if (silt >= 28 && silt < 50 && clay < 27 && sand <= 52) return "loam";
    if (clay < 7 && silt < 50) {
      if (sand >= 85) return "sand";
      if (sand >= 70) return "loamy_sand";
    }
    if (sand >= 43 && clay < 20) return "sandy_loam";
    return "loam";
  })();
  return TEXTURES[key] ?? TEXTURES.loam;
}

export function textureByKey(key: string): TextureInfo {
  return TEXTURES[key] ?? TEXTURES.loam;
}

/** Fertility band from soil organic carbon (g/kg). */
export function fertilityFromOC(
  oc: number | null,
): "low" | "medium" | "high" {
  if (oc == null) return "medium";
  if (oc < 4) return "low";
  if (oc < 7.5) return "medium";
  return "high";
}

export function phBand(ph: number | null): "acidic" | "neutral" | "alkaline" {
  if (ph == null) return "neutral";
  if (ph < 6.5) return "acidic";
  if (ph > 7.5) return "alkaline";
  return "neutral";
}

/** Assemble a normalized SoilData object from raw percentages/properties. */
export function buildSoilData(input: {
  sand: number | null;
  silt: number | null;
  clay: number | null;
  ph: number | null;
  organicCarbon: number | null;
}): SoilData {
  const sand = input.sand ?? 40;
  const silt = input.silt ?? 40;
  const clay = input.clay ?? 20;
  const info = classifyTexture(sand, silt, clay);
  return {
    textureKey: info.key,
    textureName: info.name,
    soilGroup: info.group,
    ph: input.ph,
    organicCarbon: input.organicCarbon,
    sand: input.sand,
    silt: input.silt,
    clay: input.clay,
    fertility: fertilityFromOC(input.organicCarbon),
    suitability: info.suitability,
  };
}
