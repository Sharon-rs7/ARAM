import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Keyboard, FileUp, Users, ArrowRight } from "lucide-react";
import { speechService } from "@/services/speechService";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";

const WaysToGetHelp = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
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
          toast.error("Voice recognition completed. Opening AI assistant...");
          navigate("/citizen/chatbot");
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      toast.info("Listening... Speak your grievance in Tamil, Hindi, or English.");
    } catch (err) {
      toast.error("Microphone permission required. Opening AI assistant...");
      navigate("/citizen/chatbot");
    }
  };

  const cards = [
    {
      id: "speak",
      icon: Mic,
      title: "Speak",
      subtitle: "Voice-First Assistance",
      desc: "Describe your issue naturally in Tamil, English, or Hindi using your voice.",
      actionLabel: isRecording ? "Listening..." : "Tap to Speak",
      action: handleVoice,
      active: isRecording,
      color: "bg-[#DCEBDD] text-[#163D32]",
      badge: "Tamil • Hindi • English"
    },
    {
      id: "type",
      icon: Keyboard,
      title: "Type",
      subtitle: "Interactive AI Chat",
      desc: "Explain your issue in your own words. Receive statutory triage and legal clarity.",
      actionLabel: "Chat with AI",
      action: () => navigate("/citizen/chatbot"),
      color: "bg-[#F6D8C8] text-[#8C3B1E]",
      badge: "24/7 Available"
    },
    {
      id: "upload",
      icon: FileUp,
      title: "Upload",
      subtitle: "Document Evidence",
      desc: "Share relevant documents, notices, sale deeds, or police complaint copies.",
      actionLabel: "Inspect Documents",
      action: () => navigate("/citizen/submit-complaint"),
      color: "bg-[#E8C978]/40 text-[#7A5A0A]",
      badge: "Deep OCR Ready"
    },
    {
      id: "connect",
      icon: Users,
      title: "Connect",
      subtitle: "Human Legal Guides",
      desc: "Get connected with an accredited District Legal Guide when human support is needed.",
      actionLabel: "Find a Guide",
      action: () => navigate("/citizen/submit-complaint"),
      color: "bg-[#E7E1F2] text-[#4F3F73]",
      badge: "DLSA Accredited"
    }
  ];

  return (
    <section className="bg-[#FAF8F2] pt-4 pb-12 sm:pb-16 border-b border-[#E6E1D8]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-left mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#1F5948] bg-[#DCEBDD] px-3 py-1 rounded-full inline-block mb-2 shadow-2xs">
              Ways to Get Help
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#163D32] tracking-tight">
              Choose How You Want to Begin
            </h2>
            <p className="text-xs sm:text-sm text-[#65736D] mt-1 max-w-xl">
              Every citizen communicates differently. Select the method most comfortable for you.
            </p>
          </div>
          <span className="text-xs font-semibold text-[#12805A] hidden sm:block">
            Free Civic Assistance • No Hidden Charges
          </span>
        </div>

        {/* 4 Cards Grid: 1 col on mobile, 2 col on tablet, 4 col on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.id}
                onClick={c.action}
                className={`p-5 sm:p-6 rounded-3xl bg-[#FFFDF8] border transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:shadow-md ${
                  c.active 
                    ? "border-red-500 ring-2 ring-red-500/20 shadow-md bg-red-50/20" 
                    : "border-[#E6E1D8] hover:border-[#12805A]/40"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shadow-2xs transition-transform group-hover:scale-105 ${c.color} ${c.active ? "bg-red-600 text-white animate-pulse" : ""}`}>
                      <Icon size={20} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#65736D] bg-[#F7F1E6] px-2.5 py-1 rounded-full border border-[#E6E1D8]/60">
                      {c.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-[#163D32] flex items-center gap-1.5">
                      <span>{c.title}</span>
                    </h3>
                    <p className="text-[11px] font-semibold text-[#12805A] mt-0.5">
                      {c.subtitle}
                    </p>
                    <p className="text-xs text-[#65736D] leading-relaxed mt-2">
                      {c.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-[#E6E1D8]/60 flex items-center justify-between text-xs font-bold text-[#163D32] group-hover:text-[#12805A]">
                  <span>{c.actionLabel}</span>
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default WaysToGetHelp;
