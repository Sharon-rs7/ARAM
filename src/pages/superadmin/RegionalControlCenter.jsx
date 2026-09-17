import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/common/DashboardLayout";
import { regionalAdminService } from "@/services/regionalAdminService";
import { adminService } from "@/services/adminService";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  MapPin, Users, Scale, ShieldAlert, FileText, CheckCircle2,
  AlertCircle, Clock, X, Bot, Sparkles, Phone, Mail, ArrowLeft,
  Shield, Activity, RefreshCw, BarChart2, Plus, Eye, UserCheck,
  TrendingUp, AlertTriangle, ChevronRight, ShieldCheck
} from "lucide-react";
import DistrictOverview from "@/components/admin/DistrictOverview";
import RegionalMetrics from "@/components/admin/RegionalMetrics";
import RegionalCharts from "@/components/admin/RegionalCharts";

export default function RegionalControlCenter() {
  const { district } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Data States
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [citizens, setCitizens] = useState([]);
  const [guides, setGuides] = useState([]);
  const [regionalAdmin, setRegionalAdmin] = useState(null);
  const [timeRange, setTimeRange] = useState("30d");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Modals
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedGuideId, setSelectedGuideId] = useState("");
  const [assignReason, setAssignReason] = useState("");
  const [recommendedGuides, setRecommendedGuides] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // User Context Scoping
  const { user: authUser, role: authRole } = useAuth();
  const isSuperAdmin = authRole === "SUPER_ADMIN" || authUser?.role === "SUPER_ADMIN" || authUser?.district === "GLOBAL" || authUser?.district === "Statewide" || authUser?.email?.includes("superadmin");
  const isAdmin = (authRole === "ADMIN" || authUser?.role === "ADMIN") && !isSuperAdmin;

  useEffect(() => {
    // 403 Scoping Check: SuperAdmin has full statewide pass, Regional Admin locked to assigned district
    if (isAdmin && authUser?.district && !["GLOBAL", "STATEWIDE"].includes(authUser.district.toUpperCase()) && authUser.district.toLowerCase() !== district?.toLowerCase()) {
      setError(`Unauthorized Access: You are assigned to ${authUser.district} Region. You cannot view ${district}.`);
      setLoading(false);
      return;
    }
    
    loadDistrictData();
  }, [district, timeRange, authRole, authUser]);

  const loadDistrictData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, analyticsData, complaintsData, citizensData, guidesData] = await Promise.all([
        regionalAdminService.getDashboardStats(district).catch(() => null),
        regionalAdminService.getAnalytics(district, timeRange).catch(() => null),
        regionalAdminService.getComplaints(district).catch(() => []),
        regionalAdminService.getCitizens(district).catch(() => []),
        regionalAdminService.getGuides(district).catch(() => [])
      ]);

      setStats(statsData);
      setAnalytics(analyticsData);
      setComplaints(complaintsData || []);
      setCitizens(citizensData || []);
      setGuides(guidesData || []);

      // Find regional admin
      let adminUser = (citizensData || []).find(c => c.role === "ADMIN");
      if (!adminUser) {
        try {
          const adminRes = await regionalAdminService.getAdminUser(district);
          if (adminRes) adminUser = adminRes;
        } catch (e) {}
      }
      setRegionalAdmin(adminUser || null);
    } catch (err) {
      console.error(err);
      setError("Failed to load regional operations dataset.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminStatusToggle = async () => {
    if (!regionalAdmin) return;
    setUpdating(true);
    const newStatus = regionalAdmin.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await adminService.updateUserStatus(regionalAdmin.id, newStatus);
      setRegionalAdmin(prev => ({ ...prev, status: newStatus }));
      toast.success(`Admin account status modified to ${newStatus}`);
    } catch (err) {
      toast.error("Failed to alter administrator authorization status.");
    } finally {
      setUpdating(false);
    }
  };

  const handleGuideStatusToggle = async (guideId, currentStatus) => {
    setUpdating(true);
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await adminService.updateUserStatus(guideId, newStatus);
      setGuides(prev => prev.map(g => g.id === guideId ? { ...g, status: newStatus } : g));
      toast.success(`Guide status modified to ${newStatus}`);
    } catch (err) {
      toast.error("Failed to toggle guide status.");
    } finally {
      setUpdating(false);
    }
  };

  const openAssignModal = async (complaint) => {
    setSelectedComplaint(complaint);
    setSelectedGuideId(complaint.assignedHelper?.id || "");
    setAssignReason("");
    setShowAssignModal(true);
    setLoadingRecommendations(true);

    try {
      const recs = await regionalAdminService.getRecommendedGuides(complaint.id);
      setRecommendedGuides(recs || []);
    } catch (err) {
      setRecommendedGuides([]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGuideId || !selectedComplaint) return;
    setUpdating(true);

    try {
      await regionalAdminService.assignGuide(selectedComplaint.id, selectedGuideId, {
        guideId: selectedGuideId,
        overrideReason: assignReason,
        adminNote: `Dispatched from ${district} Regional Control Center`
      });
      toast.success("Legal Guide assigned successfully!");
      setShowAssignModal(false);
      await loadDistrictData();
    } catch (err) {
      toast.error("Failed to assign guide.");
    } finally {
      setUpdating(false);
    }
  };

  // Dynamic AI synthesis
  const generateAiAnalysis = () => {
    const totalCount = stats?.totalComplaints || complaints.length || 0;
    const pendingCount = stats?.pendingComplaints || complaints.filter(c => c.status !== "RESOLVED" && c.status !== "REJECTED").length || 0;
    const resolvedCount = stats?.resolvedComplaints || complaints.filter(c => c.status === "RESOLVED").length || 0;
    const guidesCount = guides.length || 1;
    const ratio = (totalCount / guidesCount).toFixed(1);
    
    let recommendation = "Queue operating normally. Legal triage pace is optimal.";
    if (pendingCount > 5) {
      recommendation = "High pending volume detected. Recommend dispatching secondary pool volunteers.";
    } else if (guidesCount === 0) {
      recommendation = "No local Legal Guides available. Critical action: onboard regional volunteers.";
    }

    const categories = complaints.map(c => c.category).filter(Boolean);
    const focusCategory = categories.length > 0 ? categories[0].replace(/_/g, " ") : "CIVIL DISPUTES";

    return {
      summary: `Automated District Audit for ${district}: Caseload stands at ${totalCount} grievances (${pendingCount} pending review, ${resolvedCount} resolved). Regional Legal Guide workforce currently has ${guidesCount} personnel with an average load of ${ratio} cases per guide.`,
      focusCategory,
      utilizationRate: `${Math.min(100, Math.round((ratio / 5) * 100))}%`,
      triageRecommendation: recommendation
    };
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <RefreshCw size={32} className="animate-spin text-[#163D32]" />
          <p className="text-xs font-bold text-[#65736D]">Loading Regional Operations Control Center for {district}...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-8 bg-[#FFFDF8] dark:bg-[#11201B] border border-rose-200 dark:border-rose-900/50 rounded-3xl text-center max-w-lg mx-auto space-y-4 mt-12 shadow-sm">
          <ShieldAlert size={40} className="text-rose-600 mx-auto" />
          <h2 className="text-lg font-black text-[#163D32] dark:text-rose-300">Security Protocol Notice</h2>
          <p className="text-xs text-[#65736D] dark:text-slate-300 font-medium leading-relaxed">{error}</p>
          <button 
            onClick={() => navigate(isSuperAdmin ? "/superadmin/dashboard" : "/admin/dashboard")}
            className="mt-4 px-6 py-2.5 bg-[#163D32] hover:bg-[#1F5948] text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Go Back to Dashboard
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const aiInsights = generateAiAnalysis();

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-14 max-w-7xl mx-auto text-[#18332B] dark:text-slate-100">
        
        {/* Header & Back Link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFDF8] dark:bg-[#11201B] p-4.5 rounded-2xl border border-[#E6E1D8] dark:border-emerald-800/50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(isSuperAdmin ? "/superadmin/dashboard" : "/admin/dashboard")}
              className="flex items-center gap-1.5 text-xs font-bold text-[#65736D] dark:text-emerald-300/70 hover:text-[#18332B] dark:hover:text-white hover:bg-[#F7F1E6] dark:hover:bg-[#182C26] px-3 py-1.5 rounded-xl transition cursor-pointer"
            >
              <ArrowLeft size={16} /> Back to {isSuperAdmin ? "Super Admin Grid" : "Dashboard"}
            </button>
            <span className="text-slate-300 dark:text-emerald-900">|</span>
            <div className="flex items-center gap-1.5 text-xs font-black text-[#163D32] dark:text-emerald-300">
              <MapPin size={15} className="text-[#1F5948] dark:text-emerald-400" />
              <span>{district} Jurisdiction Hub</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={loadDistrictData}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-[#182C26] border border-[#E6E1D8] dark:border-emerald-800 text-xs font-bold text-[#18332B] dark:text-emerald-200 hover:bg-[#F7F1E6] rounded-xl shadow-xs transition cursor-pointer"
            >
              <RefreshCw size={13} /> Refresh Live
            </button>
          </div>
        </div>

        {/* District Banner */}
        <DistrictOverview district={district} />

        {/* Core Metrics summary */}
        <RegionalMetrics stats={stats} />

        {/* Tabs navigation */}
        <div className="flex border-b border-[#E6E1D8] dark:border-emerald-900/60 gap-2 overflow-x-auto text-xs font-bold">
          {[
            { id: "overview", label: "Overview & Telemetry", icon: Activity },
            { id: "analytics", label: "Interactive Visual Graphs", icon: BarChart2 },
            { id: "cases", label: "Grievance Cases Queue", icon: FileText, count: complaints.length },
            { id: "team", label: "Legal Guides Force", icon: UserCheck, count: guides.length }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition cursor-pointer whitespace-nowrap ${
                  isActive 
                    ? "border-[#163D32] dark:border-emerald-400 text-[#163D32] dark:text-emerald-300 font-black bg-[#DCEBDD]/20 dark:bg-emerald-950/40 rounded-t-xl" 
                    : "border-transparent text-[#65736D] dark:text-emerald-200/60 hover:text-[#18332B] dark:hover:text-white"
                }`}
              >
                <Icon size={15} className={isActive ? "text-[#163D32] dark:text-emerald-400" : "text-[#65736D]"} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-[#182C26] font-bold">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW & TELEMETRY */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* AI Assistant Insight */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#FFFDF8] dark:bg-[#11201B] border border-[#E6E1D8] dark:border-emerald-800/50 rounded-3xl p-6 relative overflow-hidden shadow-sm">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="p-2 bg-[#DCEBDD] dark:bg-emerald-900 text-[#163D32] dark:text-emerald-300 rounded-xl">
                      <Bot size={20} />
                    </div>
                    <div>
                      <h3 className="text-[#163D32] dark:text-emerald-300 text-sm font-extrabold uppercase tracking-wider">
                        ARAM AI Operations Audit • {district}
                      </h3>
                      <span className="text-[10px] text-slate-400 dark:text-emerald-400/60 font-semibold">Autonomous Caseload Analysis</span>
                    </div>
                  </div>

                  <p className="text-[#18332B] dark:text-slate-200 text-xs leading-relaxed mb-4 font-medium">{aiInsights.summary}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 border-t border-[#E6E1D8] dark:border-emerald-900/50 pt-4 text-xs">
                    <div className="p-3 bg-[#F7F1E6]/50 dark:bg-[#182C26] rounded-xl border border-[#E6E1D8] dark:border-emerald-800/40">
                      <span className="text-[#65736D] dark:text-emerald-300/70 text-[10px] uppercase font-bold block">Focus Category</span>
                      <span className="text-[#163D32] dark:text-emerald-400 font-black mt-1 block uppercase">{aiInsights.focusCategory}</span>
                    </div>
                    <div className="p-3 bg-[#F7F1E6]/50 dark:bg-[#182C26] rounded-xl border border-[#E6E1D8] dark:border-emerald-800/40">
                      <span className="text-[#65736D] dark:text-emerald-300/70 text-[10px] uppercase font-bold block">Capacity Pool Utilization</span>
                      <span className="text-[#1F5948] dark:text-emerald-400 font-black mt-1 block">{aiInsights.utilizationRate}</span>
                    </div>
                    <div className="p-3 bg-[#F7F1E6]/50 dark:bg-[#182C26] rounded-xl border border-[#E6E1D8] dark:border-emerald-800/40">
                      <span className="text-[#65736D] dark:text-emerald-300/70 text-[10px] uppercase font-bold block">Triage Recommendation</span>
                      <span className="text-[#163D32] dark:text-emerald-400 font-bold mt-1 block leading-snug">{aiInsights.triageRecommendation}</span>
                    </div>
                  </div>
                </div>

                {/* Recent Cases preview */}
                <div className="bg-[#FFFDF8] dark:bg-[#11201B] border border-[#E6E1D8] dark:border-emerald-800/50 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[#163D32] dark:text-emerald-300 text-sm font-extrabold uppercase tracking-wider">
                      Recent District Grievances ({complaints.length})
                    </h3>
                    <button
                      onClick={() => setActiveTab("cases")}
                      className="text-xs font-bold text-[#1F5948] dark:text-emerald-400 hover:underline"
                    >
                      View All Cases →
                    </button>
                  </div>

                  <div className="space-y-3">
                    {complaints.slice(0, 4).map(c => (
                      <div 
                        key={c.id} 
                        onClick={() => navigate(`/admin/complaint/${c.id}`)}
                        className="p-4 bg-[#F7F1E6]/40 dark:bg-[#182C26] hover:bg-[#DCEBDD]/30 dark:hover:bg-[#1E3830] border border-[#E6E1D8] dark:border-emerald-800/40 rounded-2xl cursor-pointer transition flex justify-between items-center"
                      >
                        <div>
                          <span className="text-[#1F5948] dark:text-emerald-400 text-xs font-mono font-bold">{c.complaintCustomId || `ARAM-${c.id}`}</span>
                          <h4 className="text-[#18332B] dark:text-white text-xs font-bold mt-0.5">{c.title}</h4>
                          <span className="text-[10px] text-[#65736D] dark:text-emerald-200/60 block mt-1 uppercase font-semibold">
                            {c.category?.replace(/_/g, " ") || "CIVIL DISPUTE"} • Priority: {c.priority || "MEDIUM"}
                          </span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-black ${
                          c.status === "RESOLVED"
                            ? "bg-[#DCEBDD] text-[#163D32] dark:bg-emerald-950 dark:text-emerald-300 border border-[#c5ddc6]"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300"
                        }`}>
                          {c.status}
                        </span>
                      </div>
                    ))}
                    {complaints.length === 0 && (
                      <p className="text-[#65736D] dark:text-emerald-200/50 text-xs text-center py-6 font-medium">No grievances registered in this district.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar: Regional Admin Authority */}
              <div className="space-y-6">
                <div className="bg-[#FFFDF8] dark:bg-[#11201B] border border-[#E6E1D8] dark:border-emerald-800/50 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield size={20} className="text-[#1F5948] dark:text-emerald-400" />
                    <h3 className="text-[#163D32] dark:text-emerald-300 text-sm font-extrabold uppercase tracking-wider">Regional Administrator</h3>
                  </div>

                  {regionalAdmin ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-[#DCEBDD] dark:bg-emerald-950 text-[#163D32] dark:text-emerald-300 border border-[#c5ddc6] flex items-center justify-center font-black text-lg">
                          {regionalAdmin.name?.charAt(0) || "A"}
                        </div>
                        <div>
                          <h4 className="text-[#18332B] dark:text-white text-sm font-bold flex items-center gap-1.5">
                            <span>{regionalAdmin.name}</span>
                            <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
                          </h4>
                          <span className="text-[10px] text-[#65736D] dark:text-emerald-300/70 font-bold uppercase">{district} Admin</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 border-t border-[#E6E1D8] dark:border-emerald-900/50 pt-4 text-xs">
                        <div className="flex justify-between py-1">
                          <span className="text-[#65736D] dark:text-emerald-300/60 uppercase font-bold text-[10px]">EMAIL</span>
                          <span className="text-[#18332B] dark:text-white font-mono text-[11px] truncate max-w-[170px]">{regionalAdmin.email}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-[#65736D] dark:text-emerald-300/60 uppercase font-bold text-[10px]">PHONE</span>
                          <span className="text-[#18332B] dark:text-white font-mono text-[11px]">{regionalAdmin.mobile || "N/A"}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-[#65736D] dark:text-emerald-300/60 uppercase font-bold text-[10px]">STATUS</span>
                          <span className={`font-bold ${regionalAdmin.status === "ACTIVE" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"}`}>
                            {regionalAdmin.status}
                          </span>
                        </div>
                      </div>

                      {isSuperAdmin && (
                        <div className="pt-2 space-y-2">
                          <button
                            onClick={handleAdminStatusToggle}
                            disabled={updating}
                            className={`w-full py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex justify-center items-center gap-1.5 ${
                              regionalAdmin.status === "ACTIVE" 
                                ? "bg-white dark:bg-[#182C26] hover:bg-rose-50 text-rose-700 border border-rose-200" 
                                : "bg-[#163D32] hover:bg-[#1F5948] text-white"
                            }`}
                          >
                            {updating ? "Processing..." : regionalAdmin.status === "ACTIVE" ? "Suspend Administrator" : "Activate Administrator"}
                          </button>
                          
                          <button
                            onClick={async () => {
                              try {
                                await adminService.resendAdminInvitation(regionalAdmin.email);
                                toast.success(`Activation link sent to ${regionalAdmin.email}`);
                              } catch (e) {
                                toast.error("Failed to resend activation link.");
                              }
                            }}
                            className="w-full py-2 rounded-xl bg-slate-100 dark:bg-[#182C26] hover:bg-slate-200 text-slate-700 dark:text-emerald-200 font-bold text-xs transition cursor-pointer border border-slate-200 dark:border-emerald-800"
                          >
                            Resend Access Credentials
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 space-y-3">
                      <p className="text-[#65736D] dark:text-emerald-200/60 text-xs font-medium">No regional admin currently assigned to {district}.</p>
                      {isSuperAdmin && (
                        <button
                          onClick={() => navigate("/superadmin/dashboard")}
                          className="px-4 py-2 bg-[#163D32] hover:bg-[#1F5948] text-white rounded-xl text-xs font-bold cursor-pointer"
                        >
                          + Assign Regional Admin
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: INTERACTIVE VISUAL GRAPHS */}
        {activeTab === "analytics" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center bg-[#FFFDF8] dark:bg-[#11201B] border border-[#E6E1D8] dark:border-emerald-800/50 rounded-2xl p-4 shadow-sm">
              <span className="text-[#163D32] dark:text-emerald-300 text-xs font-extrabold uppercase tracking-wider">
                Telemetry Range Filter
              </span>
              <div className="flex gap-2 text-xs">
                {["7d", "30d", "90d", "6m"].map(r => (
                  <button
                    key={r}
                    onClick={() => setTimeRange(r)}
                    className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                      timeRange === r 
                        ? "bg-[#163D32] dark:bg-emerald-600 text-white shadow-xs" 
                        : "bg-white dark:bg-[#182C26] text-[#65736D] dark:text-emerald-200 hover:text-[#18332B] border border-[#E6E1D8] dark:border-emerald-800"
                    }`}
                  >
                    {r.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <RegionalCharts data={analytics} />
          </div>
        )}

        {/* TAB 3: GRIEVANCE CASES QUEUE */}
        {activeTab === "cases" && (
          <div className="bg-[#FFFDF8] dark:bg-[#11201B] border border-[#E6E1D8] dark:border-emerald-800/50 rounded-3xl p-6 shadow-sm animate-in fade-in duration-200">
            <h3 className="text-[#163D32] dark:text-emerald-300 text-sm font-extrabold uppercase tracking-wider mb-4">
              {district} Grievance Cases Triage ({complaints.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E6E1D8] dark:border-emerald-900/60 text-[#65736D] dark:text-emerald-300 uppercase text-[10px] font-black tracking-wider bg-[#F7F1E6]/40 dark:bg-[#182C26]">
                    <th className="py-3 px-4">Complaint ID</th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Assigned Guide</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E1D8] dark:divide-emerald-900/40 text-[#18332B] dark:text-slate-100">
                  {complaints.map(c => (
                    <tr key={c.id} className="hover:bg-[#F7F1E6]/50 dark:hover:bg-[#182C26]/60 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#1F5948] dark:text-emerald-400">
                        {c.complaintCustomId || `ARAM-${c.id}`}
                      </td>
                      <td className="py-3.5 px-4 text-[#18332B] dark:text-white font-bold max-w-xs truncate">{c.title}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          c.priority === "CRITICAL" ? "bg-rose-100 text-rose-800 border border-rose-300" : "bg-amber-100 text-amber-800 border border-amber-300"
                        }`}>
                          {c.priority || "MEDIUM"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[10px] font-bold text-[#65736D] dark:text-emerald-300 uppercase">{c.category || "GENERAL"}</td>
                      <td className="py-3.5 px-4 text-[#18332B] dark:text-white font-medium">
                        {c.assignedHelper?.name || <span className="text-amber-600 font-bold">Unassigned</span>}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#DCEBDD] text-[#163D32] border border-[#c5ddc6]">
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openAssignModal(c)}
                            className="bg-[#163D32] hover:bg-[#1F5948] text-white font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer transition shadow-xs"
                          >
                            Dispatch Guide
                          </button>
                          <button
                            onClick={() => navigate(`/admin/complaint/${c.id}`)}
                            className="border border-slate-200 dark:border-emerald-800 bg-white dark:bg-[#182C26] hover:bg-slate-50 text-slate-700 dark:text-emerald-200 font-bold px-2.5 py-1.5 rounded-xl text-xs cursor-pointer transition"
                          >
                            Workspace
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {complaints.length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-[#65736D] dark:text-emerald-200/50 font-medium">
                        No grievances recorded in this region.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: LEGAL GUIDES FORCE */}
        {activeTab === "team" && (
          <div className="bg-[#FFFDF8] dark:bg-[#11201B] border border-[#E6E1D8] dark:border-emerald-800/50 rounded-3xl p-6 shadow-sm animate-in fade-in duration-200">
            <h3 className="text-[#163D32] dark:text-emerald-300 text-sm font-extrabold uppercase tracking-wider mb-4">
              {district} Legal Guides Directory ({guides.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E6E1D8] dark:border-emerald-900/60 text-[#65736D] dark:text-emerald-300 uppercase text-[10px] font-black tracking-wider bg-[#F7F1E6]/40 dark:bg-[#182C26]">
                    <th className="py-3 px-4">Guide Name</th>
                    <th className="py-3 px-4">Languages</th>
                    <th className="py-3 px-4">Specialization</th>
                    <th className="py-3 px-4">Workload Capacity</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E1D8] dark:divide-emerald-900/40 text-[#18332B] dark:text-slate-100">
                  {guides.map(g => (
                    <tr key={g.id} className="hover:bg-[#F7F1E6]/50 dark:hover:bg-[#182C26]/60">
                      <td className="py-3.5 px-4 font-bold text-[#18332B] dark:text-white flex items-center gap-1.5">
                        <span>{g.name}</span>
                        {g.helperVerified && <CheckCircle2 size={13} className="text-emerald-600" />}
                      </td>
                      <td className="py-3.5 px-4 text-[#65736D] dark:text-emerald-200/70 font-medium">{g.languagesKnown || "Tamil, English"}</td>
                      <td className="py-3.5 px-4 text-[#65736D] dark:text-emerald-200/70">{g.specialization || "General Legal Aid"}</td>
                      <td className="py-3.5 px-4 font-bold text-[#163D32] dark:text-emerald-400">
                        {g.currentActiveCases || 0} / {g.maxActiveCases || 5} cases
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          g.status === "ACTIVE" ? "bg-[#DCEBDD] text-[#163D32] border border-[#c5ddc6]" : "bg-rose-100 text-rose-800 border border-rose-300"
                        }`}>
                          {g.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleGuideStatusToggle(g.id, g.status)}
                          disabled={updating}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                            g.status === "ACTIVE" 
                              ? "bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 dark:bg-[#182C26] dark:text-rose-300 dark:border-rose-800" 
                              : "bg-[#163D32] hover:bg-[#1F5948] text-white"
                          }`}
                        >
                          {g.status === "ACTIVE" ? "Suspend" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {guides.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-[#65736D] dark:text-emerald-200/50 font-medium">
                        No legal guides registered in this region.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL: ASSIGN GUIDE */}
        {showAssignModal && selectedComplaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white dark:bg-[#11201B] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-emerald-800 shadow-2xl space-y-5 text-left">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-emerald-900/50 pb-3">
                <div>
                  <h3 className="text-base font-black text-[#163D32] dark:text-emerald-300">
                    Dispatch Guide • {selectedComplaint.complaintCustomId || `ARAM-${selectedComplaint.id}`}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-emerald-200/60 truncate max-w-xs">{selectedComplaint.title}</p>
                </div>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {loadingRecommendations ? (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#182C26] text-center text-xs text-slate-500">
                  <RefreshCw size={16} className="animate-spin mx-auto mb-1 text-[#163D32]" />
                  <span>Computing optimal AI matches...</span>
                </div>
              ) : recommendedGuides.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#1F5948] dark:text-emerald-400 flex items-center gap-1">
                    <Sparkles size={12} /> AI Recommended Guides:
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {recommendedGuides.slice(0, 3).map((rec) => (
                      <div
                        key={rec.id || rec.volunteerId}
                        onClick={() => setSelectedGuideId(rec.id || rec.volunteerId)}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                          selectedGuideId == (rec.id || rec.volunteerId)
                            ? "bg-[#DCEBDD] text-[#163D32] border-[#163D32] font-black"
                            : "bg-slate-50 dark:bg-[#182C26] border-slate-200 dark:border-emerald-800 text-slate-800 dark:text-slate-100 hover:bg-slate-100"
                        }`}
                      >
                        <div>
                          <p className="font-bold">{rec.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-emerald-300/70">{rec.district} • Match: {rec.matchScore ? `${Math.round(rec.matchScore * 100)}%` : "High"}</p>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">Select</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-emerald-200 uppercase tracking-wider text-[10px] mb-1">
                    Choose Legal Guide *
                  </label>
                  <select
                    value={selectedGuideId}
                    onChange={(e) => setSelectedGuideId(e.target.value)}
                    required
                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-[#182C26] px-3 font-bold text-slate-800 dark:text-white outline-none focus:border-[#163D32]"
                  >
                    <option value="">-- Select Guide --</option>
                    {guides.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.currentActiveCases || 0}/{g.maxActiveCases || 5} cases)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-emerald-200 uppercase tracking-wider text-[10px] mb-1">
                    Dispatch Note / Reason
                  </label>
                  <textarea
                    rows={2}
                    value={assignReason}
                    onChange={(e) => setAssignReason(e.target.value)}
                    placeholder="e.g. Priority district legal guide allocation."
                    className="w-full rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-[#182C26] p-2.5 font-medium text-slate-800 dark:text-white outline-none focus:border-[#163D32]"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-emerald-900/50">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-emerald-800 text-slate-600 dark:text-emerald-200 font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating || !selectedGuideId}
                    className="px-5 py-2 rounded-xl bg-[#163D32] hover:bg-[#1F5948] text-white font-bold transition shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {updating ? "Dispatching..." : "Confirm Dispatch"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
