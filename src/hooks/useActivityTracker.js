import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import volunteerActivityService from "@/services/volunteerActivityService";

export default function useActivityTracker() {
  const { user, role } = useAuth();
  const location = useLocation();
  const sessionIdRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);

  const isVolunteer = role === "VOLUNTEER" || role === "HELPER";

  useEffect(() => {
    if (!isVolunteer || !user) {
      // Clean up session if role changes or user logs out
      if (sessionIdRef.current) {
        volunteerActivityService.endSession(sessionIdRef.current).catch(console.error);
        sessionIdRef.current = null;
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      return;
    }

    // Start session if not exists
    if (!sessionIdRef.current) {
      const newSessionId = "sess_" + Math.random().toString(36).substring(2, 15);
      sessionIdRef.current = newSessionId;
      const deviceInfo = navigator.userAgent;

      volunteerActivityService.startSession(user.id, newSessionId, deviceInfo)
        .catch(console.error);

      // Start Heartbeat every 60 seconds
      heartbeatIntervalRef.current = setInterval(() => {
        if (sessionIdRef.current) {
          volunteerActivityService.heartbeat(sessionIdRef.current).catch(console.error);
        }
      }, 60000);
    }

    // Log Page View
    volunteerActivityService.logActivity({
      volunteerId: user.id,
      actionType: "PAGE_VIEW",
      actionLabel: `Viewed ${location.pathname}`,
      routePath: location.pathname,
      sessionId: sessionIdRef.current
    }).catch(console.error);

    return () => {
      // We don't end session here on unmount of page, only on auth state change (logout)
    };
  }, [location.pathname, user, role, isVolunteer]);

  // Expose a function to log manual actions (clicks, reviews, etc.)
  const logAction = (actionLabel, targetType = null, targetId = null, metadata = null) => {
    if (!isVolunteer || !user || !sessionIdRef.current) return;

    volunteerActivityService.logActivity({
      volunteerId: user.id,
      actionType: "ACTION",
      actionLabel,
      targetType,
      targetId,
      routePath: location.pathname,
      sessionId: sessionIdRef.current,
      metadataJson: metadata ? JSON.stringify(metadata) : null
    }).catch(console.error);
  };

  return { logAction };
}
