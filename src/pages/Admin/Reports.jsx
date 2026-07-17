import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  FileBarChart,
  Download,
  CalendarDays,
  FileText,
  Filter,
  BrainCircuit,
} from "lucide-react";

const Reports = () => {

  return (

    <DashboardLayout>

      <div className="space-y-8">

        {/* Header */}

        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-4xl font-bold">

              Reports

            </h1>

            <p className="mt-2 text-slate-500">

              Generate and download complaint reports.

            </p>

          </div>

          <button
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700"
          >

            <Download size={18} />

            Export Report

          </button>

        </div>

        {/* Filters */}

        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <div className="grid gap-6 lg:grid-cols-4">

            <div>

              <label className="mb-2 block text-sm font-medium">

                From Date

              </label>

              <input
                type="date"
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-500"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm font-medium">

                To Date

              </label>

              <input
                type="date"
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-500"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm font-medium">

                Department

              </label>

              <select className="h-12 w-full rounded-xl border border-slate-300 px-4">

                <option>All Departments</option>
                <option>Municipality</option>
                <option>Water Board</option>
                <option>Electricity</option>
                <option>Sanitation</option>

              </select>

            </div>

            <div className="flex items-end">

              <button
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-white transition hover:bg-blue-700"
              >

                <Filter size={18} />

                Generate

              </button>

            </div>

          </div>

        </div>

        {/* Statistics */}

        <div className="grid gap-6 lg:grid-cols-4">

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <FileText
              size={30}
              className="text-blue-600"
            />

            <h2 className="mt-4 text-4xl font-bold">

              1286

            </h2>

            <p className="mt-2 text-slate-500">

              Total Complaints

            </p>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <CalendarDays
              size={30}
              className="text-green-600"
            />

            <h2 className="mt-4 text-4xl font-bold">

              1104

            </h2>

            <p className="mt-2 text-slate-500">

              Resolved

            </p>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <FileBarChart
              size={30}
              className="text-orange-500"
            />

            <h2 className="mt-4 text-4xl font-bold">

              182

            </h2>

            <p className="mt-2 text-slate-500">

              Pending

            </p>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <BrainCircuit
              size={30}
              className="text-violet-600"
            />

            <h2 className="mt-4 text-4xl font-bold">

              92%

            </h2>

            <p className="mt-2 text-slate-500">

              Resolution Rate

            </p>

          </div>

        </div>        {/* Generated Reports */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <div className="mb-6 flex items-center justify-between">

            <h2 className="text-2xl font-bold">

              Generated Reports

            </h2>

            <button
              className="rounded-xl border border-slate-300 px-5 py-2 transition hover:bg-slate-100"
            >

              View All

            </button>

          </div>

          <div className="space-y-5">

            <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-5 transition hover:border-blue-300 hover:bg-blue-50">

              <div>

                <h3 className="font-semibold">

                  Monthly Complaint Report

                </h3>

                <p className="mt-2 text-slate-500">

                  Generated on 15 Jul 2026

                </p>

              </div>

              <button
                className="rounded-xl bg-blue-600 px-5 py-3 text-white transition hover:bg-blue-700"
              >

                Download PDF

              </button>

            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-5 transition hover:border-green-300 hover:bg-green-50">

              <div>

                <h3 className="font-semibold">

                  Department Performance Report

                </h3>

                <p className="mt-2 text-slate-500">

                  Generated on 10 Jul 2026

                </p>

              </div>

              <button
                className="rounded-xl bg-green-600 px-5 py-3 text-white transition hover:bg-green-700"
              >

                Download Excel

              </button>

            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-5 transition hover:border-violet-300 hover:bg-violet-50">

              <div>

                <h3 className="font-semibold">

                  AI Analysis Report

                </h3>

                <p className="mt-2 text-slate-500">

                  Generated on 08 Jul 2026

                </p>

              </div>

              <button
                className="rounded-xl bg-violet-600 px-5 py-3 text-white transition hover:bg-violet-700"
              >

                Download PDF

              </button>

            </div>

          </div>

        </div>        {/* AI Report Summary */}

        <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">

          <div className="flex items-center gap-4">

            <BrainCircuit size={40} />

            <div>

              <h2 className="text-2xl font-bold">

                AI Report Summary

              </h2>

              <p className="mt-2 text-blue-100">

                AI-powered insights based on complaint analytics.

              </p>

            </div>

          </div>

          <p className="mt-6 leading-8 text-blue-100">

            AI analysis indicates that Infrastructure and Water Supply
            complaints account for nearly

            <span className="font-bold text-white">

              {" "}68%

            </span>

            {" "}of all registered complaints.

            Municipality department maintains the highest resolution rate,
            while Sanitation requires additional volunteer allocation.

            AI also predicts that complaint resolution efficiency can
            improve by

            <span className="font-bold text-white">

              {" "}12%

            </span>

            {" "}by increasing volunteer participation in high-demand
            departments.

          </p>

        </div>

        {/* Footer Stats */}

        <div className="grid gap-6 md:grid-cols-3">

          <div className="rounded-3xl bg-blue-50 p-6">

            <h3 className="text-lg font-semibold text-blue-700">

              Reports Generated

            </h3>

            <h2 className="mt-3 text-4xl font-bold text-blue-600">

              148

            </h2>

          </div>

          <div className="rounded-3xl bg-green-50 p-6">

            <h3 className="text-lg font-semibold text-green-700">

              AI Accuracy

            </h3>

            <h2 className="mt-3 text-4xl font-bold text-green-600">

              97%

            </h2>

          </div>

          <div className="rounded-3xl bg-violet-50 p-6">

            <h3 className="text-lg font-semibold text-violet-700">

              Monthly Growth

            </h3>

            <h2 className="mt-3 text-4xl font-bold text-violet-600">

              +18%

            </h2>

          </div>

        </div>

      </div>

    </DashboardLayout>

  );

};

export default Reports;