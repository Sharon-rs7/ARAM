import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/common/DashboardLayout";
import RegionalMetrics from "@/components/admin/RegionalMetrics";
import RegionalCharts from "@/components/admin/RegionalCharts";
import GuideDirectory from "@/components/admin/GuideDirectory";
import ComplaintQueue from "@/components/admin/ComplaintQueue";
import { regionalAdminService } from "@/services/regionalAdminService";
import { useAuth } from "@/context/AuthContext";
import { RefreshCw, MapPin, ShieldCheck, Users, FileText, Activity } from "lucide-react";
import { toast } from "sonner";

const RegionalAdminDashboard = () => {
  const { user } = useAuth();
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const district = user?.district || storedUser.district || "Salem";

  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    activeVolunteers: 0,
    resolvedComplaints: 0
  });
  const [complaints, setComplaints] = useState([]);
  const [guides, setGuides] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
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

      // 3. Fetch legal guides for this district
      try {
        const guidesData = await regionalAdminService.getGuides(district);
        setGuides(guidesData || []);
      } catch (gErr) {
        console.warn("Guides fetch error:", gErr);
      }

      // 4. Fetch analytics data for this district
      try {
        const analytics = await regionalAdminService.getAnalytics(district, "30d");
        if (analytics) {
          setAnalyticsData(analytics);
        }
      } catch (aErr) {
        console.warn("Analytics fetch error:", aErr);
      }

    } catch (err) {
      console.error("Regional admin dashboard fetch error:", err);
      toast.error("Failed to load regional data for " + district);
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
        {/* District Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#1F5948] font-black uppercase tracking-wider mb-1">
              <span className="flex items-center gap-1 bg-[#DCEBDD] px-3 py-1 rounded-full border border-[#c5ddc6]">
                <MapPin size={12} /> {district} Jurisdiction
              </span>
              <span>•</span>
              <span className="text-[#65736D] font-bold">Regional Administration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18332B] tracking-tight">
              {district} Legal Aid & Grievance Portal
            </h1>
            <p className="text-xs text-[#65736D] mt-1 font-medium">
              Real-time caseload management, complaint triage, and legal guide dispatching for {district} district.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchAdminData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E6E1D8] text-xs font-bold text-[#18332B] hover:bg-[#F7F1E6] rounded-xl shadow-xs transition cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh {district} Data
          </button>
        </div>

        {/* 1. Regional Key Metrics */}
        <RegionalMetrics stats={stats} />

        {/* 2. Visual Analytics for this Region */}
        {analyticsData && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-wider text-[#163D32] flex items-center gap-2">
                <Activity size={16} className="text-[#1F5948]" /> {district} Case Trends & Statistics
              </h2>
            </div>
            <RegionalCharts data={analyticsData} />
          </div>
        )}

        {/* 3. Live Grievance Queue for this Region */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider text-[#163D32] flex items-center gap-2">
              <FileText size={16} className="text-[#1F5948]" /> {district} Grievance Queue ({complaints.length})
            </h2>
          </div>
          <ComplaintQueue complaints={complaints} onRefresh={fetchAdminData} />
        </div>

        {/* 4. Verified Legal Guides Directory for this Region */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider text-[#163D32] flex items-center gap-2">
              <Users size={16} className="text-[#1F5948]" /> {district} Legal Guides Force ({guides.length})
            </h2>
          </div>
          <GuideDirectory guides={guides} district={district} onGuideAdded={fetchAdminData} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RegionalAdminDashboard;
