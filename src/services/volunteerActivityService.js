import api from "@/services/api";

const volunteerActivityService = {
  startSession: async (volunteerId, sessionId, deviceInfo) => {
    const res = await api.post("/volunteer/session/start", { volunteerId, sessionId, deviceInfo });
    return res.data;
  },

  heartbeat: async (sessionId) => {
    const res = await api.post("/volunteer/session/heartbeat", { sessionId });
    return res.data;
  },

  endSession: async (sessionId) => {
    const res = await api.post("/volunteer/session/end", { sessionId });
    return res.data;
  },

  logActivity: async (payload) => {
    const res = await api.post("/volunteer/activity/log", payload);
    return res.data;
  },

  // Admin APIs
  getVolunteerActivity: async (volunteerId) => {
    const res = await api.get(`/admin/volunteers/${volunteerId}/activity`);
    return res.data;
  },

  getVolunteerSessions: async (volunteerId) => {
    const res = await api.get(`/admin/volunteers/${volunteerId}/sessions`);
    return res.data;
  },

  getVolunteerSummary: async (volunteerId) => {
    const res = await api.get(`/admin/volunteers/${volunteerId}/activity/summary`);
    return res.data;
  },

  getOverallOverview: async () => {
    const res = await api.get("/admin/volunteer-activity/overview");
    return res.data;
  }
};

export default volunteerActivityService;
