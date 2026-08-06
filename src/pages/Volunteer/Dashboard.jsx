import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Bell, User, Clock, ArrowRight, MessageSquare, AlertCircle } from "lucide-react";
import { volunteerService } from "../../services/volunteerService";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [guideInfo, setGuideInfo] = useState({
    levelName: "Junior Guide",
    creditScore: 0,
    levelNumber: 1
  });
  const [stats, setStats] = useState({
    activeCases: 8,
    needsResponse: 2,
    resolved: 51
  });
  
  const [attentionCase, setAttentionCase] = useState({
    id: "ARAM-00124",
    rawId: 1,
    title: "Property & Land Title Boundary Dispute",
    priority: "HIGH",
    citizenName: "Sharon",
    language: "Tamil",
    assignedTime: "20 mins ago"
  });

  const [recentMessages, setRecentMessages] = useState([
    {
      sender: "Sharon",
      caseId: "ARAM-00124",
      text: "I uploaded the document details inside evidence...",
      timeAgo: "5 mins ago",
      rawId: 1
    }
  ]);

  useEffect(() => {
    const fetchGuideDashboard = async () => {
      try {
        setLoading(true);
        const data = await volunteerService.getDashboard();
        
        // Count statuses
        const cases = data?.assignedCases || [];
        const active = cases.filter(c => c.status !== "RESOLVED").length;
        const resolved = cases.filter(c => c.status === "RESOLVED").length;
        const pending = cases.filter(c => c.status === "PENDING").length;
        
        setStats({
          activeCases: active || 0,
          needsResponse: pending || 0,
          resolved: resolved || 0
        });

        if (data?.volunteer) {
          setGuideInfo({
            levelName: data.volunteer.levelName || "Junior Guide",
            creditScore: data.volunteer.creditScore || 0,
            levelNumber: data.volunteer.levelNumber || 1
          });
        }

        if (cases.length > 0) {
          const first = cases[0];
          setAttentionCase({
            id: `ARAM-00${first.id}`,
            rawId: first.id,
            title: first.title,
            priority: first.priority || "HIGH",
            citizenName: first.citizenName || first.citizen?.name || "Sharon",
            language: first.language === "ta-IN" ? "Tamil" : "English",
            assignedTime: "Assigned recently"
          });

          setRecentMessages([
            {
              sender: first.citizenName || "Sharon",
              caseId: `ARAM-00${first.id}`,
              text: "I updated the files. Please check when you have time.",
              timeAgo: "10 mins ago",
              rawId: first.id
            }
          ]);
        }
      } catch (err) {
        console.error("Failed to load guide dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGuideDashboard();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-6">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Good morning, {user?.name || "Arun Kumar"}
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                {guideInfo.levelName}
              </span>
              <span className="hidden sm:inline text-slate-300">|</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {guideInfo.creditScore} XP
                </span>
                <div className="w-24 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-650 h-full rounded-full" style={{ width: `${Math.min(100, (guideInfo.creditScore / 1500) * 100)}%` }} />
                </div>
                <button
                  onClick={() => navigate("/volunteer/my-analytics")}
                  className="text-[10px] font-bold text-slate-450 hover:underline"
                >
                  [ View Experience ]
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2.5 rounded-full border border-slate-200/50 hover:bg-slate-100 transition text-slate-600 cursor-pointer">
              <Bell size={18} />
            </button>
            <button className="p-2.5 rounded-full border border-slate-200/50 hover:bg-slate-100 transition text-slate-600 cursor-pointer">
              <User size={18} />
            </button>
          </div>
        </div>

        {/* 3 Stats Cards row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="glass-panel p-6 border-l-4 border-indigo-500">
            <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest block">
              Active Cases
            </span>
            <span className="text-3xl font-black text-slate-900 dark:text-white mt-2 block tracking-tight">
              {stats.activeCases}
            </span>
          </div>

          <div className="glass-panel p-6 border-l-4 border-amber-500">
            <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest block">
              Need Response
            </span>
            <span className="text-3xl font-black text-slate-900 dark:text-white mt-2 block tracking-tight">
              {stats.needsResponse}
            </span>
          </div>

          <div className="glass-panel p-6 border-l-4 border-emerald-500">
            <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest block">
              Resolved Cases
            </span>
            <span className="text-3xl font-black text-slate-900 dark:text-white mt-2 block tracking-tight">
              {stats.resolved}
            </span>
          </div>
        </div>

        {/* Section 1: Needs Your Attention */}
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-450 uppercase tracking-widest border-b border-slate-100/50 dark:border-slate-800/40 pb-3">
            Needs Your Attention
          </h3>

          {loading ? (
            <div className="py-6 text-center text-xs text-slate-450">Loading priority cases...</div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-950/20">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-400">
                    {attentionCase.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                    attentionCase.priority === "HIGH" ? "bg-red-500 text-white" : "bg-amber-500 text-white"
                  }`}>
                    {attentionCase.priority}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-850 dark:text-slate-200">
                  {attentionCase.title}
                </h4>
                <div className="flex gap-4 text-[10px] text-slate-550 font-semibold mt-1">
                  <span>Citizen: <strong>{attentionCase.citizenName}</strong></span>
                  <span>•</span>
                  <span>Language: <strong>{attentionCase.language}</strong></span>
                  <span>•</span>
                  <span className="text-slate-400">{attentionCase.assignedTime}</span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/volunteer/complaint/${attentionCase.rawId}`)}
                className="px-4 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition shrink-0 cursor-pointer text-center"
              >
                Open Case →
              </button>
            </div>
          )}
        </div>

        {/* Section 2: Recent Messages */}
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-450 uppercase tracking-widest border-b border-slate-100/50 dark:border-slate-800/40 pb-3">
            Recent Messages
          </h3>

          <div className="space-y-3">
            {recentMessages.map((msg, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800/40 hover:bg-slate-50/30 transition cursor-pointer"
                onClick={() => navigate(`/volunteer/complaint/${msg.rawId}?tab=chat`)}
              >
                <div className="min-w-0 pr-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      {msg.sender}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      ({msg.caseId})
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate max-w-lg font-medium">
                    "{msg.text}"
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-[9px] text-slate-400 font-semibold">{msg.timeAgo}</span>
                  <span className="text-[10px] font-bold text-indigo-600 hover:underline">
                    Reply
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;