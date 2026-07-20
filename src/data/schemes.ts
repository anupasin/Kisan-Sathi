export type Scheme = {
  id: string;
  name: { en: string; hi: string };
  provider: { en: string; hi: string };
  tone: "loan" | "insurance" | "subsidy";
  eligibility: { en: string; hi: string };
  benefit: { en: string; hi: string };
  apply: { en: string; hi: string };
  phone?: string;
  url: string;
};

export type Agency = {
  id: string;
  name: { en: string; hi: string };
  desc: { en: string; hi: string };
  phone?: string;
  url: string;
};

// Central government farmer credit / support schemes (guidance-level summaries).
export const SCHEMES: Scheme[] = [
  {
    id: "kcc",
    name: { en: "Kisan Credit Card (KCC)", hi: "किसान क्रेडिट कार्ड (KCC)" },
    provider: { en: "All banks & co-operative societies", hi: "सभी बैंक व सहकारी समितियाँ" },
    tone: "loan",
    eligibility: {
      en: "Any farmer — owner, tenant or sharecropper — including SHG and JLG members.",
      hi: "कोई भी किसान — मालिक, किरायेदार या बटाईदार — SHG व JLG सदस्य भी।",
    },
    benefit: {
      en: "Short-term crop loans up to ₹3 lakh at ~4% effective interest (with timely repayment), plus a RuPay card.",
      hi: "₹3 लाख तक की अल्पकालिक फसल ऋण लगभग 4% ब्याज पर (समय पर चुकाने पर), साथ में RuPay कार्ड।",
    },
    apply: {
      en: "Visit any bank branch with land records, ID and photo, or apply through the PM-Kisan portal.",
      hi: "भूमि दस्तावेज़, पहचान-पत्र और फ़ोटो के साथ किसी बैंक शाखा जाएँ, या PM-Kisan पोर्टल से आवेदन करें।",
    },
    url: "https://www.myscheme.gov.in/schemes/kcc",
  },
  {
    id: "pmkisan",
    name: { en: "PM-Kisan Samman Nidhi", hi: "पीएम-किसान सम्मान निधि" },
    provider: { en: "Ministry of Agriculture", hi: "कृषि मंत्रालय" },
    tone: "subsidy",
    eligibility: {
      en: "Landholding farmer families (some income-tax payers and institutional holders excluded).",
      hi: "भूमिधारक किसान परिवार (कुछ आयकरदाता व संस्थागत धारक शामिल नहीं)।",
    },
    benefit: {
      en: "₹6,000 per year paid directly to your bank account in three instalments.",
      hi: "₹6,000 प्रति वर्ष सीधे आपके बैंक खाते में तीन किस्तों में।",
    },
    apply: {
      en: "Register at pmkisan.gov.in or your nearest Common Service Centre (CSC) with Aadhaar and land records.",
      hi: "आधार व भूमि दस्तावेज़ के साथ pmkisan.gov.in या नज़दीकी CSC पर पंजीकरण करें।",
    },
    phone: "155261",
    url: "https://pmkisan.gov.in/",
  },
  {
    id: "pmfby",
    name: { en: "Pradhan Mantri Fasal Bima Yojana", hi: "प्रधानमंत्री फसल बीमा योजना" },
    provider: { en: "Ministry of Agriculture", hi: "कृषि मंत्रालय" },
    tone: "insurance",
    eligibility: {
      en: "All farmers growing notified crops, including sharecroppers and tenant farmers.",
      hi: "अधिसूचित फसल उगाने वाले सभी किसान, बटाईदार व किरायेदार सहित।",
    },
    benefit: {
      en: "Crop insurance against natural calamity, pest and disease. Farmer pays only 2% (Kharif) / 1.5% (Rabi) of sum insured.",
      hi: "प्राकृतिक आपदा, कीट व रोग से फसल बीमा। किसान केवल 2% (खरीफ)/1.5% (रबी) प्रीमियम देता है।",
    },
    apply: {
      en: "Apply at pmfby.gov.in, your bank, or CSC before the cut-off date each season.",
      hi: "हर मौसम की अंतिम तिथि से पहले pmfby.gov.in, बैंक या CSC पर आवेदन करें।",
    },
    phone: "14447",
    url: "https://pmfby.gov.in/",
  },
  {
    id: "interest-subvention",
    name: { en: "Modified Interest Subvention Scheme", hi: "संशोधित ब्याज सहायता योजना" },
    provider: { en: "Reserve Bank of India / NABARD", hi: "भारतीय रिज़र्व बैंक / नाबार्ड" },
    tone: "loan",
    eligibility: {
      en: "Farmers with crop loans / KCC up to ₹3 lakh.",
      hi: "₹3 लाख तक की फसल ऋण / KCC वाले किसान।",
    },
    benefit: {
      en: "Interest brought down to 4% per year on prompt repayment through a 3% incentive.",
      hi: "समय पर चुकाने पर 3% छूट से ब्याज घटकर 4% प्रति वर्ष।",
    },
    apply: {
      en: "Applied automatically by your bank on eligible KCC / crop loans.",
      hi: "पात्र KCC/फसल ऋण पर आपका बैंक स्वतः लागू करता है।",
    },
    url: "https://www.nabard.org/",
  },
  {
    id: "aif",
    name: { en: "Agriculture Infrastructure Fund", hi: "कृषि अवसंरचना कोष" },
    provider: { en: "NABARD & banks", hi: "नाबार्ड व बैंक" },
    tone: "loan",
    eligibility: {
      en: "Farmers, FPOs, PACS and agri-entrepreneurs building storage, cold chains or processing units.",
      hi: "भंडारण, कोल्ड-चेन या प्रसंस्करण इकाई बनाने वाले किसान, FPO, PACS व कृषि-उद्यमी।",
    },
    benefit: {
      en: "Term loans up to ₹2 crore with 3% interest subvention for 7 years and a credit guarantee.",
      hi: "₹2 करोड़ तक की सावधि ऋण, 7 वर्षों तक 3% ब्याज छूट व ऋण गारंटी।",
    },
    apply: {
      en: "Apply on the AIF portal (agriinfra.dac.gov.in) and select a lending bank.",
      hi: "AIF पोर्टल (agriinfra.dac.gov.in) पर आवेदन करें और ऋणदाता बैंक चुनें।",
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
      name: { en: "Kisan Call Centre", hi: "किसान कॉल सेंटर" },
      desc: {
        en: "Free expert farming advice in your language, 6 am – 10 pm.",
        hi: "आपकी भाषा में मुफ़्त विशेषज्ञ खेती सलाह, सुबह 6 – रात 10 बजे।",
      },
      phone: "18001801551",
      url: "https://mkisan.gov.in/",
    },
    {
      id: "kvk",
      name: { en: "Krishi Vigyan Kendra (KVK)", hi: "कृषि विज्ञान केंद्र (KVK)" },
      desc: {
        en: "Your district farm-science centre for soil testing, training and crop advice. Find the nearest one.",
        hi: "मिट्टी जाँच, प्रशिक्षण व फसल सलाह हेतु ज़िला कृषि विज्ञान केंद्र। नज़दीकी केंद्र खोजें।",
      },
      url: "https://kvk.icar.gov.in/",
    },
    {
      id: "state-agri",
      name: {
        en: state ? `${state} Agriculture Dept.` : "State Agriculture Dept.",
        hi: state ? `${state} कृषि विभाग` : "राज्य कृषि विभाग",
      },
      desc: {
        en: "State schemes, subsidies on seeds and equipment, and local office contacts.",
        hi: "राज्य योजनाएँ, बीज व उपकरण पर सब्सिडी, और स्थानीय कार्यालय संपर्क।",
      },
      url: stateUrl,
    },
    {
      id: "soil-health",
      name: { en: "Soil Health Card portal", hi: "मृदा स्वास्थ्य कार्ड पोर्टल" },
      desc: {
        en: "Get a free soil test and nutrient recommendation for your field.",
        hi: "अपने खेत की मुफ़्त मिट्टी जाँच व पोषक सिफ़ारिश प्राप्त करें।",
      },
      url: "https://soilhealth.dac.gov.in/",
    },
    {
      id: "enam",
      name: { en: "e-NAM online market", hi: "e-NAM ऑनलाइन मंडी" },
      desc: {
        en: "Sell your produce online across India's electronic mandi network.",
        hi: "भारत के इलेक्ट्रॉनिक मंडी नेटवर्क पर अपनी उपज ऑनलाइन बेचें।",
      },
      phone: "18002700224",
      url: "https://enam.gov.in/web/",
    },
  ];
}
