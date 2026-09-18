import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { notificationService } from "@/services/notificationService";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Fetch initial notifications from REST endpoint
  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const data = await notificationService.getNotifications();
      const list = Array.isArray(data) ? data : [];
      setNotifications(list);
      const unread = list.filter((n) => !n.read && !n.readFlag).length;
      setUnreadCount(unread);
    } catch (err) {
      console.warn("[NOTIFICATIONS] Failed to fetch notifications:", err);
    }
  }, [token]);

  // Mark single notification as read
  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true, readFlag: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("[NOTIFICATIONS] Failed to mark as read:", err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true, readFlag: true }))
      );
      setUnreadCount(0);
      toast.success("All notifications marked as read.");
    } catch (err) {
      console.error("[NOTIFICATIONS] Failed to mark all as read:", err);
    }
  };

  // Clear all notifications
  const clearAll = async () => {
    try {
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("[NOTIFICATIONS] Failed to clear notifications:", err);
    }
  };

  // WebSocket connection & lifecycle management
  useEffect(() => {
    if (!token || !user) {
      if (socketRef.current) {
        socketRef.current.close();
      }
      return;
    }

    fetchNotifications();

    let isUnmounted = false;

    const connectWebSocket = () => {
      if (isUnmounted) return;

      try {
        const cleanToken = token.startsWith("Bearer ") ? token.substring(7) : token;
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const host = window.location.hostname || "localhost";
        // Connect to Spring Boot backend port 8082
        const wsUrl = `${protocol}//${host}:8082/ws/updates?token=${encodeURIComponent(cleanToken)}`;

        console.log("[WS] Connecting to notification stream...");
        const ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
          if (isUnmounted) return;
          console.log("[WS CONNECTED] Real-time notification socket established.");
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          if (isUnmounted) return;
          try {
            const data = JSON.parse(event.data);
            console.log("[WS NOTIFICATION RECEIVED]", data);

            const newNotif = {
              id: data.notificationId || `ws-${Date.now()}`,
              title: data.type ? data.type.replace(/_/g, " ") : "Legal Aid Alert",
              message: data.message || "New update regarding your case.",
              createdAt: new Date().toISOString(),
              time: "Just now",
              read: false,
              readFlag: false,
              complaintId: data.complaintId || null
            };

            setNotifications((prev) => [newNotif, ...prev]);
            setUnreadCount((prev) => prev + 1);

            // Trigger visual toast
            toast.info(newNotif.message, {
              description: newNotif.title,
              duration: 5000
            });
          } catch (e) {
            console.warn("[WS] Error parsing message:", e);
          }
        };

        ws.onclose = () => {
          if (isUnmounted) return;
          console.log("[WS CLOSED] Reconnecting in 5s...");
          setIsConnected(false);
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000);
        };

        ws.onerror = (err) => {
          console.warn("[WS ERROR]", err);
          ws.close();
        };
      } catch (err) {
        console.warn("[WS INIT ERROR]", err);
      }
    };

    connectWebSocket();

    // Fallback polling every 30 seconds
    const pollInterval = setInterval(fetchNotifications, 30000);

    return () => {
      isUnmounted = true;
      clearInterval(pollInterval);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) socketRef.current.close();
    };
  }, [token, user, fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isConnected,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        clearAll
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    return {
      notifications: [],
      unreadCount: 0,
      isConnected: false,
      fetchNotifications: () => {},
      markAsRead: () => {},
      markAllAsRead: () => {},
      clearAll: () => {}
    };
  }
  return ctx;
};
