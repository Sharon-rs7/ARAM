import React from "react";
import { Bot, UserCheck, CheckCircle2, ArrowRight, ShieldCheck, Scale } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

const AIHumanBridge = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-[#F7F1E6] py-16 sm:py-24 border-t border-[#E6E1D8]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-[#163D32] text-white p-6 sm:p-10 lg:p-14 shadow-xl relative overflow-hidden">
          
          {/* Subtle background embellishment */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#1F5948]/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Heading & Explanation */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#DCEBDD]/20 border border-[#DCEBDD]/30 px-3.5 py-1.5 text-xs font-bold text-[#DCEBDD]">
                <Scale size={14} />
                <span>{t("aiHuman.tag", "AI + Human Synergy")}</span>
              </div>

              <h2 className="text-2xl sm:text-4xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                {t("aiHuman.title", "AI When Possible. Human When Necessary.")}
              </h2>

              <p className="text-xs sm:text-sm text-[#DCEBDD]/90 leading-relaxed">
                {t("aiHuman.desc1", "ARAM AI immediately organizes your dispute, identifies applicable statutory sections, prepares required evidence checklists, and checks document readiness.")}
              </p>

              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                {t("aiHuman.desc2", "When your matter requires formal legal drafting, statutory filing, or DLSA representation, verified human Legal Guides and accredited advocates step in directly to support you.")}
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  to="/citizen/chatbot"
                  className="px-5 py-3 rounded-2xl bg-[#FFFDF8] text-[#163D32] font-bold text-xs sm:text-sm hover:bg-[#DCEBDD] transition shadow-sm inline-flex items-center gap-2 min-h-[44px]"
                >
                  <span>Start AI Assessment</span>
                  <ArrowRight size={15} />
                </Link>

                <Link
                  to="/citizen/submit-complaint"
                  className="px-5 py-3 rounded-2xl bg-[#1F5948] text-white border border-[#DCEBDD]/30 font-bold text-xs sm:text-sm hover:bg-[#163D32] transition shadow-sm inline-flex items-center gap-2 min-h-[44px]"
                >
                  <UserCheck size={16} />
                  <span>Request Human Guide</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Comparison / Trust pillars */}
            <div className="lg:col-span-5 space-y-3">
              {/* AI Pillar */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 space-y-2">
                <div className="flex items-center gap-2.5 text-[#DCEBDD] font-bold text-xs sm:text-sm">
                  <Bot size={18} />
                  <span>Instant Preliminary AI Triage</span>
                </div>
                <p className="text-[11px] sm:text-xs text-white/80 leading-relaxed">
                  24x7 instant rights awareness, multi-language speech translation, and structured dispute summary generation.
                </p>
              </div>

              {/* Bridge Divider */}
              <div className="flex items-center justify-center py-1">
                <div className="h-px bg-white/20 flex-1" />
                <span className="px-3 text-[10px] font-mono uppercase tracking-widest text-[#DCEBDD]/70 font-bold">
                  Seamless Escalation
                </span>
                <div className="h-px bg-white/20 flex-1" />
              </div>

              {/* Human Pillar */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 space-y-2">
                <div className="flex items-center gap-2.5 text-[#DCEBDD] font-bold text-xs sm:text-sm">
                  <UserCheck size={18} />
                  <span>Verified Human Legal Guides</span>
                </div>
                <p className="text-[11px] sm:text-xs text-white/80 leading-relaxed">
                  Local District Legal Services Authorities (DLSA), authorized paralegals, and institutional legal aid cells.
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default AIHumanBridge;
