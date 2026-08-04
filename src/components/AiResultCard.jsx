import React from 'react';
import { Volume2, CheckCircle2, FileText, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import ReadAloudButton from '@/components/voice/ReadAloudButton';

// Multilingual Fallback Map for Frontend Localization
const CATEGORY_MAP = {
  "LABOUR_DISPUTE": { en: "Labour & Salary Issue", ta: "சம்பளம் மற்றும் வேலை தொடர்பான பிரச்சனை", "ta-en": "Sambalam matrum velai prachanai" },
  "WOMEN_SAFETY_DOMESTIC_VIOLENCE": { en: "Personal Safety Concern", ta: "தனிப்பட்ட பாதுகாப்பு பிரச்சனை", "ta-en": "Thanippatta paadhukaappu prachanai" },
  "CYBER_CRIME": { en: "Cyber Fraud & Bank Scam", ta: "சைபர் ஏமாற்று மற்றும் வங்கி மோசடி", "ta-en": "Cyber eamaatru matrum bank scam" },
  "CONSUMER_COMPLAINT": { en: "Consumer Product Dispute", ta: "நுகர்வோர் பொருள் பிரச்சனை", "ta-en": "Nugarvoor porul prachanai" },
  "PROPERTY_DISPUTE": { en: "Property & Land Dispute", ta: "நிலம் மற்றும் சொத்து பிரச்சனை", "ta-en": "Nilam matrum sothu prachanai" },
  "GOVERNMENT_SCHEME": { en: "Government Scheme Issue", ta: "அரசு திட்டம் மற்றும் ஓய்வூதிய பிரச்சனை", "ta-en": "Arasu thittam prachanai" }
};

const PRIORITY_MAP = {
  "CRITICAL": { en: "Urgent Action Needed", ta: "உடனடி அவசர நடவடிக்கை தேவை", "ta-en": "Udanadi avasara nadavadikkai thevai" },
  "HIGH": { en: "Urgent Priority", ta: "அவசர நடவடிக்கை தேவை", "ta-en": "Avasara nadavadikkai thevai" },
  "MEDIUM": { en: "Standard Review", ta: "இயல்பான பரிசீலனை", "ta-en": "Iyalbaana pariseelanai" },
  "LOW": { en: "Standard Guidance", ta: "பொது வழிகாட்டுதல்", "ta-en": "Podhu vazhikaattudhal" }
};

export default function AiResultCard({ result }) {
  if (!result) return null;

  const lang = (result.responseLanguage || result.detectedLanguage || "en").toLowerCase();
  const isTamil = lang.includes("ta");
  const isTanglish = lang.includes("ta-en");

  const catObj = CATEGORY_MAP[result.category] || {};
  const localizedCat = catObj[lang] || catObj["en"] || result.category?.replace(/_/g, ' ') || "Legal Grievance";

  const prioObj = PRIORITY_MAP[result.priority] || {};
  const localizedPrio = prioObj[lang] || prioObj["en"] || result.priority || "Standard Review";

  // Element 1: Plain Headline (Single sentence category + urgency)
  const headline = result.headline || (
    isTamil
      ? `இது ${localizedCat}, இதற்கு ${localizedPrio}.`
      : isTanglish
      ? `Idhu ${localizedCat}, idhukku ${localizedPrio}.`
      : `This is a ${localizedCat} requiring ${localizedPrio}.`
  );

  // Element 2: Plain Summary (1-2 sentences max, zero ML jargon)
  const plainSummary = result.plainSummary || (
    isTamil
      ? `உங்கள் புகார் தொடர்பான விவரங்கள் பெறப்பட்டுள்ளன. ${result.recommendedAuthority || 'மாவட்ட சட்ட உதவி மையம்'} மூலம் உங்களுக்கு இலவச சட்ட வழிகாட்டல் வழங்கப்படும்.`
      : isTanglish
      ? `Unga complaint details padhivu seyyappattudhu. ${result.recommendedAuthority || 'District Legal Aid Cell'} moolam ungalukku free legal guidance vazhangappadum.`
      : `We understood your grievance details. Your file has been registered with ${result.recommendedAuthority || 'the District Legal Aid Cell'} for free legal guidance.`
  );

  // Element 3: Prominent Suggested Next Steps (Hero Section)
  const nextSteps = result.nextSteps && result.nextSteps.length > 0 ? result.nextSteps : [
    isTamil ? "உங்கள் அடையாள சான்று அல்லது ஆவணத்தை தயார் நிலையில் வைக்கவும்." : "Keep your identity proof or related documents ready.",
    isTamil ? "சட்ட வழிகாட்டி உங்கள் புகாரை பரிசீலித்து தொடர்பு கொள்வார்." : "A verified legal guide will review your file and contact you.",
    isTamil ? "உங்கள் ஏஆர்ஏஎம் குறிப்பு எண்ணை கொண்டு நிலையைக் கண்காணிக்கலாம்." : "Track updates anytime using your ARAM Reference ID."
  ];

  // Element 4: Minimal Required Documents
  const docs = result.requiredDocuments || [];

  const textToRead = `${headline}. ${plainSummary}. Next steps: ${nextSteps.join('. ')}`;

  return (
    <div className="rounded-3xl bg-white border border-slate-200 p-6 lg:p-8 shadow-xl space-y-6 max-w-2xl mx-auto my-6 animate-in fade-in">
      
      {/* Element 5 (Top Level): Voice Read Aloud Playback */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck size={24} className="text-purple-600" />
          <span className="text-xs font-black uppercase tracking-widest text-slate-800">
            {isTamil ? "புகார் பகுப்பாய்வு முடிவு" : "Grievance Guidance Summary"}
          </span>
        </div>
        <ReadAloudButton text={textToRead} language={lang} />
      </div>

      {/* Element 1: Plain Headline (Category + Urgency in 1 sentence) */}
      <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950 space-y-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full inline-block mb-1">
          {localizedPrio}
        </span>
        <h2 className="text-lg sm:text-xl font-extrabold text-purple-900 leading-snug">
          {headline}
        </h2>
      </div>

      {/* Element 2: Plain Summary (1-2 sentences max, no jargon) */}
      <div className="space-y-1">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {isTamil ? "சுருக்கம்" : "Summary"}
        </h4>
        <p className="text-sm text-slate-700 leading-relaxed font-medium">
          {plainSummary}
        </p>
      </div>

      {/* Element 3: What Happens Next — Prominent Numbered Steps (HERO FOCUS) */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 shadow-xl border border-slate-800">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <span className="text-base">🚀</span>
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-purple-300">
            {isTamil ? "அடுத்த கட்ட நடவடிக்கைகள் (Next Steps)" : "What Happens Next — Simple Steps"}
          </h3>
        </div>
        
        <div className="space-y-3">
          {nextSteps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white text-xs font-black shadow-sm">
                {idx + 1}
              </span>
              <p className="text-xs sm:text-sm font-medium text-slate-200 leading-relaxed mt-0.5">
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Element 4: Minimal Required Documents */}
      {docs && docs.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-slate-700 font-bold">
            <FileText size={16} className="text-purple-600" />
            <span>{isTamil ? "தேவையான ஆவணங்கள் (Optional)" : "Documents You May Need"}</span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {docs.map((doc, idx) => (
              <li key={idx} className="flex items-center gap-2 text-slate-600 bg-white p-2 rounded-xl border border-slate-200 font-medium">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span>{doc}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
