import api, { USE_MOCKS } from "./api";
import { getMockComplaints, setMockComplaints } from "../data/mock";

export const volunteerService = {
  getDashboard: async () => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
      if (!currentUser) return {};
      
      const complaints = getMockComplaints().filter((c) => c.assignedHelperId === currentUser.id || c.assignedHelper?.id === currentUser.id);
      
      return {
        volunteer: {
          id: currentUser.id,
          name: currentUser.name || "Sharon Mary",
          email: currentUser.email || "volunteer@aram.ai",
          role: "HELPER",
          verified: true,
          availabilityStatus: currentUser.availabilityStatus || "AVAILABLE",
          languages: currentUser.languagesKnown ? currentUser.languagesKnown.split(",") : ["English", "Tamil"],
          specializations: currentUser.specialization ? currentUser.specialization.split(",") : ["Labour Rights", "Consumer Protection"],
          currentActiveCases: complaints.filter(c => c.status !== "RESOLVED").length,
          maxActiveCases: currentUser.maxActiveCases || 8,
          successRate: 95
        },
        stats: {
          assigned: complaints.length,
          pending: complaints.filter((c) => c.status === "UNDER_REVIEW" || c.status === "AI_ANALYZED" || c.status === "HELPER_ASSIGNED" || c.status === "SUBMITTED").length,
          inProgress: complaints.filter((c) => c.status === "IN_PROGRESS").length,
          resolved: complaints.filter((c) => c.status === "RESOLVED").length,
          highPriority: complaints.filter((c) => c.priority === "HIGH" || c.priority === "CRITICAL").length,
          womenSensitive: complaints.filter((c) => c.isWomenSensitive || c.womenSensitive || c.sensitive).length,
          averageResponseTimeMinutes: 42
        },
        assignedCases: complaints.slice(0, 5),
        activity: {
          lastLogin: "Today",
          casesViewedToday: 3,
          notesAddedToday: 1,
          statusUpdatesToday: 1
        }
      };
    }
    
    const res = await api.get("/helper/dashboard");
    return res.data;
  },

  getAssignedCases: async () => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
      if (!currentUser) return [];
      
      const complaints = getMockComplaints();
      return complaints.filter((c) => String(c.assignedHelperId) === String(currentUser.id) || String(c.assignedHelper?.id) === String(currentUser.id));
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

  updateAvailability: async (status) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : {};
      const updated = { ...currentUser, availabilityStatus: status };
      localStorage.setItem("user", JSON.stringify(updated));
      return { success: true, availabilityStatus: status };
    }
    const res = await api.put("/helper/availability", { availabilityStatus: status });
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
  },

  updateCaseStatus: async (id, payload) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const complaints = getMockComplaints();
      const updated = complaints.map(c => c.id === id ? { ...c, status: payload.status, legalOpinion: payload.notes } : c);
      setMockComplaints(updated);
      return { success: true };
    }
    const res = await api.put(`/helper/cases/${id}/status`, payload);
    return res.data;
  },

  getVolunteerAnalytics: async (volunteerId) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const users = localStorage.getItem("users") ? JSON.parse(localStorage.getItem("users")) : [];
      let volunteer = users.find(u => u.id === volunteerId || String(u.id) === String(volunteerId));
      if (!volunteer) {
        volunteer = {
          id: volunteerId,
          name: "Sharon Mary",
          email: "volunteer@aram.ai",
          mobile: "9876543211",
          role: "HELPER",
          verified: true,
          availabilityStatus: "AVAILABLE",
          languagesKnown: "English, Tamil",
          specialization: "Labour Rights, Consumer Protection, Women Safety",
          experienceLevel: "SENIOR",
          yearsExperience: 4,
          womenSupportTrained: true,
          canHandleSensitiveCases: true,
          maxActiveCases: 8,
          currentActiveCases: 2
        };
      }

      const complaints = getMockComplaints().filter((c) => c.assignedHelperId === volunteer.id || c.assignedHelper?.id === volunteer.id);

      const totalAssigned = complaints.length || 34;
      const resolved = complaints.filter(c => c.status === "RESOLVED").length || 18;
      const inProgress = complaints.filter(c => c.status === "IN_PROGRESS").length || 10;
      const pending = totalAssigned - resolved - inProgress;
      const highPriority = complaints.filter(c => c.priority === "HIGH" || c.priority === "CRITICAL").length || 4;
      const womenSensitive = complaints.filter(c => c.isWomenSensitive || c.womenSensitive || c.sensitive).length || 3;

      return {
        volunteer: {
          id: volunteer.id,
          name: volunteer.name,
          email: volunteer.email,
          phone: volunteer.mobile || volunteer.phone || "8876543210",
          role: "HELPER",
          verified: volunteer.helperVerified || volunteer.verified || false,
          availabilityStatus: volunteer.availabilityStatus || "AVAILABLE",
          district: volunteer.district || "Chennai",
          serviceArea: volunteer.serviceArea || "Chennai limits",
          languages: volunteer.languagesKnown ? volunteer.languagesKnown.split(", ") : ["English", "Tamil"],
          specializations: volunteer.specialization ? volunteer.specialization.split(", ") : ["Labour Rights", "Consumer Protection"],
          experienceLevel: volunteer.experienceLevel || "SENIOR",
          yearsExperience: volunteer.yearsExperience || 4,
          womenSupportTrained: volunteer.womenSupportTrained || false,
          canHandleSensitiveCases: volunteer.canHandleSensitiveCases || false,
          maxActiveCases: volunteer.maxActiveCases || 8,
          currentActiveCases: volunteer.currentActiveCases || 2
        },
        summary: {
          totalAssigned,
          resolved,
          pending,
          inProgress,
          highPriority,
          womenSensitive,
          successRate: totalAssigned === 0 ? 100 : Math.round((resolved / totalAssigned) * 100),
          averageResponseTimeMinutes: 42,
          slaCompliance: 88,
          rank: 3,
          totalVolunteers: 45
        },
        priorityBreakdown: {
          standardGuidance: complaints.filter(c => c.priority === "LOW").length || 18,
          priorityReview: complaints.filter(c => c.priority === "MEDIUM").length || 16,
          urgentIntervention: complaints.filter(c => c.priority === "HIGH" || c.priority === "CRITICAL").length || 9
        },
        languageBreakdown: {
          English: complaints.filter(c => c.language === "English").length || 20,
          Tamil: complaints.filter(c => c.language === "Tamil").length || 12,
          Hindi: complaints.filter(c => c.language === "Hindi").length || 2
        },
        categoryBreakdown: [
          { category: "Labour Rights", count: complaints.filter(c => c.category?.toLowerCase().includes("labour")).length || 10 },
          { category: "Consumer Protection", count: complaints.filter(c => c.category?.toLowerCase().includes("consumer")).length || 8 }
        ],
        weeklyTrend: [
          { week: "Week 1", resolved: 3, assigned: 5 },
          { week: "Week 2", resolved: 4, assigned: 6 }
        ],
        activityHeatmap: [
          { date: "2026-07-01", count: 3 },
          { date: "2026-07-02", count: 1 }
        ],
        recentActivities: complaints.map((c, index) => ({
          id: index + 1,
          caseId: `ARAM-2026-${String(c.id).replace("cmp-", "").padStart(6, "0")}`,
          citizen: c.identityVisibility === "HIDDEN" ? "Protected Identity" : (c.identityVisibility === "PARTIAL" ? `Citizen from ${c.district}` : (c.citizenName || "Citizen")),
          action: c.status === "RESOLVED" ? "COMPLAINT_RESOLVED" : "STATUS_UPDATED",
          category: c.category || "Labour Rights",
          priority: c.priority || "Priority Review",
          status: c.status || "IN_PROGRESS",
          createdAt: c.createdAt || new Date().toISOString()
        })),
        badges: [
          {
            name: "Verified Legal Helper",
            status: volunteer.helperVerified || volunteer.verified ? "UNLOCKED" : "LOCKED",
            description: "Verified by admin"
          },
          {
            name: "Fast Responder",
            status: "UNLOCKED",
            description: "Responds to cases within 1 hour"
          },
          {
            name: "Women Support Trained",
            status: volunteer.womenSupportTrained ? "UNLOCKED" : "LOCKED",
            description: "Completed safety training"
          }
        ]
      };
    }
    const res = await api.get(`/admin/volunteers/${volunteerId}/analytics`);
    return res.data;
  },

  getMyVolunteerAnalytics: async () => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : {};
      return volunteerService.getVolunteerAnalytics(currentUser.id || "usr-2");
    }
    const res = await api.get("/volunteer/my-analytics");
    return res.data;
  },

  getActionPlan: async (complaintId) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const plans = localStorage.getItem("mock_action_plans") ? JSON.parse(localStorage.getItem("mock_action_plans")) : {};
      return plans[complaintId] || null;
    }
    const res = await api.get(`/volunteer/cases/${complaintId}/action-plan`);
    return res.data;
  },

  saveActionPlan: async (complaintId, payload) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const plans = localStorage.getItem("mock_action_plans") ? JSON.parse(localStorage.getItem("mock_action_plans")) : {};
      const newPlan = {
        ...payload,
        id: plans[complaintId]?.id || Math.floor(Math.random() * 1000),
        complaintId,
        legalGuideId: "usr-2",
        createdAt: plans[complaintId]?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      plans[complaintId] = newPlan;
      localStorage.setItem("mock_action_plans", JSON.stringify(plans));
      return newPlan;
    }
    const res = await api.post(`/volunteer/cases/${complaintId}/action-plan`, payload);
    return res.data;
  },

  shareActionPlan: async (complaintId) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const plans = localStorage.getItem("mock_action_plans") ? JSON.parse(localStorage.getItem("mock_action_plans")) : {};
      if (plans[complaintId]) {
        plans[complaintId].status = "SHARED";
        localStorage.setItem("mock_action_plans", JSON.stringify(plans));
      }
      return plans[complaintId] || null;
    }
    const res = await api.post(`/volunteer/cases/${complaintId}/share-action-plan`);
    return res.data;
  },

  requestDocument: async (complaintId, payload) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const requests = localStorage.getItem(`mock_doc_requests_${complaintId}`) 
          ? JSON.parse(localStorage.getItem(`mock_doc_requests_${complaintId}`)) 
          : [];
      const newRequest = {
        ...payload,
        id: Math.floor(Math.random() * 1000),
        complaintId,
        status: "REQUESTED",
        createdAt: new Date().toISOString()
      };
      requests.push(newRequest);
      localStorage.setItem(`mock_doc_requests_${complaintId}`, JSON.stringify(requests));
      return newRequest;
    }
    const res = await api.post("/documents/requests", {
      complaintId,
      documentName: payload.documentName,
      reason: payload.reason
    });
    return res.data;
  },

  verifyDocument: async (requestId, complaintId) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const requests = localStorage.getItem(`mock_doc_requests_${complaintId}`) 
          ? JSON.parse(localStorage.getItem(`mock_doc_requests_${complaintId}`)) 
          : [];
      const updated = requests.map(r => r.id === requestId ? { ...r, status: "VERIFIED" } : r);
      localStorage.setItem(`mock_doc_requests_${complaintId}`, JSON.stringify(updated));
      return { success: true };
    }
    const res = await api.put(`/documents/requests/${requestId}/verify`);
    return res.data;
  },

  rejectDocument: async (requestId, complaintId, reason) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const requests = localStorage.getItem(`mock_doc_requests_${complaintId}`) 
          ? JSON.parse(localStorage.getItem(`mock_doc_requests_${complaintId}`)) 
          : [];
      const updated = requests.map(r => r.id === requestId ? { ...r, status: "REJECTED", rejectionReason: reason } : r);
      localStorage.setItem(`mock_doc_requests_${complaintId}`, JSON.stringify(updated));
      return { success: true };
    }
    const res = await api.put(`/documents/requests/${requestId}/reject`, { reason });
    return res.data;
  },

  scheduleAppointment: async (appointmentId, complaintId, scheduledAt) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const apps = localStorage.getItem(`mock_appointments_${complaintId}`) 
          ? JSON.parse(localStorage.getItem(`mock_appointments_${complaintId}`)) 
          : [];
      const updated = apps.map(a => a.id === appointmentId ? { ...a, status: "SCHEDULED", scheduledAt } : a);
      localStorage.setItem(`mock_appointments_${complaintId}`, JSON.stringify(updated));
      return { success: true };
    }
    const res = await api.put(`/appointments/${appointmentId}/schedule`, { scheduledAt });
    return res.data;
  },

  cancelAppointment: async (appointmentId, complaintId) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const apps = localStorage.getItem(`mock_appointments_${complaintId}`) 
          ? JSON.parse(localStorage.getItem(`mock_appointments_${complaintId}`)) 
          : [];
      const updated = apps.map(a => a.id === appointmentId ? { ...a, status: "CANCELLED" } : a);
      localStorage.setItem(`mock_appointments_${complaintId}`, JSON.stringify(updated));
      return { success: true };
    }
    const res = await api.put(`/appointments/${appointmentId}/cancel`);
    return res.data;
  },

  markResolved: async (complaintId, summary) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const complaints = getMockComplaints();
      const idx = complaints.findIndex(c => String(c.id) === String(complaintId));
      if (idx !== -1) {
        complaints[idx].status = "RESOLVED_BY_GUIDE";
        complaints[idx].resolutionSummary = summary;
        setMockComplaints(complaints);
      }
      return complaints[idx] || null;
    }
    const res = await api.put(`/complaints/${complaintId}/status-update`, {
      status: "RESOLVED_BY_GUIDE",
      details: summary
    });
    return res.data;
  },

  getCostEstimate: async (complaintId) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        estimatedMinAmount: 0,
        estimatedMaxAmount: 300,
        currency: "INR",
        freeLegalAidAvailable: true,
        costType: "Free Legal Aid",
        includes: "Print/photocopy/travel estimate",
        excludes: "Professional legal fees",
        notes: "Filing is free under legal aid rules."
      };
    }
    const res = await api.get(`/volunteer/cases/${complaintId}/cost-estimate`);
    return res.data;
  },

  updateCostEstimate: async (complaintId, payload) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { success: true, ...payload };
    }
    const res = await api.put(`/volunteer/cases/${complaintId}/cost-estimate`, payload);
    return res.data;
  },

  getAuthorityLocations: async (complaintId, lat, lng) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 350));
      return [
        {
          id: 1,
          name: "Coimbatore Labour Department Office",
          authorityType: "Labour Department",
          categorySupported: "LABOUR_DISPUTE",
          district: "Coimbatore",
          area: "Coimbatore Town",
          address: "Labour Commissioner Office, Chinthamani, Coimbatore - 641045",
          workingHours: "10:00 AM - 05:45 PM",
          latitude: 11.0168,
          longitude: 76.9558,
          mapsUrl: "https://www.google.com/maps/search/?api=1&query=Labour+Department+Office+Coimbatore"
        }
      ];
    }
    const params = {};
    if (lat !== undefined && lat !== null) params.lat = lat;
    if (lng !== undefined && lng !== null) params.lng = lng;
    const res = await api.get(`/volunteer/cases/${complaintId}/authority-locations`, { params });
    return res.data;
  },

  updateAuthorityLocation: async (complaintId, authorityName) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const complaints = getMockComplaints();
      const idx = complaints.findIndex(c => String(c.id) === String(complaintId));
      if (idx !== -1) {
        complaints[idx].authority = authorityName;
        setMockComplaints(complaints);
      }
      return { success: true, authority: authorityName };
    }
    const res = await api.put(`/volunteer/cases/${complaintId}/authority-location`, { authorityName });
    return res.data;
  }
};
