import api from "./api";

// Global singleton state for audio playback
let currentAudio = null;
let currentUtterance = null;
let onStartCallback = null;
let onEndCallback = null;
let onErrorCallback = null;
let isSpeaking = false;
let isPaused = false;
let currentRate = 1.0;
let currentText = "";
let currentLang = "en-IN";

// Normalize languages to standard SpeechSynthesis locale strings
export const normalizeLanguage = (lang) => {
  if (!lang) return "en-IN";
  const l = lang.toLowerCase().trim();
  if (l.startsWith("ta") || l.includes("tamil")) {
    return "ta-IN";
  }
  if (l.startsWith("hi") || l.includes("hindi")) {
    return "hi-IN";
  }
  return "en-IN";
};

// Check if string contains mostly Latin characters (like English/Tanglish)
export const isLatinAlphabet = (text) => {
  if (!text) return true;
  // If the percentage of ASCII letters/numbers is high, treat as Latin alphabet
  const asciiCount = (text.match(/[\x00-\x7F]/g) || []).length;
  return asciiCount / text.length > 0.8;
};

export const voiceService = {
  stop: () => {
    // 1. Stop HTML5 Audio
    if (currentAudio) {
      try {
        currentAudio.pause();
      } catch (e) {}
      currentAudio = null;
    }
    // 2. Stop Browser SpeechSynthesis
    if (typeof window !== "undefined" && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    currentUtterance = null;
    isSpeaking = false;
    isPaused = false;
    if (onEndCallback) {
      try {
        onEndCallback();
      } catch (e) {}
    }
  },

  pause: () => {
    if (currentAudio) {
      currentAudio.pause();
      isPaused = true;
    } else if (typeof window !== "undefined" && window.speechSynthesis && isSpeaking) {
      window.speechSynthesis.pause();
      isPaused = true;
    }
  },

  resume: () => {
    if (currentAudio) {
      currentAudio.play().catch(console.error);
      isPaused = false;
    } else if (typeof window !== "undefined" && window.speechSynthesis && isSpeaking && isPaused) {
      window.speechSynthesis.resume();
      isPaused = false;
    }
  },

  setRate: (rate) => {
    currentRate = rate;
    if (currentAudio) {
      currentAudio.playbackRate = rate;
    }
  },

  getRate: () => currentRate,

  isPlaying: () => isSpeaking && !isPaused,
  isPaused: () => isPaused,
  getCurrentText: () => currentText,

  speak: async (text, rawLang, callbacks = {}) => {
    // Stop any active audio before starting new
    voiceService.stop();

    if (!text || !text.trim()) {
      if (callbacks.onError) callbacks.onError(new Error("No text provided"));
      return;
    }

    currentText = text;
    onStartCallback = callbacks.onStart;
    onEndCallback = callbacks.onEnd;
    onErrorCallback = callbacks.onError;

    // Resolve and normalize language
    let resolvedLang = normalizeLanguage(rawLang);
    
    // Core requirement: if text is in Latin script (e.g., Tanglish),
    // force en-IN voice so it doesn't sound like gibberish in Tamil synthesizer
    if (isLatinAlphabet(text) && resolvedLang !== "en-IN") {
      resolvedLang = "en-IN";
    }

    currentLang = resolvedLang;
    isSpeaking = true;
    isPaused = false;
    if (onStartCallback) {
      try {
        onStartCallback();
      } catch (e) {}
    }

    // 1. Attempt to fetch audio from backend TTS
    try {
      const response = await api.get("/ai/tts", {
        params: { text, lang: resolvedLang },
        responseType: "blob",
        timeout: 5000 // fail fast to let browser fallback work instantly
      });

      if (response.status === 200 && response.data && response.data.size > 0) {
        const audioUrl = URL.createObjectURL(response.data);
        currentAudio = new Audio(audioUrl);
        currentAudio.playbackRate = currentRate;
        
        currentAudio.onended = () => {
          isSpeaking = false;
          isPaused = false;
          if (onEndCallback) {
            try {
              onEndCallback();
            } catch (e) {}
          }
        };

        currentAudio.onerror = (e) => {
          console.warn("HTML5 audio playback error, falling back to browser SpeechSynthesis", e);
          voiceService.speakWithBrowserFallback(text, resolvedLang);
        };

        await currentAudio.play();
        return;
      }
    } catch (e) {
      console.warn("Backend TTS request failed, falling back to browser SpeechSynthesis:", e.message);
    }

    // 2. Browser fallback
    voiceService.speakWithBrowserFallback(text, resolvedLang);
  },

  speakWithBrowserFallback: (text, langCode) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      console.error("Browser text-to-speech not supported");
      isSpeaking = false;
      if (onErrorCallback) {
        try {
          onErrorCallback(new Error("SpeechSynthesis unsupported"));
        } catch (e) {}
      }
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      utterance.rate = currentRate;

      // Find custom voice matching language exactly if voices are loaded
      if (window.speechSynthesis.getVoices) {
        const voices = window.speechSynthesis.getVoices();
        const matchedVoice = voices.find(v => v.lang.toLowerCase().replace('_', '-') === langCode.toLowerCase()) ||
                             voices.find(v => v.lang.toLowerCase().startsWith(langCode.substring(0, 2)));
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
      }

      utterance.onstart = () => {
        isSpeaking = true;
        isPaused = false;
      };

      utterance.onend = () => {
        isSpeaking = false;
        isPaused = false;
        if (onEndCallback) {
          try {
            onEndCallback();
          } catch (e) {}
        }
      };

      utterance.onerror = (e) => {
        console.error("Browser SpeechSynthesis error:", e);
        isSpeaking = false;
        isPaused = false;
        if (onErrorCallback) {
          try {
            onErrorCallback(e);
          } catch (err) {}
        }
      };

      currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Failed to speak using SpeechSynthesis", err);
      isSpeaking = false;
      if (onErrorCallback) {
        try {
          onErrorCallback(err);
        } catch (e) {}
      }
    }
  }
};

// Global event listener to stop speech on route transitions/unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => voiceService.stop());
  window.addEventListener("popstate", () => voiceService.stop());
}
