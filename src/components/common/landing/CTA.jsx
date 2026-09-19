import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

const CTA = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-[#F7F1E6] py-16 sm:py-24 border-t border-[#E6E1D8]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-5 sm:space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#DCEBDD] border border-[#B8D7BC] px-3.5 py-1.5 text-xs font-black text-[#163D32] shadow-2xs">
          <Sparkles size={14} />
          <span>Get Free Legal Clarity</span>
        </div>

        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#163D32] tracking-tight">
          {t("cta.title", "Ready to Understand Your Rights?")}
        </h2>

        <p className="text-xs sm:text-sm md:text-base text-[#65736D] max-w-xl mx-auto leading-relaxed">
          {t("cta.subtitle", "Ask your first legal question, verify evidence documents, or connect with a verified legal guide today.")}
        </p>

        <div className="pt-2">
          <Link
            to="/citizen/chatbot"
            className="btn-aram-primary text-xs sm:text-sm py-3.5 px-7 inline-flex items-center gap-2.5 shadow-md hover:shadow-lg transition min-h-[46px]"
          >
            <span>{t("cta.button", "Start Free Legal Triage")}</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTA;
