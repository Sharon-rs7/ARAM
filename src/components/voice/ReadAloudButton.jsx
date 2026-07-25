import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, Play, Pause, Square } from "lucide-react";
import { toast } from "sonner";

const ReadAloudButton = ({ text, language = "en-US" }) => {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState(1.0); // 0.75 = slow, 1.0 = normal
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (!window.speechSynthesis) {
      setSupported(false);
    }
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const getLanguageCode = () => {
    // Map preferred settings to speech synthesis locales
    const cleanLang = language.toLowerCase();
    if (cleanLang.includes("tamil") || cleanLang.includes("ta")) {
      return "ta-IN";
    }
    if (cleanLang.includes("hindi") || cleanLang.includes("hi")) {
      return "hi-IN";
    }
    return "en-IN"; // fallback to English-India
  };

  const startSpeaking = () => {
    if (!supported) {
      toast.warning("Text-to-speech is not supported on this browser.");
      return;
    }

    if (!text || !text.trim()) {
      toast.info("No content to read aloud.");
      return;
    }

    window.speechSynthesis.cancel(); // Cancel any existing speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getLanguageCode();
    utterance.rate = rate;

    utterance.onstart = () => {
      setSpeaking(true);
      setPaused(false);
    };

    utterance.onend = () => {
      setSpeaking(false);
      setPaused(false);
    };

    utterance.onerror = (e) => {
      console.error("SpeechSynthesis error:", e);
      setSpeaking(false);
      setPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const togglePause = () => {
    if (!speaking) return;

    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    } else {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  };

  if (!supported) {
    return (
      <span className="text-xs text-slate-400 italic">
        (Voice output unavailable on this device)
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
      {!speaking ? (
        <button
          onClick={startSpeaking}
          className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 transition uppercase tracking-wider"
          title="Read description aloud"
        >
          <Volume2 size={14} />
          Read Aloud
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={togglePause}
            className="flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:text-amber-700 transition"
          >
            {paused ? <Play size={12} /> : <Pause size={12} />}
            {paused ? "Resume" : "Pause"}
          </button>
          <button
            onClick={stopSpeaking}
            className="flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 transition"
          >
            <Square size={10} fill="currentColor" />
            Stop
          </button>
        </div>
      )}

      {/* Speed Rate Switcher */}
      <div className="h-4 w-px bg-slate-200 mx-1"></div>
      <button
        onClick={() => {
          const nextRate = rate === 1.0 ? 0.75 : 1.0;
          setRate(nextRate);
          toast.success(nextRate === 0.75 ? "Speech speed set to Slow" : "Speech speed set to Normal");
          if (speaking) {
            // Restart with new speed
            setTimeout(startSpeaking, 200);
          }
        }}
        className="text-[10px] font-bold text-slate-500 hover:text-slate-700 transition uppercase tracking-wider"
      >
        {rate === 0.75 ? "Speed: Slow" : "Speed: Normal"}
      </button>
    </div>
  );
};

export default ReadAloudButton;
