import React from "react";
import { Bot, UserCheck, CheckCircle2, ArrowRight, ShieldCheck, Scale, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

const AIHumanBridge = () => {
  const { t } = useLanguage();

  const aiCapabilities = [
    "Multilingual speech and text interaction in Tamil, English & Hindi",
    "Preliminary statutory case understanding and issue categorization",
    "Grounded legal information retrieval from verified Indian legal codes",
    "Evidence document organization and legibility inspection",
    "Secure case memory and context preservation for authenticated citizens"
  ];

  const humanCapabilities = [
    "Dedicated accredited District Legal Guides and paralegals",
    "Regional administration and departmental liaison support",
    "Statutory escalation to District Legal Services Authorities (DLSA)",
    "Comprehensive case file review and personalized legal opinion",
    "Formal dispute resolution tracking and case closure workflow"
  ];

  return (
    <section className="bg-[#FAF8F2] py-16 sm:py-24 border-t border-[#E6E1D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Card Container */}
        <div className="rounded-3xl bg-[#0F382C] text-white p-7 sm:p-10 lg:p-14 shadow-xl relative overflow-hidden">
          
          {/* Subtle background embellishment */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#165A46]/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-8">
            
            {/* Header */}
            <div className="max-w-3xl text-left space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#DCEBDD]/20 border border-[#DCEBDD]/30 px-3.5 py-1.5 text-xs font-bold text-[#DCEBDD]">
                <Scale size={14} />
                <span>The Core ARAM Differentiator</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                AI When Possible. <br className="hidden sm:inline" />
                Human When Necessary.
              </h2>

              <p className="text-xs sm:text-sm text-[#DCEBDD]/90 leading-relaxed max-w-2xl">
                ARAM is designed to help citizens understand their situation, organize information, and reach the appropriate support pathway. AI assistance does not replace lawyers, authorities, emergency services, or professional legal representation.
              </p>
            </div>

            {/* Two-Column Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              
              {/* LEFT Column: AI Assistance */}
              <div className="p-6 sm:p-7 rounded-3xl bg-white/10 backdrop-blur-xs border border-white/15 space-y-4 flex flex-col justify-between text-left">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-[#DCEBDD]">
                    <div className="w-10 h-10 rounded-2xl bg-[#DCEBDD]/20 flex items-center justify-center">
                      <Bot size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white">AI Assistance</h3>
                      <p className="text-[11px] text-[#DCEBDD]/80">Immediate 24/7 Digital First-Aid</p>
                    </div>
                  </div>

                  <ul className="space-y-2.5 pt-2">
                    {aiCapabilities.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-white/90 leading-relaxed">
                        <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <Link
                    to="/citizen/chatbot"
                    className="w-full py-3 px-5 rounded-2xl bg-white hover:bg-[#DCEBDD] text-[#163D32] font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <span>Start AI Assessment</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              {/* RIGHT Column: Human Support */}
              <div className="p-6 sm:p-7 rounded-3xl bg-white/10 backdrop-blur-xs border border-white/15 space-y-4 flex flex-col justify-between text-left">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-[#DCEBDD]">
                    <div className="w-10 h-10 rounded-2xl bg-[#DCEBDD]/20 flex items-center justify-center">
                      <UserCheck size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white">Human Support</h3>
                      <p className="text-[11px] text-[#DCEBDD]/80">Accredited DLSA & Legal Guides</p>
                    </div>
                  </div>

                  <ul className="space-y-2.5 pt-2">
                    {humanCapabilities.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-white/90 leading-relaxed">
                        <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <Link
                    to="/citizen/submit-complaint"
                    className="w-full py-3 px-5 rounded-2xl bg-[#165A46] hover:bg-[#1A6C54] text-white border border-white/20 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <span>Request Legal Guide</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default AIHumanBridge;
