import api from "@/services/api";

export const notificationService = {
  getNotifications: async () => {
    try {
      const res = await api.get("/notifications");
      return res.data || [];
    } catch {
      return [];
    }
  },

  getUnreadCount: async () => {
    try {
      const res = await api.get("/notifications/unread-count");
      return res.data?.count ?? res.data?.unreadCount ?? 0;
    } catch {
      return 0;
    }
  },

  markAsRead: async (id) => {
    try {
      const res = await api.put(`/notifications/${id}/read`);
      return res.data;
    } catch {
      const res = await api.patch(`/notifications/${id}/read`);
      return res.data;
    }
  },

  markAllAsRead: async () => {
    try {
      const res = await api.put("/notifications/read-all");
      return res.data;
    } catch {
      const res = await api.patch("/notifications/mark-all-read");
      return res.data;
    }
  },

  clearAll: async () => {
    try {
      const res = await api.delete("/notifications");
      return res.data;
    } catch {
      return { message: "Cleared" };
    }
  }
};
