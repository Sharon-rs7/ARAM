import api from "@/services/api";

export const documentService = {
  uploadDocument: async (formData) => {
    const res = await api.post("/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
  },

  verifyDocument: async (formData) => {
    const res = await api.post("/documents/verify-ai", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
  }
};
export default documentService;
