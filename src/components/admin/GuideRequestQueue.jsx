import React from "react";
import { Check, X, Shield, Clock } from "lucide-react";
import { regionalAdminService } from "@/services/regionalAdminService";
import { toast } from "sonner";

export default function GuideRequestQueue({ requests = [], onReload }) {
  const handleApprove = async (id) => {
    try {
      await regionalAdminService.approveGuideRequest(id);
      toast.success("Guide application approved!");
      if (onReload) onReload();
    } catch (err) {
      toast.error("Failed to approve guide request.");
    }
  };

  const handleReject = async (id) => {
    try {
      await regionalAdminService.rejectGuideRequest(id);
      toast.info("Guide application rejected.");
      if (onReload) onReload();
    } catch (err) {
      toast.error("Failed to reject guide request.");
    }
  };

  return (
    <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-[#163D32] text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
          <Shield size={16} className="text-[#1F5948]" /> Pending Legal Guide Applications
        </h3>
        <p className="text-[#65736D] text-xs mt-0.5 font-medium">
          Verify credentials and approve legal aid volunteer certifications
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#E6E1D8] text-[#65736D] uppercase text-[10px] font-black tracking-wider bg-[#F7F1E6]/40">
              <th className="py-3 px-4">Applicant</th>
              <th className="py-3 px-4">District</th>
              <th className="py-3 px-4">Qualifications / Experience</th>
              <th className="py-3 px-4">Languages</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6E1D8] text-[#18332B]">
            {requests.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-[#65736D] font-medium">
                  No pending guide verification requests.
                </td>
              </tr>
            ) : (
              requests.map((r) => (
                <tr key={r.id} className="hover:bg-[#F7F1E6]/50 transition duration-100">
                  <td className="py-3.5 px-4 font-bold text-[#18332B]">
                    {r.name || r.userName || "Applicant"}
                  </td>
                  <td className="py-3.5 px-4 uppercase text-[#18332B] font-semibold">
                    {r.district}
                  </td>
                  <td className="py-3.5 px-4 text-[#65736D] font-medium">
                    {r.qualification || r.experienceLevel || "Legal Aid Advocate"}
                  </td>
                  <td className="py-3.5 px-4 text-[#18332B] font-medium">
                    {r.languagesKnown || "Tamil, English"}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#E8C978]/30 text-[#C58A25] border border-[#D6B45E]">
                      {r.status || "PENDING"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleApprove(r.id)}
                      className="px-3 py-1 bg-[#163D32] hover:bg-[#1F5948] text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(r.id)}
                      className="px-3 py-1 bg-white hover:bg-[#F4DDE2] text-[#C94B4B] border border-[#E4C8CF] font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      Reject
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
}
