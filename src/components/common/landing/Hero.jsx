import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Leaf, ArrowRight, MessageSquare, FileText, Compass, 
  Mic, Keyboard, FileUp, Users, Scale 
} from "lucide-react";
import { speechService } from "@/services/speechService";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";

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
    <section className="relative pt-24 pb-8 sm:pt-32 sm:pb-12 lg:pt-32 lg:pb-10 overflow-hidden bg-[#FAF8F2]">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Left Column: Civic Messaging & Actions */}
          <div className="lg:col-span-6 space-y-5 text-left">
            
            {/* Civic Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-[#E5F0E6] border border-[#CDE3CF] px-4 py-1.5 text-xs font-bold text-[#167957] shadow-2xs">
              <Leaf size={14} className="text-[#167957]" />
              <span>{t("hero.eyebrow", "Accessible Justice for Every Citizen")}</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-[46px] xl:text-[52px] font-black text-[#163D32] tracking-tight leading-[1.12]">
              {t("hero.title1", "Your Rights. Our Support.")} <br />
              <span className="text-[#12805A]">{t("hero.title2", "A Fairer Tomorrow.")}</span>
            </h1>

            {/* Grounded Subtitle */}
            <p className="text-sm sm:text-base text-[#4A5D54] leading-relaxed max-w-xl">
              ARAM AI helps citizens understand legal information, identify <strong className="text-[#163D32] font-semibold">the right authorities</strong>, organize supporting evidence, and connect with verified <strong className="text-[#163D32] font-semibold">legal guides</strong> — in Tamil, English, and Hindi.
            </p>

            {/* Primary Action Buttons Row 1 */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {/* Primary CTA: Ask ARAM AI */}
              <button
                type="button"
                onClick={() => navigate("/citizen/chatbot")}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#0D3B2E] hover:bg-[#165340] text-white font-bold text-sm shadow-md transition cursor-pointer min-h-[44px]"
              >
                <MessageSquare size={16} />
                <span>{t("hero.askAi", "Ask ARAM AI")}</span>
                <ArrowRight size={15} />
              </button>

              {/* Secondary CTA: File a Grievance */}
              <button
                type="button"
                onClick={() => navigate("/citizen/submit-complaint")}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white border border-[#12805A] hover:border-[#0D3B2E] text-[#12805A] hover:bg-[#E8F3ED] font-bold text-sm shadow-2xs transition cursor-pointer min-h-[44px]"
              >
                <FileText size={16} className="text-[#12805A]" />
                <span>{t("hero.fileGrievance", "File a Grievance")}</span>
              </button>

              {/* Tertiary CTA: Track My Case */}
              <button
                type="button"
                onClick={() => navigate("/track-complaint")}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white border border-[#12805A] hover:border-[#0D3B2E] text-[#12805A] hover:bg-[#E8F3ED] font-bold text-sm shadow-2xs transition cursor-pointer min-h-[44px]"
              >
                <Compass size={16} className="text-[#12805A]" />
                <span>{t("hero.trackCase", "Track My Case")}</span>
              </button>
            </div>

            {/* Secondary Quick Action Pills Row 2 */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleVoice}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border font-bold text-xs transition shadow-2xs cursor-pointer min-h-[38px] ${
                  isRecording
                    ? "bg-red-600 text-white border-red-700 animate-pulse"
                    : "bg-white border-[#DDE2DF] hover:border-[#12805A] text-[#163D32] hover:bg-[#E8F3ED]/60"
                }`}
              >
                <Mic size={14} className={isRecording ? "text-white" : "text-[#12805A]"} />
                <span>{isRecording ? t("hero.listening", "Listening...") : "Speak"}</span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/citizen/chatbot")}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#DDE2DF] hover:border-[#12805A] text-[#163D32] hover:bg-[#E8F3ED]/60 font-bold text-xs transition shadow-2xs cursor-pointer min-h-[38px]"
              >
                <Keyboard size={14} className="text-[#12805A]" />
                <span>Type</span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/citizen/documents")}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#DDE2DF] hover:border-[#12805A] text-[#163D32] hover:bg-[#E8F3ED]/60 font-bold text-xs transition shadow-2xs cursor-pointer min-h-[38px]"
              >
                <FileUp size={14} className="text-[#12805A]" />
                <span>Upload</span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/citizen/submit-complaint")}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#DDE2DF] hover:border-[#12805A] text-[#163D32] hover:bg-[#E8F3ED]/60 font-bold text-xs transition shadow-2xs cursor-pointer min-h-[38px]"
              >
                <Users size={14} className="text-[#12805A]" />
                <span>Connect</span>
              </button>
            </div>

          </div>

          {/* Right Column: CM Vijay Civic Showcase Visual */}
          <div className="lg:col-span-6 flex items-center justify-center lg:justify-end relative mt-4 lg:mt-0">
            <div className="relative w-full max-w-[580px]">
              <img
                src="/assets/cm_vijay_hero@2x.png"
                alt="Hon'ble Chief Minister Thalapathy Vijay - ARAM Civic Legal Aid & Justice"
                className="w-full h-auto object-contain transition-transform duration-300 hover:scale-[1.01]"
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
