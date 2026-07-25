import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  UserPlus,
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const users = [
  {
    id: "USR001",
    name: "Sharon Robert",
    email: "sharon@gmail.com",
    role: "Citizen",
    status: "Active",
  },
  {
    id: "USR002",
    name: "Rahul Kumar",
    email: "rahul@gmail.com",
    role: "Legal Guide",
    status: "Active",
  },
  {
    id: "USR003",
    name: "Priya",
    email: "priya@gmail.com",
    role: "Public User",
    status: "Inactive",
  },
  {
    id: "USR004",
    name: "Arun",
    email: "arun@gmail.com",
    role: "Admin",
    status: "Active",
  },
];

const ManageUsers = () => {

  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.role.toLowerCase().includes(search.toLowerCase())
  );

  return (

    <DashboardLayout>

      <div className="space-y-8">

        {/* Header */}

        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-4xl font-bold">

              Manage Users

            </h1>

            <p className="mt-2 text-slate-500">

              View, edit and manage all registered users.

            </p>

          </div>

          <button
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700"
          >

            <UserPlus size={18} />

            Add User

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

              {users.length}

            </h2>

            <p className="mt-2 text-slate-500">

              Total Users

            </p>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <UserCheck
              size={30}
              className="text-green-600"
            />

            <h2 className="mt-4 text-4xl font-bold">

              {users.filter((u) => u.status === "Active").length}

            </h2>

            <p className="mt-2 text-slate-500">

              Active Users

            </p>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <UserX
              size={30}
              className="text-red-600"
            />

            <h2 className="mt-4 text-4xl font-bold">

              {users.filter((u) => u.status === "Inactive").length}

            </h2>

            <p className="mt-2 text-slate-500">

              Inactive Users

            </p>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <ShieldCheck
              size={30}
              className="text-violet-600"
            />

            <h2 className="mt-4 text-4xl font-bold">

              {users.filter((u) => u.role === "Admin").length}

            </h2>

            <p className="mt-2 text-slate-500">

              Administrators

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
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-14 w-full rounded-xl border border-slate-300 pl-12 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

            </div>

            <button
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-6 transition hover:bg-slate-100"
            >

              <Filter size={18} />

              Filter

            </button>

          </div>

        </div>        {/* Users Table */}

        <div className="overflow-hidden rounded-3xl bg-white shadow-sm">

          <table className="w-full">

            <thead className="bg-slate-100">

              <tr>

                <th className="px-6 py-5 text-left">

                  User ID

                </th>

                <th className="px-6 py-5 text-left">

                  Name

                </th>

                <th className="px-6 py-5 text-left">

                  Email

                </th>

                <th className="px-6 py-5 text-left">

                  Role

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

              {filteredUsers.map((user) => (

                <tr
                  key={user.id}
                  className="border-b transition hover:bg-slate-50"
                >

                  <td className="px-6 py-5 font-semibold">

                    {user.id}

                  </td>

                  <td className="px-6 py-5">

                    {user.name}

                  </td>

                  <td className="px-6 py-5">

                    {user.email}

                  </td>

                  <td className="px-6 py-5">

                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        user.role === "Admin"
                          ? "bg-violet-100 text-violet-600"
                          : user.role === "Legal Guide"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >

                      {user.role}

                    </span>

                  </td>

                  <td className="px-6 py-5">

                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        user.status === "Active"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >

                      {user.status}

                    </span>

                  </td>

                  <td className="px-6 py-5">

                    <div className="flex justify-center gap-3">

                      <button
                        onClick={() => navigate("/admin/user-details")}
                        className="rounded-xl bg-blue-600 p-3 text-white transition hover:bg-blue-700"
                      >

                        <Eye size={18} />

                      </button>

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

        {filteredUsers.length === 0 && (

          <div className="rounded-3xl bg-white p-16 text-center shadow-sm">

            <Users
              size={70}
              className="mx-auto text-slate-300"
            />

            <h2 className="mt-6 text-2xl font-bold">

              No Users Found

            </h2>

            <p className="mt-3 text-slate-500">

              No users match your search.

            </p>

          </div>

        )}

        {/* Summary */}

        {filteredUsers.length > 0 && (

          <div className="grid gap-6 md:grid-cols-3">

            <div className="rounded-3xl bg-blue-50 p-6">

              <h3 className="text-lg font-semibold text-blue-700">

                Total Users

              </h3>

              <h2 className="mt-3 text-4xl font-bold text-blue-600">

                {users.length}

              </h2>

            </div>

            <div className="rounded-3xl bg-green-50 p-6">

              <h3 className="text-lg font-semibold text-green-700">

                Active Users

              </h3>

              <h2 className="mt-3 text-4xl font-bold text-green-600">

                {users.filter((user) => user.status === "Active").length}

              </h2>

            </div>

            <div className="rounded-3xl bg-red-50 p-6">

              <h3 className="text-lg font-semibold text-red-700">

                Inactive Users

              </h3>

              <h2 className="mt-3 text-4xl font-bold text-red-600">

                {users.filter((user) => user.status === "Inactive").length}

              </h2>

            </div>

          </div>

        )}

      </div>

    </DashboardLayout>

  );

};

export default ManageUsers;