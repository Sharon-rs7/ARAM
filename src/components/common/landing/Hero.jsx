import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Mic, FileText, Users, Scale, ShieldCheck, HeartHandshake } from "lucide-react";
import { speechService } from "@/services/speechService";
import { toast } from "sonner";
import Button from "@/components/common/Button";

const Hero = () => {
  const navigate = useNavigate();
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
          const res = await speechService.transcribeAudio(audioBlob, "ta-IN");
          if (res?.text) {
            navigate(`/citizen/chatbot?q=${encodeURIComponent(res.text)}`);
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
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-[#F7F1E6]">
      {/* Background radial glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#DCEBDD]/60 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-6">
        
        {/* Civic Badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-[#DCEBDD] border border-[#B8D7BC] px-4 py-1.5 text-xs font-black text-[#163D32] shadow-sm">
          <Scale size={15} />
          <span>CIVIC LEGAL AID & GRIEVANCE TRIAGE</span>
        </div>

        {/* Approved Main Heading */}
        <h1 className="text-4xl sm:text-6xl font-black text-[#163D32] tracking-tight leading-[1.1]">
          Your Rights. Our Support. <br className="hidden sm:inline" />
          <span className="text-[#1F5948]">A Fairer Tomorrow.</span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#65736D] leading-relaxed">
          ARAM AI bridges the justice gap by translating complex Indian laws, penal codes, and government schemes into clear, actionable steps in Tamil, English, and Hindi.
        </p>

        {/* 4 Action Triggers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-6 max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/citizen/chatbot")}
            className="flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-[#163D32] text-white font-bold text-xs sm:text-sm hover:bg-[#1F5948] transition shadow-sm cursor-pointer"
          >
            <Sparkles size={16} />
            <span>Ask ARAM AI</span>
          </button>

          <button
            onClick={handleVoice}
            className={`flex items-center justify-center gap-2.5 p-4 rounded-2xl font-bold text-xs sm:text-sm transition shadow-sm cursor-pointer ${
              isRecording 
                ? "bg-red-600 text-white animate-pulse" 
                : "bg-[#B96845] hover:bg-[#9E5333] text-white"
            }`}
          >
            <Mic size={16} />
            <span>{isRecording ? "Listening... Click to Finish" : "Speak Problem"}</span>
          </button>

          <button
            onClick={() => navigate("/citizen/documents")}
            className="flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-[#FFFDF8] border border-[#E6E1D8] text-[#18332B] font-bold text-xs sm:text-sm hover:bg-[#DCEBDD]/40 transition shadow-sm cursor-pointer"
          >
            <FileText size={16} className="text-[#163D32]" />
            <span>Upload Document</span>
          </button>

          <button
            onClick={() => navigate("/citizen/submit-complaint")}
            className="flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-[#FFFDF8] border border-[#E6E1D8] text-[#18332B] font-bold text-xs sm:text-sm hover:bg-[#DCEBDD]/40 transition shadow-sm cursor-pointer"
          >
            <Users size={16} className="text-[#1F5948]" />
            <span>Connect Guide</span>
          </button>
        </div>

      </div>
    </section>
  );
};

export default Hero;
