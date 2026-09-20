import React from "react";
import { MessageSquare, Sparkles, ShieldCheck, UserCheck, Compass, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const HowItWorks = () => {
  const { t } = useLanguage();

  const steps = [
    {
      step: "01",
      title: t("howItWorks.step1Title", "Tell ARAM"),
      subtitle: t("howItWorks.step1Subtitle", "Multi-Modal Input"),
      desc: t("howItWorks.step1Desc", "Speak, type, or upload your issue naturally in Tamil, English, or Hindi."),
      icon: MessageSquare,
      color: "bg-[#DCEBDD] text-[#163D32]"
    },
    {
      step: "02",
      title: t("howItWorks.step2Title", "Understand Your Case"),
      subtitle: t("howItWorks.step2Subtitle", "Statutory Triage"),
      desc: t("howItWorks.step2Desc", "ARAM analyzes the facts, identifies applicable statutory sections, and highlights key issues."),
      icon: Sparkles,
      color: "bg-[#F6D8C8] text-[#8C3B1E]"
    },
    {
      step: "03",
      title: t("howItWorks.step3Title", "Find Verified Guidance"),
      subtitle: t("howItWorks.step3Subtitle", "Grounding & Evidence"),
      desc: t("howItWorks.step3Desc", "Relevant verified legal provisions, authority routing, and evidence checklists are structured."),
      icon: ShieldCheck,
      color: "bg-[#E8C978]/40 text-[#7A5A0A]"
    },
    {
      step: "04",
      title: t("howItWorks.step4Title", "Human Support"),
      subtitle: t("howItWorks.step4Subtitle", "DLSA & Legal Guides"),
      desc: t("howItWorks.step4Desc", "Cases seamlessly move toward accredited legal guides and District Legal Services Authorities."),
      icon: UserCheck,
      color: "bg-[#E7E1F2] text-[#4F3F73]"
    },
    {
      step: "05",
      title: t("howItWorks.step5Title", "Track Your Case"),
      subtitle: t("howItWorks.step5Subtitle", "Full Transparency"),
      desc: t("howItWorks.step5Desc", "Citizens follow live milestone progress, receive WhatsApp/SMS updates, and download official PDFs."),
      icon: Compass,
      color: "bg-[#DCEBDD] text-[#12805A]"
    }
  ];

  return (
    <section id="how-it-works" className="bg-[#F7F1E6] py-16 sm:py-20 border-t border-[#E6E1D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-[#1F5948] bg-[#DCEBDD] px-3.5 py-1.5 rounded-full inline-block shadow-2xs">
            {t("howItWorks.tag", "Citizen Journey")}
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#163D32] tracking-tight">
            {t("howItWorks.title", "How ARAM Helps")}
          </h2>
          <p className="text-xs sm:text-sm text-[#65736D] max-w-lg mx-auto">
            {t("howItWorks.subtitle", "From your first question to accredited legal escalation — simple, transparent, and grounded in law.")}
          </p>
        </div>

        {/* 5-Step Process: 1 col mobile, 2 cols tablet, 5 cols desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5 relative">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isNotLast = idx < steps.length - 1;

            return (
              <div key={idx} className="relative flex flex-col">
                <div className="h-full p-5 sm:p-6 rounded-3xl bg-[#FFFDF8] border border-[#E6E1D8] shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl sm:text-3xl font-black text-[#1F5948]/70 font-mono tracking-wider">
                        {s.step}
                      </span>
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${s.color}`}>
                        <Icon size={19} />
                      </div>
                    </div>

                    <h3 className="text-sm sm:text-base font-black text-[#18332B] mb-0.5 leading-snug">
                      {s.title}
                    </h3>
                    <p className="text-[11px] font-bold text-[#12805A] mb-2">
                      {s.subtitle}
                    </p>
                    <p className="text-xs text-[#65736D] leading-relaxed">
                      {s.desc}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-[#E6E1D8]/60 text-[11px] font-bold text-[#1F5948] flex items-center gap-1">
                    <span>{t("howItWorks.phase", "Phase")} {s.step}</span>
                  </div>
                </div>

                {/* Arrow connector on desktop */}
                {isNotLast && (
                  <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-[#163D32] text-white items-center justify-center shadow-md">
                    <ArrowRight size={11} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Civic Grounding Notice */}
        <div className="mt-10 p-4 rounded-2xl bg-[#FFFDF8] border border-[#E6E1D8] text-center max-w-2xl mx-auto shadow-2xs">
          <p className="text-xs text-[#65736D] leading-relaxed">
            ⚖️ <strong>Civic Governance Notice:</strong> {t("howItWorks.notice", "ARAM is an administrative and legal aid accessibility aid, not an automated court of law. All formal representations proceed through accredited human legal guides and statutory authorities.")}
          </p>
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
