import api from "@/services/api";

export const regionalAdminService = {
  getDashboardStats: async (district) => {
    const res = await api.get(`/regional-admin/dashboard?district=${encodeURIComponent(district)}`);
    return res.data;
  },

  getAnalytics: async (district, range = "30d") => {
    const res = await api.get(`/regional-admin/analytics?district=${encodeURIComponent(district)}&range=${encodeURIComponent(range)}`);
    return res.data;
  },

  getComplaints: async (district) => {
    const res = await api.get(`/regional-admin/complaints?district=${encodeURIComponent(district)}`);
    return res.data;
  },

  getCitizens: async (district) => {
    const res = await api.get(`/regional-admin/citizens?district=${encodeURIComponent(district)}`);
    return res.data;
  },

  getGuides: async (district) => {
    const res = await api.get(`/regional-admin/guides?district=${encodeURIComponent(district)}`);
    return res.data;
  },

  getAdminUser: async (district) => {
    const res = await api.get(`/regional-admin/admin-user?district=${encodeURIComponent(district)}`);
    return res.data;
  },

  getRecommendedGuides: async (complaintId) => {
    const res = await api.get(`/regional-admin/complaints/${complaintId}/recommend-guides`);
    return res.data;
  },

  assignGuide: async (complaintId, guideId, overrideReason = "", adminNote = "") => {
    const res = await api.post(`/regional-admin/complaints/${complaintId}/assign-guide/${guideId}`, {
      legalGuideId: guideId,
      overrideReason,
      adminNote
    });
    return res.data;
  }
};
