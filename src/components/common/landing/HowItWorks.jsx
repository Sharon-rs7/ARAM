import React from "react";
import { Mic, Sparkles, FileText, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const HowItWorks = () => {
  const { t } = useLanguage();

  const steps = [
    { step: "01", title: t("howItWorks.step1Title", "Speak or Type Grievance"), desc: t("howItWorks.step1Desc", "Explain your issue naturally in your preferred language."), icon: Mic },
    { step: "02", title: t("howItWorks.step2Title", "AI Statutory Triage"), desc: t("howItWorks.step2Desc", "ARAM maps your dispute to certified Indian legal codes and penalties."), icon: Sparkles },
    { step: "03", title: t("howItWorks.step3Title", "Verify Evidence"), desc: t("howItWorks.step3Desc", "Upload agreements or notices for instant OCR validation."), icon: FileText },
    { step: "04", title: t("howItWorks.step4Title", "Connect Legal Guide"), desc: t("howItWorks.step4Desc", "Get assigned an authorized legal guide or DLSA representative."), icon: CheckCircle2 }
  ];

  return (
    <section className="bg-[#F7F1E6] py-20 border-t border-[#E6E1D8]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-[#1F5948] bg-[#DCEBDD] px-3.5 py-1.5 rounded-full inline-block">
            {t("howItWorks.tag", "Seamless Journey")}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#163D32] tracking-tight">
            {t("howItWorks.title", "Four Steps to Legal Resolution")}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="p-6 rounded-3xl bg-[#FFFDF8] border border-[#E6E1D8] shadow-sm space-y-3">
                <span className="text-2xl font-black text-[#1F5948]">{s.step}</span>
                <h3 className="text-base font-bold text-[#18332B]">{s.title}</h3>
                <p className="text-xs text-[#65736D] leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
