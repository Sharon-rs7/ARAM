import { useState } from "react";
import { Plus, Minus, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "Is this formal legal advice?",
    answer: "No. ARAM provides preliminary guidance and AI-powered triage routing only. It does not replace professional lawyers, official court proceedings, police reports, or certified legal advocates."
  },
  {
    question: "Can I track the progress of my complaint?",
    answer: "Yes. Once submitted, your complaint goes through automated AI analysis and is assigned to a volunteer legal helper. You can log into your Citizen dashboard to track the status (Pending, Under Review, Resolved) in real-time."
  },
  {
    question: "Can I hide my identity when filing a complaint?",
    answer: "Yes. Citizens can choose from three visibility options: VISIBLE (full contact details shown to helpers), PARTIAL (only district and description shown), and HIDDEN (name and contact details are masked, and any OCR text undergoes automatic PII masking)."
  },
  {
    question: "What documents or evidence can I upload?",
    answer: "You can upload pay slips, transaction invoices, land patta deeds, bank statements, or official communications. Supported formats include JPG, PNG, PDF, and DOCX (up to 5MB per file)."
  },
  {
    question: "Who reviews the complaints on the platform?",
    answer: "Grievances are analyzed initially by the AI models and then assigned to certified legal volunteers, law students, or local administrative representatives. They coordinate with relevant departments (such as the Labour Commissioner or Cyber Crime Cell) to support your case."
  }
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-slate-50">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 mb-4">
            <HelpCircle size={16} />
            Frequently Asked Questions
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900">Got Questions? We Have Answers</h2>
          <p className="mt-4 text-slate-600">Find answers to the most common queries about the ARAM platform.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
              >
                <span className="font-bold text-slate-800 text-lg">{faq.question}</span>
                <span className="p-1 bg-slate-50 rounded-lg text-slate-500">
                  {activeIndex === index ? <Minus size={18} /> : <Plus size={18} />}
                </span>
              </button>
              
              <div 
                className={`transition-all duration-350 ease-in-out ${
                  activeIndex === index ? "max-h-40 border-t p-6" : "max-h-0"
                } overflow-hidden bg-slate-50/50 text-slate-650 text-sm leading-relaxed`}
              >
                {faq.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
