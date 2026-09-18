import React, { useState, useMemo } from "react";
import { MapPin, Users, FileText, Search, ShieldCheck, UserCheck, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DistrictOverview = ({ districts = [], district = null, onSelectDistrict = null }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState("all"); // all, with_cases, has_admin, no_admin

  // Single district banner mode
  if (district && districts.length === 0) {
    return (
      <div className="rounded-2xl bg-[#FFFDF8] dark:bg-[#11201B] p-5 sm:p-6 border border-[#E6E1D8] dark:border-emerald-800/50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#DCEBDD] dark:bg-emerald-900/60 text-[#163D32] dark:text-emerald-300 rounded-2xl">
            <MapPin size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-[#18332B] dark:text-white">{district} District</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#DCEBDD] dark:bg-emerald-950 text-[#163D32] dark:text-emerald-300 border border-[#B9D8BD] dark:border-emerald-700/50">
                Active Region
              </span>
            </div>
            <p className="text-xs text-[#65736D] dark:text-emerald-200/60 mt-0.5">
              Tamil Nadu State Legal Aid & Civic Grievance Jurisdiction
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Multi-district grid mode
  const filteredDistricts = useMemo(() => {
    return districts.filter((d) => {
      const name = (d.name || d.district || "").toLowerCase();
      const matchesSearch = name.includes(searchTerm.toLowerCase().trim());
      if (!matchesSearch) return false;

      const cases = d.caseCount || d.totalComplaints || 0;
      const hasAdmin = d.hasActiveAdmin || (d.adminName && d.adminName !== "Unassigned");

      if (filterMode === "with_cases") return cases > 0;
      if (filterMode === "has_admin") return hasAdmin;
      if (filterMode === "no_admin") return !hasAdmin;
      return true;
    });
  }, [districts, searchTerm, filterMode]);

  const handleCardClick = (d) => {
    const distName = d.name || d.district;
    if (onSelectDistrict) {
      onSelectDistrict(distName);
    } else {
      navigate(`/superadmin/regions/${distName}`);
    }
  };

  return (
    <div className="rounded-3xl bg-[#FFFDF8] dark:bg-[#11201B] p-5 sm:p-7 border border-[#E6E1D8] dark:border-emerald-800/50 shadow-sm space-y-5">
      
      {/* Header with Search & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E6E1D8] dark:border-emerald-900/50 pb-4">
        <div>
          <h3 className="text-base font-black text-[#163D32] dark:text-emerald-300 flex items-center gap-2">
            <MapPin size={18} className="text-[#1F5948] dark:text-emerald-400" /> 
            <span>Tamil Nadu District Grievance Centers</span>
          </h3>
          <p className="text-xs text-[#65736D] dark:text-emerald-200/60 mt-0.5">
            Real-time caseload, administrative oversight, and legal guide coverage across all districts
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-emerald-400/60" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search district..."
              className="w-full h-9 rounded-xl border border-slate-200 dark:border-emerald-800/60 bg-white dark:bg-[#182C26] pl-8 pr-3 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#163D32] focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="flex rounded-xl bg-slate-100 dark:bg-[#182C26] p-1 border border-slate-200 dark:border-emerald-800/50 text-[11px] font-bold">
            <button
              onClick={() => setFilterMode("all")}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${filterMode === "all" ? "bg-white dark:bg-[#1C352E] text-[#163D32] dark:text-emerald-300 shadow-xs" : "text-slate-500 dark:text-emerald-200/60"}`}
            >
              All ({districts.length})
            </button>
            <button
              onClick={() => setFilterMode("with_cases")}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${filterMode === "with_cases" ? "bg-white dark:bg-[#1C352E] text-[#163D32] dark:text-emerald-300 shadow-xs" : "text-slate-500 dark:text-emerald-200/60"}`}
            >
              With Cases
            </button>
            <button
              onClick={() => setFilterMode("has_admin")}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${filterMode === "has_admin" ? "bg-white dark:bg-[#1C352E] text-[#163D32] dark:text-emerald-300 shadow-xs" : "text-slate-500 dark:text-emerald-200/60"}`}
            >
              Admin Assigned
            </button>
          </div>
        </div>
      </div>

      {/* Grid of 38 Districts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {filteredDistricts.map((d, idx) => {
          const distName = d.name || d.district;
          const cases = d.caseCount || d.totalComplaints || 0;
          const pending = d.pendingCount || d.pendingComplaints || 0;
          const guides = d.guidesCount || d.totalGuides || 0;
          const citizens = d.citizensCount || 0;
          const hasAdmin = d.hasActiveAdmin || (d.adminName && d.adminName !== "Unassigned");
          const adminName = d.adminName && d.adminName !== "Unassigned" ? d.adminName : null;

          return (
            <div
              key={idx}
              onClick={() => handleCardClick(d)}
              className="p-4 rounded-2xl border border-[#E6E1D8] dark:border-emerald-800/40 bg-white dark:bg-[#162923] hover:border-[#163D32] dark:hover:border-emerald-400 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group active:scale-[0.99]"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-extrabold text-[#18332B] dark:text-white group-hover:text-[#163D32] dark:group-hover:text-emerald-300 transition truncate">
                    {distName}
                  </h4>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase shrink-0 ${
                    cases > 0 
                      ? "bg-[#DCEBDD] text-[#163D32] dark:bg-emerald-950 dark:text-emerald-300 border border-[#B9D8BD] dark:border-emerald-700/40" 
                      : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                  }`}>
                    {cases} {cases === 1 ? "case" : "cases"}
                  </span>
                </div>

                <div className="mt-2.5 space-y-1 text-[11px] text-[#65736D] dark:text-emerald-200/70 font-medium">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1"><Users size={12} /> Legal Guides:</span>
                    <span className="font-bold text-[#18332B] dark:text-white">{guides}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1"><FileText size={12} /> Citizens:</span>
                    <span className="font-bold text-[#18332B] dark:text-white">{citizens}</span>
                  </div>
                  {pending > 0 && (
                    <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
                      <span>Pending Review:</span>
                      <span className="font-bold">{pending}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin status footer */}
              <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-emerald-900/40 flex items-center justify-between text-[10px]">
                {hasAdmin ? (
                  <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-bold truncate">
                    <ShieldCheck size={12} className="shrink-0 text-emerald-600" />
                    <span className="truncate">{adminName || "Regional Admin"}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                    <AlertTriangle size={12} className="shrink-0" />
                    <span>No Admin</span>
                  </span>
                )}
                
                <span className="text-[#1F5948] dark:text-emerald-400 font-extrabold group-hover:underline">
                  Manage →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDistricts.length === 0 && (
        <div className="text-center py-10 text-slate-400 dark:text-emerald-200/50 text-xs">
          No districts found matching "{searchTerm}".
        </div>
      )}
    </div>
  );
};

export default DistrictOverview;
