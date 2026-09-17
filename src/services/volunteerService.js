import api from "@/services/api";

export const volunteerService = {
  getDashboard: async () => {
    const res = await api.get("/helper/dashboard");
    return res.data;
  },

  getAssignedCases: async () => {
    const res = await api.get("/helper/cases");
    return res.data || [];
  },

  getCaseById: async (id) => {
    const res = await api.get(`/helper/cases/${id}`);
    return res.data;
  },

  acknowledgeCase: async (id) => {
    const res = await api.post(`/helper/cases/${id}/acknowledge`);
    return res.data;
  },

  acceptCase: async (id) => {
    const res = await api.post(`/helper/cases/${id}/accept`);
    return res.data;
  },

  updateAvailability: async (status) => {
    const res = await api.put("/helper/availability", { status });
    return res.data;
  },

  updateCaseStatus: async (id, status, notes) => {
    const res = await api.patch(`/helper/cases/${id}/status`, { status, notes });
    return res.data;
  },

  updateActionPlan: async (id, actionPlan) => {
    const res = await api.put(`/helper/cases/${id}/action-plan`, actionPlan);
    return res.data;
  },

  addCaseNote: async (id, note) => {
    const res = await api.post(`/helper/cases/${id}/notes`, { note });
    return res.data;
  },

  resolveCase: async (id, payloadOrSummary, resolutionType) => {
    let body = {};
    if (typeof payloadOrSummary === "object" && payloadOrSummary !== null) {
      body = payloadOrSummary;
    } else {
      body = {
        resolutionSummary: payloadOrSummary,
        resolutionType: resolutionType || "COMMUNITY_MEDIATION"
      };
    }
    const res = await api.post(`/volunteer/cases/${id}/resolve`, body);
    return res.data;
  },

  markResolved: async (id, resolutionSummary, resolutionType) => {
    return volunteerService.resolveCase(id, resolutionSummary, resolutionType);
  },

  requestDocument: async (id, payload) => {
    const res = await api.post(`/volunteer/cases/${id}/request-documents`, payload);
    return res.data;
  },

  escalateCase: async (id, reason) => {
    const res = await api.post(`/volunteer/cases/${id}/escalate`, { reason });
    return res.data;
  },

  getDocuments: async (id) => {
    const res = await api.get(`/volunteer/cases/${id}/documents`);
    return res.data || [];
  },

  verifyDocument: async (documentId) => {
    const res = await api.put(`/volunteer/documents/${documentId}/verify`);
    return res.data;
  },

  rejectDocument: async (documentId) => {
    const res = await api.put(`/volunteer/documents/${documentId}/reject`);
    return res.data;
  },

  submitSelfEvaluation: async (id, payload) => {
    const res = await api.post(`/volunteer/cases/${id}/self-evaluation`, payload);
    return res.data;
  },

  getSelfEvaluation: async (id) => {
    const res = await api.get(`/volunteer/cases/${id}/self-evaluation`);
    return res.data;
  },

  getAnalytics: async () => {
    const res = await api.get("/helper/analytics");
    return res.data;
  }
};
