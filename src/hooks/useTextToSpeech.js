import { useState, useEffect } from "react";
import { voiceService } from "@/services/voiceService";

export const useTextToSpeech = () => {
  const [isPlaying, setIsPlaying] = useState(voiceService.isPlaying());
  const [isPaused, setIsPaused] = useState(voiceService.isPaused());
  const [rate, setRate] = useState(voiceService.getRate());
  const [currentText, setCurrentText] = useState(voiceService.getCurrentText() || "");

  useEffect(() => {
    // Keep local hook state synchronized with global voiceService singleton
    const interval = setInterval(() => {
      setIsPlaying(voiceService.isPlaying());
      setIsPaused(voiceService.isPaused());
      setRate(voiceService.getRate());
      setCurrentText(voiceService.getCurrentText() || "");
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const play = (text, lang) => {
    voiceService.speak(text, lang, {
      onStart: () => {
        setIsPlaying(true);
        setIsPaused(false);
        setCurrentText(text);
      },
      onEnd: () => {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentText("");
      },
      onError: () => {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentText("");
      }
    });
  };

  const pause = () => {
    voiceService.pause();
    setIsPaused(true);
  };

  const resume = () => {
    voiceService.resume();
    setIsPaused(false);
  };

  const stop = () => {
    voiceService.stop();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentText("");
  };

  const changeRate = (newRate) => {
    voiceService.setRate(newRate);
    setRate(newRate);
  };

  return {
    isPlaying,
    isPaused,
    rate,
    currentText,
    play,
    pause,
    resume,
    stop,
    changeRate
  };
};
