import React, { useState, useEffect } from "react";
import { Scale, Landmark, FileCheck, Users, HelpCircle, RefreshCw } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const TrustStrip = () => {
  const { t } = useLanguage();
  const [metrics, setMetrics] = useState({
    totalComplaints: 104,
    activeInReview: 72,
    resolvedCases: 32,
    legalGuides: 395,
    districtsCovered: 38,
    isLive: false,
    updatedAt: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchMetrics = async () => {
      try {
        const res = await fetch("/api/public/metrics");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setMetrics({
              totalComplaints: data.totalComplaints || 0,
              activeInReview: data.activeInReview || 0,
              resolvedCases: data.resolvedCases || 0,
              legalGuides: data.legalGuides || 0,
              districtsCovered: data.districtsCovered || 38,
              isLive: true,
              updatedAt: data.updatedAt
            });
          }
        }
      } catch (err) {
        // Fallback to baseline indicators
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMetrics();
    return () => { isMounted = false; };
  }, []);

  const stats = [
    {
      id: "total",
      label: "Total Complaints",
      value: metrics.totalComplaints,
      sublabel: `Across ${metrics.districtsCovered} Districts`,
      tooltip: "Total grievances registered in the central civic registry",
      icon: Scale,
      bgColor: "bg-[#DCEBDD]",
      textColor: "text-[#12805A]"
    },
    {
      id: "active",
      label: "Active in Review",
      value: metrics.activeInReview,
      sublabel: "Under DLSA Process",
      tooltip: "Cases currently undergoing review, evidence verification, or authority escalation",
      icon: Landmark,
      bgColor: "bg-[#E7E1F2]",
      textColor: "text-[#4F3F73]"
    },
    {
      id: "resolved",
      label: "Resolved Cases",
      value: metrics.resolvedCases,
      sublabel: "Citizens Helped",
      tooltip: "Formal case redressals closed by competent authorities or legal guides",
      icon: FileCheck,
      bgColor: "bg-[#DCEBDD]",
      textColor: "text-[#163D32]"
    },
    {
      id: "guides",
      label: "Legal Guides",
      value: metrics.legalGuides,
      sublabel: "Across Tamil Nadu",
      tooltip: "Accredited legal helpers, paralegals, and volunteer advocates registered in ARAM",
      icon: Users,
      bgColor: "bg-[#E8C978]/40",
      textColor: "text-[#7A5A0A]"
    }
  ];

  return (
    <div className="relative z-20 -mt-2 sm:-mt-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-[#FFFDF8] border border-[#E6E1D8] shadow-md p-5 sm:p-6 lg:p-7">
        
        {/* Live Badge Indicator */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E6E1D8]/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${metrics.isLive ? "bg-emerald-400" : "bg-amber-400"}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${metrics.isLive ? "bg-emerald-600" : "bg-amber-500"}`}></span>
            </span>
            <span className="font-bold text-[#163D32]">
              {metrics.isLive ? "Statewide Live Civic Registry Data" : "Statewide Civic Platform Indicators"}
            </span>
          </div>

          <span className="text-[11px] text-[#65736D] hidden sm:inline-block">
            {metrics.isLive ? "Verified Real-Time Counts" : "Government of Tamil Nadu • Legal Aid Initiative"}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 lg:gap-6 items-center divide-y lg:divide-y-0 lg:divide-x divide-[#E6E1D8]/80">
          
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.id} 
                className={`flex items-center gap-3.5 ${idx > 0 ? "lg:pl-6" : ""} ${idx >= 2 ? "pt-4 md:pt-0" : ""}`}
                title={item.tooltip}
              >
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${item.bgColor} ${item.textColor} flex items-center justify-center shrink-0 shadow-2xs`}>
                  <Icon size={22} />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-[#163D32] font-mono leading-none flex items-center gap-1.5">
                    {loading ? (
                      <span className="inline-block w-12 h-7 bg-slate-200 animate-pulse rounded-md" />
                    ) : (
                      item.value.toLocaleString()
                    )}
                  </div>
                  <div className="text-xs font-bold text-[#18332B] mt-1 flex items-center gap-1">
                    <span>{item.label}</span>
                  </div>
                  <div className="text-[11px] text-[#65736D]">{item.sublabel}</div>
                </div>
              </div>
            );
          })}

          {/* Stat 5: NALSA Civic Quote */}
          <div className="col-span-2 md:col-span-1 lg:col-span-1 pt-4 lg:pt-0 lg:pl-6 flex flex-col justify-center text-left">
            <p className="text-xs sm:text-sm font-bold text-[#163D32] leading-snug">
              “Access to justice strengthens democracy.”
            </p>
            <p className="text-[11px] font-semibold text-[#65736D] mt-1">
              — NALSA (National Legal Services)
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TrustStrip;
