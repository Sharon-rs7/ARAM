import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { notificationService } from "@/services/notificationService";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const NotificationContext = createContext(null);

const formatRelativeTime = (isoStr) => {
  if (!isoStr) return "Just now";
  try {
    const date = new Date(isoStr);
    if (isNaN(date.getTime())) return "Just now";
    const now = new Date();
    const diffSecs = Math.floor((now - date) / 1000);
    if (diffSecs < 45) return "Just now";
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  } catch {
    return "Just now";
  }
};

const normalizeNotification = (raw) => {
  const createdAt = raw.createdAt || raw.sentAt || new Date().toISOString();
  let complaintId = raw.complaintId || null;
  if (!complaintId && raw.message) {
    const numMatch = raw.message.match(/complaint ID\s*(\d+)/i) ||
                     raw.message.match(/case ARAM-\d+-0*(\d+)/i) ||
                     raw.message.match(/ARAM-2026-0*(\d+)/i) ||
                     raw.message.match(/ARAM-(?:[0-9]+-[A-Z]+-[A-Z]+-0*(\d+))/i) ||
                     raw.message.match(/ARAM-0*(\d+)/i);
    if (numMatch && numMatch[1]) {
      const parsedNum = parseInt(numMatch[1], 10);
      if (!isNaN(parsedNum)) complaintId = parsedNum;
    }
  }

  let title = raw.title;
  if (!title) {
    const msg = (raw.message || "").toLowerCase();
    if (msg.includes("acknowledged")) title = "Guide Acknowledged Case";
    else if (msg.includes("assigned")) title = "Legal Guide Assigned";
    else if (msg.includes("new message") || msg.includes("replied in case")) title = "New Message in Case";
    else if (msg.includes("submitted successfully")) title = "Complaint Registered";
    else if (msg.includes("requested additional documents")) title = "Document Request";
    else if (msg.includes("document")) title = "Document Verification";
    else if (msg.includes("status changed")) title = "Case Status Update";
    else if (msg.includes("level")) title = "Performance Level Update";
    else title = raw.type ? raw.type.replace(/_/g, " ") : "Legal Aid Alert";
  }

  const isRead = Boolean(raw.read || raw.readFlag);

  return {
    id: raw.id || raw.notificationId || `notif-${Date.now()}-${Math.random()}`,
    title,
    message: raw.message || "New update regarding your case.",
    type: raw.type || "IN_APP",
    status: raw.status || "SENT",
    read: isRead,
    readFlag: isRead,
    createdAt,
    time: formatRelativeTime(createdAt),
    complaintId
  };
};

export const NotificationProvider = ({ children }) => {
  const { user, accessToken, token: legacyToken } = useAuth();
  const token = accessToken || legacyToken || localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
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
      const list = Array.isArray(data) ? data.map(normalizeNotification) : [];
      setNotifications(list);
      const unread = list.filter((n) => !n.read).length;
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
        
        let wsEndpoint;
        if (import.meta.env.VITE_WS_URL) {
          wsEndpoint = `${import.meta.env.VITE_WS_URL}/ws/updates`;
        } else if (host === "localhost" || host === "127.0.0.1") {
          wsEndpoint = `${protocol}//${host}:8082/ws/updates`;
        } else {
          wsEndpoint = `${protocol}//${window.location.host}/ws/updates`;
        }
        const wsUrl = `${wsEndpoint}?token=${encodeURIComponent(cleanToken)}`;

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

            const newNotif = normalizeNotification({
              id: data.notificationId || `ws-${Date.now()}`,
              type: data.type || "IN_APP",
              message: data.message || "New update regarding your case.",
              createdAt: new Date().toISOString(),
              read: false,
              readFlag: false,
              complaintId: data.complaintId || null
            });

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

    // Fallback polling every 6 seconds to ensure instant UI updates
    const pollInterval = setInterval(fetchNotifications, 6000);

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
