import type { Localized } from "@/lib/types";

export type Scheme = {
  id: string;
  name: Localized;
  provider: Localized;
  tone: "loan" | "insurance" | "subsidy";
  eligibility: Localized;
  benefit: Localized;
  apply: Localized;
  phone?: string;
  url: string;
};

export type Agency = {
  id: string;
  name: Localized;
  desc: Localized;
  phone?: string;
  url: string;
};

// Central government farmer credit / support schemes (guidance-level summaries).
// te/kn/ta translations are plain farmer wording; flagged for native review.
export const SCHEMES: Scheme[] = [
  {
    id: "kcc",
    name: {
      en: "Kisan Credit Card (KCC)",
      hi: "किसान क्रेडिट कार्ड (KCC)",
      te: "కిసాన్ క్రెడిట్ కార్డ్ (KCC)",
      kn: "ಕಿಸಾನ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ (KCC)",
      ta: "கிசான் கடன் அட்டை (KCC)",
    },
    provider: {
      en: "All banks & co-operative societies",
      hi: "सभी बैंक व सहकारी समितियाँ",
      te: "అన్ని బ్యాంకులు & సహకార సంఘాలు",
      kn: "ಎಲ್ಲಾ ಬ್ಯಾಂಕುಗಳು ಮತ್ತು ಸಹಕಾರ ಸಂಘಗಳು",
      ta: "அனைத்து வங்கிகள் & கூட்டுறவு சங்கங்கள்",
    },
    tone: "loan",
    eligibility: {
      en: "Any farmer — owner, tenant or sharecropper — including SHG and JLG members.",
      hi: "कोई भी किसान — मालिक, किरायेदार या बटाईदार — SHG व JLG सदस्य भी।",
      te: "ఏ రైతైనా — భూ యజమాని, కౌలుదారు లేదా వాటా రైతు — SHG, JLG సభ్యులు కూడా.",
      kn: "ಯಾವುದೇ ರೈತ — ಮಾಲೀಕ, ಗೇಣಿದಾರ ಅಥವಾ ಪಾಲುದಾರ — SHG ಮತ್ತು JLG ಸದಸ್ಯರೂ ಸಹ.",
      ta: "எந்த விவசாயியும் — நில உரிமையாளர், குத்தகைதாரர் அல்லது பங்கு விவசாயி — SHG, JLG உறுப்பினர்களும் கூட.",
    },
    benefit: {
      en: "Short-term crop loans up to ₹3 lakh at ~4% effective interest (with timely repayment), plus a RuPay card.",
      hi: "₹3 लाख तक की अल्पकालिक फसल ऋण लगभग 4% ब्याज पर (समय पर चुकाने पर), साथ में RuPay कार्ड।",
      te: "సకాలంలో చెల్లిస్తే సుమారు 4% వడ్డీతో ₹3 లక్షల వరకు స్వల్పకాలిక పంట రుణాలు, RuPay కార్డుతో.",
      kn: "ಸಕಾಲದಲ್ಲಿ ಮರುಪಾವತಿಸಿದರೆ ಸುಮಾರು 4% ಬಡ್ಡಿಯಲ್ಲಿ ₹3 ಲಕ್ಷದವರೆಗೆ ಅಲ್ಪಾವಧಿ ಬೆಳೆ ಸಾಲ, ಜೊತೆಗೆ RuPay ಕಾರ್ಡ್.",
      ta: "உரிய நேரத்தில் திருப்பிச் செலுத்தினால் சுமார் 4% வட்டியில் ₹3 லட்சம் வரை குறுகிய கால பயிர்க் கடன், RuPay அட்டையுடன்.",
    },
    apply: {
      en: "Visit any bank branch with land records, ID and photo, or apply through the PM-Kisan portal.",
      hi: "भूमि दस्तावेज़, पहचान-पत्र और फ़ोटो के साथ किसी बैंक शाखा जाएँ, या PM-Kisan पोर्टल से आवेदन करें।",
      te: "భూమి పత్రాలు, గుర్తింపు కార్డు, ఫోటోతో ఏ బ్యాంకు శాఖకైనా వెళ్లండి లేదా PM-Kisan పోర్టల్ ద్వారా దరఖాస్తు చేయండి.",
      kn: "ಭೂ ದಾಖಲೆ, ಗುರುತಿನ ಚೀಟಿ ಮತ್ತು ಫೋಟೋದೊಂದಿಗೆ ಯಾವುದೇ ಬ್ಯಾಂಕ್ ಶಾಖೆಗೆ ಭೇಟಿ ನೀಡಿ ಅಥವಾ PM-Kisan ಪೋರ್ಟಲ್ ಮೂಲಕ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ.",
      ta: "நில ஆவணங்கள், அடையாள அட்டை, புகைப்படத்துடன் எந்த வங்கிக் கிளைக்கும் செல்லவும் அல்லது PM-Kisan போர்ட்டலில் விண்ணப்பிக்கவும்.",
    },
    url: "https://www.myscheme.gov.in/schemes/kcc",
  },
  {
    id: "pmkisan",
    name: {
      en: "PM-Kisan Samman Nidhi",
      hi: "पीएम-किसान सम्मान निधि",
      te: "పీఎం-కిసాన్ సమ్మాన్ నిధి",
      kn: "ಪಿಎಂ-ಕಿಸಾನ್ ಸಮ್ಮಾನ್ ನಿಧಿ",
      ta: "பிஎம்-கிசான் சம்மான் நிதி",
    },
    provider: {
      en: "Ministry of Agriculture",
      hi: "कृषि मंत्रालय",
      te: "వ్యవసాయ మంత్రిత్వ శాఖ",
      kn: "ಕೃಷಿ ಸಚಿವಾಲಯ",
      ta: "வேளாண் அமைச்சகம்",
    },
    tone: "subsidy",
    eligibility: {
      en: "Landholding farmer families (some income-tax payers and institutional holders excluded).",
      hi: "भूमिधारक किसान परिवार (कुछ आयकरदाता व संस्थागत धारक शामिल नहीं)।",
      te: "భూమి ఉన్న రైతు కుటుంబాలు (కొందరు ఆదాయపు పన్ను చెల్లింపుదారులు, సంస్థాగత భూదారులు మినహా).",
      kn: "ಭೂ ಹಿಡುವಳಿ ರೈತ ಕುಟುಂಬಗಳು (ಕೆಲ ಆದಾಯ ತೆರಿಗೆದಾರರು ಮತ್ತು ಸಾಂಸ್ಥಿಕ ಹಿಡುವಳಿದಾರರು ಹೊರತು).",
      ta: "நிலம் வைத்திருக்கும் விவசாயக் குடும்பங்கள் (சில வருமான வரி செலுத்துவோர், நிறுவன நில உரிமையாளர்கள் நீங்கலாக).",
    },
    benefit: {
      en: "₹6,000 per year paid directly to your bank account in three instalments.",
      hi: "₹6,000 प्रति वर्ष सीधे आपके बैंक खाते में तीन किस्तों में।",
      te: "ఏడాదికి ₹6,000 మూడు విడతలుగా నేరుగా మీ బ్యాంకు ఖాతాలో జమ.",
      kn: "ವರ್ಷಕ್ಕೆ ₹6,000 ಮೂರು ಕಂತುಗಳಲ್ಲಿ ನೇರವಾಗಿ ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ.",
      ta: "ஆண்டுக்கு ₹6,000 மூன்று தவணைகளாக நேரடியாக உங்கள் வங்கிக் கணக்கில்.",
    },
    apply: {
      en: "Register at pmkisan.gov.in or your nearest Common Service Centre (CSC) with Aadhaar and land records.",
      hi: "आधार व भूमि दस्तावेज़ के साथ pmkisan.gov.in या नज़दीकी CSC पर पंजीकरण करें।",
      te: "ఆధార్, భూమి పత్రాలతో pmkisan.gov.in లో లేదా దగ్గరి CSC కేంద్రంలో నమోదు చేసుకోండి.",
      kn: "ಆಧಾರ್ ಮತ್ತು ಭೂ ದಾಖಲೆಗಳೊಂದಿಗೆ pmkisan.gov.in ಅಥವಾ ಹತ್ತಿರದ CSC ಕೇಂದ್ರದಲ್ಲಿ ನೋಂದಾಯಿಸಿ.",
      ta: "ஆதார், நில ஆவணங்களுடன் pmkisan.gov.in இல் அல்லது அருகிலுள்ள CSC மையத்தில் பதிவு செய்யவும்.",
    },
    phone: "155261",
    url: "https://pmkisan.gov.in/",
  },
  {
    id: "pmfby",
    name: {
      en: "Pradhan Mantri Fasal Bima Yojana",
      hi: "प्रधानमंत्री फसल बीमा योजना",
      te: "ప్రధాన మంత్రి ఫసల్ బీమా యోజన",
      kn: "ಪ್ರಧಾನ ಮಂತ್ರಿ ಫಸಲ್ ಬಿಮಾ ಯೋಜನೆ",
      ta: "பிரதம மந்திரி பயிர் காப்பீட்டுத் திட்டம்",
    },
    provider: {
      en: "Ministry of Agriculture",
      hi: "कृषि मंत्रालय",
      te: "వ్యవసాయ మంత్రిత్వ శాఖ",
      kn: "ಕೃಷಿ ಸಚಿವಾಲಯ",
      ta: "வேளாண் அமைச்சகம்",
    },
    tone: "insurance",
    eligibility: {
      en: "All farmers growing notified crops, including sharecroppers and tenant farmers.",
      hi: "अधिसूचित फसल उगाने वाले सभी किसान, बटाईदार व किरायेदार सहित।",
      te: "నోటిఫై చేసిన పంటలు సాగు చేసే రైతులందరూ, కౌలుదారులు, వాటా రైతులు సహా.",
      kn: "ಅಧಿಸೂಚಿತ ಬೆಳೆ ಬೆಳೆಯುವ ಎಲ್ಲಾ ರೈತರು, ಗೇಣಿದಾರರು ಮತ್ತು ಪಾಲುದಾರರು ಸೇರಿ.",
      ta: "அறிவிக்கப்பட்ட பயிர்களை பயிரிடும் அனைத்து விவசாயிகளும், குத்தகை மற்றும் பங்கு விவசாயிகள் உட்பட.",
    },
    benefit: {
      en: "Crop insurance against natural calamity, pest and disease. Farmer pays only 2% (Kharif) / 1.5% (Rabi) of sum insured.",
      hi: "प्राकृतिक आपदा, कीट व रोग से फसल बीमा। किसान केवल 2% (खरीफ)/1.5% (रबी) प्रीमियम देता है।",
      te: "ప్రకృతి వైపరీత్యం, పురుగు, రోగాల నుంచి పంట బీమా. రైతు బీమా మొత్తంలో 2% (ఖరీఫ్) / 1.5% (రబీ) మాత్రమే చెల్లిస్తారు.",
      kn: "ಪ್ರಕೃತಿ ವಿಕೋಪ, ಕೀಟ ಮತ್ತು ರೋಗದಿಂದ ಬೆಳೆ ವಿಮೆ. ರೈತರು ವಿಮಾ ಮೊತ್ತದ 2% (ಖಾರಿಫ್) / 1.5% (ರಬಿ) ಮಾತ್ರ ಪಾವತಿಸುತ್ತಾರೆ.",
      ta: "இயற்கை பேரிடர், பூச்சி, நோயிலிருந்து பயிர் காப்பீடு. விவசாயி காப்பீட்டுத் தொகையில் 2% (காரீஃப்) / 1.5% (ரபி) மட்டுமே செலுத்த வேண்டும்.",
    },
    apply: {
      en: "Apply at pmfby.gov.in, your bank, or CSC before the cut-off date each season.",
      hi: "हर मौसम की अंतिम तिथि से पहले pmfby.gov.in, बैंक या CSC पर आवेदन करें।",
      te: "ప్రతి సీజన్ గడువు తేదీలోపు pmfby.gov.in, మీ బ్యాంకు లేదా CSC లో దరఖాస్తు చేయండి.",
      kn: "ಪ್ರತಿ ಋತುವಿನ ಕೊನೆಯ ದಿನಾಂಕದೊಳಗೆ pmfby.gov.in, ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಅಥವಾ CSC ನಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ.",
      ta: "ஒவ்வொரு பருவத்தின் இறுதி தேதிக்குள் pmfby.gov.in, உங்கள் வங்கி அல்லது CSC இல் விண்ணப்பிக்கவும்.",
    },
    phone: "14447",
    url: "https://pmfby.gov.in/",
  },
  {
    id: "interest-subvention",
    name: {
      en: "Modified Interest Subvention Scheme",
      hi: "संशोधित ब्याज सहायता योजना",
      te: "సవరించిన వడ్డీ రాయితీ పథకం",
      kn: "ಪರಿಷ್ಕೃತ ಬಡ್ಡಿ ಸಹಾಯಧನ ಯೋಜನೆ",
      ta: "திருத்திய வட்டி மானியத் திட்டம்",
    },
    provider: {
      en: "Reserve Bank of India / NABARD",
      hi: "भारतीय रिज़र्व बैंक / नाबार्ड",
      te: "భారతీయ రిజర్వ్ బ్యాంక్ / నాబార్డ్",
      kn: "ಭಾರತೀಯ ರಿಸರ್ವ್ ಬ್ಯಾಂಕ್ / ನಬಾರ್ಡ್",
      ta: "இந்திய ரிசர்வ் வங்கி / நபார்டு",
    },
    tone: "loan",
    eligibility: {
      en: "Farmers with crop loans / KCC up to ₹3 lakh.",
      hi: "₹3 लाख तक की फसल ऋण / KCC वाले किसान।",
      te: "₹3 లక్షల వరకు పంట రుణం / KCC ఉన్న రైతులు.",
      kn: "₹3 ಲಕ್ಷದವರೆಗೆ ಬೆಳೆ ಸಾಲ / KCC ಇರುವ ರೈತರು.",
      ta: "₹3 லட்சம் வரை பயிர்க் கடன் / KCC உள்ள விவசாயிகள்.",
    },
    benefit: {
      en: "Interest brought down to 4% per year on prompt repayment through a 3% incentive.",
      hi: "समय पर चुकाने पर 3% छूट से ब्याज घटकर 4% प्रति वर्ष।",
      te: "సకాలంలో చెల్లిస్తే 3% ప్రోత్సాహకంతో వడ్డీ ఏడాదికి 4%కి తగ్గుతుంది.",
      kn: "ಸಕಾಲದ ಮರುಪಾವತಿಗೆ 3% ಪ್ರೋತ್ಸಾಹದೊಂದಿಗೆ ಬಡ್ಡಿ ವರ್ಷಕ್ಕೆ 4%ಕ್ಕೆ ಇಳಿಯುತ್ತದೆ.",
      ta: "உரிய நேர திருப்பிச் செலுத்தலுக்கு 3% ஊக்கத்தொகையால் வட்டி ஆண்டுக்கு 4% ஆகக் குறையும்.",
    },
    apply: {
      en: "Applied automatically by your bank on eligible KCC / crop loans.",
      hi: "पात्र KCC/फसल ऋण पर आपका बैंक स्वतः लागू करता है।",
      te: "అర్హత గల KCC/పంట రుణాలపై మీ బ్యాంకు దీన్ని ఆటోమేటిక్‌గా వర్తింపజేస్తుంది.",
      kn: "ಅರ್ಹ KCC/ಬೆಳೆ ಸಾಲಗಳ ಮೇಲೆ ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಅನ್ವಯಿಸುತ್ತದೆ.",
      ta: "தகுதியுள்ள KCC/பயிர்க் கடன்களில் உங்கள் வங்கி தானாகப் பொருத்தும்.",
    },
    url: "https://www.nabard.org/",
  },
  {
    id: "aif",
    name: {
      en: "Agriculture Infrastructure Fund",
      hi: "कृषि अवसंरचना कोष",
      te: "వ్యవసాయ మౌలిక సదుపాయాల నిధి",
      kn: "ಕೃಷಿ ಮೂಲಸೌಕರ್ಯ ನಿಧಿ",
      ta: "வேளாண் உள்கட்டமைப்பு நிதி",
    },
    provider: {
      en: "NABARD & banks",
      hi: "नाबार्ड व बैंक",
      te: "నాబార్డ్ & బ్యాంకులు",
      kn: "ನಬಾರ್ಡ್ ಮತ್ತು ಬ್ಯಾಂಕುಗಳು",
      ta: "நபார்டு & வங்கிகள்",
    },
    tone: "loan",
    eligibility: {
      en: "Farmers, FPOs, PACS and agri-entrepreneurs building storage, cold chains or processing units.",
      hi: "भंडारण, कोल्ड-चेन या प्रसंस्करण इकाई बनाने वाले किसान, FPO, PACS व कृषि-उद्यमी।",
      te: "నిల్వ, కోల్డ్ చైన్ లేదా ప్రాసెసింగ్ యూనిట్లు నిర్మించే రైతులు, FPOలు, PACS, వ్యవసాయ పారిశ్రామికవేత్తలు.",
      kn: "ದಾಸ್ತಾನು, ಕೋಲ್ಡ್ ಚೈನ್ ಅಥವಾ ಸಂಸ್ಕರಣಾ ಘಟಕ ನಿರ್ಮಿಸುವ ರೈತರು, FPO, PACS ಮತ್ತು ಕೃಷಿ ಉದ್ಯಮಿಗಳು.",
      ta: "சேமிப்பு, குளிர்சங்கிலி அல்லது பதப்படுத்தும் அலகுகள் அமைக்கும் விவசாயிகள், FPO, PACS மற்றும் வேளாண் தொழில்முனைவோர்.",
    },
    benefit: {
      en: "Term loans up to ₹2 crore with 3% interest subvention for 7 years and a credit guarantee.",
      hi: "₹2 करोड़ तक की सावधि ऋण, 7 वर्षों तक 3% ब्याज छूट व ऋण गारंटी।",
      te: "₹2 కోట్ల వరకు టర్మ్ లోన్, 7 ఏళ్లపాటు 3% వడ్డీ రాయితీ, రుణ హామీ.",
      kn: "₹2 ಕೋಟಿವರೆಗೆ ಅವಧಿ ಸಾಲ, 7 ವರ್ಷ 3% ಬಡ್ಡಿ ಸಹಾಯಧನ ಮತ್ತು ಸಾಲ ಖಾತರಿ.",
      ta: "₹2 கோடி வரை காலக் கடன், 7 ஆண்டுகளுக்கு 3% வட்டி மானியம், கடன் உத்தரவாதம்.",
    },
    apply: {
      en: "Apply on the AIF portal (agriinfra.dac.gov.in) and select a lending bank.",
      hi: "AIF पोर्टल (agriinfra.dac.gov.in) पर आवेदन करें और ऋणदाता बैंक चुनें।",
      te: "AIF పోర్టల్ (agriinfra.dac.gov.in) లో దరఖాస్తు చేసి, రుణ బ్యాంకు ఎంచుకోండి.",
      kn: "AIF ಪೋರ್ಟಲ್ (agriinfra.dac.gov.in) ನಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ ಸಾಲ ನೀಡುವ ಬ್ಯಾಂಕ್ ಆಯ್ಕೆಮಾಡಿ.",
      ta: "AIF போர்ட்டலில் (agriinfra.dac.gov.in) விண்ணப்பித்து கடன் வங்கியைத் தேர்ந்தெடுக்கவும்.",
    },
    url: "https://agriinfra.dac.gov.in/",
  },
];

