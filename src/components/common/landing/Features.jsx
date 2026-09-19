import React from "react";
import { 
  Sparkles, Mic, FileCheck, ShieldCheck 
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const Features = () => {
  const { t } = useLanguage();

  const capabilities = [
    {
      icon: Sparkles,
      title: t("features.f1Title", "Structured Legal Triage"),
      desc: t("features.f1Desc", "Every issue is mapped to relevant legal provisions, potential remedies, next steps, and official dispute authorities without confusion."),
      badge: "Intelligent Triage",
      color: "bg-[#DCEBDD] text-[#163D32]"
    },
    {
      icon: Mic,
      title: t("features.f2Title", "Multilingual Voice Assistant"),
      desc: t("features.f2Desc", "Speak naturally in Tamil (தமிழ்), Hindi (हिंदी), or English. ARAM transcribes, understands dialects, and reads answers aloud for accessible legal awareness."),
      badge: "Hands-Free Voice",
      color: "bg-[#F6D8C8] text-[#8C3B1E]"
    },
    {
      icon: FileCheck,
      title: t("features.f3Title", "Document Analysis & Inspection"),
      desc: t("features.f3Desc", "Upload sale deeds, partition deeds, FIR copies, or notices to check text legibility, key dates, parties, and legal document readiness."),
      badge: "Optical Verification",
      color: "bg-[#E8C978]/50 text-[#7A5A0A]"
    },
    {
      icon: ShieldCheck,
      title: t("features.f4Title", "Verified Legal Guidance"),
      desc: t("features.f4Desc", "Grounded in verified statutes and government schemes. When human intervention is needed, cases seamlessly escalate to local DLSA authorities."),
      badge: "Grounded Support",
      color: "bg-[#E7E1F2] text-[#4F3F73]"
    }
  ];

  return (
    <section id="services" className="bg-[#FFFDF8] py-16 sm:py-24 border-t border-[#E6E1D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-[#1F5948] bg-[#DCEBDD] px-3.5 py-1.5 rounded-full inline-block shadow-2xs">
            {t("features.tag", "Engineered for Justice")}
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#163D32] tracking-tight">
            {t("features.title", "How ARAM AI Protects Your Legal Rights")}
          </h2>
          <p className="text-xs sm:text-sm text-[#65736D] max-w-xl mx-auto">
            {t("features.subtitle", "Practical, citizen-first legal tools designed to make rights understandable, accessible, and actionable.")}
          </p>
        </div>

        {/* 4 Capability Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {capabilities.map((c, idx) => {
            const Icon = c.icon;
            return (
              <div
                key={idx}
                className="p-6 sm:p-7 rounded-3xl bg-[#F7F1E6]/40 border border-[#E6E1D8] hover:border-[#163D32]/40 hover:bg-[#FFFDF8] hover:shadow-md transition duration-200 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold ${c.color}`}>
                      <Icon size={22} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#65736D] bg-[#FFFDF8] px-2.5 py-1 rounded-full border border-[#E6E1D8]">
                      {c.badge}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-black text-[#18332B] pt-1">
                    {c.title}
                  </h3>
                  <p className="text-xs text-[#65736D] leading-relaxed">
                    {c.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default Features;
