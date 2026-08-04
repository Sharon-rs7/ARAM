import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  ClipboardList,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  Eye,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Briefcase,
  RefreshCw,
  BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { volunteerService } from "../../services/volunteerService";
import { USE_MOCKS } from "../../services/api";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setError("");
    setLoading(true);
    try {
      const dashboard = await volunteerService.getDashboard();
      setData(dashboard);
    } catch (err) {
      console.error("Failed to load volunteer dashboard data", err);
      setError("Backend server is currently unavailable. Please verify the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAvailabilityChange = async (newStatus) => {
    try {
      await volunteerService.updateAvailability(newStatus);
      setData((prev) => ({
        ...prev,
        volunteer: {
          ...prev.volunteer,
          availabilityStatus: newStatus
        }
      }));
      toast.success(`Availability updated to ${newStatus}`);
    } catch (err) {
      toast.error("Failed to update availability status");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center space-y-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto"></div>
            <p className="text-slate-500 text-sm font-semibold">Loading dashboard metrics...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center max-w-md p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
            <AlertTriangle className="text-red-500 mx-auto" size={40} />
            <h2 className="text-lg font-bold text-slate-800">Connection Failed</h2>
            <p className="text-slate-500 text-sm">{error}</p>
            <button
              onClick={loadData}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition mx-auto cursor-pointer"
            >
              <RefreshCw size={14} /> Retry Connection
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const volunteer = data?.volunteer || {};
  const stats = data?.stats || {};
  const cases = data?.assignedCases || [];
  const activity = data?.activity || {};

  const utilizationPercentage = Math.round((stats.assigned / (volunteer.maxActiveCases || 5)) * 100);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Top welcome section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-3xl border border-slate-150 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
              <UserCheck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-bold text-slate-800">Legal Guide Dashboard ({volunteer.name || "Sharon Mary"})</h1>
                {volunteer.verified && (
                  <span className="inline-flex items-center gap-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-indigo-100">
                    <ShieldCheck size={10} /> Verified
                  </span>
                )}
                {USE_MOCKS && (
                  <span className="bg-amber-50 text-amber-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-amber-100 uppercase tracking-wider">
                    Demo Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">Review assigned complaints and support public users.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">My Status</label>
              <select
                value={volunteer.availabilityStatus || "AVAILABLE"}
                onChange={(e) => handleAvailabilityChange(e.target.value)}
                className="h-9 rounded-lg border border-slate-200 px-3 outline-none text-slate-800 text-xs bg-white font-semibold cursor-pointer focus:border-indigo-500"
              >
                <option value="AVAILABLE">🟢 Available</option>
                <option value="BUSY">🟡 Busy</option>
                <option value="AWAY">🔵 Away</option>
                <option value="PAUSED">⏸️ Paused</option>
                <option value="OFFLINE">🔴 Offline</option>
              </select>
            </div>
            <button
              onClick={() => navigate("/volunteer/my-analytics")}
              className="flex items-center gap-2 h-9 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-700 px-4 text-xs font-bold transition cursor-pointer"
            >
              <BarChart3 size={14} /> View My Analytics
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100">
            <ClipboardList className="text-indigo-600" size={26} />
            <h2 className="mt-4 text-3xl font-black text-slate-800">{stats.assigned || 0}</h2>
            <p className="mt-1 text-slate-500 text-xs font-bold uppercase tracking-wide">Assigned Cases</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100">
            <Clock3 className="text-amber-500" size={26} />
            <h2 className="mt-4 text-3xl font-black text-slate-800">{stats.pending || 0}</h2>
            <p className="mt-1 text-slate-500 text-xs font-bold uppercase tracking-wide">Pending Review</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100">
            <CheckCircle2 className="text-emerald-600" size={26} />
            <h2 className="mt-4 text-3xl font-black text-slate-800">{stats.resolved || 0}</h2>
            <p className="mt-1 text-slate-500 text-xs font-bold uppercase tracking-wide">Resolved Cases</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100">
            <AlertTriangle className="text-red-500" size={26} />
            <h2 className="mt-4 text-3xl font-black text-slate-800">{stats.highPriority || 0}</h2>
            <p className="mt-1 text-slate-500 text-xs font-bold uppercase tracking-wide">High Priority</p>
          </div>
        </div>

        {/* Core Layout Split */}
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Main Assigned Complaints List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-150">
              <h2 className="mb-4 text-lg font-bold text-slate-800">Recent Assigned Cases</h2>

              <div className="space-y-4">
                {cases.length === 0 ? (
                  <div className="text-center py-10 space-y-2">
                    <p className="text-slate-400 text-sm font-semibold">No complaints are currently assigned to you.</p>
                    <p className="text-xs text-slate-400">Your profile is active. New matching complaints will appear here after admin assignment.</p>
                  </div>
                ) : (
                  cases.map((item) => {
                    const priority = item.priority ? item.priority.toUpperCase() : "MEDIUM";
                    const status = item.status ? item.status.toUpperCase() : "SUBMITTED";
                    const isSensitive = item.sensitive || item.womenSensitive;

                    return (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border border-slate-150 p-4 gap-4 hover:bg-slate-50/50 transition"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-sm text-slate-800">
                              ARAM-2026-{String(item.id).replace("cmp-", "").padStart(6, "0")}
                            </h3>
                            {isSensitive && (
                              <span className="bg-red-50 text-red-600 border border-red-100 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-md">
                                Sensitive
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 font-semibold truncate max-w-md">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-4 text-[10px] text-slate-400">
                            <span>District: <strong>{item.district || "Default"}</strong></span>
                            <span>Language: <strong>{item.language || "English"}</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3.5 shrink-0">
                          <div className="text-left sm:text-right">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                priority === "CRITICAL" || priority === "HIGH"
                                  ? "bg-red-50 text-red-600 border border-red-100"
                                  : "bg-indigo-50 text-indigo-600 border border-indigo-100"
                              }`}
                            >
                              {priority}
                            </span>
                            <p className="text-[10px] font-semibold text-slate-500 mt-1">
                              Status: <strong className="text-slate-700">{status.replace(/_/g, " ")}</strong>
                            </p>
                          </div>

                          <button
                            onClick={() => navigate(`/volunteer/complaint/${item.id}`)}
                            className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 transition cursor-pointer"
                          >
                            <Eye size={12} /> Review
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* AI Recommendation Context */}
            {cases.length > 0 && (
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-150 space-y-4">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={18} className="text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-800">AI Assignment Matching Context</h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-slate-400 text-[10px] font-semibold uppercase">Category Matches</span>
                    <p className="font-semibold text-slate-700">Specialization tags perfectly match cases.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-slate-400 text-[10px] font-semibold uppercase">Language Matching</span>
                    <p className="font-semibold text-slate-700">English/Tamil matching verification enabled.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Side Info Panels */}
          <div className="space-y-6">
            
            {/* Workload Capacity */}
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-150 space-y-4">
              <h2 className="text-sm font-bold text-slate-800">Workload Capacity</h2>
              <div>
                <div className="flex justify-between text-xs text-slate-500 font-semibold mb-1">
                  <span>Capacity Utilization</span>
                  <span>{utilizationPercentage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      utilizationPercentage >= 90 ? "bg-red-500" : "bg-indigo-600"
                    }`}
                    style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                Max Load: <strong>{volunteer.maxActiveCases || 8}</strong> cases. Auto-assignment will pause once utilization reaches 100%.
              </p>
            </div>

            {/* Progress / Text Spacing fix */}
            <div className="rounded-3xl bg-white border border-slate-150 p-6 space-y-3">
              <h2 className="text-sm font-bold text-slate-800">Today's Progress</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                {"You have completed "}
                <strong className="text-slate-800">{stats.resolved || 0} complaints</strong>
                {" and "}
                <strong className="text-slate-800">{stats.pending || 0} complaints</strong>
                {" are waiting for review."}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-150 space-y-3">
              <h2 className="text-sm font-bold text-slate-800">Quick Actions</h2>
              <div className="space-y-2">
                <button
                  onClick={() => navigate("/volunteer/assigned-cases")}
                  className="w-full text-center py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition cursor-pointer"
                >
                  View Assigned Cases
                </button>
                <button
                  onClick={() => navigate("/volunteer/settings")}
                  className="w-full text-center py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Configure Profile & Settings
                </button>
              </div>
            </div>

            {/* Activity Summary */}
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-150 space-y-4">
              <h2 className="text-sm font-bold text-slate-800">Activity Summary</h2>
              <ul className="text-xs text-slate-500 space-y-2.5">
                <li className="flex justify-between">
                  <span>Cases viewed today</span>
                  <strong className="text-slate-700">{activity.casesViewedToday || 0}</strong>
                </li>
                <li className="flex justify-between">
                  <span>Review notes added</span>
                  <strong className="text-slate-700">{activity.notesAddedToday || 0}</strong>
                </li>
                <li className="flex justify-between">
                  <span>Status updates made</span>
                  <strong className="text-slate-700">{activity.statusUpdatesToday || 0}</strong>
                </li>
              </ul>
            </div>
            
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;