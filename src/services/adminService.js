import api, { USE_MOCKS } from "./api";
import { getMockUsers, getMockComplaints, getMockDepartments, getMockAuditLogs, setMockUsers, setMockComplaints } from "../data/mock";

export const adminService = {
  getDashboard: async () => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const users = getMockUsers();
      const complaints = getMockComplaints();
      const volunteers = users.filter((u) => u.role === "VOLUNTEER");
      
      return {
        totalComplaints: complaints.length,
        pendingComplaints: complaints.filter((c) => c.status === "PENDING").length,
        underReviewComplaints: complaints.filter((c) => c.status === "UNDER_REVIEW").length,
        resolvedComplaints: complaints.filter((c) => c.status === "RESOLVED").length,
        totalUsers: users.length,
        totalVolunteers: volunteers.length,
        pendingVolunteers: volunteers.filter((v) => !v.helperVerified).length,
      };
    }
    
    const res = await api.get("/admin/dashboard");
    return res.data;
  },

  getUsers: async () => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return getMockUsers();
    }
    const res = await api.get("/admin/users");
    return res.data;
  },

  getComplaints: async () => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return getMockComplaints();
    }
    const res = await api.get("/admin/complaints");
    return res.data;
  },

  getVolunteers: async () => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const users = getMockUsers();
      return users.filter((u) => u.role === "VOLUNTEER");
    }
    const res = await api.get("/admin/helpers");
    return res.data;
  },

  getDepartments: async () => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return getMockDepartments();
    }
    const res = await api.get("/admin/departments");
    return res.data;
  },

  getReports: async () => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return {
        complaintsByCategory: {
          LABOUR_DISPUTE: 10,
          CYBER_CRIME: 18,
          CONSUMER_COMPLAINT: 6,
          PROPERTY_CIVIL_DISPUTE: 12,
          WOMEN_SAFETY_DOMESTIC_VIOLENCE: 14,
          CRIMINAL_COMPLAINT: 5
        },
        resolutionRate: 74,
        averageTriageTimeHours: 2.5
      };
    }
    const res = await api.get("/admin/reports");
    return res.data;
  },

  getAuditLogs: async () => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return getMockAuditLogs();
    }
    const res = await api.get("/admin/audit-logs");
    return res.data;
  },

  verifyVolunteer: async (id) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const users = getMockUsers();
      const updated = users.map((u) => u.id === id ? { ...u, helperVerified: true, status: "ACTIVE" } : u);
      setMockUsers(updated);
      return { success: true };
    }
    const res = await api.put(`/admin/helpers/${id}/verify`);
    return res.data;
  },

  rejectVolunteer: async (id) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const users = getMockUsers();
      const updated = users.map((u) => u.id === id ? { ...u, helperVerified: false, status: "SUSPENDED" } : u);
      setMockUsers(updated);
      return { success: true };
    }
    const res = await api.put(`/admin/helpers/${id}/reject`);
    return res.data;
  },

  suspendUser: async (id) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const users = getMockUsers();
      const updated = users.map((u) => u.id === id ? { ...u, status: "SUSPENDED" } : u);
      setMockUsers(updated);
      return { success: true };
    }
    const res = await api.put(`/admin/users/${id}`, { status: "SUSPENDED" });
    return res.data;
  },

  activateUser: async (id) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const users = getMockUsers();
      const updated = users.map((u) => u.id === id ? { ...u, status: "ACTIVE" } : u);
      setMockUsers(updated);
      return { success: true };
    }
    const res = await api.put(`/admin/users/${id}`, { status: "ACTIVE" });
    return res.data;
  },

  deleteUser: async (id) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const users = getMockUsers();
      const updated = users.map((u) => u.id === id ? { ...u, status: "DELETED" } : u);
      setMockUsers(updated);
      return { success: true };
    }
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
  },

  assignVolunteer: async (complaintId, volunteerId) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const complaints = getMockComplaints();
      const updated = complaints.map((c) => 
        c.id === complaintId 
          ? { ...c, assignedHelperId: volunteerId, status: "UNDER_REVIEW", updatedAt: new Date().toISOString() } 
          : c
      );
      setMockComplaints(updated);
      return { success: true };
    }
    const res = await api.put(`/admin/complaints/${complaintId}/assign-helper`, { helperId: volunteerId });
    return res.data;
  }
};
