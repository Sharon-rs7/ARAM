import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Search,
  Filter,
  Building2,
  Users,
  Pencil,
  Trash2,
  Plus,
  Briefcase,
  FileText,
} from "lucide-react";
import { useState } from "react";

const departments = [
  {
    id: "DEP001",
    name: "Municipality",
    head: "Ramesh Kumar",
    volunteers: 24,
    complaints: 312,
    resolution: "94%",
  },
  {
    id: "DEP002",
    name: "Water Board",
    head: "Priya Devi",
    volunteers: 18,
    complaints: 201,
    resolution: "90%",
  },
  {
    id: "DEP003",
    name: "Electricity",
    head: "Arun Raj",
    volunteers: 20,
    complaints: 156,
    resolution: "96%",
  },
  {
    id: "DEP004",
    name: "Sanitation",
    head: "Karthik",
    volunteers: 15,
    complaints: 189,
    resolution: "88%",
  },
];

const Departments = () => {

  const [search, setSearch] = useState("");

  const filteredDepartments = departments.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.head.toLowerCase().includes(search.toLowerCase())
  );

  return (

    <DashboardLayout>

      <div className="space-y-8">

        {/* Header */}

        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-4xl font-bold">

              Departments

            </h1>

            <p className="mt-2 text-slate-500">

              Manage all government departments.

            </p>

          </div>

          <button
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700"
          >

            <Plus size={18} />

            Add Department

          </button>

        </div>

        {/* Statistics */}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <Building2
              size={30}
              className="text-blue-600"
            />

            <h2 className="mt-4 text-4xl font-bold">

              {departments.length}

            </h2>

            <p className="mt-2 text-slate-500">

              Departments

            </p>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <Users
              size={30}
              className="text-green-600"
            />

            <h2 className="mt-4 text-4xl font-bold">

              {departments.reduce(
                (total, item) => total + item.volunteers,
                0
              )}

            </h2>

            <p className="mt-2 text-slate-500">

              Volunteers

            </p>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <FileText
              size={30}
              className="text-orange-600"
            />

            <h2 className="mt-4 text-4xl font-bold">

              {departments.reduce(
                (total, item) => total + item.complaints,
                0
              )}

            </h2>

            <p className="mt-2 text-slate-500">

              Complaints

            </p>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <Briefcase
              size={30}
              className="text-violet-600"
            />

            <h2 className="mt-4 text-4xl font-bold">

              92%

            </h2>

            <p className="mt-2 text-slate-500">

              Avg Resolution

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
                placeholder="Search department..."
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

        </div>        {/* Departments Table */}

        <div className="overflow-hidden rounded-3xl bg-white shadow-sm">

          <table className="w-full">

            <thead className="bg-slate-100">

              <tr>

                <th className="px-6 py-5 text-left">

                  Department

                </th>

                <th className="px-6 py-5 text-left">

                  Head

                </th>

                <th className="px-6 py-5 text-left">

                  Volunteers

                </th>

                <th className="px-6 py-5 text-left">

                  Complaints

                </th>

                <th className="px-6 py-5 text-left">

                  Resolution

                </th>

                <th className="px-6 py-5 text-center">

                  Actions

                </th>

              </tr>

            </thead>

            <tbody>

              {filteredDepartments.map((item) => (

                <tr
                  key={item.id}
                  className="border-b transition hover:bg-slate-50"
                >

                  <td className="px-6 py-5">

                    <div className="flex items-center gap-3">

                      <Building2
                        size={20}
                        className="text-blue-600"
                      />

                      <span className="font-semibold">

                        {item.name}

                      </span>

                    </div>

                  </td>

                  <td className="px-6 py-5">

                    {item.head}

                  </td>

                  <td className="px-6 py-5">

                    <div className="flex items-center gap-2">

                      <Users
                        size={18}
                        className="text-green-600"
                      />

                      <span className="font-semibold">

                        {item.volunteers}

                      </span>

                    </div>

                  </td>

                  <td className="px-6 py-5">

                    <span className="font-semibold text-blue-600">

                      {item.complaints}

                    </span>

                  </td>

                  <td className="px-6 py-5">

                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-600">

                      {item.resolution}

                    </span>

                  </td>

                  <td className="px-6 py-5">

                    <div className="flex justify-center gap-3">

                      <button
                        className="rounded-xl bg-yellow-500 p-3 text-white transition hover:bg-yellow-600"
                      >

                        <Pencil size={18} />

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

        {filteredDepartments.length === 0 && (

          <div className="rounded-3xl bg-white p-16 text-center shadow-sm">

            <Building2
              size={70}
              className="mx-auto text-slate-300"
            />

            <h2 className="mt-6 text-2xl font-bold">

              No Departments Found

            </h2>

            <p className="mt-3 text-slate-500">

              No departments match your search.

            </p>

          </div>

        )}

        {/* Summary Cards */}

        {filteredDepartments.length > 0 && (

          <div className="grid gap-6 md:grid-cols-3">

            <div className="rounded-3xl bg-blue-50 p-6">

              <h3 className="text-lg font-semibold text-blue-700">

                Total Departments

              </h3>

              <h2 className="mt-3 text-4xl font-bold text-blue-600">

                {departments.length}

              </h2>

            </div>

            <div className="rounded-3xl bg-green-50 p-6">

              <h3 className="text-lg font-semibold text-green-700">

                Total Volunteers

              </h3>

              <h2 className="mt-3 text-4xl font-bold text-green-600">

                {departments.reduce(
                  (total, item) => total + item.volunteers,
                  0
                )}

              </h2>

            </div>

            <div className="rounded-3xl bg-purple-50 p-6">

              <h3 className="text-lg font-semibold text-purple-700">

                Total Complaints

              </h3>

              <h2 className="mt-3 text-4xl font-bold text-purple-600">

                {departments.reduce(
                  (total, item) => total + item.complaints,
                  0
                )}

              </h2>

            </div>

          </div>

        )}

      </div>

    </DashboardLayout>

  );

};

export default Departments;