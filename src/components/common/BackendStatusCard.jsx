import React, { useState, useEffect } from "react";
import axios from "axios";
import { Server, ServerCrash, RefreshCw } from "lucide-react";

export default function BackendStatusCard() {
  const [status, setStatus] = useState("checking"); // checking, online, offline
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState("");

  const checkHealth = async () => {
    setLoading(true);
    const timeStr = new Date().toLocaleTimeString();
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
      const res = await axios.get(`${baseUrl}/health`);
      if (res.data && res.data.status === "ok") {
        setStatus("online");
      } else {
        setStatus("offline");
      }
    } catch (err) {
      console.warn("Backend health check failed:", err);
      setStatus("offline");
    } finally {
      setLoading(false);
      setLastChecked(timeStr);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 45000); // Poll health every 45s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`p-4 rounded-xl border ${
      status === "online" 
        ? "bg-emerald-50/50 border-emerald-250 text-emerald-900" 
        : status === "offline"
        ? "bg-red-50/40 border-red-250 text-red-900"
        : "bg-slate-50 border-slate-200 text-slate-600"
    } flex items-center justify-between text-xs`}>
      <div className="flex items-center gap-3">
        {status === "online" ? (
          <Server size={18} className="text-emerald-700 shrink-0" />
        ) : (
          <ServerCrash size={18} className="text-red-650 shrink-0 animate-pulse" />
        )}
        <div>
          <p className="font-semibold uppercase tracking-wider">
            API Server: {status === "online" ? "Connected" : status === "offline" ? "Offline" : "Checking..."}
          </p>
          {lastChecked && (
            <p className="text-[10px] text-slate-500 mt-0.5">Last checked: {lastChecked}</p>
          )}
        </div>
      </div>

      <button
        onClick={checkHealth}
        disabled={loading}
        className="rounded-lg p-1.5 hover:bg-black/5 active:scale-[0.95] transition cursor-pointer disabled:opacity-50"
        title="Check connection"
      >
        <RefreshCw size={14} className={`${loading ? "animate-spin" : ""}`} />
      </button>
    </div>
  );
}
