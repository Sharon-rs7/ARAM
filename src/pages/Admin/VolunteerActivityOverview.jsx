import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Loader from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";
import { formatDuration, exportTableToCSV } from "../../utils/exportUtils";
import volunteerActivityService from "../../services/volunteerActivityService";
import {
  Users,
  Activity,
  Clock,
  ClipboardList,
  Search,
  Download,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function VolunteerActivityOverview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Stats
  const [stats, setStats] = useState({
    totalVolunteers: 12,
    activeToday: 4,
    onlineNow: 2,
    totalScreenTime: 28400,
    totalReviewed: 145,
    avgResponseTime: "2.4 hours"
  });

  // Mock charts / data fallback for demo
  const [chartData, setChartData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [distributionData, setDistributionData] = useState([]);
  const [volunteers, setVolunteers] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch from backend overview API
      const overview = await volunteerActivityService.getOverallOverview().catch(() => null);
      
      // Fallback data if backend is mock or incomplete
      setStats({
        totalVolunteers: 8,
        activeToday: overview?.activeNow ? overview.activeNow + 2 : 4,
        onlineNow: overview?.activeNow || 1,
        totalScreenTime: overview?.totalScreenTimeSeconds || 14800,
        totalReviewed: overview?.totalSessions || 38,
        avgResponseTime: "1.8 hours"
      });

      // Chart distributions
      setChartData([
        { name: "Mon", screenTime: 120 },
        { name: "Tue", screenTime: 180 },
        { name: "Wed", screenTime: 240 },
        { name: "Thu", screenTime: 150 },
        { name: "Fri", screenTime: 310 },
        { name: "Sat", screenTime: 90 },
        { name: "Sun", screenTime: 60 }
      ]);

      setTrendData([
        { date: "07/11", actions: 45 },
        { date: "07/12", actions: 60 },
        { date: "07/13", actions: 85 },
        { date: "07/14", actions: 70 },
        { date: "07/15", actions: 110 },
        { date: "07/16", actions: 95 },
        { date: "07/17", actions: 130 }
      ]);

      setDistributionData([
        { name: "Page View", value: 45, color: "#173B66" },
        { name: "Case Review", value: 30, color: "#0D9488" },
        { name: "Status Update", value: 15, color: "#F59E0B" },
        { name: "Heartbeat", value: 10, color: "#94A3B8" }
      ]);

      setVolunteers([
        { id: 1, name: "Arul Kumar", email: "arul@aram.ai", status: "Active", department: "Cyber Cell", activeToday: "Yes", screenTimeToday: 3600, reviewedCases: 14, responseTime: "1.2 hrs" },
        { id: 2, name: "Divya R", email: "divya@aram.ai", status: "Active", department: "Women Safety", activeToday: "Yes", screenTimeToday: 7200, reviewedCases: 25, responseTime: "1.8 hrs" },
        { id: 3, name: "Baskar S", email: "baskar@aram.ai", status: "Active", department: "Labour Office", activeToday: "No", screenTimeToday: 0, reviewedCases: 8, responseTime: "2.5 hrs" },
        { id: 4, name: "Esther Mary", email: "esther@aram.ai", status: "Suspended", department: "General Aid", activeToday: "No", screenTimeToday: 0, reviewedCases: 2, responseTime: "N/A" }
      ]);

    } catch (err) {
      setError("Failed to query activity metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExport = () => {
    const columns = [
      { header: "Name", key: "name" },
      { header: "Email", key: "email" },
      { header: "Status", key: "status" },
      { header: "Department", key: "department" },
      { header: "Reviewed Cases", key: "reviewedCases" },
      { header: "Response Time", key: "responseTime" }
    ];
    exportTableToCSV("volunteer_activity_overview", columns, volunteers);
  };

  const filteredVolunteers = volunteers.filter(
    (v) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <DashboardLayout><Loader size="lg" className="mt-12" /></DashboardLayout>;
  if (error) return <DashboardLayout><EmptyState title="Error Loading Data" description={error} /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Legal Guide Activity Analytics</h1>
            <p className="text-sm text-slate-500 mt-1">Monitor operational workload, screen-time sessions, and case review activities.</p>
          </div>
          <div className="flex gap-2.5">
            <Button variant="outline" onClick={fetchData}>Refresh</Button>
            <Button variant="primary" onClick={handleExport} icon={Download}>Export CSV</Button>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Legal Guides</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1.5">{stats.totalVolunteers}</h3>
            </div>
            <div className="bg-blue-50 text-blue-700 rounded-xl p-3"><Users size={20} /></div>
          </Card>

          <Card className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Online Now</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1.5">{stats.onlineNow}</h3>
            </div>
            <div className="bg-emerald-50 text-emerald-700 rounded-xl p-3"><Activity size={20} className="animate-pulse" /></div>
          </Card>

          <Card className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Screen Time Today</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1.5">{formatDuration(stats.totalScreenTime)}</h3>
            </div>
            <div className="bg-amber-50 text-amber-700 rounded-xl p-3"><Clock size={20} /></div>
          </Card>

          <Card className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cases Resolved</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1.5">{stats.totalReviewed}</h3>
            </div>
            <div className="bg-slate-100 text-slate-700 rounded-xl p-3"><ClipboardList size={20} /></div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Activity Trend */}
          <Card className="md:col-span-2 p-5">
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <TrendingUp size={16} /> Total Action Trends
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip />
                  <Line type="monotone" dataKey="actions" stroke="#173B66" strokeWidth={2.5} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Action Distribution */}
          <Card className="p-5">
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Action Types</h4>
            <div className="h-56 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 text-[10px] font-bold text-slate-500 mt-2">
              {distributionData.map((d) => (
                <div key={d.name} className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span>{d.name} ({d.value}%)</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Table Panel */}
        <Card className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <h3 className="text-base font-bold text-slate-900">Legal Guide Workload Performance</h3>
            <div className="relative w-full sm:max-w-xs">
              <Search size={14} className="absolute left-3 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search legal guide..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-4 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Legal Guide</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3">Today's Time</th>
                  <th className="pb-3">Reviewed Cases</th>
                  <th className="pb-3">Avg Response</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVolunteers.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/40">
                    <td 
                      className="py-4 cursor-pointer hover:text-indigo-600 transition"
                      onClick={() => navigate(`/admin/volunteers/${v.id}/analytics`)}
                    >
                      <p className="font-semibold text-slate-800 hover:underline">{v.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{v.email}</p>
                    </td>
                    <td className="py-4 font-medium text-slate-600">{v.department}</td>
                    <td className="py-4 font-mono">{formatDuration(v.screenTimeToday)}</td>
                    <td className="py-4 font-semibold text-slate-700">{v.reviewedCases}</td>
                    <td className="py-4 font-mono text-slate-500">{v.responseTime}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        v.status === "Active" 
                          ? "bg-green-50 text-green-700 border border-green-200" 
                          : "bg-red-50 text-red-750 border border-red-200"
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <Button
                        variant="ghost"
                        onClick={() => navigate(`/admin/volunteers/${v.id}/activity`)}
                        className="!min-h-[32px] px-2.5"
                        icon={ArrowRight}
                        iconPosition="right"
                      >
                        View Activity
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
