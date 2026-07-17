import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Search,
  Filter,
  Eye,
  Trash2,
  UserCheck,
  FileText,
  Clock3,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const complaintData = [
  {
    id: "CMP1023",
    citizen: "Sharon Robert",
    category: "Road Damage",
    department: "Municipality",
    volunteer: "Arun",
    status: "Pending",
    priority: "High",
  },
  {
    id: "CMP1024",
    citizen: "Rahul Kumar",
    category: "Garbage",
    department: "Sanitation",
    volunteer: "Priya",
    status: "In Progress",
    priority: "Medium",
  },
  {
    id: "CMP1025",
    citizen: "Ajay",
    category: "Water Leakage",
    department: "Water Board",
    volunteer: "Karthik",
    status: "Resolved",
    priority: "Low",
  },
];

const ManageComplaints = () => {

  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const filteredComplaints = complaintData.filter(
    (item) =>
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.citizen.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  );

  return (

    <DashboardLayout>

      <div className="space-y-8">

        {/* Header */}

        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-4xl font-bold">

              Manage Complaints

            </h1>

            <p className="mt-2 text-slate-500">

              Manage all complaints submitted by citizens.

            </p>

          </div>

        </div>

        {/* Statistics */}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

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

            <Clock3
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

            <CheckCircle2
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

            <AlertTriangle
              size={30}
              className="text-red-600"
            />

            <h2 className="mt-4 text-4xl font-bold">

              28

            </h2>

            <p className="mt-2 text-slate-500">

              High Priority

            </p>

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
                placeholder="Search complaints..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-14 w-full rounded-xl border border-slate-300 pl-12 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

            </div>

            <button className="flex items-center gap-2 rounded-xl border border-slate-300 px-6 hover:bg-slate-100">

              <Filter size={18} />

              Filter

            </button>

          </div>

        </div>        {/* Complaints Table */}

        <div className="overflow-hidden rounded-3xl bg-white shadow-sm">

          <table className="w-full">

            <thead className="bg-slate-100">

              <tr>

                <th className="px-6 py-5 text-left">ID</th>

                <th className="px-6 py-5 text-left">Citizen</th>

                <th className="px-6 py-5 text-left">Category</th>

                <th className="px-6 py-5 text-left">Department</th>

                <th className="px-6 py-5 text-left">Volunteer</th>

                <th className="px-6 py-5 text-left">Priority</th>

                <th className="px-6 py-5 text-left">Status</th>

                <th className="px-6 py-5 text-center">Action</th>

              </tr>

            </thead>

            <tbody>

              {filteredComplaints.map((item) => (

                <tr
                  key={item.id}
                  className="border-b transition hover:bg-slate-50"
                >

                  <td className="px-6 py-5 font-semibold">

                    {item.id}

                  </td>

                  <td className="px-6 py-5">

                    {item.citizen}

                  </td>

                  <td className="px-6 py-5">

                    {item.category}

                  </td>

                  <td className="px-6 py-5">

                    {item.department}

                  </td>

                  <td className="px-6 py-5">

                    {item.volunteer}

                  </td>

                  <td className="px-6 py-5">

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
                        item.status === "Pending"
                          ? "bg-red-100 text-red-600"
                          : item.status === "In Progress"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >

                      {item.status}

                    </span>

                  </td>

                  <td className="px-6 py-5">

                    <div className="flex justify-center gap-3">

                      <button
                        onClick={() => navigate("/admin/complaint-details")}
                        className="rounded-xl bg-blue-600 p-3 text-white transition hover:bg-blue-700"
                      >

                        <Eye size={18} />

                      </button>

                      <button
                        className="rounded-xl bg-green-600 p-3 text-white transition hover:bg-green-700"
                      >

                        <UserCheck size={18} />

                      </button>

                      <button
                        className="rounded-xl bg-red-600 p-3 text-white transition hover:bg-red-700"
                      >

                        <Trash2 size={18} />

                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>        {/* Empty State */}

        {filteredComplaints.length === 0 && (

          <div className="rounded-3xl bg-white p-16 text-center shadow-sm">

            <FileText
              size={70}
              className="mx-auto text-slate-300"
            />

            <h2 className="mt-6 text-2xl font-bold">

              No Complaints Found

            </h2>

            <p className="mt-3 text-slate-500">

              No complaints match your search.

            </p>

          </div>

        )}

        {/* Pagination */}

        {filteredComplaints.length > 0 && (

          <div className="flex flex-col items-center justify-between gap-5 rounded-3xl bg-white p-6 shadow-sm md:flex-row">

            <p className="text-slate-500">

              Showing

              <span className="mx-1 font-semibold">

                1 - {filteredComplaints.length}

              </span>

              of

              <span className="mx-1 font-semibold">

                {complaintData.length}

              </span>

              complaints

            </p>

            <div className="flex gap-3">

              <button className="rounded-xl border border-slate-300 px-5 py-2 transition hover:bg-slate-100">

                Previous

              </button>

              <button className="rounded-xl bg-blue-600 px-5 py-2 text-white">

                1

              </button>

              <button className="rounded-xl border border-slate-300 px-5 py-2 transition hover:bg-slate-100">

                Next

              </button>

            </div>

          </div>

        )}

      </div>

    </DashboardLayout>

  );

};

export default ManageComplaints;