import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    q: "Is ARAM a replacement for a lawyer or the police?",
    a: "No. ARAM provides preliminary civic and legal triage to help citizens understand their statutory rights, identify relevant legal codes, prepare required document checklists, and locate the correct authority (such as District Legal Services Authorities or departmental grievance cells). In active emergencies, citizens should contact 112, 181, or 1930 directly."
  },
  {
    q: "Can I speak my grievance in Tamil or Hindi?",
    a: "Yes. ARAM supports direct voice input and speech recognition in Tamil (தமிழ்), Hindi (हिंदी), and English. You can speak naturally through your microphone, inspect and edit the generated transcript, and receive guidance in your selected language."
  },
  {
    q: "How does ARAM handle AI uncertainty and avoid incorrect claims?",
    a: "ARAM is engineered to ground legal guidance strictly in verified Indian statutes, penal provisions, and official circulars. When sufficient verified statutory information is unavailable or when a case presents high complexity, ARAM explicitly flags the uncertainty and provides a direct path to human Legal Guides and DLSA representatives rather than generating unsupported claims."
  },
  {
    q: "Is my personal data and case information confidential?",
    a: "Yes. ARAM implements automated privacy protections that mask sensitive personally identifiable information (such as Aadhaar numbers and financial identifiers) from grievance narratives and uploaded evidence before analysis."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="bg-[#FFFDF8] py-16 sm:py-24 border-t border-[#E6E1D8]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-12 sm:mb-16 text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-[#1F5948] bg-[#DCEBDD] px-3.5 py-1.5 rounded-full inline-block shadow-2xs">
            Questions & Clarity
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#163D32] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-[#65736D] max-w-lg mx-auto">
            Clear, honest answers about what ARAM does, its governance, and citizen privacy.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-3xl bg-[#F7F1E6]/40 border border-[#E6E1D8] p-5 sm:p-6 shadow-2xs transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full flex items-center justify-between text-left font-bold text-[#163D32] text-sm sm:text-base cursor-pointer gap-4 min-h-[44px]"
                  aria-expanded={isOpen}
                >
                  <span className="leading-snug">{faq.q}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 bg-[#163D32] text-white" : "bg-[#FFFDF8] text-[#65736D] border border-[#E6E1D8]"
                  }`}>
                    <ChevronDown size={16} />
                  </div>
                </button>

                {isOpen && (
                  <div className="mt-3 pt-3 border-t border-[#E6E1D8]/70 text-xs sm:text-sm text-[#65736D] leading-relaxed animate-in fade-in duration-150">
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
