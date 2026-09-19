import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Mic, FileText, Users, Scale, ShieldCheck, HeartHandshake } from "lucide-react";
import { speechService } from "@/services/speechService";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";
import Button from "@/components/common/Button";

const Hero = () => {
  const navigate = useNavigate();
  const { language, changeLanguage, availableLanguages, t } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  const handleVoice = async () => {
    if (isRecording) {
      if (mediaRecorder) mediaRecorder.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        toast.info("Transcribing your grievance voice input...");
        try {
          const res = await speechService.transcribeAudio(audioBlob, "auto");
          const transcribedText = (res?.transcript || res?.text || "").trim();
          if (transcribedText) {
            if (res?.detectedLanguage) {
              toast.success(`Recognized in ${res.detectedLanguage}!`);
            }
            navigate(`/citizen/chatbot?q=${encodeURIComponent(transcribedText)}`);
          } else {
            navigate("/citizen/chatbot");
          }
        } catch (err) {
          toast.error("Voice recognition failed. Opening assistant...");
          navigate("/citizen/chatbot");
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      toast.info("Listening... Speak your grievance in Tamil, Hindi, or English.");
    } catch (err) {
      toast.error("Microphone access unavailable.");
      navigate("/citizen/chatbot");
    }
  };

  return (
    <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-28 overflow-hidden bg-[#F7F1E6]">
      {/* Background radial glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[600px] h-[340px] sm:h-[600px] bg-[#DCEBDD]/60 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-5 sm:space-y-6">
        
        {/* Civic Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-[#DCEBDD] border border-[#B8D7BC] px-3.5 py-1.5 text-[11px] sm:text-xs font-black text-[#163D32] shadow-2xs">
          <Scale size={14} className="text-[#163D32]" />
          <span>{t("hero.eyebrow", "Accessible Justice for Every Citizen")}</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#163D32] tracking-tight leading-[1.15]">
          {t("hero.title1", "Your Rights. Our Support.")} <br className="hidden sm:inline" />
          <span className="text-[#1F5948]">{t("hero.title2", "A Fairer Tomorrow.")}</span>
        </h1>

        {/* Grounded Subtitle */}
        <p className="max-w-2xl mx-auto text-xs sm:text-sm md:text-base text-[#65736D] leading-relaxed">
          {t("hero.subtitle", "ARAM AI bridges the justice gap by translating complex Indian laws, penal codes, and government schemes into clear, actionable steps in Tamil, English, and Hindi.")}
        </p>

        {/* Trilingual Direct Switcher Pills (User Request: Choose language right on Home page) */}
        <div className="pt-1 flex items-center justify-center gap-2">
          <span className="text-[11px] font-bold text-[#65736D] uppercase tracking-wider hidden sm:inline">
            Language / மொழி:
          </span>
          <div className="inline-flex items-center p-1 rounded-2xl bg-[#FFFDF8] border border-[#E6E1D8] shadow-2xs">
            {availableLanguages.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => changeLanguage(l.code)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  language === l.code
                    ? "bg-[#163D32] text-white shadow-xs"
                    : "text-[#18332B] hover:bg-[#DCEBDD]/40"
                }`}
              >
                <span>{l.nativeLabel}</span>
                <span className="text-[10px] opacity-75 hidden xs:inline">({l.label})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Primary CTA Area: 3 Clear Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2 max-w-xl mx-auto">
          {/* Primary CTA: Ask ARAM AI */}
          <button
            type="button"
            onClick={() => navigate("/citizen/chatbot")}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-[#163D32] text-white font-bold text-sm hover:bg-[#1F5948] transition shadow-sm cursor-pointer min-h-[46px]"
          >
            <Sparkles size={17} className="text-[#DCEBDD]" />
            <span>{t("hero.askAi", "Ask ARAM AI")}</span>
          </button>

          {/* Secondary CTA: File a Grievance */}
          <button
            type="button"
            onClick={() => navigate("/citizen/submit-complaint")}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-[#FFFDF8] border border-[#163D32]/30 text-[#163D32] font-bold text-sm hover:bg-[#DCEBDD]/40 transition shadow-2xs cursor-pointer min-h-[46px]"
          >
            <ShieldCheck size={17} />
            <span>{t("hero.fileGrievance", "File a Grievance")}</span>
          </button>

          {/* Tertiary CTA: Track My Case */}
          <button
            type="button"
            onClick={() => navigate("/track-complaint")}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-[#FFFDF8] border border-[#E6E1D8] text-[#18332B] font-bold text-sm hover:bg-[#DCEBDD]/40 transition shadow-2xs cursor-pointer min-h-[46px]"
          >
            <ArrowRight size={16} className="text-[#65736D]" />
            <span>{t("hero.trackCase", "Track My Case")}</span>
          </button>
        </div>

        {/* Secondary Quick Action Bar */}
        <div className="pt-2">
          <div className="inline-flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#65736D] mb-2.5">
            <span>Quick Grievance Inputs</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-2xl mx-auto">
            {/* Voice Input */}
            <button
              type="button"
              onClick={handleVoice}
              className={`flex items-center justify-center gap-2 p-3 rounded-2xl font-bold text-xs transition shadow-2xs cursor-pointer min-h-[42px] ${
                isRecording
                  ? "bg-red-600 text-white animate-pulse"
                  : "bg-[#B96845] hover:bg-[#9E5333] text-white"
              }`}
            >
              <Mic size={15} />
              <span>{isRecording ? t("hero.listening", "Listening... Click to Finish") : t("hero.speakProblem", "Speak Problem")}</span>
            </button>

            {/* Document Verification */}
            <button
              type="button"
              onClick={() => navigate("/citizen/documents")}
              className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-[#FFFDF8] border border-[#E6E1D8] text-[#18332B] font-bold text-xs hover:bg-[#DCEBDD]/40 transition shadow-2xs cursor-pointer min-h-[42px]"
            >
              <FileText size={15} className="text-[#163D32]" />
              <span>{t("hero.uploadDoc", "Upload Document")}</span>
            </button>

            {/* Connect Guide */}
            <button
              type="button"
              onClick={() => navigate("/citizen/submit-complaint")}
              className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-[#FFFDF8] border border-[#E6E1D8] text-[#18332B] font-bold text-xs hover:bg-[#DCEBDD]/40 transition shadow-2xs cursor-pointer min-h-[42px]"
            >
              <Users size={15} className="text-[#1F5948]" />
              <span>{t("hero.connectGuide", "Connect Guide")}</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;

