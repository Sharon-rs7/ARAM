import DashboardLayout from "@/components/common/DashboardLayout";
import {
  FileBarChart,
  Download,
  CalendarDays,
  FileText,
  Filter,
  BrainCircuit,
} from "lucide-react";

import { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";

const Reports = () => {
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function loadStats() {
      try {
        const complaints = await adminService.getComplaints();
        setTotalCount(complaints ? complaints.length : 0);
      } catch (err) {
        console.error("Failed to load reports stats:", err);
      }
    }
    loadStats();
  }, []);

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

              {totalCount}

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
              className="text-orange-505"
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
              className="text-violet-650"
            />

            <h2 className="mt-4 text-4xl font-bold">

              92%

            </h2>

            <p className="mt-2 text-slate-500">

              Resolution Rate

            </p>

          </div>

        </div>

        {/* Report System Stats */}

        <div className="grid gap-6 md:grid-cols-3">

          <div className="rounded-3xl bg-blue-50/50 border border-blue-100/50 p-6">

            <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wider">

              Reports Generated

            </h3>

            <h2 className="mt-3 text-3xl font-extrabold text-blue-600">

              148

            </h2>

          </div>

          <div className="rounded-3xl bg-green-50/50 border border-green-100/50 p-6">

            <h3 className="text-sm font-bold text-green-700 uppercase tracking-wider">

              AI Accuracy

            </h3>

            <h2 className="mt-3 text-3xl font-extrabold text-green-600">

              97%

            </h2>

          </div>

          <div className="rounded-3xl bg-violet-50/50 border border-violet-100/50 p-6">

            <h3 className="text-sm font-bold text-violet-755 uppercase tracking-wider">

              Monthly Growth

            </h3>

            <h2 className="mt-3 text-3xl font-extrabold text-violet-650">

              +18%

            </h2>

          </div>

        </div>

        {/* Generated Reports */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <div className="mb-6 flex items-center justify-between">

            <h2 className="text-2xl font-bold">

              Generated Reports

            </h2>

            <button
              className="rounded-xl border border-slate-300 px-5 py-2 transition hover:bg-slate-100 font-semibold text-slate-705"
            >

              View All

            </button>

          </div>

          <div className="space-y-5">

            <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:bg-slate-50">
              <div>
                <h3 className="font-semibold text-slate-800">
                  Monthly Complaint Report
                </h3>
                <p className="mt-2 text-slate-500 text-xs font-medium">
                  Generated on 15 Jul 2026
                </p>
              </div>
              <button
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-sm bg-white"
              >
                Download PDF
              </button>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:bg-slate-50">
              <div>
                <h3 className="font-semibold text-slate-800">
                  Department Performance Report
                </h3>
                <p className="mt-2 text-slate-500 text-xs font-medium">
                  Generated on 10 Jul 2026
                </p>
              </div>
              <button
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-sm bg-white"
              >
                Download Excel
              </button>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:bg-slate-50">
              <div>
                <h3 className="font-semibold text-slate-800">
                  AI Analysis Report
                </h3>
                <p className="mt-2 text-slate-500 text-xs font-medium">
                  Generated on 08 Jul 2026
                </p>
              </div>
              <button
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-sm bg-white"
              >
                Download PDF
              </button>
            </div>

          </div>

        </div>

        {/* AI Report Summary */}

        <div className="rounded-3xl bg-gradient-to-r from-blue-900 to-slate-900 p-8 text-white">

          <div className="flex items-center gap-4">

            <BrainCircuit size={40} className="text-blue-400" />

            <div>

              <h2 className="text-2xl font-bold">

                AI Report Summary

              </h2>

              <p className="mt-2 text-slate-400 text-xs">

                AI-powered insights based on complaint analytics.

              </p>

            </div>

          </div>

          <p className="mt-6 leading-8 text-slate-300 text-sm">

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

      </div>

    </DashboardLayout>

  );

};

export default Reports;