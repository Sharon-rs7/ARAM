import api from "@/services/api";

export const complaintService = {
  checkSimilarity: async (payload) => {
    let category = payload.category;
    if (category === "PROPERTY_DISPUTE") {
      category = "PROPERTY_CIVIL_DISPUTE";
    } else if (category === "GOVERNMENT_SCHEME") {
      category = "GENERAL_LEGAL_AID";
    }
    const apiPayload = { ...payload, category };
    const res = await api.post("/complaints/check-similarity", apiPayload);
    return res.data;
  },

  submitComplaint: async (payload) => {
    let category = payload.category;
    if (category === "PROPERTY_DISPUTE") {
      category = "PROPERTY_CIVIL_DISPUTE";
    } else if (category === "GOVERNMENT_SCHEME") {
      category = "GENERAL_LEGAL_AID";
    }
    const apiPayload = { ...payload, category };
    const res = await api.post("/complaints", apiPayload);
    return res.data;
  },

  createComplaint: async (payload) => {
    return complaintService.submitComplaint(payload);
  },

  getMyComplaints: async () => {
    const res = await api.get("/complaints/my");
    return res.data || [];
  },

  getComplaintById: async (id) => {
    const res = await api.get(`/complaints/${id}`);
    return res.data;
  },

  getTimeline: async (id) => {
    const res = await api.get(`/complaints/${id}/timeline`);
    return res.data || [];
  },

  getFeedback: async (id) => {
    const res = await api.get(`/complaints/${id}/feedback`);
    return res.data;
  },

  submitFeedback: async (idOrPayload, payload) => {
    let body = {};
    if (typeof idOrPayload === "object" && idOrPayload !== null) {
      body = idOrPayload;
    } else {
      body = { ...payload, complaintId: idOrPayload };
    }
    const res = await api.post("/feedback", body);
    return res.data;
  },

  getDocumentRequests: async (complaintId) => {
    const res = await api.get(`/documents/requests/complaint/${complaintId}`);
    return res.data || [];
  },

  uploadRequestedDocument: async (requestId, complaintId, formData) => {
    const res = await api.put(`/documents/requests/${requestId}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
  },

  getAppointments: async (complaintId) => {
    const res = await api.get(`/appointments/complaint/${complaintId}`);
    return res.data || [];
  },

  requestCall: async (payload) => {
    const res = await api.post("/appointments", payload);
    return res.data;
  },

  getCaseNotes: async (complaintId) => {
    const res = await api.get(`/cases/${complaintId}/notes`);
    return res.data || [];
  },

  updateWorkflowStatus: async (complaintId, payload) => {
    const res = await api.put(`/complaints/${complaintId}/status-update`, payload);
    return res.data;
  },

  getAuthorityLocations: async (complaintId, lat, lng) => {
    let url = `/citizen/complaints/${complaintId}/authority-locations`;
    if (lat && lng) {
      url += `?lat=${lat}&lng=${lng}`;
    }
    const res = await api.get(url);
    return res.data || [];
  },

  cancelComplaint: async (id, reason) => {
    const res = await api.post(`/complaints/${id}/cancel`, { reason });
    return res.data;
  },

  uploadComplaintDocument: async (id, formData) => {
    const res = await api.post(`/complaints/${id}/documents`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
  },

  getReport: async (id) => {
    const res = await api.get(`/complaints/${id}/report`, { responseType: "blob" });
    return res.data;
  }
};
