import DashboardLayout from "@/components/layout/DashboardLayout";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  User,
  Building2,
  ShieldCheck,
  BrainCircuit,
  Paperclip,
  Download,
  ArrowLeft,
  Clock3,
} from "lucide-react";
import { toast } from "sonner";

const ComplaintDetails = () => {

  const navigate = useNavigate();

  return (

    <DashboardLayout>

      <div className="space-y-8">

        {/* Header */}

        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-4xl font-bold">

              Complaint Details

            </h1>

            <p className="mt-2 text-slate-500">

              Complaint ID : CMP1023

            </p>

          </div>

          <button
            onClick={() => navigate("/citizen/history")}
            className="flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-3 hover:bg-slate-100"
          >

            <ArrowLeft size={18} />

            Back

          </button>

        </div>

        {/* Status */}

        <div className="grid gap-6 lg:grid-cols-4">

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <p className="text-slate-500">

              Status

            </p>

            <h3 className="mt-3 text-3xl font-bold text-blue-600">

              In Progress

            </h3>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <p className="text-slate-500">

              Priority

            </p>

            <h3 className="mt-3 text-3xl font-bold text-red-600">

              HIGH

            </h3>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <p className="text-slate-500">

              Department

            </p>

            <h3 className="mt-3 text-xl font-bold">

              Municipality

            </h3>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <p className="text-slate-500">

              AI Confidence

            </p>

            <h3 className="mt-3 text-3xl font-bold text-green-600">

              96%

            </h3>

          </div>

        </div>

        {/* Information */}

        <div className="grid gap-8 lg:grid-cols-3">

          <div className="lg:col-span-2 rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="mb-6 text-2xl font-bold">

              Complaint Information

            </h2>

            <div className="space-y-6">

              <div>

                <label className="text-sm text-slate-500">

                  Complaint Title

                </label>

                <h3 className="mt-2 text-xl font-semibold">

                  Road Damage Complaint

                </h3>

              </div>

              <div>

                <label className="text-sm text-slate-500">

                  Description

                </label>

                <p className="mt-2 leading-8 text-slate-600">

                  The road near the bus stand is severely damaged
                  causing accidents and traffic congestion.
                  Immediate repair is required.

                </p>

              </div>

              <div className="grid gap-6 md:grid-cols-2">

                <div className="flex items-center gap-3">

                  <CalendarDays />

                  <div>

                    <p className="text-sm text-slate-500">

                      Submitted

                    </p>

                    <h4>

                      12 Jul 2026

                    </h4>

                  </div>

                </div>

                <div className="flex items-center gap-3">

                  <MapPin />

                  <div>

                    <p className="text-sm text-slate-500">

                      Location

                    </p>

                    <h4>

                      Nagercoil Bus Stand

                    </h4>

                  </div>

                </div>

                <div className="flex items-center gap-3">

                  <User />

                  <div>

                    <p className="text-sm text-slate-500">

                      Citizen

                    </p>

                    <h4>

                      Sharon Robert

                    </h4>

                  </div>

                </div>

                <div className="flex items-center gap-3">

                  <Building2 />

                  <div>

                    <p className="text-sm text-slate-500">

                      Assigned Department

                    </p>

                    <h4>

                      Municipality

                    </h4>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* AI */}

          <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white">

            <BrainCircuit size={42} />

            <h2 className="mt-6 text-2xl font-bold">

              AI Summary

            </h2>

            <p className="mt-5 leading-8 text-blue-100">

              AI classified this complaint as Public Infrastructure
              with HIGH priority.

            </p>

            <div className="mt-8 h-3 rounded-full bg-white/30">

              <div className="h-3 w-[96%] rounded-full bg-white"></div>

            </div>

            <p className="mt-3">

              Confidence : 96%

            </p>

          </div>

        </div>        {/* Timeline & Attachments */}

        <div className="grid gap-8 lg:grid-cols-2">

          {/* Timeline */}

          <div className="rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="mb-8 text-2xl font-bold">

              Complaint Timeline

            </h2>

            <div className="space-y-8">

              <div className="flex gap-5">

                <div className="flex flex-col items-center">

                  <div className="h-4 w-4 rounded-full bg-green-500"></div>

                  <div className="mt-2 h-20 w-[2px] bg-slate-300"></div>

                </div>

                <div>

                  <h4 className="font-semibold">

                    Complaint Submitted

                  </h4>

                  <p className="mt-2 text-slate-500">

                    12 Jul 2026 • 10:30 AM

                  </p>

                </div>

              </div>

              <div className="flex gap-5">

                <div className="flex flex-col items-center">

                  <div className="h-4 w-4 rounded-full bg-blue-500"></div>

                  <div className="mt-2 h-20 w-[2px] bg-slate-300"></div>

                </div>

                <div>

                  <h4 className="font-semibold">

                    AI Analysis Completed

                  </h4>

                  <p className="mt-2 text-slate-500">

                    Complaint categorized successfully.

                  </p>

                </div>

              </div>

              <div className="flex gap-5">

                <div className="flex flex-col items-center">

                  <div className="h-4 w-4 rounded-full bg-yellow-500"></div>

                </div>

                <div>

                  <h4 className="font-semibold">

                    Assigned to Municipality

                  </h4>

                  <p className="mt-2 text-slate-500">

                    Waiting for officer review.

                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* Attachments */}

          <div className="rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="mb-8 text-2xl font-bold">

              Attachments

            </h2>

            <div className="space-y-4">

              <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-5">

                <div className="flex items-center gap-4">

                  <Paperclip />

                  <div>

                    <h4 className="font-semibold">

                      road_damage.jpg

                    </h4>

                    <p className="text-sm text-slate-500">

                      2.4 MB

                    </p>

                  </div>

                </div>

                <button
                  onClick={() => toast.success("Downloading road_damage.jpg")}
                >

                  <Download size={20} />

                </button>

              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-5">

                <div className="flex items-center gap-4">

                  <Paperclip />

                  <div>

                    <h4 className="font-semibold">

                      complaint.pdf

                    </h4>

                    <p className="text-sm text-slate-500">

                      850 KB

                    </p>

                  </div>

                </div>

                <button
                  onClick={() => toast.success("Downloading complaint.pdf")}
                >

                  <Download size={20} />

                </button>

              </div>

            </div>

          </div>

        </div>

        {/* Officer Update */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <h2 className="mb-6 text-2xl font-bold">

            Officer Updates

          </h2>

          <div className="rounded-2xl bg-slate-50 p-6">

            <div className="flex items-center gap-3">

              <ShieldCheck className="text-green-600" />

              <h3 className="font-semibold">

                Municipality Officer

              </h3>

            </div>

            <p className="mt-5 leading-8 text-slate-600">

              Your complaint has been verified and forwarded
              to the Road Maintenance Team.
              Site inspection is scheduled within 48 hours.

            </p>

          </div>

        </div>

        {/* Bottom Buttons */}

        <div className="flex flex-col justify-end gap-4 sm:flex-row">

          <button
            onClick={() => toast.success("Case report downloaded successfully.")}
            className="rounded-xl border border-slate-300 px-8 py-4 font-semibold hover:bg-slate-100"
          >

            Download Report

          </button>

          <button
            onClick={() => navigate("/citizen/history")}
            className="rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-700"
          >

            Track Complaint

          </button>

        </div>

      </div>

    </DashboardLayout>

  );

};

export default ComplaintDetails;