// State agriculture department portals for the deep-link on the agency card.
const STATE_AGRI_PORTALS: Record<string, string> = {
  punjab: "https://agri.punjab.gov.in/",
  haryana: "https://agriharyana.gov.in/",
  "uttar pradesh": "http://upagripardarshi.gov.in/",
  bihar: "https://state.bihar.gov.in/krishi/",
  rajasthan: "https://agriculture.rajasthan.gov.in/",
  "madhya pradesh": "https://mpkrishi.mp.gov.in/",
  maharashtra: "https://krishi.maharashtra.gov.in/",
  gujarat: "https://dag.gujarat.gov.in/",
  karnataka: "https://raitamitra.karnataka.gov.in/",
  "tamil nadu": "https://www.tnagrisnet.tn.gov.in/",
  "andhra pradesh": "https://apagrisnet.gov.in/",
  telangana: "https://agri.telangana.gov.in/",
  "west bengal": "https://matirkatha.net/",
  kerala: "https://www.keralaagriculture.gov.in/",
  odisha: "https://agri.odisha.gov.in/",
  jharkhand: "https://www.jharkhand.gov.in/agriculture",
  chhattisgarh: "https://agriportal.cg.nic.in/",
  assam: "https://diragri.assam.gov.in/",
  uttarakhand: "https://agriculture.uk.gov.in/",
  "himachal pradesh": "https://hpagrisnet.gov.in/",
};

