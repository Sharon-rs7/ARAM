import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/common/DashboardLayout";
import RegionalMetrics from "@/components/admin/RegionalMetrics";
import DistrictOverview from "@/components/admin/DistrictOverview";
import ComplaintQueue from "@/components/admin/ComplaintQueue";
import { regionalAdminService } from "@/services/regionalAdminService";
import { adminService } from "@/services/adminService";
import { useAuth } from "@/context/AuthContext";
import { RefreshCw, MapPin, ShieldCheck } from "lucide-react";

const RegionalAdminDashboard = () => {
  const { user } = useAuth();
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const district = user?.district || storedUser.district || "Coimbatore";

  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    activeVolunteers: 0,
    resolvedComplaints: 0
  });
  const [districts, setDistricts] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch real-time dashboard stats for this district
      const statsData = await regionalAdminService.getDashboardStats(district);
      if (statsData) {
        setStats({
          totalComplaints: statsData.totalComplaints || 0,
          pendingComplaints: statsData.pendingComplaints || 0,
          activeVolunteers: statsData.totalGuides || statsData.availableGuides || 0,
          resolvedComplaints: statsData.resolvedComplaints || 0
        });
      }

      // 2. Fetch real-time complaints queue for this district
      const complaintsData = await regionalAdminService.getComplaints(district);
      setComplaints(complaintsData || []);

      // 3. Fetch real-time district caseload overview across Tamil Nadu
      try {
        const districtMetrics = await adminService.getDistrictMetrics();
        if (districtMetrics && districtMetrics.length > 0) {
          setDistricts(districtMetrics);
        } else {
          const guidesData = await regionalAdminService.getGuides(district);
          setDistricts([
            { name: district, guidesCount: guidesData?.length || statsData?.totalGuides || 4, caseCount: complaintsData?.length || statsData?.totalComplaints || 0 }
          ]);
        }
      } catch (e) {
        setDistricts([
          { name: district, guidesCount: statsData?.totalGuides || 4, caseCount: complaintsData?.length || 0 }
        ]);
      }

    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
      try {
        const fallbackComplaints = await adminService.getComplaints();
        setComplaints(fallbackComplaints || []);
      } catch (e2) {
        console.error("Fallback complaints error:", e2);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [district]);

  return (
    <DashboardLayout role="admin">
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#1F5948] font-black uppercase tracking-wider mb-1">
              <span className="flex items-center gap-1 bg-[#DCEBDD] px-3 py-1 rounded-full border border-[#c5ddc6]">
                <MapPin size={12} /> {district} Region
              </span>
              <span>•</span>
              <span className="text-[#65736D] font-bold">Authorized Regional Administration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18332B] tracking-tight">
              Regional Legal Administration Control Center
            </h1>
            <p className="text-xs text-[#65736D] mt-1 font-medium">
              Real-time caseload management, district allocation, and legal guide dispatching for {district}.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchAdminData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E6E1D8] text-xs font-bold text-[#18332B] hover:bg-[#F7F1E6] rounded-xl shadow-xs transition cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Live Data
          </button>
        </div>

        {/* Metrics Row */}
        <RegionalMetrics stats={stats} />

        {/* District Overview */}
        <DistrictOverview districts={districts} />

        {/* Grievance Queue */}
        <ComplaintQueue complaints={complaints} />
      </div>
    </DashboardLayout>
  );
};

export default RegionalAdminDashboard;
