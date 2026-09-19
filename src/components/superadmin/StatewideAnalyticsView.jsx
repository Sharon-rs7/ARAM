import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminService } from "@/services/adminService";
import { 
  Activity, ShieldAlert, CheckCircle2, Clock, Scale, 
  MapPin, AlertTriangle, ArrowRight, RefreshCw, Filter, 
  Search, ShieldCheck, FileText, ChevronRight, BarChart2,
  TrendingUp, Users, Lock, Bot, Layers, Sparkles, ExternalLink
} from "lucide-react";
import { toast } from "sonner";

export const TN_DISTRICTS = [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", 
  "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", 
  "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", 
  "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", 
  "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", 
  "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", 
  "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", 
  "Vellore", "Viluppuram", "Virudhunagar"
];

export default function StatewideAnalyticsView({ onNavigateToComplaints }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("ALL");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [districtSearch, setDistrictSearch] = useState("");
  const [districtSort, setDistrictSort] = useState("total");

  const fetchAnalytics = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await adminService.getStatewideAnalytics(timeRange, districtFilter);
      setAnalyticsData(data);
    } catch (err) {
      console.error("Failed to load statewide analytics:", err);
      toast.error("Unable to load statewide analytics data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, districtFilter]);

  const handleStageClick = (statusCode) => {
    if (onNavigateToComplaints) {
      onNavigateToComplaints(statusCode);
    } else {
      navigate(`/superadmin/dashboard?tab=complaints&status=${encodeURIComponent(statusCode)}`);
    }
  };

  const handleDistrictDrilldown = (districtName) => {
    navigate(`/superadmin/district/${encodeURIComponent(districtName)}`);
  };

  if (loading && !analyticsData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-slate-500">
        <RefreshCw size={28} className="animate-spin text-[#163D32]" />
        <span className="text-xs font-bold uppercase tracking-wider">Aggregating Statewide Legal Analytics...</span>
      </div>
    );
  }

  const kpis = analyticsData?.kpis || {};
  const funnel = analyticsData?.lifecycleFunnel || [];
  const districtPerformance = analyticsData?.districtPerformance || [];
  const categoryAnalytics = analyticsData?.categoryAnalytics || [];
  const priorityAnalytics = analyticsData?.priorityAnalytics || {};
  const slaAging = analyticsData?.slaAging || {};
  const guideTelemetry = analyticsData?.guideTelemetry || {};
  const languageDistribution = analyticsData?.languageDistribution || {};
  const sensitiveOps = analyticsData?.sensitiveOperations || {};
  const aiAndSecurity = analyticsData?.aiAndSecurity || {};

  const filteredDistricts = districtPerformance
    .filter(d => d.district.toLowerCase().includes(districtSearch.toLowerCase()))
    .sort((a, b) => {
      if (districtSort === "total") return b.totalGrievances - a.totalGrievances;
      if (districtSort === "breached") return b.slaBreached - a.slaBreached;
      if (districtSort === "resolved") return b.resolved - a.resolved;
      if (districtSort === "name") return a.district.localeCompare(b.district);
      return 0;
    });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. Filter & Controls Bar */}
      <div className="rounded-3xl bg-[#FFFDF8] dark:bg-[#11201B] p-5 sm:p-6 border border-[#E6E1D8] dark:border-emerald-800/50 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#163D32] text-white">
              Statewide Command
            </span>
            <span className="text-xs text-[#65736D] dark:text-emerald-300/70 font-bold">
              38 Districts Real-time Redressal Intelligence
            </span>
          </div>
          <h2 className="text-lg font-black text-[#18332B] dark:text-white mt-1">
            Executive Legal Aid Redressal & Operations Center
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex rounded-xl bg-slate-100 dark:bg-[#182C26] p-1 border border-slate-200 dark:border-emerald-800/50 text-xs font-bold">
            {[
              { id: "today", label: "Today" },
              { id: "7d", label: "7 Days" },
              { id: "30d", label: "30 Days" },
              { id: "all", label: "All Time" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setTimeRange(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  timeRange === tab.id
                    ? "bg-white dark:bg-[#1C352E] text-[#163D32] dark:text-emerald-300 shadow-xs"
                    : "text-[#65736D] dark:text-emerald-200/60 hover:text-[#18332B]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="h-9.5 rounded-xl border border-slate-200 dark:border-emerald-800/60 bg-white dark:bg-[#182C26] px-3 text-xs text-slate-800 dark:text-white font-medium outline-none focus:border-[#163D32]"
          >
            <option value="ALL">All 38 Districts</option>
            {TN_DISTRICTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <button
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#182C26] hover:bg-slate-50 dark:hover:bg-[#1C352E] text-[#163D32] dark:text-emerald-300 text-xs font-bold border border-slate-200 dark:border-emerald-800/50 transition flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            <span>{refreshing ? "Updating..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* 2. Action Required / Critical Alert Banner */}
      {((kpis.slaBreached || 0) > 0 || (kpis.criticalUnresolved || 0) > 0) && (
        <div className="rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-amber-950 dark:text-amber-200">
                Action Required: {kpis.slaBreached || 0} Cases Breached SLA & {kpis.criticalUnresolved || 0} High/Critical Urgent
              </h4>
              <p className="text-[11px] text-amber-900/80 dark:text-amber-300/80 mt-0.5 font-medium">
                Active grievances exceeding the 48-hour response threshold require immediate district admin intervention and legal guide re-allocation.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleStageClick("CRITICAL")}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
            >
              <span>View Critical Cases</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* 3. Executive KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-[#FFFDF8] dark:bg-[#11201B] p-4.5 rounded-2xl border border-[#E6E1D8] dark:border-emerald-800/50 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-extrabold text-[#65736D] dark:text-emerald-300/70 uppercase tracking-wider">Total Caseload</span>
          <span className="text-2xl sm:text-3xl font-black text-[#18332B] dark:text-white mt-1.5">{kpis.totalCases ?? 0}</span>
          <span className="text-[10px] text-slate-400 dark:text-emerald-400/60 font-semibold mt-1">
            {timeRange === "all" ? "Statewide Register" : `Period: ${timeRange.toUpperCase()}`}
          </span>
        </div>

        <div className="bg-[#FFFDF8] dark:bg-[#11201B] p-4.5 rounded-2xl border border-[#E6E1D8] dark:border-emerald-800/50 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-extrabold text-[#65736D] dark:text-emerald-300/70 uppercase tracking-wider">Active In-Review</span>
          <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-1.5">
            {(kpis.newCases || 0) + (kpis.underReview || 0)}
          </span>
          <span className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold mt-1">Pending Assignment</span>
        </div>

        <div className="bg-[#FFFDF8] dark:bg-[#11201B] p-4.5 rounded-2xl border border-[#E6E1D8] dark:border-emerald-800/50 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-extrabold text-[#65736D] dark:text-emerald-300/70 uppercase tracking-wider">Active with Guides</span>
          <span className="text-2xl sm:text-3xl font-black text-[#1F5948] dark:text-emerald-400 mt-1.5">
            {(kpis.assigned || 0) + (kpis.inProgress || 0)}
          </span>
          <span className="text-[10px] text-[#1F5948] dark:text-emerald-400 font-semibold mt-1">Under Legal Assistance</span>
        </div>

        <div className="bg-[#FFFDF8] dark:bg-[#11201B] p-4.5 rounded-2xl border border-[#E6E1D8] dark:border-emerald-800/50 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-extrabold text-[#65736D] dark:text-emerald-300/70 uppercase tracking-wider">Resolved Cases</span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-300 mt-1.5">{kpis.resolved ?? 0}</span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">{kpis.resolutionRate ?? 0}% Resolution Rate</span>
        </div>

        <div className="bg-[#FFFDF8] dark:bg-[#11201B] p-4.5 rounded-2xl border border-[#E6E1D8] dark:border-emerald-800/50 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-extrabold text-[#65736D] dark:text-emerald-300/70 uppercase tracking-wider">SLA Breached (&gt;48h)</span>
          <span className={`text-2xl sm:text-3xl font-black mt-1.5 ${(kpis.slaBreached || 0) > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-700 dark:text-emerald-300"}`}>
            {kpis.slaBreached ?? 0}
          </span>
          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold mt-1">Overdue Action</span>
        </div>

        <div className="bg-[#FFFDF8] dark:bg-[#11201B] p-4.5 rounded-2xl border border-[#E6E1D8] dark:border-emerald-800/50 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-extrabold text-[#65736D] dark:text-emerald-300/70 uppercase tracking-wider">Blockchain Ledger</span>
          <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1.5">
            {aiAndSecurity.totalBlocksMined ?? 0}
          </span>
          <span className="text-[10px] text-indigo-700 dark:text-indigo-300 font-semibold mt-1">
            {aiAndSecurity.blockchainChainValid ? "✓ SHA-256 Valid" : "Audit Pending"}
          </span>
        </div>
      </div>

      {/* 4. Interactive 8-Stage Case Lifecycle Funnel */}
      <div className="rounded-3xl bg-[#FFFDF8] dark:bg-[#11201B] p-6 border border-[#E6E1D8] dark:border-emerald-800/50 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-[#163D32] dark:text-emerald-300" />
              <h3 className="text-sm font-black uppercase tracking-wider text-[#163D32] dark:text-emerald-300">
                End-to-End Case Lifecycle Funnel
              </h3>
            </div>
            <p className="text-xs text-[#65736D] dark:text-emerald-200/70 mt-0.5">
              Click any operational stage to inspect matching complaints in the Grievance Queue.
            </p>
          </div>
          <span className="text-[11px] font-bold text-slate-500 dark:text-emerald-400/60 bg-slate-100 dark:bg-[#182C26] px-3 py-1 rounded-full border border-slate-200 dark:border-emerald-800/50">
            Total Pipeline: {kpis.totalCases ?? 0} Grievances
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-2">
          {funnel.map((stage, idx) => {
            const pct = kpis.totalCases > 0 ? Math.round((stage.count * 100) / kpis.totalCases) : 0;
            return (
              <button
                key={stage.statusCode}
                onClick={() => handleStageClick(stage.statusCode)}
                className="group p-3 rounded-2xl bg-white dark:bg-[#182C26] border border-slate-200 dark:border-emerald-800/50 hover:border-[#163D32] dark:hover:border-emerald-400 transition-all text-left flex flex-col justify-between hover:shadow-md cursor-pointer relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 dark:text-emerald-400/60">
                    0{idx + 1}
                  </span>
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-emerald-400/60">
                    {pct}%
                  </span>
                </div>

                <div className="my-2">
                  <div className="text-xl font-black text-[#18332B] dark:text-white group-hover:text-[#163D32] dark:group-hover:text-emerald-300 transition-colors">
                    {stage.count}
                  </div>
                  <div className="text-[11px] font-bold text-[#163D32] dark:text-emerald-200 line-clamp-1 mt-0.5">
                    {stage.stage}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-emerald-900/40 flex items-center justify-between text-[10px] text-slate-400 dark:text-emerald-400/60 group-hover:text-[#163D32] dark:group-hover:text-emerald-300">
                  <span className="font-semibold truncate">Filter Queue</span>
                  <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform shrink-0" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. 38-District Performance Matrix */}
      <div className="rounded-3xl bg-[#FFFDF8] dark:bg-[#11201B] p-6 border border-[#E6E1D8] dark:border-emerald-800/50 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-[#163D32] dark:text-emerald-300" />
              <h3 className="text-sm font-black uppercase tracking-wider text-[#163D32] dark:text-emerald-300">
                Tamil Nadu 38-District Redressal Matrix
              </h3>
            </div>
            <p className="text-xs text-[#65736D] dark:text-emerald-200/70 mt-0.5">
              Live district capacity, backlog, SLA breaches, and direct link to Regional Control Center.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-emerald-400/60" />
              <input
                type="text"
                value={districtSearch}
                onChange={(e) => setDistrictSearch(e.target.value)}
                placeholder="Search 38 districts..."
                className="w-full h-9 rounded-xl border border-slate-200 dark:border-emerald-800/60 bg-white dark:bg-[#182C26] pl-8.5 pr-3 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#163D32]"
              />
            </div>

            <div className="flex rounded-xl bg-slate-100 dark:bg-[#182C26] p-1 border border-slate-200 dark:border-emerald-800/50 text-[11px] font-bold">
              {[
                { id: "total", label: "Most Cases" },
                { id: "breached", label: "SLA Overdue" },
                { id: "resolved", label: "Resolved" },
                { id: "name", label: "A-Z" }
              ].map(sort => (
                <button
                  key={sort.id}
                  onClick={() => setDistrictSort(sort.id)}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    districtSort === sort.id
                      ? "bg-white dark:bg-[#1C352E] text-[#163D32] dark:text-emerald-300 shadow-xs"
                      : "text-slate-500 dark:text-emerald-200/60"
                  }`}
                >
                  {sort.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* District Matrix Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-emerald-800/50 bg-white dark:bg-[#182C26]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F1E6]/70 dark:bg-[#142621] border-b border-slate-200 dark:border-emerald-800/50 text-[#163D32] dark:text-emerald-200 font-extrabold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-3">Total Cases</th>
                <th className="py-3 px-3">Active In-Review</th>
                <th className="py-3 px-3">With Guides</th>
                <th className="py-3 px-3">Resolved</th>
                <th className="py-3 px-3">SLA Breached (&gt;48h)</th>
                <th className="py-3 px-3">Guides Active</th>
                <th className="py-3 px-3">Admin Assigned</th>
                <th className="py-3 px-4 text-right">Regional Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-emerald-900/30">
              {filteredDistricts.map(d => (
                <tr key={d.district} className="hover:bg-slate-50 dark:hover:bg-[#1c332b] transition-colors">
                  <td className="py-3 px-4 font-bold text-[#18332B] dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{d.district}</span>
                  </td>
                  <td className="py-3 px-3 font-extrabold text-[#18332B] dark:text-white">
                    {d.totalGrievances}
                  </td>
                  <td className="py-3 px-3 font-semibold text-amber-600 dark:text-amber-400">
                    {d.underReview}
                  </td>
                  <td className="py-3 px-3 font-semibold text-[#1F5948] dark:text-emerald-300">
                    {d.assigned}
                  </td>
                  <td className="py-3 px-3 font-bold text-emerald-700 dark:text-emerald-300">
                    {d.resolved}
                  </td>
                  <td className="py-3 px-3 font-extrabold">
                    {d.slaBreached > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px]">
                        {d.slaBreached} Overdue
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-emerald-400/50">0</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-700 dark:text-emerald-200">
                    {d.activeGuides} Guides
                  </td>
                  <td className="py-3 px-3">
                    {d.hasAdmin ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                        <ShieldCheck size={12} /> Assigned
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                        <AlertTriangle size={12} /> Vacant
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDistrictDrilldown(d.district)}
                      className="px-3 py-1 rounded-lg bg-[#DCEBDD] hover:bg-emerald-100 text-[#163D32] font-black text-[11px] transition inline-flex items-center gap-1 cursor-pointer active:scale-95"
                    >
                      <span>Control Center</span>
                      <ExternalLink size={11} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Two-Column Analytics: Legal Domain Analysis & SLA Aging */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Domain / Category Analytics */}
        <div className="rounded-3xl bg-[#FFFDF8] dark:bg-[#11201B] p-6 border border-[#E6E1D8] dark:border-emerald-800/50 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale size={18} className="text-[#163D32] dark:text-emerald-300" />
              <h3 className="text-sm font-black uppercase tracking-wider text-[#163D32] dark:text-emerald-300">
                Legal Domain Caseload Breakdown
              </h3>
            </div>
            <span className="text-[10px] font-extrabold text-slate-500 dark:text-emerald-400/60">
              7 Classified Categories
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {categoryAnalytics.map(cat => {
              const pct = kpis.totalCases > 0 ? Math.round((cat.count * 100) / kpis.totalCases) : 0;
              return (
                <div key={cat.categoryCode} className="p-3 rounded-2xl bg-white dark:bg-[#182C26] border border-slate-100 dark:border-emerald-800/40 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#18332B] dark:text-white">
                      {cat.label}
                    </span>
                    <span className="font-extrabold text-[#163D32] dark:text-emerald-300">
                      {cat.count} cases ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-emerald-950 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#163D32] dark:bg-emerald-400 h-full rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-emerald-400/60 pt-0.5">
                    <span>Resolved: {cat.resolved}</span>
                    <span>Resolution Rate: {cat.resolutionRate}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SLA Aging Buckets & Urgency */}
        <div className="rounded-3xl bg-[#FFFDF8] dark:bg-[#11201B] p-6 border border-[#E6E1D8] dark:border-emerald-800/50 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-[#163D32] dark:text-emerald-300" />
              <h3 className="text-sm font-black uppercase tracking-wider text-[#163D32] dark:text-emerald-300">
                SLA Aging & Response Telemetry
              </h3>
            </div>
            <span className="text-[10px] font-extrabold text-slate-500 dark:text-emerald-400/60">
              Statewide SLA Threshold: 48h
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#182C26] border border-slate-100 dark:border-emerald-800/40 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-emerald-400/60 block">
                Avg Assignment Turnaround
              </span>
              <span className="text-2xl font-black text-[#18332B] dark:text-white mt-1 block">
                {slaAging.avgAssignmentHours ?? 0} hrs
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                Within 24h Guideline
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#182C26] border border-slate-100 dark:border-emerald-800/40 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-emerald-400/60 block">
                Avg Redressal Duration
              </span>
              <span className="text-2xl font-black text-[#18332B] dark:text-white mt-1 block">
                {slaAging.avgResolutionHours ?? 0} hrs
              </span>
              <span className="text-[10px] text-[#1F5948] dark:text-emerald-400 font-semibold">
                Across All Portals
              </span>
            </div>
          </div>

          {/* Age Buckets */}
          <div className="space-y-2 pt-2">
            <div className="text-[11px] font-extrabold text-[#65736D] dark:text-emerald-300/70 uppercase">
              Active Case Age Distribution
            </div>
            {[
              { label: "< 24 Hours", count: slaAging.under24h ?? 0, color: "bg-emerald-500" },
              { label: "1 - 3 Days", count: slaAging.oneToThreeDays ?? 0, color: "bg-teal-500" },
              { label: "3 - 7 Days", count: slaAging.threeToSevenDays ?? 0, color: "bg-amber-500" },
              { label: "7 - 14 Days", count: slaAging.sevenToFourteenDays ?? 0, color: "bg-orange-500" },
              { label: "14+ Days (Critical Stalled)", count: slaAging.fourteenDaysPlus ?? 0, color: "bg-rose-500" }
            ].map(bucket => (
              <div key={bucket.label} className="p-2.5 rounded-xl bg-white dark:bg-[#182C26] border border-slate-100 dark:border-emerald-800/40 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-200">{bucket.label}</span>
                <span className="font-black text-[#18332B] dark:text-white">{bucket.count} cases</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7. Bottom Three-Column: Guide Telemetry, Language Distribution & Sensitive Cases */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Guide Capacity Utilization */}
        <div className="rounded-3xl bg-[#FFFDF8] dark:bg-[#11201B] p-6 border border-[#E6E1D8] dark:border-emerald-800/50 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-[#163D32] dark:text-emerald-300" />
            <h3 className="text-sm font-black uppercase tracking-wider text-[#163D32] dark:text-emerald-300">
              Legal Guide Capacity
            </h3>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#182C26] border border-slate-100 dark:border-emerald-800/40 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500 dark:text-emerald-300/70">Workload Utilization</span>
              <span className="font-black text-[#163D32] dark:text-emerald-300">{guideTelemetry.utilizationPercentage ?? 0}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-emerald-950 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-[#163D32] dark:bg-emerald-400 h-full rounded-full transition-all"
                style={{ width: `${Math.min(guideTelemetry.utilizationPercentage ?? 0, 100)}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div>
                <span className="text-[10px] text-slate-400 dark:text-emerald-400/60 block">Total Advocates</span>
                <span className="font-bold text-[#18332B] dark:text-white">{guideTelemetry.totalGuides ?? 0}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 dark:text-emerald-400/60 block">Available (Zero Cases)</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{guideTelemetry.availableGuides ?? 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Language Distribution */}
        <div className="rounded-3xl bg-[#FFFDF8] dark:bg-[#11201B] p-6 border border-[#E6E1D8] dark:border-emerald-800/50 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Bot size={18} className="text-[#163D32] dark:text-emerald-300" />
            <h3 className="text-sm font-black uppercase tracking-wider text-[#163D32] dark:text-emerald-300">
              Language Telemetry
            </h3>
          </div>

          <div className="space-y-2 pt-1">
            {[
              { label: "Tamil (தமிழ்)", count: languageDistribution.tamil ?? 0 },
              { label: "English", count: languageDistribution.english ?? 0 },
              { label: "Hindi (हिन्दी)", count: languageDistribution.hindi ?? 0 },
              { label: "Tanglish / Mixed", count: languageDistribution.tanglishMixed ?? 0 }
            ].map(lang => (
              <div key={lang.label} className="p-2.5 rounded-xl bg-white dark:bg-[#182C26] border border-slate-100 dark:border-emerald-800/40 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-200">{lang.label}</span>
                <span className="font-black text-[#18332B] dark:text-white">{lang.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Protected Sensitive Cases Operations */}
        <div className="rounded-3xl bg-[#FFFDF8] dark:bg-[#11201B] p-6 border border-[#E6E1D8] dark:border-emerald-800/50 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Lock size={18} className="text-[#163D32] dark:text-emerald-300" />
            <h3 className="text-sm font-black uppercase tracking-wider text-[#163D32] dark:text-emerald-300">
              Sensitive Case Operations
            </h3>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#182C26] border border-slate-100 dark:border-emerald-800/40 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500 dark:text-emerald-300/70">Total Confidential Registry</span>
              <span className="font-black text-[#18332B] dark:text-white">{sensitiveOps.totalSensitive ?? 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500 dark:text-emerald-300/70">Active Requiring Oversight</span>
              <span className="font-black text-amber-600 dark:text-amber-400">{sensitiveOps.activeSensitive ?? 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500 dark:text-emerald-300/70">Resolved Cases</span>
              <span className="font-black text-emerald-600 dark:text-emerald-400">{sensitiveOps.resolvedSensitive ?? 0}</span>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-emerald-900/40 text-[10px] text-slate-400 dark:text-emerald-400/50">
              Protected operational counters only. Citizen identity and contact data remain strictly encrypted.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
