import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/common/DashboardLayout";
import { regionalAdminService } from "@/services/regionalAdminService";
import DistrictOverview from "@/components/admin/DistrictOverview";
import ComplaintQueue from "@/components/admin/ComplaintQueue";
import { useAuth } from "@/context/AuthContext";
import { FileText, RefreshCw, MapPin } from "lucide-react";

export default function RegionalComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuth();
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const district = user?.district || storedUser.district || "Coimbatore";

  useEffect(() => {
    loadComplaints();
  }, [district]);

  const loadComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await regionalAdminService.getComplaints(district);
      setComplaints(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch regional complaints list.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#1F5948] font-black uppercase tracking-wider mb-1">
              <span className="flex items-center gap-1 bg-[#DCEBDD] px-3 py-1 rounded-full border border-[#c5ddc6]">
                <MapPin size={12} /> {district} Jurisdiction
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18332B] tracking-tight">
              Manage Regional Grievances
            </h1>
            <p className="text-xs text-[#65736D] mt-1 font-medium">
              Monitor, triage, and assign legal guides for citizen cases in {district}.
            </p>
          </div>

          <button
            type="button"
            onClick={loadComplaints}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E6E1D8] text-xs font-bold text-[#18332B] hover:bg-[#F7F1E6] rounded-xl shadow-xs transition cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Live Queue
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-[#F4DDE2] border border-[#E4C8CF] text-xs font-bold text-[#C94B4B]">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-xs font-bold text-[#65736D] bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl shadow-sm">
            Loading regional grievance queue...
          </div>
        ) : (
          <ComplaintQueue complaints={complaints} />
        )}
      </div>
    </DashboardLayout>
  );
}
