import DashboardLayout from "@/components/layout/DashboardLayout";
import { Search, Filter, Eye, CheckCircle2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { volunteerService } from "../../services/volunteerService";
import { toast } from "sonner";

const AssignedCases = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const data = await volunteerService.getAssignedCases();
        // map backend structure if different, or fallback
        setCases(data || []);
      } catch (err) {
        console.error("Failed to load assigned cases:", err);
        toast.error("Failed to fetch assigned cases from database.");
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  const filteredData = cases.filter((item) => {
    const id = item.id || "";
    const citizen = item.citizenName || item.citizen?.name || "Citizen";
    const category = item.category || "General";
    return (
      id.toLowerCase().includes(search.toLowerCase()) ||
      citizen.toLowerCase().includes(search.toLowerCase()) ||
      category.toLowerCase().includes(search.toLowerCase())
    );
  });

  const getPriorityBadgeClass = (priority) => {
    const p = priority ? priority.toUpperCase() : "MEDIUM";
    if (p === "CRITICAL" || p === "HIGH") return "bg-red-55 text-red-650";
    if (p === "MEDIUM") return "bg-yellow-55 text-yellow-650";
    return "bg-green-55 text-green-650";
  };

  const getStatusBadgeClass = (status) => {
    const s = status ? status.toUpperCase() : "PENDING";
    if (s === "PENDING") return "bg-red-50 text-red-600";
    if (s === "UNDER_REVIEW" || s === "IN_PROGRESS") return "bg-blue-50 text-blue-600";
    return "bg-green-50 text-green-600";
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Assigned Cases</h1>
            <p className="mt-2 text-slate-500">View and manage all cases assigned to you.</p>
          </div>
          <button
            onClick={() => navigate("/volunteer/dashboard")}
            className="rounded-xl border border-slate-350 px-6 py-3 hover:bg-slate-50 transition font-medium cursor-pointer"
          >
            Dashboard
          </button>
        </div>

        {/* Search */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search cases..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-14 w-full rounded-xl border border-slate-300 pl-12 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-slate-800"
              />
            </div>

            <button
              onClick={() => toast.info("Filter sidebar option coming soon.")}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-350 px-6 hover:bg-slate-50 transition cursor-pointer text-slate-700 font-semibold"
            >
              <Filter size={18} />
              Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm border border-slate-100">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b text-slate-650 font-semibold">
                <th className="px-6 py-4">Case ID</th>
                <th className="px-6 py-4">Citizen</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-slate-400">
                    <Loader2 className="animate-spin inline mr-2" />
                    Loading cases...
                  </td>
                </tr>
              ) : filteredData.map((item) => (
                <tr key={item.id} className="border-b hover:bg-slate-50 transition">
                  <td className="px-6 py-5 font-semibold text-slate-850">{item.id}</td>
                  <td className="px-6 py-5 text-slate-600">
                    {item.citizenName || item.citizen?.name || "Citizen User"}
                  </td>
                  <td className="px-6 py-5 text-slate-600">{item.category}</td>
                  <td className="px-6 py-5">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getPriorityBadgeClass(item.priority)}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => navigate(`/volunteer/complaint/${item.id}`)}
                        className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 cursor-pointer font-semibold text-sm"
                      >
                        <Eye size={16} />
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/volunteer/case-review/${item.id}`)}
                        className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-white transition hover:bg-green-700 cursor-pointer font-semibold text-sm"
                      >
                        <CheckCircle2 size={16} />
                        Review
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && filteredData.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-slate-400">
                    No assigned complaints match your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
          <h2 className="text-2xl font-bold">Volunteer Case Summary</h2>
          <p className="mt-4 leading-relaxed text-blue-105 text-sm space-y-1">
            <span>Total Assigned: <strong>{cases.length}</strong></span>
            <br />
            <span>Pending Resolution: <strong>{cases.filter(c => c.status !== "RESOLVED").length}</strong></span>
            <br />
            <span>Successfully Resolved: <strong>{cases.filter(c => c.status === "RESOLVED").length}</strong></span>
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AssignedCases;