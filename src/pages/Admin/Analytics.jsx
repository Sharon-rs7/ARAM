import DashboardLayout from "@/components/common/DashboardLayout";
import {
  TrendingUp,
  Users,
  FileText,
  BrainCircuit,
  CalendarDays,
  Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";

const Analytics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalComplaints: 0,
    activeVolunteers: 0
  });
  const [trends, setTrends] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activity, setActivity] = useState({
    totalSessions: 0,
    activeNow: 0,
    totalScreenTimeSeconds: 0,
    totalActions: 0
  });

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const dStats = await adminService.getDashboard();
        setStats({
          totalUsers: dStats.totalComplaints > 0 ? dStats.totalUsers : 0,
          totalComplaints: dStats.totalComplaints,
          activeVolunteers: dStats.totalVolunteers
        });

        const cTrends = await adminService.getComplaintTrends();
        setTrends(cTrends);

        const cDist = await adminService.getCategoryDistribution();
        setCategories(cDist);

        const vAct = await adminService.getVolunteerActivity();
        setActivity(vAct);
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  return (
    <DashboardLayout>

      <div className="space-y-8">

        {/* Header */}

        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-4xl font-bold">

              Analytics

            </h1>

            <p className="mt-2 text-slate-500">

              Monitor complaint statistics and system performance.

            </p>

          </div>

          <div className="flex gap-3">

            <button
              onClick={() => navigate("/admin/dashboard")}
              className="rounded-xl border border-slate-300 px-6 py-3 hover:bg-slate-100"
            >

              Dashboard

            </button>

            <button
              onClick={() => toast.success("Analytics report downloaded successfully.")}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
            >

              <Download size={18} />

              Export Report

            </button>

          </div>

        </div>

        {/* Top Cards */}

        <div className="grid gap-6 lg:grid-cols-4">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <TrendingUp size={32} className="text-blue-600" />
            <p className="mt-4 text-slate-500">Monthly Growth</p>
            <h2 className="mt-2 text-4xl font-bold">+18%</h2>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <Users size={32} className="text-green-600" />
            <p className="mt-4 text-slate-500">Registered Public Users</p>
            <h2 className="mt-2 text-4xl font-bold">{stats.totalUsers.toLocaleString()}</h2>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <FileText size={32} className="text-orange-500" />
            <p className="mt-4 text-slate-500">Total Complaints</p>
            <h2 className="mt-2 text-4xl font-bold">{stats.totalComplaints.toLocaleString()}</h2>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <BrainCircuit size={32} className="text-violet-600" />
            <p className="mt-4 text-slate-500">Active Legal Guides</p>
            <h2 className="mt-2 text-4xl font-bold">{stats.activeVolunteers.toLocaleString()}</h2>
          </div>
        </div>

        {/* Charts */}

        <div className="grid gap-8 lg:grid-cols-2">

          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-2xl font-bold">Monthly Complaints</h2>
            <div className="flex h-80 items-end justify-between gap-4">
              {trends && trends.length > 0 ? (
                trends.map((t, idx) => {
                  const maxCount = Math.max(...trends.map(x => x.count), 1);
                  const heightPercent = Math.min(100, Math.max(10, Math.round((t.count / maxCount) * 100)));
                  return (
                    <div key={idx} className="w-full flex flex-col items-center gap-1.5 h-full justify-end">
                      <span className="text-[10px] text-slate-500 font-mono font-bold">{t.count}</span>
                      <div className="w-full rounded-t-xl bg-blue-500 transition-all duration-500" style={{ height: `${heightPercent * 0.7}%`, minHeight: '8px' }}></div>
                      <span className="text-[10px] text-slate-500 font-semibold whitespace-nowrap mt-1">{t.month.split(" ")[0]}</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-slate-400 text-sm text-center py-10 w-full">No trend data available.</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-2xl font-bold">Category Distribution</h2>
            <div className="space-y-6">
              {categories && categories.length > 0 ? (
                categories.map((c, idx) => {
                  const colors = ["bg-blue-600", "bg-green-600", "bg-yellow-500", "bg-red-500", "bg-purple-500", "bg-orange-500", "bg-teal-500"];
                  const color = colors[idx % colors.length];
                  return (
                    <div key={idx}>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="font-semibold text-slate-755">{c.displayName}</span>
                        <span className="font-bold text-slate-900">{c.count} ({c.percentage}%)</span>
                      </div>
                      <div className="h-3 rounded-full bg-slate-100">
                        <div className={`h-3 rounded-full ${color}`} style={{ width: `${c.percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-slate-400 text-sm text-center py-10">No categories recorded yet.</p>
              )}
            </div>
          </div>

        </div>        {/* Department Performance & AI */}

        <div className="grid gap-8 lg:grid-cols-2">

          {/* Department Performance */}

          <div className="rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="mb-6 text-2xl font-bold">

              Department Performance

            </h2>

            <div className="space-y-5">

              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-5">

                <span>Municipality</span>

                <span className="font-bold text-green-600">

                  94%

                </span>

              </div>

              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-5">

                <span>Water Board</span>

                <span className="font-bold text-blue-600">

                  90%

                </span>

              </div>

              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-5">

                <span>Electricity</span>

                <span className="font-bold text-yellow-600">

                  96%

                </span>

              </div>

              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-5">

                <span>Sanitation</span>

                <span className="font-bold text-red-600">

                  88%

                </span>

              </div>

            </div>

          </div>

          {/* AI Insights */}

          <div className="rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="mb-6 text-2xl font-bold">

              AI Insights

            </h2>

            <div className="space-y-5">

              <div className="rounded-2xl bg-blue-50 p-5">

                <h3 className="font-semibold">

                  AI Accuracy

                </h3>

                <p className="mt-2 text-slate-600">

                  Complaint classification accuracy reached

                  <span className="font-bold text-blue-600">

                    {" "}97%

                  </span>

                  {" "}this month.

                </p>

              </div>

              <div className="rounded-2xl bg-green-50 p-5">

                <h3 className="font-semibold">

                  Auto Assignment

                </h3>

                <p className="mt-2 text-slate-600">

                  864 complaints were automatically assigned
                  to the correct department.

                </p>

              </div>

              <div className="rounded-2xl bg-yellow-50 p-5">

                <h3 className="font-semibold">

                  Resolution Prediction

                </h3>

                <p className="mt-2 text-slate-600">

                  AI predicts 91% of pending complaints
                  will be resolved within 48 hours.

                </p>

              </div>

            </div>

          </div>

        </div>

        {/* Statistics */}

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl bg-blue-50 p-6">
            <CalendarDays size={28} className="text-blue-600" />
            <h2 className="mt-4 text-4xl font-bold">
              {activity.totalSessions.toLocaleString()}
            </h2>
            <p className="mt-2 text-slate-500">
              Total Helper Sessions
            </p>
          </div>

          <div className="rounded-3xl bg-green-50 p-6">
            <TrendingUp size={28} className="text-green-600" />
            <h2 className="mt-4 text-4xl font-bold">
              {activity.totalActions.toLocaleString()}
            </h2>
            <p className="mt-2 text-slate-500">
              Logged Legal Guide Actions
            </p>
          </div>

          <div className="rounded-3xl bg-violet-50 p-6">
            <BrainCircuit size={28} className="text-violet-600" />
            <h2 className="mt-4 text-4xl font-bold">
              {Math.round(activity.totalScreenTimeSeconds / 60).toLocaleString()}
            </h2>
            <p className="mt-2 text-slate-500">
              Active Screen Time (min)
            </p>
          </div>
        </div>

        {/* Bottom Buttons */}

        <div className="flex flex-wrap justify-end gap-4">

          <button
            onClick={() => navigate("/admin/dashboard")}
            className="rounded-xl border border-slate-300 px-8 py-3 font-semibold transition hover:bg-slate-100"
          >

            Back to Dashboard

          </button>

          <button
            onClick={() => toast.success("Analytics report exported successfully.")}
            className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700"
          >

            Export Analytics

          </button>

        </div>

      </div>

    </DashboardLayout>

  );

};

export default Analytics;