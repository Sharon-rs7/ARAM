import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  CalendarDays,
  MapPin,
  User,
  Building2,
  ShieldCheck,
  Paperclip,
  Download,
  Clock3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
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

              Review the assigned complaint and update its progress.

            </p>

          </div>

          <button
            onClick={() => navigate("/volunteer/assigned-cases")}
            className="rounded-xl border border-slate-300 px-6 py-3 hover:bg-slate-100"
          >

            Back

          </button>

        </div>

        {/* Status Cards */}

        <div className="grid gap-6 lg:grid-cols-4">

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <p className="text-slate-500">

              Status

            </p>

            <h2 className="mt-3 text-3xl font-bold text-orange-600">

              Pending

            </h2>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <p className="text-slate-500">

              Priority

            </p>

            <h2 className="mt-3 text-3xl font-bold text-red-600">

              HIGH

            </h2>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <p className="text-slate-500">

              Department

            </p>

            <h2 className="mt-3 text-xl font-bold">

              Municipality

            </h2>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <p className="text-slate-500">

              Assigned On

            </p>

            <h2 className="mt-3 text-xl font-bold">

              12 Jul 2026

            </h2>

          </div>

        </div>

        {/* Complaint Info */}

        <div className="grid gap-8 lg:grid-cols-3">

          <div className="rounded-3xl bg-white p-8 shadow-sm lg:col-span-2">

            <h2 className="mb-6 text-2xl font-bold">

              Complaint Information

            </h2>

            <div className="space-y-6">

              <div>

                <label className="text-sm text-slate-500">

                  Complaint Title

                </label>

                <h3 className="mt-2 text-2xl font-semibold">

                  Road Damage Near Bus Stand

                </h3>

              </div>

              <div>

                <label className="text-sm text-slate-500">

                  Description

                </label>

                <p className="mt-2 leading-8 text-slate-600">

                  Large potholes near the main bus stand are causing
                  accidents and traffic congestion.
                  Immediate repair is requested.

                </p>

              </div>

              <div className="grid gap-6 md:grid-cols-2">

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

                      Department

                    </p>

                    <h4>

                      Municipality

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

                  <CalendarDays />

                  <div>

                    <p className="text-sm text-slate-500">

                      Submitted

                    </p>

                    <h4>

                      10 Jul 2026

                    </h4>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* Volunteer Card */}

          <div className="rounded-3xl bg-blue-600 p-8 text-white">

            <ShieldCheck size={50} />

            <h2 className="mt-6 text-2xl font-bold">

              Volunteer Assigned

            </h2>

            <p className="mt-4 leading-8 text-blue-100">

              You have been assigned to inspect this complaint,
              verify the issue and submit the status update.

            </p>

            <div className="mt-8 rounded-2xl bg-white/20 p-4">

              <div className="flex items-center gap-3">

                <Clock3 />

                <span>

                  Deadline : 48 Hours

                </span>

              </div>

            </div>

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

                    10 Jul 2026 • 10:20 AM

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

                    Assigned to Volunteer

                  </h4>

                  <p className="mt-2 text-slate-500">

                    Waiting for field verification.

                  </p>

                </div>

              </div>

              <div className="flex gap-5">

                <div className="flex flex-col items-center">

                  <div className="h-4 w-4 rounded-full bg-yellow-500"></div>

                </div>

                <div>

                  <h4 className="font-semibold">

                    Inspection Pending

                  </h4>

                  <p className="mt-2 text-slate-500">

                    Visit the location and submit an update.

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

                      location.pdf

                    </h4>

                    <p className="text-sm text-slate-500">

                      650 KB

                    </p>

                  </div>

                </div>

                <button
                  onClick={() => toast.success("Downloading location.pdf")}
                >

                  <Download size={20} />

                </button>

              </div>

            </div>

          </div>

        </div>

        {/* Volunteer Update */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <h2 className="mb-6 text-2xl font-bold">

            Volunteer Update

          </h2>

          <textarea
            rows={5}
            placeholder="Enter inspection notes..."
            className="w-full rounded-2xl border border-slate-300 p-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />

          <div className="mt-6 flex flex-wrap gap-4">

            <button
              onClick={() => toast.success("Update notes saved successfully!")}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Save Update
            </button>
            <button
              onClick={() => toast.success("Case resolved successfully!")}
              className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
            >
              Mark as Resolved
            </button>

            <button
              onClick={() => navigate("/volunteer/case-review")}
              className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
            >

              Request More Information

            </button>

          </div>

        </div>

      </div>

    </DashboardLayout>

  );

};

export default ComplaintDetails;