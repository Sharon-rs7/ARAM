import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Users,
  FileText,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  Building2,
  TrendingUp,
  AlertTriangle,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    underReviewComplaints: 0,
    resolvedComplaints: 0,
    totalUsers: 0,
    totalVolunteers: 0,
    pendingVolunteers: 0,
    highPriorityComplaints: 0
  });
  const [workload, setWorkload] = useState({ districts: [] });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const dStats = await adminService.getDashboard();
        setStats(dStats);
        
        const wStats = await adminService.getVolunteerWorkload();
        setWorkload(wStats);

        const complaintsList = await adminService.getComplaints();
        const sorted = complaintsList
          .sort((a, b) => b.id - a.id)
          .slice(0, 3);
        
        setRecentComplaints(sorted.map(c => ({
          id: `CMP${c.id}`,
          citizen: c.citizenName || c.userName || "Citizen",
          category: c.categoryDisplayName || c.category || "General",
          status: c.status === "RESOLVED" ? "Resolved" : c.status === "IN_PROGRESS" || c.status === "UNDER_REVIEW" ? "In Progress" : "Pending",
          priority: c.priority === "CRITICAL" || c.priority === "HIGH" ? "High" : c.priority === "MEDIUM" ? "Medium" : "Low",
        })));
      } catch (err) {
        console.error("Dashboard load failed", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (

    <DashboardLayout>

      <div className="space-y-8">

        {/* Header */}

        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-4xl font-bold">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-slate-500">
              Manage complaints, legal guides, assignments, reports, and system operations.
            </p>

          </div>

          <button
            onClick={() => navigate("/admin/analytics")}
            className="rounded-xl bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700"
          >

            View Analytics

          </button>

        </div>

        {/* Statistics */}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <Users size={34} className="text-blue-600" />
            <h2 className="mt-5 text-4xl font-bold">
              {stats.totalUsers.toLocaleString()}
            </h2>
            <p className="mt-2 text-slate-500">
              Registered Public Users
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <FileText size={34} className="text-violet-600" />
            <h2 className="mt-5 text-4xl font-bold">
              {stats.totalComplaints.toLocaleString()}
            </h2>
            <p className="mt-2 text-slate-500">
              Total Complaints
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <Clock3 size={34} className="text-orange-500" />
            <h2 className="mt-5 text-4xl font-bold">
              {stats.pendingComplaints.toLocaleString()}
            </h2>
            <p className="mt-2 text-slate-500">
              Pending Cases
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <CheckCircle2 size={34} className="text-green-600" />
            <h2 className="mt-5 text-4xl font-bold">
              {stats.resolvedComplaints.toLocaleString()}
            </h2>
            <p className="mt-2 text-slate-500">
              Resolved Cases
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl bg-white border border-slate-200 p-8 text-slate-900">
            <ShieldCheck size={42} className="text-slate-700" />
            <h2 className="mt-6 text-3xl font-bold">
              {stats.totalVolunteers.toLocaleString()}
            </h2>
            <p className="mt-2 text-slate-500">
              Active Legal Guides
            </p>
          </div>

          <div className="rounded-3xl bg-white border border-slate-200 p-8 text-slate-900">
            <Building2 size={42} className="text-slate-700" />
            <h2 className="mt-6 text-3xl font-bold">
              7
            </h2>
            <p className="mt-2 text-slate-500">
              Legal aid Categories
            </p>
          </div>

          <div className="rounded-3xl bg-white border border-slate-200 p-8 text-slate-900">
            <TrendingUp size={42} className="text-slate-700" />
            <h2 className="mt-6 text-3xl font-bold">
              {stats.totalComplaints === 0 ? "0%" : Math.round((stats.resolvedComplaints / stats.totalComplaints) * 100) + "%"}
            </h2>
            <p className="mt-2 text-slate-500">
              Resolution Rate
            </p>
          </div>
        </div>

        {/* Recent Complaints */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <div className="mb-6 flex items-center justify-between">

            <h2 className="text-2xl font-bold">

              Recent Complaints

            </h2>

            <button
              onClick={() => navigate("/admin/complaints")}
              className="rounded-xl bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700"
            >

              View All

            </button>

          </div>

          <div className="space-y-5">

            {recentComplaints.map((item) => (

              <div
                key={item.id}
                className="flex items-center justify-between rounded-2xl border border-slate-200 p-5"
              >

                <div>

                  <h3 className="font-semibold">

                    {item.id}

                  </h3>

                  <p className="mt-2 text-slate-500">

                    {item.citizen}

                  </p>

                  <p className="text-sm text-slate-400">

                    {item.category}

                  </p>

                </div>

                <div className="text-right">

                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      item.priority === "High"
                        ? "bg-red-100 text-red-600"
                        : item.priority === "Medium"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >

                    {item.priority}

                  </span>

                  <p
                    className={`mt-3 font-semibold ${
                      item.status === "Resolved"
                        ? "text-green-600"
                        : item.status === "In Progress"
                        ? "text-blue-600"
                        : "text-orange-600"
                    }`}
                  >

                    {item.status}

                  </p>

                </div>

                <button
                  onClick={() => navigate("/admin/complaint-details")}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white transition hover:bg-blue-700"
                >

                  <Eye size={18} />

                  View

                </button>

              </div>

            ))}

          </div>

        </div>        {/* High Priority Alert */}

        {stats.highPriorityComplaints > 0 && (
          <div className="rounded-3xl border-l-8 border-red-500 bg-red-50 p-8">
            <div className="flex items-start gap-4">
              <AlertTriangle size={40} className="text-red-600" />
              <div>
                <h2 className="text-2xl font-bold text-red-700">
                  High Priority Alert
                </h2>
                <p className="mt-3 leading-8 text-red-600">
                  There are currently{" "}
                  <span className="font-bold">
                    {stats.highPriorityComplaints} High Priority Complaints
                  </span>{" "}
                  waiting for department assignment. Immediate action is recommended.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* AI Overview */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <h3 className="text-lg font-bold">AI Accuracy</h3>
            <h2 className="mt-4 text-4xl font-bold text-blue-600">97%</h2>
            <p className="mt-2 text-slate-500">Complaint Classification</p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <h3 className="text-lg font-bold">Auto Assigned</h3>
            <h2 className="mt-4 text-4xl font-bold text-green-600">
              {Math.max(0, stats.totalComplaints - stats.pendingComplaints).toLocaleString()}
            </h2>
            <p className="mt-2 text-slate-500">AI Department Assignment</p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <h3 className="text-lg font-bold">Active Today</h3>
            <h2 className="mt-4 text-4xl font-bold text-violet-600">
              {stats.pendingComplaints.toLocaleString()}
            </h2>
            <p className="mt-2 text-slate-500">Complaints Under Triage</p>
          </div>
        </div>

        {/* Volunteer Workload Overview */}
        <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
          <h3 className="text-2xl font-bold mb-4 text-slate-900">Legal Guide Workload Capacity</h3>
          <div className="grid gap-6 md:grid-cols-3">
            {workload.districts && workload.districts.length > 0 ? (
              workload.districts.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-slate-500 text-xs font-semibold block uppercase">
                    {item.district} District
                  </span>
                  <span className="text-xl font-bold text-slate-800 mt-2 block">
                    {item.utilization}% Utilization
                  </span>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                    <div 
                      className={`h-full rounded-full ${
                        item.utilization > 80 ? "bg-red-500" : item.utilization > 50 ? "bg-yellow-500" : "bg-green-500"
                      }`} 
                      style={{ width: `${item.utilization}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm text-center col-span-3 py-4">
                No active volunteer workload data available.
              </p>
            )}
          </div>
        </div>
      </div>

    </DashboardLayout>

  );

};

export default Dashboard;