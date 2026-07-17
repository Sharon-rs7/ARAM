import DashboardLayout from "@/components/layout/DashboardLayout";
import { useNavigate } from "react-router-dom";
import {
  BrainCircuit,
  ShieldCheck,
  Building2,
  BadgeAlert,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

const AIAnalysis = () => {

  const navigate = useNavigate();

  return (

    <DashboardLayout>

      <div className="space-y-8">

        {/* Header */}

        <div>

          <h1 className="text-4xl font-bold text-slate-900">
            AI Complaint Analysis
          </h1>

          <p className="mt-2 text-slate-500">
            AI analysed your complaint and generated the following results.
          </p>

        </div>

        {/* AI Banner */}

        <div className="rounded-[30px] bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">

          <div className="flex items-center gap-5">

            <div className="rounded-2xl bg-white/20 p-5">

              <BrainCircuit size={42} />

            </div>

            <div>

              <h2 className="text-3xl font-bold">

                AI Analysis Completed

              </h2>

              <p className="mt-2 text-blue-100">

                Complaint analysed successfully with 96% confidence.

              </p>

            </div>

          </div>

        </div>

        {/* Summary */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <h3 className="mb-6 text-2xl font-bold">

            Complaint Summary

          </h3>

          <div className="rounded-2xl bg-slate-50 p-6 leading-8 text-slate-600">

            The complaint reports a damaged public road causing
            inconvenience and safety risks to local residents.
            AI identified this issue as a public infrastructure
            problem requiring Municipal Corporation intervention.

          </div>

        </div>

        {/* AI Cards */}

        <div className="grid gap-6 lg:grid-cols-2">

          {/* Category */}

          <div className="rounded-3xl bg-white p-7 shadow-sm">

            <div className="flex items-center gap-4">

              <div className="rounded-2xl bg-blue-100 p-4 text-blue-600">

                <Sparkles size={28} />

              </div>

              <div>

                <p className="text-slate-500">

                  Complaint Category

                </p>

                <h3 className="text-2xl font-bold">

                  Public Infrastructure

                </h3>

              </div>

            </div>

          </div>

          {/* Priority */}

          <div className="rounded-3xl bg-white p-7 shadow-sm">

            <div className="flex items-center gap-4">

              <div className="rounded-2xl bg-red-100 p-4 text-red-600">

                <BadgeAlert size={28} />

              </div>

              <div>

                <p className="text-slate-500">

                  Priority Level

                </p>

                <h3 className="text-2xl font-bold text-red-600">

                  HIGH

                </h3>

              </div>

            </div>

          </div>

          {/* Department */}

          <div className="rounded-3xl bg-white p-7 shadow-sm">

            <div className="flex items-center gap-4">

              <div className="rounded-2xl bg-green-100 p-4 text-green-600">

                <Building2 size={28} />

              </div>

              <div>

                <p className="text-slate-500">

                  Recommended Department

                </p>

                <h3 className="text-2xl font-bold">

                  Municipal Corporation

                </h3>

              </div>

            </div>

          </div>

          {/* Confidence */}

          <div className="rounded-3xl bg-white p-7 shadow-sm">

            <div className="flex items-center gap-4">

              <div className="rounded-2xl bg-purple-100 p-4 text-purple-600">

                <ShieldCheck size={28} />

              </div>

              <div>

                <p className="text-slate-500">

                  Confidence Score

                </p>

                <h3 className="text-2xl font-bold">

                  96%

                </h3>

              </div>

            </div>

            <div className="mt-5 h-3 rounded-full bg-slate-200">

              <div className="h-3 w-[96%] rounded-full bg-purple-600"></div>

            </div>

          </div>

        </div>        {/* AI Recommendations */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <h3 className="mb-6 text-2xl font-bold">

            AI Recommendations

          </h3>

          <div className="space-y-5">

            <div className="flex items-center gap-4">

              <CheckCircle2 className="text-green-600" />

              <p>Add exact complaint location.</p>

            </div>

            <div className="flex items-center gap-4">

              <CheckCircle2 className="text-green-600" />

              <p>Upload clear photos of the issue.</p>

            </div>

            <div className="flex items-center gap-4">

              <CheckCircle2 className="text-green-600" />

              <p>Mention the date and time of occurrence.</p>

            </div>

            <div className="flex items-center gap-4">

              <CheckCircle2 className="text-green-600" />

              <p>Include nearby landmark details.</p>

            </div>

          </div>

        </div>

        {/* Bottom Section */}

        <div className="grid gap-8 lg:grid-cols-2">

          {/* Legal Checklist */}

          <div className="rounded-3xl bg-white p-8 shadow-sm">

            <h3 className="mb-6 text-2xl font-bold">

              AI Legal Checklist

            </h3>

            <div className="space-y-5">

              <div className="flex items-center justify-between rounded-2xl bg-green-50 p-4">

                <span>Complaint Description</span>

                <span className="font-semibold text-green-600">

                  ✓ Complete

                </span>

              </div>

              <div className="flex items-center justify-between rounded-2xl bg-green-50 p-4">

                <span>Location Provided</span>

                <span className="font-semibold text-green-600">

                  ✓ Complete

                </span>

              </div>

              <div className="flex items-center justify-between rounded-2xl bg-yellow-50 p-4">

                <span>Photo Evidence</span>

                <span className="font-semibold text-yellow-600">

                  Recommended

                </span>

              </div>

              <div className="flex items-center justify-between rounded-2xl bg-red-50 p-4">

                <span>Witness Details</span>

                <span className="font-semibold text-red-600">

                  Optional

                </span>

              </div>

            </div>

          </div>

          {/* Similar Complaints */}

          <div className="rounded-3xl bg-white p-8 shadow-sm">

            <h3 className="mb-6 text-2xl font-bold">

              Similar Complaints Found

            </h3>

            <div className="space-y-5">

              <div className="rounded-2xl border border-slate-200 p-5">

                <h4 className="font-semibold">

                  Road Damage - Ward 12

                </h4>

                <p className="mt-2 text-slate-500">

                  Status : In Progress

                </p>

                <p className="text-sm text-slate-400">

                  Submitted 3 days ago

                </p>

              </div>

              <div className="rounded-2xl border border-slate-200 p-5">

                <h4 className="font-semibold">

                  Pothole Near Bus Stand

                </h4>

                <p className="mt-2 text-slate-500">

                  Status : Resolved

                </p>

                <p className="text-sm text-slate-400">

                  Submitted 10 days ago

                </p>

              </div>

            </div>

          </div>

        </div>

        {/* Resolution */}

        <div className="rounded-3xl bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-white">

          <h3 className="text-2xl font-bold">

            Estimated Resolution Time

          </h3>

          <p className="mt-4 leading-8 text-green-100">

            Based on previous complaints, similar infrastructure
            issues are generally resolved within

            <span className="font-bold text-white">

              {" "}5 - 7 Working Days.

            </span>

          </p>

        </div>

        {/* Actions */}

        <div className="flex flex-col justify-end gap-4 sm:flex-row">

          <button
            type="button"
            onClick={() => toast.success("AI analysis report downloaded successfully.")}
            className="rounded-xl border border-slate-300 px-8 py-4 font-semibold transition hover:bg-slate-100"
          >

            Download AI Report

          </button>

          <button
            type="button"
            onClick={() => navigate("/citizen/history")}
            className="rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white transition hover:bg-blue-700"
          >

            Continue to Submit

          </button>

        </div>

      </div>

    </DashboardLayout>

  );

};

export default AIAnalysis;