import { SupportedLanguage, SupportedLanguageCode } from "./types";

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: "hi-IN", name: "Hindi", nativeName: "हिन्दी" },
  { code: "en-IN", name: "Indian English", nativeName: "English (India)" },
  { code: "mr-IN", name: "Marathi", nativeName: "मराठी" },
  { code: "ta-IN", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te-IN", name: "Telugu", nativeName: "తెలుగు" },
  { code: "bn-IN", name: "Bengali", nativeName: "বাংলা" },
  { code: "gu-IN", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "kn-IN", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ml-IN", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "pa-IN", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "od-IN", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
  { code: "unknown", name: "Auto Detect", nativeName: "Auto / Indic" },
];

export interface BusinessProblemExample {
  id: string;
  category: string;
  title: string;
  tagline: string;
  language: SupportedLanguageCode;
  text: string;
}

export const BUSINESS_PROBLEMS: BusinessProblemExample[] = [
  {
    id: "appointments",
    category: "Manage customers and appointments",
    title: "Clinic & OPD Consultation Scheduler",
    tagline: "Slot booking, WhatsApp reminders & receptionist patient check-in",
    language: "en-IN",
    text: "I want to build an appointment and queue management system for a small clinic. Patients should book appointments, receive reminders, and see their estimated waiting time. Clinic staff should manage appointments and mark patients as arrived.",
  },
  {
    id: "queues",
    category: "Reduce queues and waiting times",
    title: "Walk-in Token & Live Queue Tracker",
    tagline: "Digital token counter, SMS tracking link & dynamic wait estimation",
    language: "en-IN",
    text: "A digital token and queue management system for busy physical service centers and diagnostic labs. Walk-in visitors get a physical or digital SMS token. Patients can check live queue progress on their smartphone so they do not have to crowd the waiting room, and staff can call the next token with one click.",
  },
  {
    id: "inventory",
    category: "Track inventory and prevent stockouts",
    title: "किराना दुकान इन्वेंट्री एवं स्टॉक रीऑर्डर (Kirana Stock)",
    tagline: "दैनिक बिक्री, न्यूनतम स्टॉक अलर्ट और थोक डिस्ट्रीब्यूटर ऑर्डर सूची",
    language: "hi-IN",
    text: "स्थानीय किराना एवं जनरल स्टोर के लिए एक सहज इन्वेंट्री ट्रैकिंग ऐप। दुकानदार बारकोड या नाम से बिक्री दर्ज करें, जब कोई सामान न्यूनतम स्टॉक स्तर (Reorder Point) से नीचे पहुंचे तो स्वचालित अलर्ट मिले, और व्हाट्सएप पर डिस्ट्रीब्यूटर को भेजने के लिए थोक ऑर्डर सूची तैयार हो।",
  },
  {
    id: "deliveries",
    category: "Organise local deliveries",
    title: "Hyperlocal Dairy & Morning Milk Supply",
    tagline: "Recurring subscriptions, 10 PM cut-off, vacation pause & UPI billing",
    language: "en-IN",
    text: "A subscription-based morning milk and dairy delivery app for residential societies. Customers can modify quantities by 10 PM, pause subscriptions during vacations, and pay monthly bills via UPI. Delivery boys get an optimized delivery route sheet on their phones.",
  },
  {
    id: "billing",
    category: "Improve billing and payment tracking",
    title: "थोक व्यापारी खाता एवं बकाया वसूली (Vyapar Khata)",
    tagline: "उधार खाता, जीएसटी चालान और स्वतः व्हाट्सएप पेमेंट लिंक रिमाइंडर",
    language: "hi-IN",
    text: "थोक और खुदरा व्यापारियों के लिए डिजिटल बहीखाता (Khata) और पेमेंट रिकवरी सिस्टम। खरीदारों का क्रेडिट लेजर, इनवॉइस जनरेशन, 15/30 दिनों की पेमेंट ड्यू डेट और यूपीआई पेमेंट लिंक के साथ स्वचालित व्हाट्सएप रिमाइंडर जिससे फंसी हुई उधारी समय पर मिल सके।",
  },
  {
    id: "product_launch",
    category: "Launch a new product or service",
    title: "Artisanal D2C Regional Food & Pre-Orders",
    tagline: "Weekly batch pre-orders, pincode serviceability check & packaging tally",
    language: "en-IN",
    text: "A direct-to-consumer pre-order and batch fulfillment platform for handcrafted regional sweets and snack makers. Customers can view upcoming weekend batch slots, place advance paid orders via UPI, check pincode delivery serviceability, and receive courier tracking alerts.",
  },
];

// Preserved for backward compatibility and test suites
export const SAMPLE_IDEAS = BUSINESS_PROBLEMS.map((p) => ({
  title: p.title,
  language: p.language,
  text: p.text,
}));

export const DEFAULT_SAMPLE_IDEA = SAMPLE_IDEAS[0].text;
