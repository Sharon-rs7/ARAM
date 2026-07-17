import api, { USE_MOCKS } from "./api";
import { getMockComplaints, setMockComplaints } from "../data/mock";

export const volunteerService = {
  getDashboard: async () => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
      if (!currentUser) return {};
      
      const complaints = getMockComplaints().filter((c) => c.assignedHelperId === currentUser.id);
      
      return {
        assignedCases: complaints.length,
        pendingReviews: complaints.filter((c) => c.status === "UNDER_REVIEW" && !c.legalOpinion).length,
        resolvedCases: complaints.filter((c) => c.status === "RESOLVED").length,
        criticalCases: complaints.filter((c) => c.priority === "CRITICAL").length
      };
    }
    
    const res = await api.get("/volunteer/dashboard");
    return res.data;
  },

  getAssignedCases: async () => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
      if (!currentUser) return [];
      
      const complaints = getMockComplaints();
      return complaints.filter((c) => c.assignedHelperId === currentUser.id);
    }
    
    const res = await api.get("/helper/cases");
    return res.data;
  },

  getCaseById: async (id) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const complaints = getMockComplaints();
      const complaint = complaints.find((c) => c.id === id);
      if (!complaint) {
        throw new Error("Case not found.");
      }
      return complaint;
    }
    
    const res = await api.get(`/helper/cases/${id}`);
    return res.data;
  },

  submitReview: async (id, payload) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const complaints = getMockComplaints();
      const updated = complaints.map((c) => 
        c.id === id 
          ? { 
              ...c, 
              legalOpinion: payload.notes || payload.legalOpinion, 
              status: payload.status || "RESOLVED", 
              updatedAt: new Date().toISOString() 
            } 
          : c
      );
      setMockComplaints(updated);
      return { success: true, message: "Review and recommendations submitted successfully." };
    }
    
    // Spring Boot supports update status + notes
    const res = await api.put(`/helper/cases/${id}/status`, payload);
    return res.data;
  }
};
