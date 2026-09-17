import React from "react";
import { TrendingUp, Users, Clock, CheckCircle2 } from "lucide-react";

const RegionalMetrics = ({ stats }) => {
  const metrics = [
    {
      label: "Total Regional Cases",
      value: stats?.totalComplaints || 0,
      sub: "Across all districts",
      icon: TrendingUp,
      accent: "border-l-[#163D32]"
    },
    {
      label: "Pending Action",
      value: stats?.pendingComplaints || 0,
      sub: "Under triage / review",
      icon: Clock,
      accent: "border-l-[#E8C978]"
    },
    {
      label: "Active Legal Guides",
      value: stats?.activeVolunteers || 0,
      sub: "Verified paralegals",
      icon: Users,
      accent: "border-l-[#1F5948]"
    },
    {
      label: "Resolved Successfully",
      value: stats?.resolvedComplaints || 0,
      sub: "Relief granted",
      icon: CheckCircle2,
      accent: "border-l-[#2E7D5B]"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <div
            key={idx}
            className={`rounded-2xl bg-[#FFFDF8] p-5 border border-[#E6E1D8] border-l-4 ${m.accent} shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#65736D]">
                {m.label}
              </span>
              <Icon size={16} className="text-[#163D32]" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-[#18332B] tracking-tight">
              {m.value}
            </p>
            <p className="mt-0.5 text-[11px] text-[#8B9690] font-medium">
              {m.sub}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default RegionalMetrics;
