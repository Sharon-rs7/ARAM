import React, { useState } from "react";
import { Eye, CheckCircle2, UserPlus, Filter, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Badge from "@/components/common/Badge";

const ComplaintQueue = ({ complaints = [], onAssignGuide }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("ALL");

  const filtered = complaints.filter(c => {
    if (filter === "ALL") return true;
    if (filter === "PENDING") {
      return ["PENDING", "SUBMITTED", "AI_ANALYZED", "AUTHORITY_RECOMMENDED"].includes(c.status);
    }
    if (filter === "IN_PROGRESS") {
      return ["IN_PROGRESS", "HELPER_ASSIGNED"].includes(c.status);
    }
    if (filter === "RESOLVED") {
      return ["RESOLVED", "RESOLVED_BY_GUIDE", "CLOSED"].includes(c.status);
    }
    return c.status === filter;
  });

  return (
    <div className="rounded-2xl bg-[#FFFDF8] border border-[#E6E1D8] shadow-sm overflow-hidden">
      <div className="p-5 border-b border-[#E6E1D8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#163D32]">
            Regional Grievance Queue ({filtered.length})
          </h3>
          <p className="text-xs text-[#65736D] mt-0.5">Live cases filed across regional taluks and departments.</p>
        </div>

        {/* Filter pills */}
        <div className="flex gap-1.5 overflow-x-auto">
          {["ALL", "PENDING", "IN_PROGRESS", "RESOLVED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
                filter === f ? "bg-[#163D32] text-white shadow-xs" : "bg-[#F7F1E6] text-[#65736D] hover:text-[#18332B] hover:bg-[#E6E1D8]"
              }`}
            >
              {f.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-[#F7F1E6]/60 border-b border-[#E6E1D8] text-[#65736D] font-bold uppercase tracking-wider">
              <th className="px-5 py-3.5">ID</th>
              <th className="px-5 py-3.5">Case Title / Citizen</th>
              <th className="px-5 py-3.5">Category</th>
              <th className="px-5 py-3.5">Priority</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6E1D8]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-12 text-center text-[#8B9690]">
                  No complaints found in this queue.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#F7F1E6]/40 transition">
                  <td className="px-5 py-3.5 font-bold text-[#18332B]">
                    {item.complaintCustomId || `ARAM-2026-${String(item.id).padStart(6, "0")}`}
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-bold text-[#163D32] max-w-xs truncate">{item.title || "Grievance Record"}</p>
                    <p className="text-[11px] text-[#65736D]">{item.citizenName || item.userName || "Citizen"}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#DCEBDD] text-[#163D32] border border-[#c5ddc6]">
                      {item.categoryLabel || item.categoryDisplayName || item.category || "General Aid"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      item.priority === "HIGH" || item.priority === "CRITICAL" ? "bg-red-100 text-red-700" : "bg-[#F7F1E6] text-[#65736D]"
                    }`}>
                      {item.priority || "MEDIUM"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                      item.status === "RESOLVED" || item.status === "RESOLVED_BY_GUIDE"
                        ? "bg-[#DCEBDD] text-[#163D32] border-[#c5ddc6]"
                        : item.status === "IN_PROGRESS" || item.status === "HELPER_ASSIGNED"
                        ? "bg-blue-50 text-blue-900 border-blue-200"
                        : "bg-[#E8C978]/30 text-[#C58A25] border-[#D6B45E]"
                    }`}>
                      {String(item.status || "SUBMITTED").replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <button
                      onClick={() => navigate(`/admin/complaints/${item.id}`)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#163D32] text-white hover:bg-[#1F5948] transition text-[11px] font-bold cursor-pointer shadow-2xs"
                    >
                      Inspect Case
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComplaintQueue;
