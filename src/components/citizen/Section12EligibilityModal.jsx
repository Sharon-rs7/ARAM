import React, { useState } from "react";
import { X, Scale, CheckCircle2, AlertCircle, PhoneCall, Building2, ShieldCheck, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";

const Section12EligibilityModal = ({ isOpen, onClose, district = "Salem District", onMarkEligible }) => {
  const { t } = useLanguage();
  
  const [answers, setAnswers] = useState({
    isWomanOrChild: false,
    isScSt: false,
    isDisabilityOrVictim: false,
    isLowIncome: false
  });

  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const isEligible = answers.isWomanOrChild || answers.isScSt || answers.isDisabilityOrVictim || answers.isLowIncome;

  const questions = [
    {
      id: "isWomanOrChild",
      title: t("civicFeatures.sec12Q1", "Are you a woman or a child (under 18)?"),
      lawRef: "Sec. 12(c), Legal Services Authorities Act, 1987",
      desc: "All women and children in India are entitled to free legal aid irrespective of financial status."
    },
    {
      id: "isScSt",
      title: t("civicFeatures.sec12Q2", "Do you belong to Scheduled Caste (SC) or Scheduled Tribe (ST)?"),
      lawRef: "Sec. 12(a), Legal Services Authorities Act, 1987",
      desc: "Members of SC and ST communities are statutorily guaranteed full legal representation."
    },
    {
      id: "isDisabilityOrVictim",
      title: t("civicFeatures.sec12Q3", "Are you a person with disability, victim of human trafficking, or natural disaster?"),
      lawRef: "Sec. 12(d),(e), Legal Services Authorities Act, 1987",
      desc: "Covers differently-abled persons, victims of mass disaster, ethnic violence, flood, drought, or industrial disaster."
    },
    {
      id: "isLowIncome",
      title: t("civicFeatures.sec12Q4", "Is your annual family income less than ₹3,00,000 (statutory limit in Tamil Nadu)?"),
      lawRef: "Sec. 12(h), Legal Services Authorities Act, 1987 (TN Rule)",
      desc: "General category citizens whose total annual household income is below ₹3 Lakhs qualify for free legal aid."
    }
  ];

  const handleToggle = (id) => {
    setAnswers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (isEligible && onMarkEligible) {
      onMarkEligible(true);
      toast.success("Free Legal Aid qualification verified and noted!");
    }
  };

  const handleReset = () => {
    setAnswers({
      isWomanOrChild: false,
      isScSt: false,
      isDisabilityOrVictim: false,
      isLowIncome: false
    });
    setSubmitted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#FAF8F2] rounded-3xl border border-[#E6E1D8] shadow-2xl max-w-xl w-full overflow-hidden my-auto flex flex-col">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#163D32] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <Scale size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                {t("civicFeatures.sec12Title", "NALSA Section 12 Legal Aid Eligibility")}
              </h2>
              <p className="text-xs text-white/70">
                {t("civicFeatures.sec12Sub", "Verify if you qualify for 100% free advocate representation under the Legal Services Authorities Act, 1987.")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          
          {!submitted ? (
            <div className="space-y-4">
              <p className="text-xs text-[#65736D] font-medium leading-relaxed">
                Under <strong>Section 12 of the Legal Services Authorities Act, 1987</strong>, citizens belonging to the following categories are entitled to free legal counsel, court fee exemption, and free panel advocates funded by the government. Select all that apply to you:
              </p>

              <div className="space-y-3">
                {questions.map((q) => {
                  const checked = answers[q.id];
                  return (
                    <div
                      key={q.id}
                      onClick={() => handleToggle(q.id)}
                      className={`p-4 rounded-2xl border transition duration-150 cursor-pointer flex items-start gap-3.5 ${
                        checked
                          ? "bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-2xs"
                          : "bg-white border-[#E6E1D8] text-slate-800 hover:border-[#163D32]/30"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 transition shrink-0 ${
                        checked ? "bg-[#163D32] border-[#163D32] text-white" : "border-slate-300 bg-white"
                      }`}>
                        {checked && <CheckCircle2 size={14} />}
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm font-bold">{q.title}</p>
                        <p className="text-[11px] text-[#65736D]">{q.desc}</p>
                        <span className="inline-block text-[10px] font-mono text-[#1F5948] bg-[#DCEBDD]/60 px-2 py-0.5 rounded">
                          {q.lawRef}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full py-3 rounded-2xl bg-[#163D32] hover:bg-[#1F5948] text-white text-xs sm:text-sm font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{t("civicFeatures.btnCheckSec12", "Verify Free Legal Aid Eligibility")}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {isEligible ? (
                <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800">
                        Section 12 Certified
                      </span>
                      <h3 className="text-base font-black text-emerald-900 mt-1">
                        {t("civicFeatures.sec12Eligible", "Qualified for 100% Free Legal Aid")}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-emerald-800 leading-relaxed">
                    {t("civicFeatures.sec12EligibleDesc", "You are legally entitled to free legal counsel and DLSA panel lawyer representation at government expense.")}
                  </p>

                  <div className="p-4 rounded-2xl bg-white/80 border border-emerald-200/80 space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <Building2 size={15} className="text-emerald-700" />
                      <span>{district} District Legal Services Authority (DLSA)</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Combined Court Complex, {district}, Tamil Nadu.
                    </p>
                    <div className="flex items-center gap-2 font-mono text-emerald-800 font-bold pt-1">
                      <PhoneCall size={14} />
                      <span>National Toll-Free Helpline: 15100 (24x7)</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 text-amber-950 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                      <AlertCircle size={24} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                        Notice
                      </span>
                      <h3 className="text-base font-black text-amber-950 mt-1">
                        {t("civicFeatures.sec12NotEligible", "Standard Legal Guidance Mode")}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-amber-900 leading-relaxed">
                    {t("civicFeatures.sec12NotEligibleDesc", "While you may not qualify for a free court advocate under Section 12, ARAM AI guidance and paralegal triage remain 100% free.")}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 py-2.5 rounded-xl border border-[#E6E1D8] bg-white text-xs font-bold text-[#18332B] hover:bg-slate-50 transition cursor-pointer"
                >
                  Recalculate
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-[#163D32] hover:bg-[#1F5948] text-white text-xs font-bold transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default Section12EligibilityModal;
