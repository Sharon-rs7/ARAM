import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  ClipboardList,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const assignedComplaints = [
  {
    id: "CMP1023",
    citizen: "Sharon Robert",
    category: "Road Damage",
    priority: "High",
    status: "Pending",
  },
  {
    id: "CMP1024",
    citizen: "Rahul Kumar",
    category: "Garbage Issue",
    priority: "Medium",
    status: "In Progress",
  },
  {
    id: "CMP1025",
    citizen: "Priya",
    category: "Water Leakage",
    priority: "Low",
    status: "Pending",
  },
];

const Dashboard = () => {

  const navigate = useNavigate();

  return (

    <DashboardLayout>

      <div className="space-y-8">

        {/* Header */}

        <div>

          <h1 className="text-4xl font-bold">

            Volunteer Dashboard

          </h1>

          <p className="mt-2 text-slate-500">

            Manage assigned complaints and help citizens.

          </p>

        </div>

        {/* Stats */}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <ClipboardList
              className="text-blue-600"
              size={30}
            />

            <h2 className="mt-4 text-4xl font-bold">

              18

            </h2>

            <p className="mt-2 text-slate-500">

              Assigned

            </p>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <Clock3
              className="text-yellow-600"
              size={30}
            />

            <h2 className="mt-4 text-4xl font-bold">

              07

            </h2>

            <p className="mt-2 text-slate-500">

              Pending

            </p>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <CheckCircle2
              className="text-green-600"
              size={30}
            />

            <h2 className="mt-4 text-4xl font-bold">

              11

            </h2>

            <p className="mt-2 text-slate-500">

              Resolved

            </p>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <AlertTriangle
              className="text-red-600"
              size={30}
            />

            <h2 className="mt-4 text-4xl font-bold">

              03

            </h2>

            <p className="mt-2 text-slate-500">

              High Priority

            </p>

          </div>

        </div>

        {/* Assigned Complaints */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <h2 className="mb-6 text-2xl font-bold">

            Assigned Complaints

          </h2>

          <div className="space-y-5">

            {assignedComplaints.map((item) => (

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

                </div>                <button
                  onClick={() => navigate("/volunteer/complaint/1")}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white transition hover:bg-blue-700"
                >

                  <Eye size={18} />

                  View

                </button>

              </div>

            ))}

          </div>

        </div>

        {/* Quick Summary */}

        <div className="grid gap-6 lg:grid-cols-3">

          <div className="rounded-3xl bg-white border border-slate-200 p-8 text-slate-900">

            <h2 className="text-2xl font-bold">

              Today's Progress

            </h2>

            <p className="mt-4 leading-8 text-slate-500">

              You have completed

              <span className="font-bold text-slate-800">

                {" "}11 complaints

              </span>

              and

              <span className="font-bold text-slate-800">

                {" "}7 complaints

              </span>

              are waiting for review.

            </p>

          </div>

          {/* Quick Actions */}
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Quick Actions</h2>
            <div className="space-y-3">
              <button 
                onClick={() => navigate("/volunteer/assigned-cases")}
                className="w-full flex items-center justify-between px-5 py-3.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition cursor-pointer"
              >
                Assigned Cases
              </button>
              <button 
                onClick={() => navigate("/volunteer/settings")}
                className="w-full flex items-center justify-between px-5 py-3.5 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition cursor-pointer"
              >
                Volunteer Settings
              </button>
            </div>
          </div>

          {/* Workload Card */}
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Workload Capacity</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-slate-500 font-semibold mb-1">
                  <span>Current Utilization</span>
                  <span>75% Capacity</span>
                </div>
                <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Auto-assignment will pause once utilization reaches 100% capacity. You can update availability in your settings.
              </p>
            </div>
        </div>

      </div>

    </div>

  </DashboardLayout>

  );

};

export default Dashboard;