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

  getAuditLogs: async (params = {}) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const mockLogs = getMockAuditLogs();
      return {
        content: mockLogs,
        currentPage: 0,
        totalElements: mockLogs.length,
        totalPages: 1,
        size: 10
      };
    }
    const res = await api.get("/admin/audit-logs", { params });
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

  assignVolunteer: async (complaintId, volunteerId, overrideReason = "", adminNote = "") => {
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
    const res = await api.post(`/admin/complaints/${complaintId}/assign-legal-guide`, {
      legalGuideId: volunteerId,
      overrideReason,
      adminNote
    });
    return res.data;
  },

  getRecommendedGuides: async (complaintId) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return [
        {
          legalGuideId: 2,
          name: "Sharon Mary",
          languages: "English, Tamil",
          specializations: "Labour dispute, Cyber crime",
          gender: "FEMALE",
          womenSupportTrained: true,
          workload: "1 / 5",
          matchScore: 90,
          matchLabel: "Excellent Match",
          recommendationReason: "Language matched (Tamil). Specialization matched (Labour dispute). Women support trained badge. Low workload occupancy."
        }
      ];
    }
    const res = await api.get(`/admin/complaints/${complaintId}/recommended-guides`);
    return res.data;
  },

  createVolunteer: async (data) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const users = getMockUsers();
      const newUser = {
        id: "VOL" + (users.length + 1),
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        role: "VOLUNTEER",
        status: "ACTIVE",
        gender: data.gender,
        specialization: data.specializationCategories,
        helperVerified: true,
        district: data.district,
        languagesKnown: data.languagesKnown,
        maxActiveCases: data.maxActiveCases || 5,
        currentActiveCases: 0,
        availabilityStatus: "AVAILABLE",
        womenSupportTrained: data.womenSupportTrained || false,
        canHandleSensitiveCases: data.canHandleSensitiveCases || false
      };
      setMockUsers([...users, newUser]);
      return newUser;
    }
    const res = await api.post("/admin/helpers", data);
    return res.data;
  },

  recommendVolunteers: async (complaintId) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const users = getMockUsers();
      const volunteers = users.filter((u) => u.role === "VOLUNTEER" || u.role === "HELPER");
      return volunteers.map((v, i) => ({
        id: v.id,
        name: v.name,
        gender: v.gender || "ANY",
        languagesKnown: v.languagesKnown ? v.languagesKnown.split(",") : ["English"],
        matchScore: 95 - (i * 10),
        reason: "Matches required legal category specialization; fluent in English; active case capacity"
      }));
    }
    const res = await api.get(`/admin/complaints/${complaintId}/recommend-volunteers`);
    return res.data;
  },

  assignVolunteerWithReason: async (complaintId, volunteerId, overrideReason) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { success: true };
    }
    const res = await api.patch(`/admin/complaints/${complaintId}/assign-volunteer`, { volunteerId, overrideReason });
    return res.data;
  },

  getComplaintTrends: async () => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return [
        { month: "Jan", count: 12 },
        { month: "Feb", count: 18 },
        { month: "Mar", count: 25 },
        { month: "Apr", count: 20 },
        { month: "May", count: 28 },
        { month: "Jun", count: 35 }
      ];
    }
    const res = await api.get("/admin/analytics/complaint-trends");
    return res.data;
  },

  getCategoryDistribution: async () => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return [
        { category: "LABOUR_DISPUTE", displayName: "Labour Dispute", count: 10, percentage: 10.0 },
        { category: "CYBER_CRIME", displayName: "Cyber Crime", count: 18, percentage: 18.0 },
        { category: "CONSUMER_COMPLAINT", displayName: "Consumer Complaint", count: 6, percentage: 6.0 },
        { category: "PROPERTY_CIVIL_DISPUTE", displayName: "Property / Civil Dispute", count: 12, percentage: 12.0 },
        { category: "WOMEN_SAFETY_DOMESTIC_VIOLENCE", displayName: "Women Safety / Domestic Violence", count: 14, percentage: 14.0 },
        { category: "CRIMINAL_COMPLAINT", displayName: "Criminal Complaint", count: 5, percentage: 5.0 }
      ];
    }
    const res = await api.get("/admin/analytics/category-distribution");
    return res.data;
  },

  getVolunteerWorkload: async () => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        volunteers: [],
        districts: [
          { district: "Coimbatore", currentActiveCases: 17, maxActiveCases: 20, utilization: 85.0 },
          { district: "Chennai", currentActiveCases: 9, maxActiveCases: 20, utilization: 45.0 },
          { district: "Madurai", currentActiveCases: 12, maxActiveCases: 20, utilization: 60.0 }
        ]
      };
    }
    const res = await api.get("/admin/analytics/volunteer-workload");
    return res.data;
  },

  getVolunteerActivity: async () => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        totalSessions: 15,
        activeNow: 3,
        totalScreenTimeSeconds: 12500,
        totalActions: 45
      };
    }
    const res = await api.get("/admin/analytics/volunteer-activity");
    return res.data;
  },

  getActionPlan: async (complaintId) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const plans = localStorage.getItem("mock_action_plans") ? JSON.parse(localStorage.getItem("mock_action_plans")) : {};
      return plans[complaintId] || null;
    }
    const res = await api.get(`/admin/complaints/${complaintId}/action-plan`);
    return res.data;
  },

  getAuthorityOffices: async () => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (!localStorage.getItem("mock_authority_offices")) {
        const defaultOffices = [
          {
            id: 1,
            name: "Coimbatore Labour Department Office",
            authorityType: "Labour Department",
            categorySupported: "LABOUR_DISPUTE",
            district: "Coimbatore",
            area: "Coimbatore Town",
            address: "Labour Commissioner Office, Chinthamani, Coimbatore - 641045",
            phone: "0422-2245678",
            email: "labour.cbe@tn.gov.in",
            website: "https://labour.tn.gov.in",
            workingHours: "10:00 AM - 05:45 PM",
            latitude: 11.0168,
            longitude: 76.9558,
            mapsUrl: "https://www.google.com/maps/search/?api=1&query=Labour+Department+Office+Coimbatore",
            onlinePortalUrl: "https://labour.tn.gov.in/online-portal",
            active: true
          },
          {
            id: 2,
            name: "Chennai Cyber Crime Cell Headquarters",
            authorityType: "Cyber Crime Cell",
            categorySupported: "CYBER_CRIME",
            district: "Chennai",
            area: "Egmore",
            address: "Commissionerate of Police, Vepery High Road, Egmore, Chennai - 600008",
            phone: "044-25615086",
            email: "cybercell.chn@tn.gov.in",
            website: "https://eservices.tnpolice.gov.in",
            workingHours: "24 Hours Open",
            latitude: 13.0837,
            longitude: 80.2593,
            mapsUrl: "https://www.google.com/maps/search/?api=1&query=Cyber+Crime+Cell+Headquarters+Chennai",
            onlinePortalUrl: "https://cybercrime.gov.in",
            active: true
          }
        ];
        localStorage.setItem("mock_authority_offices", JSON.stringify(defaultOffices));
      }
      return JSON.parse(localStorage.getItem("mock_authority_offices"));
    }
    const res = await api.get("/admin/authority-offices");
    return res.data;
  },

  createAuthorityOffice: async (payload) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const offices = localStorage.getItem("mock_authority_offices") ? JSON.parse(localStorage.getItem("mock_authority_offices")) : [];
      const newOffice = {
        ...payload,
        id: Math.floor(Math.random() * 1000)
      };
      offices.push(newOffice);
      localStorage.setItem("mock_authority_offices", JSON.stringify(offices));
      return newOffice;
    }
    const res = await api.post("/admin/authority-offices", payload);
    return res.data;
  },

  updateAuthorityOffice: async (id, payload) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const offices = localStorage.getItem("mock_authority_offices") ? JSON.parse(localStorage.getItem("mock_authority_offices")) : [];
      const updated = offices.map((o) => (String(o.id) === String(id) ? { ...o, ...payload } : o));
      localStorage.setItem("mock_authority_offices", JSON.stringify(updated));
      return { ...payload, id };
    }
    const res = await api.put(`/admin/authority-offices/${id}`, payload);
    return res.data;
  },

  deleteAuthorityOffice: async (id) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const offices = localStorage.getItem("mock_authority_offices") ? JSON.parse(localStorage.getItem("mock_authority_offices")) : [];
      const filtered = offices.filter((o) => String(o.id) !== String(id));
      localStorage.setItem("mock_authority_offices", JSON.stringify(filtered));
      return { success: true };
    }
    const res = await api.delete(`/admin/authority-offices/${id}`);
    return res.data;
  }
};
