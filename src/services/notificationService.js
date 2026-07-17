import api, { USE_MOCKS } from "./api";
import { getMockNotifications, setMockNotifications } from "../data/mock";

export const notificationService = {
  getNotifications: async () => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const nots = getMockNotifications();
      const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
      if (!currentUser) return [];
      
      return nots.filter((n) => n.userId === currentUser.id);
    }
    const res = await api.get("/notifications");
    return res.data;
  },

  getUnreadCount: async () => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const nots = getMockNotifications();
      const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
      if (!currentUser) return 0;
      
      return nots.filter((n) => n.userId === currentUser.id && !n.read).length;
    }
    const res = await api.get("/notifications/unread-count");
    return res.data;
  },

  markAsRead: async (id) => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const nots = getMockNotifications();
      const updated = nots.map((n) => n.id === id ? { ...n, read: true } : n);
      setMockNotifications(updated);
      return { success: true };
    }
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const nots = getMockNotifications();
      const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
      if (!currentUser) return { success: true };
      
      const updated = nots.map((n) => n.userId === currentUser.id ? { ...n, read: true } : n);
      setMockNotifications(updated);
      return { success: true };
    }
    // Simple backend API placeholder or endpoint call
    const res = await api.put("/notifications/read-all");
    return res.data;
  },

  clearAll: async () => {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const nots = getMockNotifications();
      const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
      if (!currentUser) return { success: true };
      
      const updated = nots.filter((n) => n.userId !== currentUser.id);
      setMockNotifications(updated);
      return { success: true };
    }
    const res = await api.delete("/notifications");
    return res.data;
  }
};
