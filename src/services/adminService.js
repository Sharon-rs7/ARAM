import api from "@/services/api";

export const adminService = {
  getDashboard: async () => {
    const res = await api.get("/admin/dashboard");
    const d = res.data;
    const total = d.totalComplaints || ((d.submittedComplaints || 0) + (d.inProgressComplaints || 0) + (d.resolvedComplaints || 0));
    return {
      totalComplaints: total,
      pendingComplaints: d.submittedComplaints || 0,
      underReviewComplaints: d.inProgressComplaints || 0,
      resolvedComplaints: d.resolvedComplaints || 0,
      totalUsers: d.totalUsers || 0,
      totalVolunteers: d.helperUsers || 0,
      pendingVolunteers: 0,
      highPriorityComplaints: d.highPriorityComplaints || 0,
      categoryCounts: d.categoryCounts || {}
    };
  },

  getUsers: async () => {
    const res = await api.get("/admin/users");
    return res.data;
  },

  getComplaints: async () => {
    const res = await api.get("/admin/complaints");
    return res.data;
  },

  getVolunteers: async () => {
    const res = await api.get("/admin/helpers");
    return res.data;
  },

  getDepartments: async () => {
    const res = await api.get("/admin/departments");
    return res.data;
  },

  getReports: async () => {
    const res = await api.get("/admin/reports");
    return res.data;
  },

  getAuditLogs: async (params = {}) => {
    const res = await api.get("/admin/audit-logs", { params });
    return res.data;
  },

  verifyVolunteer: async (id) => {
    const res = await api.put(`/admin/helpers/${id}/verify`);
    return res.data;
  },

  rejectVolunteer: async (id) => {
    const res = await api.put(`/admin/helpers/${id}/reject`);
    return res.data;
  },

  suspendUser: async (id) => {
    const res = await api.put(`/admin/users/${id}`, { status: "SUSPENDED" });
    return res.data;
  },

  activateUser: async (id) => {
    const res = await api.put(`/admin/users/${id}`, { status: "ACTIVE" });
    return res.data;
  },

  deleteUser: async (id) => {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
  },

  assignVolunteer: async (complaintId, volunteerId, overrideReason = "", adminNote = "") => {
    const res = await api.post(`/admin/complaints/${complaintId}/assign-legal-guide`, {
      legalGuideId: volunteerId,
      overrideReason,
      adminNote
    });
    return res.data;
  },

  updateComplaintStatus: async (complaintId, status, note = "") => {
    const res = await api.put(`/admin/complaints/${complaintId}/status`, { status, note });
    return res.data;
  },

  getRecommendedGuides: async (complaintId) => {
    const res = await api.get(`/admin/complaints/${complaintId}/recommended-guides`);
    return res.data;
  },

  createVolunteer: async (data) => {
    const res = await api.post("/admin/helpers", data);
    return res.data;
  },

  recommendVolunteers: async (complaintId) => {
    const res = await api.get(`/admin/complaints/${complaintId}/recommend-volunteers`);
    return res.data;
  },

  assignVolunteerWithReason: async (complaintId, volunteerId, overrideReason) => {
    const res = await api.patch(`/admin/complaints/${complaintId}/assign-volunteer`, { volunteerId, overrideReason });
    return res.data;
  },

  getComplaintTrends: async () => {
    const res = await api.get("/admin/analytics/complaint-trends");
    return res.data;
  },

  getCategoryDistribution: async () => {
    const res = await api.get("/admin/analytics/category-distribution");
    return res.data;
  },

  getVolunteerWorkload: async () => {
    const res = await api.get("/admin/analytics/volunteer-workload");
    return res.data;
  },

  getVolunteerActivity: async () => {
    const res = await api.get("/admin/analytics/volunteer-activity");
    return res.data;
  },

  getActionPlan: async (complaintId) => {
    const res = await api.get(`/admin/complaints/${complaintId}/action-plan`);
    return res.data;
  },

  getAuthorityOffices: async () => {
    const res = await api.get("/admin/authority-offices");
    return res.data;
  },

  createAuthorityOffice: async (payload) => {
    const res = await api.post("/admin/authority-offices", payload);
    return res.data;
  },

  updateAuthorityOffice: async (id, payload) => {
    const res = await api.put(`/admin/authority-offices/${id}`, payload);
    return res.data;
  },

  getDistrictMetrics: async () => {
    const res = await api.get("/admin/districts/metrics");
    return res.data;
  },

  createAdmin: async (payload) => {
    const res = await api.post("/admin/superadmin/admins/create", payload);
    return res.data;
  },

  inviteAdmin: async (payload) => {
    const res = await api.post("/admin/superadmin/admins/invite", payload);
    return res.data;
  },

  resendAdminInvitation: async (email) => {
    const res = await api.post("/admin/superadmin/invitations/resend", { email });
    return res.data;
  },

  updateUserStatus: async (id, status) => {
    const res = await api.put(`/admin/superadmin/users/${id}/status`, { status });
    return res.data;
  },

  deleteAuthorityOffice: async (id) => {
    const res = await api.delete(`/admin/authority-offices/${id}`);
    return res.data;
  }
};
export default adminService;
