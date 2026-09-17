import DashboardLayout from "@/components/common/DashboardLayout";
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
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminService } from "@/services/adminService";
import SearchInput from "@/components/common/SearchInput";
import { useAuth } from "@/context/AuthContext";


const ManageComplaints = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const adminDistrict = user?.district || "GLOBAL";
  const [search, setSearch] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    async function loadComplaints() {
      try {
        const list = await adminService.getComplaints();
        const filtered = adminDistrict && adminDistrict !== "GLOBAL"
          ? list.filter(c => c.district && c.district.toLowerCase() === adminDistrict.toLowerCase())
          : list;
        setComplaints(filtered || []);
      } catch (err) {
        console.error("Failed to load complaints:", err);
      } finally {
        setLoading(false);
      }
    }
    loadComplaints();
  }, [adminDistrict]);

  const filteredComplaints = complaints.filter((item) => {
    const id = item.id ? String(item.id) : "";
    const citizen = item.citizenName || item.userName || "Citizen";
    const category = item.categoryDisplayName || item.category || "General";
    
    const textMatch = 
      id.toLowerCase().includes(search.toLowerCase()) ||
      citizen.toLowerCase().includes(search.toLowerCase()) ||
      category.toLowerCase().includes(search.toLowerCase());
      
    if (!textMatch) return false;
    
    if (statusFilter === "PENDING") {
      return item.status === "PENDING" || item.status === "SUBMITTED";
    }
    if (statusFilter === "RESOLVED") {
      return item.status === "RESOLVED";
    }
    if (statusFilter === "HIGH_PRIORITY") {
      return item.priority === "HIGH" || item.priority === "CRITICAL";
    }
    
    return true;
  });

  const totalCount = complaints.length;
  const pendingCount = complaints.filter(c => c.status === "PENDING" || c.status === "SUBMITTED").length;
  const resolvedCount = complaints.filter(c => c.status === "RESOLVED").length;
  const highPriorityCount = complaints.filter(c => c.priority === "HIGH" || c.priority === "CRITICAL").length;

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

          <div 
            onClick={() => setStatusFilter("ALL")}
            className={`rounded-3xl bg-white p-6 shadow-sm cursor-pointer border-2 transition ${
              statusFilter === "ALL" ? "border-blue-500 ring-2 ring-blue-50" : "border-transparent"
            }`}
          >

            <FileText
              size={30}
              className="text-blue-600"
            />

            <h2 className="mt-4 text-4xl font-bold">

              {totalCount}

            </h2>

            <p className="mt-2 text-slate-505 font-medium">

              Total Complaints

            </p>

          </div>

          <div 
            onClick={() => setStatusFilter("PENDING")}
            className={`rounded-3xl bg-white p-6 shadow-sm cursor-pointer border-2 transition ${
              statusFilter === "PENDING" ? "border-orange-500 ring-2 ring-orange-50" : "border-transparent"
            }`}
          >

            <Clock3
              size={30}
              className="text-orange-500"
            />

            <h2 className="mt-4 text-4xl font-bold">

              {pendingCount}

            </h2>

            <p className="mt-2 text-slate-505 font-medium">

              Pending

            </p>

          </div>

          <div 
            onClick={() => setStatusFilter("RESOLVED")}
            className={`rounded-3xl bg-white p-6 shadow-sm cursor-pointer border-2 transition ${
              statusFilter === "RESOLVED" ? "border-green-500 ring-2 ring-green-50" : "border-transparent"
            }`}
          >

            <CheckCircle2
              size={30}
              className="text-green-600"
            />

            <h2 className="mt-4 text-4xl font-bold">

              {resolvedCount}

            </h2>

            <p className="mt-2 text-slate-505 font-medium">

              Resolved

            </p>

          </div>

          <div 
            onClick={() => setStatusFilter("HIGH_PRIORITY")}
            className={`rounded-3xl bg-white p-6 shadow-sm cursor-pointer border-2 transition ${
              statusFilter === "HIGH_PRIORITY" ? "border-red-500 ring-2 ring-red-50" : "border-transparent"
            }`}
          >

            <AlertTriangle
              size={30}
              className="text-red-600"
            />

            <h2 className="mt-4 text-4xl font-bold">

              {highPriorityCount}

            </h2>

            <p className="mt-2 text-slate-505 font-medium">

              High Priority

            </p>

          </div>

        </div>

        {/* Search */}
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row">
            <SearchInput
              placeholder="Search complaints..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch("")}
              className="flex-1"
            />
            <button className="flex items-center gap-2 rounded-xl border border-slate-300 px-6 hover:bg-slate-100 cursor-pointer shrink-0">
              <Filter size={18} />
              Filter
            </button>
          </div>
        </div>


        {/* Complaints Table */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-5 text-left">ID</th>
                <th className="px-6 py-5 text-left">Public User</th>
                <th className="px-6 py-5 text-left">Category</th>
                <th className="px-6 py-5 text-left">Department</th>
                <th className="px-6 py-5 text-left">Legal Guide</th>
                <th className="px-6 py-5 text-left">Priority</th>
                <th className="px-6 py-5 text-left">Status</th>
                <th className="px-6 py-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-400">
                    Loading complaints database...
                  </td>
                </tr>
              ) : filteredComplaints.map((item) => {
                const id = `CMP${item.id}`;
                const citizen = item.citizenName || item.userName || "Citizen";
                const category = item.categoryDisplayName || item.category || "General";
                const department = item.authority || item.department || "Triage Pending";
                const volunteer = item.assignedHelperName || item.assignedHelper?.name || "Not Assigned";
                const priority = item.priority ? item.priority.toUpperCase() : "MEDIUM";
                const status = item.status ? item.status.toUpperCase() : "SUBMITTED";

                const priorityClass = priority === "CRITICAL" || priority === "HIGH"
                  ? "bg-red-100 text-red-600"
                  : priority === "MEDIUM"
                  ? "bg-yellow-100 text-yellow-650"
                  : "bg-green-100 text-green-650";

                const statusClass = status === "PENDING" || status === "SUBMITTED"
                  ? "bg-orange-100 text-orange-650"
                  : status === "RESOLVED"
                  ? "bg-green-100 text-green-650"
                  : "bg-blue-100 text-blue-600";

                return (
                  <tr
                    key={item.id}
                    className="border-b transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-5 font-semibold text-slate-800">
                      {id}
                    </td>
                    <td className="px-6 py-5">
                      {citizen}
                    </td>
                    <td className="px-6 py-5">
                      {category}
                    </td>
                    <td className="px-6 py-5">
                      {department}
                    </td>
                    <td className="px-6 py-5">
                      {volunteer}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityClass}`}>
                        {priority}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>
                        {status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-3">
                        <button
                          title="View Details"
                          onClick={() => navigate(`/admin/complaint/${item.id}`)}
                          className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition duration-150 shadow-sm cursor-pointer"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          title="Assign Legal Guide"
                          onClick={() => {
                            import("sonner").then(({ toast }) => toast.info(`Assigning Legal Guide to complaint ${id}`));
                          }}
                          className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition duration-150 shadow-sm cursor-pointer"
                        >
                          <UserCheck size={18} />
                        </button>
                        <button
                          title="Delete Complaint"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to remove complaint ${id}?`)) {
                              setComplaints(prev => prev.filter(c => c.id !== item.id));
                              import("sonner").then(({ toast }) => toast.success(`Complaint ${id} removed.`));
                            }
                          }}
                          className="rounded-xl border border-red-100 bg-red-50/30 p-2.5 text-red-600 hover:bg-red-50 hover:text-red-750 transition duration-150 shadow-sm cursor-pointer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}


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

                {complaints.length}

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