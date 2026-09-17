import React from "react";
import { Volume2, Play, Pause, Square } from "lucide-react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

const ReadAloudButton = ({ text, language = "en-IN" }) => {
  const { isPlaying, isPaused, currentText, rate, play, pause, resume, stop, changeRate } = useTextToSpeech();

  const handleStart = () => {
    play(text, language);
  };

  const handleTogglePause = () => {
    if (isPaused) {
      resume();
    } else {
      pause();
    }
  };

  const handleRateChange = () => {
    const nextRate = rate === 1.0 ? 0.75 : 1.0;
    changeRate(nextRate);
  };

  const isActive = currentText === text;
  const showControls = isActive && (isPlaying || isPaused);

  return (
    <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
      {!showControls ? (
        <button
          onClick={handleStart}
          className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 transition uppercase tracking-wider cursor-pointer"
          title="Read description aloud"
        >
          <Volume2 size={14} />
          Read Aloud
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePause}
            className="flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:text-amber-700 transition cursor-pointer"
          >
            {isPaused ? <Play size={12} /> : <Pause size={12} />}
            {isPaused ? "Resume" : "Pause"}
          </button>
          <button
            onClick={stop}
            className="flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 transition cursor-pointer"
          >
            <Square size={10} fill="currentColor" />
            Stop
          </button>
        </div>
      )}

      {/* Speed Rate Switcher */}
      <div className="h-4 w-px bg-slate-200 mx-1"></div>
      <button
        onClick={handleRateChange}
        className="text-[10px] font-bold text-slate-500 hover:text-slate-700 transition uppercase tracking-wider cursor-pointer"
      >
        {rate === 0.75 ? "Speed: Slow" : "Speed: Normal"}
      </button>
    </div>
  );
};

export default ReadAloudButton;
