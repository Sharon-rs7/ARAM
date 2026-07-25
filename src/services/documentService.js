import api, { USE_MOCKS } from "./api";

export const documentService = {
  uploadDocument: async (formData) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        id: `doc-${Date.now()}`,
        fileName: "unpaid_salary_proof.pdf",
        status: "PENDING",
        uploadedAt: new Date().toISOString()
      };
    }
    const res = await api.post("/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
  },

  verifyDocument: async (formData) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // Random mock verification
      const score = 0.82;
      return {
        documentType: formData.get("expectedDocumentType") || "Salary Slip",
        ocrTextMasked: "Retail Invoice. GSTIN: 33XXXXX1111X1Z1. Total Amount Paid: Rs. XXXX. Payment Mode: UPI scanner.",
        ocrConfidence: 0.89,
        cnnConfidence: 0.80,
        keywordScore: 0.85,
        finalScore: score,
        status: "VERIFIED",
        matchedKeywords: ["salary", "invoice", "statement"],
        missingKeywords: []
      };
    }
    const res = await api.post("/documents/verify-ai", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
  }
};
