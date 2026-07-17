import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Search,
  Filter,
  Eye,
  UserCheck,
  UserX,
  Users,
  UserPlus,
  BadgeCheck,
  Clock3,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const volunteerData = [
  {
    id: "VOL001",
    name: "Arun Kumar",
    department: "Municipality",
    assignedCases: 12,
    status: "Active",
  },
  {
    id: "VOL002",
    name: "Priya",
    department: "Water Board",
    assignedCases: 8,
    status: "Active",
  },
  {
    id: "VOL003",
    name: "Karthik",
    department: "Electricity",
    assignedCases: 15,
    status: "Busy",
  },
  {
    id: "VOL004",
    name: "Rahul",
    department: "Sanitation",
    assignedCases: 0,
    status: "Inactive",
  },
];

const ManageVolunteers = () => {

  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const filteredVolunteers = volunteerData.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.department.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase())
  );

  return (

    <DashboardLayout>

      <div className="space-y-8">

        {/* Header */}

        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-4xl font-bold">

              Manage Volunteers

            </h1>

            <p className="mt-2 text-slate-500">

              Assign, monitor and manage all volunteers.

            </p>

          </div>

          <button
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700"
          >

            <UserPlus size={18} />

            Add Volunteer

          </button>

        </div>

        {/* Statistics */}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <Users
              size={30}
              className="text-blue-600"
            />

            <h2 className="mt-4 text-4xl font-bold">

              {volunteerData.length}

            </h2>

            <p className="mt-2 text-slate-500">

              Total Volunteers

            </p>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <BadgeCheck
              size={30}
              className="text-green-600"
            />

            <h2 className="mt-4 text-4xl font-bold">

              {
                volunteerData.filter(
                  (item) => item.status === "Active"
                ).length
              }

            </h2>

            <p className="mt-2 text-slate-500">

              Active

            </p>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <Clock3
              size={30}
              className="text-yellow-600"
            />

            <h2 className="mt-4 text-4xl font-bold">

              {
                volunteerData.filter(
                  (item) => item.status === "Busy"
                ).length
              }

            </h2>

            <p className="mt-2 text-slate-500">

              Busy

            </p>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <UserX
              size={30}
              className="text-red-600"
            />

            <h2 className="mt-4 text-4xl font-bold">

              {
                volunteerData.filter(
                  (item) => item.status === "Inactive"
                ).length
              }

            </h2>

            <p className="mt-2 text-slate-500">

              Inactive

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
                placeholder="Search volunteers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-14 w-full rounded-xl border border-slate-300 pl-12 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

            </div>

            <button
              className="flex items-center gap-2 rounded-xl border border-slate-300 px-6 transition hover:bg-slate-100"
            >

              <Filter size={18} />

              Filter

            </button>

          </div>

        </div>        {/* Volunteers Table */}

        <div className="overflow-hidden rounded-3xl bg-white shadow-sm">

          <table className="w-full">

            <thead className="bg-slate-100">

              <tr>

                <th className="px-6 py-5 text-left">

                  ID

                </th>

                <th className="px-6 py-5 text-left">

                  Volunteer

                </th>

                <th className="px-6 py-5 text-left">

                  Department

                </th>

                <th className="px-6 py-5 text-left">

                  Assigned Cases

                </th>

                <th className="px-6 py-5 text-left">

                  Status

                </th>

                <th className="px-6 py-5 text-center">

                  Actions

                </th>

              </tr>

            </thead>

            <tbody>

              {filteredVolunteers.map((item) => (

                <tr
                  key={item.id}
                  className="border-b transition hover:bg-slate-50"
                >

                  <td className="px-6 py-5 font-semibold">

                    {item.id}

                  </td>

                  <td className="px-6 py-5">

                    {item.name}

                  </td>

                  <td className="px-6 py-5">

                    {item.department}

                  </td>

                  <td className="px-6 py-5">

                    <span className="font-semibold text-blue-600">

                      {item.assignedCases}

                    </span>

                  </td>

                  <td className="px-6 py-5">

                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        item.status === "Active"
                          ? "bg-green-100 text-green-600"
                          : item.status === "Busy"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >

                      {item.status}

                    </span>

                  </td>

                  <td className="px-6 py-5">

                    <div className="flex justify-center gap-3">

                      <button
                        onClick={() => navigate("/admin/volunteer-details")}
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

                        <UserX size={18} />

                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>        {/* Empty State */}

        {filteredVolunteers.length === 0 && (

          <div className="rounded-3xl bg-white p-16 text-center shadow-sm">

            <Users
              size={70}
              className="mx-auto text-slate-300"
            />

            <h2 className="mt-6 text-2xl font-bold">

              No Volunteers Found

            </h2>

            <p className="mt-3 text-slate-500">

              No volunteers match your search.

            </p>

          </div>

        )}

        {/* Summary */}

        {filteredVolunteers.length > 0 && (

          <div className="grid gap-6 md:grid-cols-3">

            <div className="rounded-3xl bg-blue-50 p-6">

              <h3 className="text-lg font-semibold text-blue-700">

                Total Volunteers

              </h3>

              <h2 className="mt-3 text-4xl font-bold text-blue-600">

                {volunteerData.length}

              </h2>

            </div>

            <div className="rounded-3xl bg-green-50 p-6">

              <h3 className="text-lg font-semibold text-green-700">

                Active Volunteers

              </h3>

              <h2 className="mt-3 text-4xl font-bold text-green-600">

                {
                  volunteerData.filter(
                    (item) => item.status === "Active"
                  ).length
                }

              </h2>

            </div>

            <div className="rounded-3xl bg-yellow-50 p-6">

              <h3 className="text-lg font-semibold text-yellow-700">

                Busy Volunteers

              </h3>

              <h2 className="mt-3 text-4xl font-bold text-yellow-600">

                {
                  volunteerData.filter(
                    (item) => item.status === "Busy"
                  ).length
                }

              </h2>

            </div>

          </div>

        )}

      </div>

    </DashboardLayout>

  );

};

export default ManageVolunteers;