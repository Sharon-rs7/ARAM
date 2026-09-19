import { useState } from "react";
import { ChevronDown, HelpCircle, ShieldCheck } from "lucide-react";

const faqs = [
  {
    q: "What is ARAM?",
    a: "ARAM (அறம்) is an AI-powered civic legal aid and grievance redressal platform developed for Tamil Nadu citizens. It helps people understand their statutory rights, identify competent government authorities, organize supporting evidence, and connect with accredited human legal guides in Tamil, English, and Hindi."
  },
  {
    q: "Is ARAM a replacement for a lawyer or the police?",
    a: "No. ARAM provides preliminary civic and legal triage to help citizens navigate legal procedures and organize their cases. It does not provide legal representation in court. When formal court petitions or police interventions are necessary, ARAM helps connect you to District Legal Services Authorities (DLSA), authorized legal aid cells, or official helplines (112 / 181 / 1930)."
  },
  {
    q: "Can I use ARAM in Tamil (தமிழ்)?",
    a: "Yes. ARAM has full native support for Tamil. You can speak into your microphone in Tamil, type your questions in Tamil script, and listen to spoken responses in Tamil using our integrated Read Aloud speech technology."
  },
  {
    q: "Can I use ARAM in Hindi (हिंदी)?",
    a: "Yes. In addition to Tamil and English, ARAM natively supports Hindi speech-to-text, grievance drafting, and AI assistant conversations to ensure complete accessibility for all citizens."
  },
  {
    q: "Can ARAM remember my previous case?",
    a: "Yes, for authenticated citizens. When you log in with your registered account, ARAM preserves your complaint context, past document submissions, and timeline updates so you don't have to repeat your story every time you follow up."
  },
  {
    q: "How does ARAM use and protect my complaint information?",
    a: "Your privacy is protected by zero-trust architecture. Sensitive identifiers like Aadhaar numbers, biometric data, and bank details are masked automatically. Complaint details are only accessible to you and the accredited legal guide assigned to your case."
  },
  {
    q: "Can I upload documents and evidence?",
    a: "Yes. You can upload sale deeds, partition deeds, FIR copies, receipts, photographs, and departmental notices. ARAM's Deep OCR engine inspects the document legibility, extracts key dates and reference numbers, and structures an evidence checklist."
  },
  {
    q: "How do I track my grievance status?",
    a: "You can track your case anytime using your unique tracking ID (e.g., ARAM-26-TN-CHE-000001) on the Track Complaint page. You can also download an official signed Status Summary PDF and receive automated status alerts on WhatsApp and SMS."
  },
  {
    q: "Can I talk to a human legal guide?",
    a: "Yes. When filing a complaint or during AI triage, you can request support from an accredited volunteer legal guide or paralegal. Once assigned, you can chat directly with your guide through our secure in-app messaging portal."
  },
  {
    q: "What happens if ARAM cannot verify a legal provision?",
    a: "ARAM is engineered with strict grounding guardrails. If a query falls outside verified statutes or presents high ambiguity, ARAM explicitly flags the uncertainty rather than guessing. It will guide you to consult the District Legal Services Authority (DLSA) or an empaneled advocate."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="bg-[#FFFDF8] py-16 sm:py-24 border-t border-[#E6E1D8]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-12 sm:mb-16 text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-[#1F5948] bg-[#DCEBDD] px-3.5 py-1.5 rounded-full inline-block shadow-2xs">
            Questions & Answers
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#163D32] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-[#65736D] max-w-lg mx-auto">
            Clear, authoritative answers about ARAM's capabilities, legal safeguards, and citizen privacy.
          </p>
        </div>

        {/* 10-Item FAQ Accordion List */}
        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-3xl bg-[#FAF8F2] border border-[#E6E1D8] p-5 sm:p-6 shadow-2xs transition-all duration-200 hover:border-[#163D32]/30"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full flex items-center justify-between text-left font-bold text-[#163D32] text-sm sm:text-base cursor-pointer gap-4 min-h-[44px]"
                  aria-expanded={isOpen}
                >
                  <span className="leading-snug flex items-center gap-2.5">
                    <span className="text-xs font-mono font-black text-[#12805A] shrink-0">
                      {String(idx + 1).padStart(2, "0")}.
                    </span>
                    <span>{faq.q}</span>
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 bg-[#163D32] text-white" : "bg-white text-[#65736D] border border-[#E6E1D8]"
                  }`}>
                    <ChevronDown size={15} />
                  </div>
                </button>

                {isOpen && (
                  <div className="mt-3 pt-3 border-t border-[#E6E1D8]/80 text-xs sm:text-sm text-[#4A5D54] leading-relaxed pl-7 animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default FAQ;
