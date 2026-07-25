import api from "./api";

export const speechService = {
  transcribeAudio: async (audioBlob, selectedLanguage, preferredOutputLanguage) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.wav");
    if (selectedLanguage) {
      formData.append("selectedLanguage", selectedLanguage);
    }
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
