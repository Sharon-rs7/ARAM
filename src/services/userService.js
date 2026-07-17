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
    const res = await api.put("/users/me/settings", payload);
    return res.data;
  }
};
