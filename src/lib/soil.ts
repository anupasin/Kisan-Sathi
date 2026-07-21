import type { Localized, SoilData } from "./types";

type TextureInfo = {
  key: string;
  name: Localized;
  group: Localized;
  suitability: Localized;
};

// USDA texture classes mapped to a farmer-friendly soil group + what it suits.
// Translations (te/kn/ta) are plain farmer wording; flagged for native review.
const TEXTURES: Record<string, TextureInfo> = {
  sand: {
    key: "sand",
    name: {
      en: "Sandy",
      hi: "बलुई",
      te: "ఇసుక నేల",
      kn: "ಮರಳು ಮಣ್ಣು",
      ta: "மணல் மண்",
    },
    group: {
      en: "Sandy / Arid soil",
      hi: "बलुई / शुष्क मिट्टी",
      te: "ఇసుక / ఎడారి తరహా నేల",
      kn: "ಮರಳು / ಒಣ ಮಣ್ಣು",
      ta: "மணல் / வறண்ட மண்",
    },
    suitability: {
      en: "Drains fast and warms early. Good for groundnut, bajra, watermelon and vegetables with drip irrigation. Needs frequent watering and organic manure.",
      hi: "जल्दी सूखती और गर्म होती है। मूँगफली, बाजरा, तरबूज़ और सब्ज़ियों के लिए अच्छी (ड्रिप सिंचाई के साथ)। बार-बार पानी और गोबर खाद चाहिए।",
      te: "త్వరగా నీరు ఇంకి, త్వరగా వేడెక్కుతుంది. డ్రిప్ సాగుతో వేరుశనగ, సజ్జ, పుచ్చకాయ, కూరగాయలకు మంచిది. తరచూ నీరు, సేంద్రియ ఎరువు అవసరం.",
      kn: "ನೀರು ಬೇಗ ಬಸಿದು ಬೇಗ ಬಿಸಿಯಾಗುತ್ತದೆ. ಹನಿ ನೀರಾವರಿಯೊಂದಿಗೆ ಕಡಲೆಕಾಯಿ, ಸಜ್ಜೆ, ಕಲ್ಲಂಗಡಿ ಮತ್ತು ತರಕಾರಿಗಳಿಗೆ ಒಳ್ಳೆಯದು. ಆಗಾಗ ನೀರು ಮತ್ತು ಸಾವಯವ ಗೊಬ್ಬರ ಬೇಕು.",
      ta: "நீர் விரைவில் வடிந்து சீக்கிரம் சூடாகும். சொட்டு நீர்ப்பாசனத்துடன் நிலக்கடலை, கம்பு, தர்பூசணி மற்றும் காய்கறிகளுக்கு நல்லது. அடிக்கடி நீரும் இயற்கை உரமும் தேவை.",
    },
  },
  loamy_sand: {
    key: "loamy_sand",
    name: {
      en: "Loamy sand",
      hi: "बलुई दोमट",
      te: "తేలికపాటి ఇసుక నేల",
      kn: "ಹಗುರ ಮರಳು ಮಣ್ಣು",
      ta: "இலேசான மணல் மண்",
    },
    group: {
      en: "Light sandy loam",
      hi: "हल्की बलुई दोमट",
      te: "తేలికపాటి ఇసుక గరప",
      kn: "ಹಗುರ ಮರಳು ಗೋಡು",
      ta: "இலேசான மணல் கலவை",
    },
    suitability: {
      en: "Light and easy to work. Suits groundnut, potato, bajra and pulses. Add compost to hold moisture and nutrients.",
      hi: "हल्की और जोतने में आसान। मूँगफली, आलू, बाजरा और दालों के लिए उपयुक्त। नमी बनाए रखने हेतु कम्पोस्ट डालें।",
      te: "తేలికగా, దున్నడానికి సులభం. వేరుశనగ, బంగాళాదుంప, సజ్జ, పప్పుధాన్యాలకు అనుకూలం. తేమ, పోషకాలు నిలవడానికి కంపోస్టు వేయండి.",
      kn: "ಹಗುರ, ಉಳುಮೆಗೆ ಸುಲಭ. ಕಡಲೆಕಾಯಿ, ಆಲೂಗಡ್ಡೆ, ಸಜ್ಜೆ ಮತ್ತು ದ್ವಿದಳ ಧಾನ್ಯಗಳಿಗೆ ಸೂಕ್ತ. ತೇವಾಂಶ ಮತ್ತು ಪೋಷಕಾಂಶ ಹಿಡಿದಿಡಲು ಕಾಂಪೋಸ್ಟ್ ಹಾಕಿ.",
      ta: "இலேசானது, உழவு எளிது. நிலக்கடலை, உருளைக்கிழங்கு, கம்பு மற்றும் பயறு வகைகளுக்கு ஏற்றது. ஈரப்பதமும் சத்தும் தங்க கம்போஸ்ட் இடவும்.",
    },
  },
  sandy_loam: {
    key: "sandy_loam",
    name: {
      en: "Sandy loam",
      hi: "बलुई दोमट",
      te: "ఇసుక గరప నేల",
      kn: "ಮರಳು ಗೋಡು ಮಣ್ಣು",
      ta: "மணல் கலந்த செழுமண்",
    },
    group: {
      en: "Fertile sandy loam",
      hi: "उपजाऊ बलुई दोमट",
      te: "సారవంతమైన ఇసుక గరప",
      kn: "ಫಲವತ್ತಾದ ಮರಳು ಗೋಡು",
      ta: "வளமான மணல் கலவை",
    },
    suitability: {
      en: "A versatile, easy-to-till soil. Excellent for vegetables, maize, cotton, pulses and horticulture with balanced water.",
      hi: "बहुउपयोगी और आसानी से जुतने वाली मिट्टी। सब्ज़ियों, मक्का, कपास, दालों और बागवानी के लिए उत्तम।",
      te: "బహుళ ప్రయోజన, సులభంగా దున్నగల నేల. సమతుల నీటితో కూరగాయలు, మొక్కజొన్న, పత్తి, పప్పుధాన్యాలు, ఉద్యాన పంటలకు ఉత్తమం.",
      kn: "ಬಹೂಪಯೋಗಿ, ಸುಲಭವಾಗಿ ಉಳುಮೆ ಮಾಡಬಹುದಾದ ಮಣ್ಣು. ಸಮತೋಲಿತ ನೀರಿನೊಂದಿಗೆ ತರಕಾರಿ, ಮೆಕ್ಕೆಜೋಳ, ಹತ್ತಿ, ದ್ವಿದಳ ಧಾನ್ಯ ಮತ್ತು ತೋಟಗಾರಿಕೆಗೆ ಅತ್ಯುತ್ತಮ.",
      ta: "பல பயன், எளிதில் உழக்கூடிய மண். சீரான நீருடன் காய்கறி, மக்காச்சோளம், பருத்தி, பயறு மற்றும் தோட்டக்கலைக்கு சிறந்தது.",
    },
  },
  loam: {
    key: "loam",
    name: {
      en: "Loam",
      hi: "दोमट",
      te: "గరప నేల",
      kn: "ಗೋಡು ಮಣ್ಣು",
      ta: "கலவை மண் (லோம்)",
    },
    group: {
      en: "Loamy soil",
      hi: "दोमट मिट्टी",
      te: "గరప నేల",
      kn: "ಗೋಡು ಮಣ್ಣು",
      ta: "கலவை (லோம்) மண்",
    },
    suitability: {
      en: "The ideal all-round soil — holds moisture yet drains well. Great for wheat, sugarcane, vegetables, pulses and most crops.",
      hi: "सबसे आदर्श मिट्टी — नमी रखती है और पानी भी निकालती है। गेहूँ, गन्ना, सब्ज़ियाँ, दालें और अधिकांश फसलों के लिए बढ़िया।",
      te: "అన్నింటికీ అనువైన ఆదర్శ నేల — తేమ నిలుపుతుంది, నీరు కూడా బయటకు పోతుంది. గోధుమ, చెరకు, కూరగాయలు, పప్పుధాన్యాలు, చాలా పంటలకు చక్కగా సరిపోతుంది.",
      kn: "ಎಲ್ಲದಕ್ಕೂ ಸೂಕ್ತವಾದ ಆದರ್ಶ ಮಣ್ಣು — ತೇವಾಂಶ ಹಿಡಿದಿಟ್ಟು ನೀರನ್ನೂ ಬಸಿಯುತ್ತದೆ. ಗೋಧಿ, ಕಬ್ಬು, ತರಕಾರಿ, ದ್ವಿದಳ ಧಾನ್ಯ ಮತ್ತು ಹೆಚ್ಚಿನ ಬೆಳೆಗಳಿಗೆ ಉತ್ತಮ.",
      ta: "எல்லாவற்றுக்கும் ஏற்ற சிறந்த மண் — ஈரப்பதம் தங்கி நீரும் வடியும். கோதுமை, கரும்பு, காய்கறி, பயறு மற்றும் பெரும்பாலான பயிர்களுக்கு நல்லது.",
    },
  },
  silt_loam: {
    key: "silt_loam",
    name: {
      en: "Silt loam",
      hi: "गादयुक्त दोमट",
      te: "ఒండ్రు గరప నేల",
      kn: "ಹೂಳು ಗೋಡು ಮಣ್ಣು",
      ta: "வண்டல் கலவை மண்",
    },
    group: {
      en: "Silty fertile soil",
      hi: "गादयुक्त उपजाऊ मिट्टी",
      te: "ఒండ్రుతో కూడిన సారవంత నేల",
      kn: "ಹೂಳಿನ ಫಲವತ್ತಾದ ಮಣ್ಣು",
      ta: "வண்டல் வள மண்",
    },
    suitability: {
      en: "Rich and moisture-retentive, common near rivers. Ideal for paddy, wheat, sugarcane and vegetables. Watch for surface crusting.",
      hi: "उपजाऊ और नमीयुक्त, नदियों के पास आम। धान, गेहूँ, गन्ना और सब्ज़ियों के लिए आदर्श। ऊपरी परत सख़्त होने का ध्यान रखें।",
      te: "నదుల దగ్గర సాధారణంగా కనిపించే, సారవంతమైన, తేమ నిలిపే నేల. వరి, గోధుమ, చెరకు, కూరగాయలకు ఆదర్శం. పై పొర గట్టిపడకుండా చూసుకోండి.",
      kn: "ನದಿಗಳ ಬಳಿ ಸಾಮಾನ್ಯ, ಫಲವತ್ತಾದ ಮತ್ತು ತೇವಾಂಶ ಹಿಡಿಯುವ ಮಣ್ಣು. ಭತ್ತ, ಗೋಧಿ, ಕಬ್ಬು ಮತ್ತು ತರಕಾರಿಗಳಿಗೆ ಆದರ್ಶ. ಮೇಲ್ಪದರ ಗಟ್ಟಿಯಾಗದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.",
      ta: "ஆறுகள் அருகில் காணப்படும் வளமான, ஈரப்பதம் தங்கும் மண். நெல், கோதுமை, கரும்பு, காய்கறிகளுக்கு ஏற்றது. மேல்பரப்பு இறுகாமல் பார்க்கவும்.",
    },
  },
  silt: {
    key: "silt",
    name: {
      en: "Silty",
      hi: "गादयुक्त",
      te: "ఒండ్రు నేల",
      kn: "ಹೂಳು ಮಣ್ಣು",
      ta: "வண்டல் மண்",
    },
    group: {
      en: "Silty alluvial soil",
      hi: "गादयुक्त जलोढ़ मिट्टी",
      te: "ఒండ్రు మట్టి నేల",
      kn: "ಹೂಳಿನ ಮೆಕ್ಕಲು ಮಣ್ಣು",
      ta: "வண்டல் படிவு மண்",
    },
    suitability: {
      en: "Very fertile riverine soil. Excellent for paddy, wheat and vegetables. Improve drainage and structure with organic matter.",
      hi: "बहुत उपजाऊ नदी की मिट्टी। धान, गेहूँ और सब्ज़ियों के लिए उत्तम। जैविक खाद से जल-निकास सुधारें।",
      te: "చాలా సారవంతమైన నదీతీర నేల. వరి, గోధుమ, కూరగాయలకు ఉత్తమం. సేంద్రియ ఎరువుతో నీటి తీరువ, నిర్మాణం మెరుగుపరచండి.",
      kn: "ಬಹಳ ಫಲವತ್ತಾದ ನದಿತೀರದ ಮಣ್ಣು. ಭತ್ತ, ಗೋಧಿ ಮತ್ತು ತರಕಾರಿಗಳಿಗೆ ಅತ್ಯುತ್ತಮ. ಸಾವಯವ ಗೊಬ್ಬರದಿಂದ ಬಸಿಯುವಿಕೆ ಮತ್ತು ರಚನೆ ಸುಧಾರಿಸಿ.",
      ta: "மிக வளமான ஆற்றங்கரை மண். நெல், கோதுமை, காய்கறிகளுக்கு சிறந்தது. இயற்கை உரத்தால் வடிகால் மற்றும் அமைப்பை மேம்படுத்தவும்.",
    },
  },
  sandy_clay_loam: {
    key: "sandy_clay_loam",
    name: {
      en: "Sandy clay loam",
      hi: "बलुई चिकनी दोमट",
      te: "ఇసుక బంక గరప నేల",
      kn: "ಮರಳು ಜೇಡಿ ಗೋಡು",
      ta: "மணல் களி கலவை மண்",
    },
    group: {
      en: "Medium-heavy soil",
      hi: "मध्यम-भारी मिट्टी",
      te: "మధ్యస్థ-బరువు నేల",
      kn: "ಮಧ್ಯಮ-ಭಾರ ಮಣ್ಣು",
      ta: "நடுத்தர-கன மண்",
    },
    suitability: {
      en: "Holds nutrients well with fair drainage. Good for cotton, pulses, sorghum, wheat and oilseeds.",
      hi: "पोषक तत्व अच्छे रखती है, जल-निकास ठीक। कपास, दालों, ज्वार, गेहूँ और तिलहन के लिए अच्छी।",
      te: "పోషకాలను బాగా నిలుపుతుంది, నీటి తీరువ పరవాలేదు. పత్తి, పప్పుధాన్యాలు, జొన్న, గోధుమ, నూనెగింజలకు మంచిది.",
      kn: "ಪೋಷಕಾಂಶಗಳನ್ನು ಚೆನ್ನಾಗಿ ಹಿಡಿದಿಡುತ್ತದೆ, ಬಸಿಯುವಿಕೆ ಪರವಾಗಿಲ್ಲ. ಹತ್ತಿ, ದ್ವಿದಳ ಧಾನ್ಯ, ಜೋಳ, ಗೋಧಿ ಮತ್ತು ಎಣ್ಣೆಕಾಳುಗಳಿಗೆ ಒಳ್ಳೆಯದು.",
      ta: "சத்துகளை நன்கு தக்கவைக்கும், வடிகால் பரவாயில்லை. பருத்தி, பயறு, சோளம், கோதுமை மற்றும் எண்ணெய் வித்துகளுக்கு நல்லது.",
    },
  },
  clay_loam: {
    key: "clay_loam",
    name: {
      en: "Clay loam",
      hi: "चिकनी दोमट",
      te: "బంక గరప నేల",
      kn: "ಜೇಡಿ ಗೋಡು ಮಣ್ಣು",
      ta: "களி கலவை மண்",
    },
    group: {
      en: "Heavy fertile soil",
      hi: "भारी उपजाऊ मिट्टी",
      te: "బరువైన సారవంత నేల",
      kn: "ಭಾರವಾದ ಫಲವತ್ತಾದ ಮಣ್ಣು",
      ta: "கனமான வள மண்",
    },
    suitability: {
      en: "Nutrient-rich and moisture-holding. Well suited to wheat, paddy, sugarcane, gram and cotton. Needs good drainage.",
      hi: "पोषक व नमीयुक्त। गेहूँ, धान, गन्ना, चना और कपास के लिए उपयुक्त। अच्छे जल-निकास की ज़रूरत।",
      te: "పోషకాలు, తేమ నిలిపే నేల. గోధుమ, వరి, చెరకు, శనగ, పత్తికి బాగా సరిపోతుంది. మంచి నీటి తీరువ అవసరం.",
      kn: "ಪೋಷಕಾಂಶ ಮತ್ತು ತೇವಾಂಶ ಹಿಡಿಯುವ ಮಣ್ಣು. ಗೋಧಿ, ಭತ್ತ, ಕಬ್ಬು, ಕಡಲೆ ಮತ್ತು ಹತ್ತಿಗೆ ಸೂಕ್ತ. ಉತ್ತಮ ಬಸಿಯುವಿಕೆ ಬೇಕು.",
      ta: "சத்தும் ஈரமும் தங்கும் மண். கோதுமை, நெல், கரும்பு, கடலை மற்றும் பருத்திக்கு ஏற்றது. நல்ல வடிகால் தேவை.",
    },
  },
  silty_clay_loam: {
    key: "silty_clay_loam",
    name: {
      en: "Silty clay loam",
      hi: "गादयुक्त चिकनी दोमट",
      te: "ఒండ్రు బంక గరప నేల",
      kn: "ಹೂಳು ಜೇಡಿ ಗೋಡು",
      ta: "வண்டல் களி கலவை மண்",
    },
    group: {
      en: "Heavy fertile soil",
      hi: "भारी उपजाऊ मिट्टी",
      te: "బరువైన సారవంత నేల",
      kn: "ಭಾರವಾದ ಫಲವತ್ತಾದ ಮಣ್ಣು",
      ta: "கனமான வள மண்",
    },
    suitability: {
      en: "Fertile and moisture-retentive. Strong for paddy, wheat and sugarcane. Avoid working when waterlogged.",
      hi: "उपजाऊ और नमीयुक्त। धान, गेहूँ और गन्ने के लिए बढ़िया। जलभराव में जुताई न करें।",
      te: "సారవంతమైన, తేమ నిలిపే నేల. వరి, గోధుమ, చెరకుకు బలమైనది. నీరు నిలిచినప్పుడు దున్నవద్దు.",
      kn: "ಫಲವತ್ತಾದ ಮತ್ತು ತೇವಾಂಶ ಹಿಡಿಯುವ ಮಣ್ಣು. ಭತ್ತ, ಗೋಧಿ ಮತ್ತು ಕಬ್ಬಿಗೆ ಬಲವಾದದ್ದು. ನೀರು ನಿಂತಾಗ ಉಳುಮೆ ಮಾಡಬೇಡಿ.",
      ta: "வளமான, ஈரப்பதம் தங்கும் மண். நெல், கோதுமை, கரும்புக்கு வலிமையானது. நீர் தேங்கியிருக்கும்போது உழவு வேண்டாம்.",
    },
  },
  clay: {
    key: "clay",
    name: {
      en: "Clay",
      hi: "चिकनी",
      te: "బంకమట్టి నేల",
      kn: "ಜೇಡಿ ಮಣ್ಣು",
      ta: "களிமண்",
    },
    group: {
      en: "Heavy clay / Black soil",
      hi: "भारी चिकनी / काली मिट्टी",
      te: "బరువైన బంక / నల్లరేగడి నేల",
      kn: "ಭಾರ ಜೇಡಿ / ಕಪ್ಪು ಮಣ್ಣು",
      ta: "கன களி / கருப்பு மண்",
    },
    suitability: {
      en: "Holds water and nutrients strongly (black cotton type). Excellent for cotton, soybean, gram, sorghum and wheat. Drains slowly — manage waterlogging.",
      hi: "पानी व पोषक तत्व मज़बूती से रखती है (काली कपास मिट्टी)। कपास, सोयाबीन, चना, ज्वार और गेहूँ के लिए उत्तम। धीरे सूखती है — जलभराव संभालें।",
      te: "నీరు, పోషకాలను గట్టిగా నిలుపుతుంది (నల్లరేగడి తరహా). పత్తి, సోయాబీన్, శనగ, జొన్న, గోధుమకు ఉత్తమం. నెమ్మదిగా ఆరుతుంది — నీటి నిల్వ జాగ్రత్త.",
      kn: "ನೀರು ಮತ್ತು ಪೋಷಕಾಂಶಗಳನ್ನು ಗಟ್ಟಿಯಾಗಿ ಹಿಡಿದಿಡುತ್ತದೆ (ಕಪ್ಪು ಹತ್ತಿ ಮಣ್ಣು). ಹತ್ತಿ, ಸೋಯಾಬೀನ್, ಕಡಲೆ, ಜೋಳ ಮತ್ತು ಗೋಧಿಗೆ ಅತ್ಯುತ್ತಮ. ನಿಧಾನವಾಗಿ ಬಸಿಯುತ್ತದೆ — ನೀರು ನಿಲ್ಲದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.",
      ta: "நீரையும் சத்தையும் உறுதியாக தக்கவைக்கும் (கருப்பு பருத்தி மண் வகை). பருத்தி, சோயாபீன், கடலை, சோளம், கோதுமைக்கு சிறந்தது. மெதுவாக வடியும் — நீர் தேக்கத்தை கவனிக்கவும்.",
    },
  },
  sandy_clay: {
    key: "sandy_clay",
    name: {
      en: "Sandy clay",
      hi: "बलुई चिकनी",
      te: "ఇసుక బంక నేల",
      kn: "ಮರಳು ಜೇಡಿ ಮಣ್ಣು",
      ta: "மணல் களிமண்",
    },
    group: {
      en: "Heavy soil",
      hi: "भारी मिट्टी",
      te: "బరువైన నేల",
      kn: "ಭಾರವಾದ ಮಣ್ಣು",
      ta: "கனமான மண்",
    },
    suitability: {
      en: "Firm, nutrient-holding soil. Suits cotton, pulses, sorghum and wheat with careful tillage.",
      hi: "मज़बूत, पोषक रखने वाली मिट्टी। कपास, दालों, ज्वार और गेहूँ के लिए उपयुक्त।",
      te: "గట్టి, పోషకాలు నిలిపే నేల. జాగ్రత్తగా దున్నితే పత్తి, పప్పుధాన్యాలు, జొన్న, గోధుమకు అనుకూలం.",
      kn: "ಗಟ್ಟಿ, ಪೋಷಕಾಂಶ ಹಿಡಿಯುವ ಮಣ್ಣು. ಎಚ್ಚರಿಕೆಯ ಉಳುಮೆಯೊಂದಿಗೆ ಹತ್ತಿ, ದ್ವಿದಳ ಧಾನ್ಯ, ಜೋಳ ಮತ್ತು ಗೋಧಿಗೆ ಸೂಕ್ತ.",
      ta: "உறுதியான, சத்து தங்கும் மண். கவனமான உழவுடன் பருத்தி, பயறு, சோளம், கோதுமைக்கு ஏற்றது.",
    },
  },
  silty_clay: {
    key: "silty_clay",
    name: {
      en: "Silty clay",
      hi: "गादयुक्त चिकनी",
      te: "ఒండ్రు బంక నేల",
      kn: "ಹೂಳು ಜೇಡಿ ಮಣ್ಣು",
      ta: "வண்டல் களிமண்",
    },
    group: {
      en: "Heavy fertile soil",
      hi: "भारी उपजाऊ मिट्टी",
      te: "బరువైన సారవంత నేల",
      kn: "ಭಾರವಾದ ಫಲವತ್ತಾದ ಮಣ್ಣು",
      ta: "கனமான வள மண்",
    },
    suitability: {
      en: "Very fertile, moisture-holding delta-type soil. Ideal for paddy, jute, sugarcane and wheat.",
      hi: "बहुत उपजाऊ, नमीयुक्त डेल्टा-प्रकार की मिट्टी। धान, जूट, गन्ना और गेहूँ के लिए आदर्श।",
      te: "చాలా సారవంతమైన, తేమ నిలిపే డెల్టా తరహా నేల. వరి, జనపనార, చెరకు, గోధుమకు ఆదర్శం.",
      kn: "ಬಹಳ ಫಲವತ್ತಾದ, ತೇವಾಂಶ ಹಿಡಿಯುವ ಡೆಲ್ಟಾ ಮಾದರಿಯ ಮಣ್ಣು. ಭತ್ತ, ಸೆಣಬು, ಕಬ್ಬು ಮತ್ತು ಗೋಧಿಗೆ ಆದರ್ಶ.",
      ta: "மிக வளமான, ஈரம் தங்கும் டெல்டா வகை மண். நெல், சணல், கரும்பு, கோதுமைக்கு ஏற்றது.",
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
