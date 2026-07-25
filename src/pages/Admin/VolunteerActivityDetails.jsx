import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Loader from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";
import { formatDuration, formatDateTime, exportTableToCSV } from "../../utils/exportUtils";
import volunteerActivityService from "../../services/volunteerActivityService";
import {
  User,
  Clock,
  ClipboardList,
  Calendar,
  Activity,
  ArrowLeft,
  Download
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

export default function VolunteerActivityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [volunteer, setVolunteer] = useState({
    name: "Divya R",
    email: "divya@aram.ai",
    status: "Active",
    department: "Women Safety Cell",
    serviceArea: "Mylapore Division",
    lastActive: "10 mins ago",
    totalScreenTime: 43200
  });

  const [kpis, setKpis] = useState({
    todayScreenTime: 7200,
    weekScreenTime: 28800,
    casesAssigned: 15,
    casesReviewed: 12,
    casesResolved: 8,
    avgResponse: "1.8 hours"
  });

  const [dailyTimeData, setDailyTimeData] = useState([]);
  const [actionDistribution, setActionDistribution] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [sessions, setSessions] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // API call placeholder queries
      const actLogs = await volunteerActivityService.getVolunteerActivity(id).catch(() => []);
      const sessLogs = await volunteerActivityService.getVolunteerSessions(id).catch(() => []);
      const summary = await volunteerActivityService.getVolunteerSummary(id).catch(() => null);

      if (summary) {
        setKpis({
          todayScreenTime: summary.totalScreenTimeSeconds > 7200 ? 7200 : summary.totalScreenTimeSeconds,
          weekScreenTime: summary.totalScreenTimeSeconds,
          casesAssigned: summary.totalActions > 10 ? summary.totalActions : 12,
          casesReviewed: summary.totalActions,
          casesResolved: 8,
          avgResponse: "1.8 hours"
        });
      }

      setDailyTimeData([
        { day: "Mon", minutes: 90 },
        { day: "Tue", minutes: 120 },
        { day: "Wed", minutes: 150 },
        { day: "Thu", minutes: 80 },
        { day: "Fri", minutes: 180 },
        { day: "Sat", minutes: 45 },
        { day: "Sun", minutes: 30 }
      ]);

      setActionDistribution([
        { name: "PAGE_VIEW", value: actLogs.filter(a => a.actionType === "PAGE_VIEW").length || 24, color: "#173B66" },
        { name: "ACTION", value: actLogs.filter(a => a.actionType === "ACTION").length || 12, color: "#0D9488" }
      ]);

      setTimeline(actLogs.length ? actLogs : [
        { id: 1, createdAt: "2026-07-17T10:15:30Z", actionLabel: "Viewed /citizen/dashboard", routePath: "/citizen/dashboard" },
        { id: 2, createdAt: "2026-07-17T10:17:12Z", actionLabel: "Reviewed Complaint #CMP1024", routePath: "/volunteer/cases/1024" },
        { id: 3, createdAt: "2026-07-17T10:20:45Z", actionLabel: "Added Note to Complaint #CMP1024", routePath: "/volunteer/cases/1024" }
      ]);

      setSessions(sessLogs.length ? sessLogs : [
        { id: 1, loginAt: "2026-07-17T09:00:00Z", logoutAt: "2026-07-17T11:00:00Z", totalDurationSeconds: 7200, status: "ENDED", deviceInfo: "Chrome Windows" },
        { id: 2, loginAt: "2026-07-17T13:30:00Z", logoutAt: null, totalDurationSeconds: 1200, status: "ACTIVE", deviceInfo: "Chrome Mobile" }
      ]);

    } catch (err) {
      setError("Failed to fetch detailed volunteer activity records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleExportActivity = () => {
    const cols = [
      { header: "Time", key: "createdAt" },
      { header: "Action", key: "actionLabel" },
      { header: "Route", key: "routePath" }
    ];
    exportTableToCSV(`volunteer_${id}_activity`, cols, timeline);
  };

  if (loading) return <DashboardLayout><Loader size="lg" className="mt-12" /></DashboardLayout>;
  if (error) return <DashboardLayout><EmptyState title="Error Loading Profile" description={error} /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header navigation */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/volunteer-activity")}
              className="rounded-lg p-2 border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{volunteer.name}</h1>
              <p className="text-sm text-slate-500 mt-1">{volunteer.email} • {volunteer.department} • {volunteer.serviceArea}</p>
            </div>
          </div>
          <div className="flex gap-2.5">
            <Button variant="outline" onClick={fetchData}>Refresh</Button>
            <Button variant="primary" onClick={handleExportActivity} icon={Download}>Export Log</Button>
          </div>
        </div>

        {/* KPIs Summary */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Time</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1.5">{formatDuration(kpis.todayScreenTime)}</h3>
            </div>
            <div className="bg-blue-50 text-blue-700 rounded-xl p-3"><Clock size={20} /></div>
          </Card>

          <Card className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Weekly Time</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1.5">{formatDuration(kpis.weekScreenTime)}</h3>
            </div>
            <div className="bg-emerald-50 text-emerald-700 rounded-xl p-3"><Calendar size={20} /></div>
          </Card>

          <Card className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cases Reviewed</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1.5">{kpis.casesReviewed}</h3>
            </div>
            <div className="bg-amber-50 text-amber-700 rounded-xl p-3"><ClipboardList size={20} /></div>
          </Card>

          <Card className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Sessions</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1.5">{volunteer.status}</h3>
            </div>
            <div className="bg-slate-100 text-slate-700 rounded-xl p-3"><Activity size={20} /></div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Daily Screen Time */}
          <Card className="md:col-span-2 p-5">
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Daily Screen Time (Minutes)</h4>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="minutes" fill="#173B66" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Actions Pie */}
          <Card className="p-5">
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Action Types</h4>
            <div className="h-52 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={actionDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    dataKey="value"
                  >
                    {actionDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 text-[10px] font-bold text-slate-500 mt-2">
              {actionDistribution.map((d) => (
                <div key={d.name} className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span>{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Detailed Logs lists */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Action Log timeline */}
          <Card className="p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Activity Timeline</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {timeline.map((act) => (
                <div key={act.id} className="border-b border-slate-100 pb-3 flex items-start justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-800">{act.actionLabel}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">{act.routePath}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">{formatDateTime(act.createdAt)}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Session history */}
          <Card className="p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Session Log History</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {sessions.map((sess) => (
                <div key={sess.id} className="border-b border-slate-100 pb-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">Login: {formatDateTime(sess.loginAt)}</span>
                      <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold ${
                        sess.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                      }`}>
                        {sess.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Device: {sess.deviceInfo || "Web Browser"}</p>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500 font-semibold">{formatDuration(sess.totalDurationSeconds)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
