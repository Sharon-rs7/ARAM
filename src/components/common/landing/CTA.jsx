import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

const CTA = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-[#F7F1E6] py-20 border-t border-[#E6E1D8]">
      <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
        <h2 className="text-3xl sm:text-5xl font-black text-[#163D32] tracking-tight">
          {t("cta.title", "Ready to Understand Your Rights?")}
        </h2>
        <p className="text-sm text-[#65736D] max-w-xl mx-auto leading-relaxed">
          {t("cta.subtitle", "Ask your first legal question, verify evidence documents, or connect with a verified legal guide today.")}
        </p>
        <div className="pt-2">
          <Link
            to="/citizen/chatbot"
            className="btn-aram-primary text-sm inline-flex items-center gap-2"
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
