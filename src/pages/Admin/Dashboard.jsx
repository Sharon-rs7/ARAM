import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Bell, User, Clock, ArrowRight, AlertCircle, ShieldAlert } from "lucide-react";
import { adminService } from "../../services/adminService";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    awaitingReview: 12,
    highPriority: 5,
    needGuide: 7
  });

  const [reviewQueue, setReviewQueue] = useState([]);
  
  const [activeIssues, setActiveIssues] = useState([
    { id: "ARAM-00108", message: "Guide requested escalation", status: "escalated" },
    { id: "ARAM-00113", message: "Waiting 3 days for citizen update", status: "delayed" }
  ]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // Load real complaints from admin service
        const list = await adminService.getComplaints();
        
        // Filter pending complaints (awaiting review/triage)
        const pending = list.filter(c => c.status === "PENDING" || c.status === "UNDER_REVIEW");
        const high = list.filter(c => c.priority === "HIGH" || c.priority === "CRITICAL");
        const needG = pending.filter(c => !c.assignedHelperId);
        
        setStats({
          awaitingReview: pending.length || 12,
          highPriority: high.length || 5,
          needGuide: needG.length || 7
        });

        // Format first 3 complaints for Review Queue
        const formatted = pending.slice(0, 3).map(c => ({
          id: `ARAM-00${c.id}`,
          rawId: c.id,
          title: c.title,
          category: c.categoryLabel || c.category || "General Dispute",
          language: c.language === "ta-IN" ? "Tamil" : c.language === "hi-IN" ? "Hindi" : "English",
          priority: c.priority || "MEDIUM",
          timeAgo: "Submitted recently"
        }));
        
        setReviewQueue(formatted);
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Good morning, Admin
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Here's what needs your attention today.
            </p>
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
          <div className="glass-panel p-6 border-l-4 border-amber-500">
            <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest block">
              Awaiting Review
            </span>
            <span className="text-3xl font-black text-slate-900 dark:text-white mt-2 block tracking-tight">
              {stats.awaitingReview}
            </span>
          </div>

          <div className="glass-panel p-6 border-l-4 border-red-500">
            <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest block">
              High Priority
            </span>
            <span className="text-3xl font-black text-slate-900 dark:text-white mt-2 block tracking-tight">
              {stats.highPriority}
            </span>
          </div>

          <div className="glass-panel p-6 border-l-4 border-indigo-500">
            <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest block">
              Need Guide
            </span>
            <span className="text-3xl font-black text-slate-900 dark:text-white mt-2 block tracking-tight">
              {stats.needGuide}
            </span>
          </div>
        </div>

        {/* Section 1: Review Queue */}
        <div className="glass-panel p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-450 uppercase tracking-widest">
              Review Queue
            </h3>
            <button
              onClick={() => navigate("/admin/complaints")}
              className="text-xs font-bold text-indigo-650 hover:underline cursor-pointer"
            >
              View All →
            </button>
          </div>

          {loading ? (
            <div className="py-10 text-center text-xs text-slate-400">Loading Review Queue...</div>
          ) : reviewQueue.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-450 font-medium">
              No complaints awaiting review. Nice job!
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {reviewQueue.map((item) => (
                <div
                  key={item.id}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400 shrink-0">
                        {item.id}
                      </span>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                        {item.title}
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-slate-500">
                      <span>{item.category.replace("_", " ")}</span>
                      <span>•</span>
                      <span>{item.language}</span>
                      <span>•</span>
                      <span className={item.priority === "HIGH" ? "text-red-500" : "text-slate-500"}>
                        {item.priority}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/volunteer/case-review?id=${item.rawId}`)}
                    className="self-start sm:self-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer shrink-0"
                  >
                    Review →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Active Cases Requiring Attention */}
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-450 uppercase tracking-widest">
            Active Cases Requiring Attention
          </h3>

          <div className="space-y-3">
            {activeIssues.map((issue) => (
              <div
                key={issue.id}
                className="flex justify-between items-center p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10"
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert size={16} className={issue.status === "escalated" ? "text-red-500" : "text-amber-500"} />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-350">
                    {issue.id} <span className="font-medium text-slate-500">— {issue.message}</span>
                  </span>
                </div>

                <button
                  onClick={() => navigate(`/admin/complaints`)}
                  className="text-[10px] font-bold text-indigo-650 hover:underline cursor-pointer"
                >
                  Manage
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;