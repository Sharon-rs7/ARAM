import api, { USE_MOCKS } from "./api";
import { getMockUsers, setMockUsers } from "../data/mock";

export const userService = {
  getMe: async () => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
      if (!currentUser) throw new Error("Unauthenticated.");
      
      const users = getMockUsers();
      const user = users.find((u) => u.id === currentUser.id);
      if (!user) throw new Error("User profile not found.");
      return user;
    }
    const res = await api.get("/users/me");
    return res.data;
  },

  updateMe: async (payload) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
      if (!currentUser) throw new Error("Unauthenticated.");
      
      const users = getMockUsers();
      let updatedUser = null;
      const updatedList = users.map((u) => {
        if (u.id === currentUser.id) {
          updatedUser = { ...u, ...payload };
          return updatedUser;
        }
        return u;
      });
      
      if (!updatedUser) throw new Error("User profile not found.");
      setMockUsers(updatedList);
      
      // Update local storage user profile cache
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    }
    const res = await api.put("/users/me", payload);
    return res.data;
  },

  uploadAvatar: async (formData) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      // In mock mode, we just return a simulated avatar url
      const avatarUrl = "https://api.dicebear.com/7.x/adventurer/svg?seed=AramUser";
      
      const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
      if (currentUser) {
        const users = getMockUsers();
        const updated = users.map((u) => u.id === currentUser.id ? { ...u, avatarUrl } : u);
        setMockUsers(updated);
        
        currentUser.avatarUrl = avatarUrl;
        localStorage.setItem("user", JSON.stringify(currentUser));
      }
      
      return { success: true, avatarUrl };
    }
    const res = await api.post("/users/me/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  updateSettings: async (payload) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { success: true, message: "Settings saved locally." };
    }
    if (payload.themePreference) {
      const res = await api.put("/users/me/theme", { themePreference: payload.themePreference });
      return res.data;
    }
    // Save other settings to localStorage and document backend TODO
    const localSettings = JSON.parse(localStorage.getItem("local_settings") || "{}");
    localStorage.setItem("local_settings", JSON.stringify({ ...localSettings, ...payload }));
    return { success: true, message: "Settings saved to local preferences." };
  },

  changePassword: async (oldPassword, newPassword) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { success: true, message: "Password updated successfully." };
    }
    const res = await api.put("/users/me/password", { oldPassword, newPassword });
    return res.data;
  },

  enable2fa: async () => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { success: true, enabled: true, message: "2FA enabled." };
    }
    const res = await api.post("/users/me/2fa/enable");
    return res.data;
  },

  disable2fa: async () => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { success: true, enabled: false, message: "2FA disabled." };
    }
    const res = await api.post("/users/me/2fa/disable");
    return res.data;
  },

  getDevices: async () => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return [
        { deviceName: "Windows PC (Current Session)", browser: "Chrome", lastLogin: new Date().toISOString(), ipAddress: "127.0.0.1" }
      ];
    }
    const res = await api.get("/users/me/devices");
    return res.data;
  },

  logoutAllDevices: async () => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { success: true };
    }
    const res = await api.post("/users/me/logout-all");
    return res.data;
  },

  downloadDataReport: async () => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { name: "Rajesh Kumar", email: "citizen@aram.ai", disclaimer: "Mock Data Report Details" };
    }
    const res = await api.get("/users/me/data-report");
    return res.data;
  },

  deleteAccountRequest: async () => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { success: true, status: "PENDING_REVIEW" };
    }
    const res = await api.post("/users/me/delete-request");
    return res.data;
  }
};
