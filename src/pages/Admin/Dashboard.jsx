import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/common/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { 
  Bell, User, Clock, ArrowRight, AlertCircle, ShieldAlert,
  MapPin, Scale, Users, FileText
} from "lucide-react";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Legend, 
  BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip 
} from "recharts";

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const adminDistrict = user?.district || "GLOBAL";
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    awaitingReview: 0,
    highPriority: 0,
    needGuide: 0
  });

  const [reviewQueue, setReviewQueue] = useState([]);
  const [districtComplaints, setDistrictComplaints] = useState([]);
  
  const [activeIssues, setActiveIssues] = useState([
    { id: "ARAM-00108", message: "Guide requested escalation", status: "escalated" },
    { id: "ARAM-00113", message: "Waiting 3 days for citizen update", status: "delayed" }
  ]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // Load all complaints
        const list = await adminService.getComplaints();
        
        // Filter by admin's assigned district (except if they are global)
        const filteredList = adminDistrict && adminDistrict !== "GLOBAL" 
          ? list.filter(c => c.district && c.district.toLowerCase() === adminDistrict.toLowerCase())
          : list;

        setDistrictComplaints(filteredList);
        
        // Filter pending complaints (awaiting review/triage)
        const pending = filteredList.filter(c => c.status === "PENDING" || c.status === "UNDER_REVIEW" || c.status === "SUBMITTED");
        const high = filteredList.filter(c => c.priority === "HIGH" || c.priority === "CRITICAL");
        const needG = pending.filter(c => !c.assignedHelperId);
        
        setStats({
          awaitingReview: pending.length,
          highPriority: high.length,
          needGuide: needG.length
        });

        // Format first 3 complaints for Review Queue
        const formatted = pending.slice(0, 3).map(c => ({
          id: c.complaintCustomId || `ARAM-00${c.id}`,
          rawId: c.id,
          title: c.title,
          category: c.categoryLabel || c.category || "General Dispute",
          language: c.language === "ta-IN" ? "Tamil" : c.language === "hi-IN" ? "Hindi" : "English",
          priority: c.priority || "MEDIUM",
          timeAgo: "Submitted recently"
        }));
        
        setReviewQueue(formatted);

        // Derive real active issues requiring attention
        const criticalOrUnassigned = filteredList.filter(c => 
          c.priority === "CRITICAL" || c.priority === "HIGH" || (!c.assignedHelperId && (c.status === "UNDER_REVIEW" || c.status === "PENDING"))
        ).slice(0, 4);

        const realIssues = criticalOrUnassigned.map(c => ({
          id: c.complaintCustomId || `ARAM-00${c.id}`,
          rawId: c.id,
          message: c.priority === "CRITICAL"
            ? "Critical priority legal escalation"
            : !c.assignedHelperId
            ? "Awaiting designated legal guide assignment"
            : "High priority case in ongoing review",
          status: c.priority === "CRITICAL" ? "escalated" : "delayed"
        }));

        setActiveIssues(realIssues);
      } catch (err) {
        console.error("Failed to load admin stats:", err);
        toast.error("Error loading regional dashboard.");
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [adminDistrict]);

  // Compute chart statistics
  const statusData = [
    { name: "Pending", value: districtComplaints.filter(c => c.status === "PENDING" || c.status === "SUBMITTED").length },
    { name: "Active Review", value: districtComplaints.filter(c => c.status === "UNDER_REVIEW").length },
    { name: "Resolved", value: districtComplaints.filter(c => c.status === "RESOLVED").length }
  ].filter(d => d.value > 0);

  const categoryCounts = districtComplaints.reduce((acc, c) => {
    const cat = c.category ? c.category.replace(/_/g, " ") : "General";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const categoryData = Object.entries(categoryCounts).map(([key, val]) => ({
    name: key.slice(0, 15),
    Count: val
  }));

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user?.name || "Admin"}
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-1 flex items-center gap-1">
              <MapPin size={12} className="text-indigo-600" />
              ARAM {adminDistrict !== "GLOBAL" ? `${adminDistrict} Region` : "Statewide"} Management Portal
            </p>
          </div>
          
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button 
              onClick={() => navigate("/admin/complaints")}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <FileText size={14} />
              <span>Complaints</span>
            </button>
            <button 
              onClick={() => navigate("/admin/profile")}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition text-slate-650 cursor-pointer"
              title="Admin Profile"
            >
              <User size={16} />
            </button>
          </div>
        </div>

        {/* Region Indicator Card */}
        {adminDistrict !== "GLOBAL" && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MapPin className="text-indigo-700 shrink-0" size={16} />
              <span className="text-xs font-bold text-indigo-900"> Active Control Scope: Filtered to {adminDistrict} district.</span>
            </div>
            <span className="text-[10px] font-extrabold uppercase bg-indigo-200 text-indigo-700 px-2 py-0.5 rounded self-start sm:self-auto">Regional Scope</span>
          </div>
        )}

        {/* 3 Stats Cards row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel p-4 sm:p-6 border-l-4 border-amber-500">
            <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest block">
              Awaiting Review ({adminDistrict})
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1.5 block tracking-tight">
              {stats.awaitingReview}
            </span>
          </div>

          <div className="glass-panel p-4 sm:p-6 border-l-4 border-red-500">
            <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest block">
              High Priority ({adminDistrict})
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1.5 block tracking-tight">
              {stats.highPriority}
            </span>
          </div>

          <div className="glass-panel p-4 sm:p-6 border-l-4 border-indigo-500">
            <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest block">
              Need Guide ({adminDistrict})
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1.5 block tracking-tight">
              {stats.needGuide}
            </span>
          </div>
        </div>

        {/* Charts & Graphics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status Breakdown */}
          <div className="glass-panel p-5 flex flex-col items-center">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest self-start mb-4">
              Grievance Status Breakdown
            </h3>
            {statusData.length > 0 ? (
              <div className="w-full h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="#f59e0b" />
                      <Cell fill="#4f46e5" />
                      <Cell fill="#10b981" />
                    </Pie>
                    <Legend verticalAlign="bottom" height={36} />
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-slate-400 text-xs font-semibold">No case statistics.</div>
            )}
          </div>

          {/* Category Distribution */}
          <div className="glass-panel p-5 flex flex-col">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4">
              Regional Category Distribution
            </h3>
            {categoryData.length > 0 ? (
              <div className="w-full h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <ChartTooltip />
                    <Bar dataKey="Count" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-slate-400 text-xs font-semibold self-center">No case statistics.</div>
            )}
          </div>
        </div>

        {/* Section 1: Review Queue */}
        <div className="glass-panel p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-450 uppercase tracking-widest">
              Review Queue ({adminDistrict})
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
            <div className="divide-y divide-slate-100">
              {reviewQueue.map((item) => (
                <div
                  key={item.id}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-450 shrink-0">
                        {item.id}
                      </span>
                      <h4 className="font-bold text-sm text-slate-800">
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
                    onClick={() => navigate(`/guide/case-review?id=${item.rawId}`)}
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
        <div className="glass-panel p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-slate-450 uppercase tracking-widest">
              Active Cases Requiring Attention ({activeIssues.length})
            </h3>
            <button
              onClick={() => navigate("/admin/complaints")}
              className="text-xs font-bold text-indigo-650 hover:underline cursor-pointer"
            >
              View All Cases →
            </button>
          </div>

          <div className="space-y-2.5">
            {activeIssues.length === 0 ? (
              <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 text-xs font-semibold text-emerald-800 text-center">
                All active cases in {adminDistrict} are currently proceeding within normal SLA guidelines.
              </div>
            ) : (
              activeIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ShieldAlert size={16} className={issue.status === "escalated" ? "text-red-500 shrink-0" : "text-amber-500 shrink-0"} />
                    <div className="text-xs font-bold text-slate-700 truncate min-w-0">
                      <span className="font-mono">{issue.id}</span>
                      <span className="font-medium text-slate-500 hidden sm:inline"> — {issue.message}</span>
                      <span className="block text-[10px] text-slate-500 font-normal sm:hidden">{issue.message}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/admin/complaints?search=${encodeURIComponent(issue.id)}`)}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-bold shrink-0 transition cursor-pointer"
                  >
                    Manage
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;