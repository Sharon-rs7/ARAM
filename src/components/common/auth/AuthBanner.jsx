import React, { useState, useEffect } from "react";
import Logo from "@/components/common/Logo";
import { Shield, Sparkles, Scale, Languages, CheckCircle2, FileCheck2, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const AuthBanner = () => {
  const { t } = useLanguage();

  const slides = [
    {
      badge: t("auth.banner.slide1Badge", "Grounded AI Triage"),
      title: t("auth.banner.slide1Title", "Grounded Legal Guidance for Every Citizen"),
      desc: t("auth.banner.slide1Desc", "Instant statutory triage powered by certified Indian legal knowledge, penal codes, and acts in Tamil, Tanglish, Hindi, and English."),
      icon: Scale,
      color: "from-emerald-500/20 to-teal-500/10"
    },
    {
      badge: t("auth.banner.slide2Badge", "Institutional Security"),
      title: t("auth.banner.slide2Title", "Encrypted & Direct Authority Grievance Filing"),
      desc: t("auth.banner.slide2Desc", "Connect seamlessly with local taluk offices, District Legal Services Authorities (DLSA), and verified advocates."),
      icon: Shield,
      color: "from-teal-500/20 to-emerald-500/10"
    },
    {
      badge: t("auth.banner.slide3Badge", "Multilingual Engine"),
      title: t("auth.banner.slide3Title", "Voice-First Multilingual Accessibility"),
      desc: t("auth.banner.slide3Desc", "Speak your grievance naturally in your native language with voice-first assistance in Tamil, Hindi, and English."),
      icon: Languages,
      color: "from-amber-500/20 to-emerald-500/10"
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const active = slides[currentSlide];
  const Icon = active.icon;

  const trustPoints = [
    t("auth.banner.trust1", "Zero Hallucination Grounded Legal Corpus"),
    t("auth.banner.trust2", "Verified DLSA & Taluk Escalation"),
    t("auth.banner.trust3", "Confidential 256-bit Encrypted Triage")
  ];

  return (
    <div className="relative hidden lg:flex flex-col justify-between p-10 xl:p-14 bg-gradient-to-br from-[#102D25] via-[#163D32] to-[#0D241D] text-white overflow-hidden w-1/2 min-h-screen border-r border-[#1F5948]/40 shadow-2xl">
      {/* Decorative Aurora Gradients & Subtle Grid */}
      <div className="absolute -top-32 -left-32 w-[480px] h-[480px] bg-[#2E7D5B]/25 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-[400px] h-[400px] bg-[#DCEBDD]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 left-1/4 w-[420px] h-[420px] bg-[#1F5948]/30 rounded-full blur-[90px] pointer-events-none" />
      
      {/* Subtle Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }}
      />

      {/* Top Header: Brand & Civic Tag */}
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <Logo size="lg" light={true} />
          <div className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-[#DCEBDD]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {t("auth.banner.govtTag", "Govt. of Tamil Nadu & Civic Aid")}
          </div>
        </div>
        <p className="mt-2 text-xs font-medium text-[#DCEBDD]/80 tracking-wide max-w-sm">
          {t("auth.banner.copilotDesc", "Accessible Rights & Assistance Management System • AI Legal Copilot")}
        </p>
      </div>

      {/* Center: Dynamic Interactive Hero Card */}
      <div className="relative z-10 my-auto py-8">
        <div className="p-8 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500">
          
          {/* Slide Category Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F5948]/80 border border-[#DCEBDD]/20 text-[11px] font-bold text-[#DCEBDD] uppercase tracking-wider mb-5">
            <Sparkles size={13} className="text-emerald-300" />
            <span>{active.badge}</span>
          </div>

          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1F5948] to-[#163D32] border border-[#DCEBDD]/30 flex items-center justify-center text-[#DCEBDD] shrink-0 shadow-lg shadow-black/20">
              <Icon size={28} />
            </div>

            <div className="flex-1">
              <h2 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-white leading-snug transition-all duration-300">
                {active.title}
              </h2>
              <p className="mt-3 text-sm text-[#DCEBDD]/90 leading-relaxed transition-all duration-300">
                {active.desc}
              </p>
            </div>
          </div>

          {/* Interactive Slide Dots */}
          <div className="flex items-center gap-2 mt-8 pt-6 border-t border-white/10">
            {slides.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentSlide === idx 
                    ? "w-8 bg-gradient-to-r from-[#DCEBDD] to-emerald-300 shadow-sm" 
                    : "w-2 bg-white/20 hover:bg-white/40"
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
            <span className="ml-auto text-[11px] font-semibold text-[#DCEBDD]/70">
              {currentSlide + 1} {t("auth.banner.of", "of")} {slides.length}
            </span>
          </div>
        </div>

        {/* Trust Points Grid */}
        <div className="grid grid-cols-1 gap-2.5 mt-6">
          {trustPoints.map((pt, i) => (
            <div key={i} className="flex items-center gap-2.5 text-xs text-[#DCEBDD]/90 font-medium">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
              <span>{pt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Footer Details */}
      <div className="relative z-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#DCEBDD]/70 font-medium">
        <span>{t("auth.banner.officialSupport", "Official Support:")} <strong className="text-white">ouraramsupport@gmail.com</strong></span>
        <div className="flex items-center gap-2">
          <FileCheck2 size={13} className="text-emerald-400" />
          <span>{t("auth.banner.compliance", "Compliant with Indian IT Act & DPDP 2023")}</span>
        </div>
      </div>
    </div>
  );
};

export default AuthBanner;
