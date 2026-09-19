import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/common/DashboardLayout";
import { 
  FileText, Search, Filter, Eye, Clock, 
  CheckCircle2, AlertCircle, PlusCircle, ChevronRight
} from "lucide-react";
import { complaintService } from "@/services/complaintService";
import SearchInput from "@/components/common/SearchInput";
import Button from "@/components/common/Button";
import { useLanguage } from "@/context/LanguageContext";

const ComplaintHistory = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const data = await complaintService.getMyComplaints();
        setComplaints(data || []);
      } catch (err) {
        console.error("Failed to load complaint history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const filtered = complaints.filter((c) => {
    const matchesSearch = 
      (c.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.description || "").toLowerCase().includes(search.toLowerCase()) ||
      String(c.id).includes(search);
    
    if (statusFilter === "ALL") return matchesSearch;
    return matchesSearch && c.status === statusFilter;
  });

  return (
    <DashboardLayout role="citizen">
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18332B] tracking-tight">
              {t("complaintHistory.title", "My Grievance History")}
            </h1>
            <p className="text-xs text-[#65736D] mt-1">
              {t("complaintHistory.subtitle", "Track status, evidence verification, and legal guide notes for all submitted cases.")}
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate("/citizen/submit-complaint")}
            icon={PlusCircle}
          >
            {t("complaintHistory.newGrievanceBtn", "File New Grievance")}
          </Button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#E6E1D8] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch("")}
            placeholder={t("complaintHistory.searchPlaceholder", "Search complaints by title, ID, or description...")}
            className="w-full sm:w-80"
          />

          <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto">
            {[
              { id: "ALL", label: t("complaintHistory.filterAll", "All Statuses") },
              { id: "PENDING", label: t("complaintHistory.filterSubmitted", "Submitted") },
              { id: "IN_PROGRESS", label: t("complaintHistory.filterInProgress", "In Progress") },
              { id: "RESOLVED", label: t("complaintHistory.filterResolved", "Resolved") }
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                  statusFilter === st.id
                    ? "bg-[#163D32] text-white"
                    : "bg-[#F7F1E6] text-[#65736D] hover:text-[#18332B]"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Case Cards / Table */}
        {loading ? (
          <div className="py-16 text-center text-xs text-[#8B9690] rounded-3xl bg-[#FFFDF8] border border-[#E6E1D8]">
            {t("citizenDashboard.loadingGrievances", "Loading grievance records...")}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-3 rounded-3xl bg-[#FFFDF8] border border-[#E6E1D8]">
            <FileText className="mx-auto text-[#65736D]" size={36} />
            <p className="text-xs font-bold text-[#18332B]">{t("complaintHistory.noComplaintsTitle", "No matching grievances found.")}</p>
            <p className="text-[11px] text-[#65736D]">{t("complaintHistory.noComplaintsDesc", "Try clearing your search filters or file a new grievance.")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/citizen/complaint/${item.id}`)}
                className="p-5 rounded-2xl bg-[#FFFDF8] border border-[#E6E1D8] hover:border-[#163D32] shadow-sm hover:shadow-md transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#65736D]">
                      ARAM-2026-{String(item.id).replace("cmp-", "").padStart(6, "0")}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-[#DCEBDD] text-[#163D32]">
                      {String(item.status || "SUBMITTED").replace(/_/g, " ")}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-[#F7F1E6] text-[#65736D] border border-[#E6E1D8]">
                      {item.categoryDisplayName || item.category || "General Aid"}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#18332B]">{item.title || "Legal Aid Grievance"}</h3>
                  <p className="text-xs text-[#65736D] line-clamp-2 max-w-2xl">{item.description}</p>
                </div>

                <div className="flex items-center gap-4 shrink-0 self-end sm:self-center">
                  <div className="text-right">
                    <span className="block text-[10px] text-[#8B9690]">Date Filed</span>
                    <span className="text-xs font-bold text-[#18332B]">
                      {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  <ChevronRight size={18} className="text-[#8B9690]" />
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default ComplaintHistory;
