import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/common/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { regionalAdminService } from "@/services/regionalAdminService";
import DistrictOverview from "@/components/admin/DistrictOverview";
import RegionalCharts from "@/components/admin/RegionalCharts";
import { BarChart3, Calendar, RefreshCw } from "lucide-react";

export default function RegionalAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("30d");

  const { user } = useAuth();
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const district = user?.district || storedUser.district || "Coimbatore";

  useEffect(() => {
    loadAnalytics();
  }, [district, timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await regionalAdminService.getAnalytics(district, timeRange);
      setAnalytics(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch analytics datasets.");
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
                <BarChart3 size={20} />
              </div>
              Regional Legal Analytics & Metrics
            </h1>
            <p className="text-xs text-[#65736D] font-medium mt-1">
              District: <strong className="text-[#163D32]">{district}</strong> • Real-time legal case distribution & performance metrics
            </p>
          </div>
          
          <button
            onClick={loadAnalytics}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E6E1D8] text-xs font-bold text-[#18332B] hover:bg-[#F7F1E6] rounded-xl shadow-xs transition cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Data
          </button>
        </div>

        <DistrictOverview district={district} />
        
        {/* Time Range Filter Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#FFFDF8] border border-[#E6E1D8] rounded-2xl p-4 shadow-sm">
          <span className="text-[#163D32] text-xs font-extrabold uppercase tracking-wider flex items-center gap-2">
            <Calendar size={14} className="text-[#1F5948]" /> Analytics Interval
          </span>
          <div className="flex gap-2 text-xs">
            {["7d", "30d", "90d", "6m", "1y"].map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  timeRange === r 
                    ? "bg-[#163D32] text-white shadow-xs" 
                    : "bg-white text-[#65736D] hover:text-[#18332B] hover:bg-[#F7F1E6] border border-[#E6E1D8]"
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs font-bold text-[#65736D] bg-[#FFFDF8] border border-[#E6E1D8] rounded-2xl shadow-sm">
            Loading regional analytics datasets...
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-[#F4DDE2] border border-[#E4C8CF] text-xs font-bold text-[#C94B4B]">
            {error}
          </div>
        ) : (
          <RegionalCharts data={analytics} />
        )}
      </div>
    </DashboardLayout>
  );
}
