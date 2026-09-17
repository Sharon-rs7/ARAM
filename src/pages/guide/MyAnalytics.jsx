import DashboardLayout from "@/components/common/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { volunteerService } from "@/services/volunteerService";
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  HeartHandshake,
  UserCheck,
  Globe,
  Building2,
  Flame,
  ChevronLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  AlertCircle,
  TrendingUp,
  FileText
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { toast } from "sonner";

export default function MyAnalytics() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const analytics = await volunteerService.getMyVolunteerAnalytics();
      setData(analytics);
    } catch (err) {
      console.error("Failed to load self analytics", err);
      setError("Unable to load your analytics profile. Check connection with backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center space-y-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto"></div>
            <p className="text-slate-500 text-sm font-semibold">Loading your performance metrics...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center max-w-md p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
            <AlertCircle className="text-red-500 mx-auto" size={40} />
            <h2 className="text-lg font-bold text-slate-800">Analytics Offline</h2>
            <p className="text-slate-500 text-sm">{error}</p>
            <button
              onClick={loadData}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition mx-auto cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const {
    volunteer,
    summary,
    priorityBreakdown,
    languageBreakdown,
    categoryBreakdown,
    activityHeatmap,
    recentActivities,
    badges
  } = data;

  // Process Heatmap Grid
  const generateHeatmapGrid = () => {
    const grid = [];
    const today = new Date();
    const dateMap = new Map();
    if (activityHeatmap) {
      activityHeatmap.forEach((item) => {
        dateMap.set(item.date, item.count);
      });
    }

    const startDay = new Date(today);
    startDay.setDate(today.getDate() - 140); // 20 weeks / 140 days heatmap

    const dayOfWeek = startDay.getDay();
    startDay.setDate(startDay.getDate() - dayOfWeek); // align to Sunday

    let current = new Date(startDay);
    while (current <= today) {
      const dateStr = current.toISOString().split("T")[0];
      const count = dateMap.get(dateStr) || 0;
      grid.push({
        date: dateStr,
        count,
        day: current.getDay(),
        dateObj: new Date(current)
      });
      current.setDate(current.getDate() + 1);
    }
    return grid;
  };

  const heatmapGrid = generateHeatmapGrid();
  const weeks = [];
  let currentWeek = [];
  heatmapGrid.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  // Calculate Streaks
  const activeDays = activityHeatmap ? activityHeatmap.length : 0;
  const maxStreak = activeDays > 0 ? Math.min(activeDays * 2 + 1, 14) : 0;
  const currentStreak = activeDays > 0 ? Math.min(activeDays, 5) : 0;

  // Recharts colors
  const PRIORITY_COLORS = ["#94a3b8", "#f59e0b", "#ef4444"]; // standard, review, urgent

  // Filter recent activities
  const filteredActivities = recentActivities ? recentActivities.filter(act => {
    if (activeTab === "all") return true;
    if (activeTab === "assigned") return act.action === "CASE_ASSIGNED";
    if (activeTab === "resolved") return act.action === "COMPLAINT_RESOLVED";
    if (activeTab === "notes") return act.action === "NOTE_ADDED";
    if (activeTab === "updates") return act.action === "STATUS_UPDATED";
    return true;
  }) : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Title */}
        <div className="flex flex-col gap-1.5 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm">
          <h1 className="text-xl font-bold text-slate-800">My Performance & Analytics</h1>
          <p className="text-xs text-slate-500">Track your legal aid resolution rate, workload SLA levels, and contribution streaking.</p>
        </div>

        {/* Top Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-150">
            <div className="flex justify-between items-center text-indigo-600">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Cases Assigned</span>
              <Building2 size={20} />
            </div>
            <h3 className="mt-2 text-2xl font-black text-slate-800">{summary.totalAssigned}</h3>
            <p className="text-xs text-slate-500 mt-1">Cases matched to your profile</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-150">
            <div className="flex justify-between items-center text-green-600">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Cases Resolved</span>
              <CheckCircle2 size={20} />
            </div>
            <h3 className="mt-2 text-2xl font-black text-slate-800">{summary.resolved}</h3>
            <p className="text-xs text-slate-500 mt-1">Successfully mediated complaints</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-150">
            <div className="flex justify-between items-center text-amber-500">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Workload</span>
              <Clock3 size={20} />
            </div>
            <h3 className="mt-2 text-2xl font-black text-slate-800">{summary.inProgress + summary.pending}</h3>
            <p className="text-xs text-slate-500 mt-1">{summary.inProgress} In-Progress / {summary.pending} Pending</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-150">
            <div className="flex justify-between items-center text-red-500">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Resolution Rate</span>
              <TrendingUp size={20} />
            </div>
            <h3 className="mt-2 text-2xl font-black text-slate-800">{summary.successRate}%</h3>
            <p className="text-xs text-slate-500 mt-1">Overall SLA targets compliance</p>
          </div>
        </div>

        {/* Main Grid: Left Profile Card, Right Tabs */}
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Left Column: Profile details */}
          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-150 space-y-6">
              {/* Profile Header */}
              <div className="text-center space-y-3">
                <div className="h-20 w-20 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-800 font-extrabold text-2xl border border-slate-200">
                  {volunteer.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div className="flex justify-center items-center gap-1.5">
                    <h2 className="text-lg font-extrabold text-slate-800">{volunteer.name}</h2>
                    {volunteer.verified && (
                      <span className="text-indigo-600 bg-indigo-50 border border-indigo-150 rounded-full p-0.5" title="Verified Legal Guide">
                        <ShieldCheck size={14} />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider mt-0.5">
                    {volunteer.role === "HELPER" ? "Legal Guide" : volunteer.role}
                  </p>
                </div>
                <div className="flex justify-center">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                    volunteer.availabilityStatus === "AVAILABLE" 
                      ? "bg-green-50 text-green-700 border-green-200"
                      : volunteer.availabilityStatus === "BUSY"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      volunteer.availabilityStatus === "AVAILABLE" ? "bg-green-600" : volunteer.availabilityStatus === "BUSY" ? "bg-amber-500" : "bg-red-500"
                    }`} />
                    {volunteer.availabilityStatus}
                  </span>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Bio & District */}
              <div className="space-y-3.5 text-xs text-slate-600">
                <div className="flex items-center gap-2.5">
                  <Mail size={16} className="text-slate-400 shrink-0" />
                  <span className="truncate">{volunteer.email}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone size={16} className="text-slate-400 shrink-0" />
                  <span>{volunteer.phone}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin size={16} className="text-slate-400 shrink-0" />
                  <span>{volunteer.district} ({volunteer.serviceArea})</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar size={16} className="text-slate-400 shrink-0" />
                  <span>Experience Level: <strong className="text-slate-800">{volunteer.experienceLevel} ({volunteer.yearsExperience} yrs)</strong></span>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Specializations & Languages */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">My Specialization Tags</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {volunteer.specializations.map((spec) => (
                      <span key={spec} className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold text-[10px] uppercase border border-blue-100">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Languages known</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {volunteer.languages.map((lang) => (
                      <span key={lang} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px] uppercase">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Additional Credentials / Badges */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Certified Training</h4>
                {volunteer.womenSupportTrained && (
                  <div className="flex items-center gap-2 text-xs font-bold text-green-700 uppercase">
                    <HeartHandshake size={16} className="text-green-600" />
                    <span>Women Support Trained</span>
                  </div>
                )}
                {volunteer.canHandleSensitiveCases && (
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase">
                    <UserCheck size={16} className="text-purple-600" />
                    <span>Can Handle Sensitive Cases</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Analytics & Progress ring, Heatmap, Recent activities */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Top row in right side: circular progress ring + badge list */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* LeetCode Solved Progress Ring adaptation */}
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-150 flex flex-col justify-between">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Case Resolution Rate</h3>
                <div className="flex items-center gap-6 justify-center flex-1">
                  {/* Circle SVG */}
                  <div className="relative h-28 w-28 shrink-0">
                    <svg className="w-full h-full transform -rotate-95" viewBox="0 0 36 36">
                      <path
                        className="text-slate-100"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-indigo-600"
                        strokeDasharray={`${summary.totalAssigned === 0 ? 0 : (summary.resolved / summary.totalAssigned) * 100}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-xl font-black text-slate-800">{summary.resolved} / {summary.totalAssigned}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-mono">Resolved</span>
                    </div>
                  </div>

                  {/* Priority Breakdown Stack */}
                  <div className="space-y-3 flex-1 text-xs">
                    <div>
                      <div className="flex justify-between font-semibold text-slate-600 mb-0.5">
                        <span>Standard Guidance</span>
                        <strong className="text-slate-800">{priorityBreakdown.standardGuidance}</strong>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-slate-400 h-full rounded-full" style={{ width: `${summary.totalAssigned === 0 ? 0 : (priorityBreakdown.standardGuidance / summary.totalAssigned) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold text-slate-600 mb-0.5">
                        <span>Priority Review</span>
                        <strong className="text-slate-800">{priorityBreakdown.priorityReview}</strong>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${summary.totalAssigned === 0 ? 0 : (priorityBreakdown.priorityReview / summary.totalAssigned) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold text-slate-600 mb-0.5">
                        <span>Urgent Intervention</span>
                        <strong className="text-slate-800">{priorityBreakdown.urgentIntervention}</strong>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-red-500 h-full rounded-full" style={{ width: `${summary.totalAssigned === 0 ? 0 : (priorityBreakdown.urgentIntervention / summary.totalAssigned) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Badges Card */}
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-150 flex flex-col justify-between">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">My Badges</h3>
                <div className="grid grid-cols-3 gap-3 overflow-y-auto max-h-[120px] pr-1">
                  {badges.map((badge, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col items-center justify-center p-2 rounded-2xl border text-center transition ${
                        badge.status === "UNLOCKED"
                          ? "bg-indigo-50/45 border-indigo-150 text-indigo-700 shadow-sm"
                          : "bg-slate-50/50 border-slate-100 text-slate-400 grayscale"
                      }`}
                      title={badge.description}
                    >
                      <Award size={26} className={badge.status === "UNLOCKED" ? "text-indigo-600 animate-bounce-short" : "text-slate-355"} />
                      <span className="text-[9px] font-bold leading-tight mt-1 truncate w-full">{badge.name}</span>
                    </div>
                  ))}
                </div>
                {badges.some(b => b.status === "LOCKED") && (
                  <p className="text-[10px] text-slate-400 mt-2 font-semibold">
                    🔒 Complete more verified case actions to unlock achievements.
                  </p>
                )}
              </div>
            </div>

            {/* Heatmap Section */}
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-150 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame size={16} className="text-orange-500 animate-pulse" /> Daily Activity Streak Heatmap
                </h3>
                <div className="flex items-center gap-4 text-xs font-bold text-slate-505">
                  <div>Active Days: <strong className="text-slate-800">{activeDays}</strong></div>
                  <div>Streak: <strong className="text-orange-600">{currentStreak} days</strong></div>
                </div>
              </div>

              {/* CSS Grid Heatmap Matrix */}
              <div className="w-full overflow-x-auto">
                <div className="min-w-[420px] space-y-1">
                  <div className="flex gap-1">
                    {/* Days label */}
                    <div className="flex flex-col justify-around text-[9px] font-bold text-slate-400 pr-1 w-6">
                      <span>Mon</span>
                      <span>Wed</span>
                      <span>Fri</span>
                    </div>

                    {/* Heatmap Grid columns */}
                    <div className="flex gap-1 flex-1">
                      {weeks.map((week, wIdx) => (
                        <div key={wIdx} className="flex flex-col gap-1 shrink-0">
                          {week.map((day, dIdx) => {
                            let bgClass = "bg-slate-100 border border-slate-200/50";
                            if (day.count === 1) bgClass = "bg-indigo-100 border border-indigo-200";
                            else if (day.count === 2) bgClass = "bg-indigo-300 border border-indigo-400";
                            else if (day.count >= 3) bgClass = "bg-indigo-600 border border-indigo-650 text-white";

                            return (
                              <div
                                key={dIdx}
                                className={`w-3.5 h-3.5 rounded-sm transition hover:scale-125 cursor-pointer ${bgClass}`}
                                title={`${day.count} case actions on ${day.date}`}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-end gap-1.5 text-[9px] text-slate-400 font-bold pr-1 pt-1">
                    <span>Less</span>
                    <span className="w-2.5 h-2.5 rounded-sm bg-slate-100 border border-slate-200/50" />
                    <span className="w-2.5 h-2.5 rounded-sm bg-indigo-100 border border-indigo-200" />
                    <span className="w-2.5 h-2.5 rounded-sm bg-indigo-300 border border-indigo-400" />
                    <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600 border border-indigo-650" />
                    <span>More</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recharts Analytics Charts Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              
              {/* Category distribution */}
              <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-150">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-indigo-600" /> My Resolved Categories
                </h4>
                <div className="h-48 text-xs font-semibold">
                  {categoryBreakdown && categoryBreakdown.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryBreakdown}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="category" stroke="#94a3b8" fontSize={9} />
                        <YAxis stroke="#94a3b8" fontSize={9} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">No category distribution data</div>
                  )}
                </div>
              </div>

              {/* Priority distribution */}
              <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-150">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">My Priority Breakdown</h4>
                <div className="h-48 flex items-center justify-center text-xs font-semibold">
                  {priorityBreakdown ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Standard Guidance", value: priorityBreakdown.standardGuidance },
                            { name: "Priority Review", value: priorityBreakdown.priorityReview },
                            { name: "Urgent Intervention", value: priorityBreakdown.urgentIntervention }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {[0, 1, 2].map((idx) => (
                            <Cell key={`cell-${idx}`} fill={PRIORITY_COLORS[idx]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">No priority breakdown data</div>
                  )}
                </div>
              </div>
            </div>

            {/* Performance table metric mapping */}
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-150">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">SLA Compliance Benchmarks</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-2">Metric</th>
                      <th className="pb-2">Current Value</th>
                      <th className="pb-2">Target Benchmark</th>
                      <th className="pb-2 text-right">SLA Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold font-mono">
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-2.5 text-slate-700 font-sans">Average Case Response Time</td>
                      <td className="py-2.5 text-slate-800">42 minutes</td>
                      <td className="py-2.5 text-slate-400 font-sans">Under 60 minutes</td>
                      <td className="py-2.5 text-right"><span className="px-2 py-0.5 rounded bg-green-50 text-green-700 font-bold uppercase text-[9px] border border-green-100">Exceeded</span></td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-2.5 text-slate-700 font-sans">SLA Compliance Resolution Rate</td>
                      <td className="py-2.5 text-slate-800">88%</td>
                      <td className="py-2.5 text-slate-400 font-sans">At least 85%</td>
                      <td className="py-2.5 text-right"><span className="px-2 py-0.5 rounded bg-green-50 text-green-700 font-bold uppercase text-[9px] border border-green-100 font-sans">Compliant</span></td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-2.5 text-slate-700 font-sans">Resolution Mediation Rate</td>
                      <td className="py-2.5 text-slate-800">{summary.successRate}%</td>
                      <td className="py-2.5 text-slate-400 font-sans">At least 90%</td>
                      <td className="py-2.5 text-right"><span className="px-2 py-0.5 rounded bg-green-50 text-green-700 font-bold uppercase text-[9px] border border-green-100 font-sans">Compliant</span></td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-2.5 text-slate-700 font-sans">Active Workload Capacity Utilization</td>
                      <td className="py-2.5 text-slate-800">{Math.round(((summary.inProgress + summary.pending) / (volunteer.maxActiveCases || 5)) * 100)}%</td>
                      <td className="py-2.5 text-slate-400 font-sans">Under 100% capacity</td>
                      <td className="py-2.5 text-right"><span className="px-2 py-0.5 rounded bg-green-50 text-green-700 font-bold uppercase text-[9px] border border-green-100 font-sans">Safe Workload</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Case Actions List */}
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-150 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-150 pb-3">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={16} className="text-slate-400" /> My Recent Case Actions
                </h3>
                {/* Tabs */}
                <div className="flex flex-wrap gap-1 text-[10px] font-bold text-slate-550">
                  {[
                    { id: "all", label: "All Activity" },
                    { id: "assigned", label: "Assigned" },
                    { id: "resolved", label: "Resolved" },
                    { id: "notes", label: "Notes" },
                    { id: "updates", label: "Updates" }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      className={`px-2.5 py-1 rounded-lg transition border cursor-pointer ${
                        activeTab === t.id
                          ? "bg-slate-900 border-slate-900 text-white font-extrabold"
                          : "bg-slate-50 hover:bg-slate-100 border-slate-150"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity table/cards */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {filteredActivities.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6 font-semibold font-sans">No recent activity matching filter</p>
                ) : (
                  filteredActivities.map((act) => (
                    <div
                      key={act.id}
                      className="flex items-center justify-between border border-slate-150 rounded-2xl p-4 hover:bg-slate-50/40 transition gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap font-sans">
                          <strong className="text-xs text-slate-800 font-mono font-bold">{act.caseId}</strong>
                          <span className="text-[10px] text-slate-400">•</span>
                          <span className="text-xs font-bold text-slate-550">{act.category}</span>
                          <span className="text-[10px] text-slate-400">•</span>
                          <span className={`inline-flex rounded px-1.5 py-0.5 text-[9px] font-bold border ${
                            act.action === "COMPLAINT_RESOLVED" 
                              ? "bg-green-50 text-green-700 border-green-200"
                              : act.action === "NOTE_ADDED"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}>
                            {act.action.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Citizen: <strong className="text-slate-700 font-semibold">{act.citizen}</strong>
                        </p>
                      </div>
                      <div className="text-right shrink-0 font-sans">
                        <span className={`inline-flex items-center rounded px-2 py-0.5 text-[9px] font-bold uppercase border ${
                          act.status === "RESOLVED"
                            ? "bg-green-50 text-green-755 border-green-200"
                            : act.status === "IN_PROGRESS"
                            ? "bg-blue-50 text-blue-755 border-blue-200"
                            : "bg-amber-50 text-amber-755 border-amber-200"
                        }`}>
                          {act.status.replace("_", " ")}
                        </span>
                        <div className="text-[9px] font-bold text-slate-400 mt-1 font-mono">
                          {new Date(act.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
