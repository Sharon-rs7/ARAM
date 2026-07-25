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
  },

  getActionPlan: async (complaintId) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const plans = localStorage.getItem("mock_action_plans") ? JSON.parse(localStorage.getItem("mock_action_plans")) : {};
      const plan = plans[complaintId];
      if (plan && plan.status === "SHARED") {
        return plan;
      }
      return null;
    }
    const res = await api.get(`/citizen/complaints/${complaintId}/action-plan`);
    return res.data;
  },

  getAuthorityLocations: async (complaintId, lat, lng) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const offices = [
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
      return offices;
    }
    const params = {};
    if (lat !== undefined && lat !== null) params.latitude = lat;
    if (lng !== undefined && lng !== null) params.longitude = lng;
    const res = await api.get(`/citizen/complaints/${complaintId}/authority-locations`, { params });
    return res.data;
  },

  getDocumentRequests: async (complaintId) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return localStorage.getItem(`mock_doc_requests_${complaintId}`) 
          ? JSON.parse(localStorage.getItem(`mock_doc_requests_${complaintId}`)) 
          : [];
    }
    const res = await api.get(`/documents/requests/complaint/${complaintId}`);
    return res.data;
  },

  uploadRequestedDocument: async (requestId, complaintId, formData) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const requests = localStorage.getItem(`mock_doc_requests_${complaintId}`) 
          ? JSON.parse(localStorage.getItem(`mock_doc_requests_${complaintId}`)) 
          : [];
      const updated = requests.map(r => r.id === requestId ? { ...r, status: "UPLOADED", documentUrl: "evidence_slip.pdf" } : r);
      localStorage.setItem(`mock_doc_requests_${complaintId}`, JSON.stringify(updated));
      return { success: true };
    }
    const res = await api.put(`/documents/requests/${requestId}/upload`, formData);
    return res.data;
  },

  requestCall: async (payload) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const apps = localStorage.getItem(`mock_appointments_${payload.complaintId}`) 
          ? JSON.parse(localStorage.getItem(`mock_appointments_${payload.complaintId}`)) 
          : [];
      const newApp = {
        ...payload,
        id: Math.floor(Math.random() * 1000),
        requestedBy: "CITIZEN",
        status: "REQUESTED",
        createdAt: new Date().toISOString()
      };
      apps.push(newApp);
      localStorage.setItem(`mock_appointments_${payload.complaintId}`, JSON.stringify(apps));
      return newApp;
    }
    const res = await api.post("/appointments", payload);
    return res.data;
  },

  getAppointments: async (complaintId) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return localStorage.getItem(`mock_appointments_${complaintId}`) 
          ? JSON.parse(localStorage.getItem(`mock_appointments_${complaintId}`)) 
          : [];
    }
    const res = await api.get(`/appointments/complaint/${complaintId}`);
    return res.data;
  },

  submitFeedback: async (payload) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { success: true };
    }
    const res = await api.post("/feedback", payload);
    return res.data;
  },

  updateWorkflowStatus: async (complaintId, payload) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const complaints = getMockComplaints();
      const idx = complaints.findIndex(c => String(c.id) === String(complaintId));
      if (idx !== -1) {
        complaints[idx].status = payload.status;
        if (payload.status === "RESOLVED_BY_GUIDE") {
          complaints[idx].resolutionSummary = payload.details;
        }
        if (payload.status === "REOPEN_REQUESTED") {
          complaints[idx].reopenReason = payload.details;
        }
        setMockComplaints(complaints);
      }
      return complaints[idx] || null;
    }
    const res = await api.put(`/complaints/${complaintId}/status-update`, payload);
    return res.data;
  }
};
