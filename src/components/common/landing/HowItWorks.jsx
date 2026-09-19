import React from "react";
import { MessageSquare, Sparkles, Route, UserCheck, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const HowItWorks = () => {
  const { t } = useLanguage();

  const steps = [
    {
      step: "01",
      title: t("howItWorks.step1Title", "Tell ARAM what happened"),
      desc: t("howItWorks.step1Desc", "Explain your issue naturally by speaking or typing in Tamil, English, or Hindi."),
      icon: MessageSquare,
      color: "bg-[#DCEBDD] text-[#163D32]"
    },
    {
      step: "02",
      title: t("howItWorks.step2Title", "AI analyses your case"),
      desc: t("howItWorks.step2Desc", "ARAM maps facts to statutory provisions, identifies key issues, and checks document readiness."),
      icon: Sparkles,
      color: "bg-[#F6D8C8] text-[#8C3B1E]"
    },
    {
      step: "03",
      title: t("howItWorks.step3Title", "Review & route"),
      desc: t("howItWorks.step3Desc", "You inspect the generated legal summary, verify checklists, and review the recommended authority."),
      icon: Route,
      color: "bg-[#E8C978]/40 text-[#7A5A0A]"
    },
    {
      step: "04",
      title: t("howItWorks.step4Title", "Human assistance"),
      desc: t("howItWorks.step4Desc", "Connect with verified local Legal Guides and District Legal Services Authorities (DLSA)."),
      icon: UserCheck,
      color: "bg-[#E7E1F2] text-[#4F3F73]"
    }
  ];

  return (
    <section id="how-it-works" className="bg-[#F7F1E6] py-16 sm:py-24 border-t border-[#E6E1D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-[#1F5948] bg-[#DCEBDD] px-3.5 py-1.5 rounded-full inline-block shadow-2xs">
            {t("howItWorks.tag", "Four Steps to Get the Right Help")}
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#163D32] tracking-tight">
            {t("howItWorks.title", "How ARAM Works for You")}
          </h2>
          <p className="text-xs sm:text-sm text-[#65736D] max-w-lg mx-auto">
            From your first question to accredited legal escalation — simple, transparent, and grounded.
          </p>
        </div>

        {/* Steps sequence: 4 columns on desktop with arrows, clean stacked cards on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isNotLast = idx < steps.length - 1;

            return (
              <div key={idx} className="relative flex flex-col">
                <div className="h-full p-6 sm:p-7 rounded-3xl bg-[#FFFDF8] border border-[#E6E1D8] shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl sm:text-3xl font-black text-[#1F5948]/70 font-mono tracking-wider">
                        {s.step}
                      </span>
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${s.color}`}>
                        <Icon size={20} />
                      </div>
                    </div>

                    <h3 className="text-sm sm:text-base font-black text-[#18332B] mb-2 leading-snug">
                      {s.title}
                    </h3>
                    <p className="text-xs text-[#65736D] leading-relaxed">
                      {s.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E6E1D8]/60 text-[11px] font-bold text-[#1F5948] flex items-center gap-1">
                    <span>Step {s.step}</span>
                  </div>
                </div>

                {/* Arrow connector on large screens */}
                {isNotLast && (
                  <div className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-[#163D32] text-white items-center justify-center shadow-md">
                    <ArrowRight size={13} />
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

export default HowItWorks;
