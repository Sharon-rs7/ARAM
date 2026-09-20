import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Leaf, ArrowRight, MessageSquare, FileText, Compass, 
  Shield, CheckCircle2, Scale 
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const Hero = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <section className="relative pt-24 pb-10 sm:pt-28 sm:pb-12 lg:pt-32 lg:pb-14 overflow-hidden bg-[#FAF8F2]">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column: Civic Messaging & Actions */}
          <div className="lg:col-span-6 space-y-5 text-left">
            
            {/* Civic Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-[#E5F0E6] border border-[#CDE3CF] px-3.5 py-1.5 text-xs font-bold text-[#167957] shadow-2xs">
              <Leaf size={14} className="text-[#167957] shrink-0" />
              <span>{t("hero.eyebrow", "Accessible Justice for Every Citizen")}</span>
            </div>

            {/* Main Editorial Heading */}
            <h1 className="text-3xl sm:text-5xl lg:text-[46px] xl:text-[52px] font-black text-[#163D32] tracking-tight leading-[1.14]">
              {t("hero.title1", "Your Rights. Our Support.")} <br />
              <span className="text-[#12805A]">{t("hero.title2", "A Fairer Tomorrow.")}</span>
            </h1>

            {/* Supporting Scannable Text */}
            <p className="text-sm sm:text-base text-[#4A5D54] leading-relaxed max-w-xl">
              {t("hero.subtitle", "ARAM helps citizens understand legal information, identify the right authorities, organize supporting evidence, and connect with verified legal guides — in Tamil, English, and Hindi.")}
            </p>

            {/* Structured CTAs with Clear Dominance Hierarchy */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
              {/* PRIMARY CTA: Ask ARAM AI (Dominant) */}
              <button
                type="button"
                onClick={() => navigate("/citizen/chatbot")}
                className="flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#0D3B2E] hover:bg-[#165340] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-150 cursor-pointer min-h-[48px] active:scale-[0.98]"
              >
                <MessageSquare size={17} />
                <span>{t("hero.askAi", "Ask ARAM AI")}</span>
                <ArrowRight size={16} />
              </button>

              {/* SECONDARY CTA: File a Grievance */}
              <button
                type="button"
                onClick={() => navigate("/citizen/submit-complaint")}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white border border-[#12805A] hover:border-[#0D3B2E] text-[#12805A] hover:bg-[#E8F3ED] font-bold text-sm shadow-2xs transition-all duration-150 cursor-pointer min-h-[48px] active:scale-[0.98]"
              >
                <FileText size={16} className="text-[#12805A]" />
                <span>{t("hero.fileGrievance", "File a Grievance")}</span>
              </button>

              {/* TERTIARY CTA: Track My Case */}
              <button
                type="button"
                onClick={() => navigate("/track-complaint")}
                className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-full text-[#4A5D54] hover:text-[#163D32] hover:bg-[#DCEBDD]/40 font-bold text-xs sm:text-sm transition cursor-pointer min-h-[44px]"
              >
                <Compass size={15} className="text-[#12805A]" />
                <span>{t("hero.trackCase", "Track My Case")}</span>
              </button>
            </div>

            {/* Reassuring Civic Safeguard Tagline */}
            <div className="pt-3 flex items-center gap-4 text-xs font-semibold text-[#65736D]">
              <span className="flex items-center gap-1">
                <CheckCircle2 size={13} className="text-[#12805A]" />
                {t("hero.noLegalFees", "No Legal Fees")}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 size={13} className="text-[#12805A]" />
                {t("hero.piiPrivacy", "Strict PII Privacy")}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 size={13} className="text-[#12805A]" />
                {t("hero.dlsaAligned", "Tamil Nadu DLSA Aligned")}
              </span>
            </div>

          </div>

          {/* Right Column: CM Vijay Civic Showcase Visual */}
          <div className="lg:col-span-6 flex items-center justify-center lg:justify-end relative mt-6 lg:mt-0">
            <div className="relative w-full max-w-[580px]">
              <img
                src="/assets/cm_vijay_hero@2x.png"
                alt="Hon'ble Chief Minister Thalapathy Vijay - ARAM Civic Legal Aid & Justice"
                className="w-full h-auto object-contain rounded-3xl transition-transform duration-300 hover:scale-[1.01]"
                loading="eager"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
