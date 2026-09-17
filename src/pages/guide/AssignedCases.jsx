import DashboardLayout from "@/components/common/DashboardLayout";
import { Search, Filter, Eye, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { volunteerService } from "@/services/volunteerService";
import { toast } from "sonner";
import SearchInput from "@/components/common/SearchInput";


const AssignedCases = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const data = await volunteerService.getAssignedCases();
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
    const id = item.id ? String(item.id) : "";
    const citizen = item.citizenName || item.userName || item.citizen?.name || "Citizen";
    const category = item.category || "General";
    return (
      id.toLowerCase().includes(search.toLowerCase()) ||
      citizen.toLowerCase().includes(search.toLowerCase()) ||
      category.toLowerCase().includes(search.toLowerCase())
    );
  });

  const getPriorityBadgeClass = (priority) => {
    const p = priority ? priority.toUpperCase() : "MEDIUM";
    if (p === "CRITICAL" || p === "HIGH") return "bg-red-50 text-red-600 border border-red-100";
    if (p === "MEDIUM") return "bg-amber-50 text-amber-650 border border-amber-100";
    return "bg-green-50 text-green-650 border border-green-100";
  };

  const getStatusBadgeClass = (status) => {
    const s = status ? status.toUpperCase() : "SUBMITTED";
    if (s === "RESOLVED") return "bg-emerald-50 text-emerald-600 border border-emerald-100";
    if (s === "HELPER_ASSIGNED" || s === "IN_PROGRESS" || s === "AI_ANALYZED" || s === "UNDER_REVIEW") {
      return "bg-indigo-50 text-indigo-600 border border-indigo-100";
    }
    return "bg-amber-50 text-amber-600 border border-amber-100";
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-[#18332B] tracking-tight">Assigned Cases</h1>
            <p className="mt-1 text-xs text-[#65736D]">View and manage all cases assigned to you for legal guidance.</p>
          </div>
          <button
            onClick={() => navigate("/guide/dashboard")}
            className="flex items-center gap-1.5 rounded-xl border border-[#E6E1D8] bg-[#FFFDF8] px-4 py-2 hover:bg-[#DCEBDD]/40 transition text-xs font-bold text-[#163D32] cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
        </div>

        {/* Search */}
        <div className="rounded-2xl bg-[#FFFDF8] p-5 shadow-sm border border-[#E6E1D8]">
          <div className="flex flex-col gap-4 lg:flex-row">
            <SearchInput
              placeholder="Search by ID, citizen name, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch("")}
              className="flex-1"
            />
            <button
              onClick={() => toast.success("Filters applied successfully")}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#E6E1D8] bg-[#F7F1E6]/60 px-5 hover:bg-[#DCEBDD]/50 transition cursor-pointer text-[#18332B] font-bold text-xs shrink-0"
            >
              <Filter size={14} />
              Filter List
            </button>
          </div>
        </div>


        {/* Table */}
        <div className="overflow-hidden rounded-2xl bg-[#FFFDF8] shadow-sm border border-[#E6E1D8]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-[#F7F1E6]/60 border-b border-[#E6E1D8] text-[#65736D] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Case ID</th>
                  <th className="px-6 py-4">Public User</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E1D8]">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center text-[#8B9690]">
                      <Loader2 className="animate-spin inline mr-2 text-[#163D32]" size={16} />
                      Loading assigned cases...
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center text-[#8B9690]">
                      No assigned complaints match your query.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F7F1E6]/40 transition">
                      <td className="px-6 py-4 font-bold text-[#163D32]">
                        {item.complaintCustomId || `ARAM-2026-TN-${String(item.id).padStart(6, "0")}`}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#18332B]">
                        {item.citizenName || item.userName || item.citizen?.name || "Citizen User"}
                      </td>
                      <td className="px-6 py-4 text-[#65736D] font-medium">
                        {item.categoryDisplayName || item.categoryLabel || item.category || "General Triage"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${getPriorityBadgeClass(item.priority)}`}>
                          {item.priority || "MEDIUM"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${getStatusBadgeClass(item.status)}`}>
                          {String(item.status).replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => navigate(`/guide/complaint/${item.id}`)}
                            className="flex items-center gap-1 rounded-xl bg-[#163D32] px-3 py-1.5 text-white hover:bg-[#1F5948] transition cursor-pointer font-bold text-[10px]"
                          >
                            <Eye size={12} />
                            View
                          </button>
                          <button
                            onClick={() => navigate(`/guide/case-review/${item.id}`)}
                            className="flex items-center gap-1 rounded-xl bg-[#1F5948] px-3 py-1.5 text-white hover:bg-[#163D32] transition cursor-pointer font-bold text-[10px]"
                          >
                            <CheckCircle2 size={12} />
                            Review
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Footer */}
        <div className="rounded-2xl bg-[#163D32] p-6 text-white border border-[#1F5948] shadow-md">
          <h2 className="text-base font-bold tracking-tight text-[#FFFDF8]">Volunteer Case Summary</h2>
          <div className="mt-3 text-xs text-[#DCEBDD] space-y-1.5 max-w-md">
            <div className="flex justify-between border-b border-white/10 pb-1">
              <span>Total Assigned:</span>
              <strong className="text-white">{cases.length}</strong>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-1">
              <span>Pending Resolution:</span>
              <strong className="text-white">{cases.filter(c => c.status !== "RESOLVED").length}</strong>
            </div>
            <div className="flex justify-between">
              <span>Successfully Resolved:</span>
              <strong className="text-white">{cases.filter(c => c.status === "RESOLVED").length}</strong>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AssignedCases;