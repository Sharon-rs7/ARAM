import api from "@/services/api";

export const userService = {
  getMe: async () => {
    const res = await api.get("/users/me");
    return res.data;
  },

  updateMe: async (payload) => {
    const res = await api.put("/users/me", payload);
    return res.data;
  },

  updateProfile: async (payload) => {
    const res = await api.put("/users/me", payload);
    return res.data;
  },

  uploadAvatar: async (formData) => {
    const res = await api.post("/users/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
  },

  updateSettings: async (payload) => {
    const res = await api.put("/users/me/settings", payload);
    return res.data;
  },

  changePassword: async (payload) => {
    const res = await api.post("/users/me/change-password", payload);
    return res.data;
  }
};
