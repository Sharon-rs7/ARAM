import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  User,
  MapPin,
  CalendarDays,
  Building2,
  ShieldCheck,
  BrainCircuit,
  Flag,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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

              Review, assign and manage this complaint.

            </p>

          </div>

          <button
            onClick={() => navigate("/admin/complaints")}
            className="flex items-center gap-2 rounded-xl border border-slate-300 px-6 py-3 transition hover:bg-slate-100"
          >

            <ArrowLeft size={18} />

            Back

          </button>

        </div>

        {/* Overview Cards */}

        <div className="grid gap-6 lg:grid-cols-4">

          <div className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

            <FileText
              size={30}
              className="text-blue-600"
            />

            <p className="mt-4 text-slate-500">

              Complaint ID

            </p>

            <h2 className="mt-2 text-2xl font-bold">

              CMP1023

            </h2>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

            <Flag
              size={30}
              className="text-red-600"
            />

            <p className="mt-4 text-slate-500">

              Priority

            </p>

            <h2 className="mt-2 text-2xl font-bold text-red-600">

              HIGH

            </h2>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

            <ShieldCheck
              size={30}
              className="text-green-600"
            />

            <p className="mt-4 text-slate-500">

              Status

            </p>

            <h2 className="mt-2 text-2xl font-bold text-green-600">

              In Progress

            </h2>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

            <BrainCircuit
              size={30}
              className="text-violet-600"
            />

            <p className="mt-4 text-slate-500">

              AI Confidence

            </p>

            <h2 className="mt-2 text-2xl font-bold">

              96%

            </h2>

          </div>

        </div>

        {/* Complaint Details */}

        <div className="grid gap-8 lg:grid-cols-3">

          <div className="rounded-3xl bg-white p-8 shadow-sm lg:col-span-2">

            <h2 className="mb-6 text-2xl font-bold">

              Complaint Information

            </h2>

            <div className="space-y-6">

              <div>

                <p className="text-sm text-slate-500">

                  Title

                </p>

                <h3 className="mt-2 text-2xl font-semibold">

                  Road Damage Near Bus Stand

                </h3>

              </div>

              <div>

                <p className="text-sm text-slate-500">

                  Description

                </p>

                <p className="mt-3 leading-8 text-slate-600">

                  Large potholes near the main bus stand are
                  causing accidents and traffic congestion.
                  Immediate repair is required.

                </p>

              </div>

              <div className="grid gap-6 md:grid-cols-2">

                <div className="flex items-center gap-4">

                  <User className="text-blue-600" />

                  <div>

                    <p className="text-sm text-slate-500">

                      Citizen

                    </p>

                    <h4>

                      Sharon Robert

                    </h4>

                  </div>

                </div>

                <div className="flex items-center gap-4">

                  <CalendarDays className="text-blue-600" />

                  <div>

                    <p className="text-sm text-slate-500">

                      Submitted

                    </p>

                    <h4>

                      12 Jul 2026

                    </h4>

                  </div>

                </div>                <div className="flex items-center gap-4">

                  <MapPin className="text-blue-600" />

                  <div>

                    <p className="text-sm text-slate-500">

                      Location

                    </p>

                    <h4>

                      Nagercoil Bus Stand,
                      Kanyakumari District

                    </h4>

                  </div>

                </div>

                <div className="flex items-center gap-4">

                  <Building2 className="text-blue-600" />

                  <div>

                    <p className="text-sm text-slate-500">

                      Department

                    </p>

                    <h4>

                      Municipality Department

                    </h4>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* AI Recommendation */}

          <div className="rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="mb-6 text-2xl font-bold">

              AI Recommendation

            </h2>

            <div className="rounded-2xl bg-violet-50 p-5">

              <div className="flex items-center gap-3">

                <BrainCircuit
                  className="text-violet-600"
                  size={28}
                />

                <h3 className="font-bold">

                  AI Analysis

                </h3>

              </div>

              <p className="mt-5 leading-8 text-slate-600">

                AI classified this complaint as an
                <span className="font-semibold text-violet-600">

                  {" "}Infrastructure Complaint

                </span>
                with
                <span className="font-semibold text-green-600">

                  {" "}96% confidence.

                </span>

              </p>

              <div className="mt-6 h-3 rounded-full bg-slate-200">

                <div className="h-3 w-[96%] rounded-full bg-violet-600"></div>

              </div>

              <div className="mt-6 rounded-2xl bg-white p-4">

                <h4 className="font-semibold">

                  AI Suggested Actions

                </h4>

                <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-600">

                  <li>

                    Assign to Municipality Department

                  </li>

                  <li>

                    Mark as High Priority

                  </li>

                  <li>

                    Schedule field inspection within 24 hours

                  </li>

                  <li>

                    Notify nearest volunteer immediately

                  </li>

                </ul>

              </div>

            </div>

          </div>

        </div>        {/* Assignment Section */}

        <div className="grid gap-8 lg:grid-cols-2">

          {/* Department Assignment */}

          <div className="rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="mb-6 text-2xl font-bold">

              Department Assignment

            </h2>

            <label className="mb-2 block font-medium">

              Assign Department

            </label>

            <select
              className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >

              <option>Municipality Department</option>

              <option>Police Department</option>

              <option>Electricity Board</option>

              <option>Water Supply Department</option>

              <option>Health Department</option>

            </select>

            <button
              className="mt-6 w-full rounded-xl bg-blue-600 py-4 font-semibold text-white transition hover:bg-blue-700"
            >

              Assign Department

            </button>

          </div>

          {/* Volunteer Assignment */}

          <div className="rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="mb-6 text-2xl font-bold">

              Volunteer Assignment

            </h2>

            <label className="mb-2 block font-medium">

              Assign Volunteer

            </label>

            <select
              className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >

              <option>Volunteer 1</option>

              <option>Volunteer 2</option>

              <option>Volunteer 3</option>

              <option>Volunteer 4</option>

            </select>

            <button
              className="mt-6 w-full rounded-xl bg-green-600 py-4 font-semibold text-white transition hover:bg-green-700"
            >

              Assign Volunteer

            </button>

          </div>

        </div>

        {/* Complaint Timeline */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <h2 className="mb-8 text-2xl font-bold">

            Complaint Timeline

          </h2>

          <div className="space-y-6">

            <div className="flex gap-5">

              <div className="mt-1 h-4 w-4 rounded-full bg-green-600"></div>

              <div>

                <h3 className="font-semibold">

                  Complaint Submitted

                </h3>

                <p className="text-slate-500">

                  12 Jul 2026 • 09:30 AM

                </p>

              </div>

            </div>

            <div className="flex gap-5">

              <div className="mt-1 h-4 w-4 rounded-full bg-blue-600"></div>

              <div>

                <h3 className="font-semibold">

                  AI Analysis Completed

                </h3>

                <p className="text-slate-500">

                  Category identified with 96% confidence.

                </p>

              </div>

            </div>

            <div className="flex gap-5">

              <div className="mt-1 h-4 w-4 rounded-full bg-yellow-500"></div>

              <div>

                <h3 className="font-semibold">

                  Waiting for Department Assignment

                </h3>

                <p className="text-slate-500">

                  Admin action required.

                </p>

              </div>

            </div>

          </div>

        </div>        {/* Admin Notes */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <h2 className="mb-6 text-2xl font-bold">

            Admin Notes

          </h2>

          <textarea
            rows={6}
            placeholder="Write internal remarks or instructions..."
            className="w-full rounded-2xl border border-slate-300 p-5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />

          <div className="mt-8 flex flex-wrap justify-end gap-4">

            <button
              onClick={() => navigate("/admin/complaints")}
              className="rounded-xl border border-slate-300 px-8 py-3 font-semibold transition hover:bg-slate-100"
            >

              Cancel

            </button>

            <button
              className="rounded-xl bg-yellow-500 px-8 py-3 font-semibold text-white transition hover:bg-yellow-600"
            >

              Save Assignment

            </button>

            <button
              className="rounded-xl bg-red-600 px-8 py-3 font-semibold text-white transition hover:bg-red-700"
            >

              Reject Complaint

            </button>

            <button
              className="rounded-xl bg-green-600 px-8 py-3 font-semibold text-white transition hover:bg-green-700"
            >

              Approve Complaint

            </button>

          </div>

        </div>

      </div>

    </DashboardLayout>

  );

};

export default ComplaintDetails;