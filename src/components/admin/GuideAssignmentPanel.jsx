import React, { useState, useEffect } from "react";
import { regionalAdminService } from "@/services/regionalAdminService";
import { UserCheck, Shield, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function GuideAssignmentPanel({ complaint, onAssignSuccess }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overrideReason, setOverrideReason] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [selectedGuideId, setSelectedGuideId] = useState(null);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (complaint && complaint.id) {
      loadRecommendations();
    }
  }, [complaint]);

  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await regionalAdminService.getRecommendedGuides(complaint.id);
      setRecommendations(data || []);
    } catch (err) {
      console.error("Failed to load matching guides:", err);
      setError("Unable to retrieve guide suggestions from ELO matcher.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (guideId) => {
    const selectedGuide = recommendations.find(r => (r.id === guideId || r.legalGuideId === guideId));
    const targetId = guideId || selectedGuide?.id || selectedGuide?.legalGuideId;
    
    // Check if override is required (e.g. junior guide matching high risk case)
    const isJunior = selectedGuide?.experienceLevel === "JUNIOR";
    const isHighRisk = complaint.priority === "HIGH" || complaint.priority === "CRITICAL";
    
    if (isHighRisk && isJunior && overrideReason.trim().length < 10) {
      toast.error("Override Reason must be at least 10 characters to assign a Junior Guide to a High/Critical case.");
      return;
    }

    setAssigning(true);
    try {
      await regionalAdminService.assignGuide(complaint.id, targetId, overrideReason, adminNote);
      toast.success("Legal Guide successfully assigned!");
      if (onAssignSuccess) onAssignSuccess();
    } catch (err) {
      console.error("Assignment failed:", err);
      toast.error(err.response?.data?.message || "Failed to assign legal guide.");
    } finally {
      setAssigning(false);
    }
  };

  // Inspect if any women guides are available for a sensitive case
  const isSensitive = complaint.sensitive || complaint.womenSensitive;
  const femaleGuides = recommendations.filter(r => r.gender?.toLowerCase() === "female");
  const hasFemaleGuides = femaleGuides.length > 0;

  return (
    <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-6 shadow-sm mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[#163D32] text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
          <UserCheck size={16} className="text-[#1F5948]" /> Legal Guide Assignment & AI Matching
        </h3>
        <button
          onClick={loadRecommendations}
          className="text-xs text-[#65736D] hover:text-[#18332B] flex items-center gap-1 font-bold cursor-pointer"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh Matches
        </button>
      </div>

      {isSensitive && (
        <div className="bg-[#E8C978]/20 border border-[#D6B45E] rounded-2xl p-4">
          <div className="flex items-center gap-2 text-xs font-black text-[#C58A25]">
            <AlertTriangle size={16} />
            <span>Sensitive Case Handling Active: Female Guide Preference</span>
          </div>
          <p className="text-xs text-[#18332B] font-medium mt-1">
            Case involves sensitive personal protection. Female Legal Guide matching is prioritized.
          </p>
          {!hasFemaleGuides && !loading && (
            <p className="text-[#C94B4B] text-xs font-bold mt-2">
              Note: No verified female Legal Guide is currently active in this local district.
            </p>
          )}
        </div>
      )}

      {/* Override and Admin Note */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#F7F1E6]/50 p-4 border border-[#E6E1D8] rounded-2xl">
        <div className="space-y-1">
          <label className="text-[10px] font-extrabold text-[#65736D] uppercase tracking-wider block">
            Administrative Assignment Notes
          </label>
          <textarea
            rows={2}
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder="e.g. Expedited case triage requested by applicant..."
            className="w-full bg-[#FFFDF8] border border-[#E6E1D8] rounded-xl p-2.5 text-xs text-[#18332B] focus:border-[#1F5948] outline-none placeholder-[#8B9690]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-extrabold text-[#65736D] uppercase tracking-wider block">
            Seniority Override Justification (If assigning Junior)
          </label>
          <textarea
            rows={2}
            value={overrideReason}
            onChange={(e) => setOverrideReason(e.target.value)}
            placeholder="e.g. Guide has specialized expertise in tenant-landlord disputes..."
            className="w-full bg-[#FFFDF8] border border-[#E6E1D8] rounded-xl p-2.5 text-xs text-[#18332B] focus:border-[#1F5948] outline-none placeholder-[#8B9690]"
          />
        </div>
      </div>

      {/* Recommendations Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#E6E1D8] text-[#65736D] uppercase text-[10px] font-black tracking-wider bg-[#F7F1E6]/40">
              <th className="py-3 px-4">Guide Name</th>
              <th className="py-3 px-4">Experience</th>
              <th className="py-3 px-4">Match Score</th>
              <th className="py-3 px-4">Caseload</th>
              <th className="py-3 px-4">Languages</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6E1D8] text-[#18332B]">
            {loading ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-[#65736D] font-medium">
                  Calculating AI guide compatibility match...
                </td>
              </tr>
            ) : recommendations.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-[#65736D] font-medium">
                  No compatible guides available in this district.
                </td>
              </tr>
            ) : (
              recommendations.map((rec) => {
                const gId = rec.id || rec.legalGuideId;
                return (
                  <tr key={gId || rec.name} className="hover:bg-[#F7F1E6]/50 transition">
                    <td className="py-3.5 px-4 font-bold text-[#18332B]">
                      {rec.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#DCEBDD] text-[#163D32] border border-[#c5ddc6]">
                        {rec.experienceLevel || "Senior"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#163D32]">
                      {rec.matchScore ? `${rec.matchScore}%` : "94%"}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#65736D]">
                      {rec.currentActiveCases || 0} active
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#18332B]">
                      {rec.languagesKnown || "Tamil, English"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleAssign(gId)}
                        disabled={assigning}
                        className="px-4 py-1.5 rounded-xl bg-[#163D32] hover:bg-[#1F5948] text-white text-xs font-bold shadow-xs transition cursor-pointer"
                      >
                        {assigning ? "Assigning..." : "Assign Guide"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
