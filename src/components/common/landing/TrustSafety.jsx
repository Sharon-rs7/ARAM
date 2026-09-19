import React from "react";
import { ShieldCheck, BookOpen, AlertCircle, Lock, Users, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const TrustSafety = () => {
  const { t } = useLanguage();

  const safeguards = [
    {
      icon: BookOpen,
      title: "Grounded in Verified Legal Sources",
      desc: "Information is mapped directly to Indian statutory codes, acts, and official circulars where available."
    },
    {
      icon: AlertCircle,
      title: "Clear Uncertainty Handling",
      desc: "When legal provisions cannot be verified with high certainty, ARAM states this clearly instead of speculating."
    },
    {
      icon: Users,
      title: "Accredited Human Review Pathways",
      desc: "Citizens can escalate their matters to local Legal Guides and District Legal Services Authorities (DLSA)."
    },
    {
      icon: Lock,
      title: "Zero-Trust Privacy & PII Protection",
      desc: "Aadhaar, bank numbers, and biometrics are strictly protected with role-based access and encryption."
    }
  ];

  return (
    <section className="bg-[#FFFDF8] py-16 sm:py-24 border-t border-[#E6E1D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-[#1F5948] bg-[#DCEBDD] px-3.5 py-1.5 rounded-full inline-block shadow-2xs">
            Governance & Privacy
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#163D32] tracking-tight">
            Built for Responsible Assistance
          </h2>
          <p className="text-xs sm:text-sm text-[#65736D] max-w-lg mx-auto">
            Ethical civic technology designed with institutional safeguards and citizen privacy at its core.
          </p>
        </div>

        {/* 4 Safeguards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {safeguards.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-[#FAF8F2] border border-[#E6E1D8] space-y-3 text-left hover:border-[#163D32]/30 transition"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#DCEBDD] text-[#163D32] flex items-center justify-center font-bold shadow-2xs">
                  <Icon size={20} />
                </div>
                <h3 className="text-sm sm:text-base font-black text-[#18332B] pt-1">
                  {s.title}
                </h3>
                <p className="text-xs text-[#65736D] leading-relaxed">
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Citizen Case Memory Banner (Phase 9) */}
        <div className="mt-8 p-6 sm:p-8 rounded-3xl bg-[#E8F3ED] border border-[#C6DFD0] text-left flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xs">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#12805A] bg-white px-2.5 py-1 rounded-full border border-[#C6DFD0]">
              <Sparkles size={12} />
              <span>Citizen Case Memory</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-[#163D32]">
              Your Case. Your History. One Conversation.
            </h3>
            <p className="text-xs sm:text-sm text-[#4A5D54] leading-relaxed">
              ARAM can securely remember your authorized complaint status and uploaded evidence so you never have to re-explain your situation when following up.
            </p>
          </div>

          <div className="shrink-0">
            <a
              href="/track-complaint"
              className="px-6 py-3 rounded-full bg-[#163D32] hover:bg-[#1F5948] text-white font-bold text-xs shadow-sm transition inline-flex items-center gap-2"
            >
              <span>Track With Case ID</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};

export default TrustSafety;
