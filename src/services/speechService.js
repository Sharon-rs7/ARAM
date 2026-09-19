import api from "@/services/api";

export const speechService = {
  transcribeAudio: async (audioBlob, selectedLanguage = "auto", preferredOutputLanguage) => {
    const formData = new FormData();
    const ext = audioBlob.type?.includes("webm") ? "webm" :
                audioBlob.type?.includes("ogg") ? "ogg" :
                audioBlob.type?.includes("wav") ? "wav" : "webm";
    formData.append("file", audioBlob, `recording.${ext}`);
    const lang = selectedLanguage || "auto";
    formData.append("selectedLanguage", lang);
    formData.append("language", lang);
    if (preferredOutputLanguage) {
      formData.append("preferredOutputLanguage", preferredOutputLanguage);
    }
    const res = await api.post("/speech/transcribe", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  detectLanguage: async (text) => {
    const res = await api.post("/language/detect", { text });
    return res.data;
  },

  translateText: async (text, sourceLanguage, targetLanguage) => {
    const res = await api.post("/language/translate", { text, sourceLanguage, targetLanguage });
    return res.data;
  },

  normalizeText: async (text) => {
    const res = await api.post("/language/normalize", { text });
    return res.data;
  }
};
