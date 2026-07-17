import api, { USE_MOCKS } from "./api";
import { getMockComplaints, setMockComplaints } from "../data/mock";

export const complaintService = {
  submitComplaint: async (payload) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const complaints = getMockComplaints();
      
      const newComplaint = {
        id: `cmp-${101 + complaints.length}`,
        userId: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).id : "usr-1",
        title: payload.title,
        description: payload.description,
        language: payload.preferredLanguage || "ENGLISH",
        district: payload.district,
        inputMode: payload.inputMode || "TEXT",
        transcribedText: payload.transcribedText || "",
        transcriptionConfidence: payload.transcriptionConfidence || 1.0,
        category: payload.category || "GENERAL_LEGAL_AID",
        priority: payload.priority || "MEDIUM",
        priorityScore: payload.priorityScore || 50,
        status: "PENDING",
        assignedHelperId: "",
        sensitive: Boolean(payload.sensitive),
        preferredHelperGender: payload.preferredHelperGender || "ANY",
        identityVisibility: payload.identityVisibility || "VISIBLE",
        legalOpinion: "",
        authorityRemarks: "",
        requiredDocuments: "Aadhaar Card, Proof of incident",
        nextSteps: "Awaiting legal helper review.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      complaints.unshift(newComplaint);
      setMockComplaints(complaints);
      return newComplaint;
    }
    
    const res = await api.post("/complaints", payload);
    return res.data;
  },

  getMyComplaints: async () => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const complaints = getMockComplaints();
      const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
      if (!currentUser) return [];
      
      return complaints.filter((c) => c.userId === currentUser.id);
    }
    
    const res = await api.get("/complaints/my");
    return res.data;
  },

  getComplaintById: async (id) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const complaints = getMockComplaints();
      const complaint = complaints.find((c) => c.id === id);
      if (!complaint) {
        throw new Error("Complaint not found.");
      }
      return complaint;
    }
    
    const res = await api.get(`/complaints/${id}`);
    return res.data;
  },

  uploadComplaintDocument: async (id, formData) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return { success: true, message: "Document uploaded and attached successfully." };
    }
    
    const res = await api.post(`/documents/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  }
};
