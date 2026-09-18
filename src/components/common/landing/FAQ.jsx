import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Is ARAM a replacement for a lawyer or the police?",
    a: "No. ARAM provides preliminary civic and legal assistance, explains applicable laws, required documents, and identifies the correct authority (e.g., District Legal Services Authority, Labour Officer, Police Cell). In emergencies, please contact 112, 181, or 1930 directly."
  },
  {
    q: "Can I speak my grievance in Tamil or Hindi?",
    a: "Yes. ARAM features native voice support for Tamil (தமிழ்), Hindi (हिंदी), and English voice inputs directly from your microphone."
  },
  {
    q: "How does ARAM prevent AI hallucinations?",
    a: "ARAM implements a strict Grounding Validator that audits every cited Section and statutory Act against 1,306 verified legal chunks. If a provision cannot be proven, ARAM strips the claim or escalates to human legal aid review."
  },
  {
    q: "Is my personal data and identity confidential?",
    a: "Yes. All uploaded documents and statements are sanitized with automated PII masking, redacting Aadhaar numbers, phone numbers, and financial details."
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="bg-[#F7F1E6] py-24 border-t border-[#E6E1D8]">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-14 text-center">
          <span className="text-xs font-black uppercase tracking-widest text-[#1F5948] bg-[#DCEBDD] px-3.5 py-1.5 rounded-full inline-block mb-3">
            Questions & Clarity
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[#163D32] tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-3xl bg-[#FFFDF8] border border-[#E6E1D8] p-6 shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
                className="w-full flex items-center justify-between text-left font-bold text-[#163D32] text-sm sm:text-base cursor-pointer gap-4"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={`text-[#65736D] transition-transform duration-200 shrink-0 ${openIndex === idx ? "rotate-180 text-[#163D32]" : ""}`}
                />
              </button>
              {openIndex === idx && (
                <p className="mt-3 text-xs sm:text-sm text-[#65736D] leading-relaxed pt-2 border-t border-[#E6E1D8]/60">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
