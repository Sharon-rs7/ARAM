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
      return res.data?.unreadCount || 0;
    } catch {
      return 0;
    }
  },

  markAsRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await api.patch("/notifications/mark-all-read");
    return res.data;
  }
};
