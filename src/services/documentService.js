import api from "@/services/api";

export const documentService = {
  uploadDocument: async (formData) => {
    const res = await api.post("/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
  },

  verifyDocument: async (fileOrFormData, expectedType = "DEED", category = "GENERAL") => {
    let data;
    if (fileOrFormData instanceof FormData) {
      data = fileOrFormData;
    } else {
      data = new FormData();
      data.append("file", fileOrFormData);
      data.append("expectedDocumentType", expectedType || "DEED");
      data.append("complaintCategory", category || "GENERAL");
    }
    const res = await api.post("/documents/verify-ai", data, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
  },

  getComplaintDocuments: async (complaintId) => {
    const res = await api.get(`/documents/complaint/${complaintId}`);
    return res.data;
  },

  getDocumentVerification: async (documentId) => {
    const res = await api.get(`/documents/${documentId}/verification`);
    return res.data;
  },

  downloadDocumentUrl: (documentId) => {
    return `/api/documents/download/${documentId}`;
  }
};
export default documentService;
