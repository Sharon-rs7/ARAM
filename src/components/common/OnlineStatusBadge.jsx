import React from "react";
import useOnlineStatus from "../../hooks/useOnlineStatus";
import { Wifi, WifiOff } from "lucide-react";

export default function OnlineStatusBadge() {
  const isOnline = useOnlineStatus();

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
      isOnline 
        ? "bg-green-50 text-green-700 border border-green-200" 
        : "bg-red-50 text-red-750 border border-red-200"
    }`}>
      {isOnline ? (
        <>
          <Wifi size={14} className="shrink-0" />
          <span>Online</span>
        </>
      ) : (
        <>
          <WifiOff size={14} className="shrink-0 animate-pulse" />
          <span>Offline</span>
        </>
      )}
    </div>
  );
}
