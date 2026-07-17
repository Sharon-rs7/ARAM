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

const Dashboard = () => {

  const navigate = useNavigate();

  const recentComplaints = [
    {
      id: "CMP1023",
      citizen: "Sharon Robert",
      category: "Road Damage",
      status: "Pending",
      priority: "High",
    },
    {
      id: "CMP1024",
      citizen: "Rahul Kumar",
      category: "Garbage Issue",
      status: "In Progress",
      priority: "Medium",
    },
    {
      id: "CMP1025",
      citizen: "Priya",
      category: "Water Leakage",
      status: "Resolved",
      priority: "Low",
    },
  ];

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

              Monitor and manage the complete ARAM platform.

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

            <Users
              size={34}
              className="text-blue-600"
            />

            <h2 className="mt-5 text-4xl font-bold">

              2,356

            </h2>

            <p className="mt-2 text-slate-500">

              Registered Citizens

            </p>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <FileText
              size={34}
              className="text-violet-600"
            />

            <h2 className="mt-5 text-4xl font-bold">

              1,286

            </h2>

            <p className="mt-2 text-slate-500">

              Total Complaints

            </p>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <Clock3
              size={34}
              className="text-orange-500"
            />

            <h2 className="mt-5 text-4xl font-bold">

              182

            </h2>

            <p className="mt-2 text-slate-500">

              Pending Cases

            </p>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <CheckCircle2
              size={34}
              className="text-green-600"
            />

            <h2 className="mt-5 text-4xl font-bold">

              1,104

            </h2>

            <p className="mt-2 text-slate-500">

              Resolved Cases

            </p>

          </div>

        </div>        {/* Quick Stats */}

        <div className="grid gap-6 lg:grid-cols-3">

          <div className="rounded-3xl bg-white border border-slate-200 p-8 text-slate-900">

            <ShieldCheck size={42} className="text-slate-700" />

            <h2 className="mt-6 text-3xl font-bold">

              128

            </h2>

            <p className="mt-2 text-slate-500">

              Active Volunteers

            </p>

          </div>

          <div className="rounded-3xl bg-white border border-slate-200 p-8 text-slate-900">

            <Building2 size={42} className="text-slate-700" />

            <h2 className="mt-6 text-3xl font-bold">

              18

            </h2>

            <p className="mt-2 text-slate-500">

              Departments

            </p>

          </div>

          <div className="rounded-3xl bg-white border border-slate-200 p-8 text-slate-900">

            <TrendingUp size={42} className="text-slate-700" />

            <h2 className="mt-6 text-3xl font-bold">

              92%

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

        <div className="rounded-3xl border-l-8 border-red-500 bg-red-50 p-8">

          <div className="flex items-start gap-4">

            <AlertTriangle
              size={40}
              className="text-red-600"
            />

            <div>

              <h2 className="text-2xl font-bold text-red-700">

                High Priority Alert

              </h2>

              <p className="mt-3 leading-8 text-red-600">

                There are currently

                <span className="font-bold">

                  {" "}28 High Priority Complaints

                </span>

                waiting for department assignment.
                Immediate action is recommended.

              </p>

            </div>

          </div>

        </div>

        {/* AI Overview */}

        <div className="grid gap-6 lg:grid-cols-3">

          <div className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

            <h3 className="text-lg font-bold">

              AI Accuracy

            </h3>

            <h2 className="mt-4 text-4xl font-bold text-blue-600">

              97%

            </h2>

            <p className="mt-2 text-slate-500">

              Complaint Classification

            </p>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

            <h3 className="text-lg font-bold">

              Auto Assigned

            </h3>

            <h2 className="mt-4 text-4xl font-bold text-green-600">

              864

            </h2>

            <p className="mt-2 text-slate-500">

              AI Department Assignment

            </p>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

            <h3 className="text-lg font-bold">

              Active Today

            </h3>

            <h2 className="mt-4 text-4xl font-bold text-violet-600">

              324

            </h2>

            <p className="mt-2 text-slate-500">

              Complaints Received

            </p>

          </div>

        </div>

        {/* Volunteer Workload Overview */}
        <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
          <h3 className="text-2xl font-bold mb-4 text-slate-900">Volunteer Workload Capacity</h3>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-500 text-xs font-semibold block uppercase">Coimbatore District</span>
              <span className="text-xl font-bold text-slate-850 mt-2 block">85% Utilization</span>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                <div className="bg-red-500 h-full rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-500 text-xs font-semibold block uppercase">Chennai District</span>
              <span className="text-xl font-bold text-slate-850 mt-2 block">45% Utilization</span>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                <div className="bg-green-500 h-full rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-500 text-xs font-semibold block uppercase">Madurai District</span>
              <span className="text-xl font-bold text-slate-850 mt-2 block">60% Utilization</span>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                <div className="bg-yellow-500 h-full rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </DashboardLayout>

  );

};

export default Dashboard;