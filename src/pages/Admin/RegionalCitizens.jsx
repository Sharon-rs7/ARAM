import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/common/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { regionalAdminService } from "@/services/regionalAdminService";
import DistrictOverview from "@/components/admin/DistrictOverview";
import CitizenDirectory from "@/components/admin/CitizenDirectory";
import { Users, RefreshCw } from "lucide-react";

export default function RegionalCitizens() {
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuth();
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const district = user?.district || storedUser.district || "Coimbatore";

  useEffect(() => {
    loadCitizens();
  }, [district]);

  const loadCitizens = async () => {
    setLoading(true);
    try {
      const data = await regionalAdminService.getCitizens(district);
      setCitizens(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch citizens listing.");
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
                <Users size={20} />
              </div>
              Regional Citizen Registry
            </h1>
            <p className="text-xs text-[#65736D] font-medium mt-1">
              Registered citizens in <strong className="text-[#163D32]">{district}</strong> jurisdiction
            </p>
          </div>
          
          <button
            onClick={loadCitizens}
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
            Loading citizens directory...
          </div>
        ) : (
          <CitizenDirectory citizens={citizens} />
        )}
      </div>
    </DashboardLayout>
  );
}
