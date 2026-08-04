import React, { useState, useEffect } from "react";
import axios from "axios";
import { Server, Database, Brain, Cpu, Volume2, ShieldCheck, RefreshCw, Layers } from "lucide-react";
import { API_BASE_URL, USE_MOCKS } from "../../services/api";

const DemoHealthPanel = () => {
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState("");
  const [statuses, setStatuses] = useState({
    frontend: "online",
    backend: "checking",
    ai: "checking",
    db: "checking",
    voice: "checking",
    ocr: "checking",
    mockMode: USE_MOCKS ? "active" : "inactive"
  });

  const checkAllConnections = async () => {
    setLoading(true);
    const newStatuses = { ...statuses };
    newStatuses.frontend = "online";
    newStatuses.mockMode = USE_MOCKS ? "active" : "inactive";

    const VoiceAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    newStatuses.voice = VoiceAPI ? "online" : "offline";

    try {
      const backendRes = await axios.get(`${API_BASE_URL}/health`);
      if (backendRes.data && backendRes.data.status === "ok") {
        newStatuses.backend = "online";
        newStatuses.db = "online";
      } else {
        newStatuses.backend = "offline";
        newStatuses.db = "offline";
      }
    } catch (e) {
      newStatuses.backend = "offline";
      newStatuses.db = "offline";
    }

    try {
      const aiUrl = import.meta.env.VITE_AI_SERVICE_BASE_URL || "http://localhost:8000";
      const aiRes = await axios.get(`${aiUrl}/health`);
      if (aiRes.data && aiRes.data.status === "ok") {
        newStatuses.ai = "online";
        newStatuses.ocr = aiRes.data.pipelineReady ? "online" : "warning";
      } else {
        newStatuses.ai = "offline";
        newStatuses.ocr = "offline";
      }
    } catch (e) {
      newStatuses.ai = "offline";
      newStatuses.ocr = "offline";
    }

    setStatuses(newStatuses);
    setLastChecked(new Date().toLocaleTimeString());
    setLoading(false);
  };

  useEffect(() => {
    checkAllConnections();
    const interval = setInterval(checkAllConnections, 60000);
    return () => clearInterval(interval);
  }, []);

  const renderStatusBadge = (status) => {
    switch (status) {
      case "online":
        return <span className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-50 shrink-0"></span>;
      case "warning":
        return <span className="h-2 w-2 rounded-full bg-amber-500 ring-4 ring-amber-50 shrink-0"></span>;
      case "offline":
        return <span className="h-2 w-2 rounded-full bg-rose-500 ring-4 ring-rose-50 shrink-0"></span>;
      case "active":
        return <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-100 font-extrabold uppercase shrink-0">Mock Enabled</span>;
      case "inactive":
        return <span className="text-[10px] bg-indigo-50 text-indigo-755 px-2 py-0.5 rounded border border-indigo-100 font-extrabold uppercase shrink-0">Live DB</span>;
      default:
        return <span className="h-2 w-2 rounded-full bg-slate-300 shrink-0"></span>;
    }
  };

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Layers size={18} className="text-indigo-600" />
            Review & Demo Health Panel
          </h3>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Faculty Presentation Operational Status</p>
        </div>
        <button
          onClick={checkAllConnections}
          disabled={loading}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 border text-slate-600 transition cursor-pointer disabled:opacity-50"
          title="Force refresh statuses"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 text-xs font-semibold text-slate-700">
        <div className="p-3 bg-slate-50 border rounded-xl flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Cpu size={15} className="text-blue-500 shrink-0" />
            <span>Frontend UI</span>
          </div>
          {renderStatusBadge(statuses.frontend)}
        </div>

        <div className="p-3 bg-slate-50 border rounded-xl flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Server size={15} className="text-indigo-500 shrink-0" />
            <span>Spring Boot</span>
          </div>
          {renderStatusBadge(statuses.backend)}
        </div>

        <div className="p-3 bg-slate-50 border rounded-xl flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Brain size={15} className="text-violet-500 shrink-0" />
            <span>FastAPI AI</span>
          </div>
          {renderStatusBadge(statuses.ai)}
        </div>

        <div className="p-3 bg-slate-50 border rounded-xl flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Database size={15} className="text-emerald-500 shrink-0" />
            <span>MySQL DB</span>
          </div>
          {renderStatusBadge(statuses.db)}
        </div>

        <div className="p-3 bg-slate-50 border rounded-xl flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <ShieldCheck size={15} className="text-teal-500 shrink-0" />
            <span>OCR pipeline</span>
          </div>
          {renderStatusBadge(statuses.ocr)}
        </div>

        <div className="p-3 bg-slate-50 border rounded-xl flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Volume2 size={15} className="text-amber-500 shrink-0" />
            <span>Voice NLP</span>
          </div>
          {renderStatusBadge(statuses.voice)}
        </div>

        <div className="p-3 bg-slate-50 border rounded-xl flex items-center justify-between gap-2.5 col-span-2">
          <span className="font-semibold text-slate-500 uppercase text-[10px] tracking-wide">Environment</span>
          {renderStatusBadge(statuses.mockMode)}
        </div>
      </div>

      {lastChecked && (
        <div className="text-[10px] text-slate-400 font-medium text-right mt-1">
          Last health scan check completed at: <span className="font-bold text-slate-600">{lastChecked}</span>
        </div>
      )}
    </div>
  );
};

export default DemoHealthPanel;
