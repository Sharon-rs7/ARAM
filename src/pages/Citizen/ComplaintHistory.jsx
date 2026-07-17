import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Search,
  Filter,
  Eye,
  CalendarDays,
  Clock3,
  ArrowUpDown,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const complaints = [
  {
    id: "CMP1023",
    title: "Road Damage Complaint",
    category: "Infrastructure",
    priority: "High",
    status: "Pending",
    date: "12 Jul 2026",
  },
  {
    id: "CMP1024",
    title: "Water Supply Issue",
    category: "Water",
    priority: "Medium",
    status: "In Progress",
    date: "10 Jul 2026",
  },
  {
    id: "CMP1025",
    title: "Street Light Problem",
    category: "Electricity",
    priority: "Low",
    status: "Resolved",
    date: "08 Jul 2026",
  },
  {
    id: "CMP1026",
    title: "Garbage Collection Delay",
    category: "Sanitation",
    priority: "Medium",
    status: "Pending",
    date: "06 Jul 2026",
  },
  {
    id: "CMP1027",
    title: "Illegal Waste Dumping",
    category: "Environment",
    priority: "High",
    status: "Resolved",
    date: "04 Jul 2026",
  },
];

const ComplaintHistory = () => {

  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const filteredComplaints = complaints.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (

    <DashboardLayout>

      <div className="space-y-8">

        {/* Header */}

        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-4xl font-bold text-slate-900">

              Complaint History

            </h1>

            <p className="mt-2 text-slate-500">

              View, search and track all your complaints.

            </p>

          </div>

        </div>

        {/* Statistics */}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <p className="text-slate-500">

              Total Complaints

            </p>

            <h2 className="mt-3 text-4xl font-bold">

              24

            </h2>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <p className="text-slate-500">

              Pending

            </p>

            <h2 className="mt-3 text-4xl font-bold text-red-600">

              08

            </h2>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <p className="text-slate-500">

              In Progress

            </p>

            <h2 className="mt-3 text-4xl font-bold text-blue-600">

              06

            </h2>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <p className="text-slate-500">

              Resolved

            </p>

            <h2 className="mt-3 text-4xl font-bold text-green-600">

              10

            </h2>

          </div>

        </div>

        {/* Search */}

        <div className="rounded-3xl bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-4 lg:flex-row">

            <div className="relative flex-1">

              <Search
                size={18}
                className="absolute left-4 top-4 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search complaint..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-14 w-full rounded-xl border border-slate-300 pl-12 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

            </div>

            <button className="flex items-center gap-2 rounded-xl border border-slate-300 px-6 hover:bg-slate-100">

              <Filter size={18} />

              Filter

            </button>

            <button className="flex items-center gap-2 rounded-xl border border-slate-300 px-6 hover:bg-slate-100">

              <ArrowUpDown size={18} />

              Sort

            </button>

          </div>

        </div>

        {/* Table */}

        <div className="overflow-hidden rounded-3xl bg-white shadow-sm">

          <table className="w-full">

            <thead className="bg-slate-100">

              <tr>

                <th className="px-6 py-5 text-left">Complaint ID</th>

                <th className="px-6 py-5 text-left">Title</th>

                <th className="px-6 py-5 text-left">Category</th>

                <th className="px-6 py-5 text-left">Priority</th>

                <th className="px-6 py-5 text-left">Status</th>

                <th className="px-6 py-5 text-left">Date</th>

                <th className="px-6 py-5 text-center">Action</th>

              </tr>

            </thead>

            <tbody>

              {filteredComplaints.map((item) => (

                <tr
                  key={item.id}
                  className="border-b hover:bg-slate-50"
                >

                  <td className="px-6 py-5 font-semibold">

                    {item.id}

                  </td>

                  <td className="px-6 py-5">

                    {item.title}

                  </td>

                  <td className="px-6 py-5">

                    {item.category}

                  </td>                  <td className="px-6 py-5">

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

                  </td>

                  <td className="px-6 py-5">

                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        item.status === "Resolved"
                          ? "bg-green-100 text-green-600"
                          : item.status === "Pending"
                          ? "bg-red-100 text-red-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {item.status}
                    </span>

                  </td>

                  <td className="px-6 py-5">

                    <div className="flex items-center gap-2">

                      <CalendarDays
                        size={16}
                        className="text-slate-400"
                      />

                      {item.date}

                    </div>

                  </td>

                  <td className="px-6 py-5 text-center">

                    <button
                      onClick={() =>
                        navigate("/citizen/complaint/1")
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
                    >

                      <Eye size={16} />

                      View

                    </button>

                  </td>

                </tr>

              ))}

              {filteredComplaints.length === 0 && (

                <tr>

                  <td
                    colSpan="7"
                    className="py-16 text-center text-slate-500"
                  >

                    No complaints found.

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

        {/* Pagination */}

        <div className="flex flex-col items-center justify-between gap-5 rounded-3xl bg-white p-6 shadow-sm md:flex-row">

          <div className="flex items-center gap-2 text-slate-500">

            <Clock3 size={18} />

            Showing 1 - {filteredComplaints.length} of {complaints.length} complaints

          </div>

          <div className="flex gap-3">

            <button
              onClick={() => navigate("/citizen/dashboard")}
              className="rounded-xl border border-slate-300 px-5 py-2 transition hover:bg-slate-100"
            >

              Dashboard

            </button>

            <button className="rounded-xl bg-blue-600 px-5 py-2 text-white">

              1

            </button>

            <button className="rounded-xl border border-slate-300 px-5 py-2 transition hover:bg-slate-100">

              2

            </button>

            <button className="rounded-xl border border-slate-300 px-5 py-2 transition hover:bg-slate-100">

              3

            </button>

            <button
              onClick={() =>
                navigate("/citizen/complaint/1")
              }
              className="rounded-xl border border-slate-300 px-5 py-2 transition hover:bg-slate-100"
            >

              Next

            </button>

          </div>

        </div>

      </div>

    </DashboardLayout>

  );

};

export default ComplaintHistory;