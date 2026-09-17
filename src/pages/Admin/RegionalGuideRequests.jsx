import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/common/DashboardLayout";
import { regionalAdminService } from "@/services/regionalAdminService";
import DistrictOverview from "@/components/admin/DistrictOverview";
import GuideRequestQueue from "@/components/admin/GuideRequestQueue";
import { UserCheck, RefreshCw } from "lucide-react";

export default function RegionalGuideRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const district = user.district || "Chennai";

  useEffect(() => {
    loadRequests();
  }, [district]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await regionalAdminService.getGuideRequests(district);
      setRequests(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch guide onboarding applications.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#163D32] tracking-tight flex items-center gap-2.5">
              <div className="p-2 bg-[#DCEBDD] text-[#163D32] rounded-xl">
                <UserCheck size={20} />
              </div>
              Legal Guide Verification Queue
            </h1>
            <p className="text-xs text-[#65736D] font-medium mt-1">
              Volunteer Legal Guide onboarding and verification requests in <strong className="text-[#163D32]">{district}</strong>
            </p>
          </div>
          
          <button
            onClick={loadRequests}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E6E1D8] text-xs font-bold text-[#18332B] hover:bg-[#F7F1E6] rounded-xl shadow-xs transition cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        <DistrictOverview district={district} />
        {error && <div className="p-4 rounded-xl bg-[#F4DDE2] border border-[#E4C8CF] text-xs font-bold text-[#C94B4B]">{error}</div>}
        
        {loading ? (
          <div className="p-12 text-center text-xs font-bold text-[#65736D] bg-[#FFFDF8] border border-[#E6E1D8] rounded-2xl shadow-sm">
            Loading guide applications...
          </div>
        ) : (
          <GuideRequestQueue requests={requests} onReload={loadRequests} />
        )}
      </div>
    </DashboardLayout>
  );
}
