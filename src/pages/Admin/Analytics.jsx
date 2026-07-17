import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  TrendingUp,
  Users,
  FileText,
  BrainCircuit,
  CalendarDays,
  Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Analytics = () => {

  const navigate = useNavigate();

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

            <TrendingUp
              size={32}
              className="text-blue-600"
            />

            <p className="mt-4 text-slate-500">

              Monthly Growth

            </p>

            <h2 className="mt-2 text-4xl font-bold">

              +18%

            </h2>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <Users
              size={32}
              className="text-green-600"
            />

            <p className="mt-4 text-slate-500">

              Active Users

            </p>

            <h2 className="mt-2 text-4xl font-bold">

              2,356

            </h2>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <FileText
              size={32}
              className="text-orange-500"
            />

            <p className="mt-4 text-slate-500">

              Complaints

            </p>

            <h2 className="mt-2 text-4xl font-bold">

              1,286

            </h2>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <BrainCircuit
              size={32}
              className="text-violet-600"
            />

            <p className="mt-4 text-slate-500">

              AI Accuracy

            </p>

            <h2 className="mt-2 text-4xl font-bold">

              97%

            </h2>

          </div>

        </div>

        {/* Charts */}

        <div className="grid gap-8 lg:grid-cols-2">

          <div className="rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="mb-6 text-2xl font-bold">

              Monthly Complaints

            </h2>

            <div className="flex h-80 items-end justify-between gap-4">

              <div className="w-full rounded-t-xl bg-blue-500" style={{ height: "35%" }}></div>
              <div className="w-full rounded-t-xl bg-blue-500" style={{ height: "48%" }}></div>
              <div className="w-full rounded-t-xl bg-blue-500" style={{ height: "70%" }}></div>
              <div className="w-full rounded-t-xl bg-blue-500" style={{ height: "60%" }}></div>
              <div className="w-full rounded-t-xl bg-blue-500" style={{ height: "82%" }}></div>
              <div className="w-full rounded-t-xl bg-blue-500" style={{ height: "95%" }}></div>

            </div>

          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="mb-6 text-2xl font-bold">

              Category Distribution

            </h2>

            <div className="space-y-6">

              <div>

                <div className="mb-2 flex justify-between">

                  <span>Infrastructure</span>

                  <span>42%</span>

                </div>

                <div className="h-3 rounded-full bg-slate-200">

                  <div className="h-3 w-[42%] rounded-full bg-blue-600"></div>

                </div>

              </div>

              <div>

                <div className="mb-2 flex justify-between">

                  <span>Water Supply</span>

                  <span>26%</span>

                </div>

                <div className="h-3 rounded-full bg-slate-200">

                  <div className="h-3 w-[26%] rounded-full bg-green-600"></div>

                </div>

              </div>

              <div>

                <div className="mb-2 flex justify-between">

                  <span>Electricity</span>

                  <span>18%</span>

                </div>

                <div className="h-3 rounded-full bg-slate-200">

                  <div className="h-3 w-[18%] rounded-full bg-yellow-500"></div>

                </div>

              </div>

              <div>

                <div className="mb-2 flex justify-between">

                  <span>Others</span>

                  <span>14%</span>

                </div>

                <div className="h-3 rounded-full bg-slate-200">

                  <div className="h-3 w-[14%] rounded-full bg-red-500"></div>

                </div>

              </div>

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

            <CalendarDays
              size={28}
              className="text-blue-600"
            />

            <h2 className="mt-4 text-4xl font-bold">

              324

            </h2>

            <p className="mt-2 text-slate-500">

              Today's Complaints

            </p>

          </div>

          <div className="rounded-3xl bg-green-50 p-6">

            <TrendingUp
              size={28}
              className="text-green-600"
            />

            <h2 className="mt-4 text-4xl font-bold">

              92%

            </h2>

            <p className="mt-2 text-slate-500">

              Resolution Rate

            </p>

          </div>

          <div className="rounded-3xl bg-violet-50 p-6">

            <BrainCircuit
              size={28}
              className="text-violet-600"
            />

            <h2 className="mt-4 text-4xl font-bold">

              97%

            </h2>

            <p className="mt-2 text-slate-500">

              AI Confidence

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