function normState(s?: string | null) {
  return (s ?? "").toLowerCase().replace(/[^a-z ]/g, "").trim();
}

/** Location-aware agency directory (national services + state deep-links). */
export function agenciesForLocation(state?: string | null): Agency[] {
  const key = normState(state);
  const stateUrl =
    (key
      ? Object.entries(STATE_AGRI_PORTALS).find(
          ([k]) => key.includes(k) || k.includes(key),
        )?.[1]
      : undefined) ?? "https://agricoop.gov.in/";

  return [
    {
      id: "kcc-helpline",
      name: {
        en: "Kisan Call Centre",
        hi: "किसान कॉल सेंटर",
        te: "కిసాన్ కాల్ సెంటర్",
        kn: "ಕಿಸಾನ್ ಕಾಲ್ ಸೆಂಟರ್",
        ta: "கிசான் கால் சென்டர்",
      },
      desc: {
        en: "Free expert farming advice in your language, 6 am – 10 pm.",
        hi: "आपकी भाषा में मुफ़्त विशेषज्ञ खेती सलाह, सुबह 6 – रात 10 बजे।",
        te: "మీ భాషలో ఉచిత నిపుణుల వ్యవసాయ సలహా, ఉదయం 6 – రాత్రి 10.",
        kn: "ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಉಚಿತ ತಜ್ಞರ ಕೃಷಿ ಸಲಹೆ, ಬೆಳಿಗ್ಗೆ 6 – ರಾತ್ರಿ 10.",
        ta: "உங்கள் மொழியில் இலவச நிபுணர் விவசாய ஆலோசனை, காலை 6 – இரவு 10.",
      },
      phone: "18001801551",
      url: "https://mkisan.gov.in/",
    },
    {
      id: "kvk",
      name: {
        en: "Krishi Vigyan Kendra (KVK)",
        hi: "कृषि विज्ञान केंद्र (KVK)",
        te: "కృషి విజ్ఞాన కేంద్రం (KVK)",
        kn: "ಕೃಷಿ ವಿಜ್ಞಾನ ಕೇಂದ್ರ (KVK)",
        ta: "வேளாண் அறிவியல் மையம் (KVK)",
      },
      desc: {
        en: "Your district farm-science centre for soil testing, training and crop advice. Find the nearest one.",
        hi: "मिट्टी जाँच, प्रशिक्षण व फसल सलाह हेतु ज़िला कृषि विज्ञान केंद्र। नज़दीकी केंद्र खोजें।",
        te: "నేల పరీక్ష, శిక్షణ, పంట సలహాల కోసం మీ జిల్లా వ్యవసాయ విజ్ఞాన కేంద్రం. దగ్గరి కేంద్రాన్ని కనుగొనండి.",
        kn: "ಮಣ್ಣು ಪರೀಕ್ಷೆ, ತರಬೇತಿ ಮತ್ತು ಬೆಳೆ ಸಲಹೆಗಾಗಿ ನಿಮ್ಮ ಜಿಲ್ಲೆಯ ಕೃಷಿ ವಿಜ್ಞಾನ ಕೇಂದ್ರ. ಹತ್ತಿರದ ಕೇಂದ್ರ ಹುಡುಕಿ.",
        ta: "மண் பரிசோதனை, பயிற்சி, பயிர் ஆலோசனைக்கான உங்கள் மாவட்ட வேளாண் அறிவியல் மையம். அருகிலுள்ளதைக் கண்டறியவும்.",
      },
      url: "https://kvk.icar.gov.in/",
    },
    {
      id: "state-agri",
      name: {
        en: state ? `${state} Agriculture Dept.` : "State Agriculture Dept.",
        hi: state ? `${state} कृषि विभाग` : "राज्य कृषि विभाग",
        te: state ? `${state} వ్యవసాయ శాఖ` : "రాష్ట్ర వ్యవసాయ శాఖ",
        kn: state ? `${state} ಕೃಷಿ ಇಲಾಖೆ` : "ರಾಜ್ಯ ಕೃಷಿ ಇಲಾಖೆ",
        ta: state ? `${state} வேளாண்மைத் துறை` : "மாநில வேளாண்மைத் துறை",
      },
      desc: {
        en: "State schemes, subsidies on seeds and equipment, and local office contacts.",
        hi: "राज्य योजनाएँ, बीज व उपकरण पर सब्सिडी, और स्थानीय कार्यालय संपर्क।",
        te: "రాష్ట్ర పథకాలు, విత్తనాలు, పరికరాలపై సబ్సిడీ, స్థానిక కార్యాలయ సంప్రదింపులు.",
        kn: "ರಾಜ್ಯ ಯೋಜನೆಗಳು, ಬೀಜ ಮತ್ತು ಉಪಕರಣ ಸಬ್ಸಿಡಿ, ಸ್ಥಳೀಯ ಕಚೇರಿ ಸಂಪರ್ಕಗಳು.",
        ta: "மாநிலத் திட்டங்கள், விதை மற்றும் கருவிகளுக்கான மானியம், உள்ளூர் அலுவலகத் தொடர்புகள்.",
      },
      url: stateUrl,
    },
    {
      id: "soil-health",
      name: {
        en: "Soil Health Card portal",
        hi: "मृदा स्वास्थ्य कार्ड पोर्टल",
        te: "భూసార (సాయిల్ హెల్త్) కార్డ్ పోర్టల్",
        kn: "ಮಣ್ಣು ಆರೋಗ್ಯ ಕಾರ್ಡ್ ಪೋರ್ಟಲ್",
        ta: "மண் வள அட்டை போர்ட்டல்",
      },
      desc: {
        en: "Get a free soil test and nutrient recommendation for your field.",
        hi: "अपने खेत की मुफ़्त मिट्टी जाँच व पोषक सिफ़ारिश प्राप्त करें।",
        te: "మీ పొలానికి ఉచిత నేల పరీక్ష, పోషక సిఫార్సు పొందండి.",
        kn: "ನಿಮ್ಮ ಹೊಲಕ್ಕೆ ಉಚಿತ ಮಣ್ಣು ಪರೀಕ್ಷೆ ಮತ್ತು ಪೋಷಕಾಂಶ ಶಿಫಾರಸು ಪಡೆಯಿರಿ.",
        ta: "உங்கள் வயலுக்கு இலவச மண் பரிசோதனை மற்றும் ஊட்டச்சத்து பரிந்துரை பெறவும்.",
      },
      url: "https://soilhealth.dac.gov.in/",
    },
    {
      id: "enam",
      name: {
        en: "e-NAM online market",
        hi: "e-NAM ऑनलाइन मंडी",
        te: "e-NAM ఆన్‌లైన్ మార్కెట్",
        kn: "e-NAM ಆನ್‌ಲೈನ್ ಮಾರುಕಟ್ಟೆ",
        ta: "e-NAM இணைய சந்தை",
      },
      desc: {
        en: "Sell your produce online across India's electronic mandi network.",
        hi: "भारत के इलेक्ट्रॉनिक मंडी नेटवर्क पर अपनी उपज ऑनलाइन बेचें।",
        te: "భారతదేశ ఎలక్ట్రానిక్ మండి నెట్‌వర్క్‌లో మీ ఉత్పత్తులను ఆన్‌లైన్‌లో అమ్మండి.",
        kn: "ಭಾರತದ ಎಲೆಕ್ಟ್ರಾನಿಕ್ ಮಂಡಿ ಜಾಲದಲ್ಲಿ ನಿಮ್ಮ ಉತ್ಪನ್ನ ಆನ್‌ಲೈನ್ ಮಾರಾಟ ಮಾಡಿ.",
        ta: "இந்தியாவின் மின்னணு மண்டி வலையமைப்பில் உங்கள் விளைபொருட்களை ஆன்லைனில் விற்கவும்.",
      },
      phone: "18002700224",
      url: "https://enam.gov.in/web/",
    },
  ];
}
