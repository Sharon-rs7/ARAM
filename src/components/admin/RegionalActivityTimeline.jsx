import React from "react";
import { Activity, Clock } from "lucide-react";

export default function RegionalActivityTimeline({ activities = [] }) {
  return (
    <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-6 shadow-sm">
      <h3 className="text-[#163D32] text-sm font-extrabold uppercase tracking-wider mb-4 flex items-center gap-2">
        <Activity size={16} className="text-[#1F5948]" /> Regional Operations Audit Trail
      </h3>
      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
        {activities.length === 0 ? (
          <div className="text-[#65736D] text-xs py-6 text-center font-medium">No recent activity logged in this district.</div>
        ) : (
          activities.map((act, idx) => (
            <div key={idx} className="flex gap-3 border-l-2 border-[#DCEBDD] pl-4 pb-2 relative">
              <div className="absolute w-2.5 h-2.5 rounded-full bg-[#163D32] -left-[5.5px] top-1" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-[#DCEBDD] text-[#163D32] border border-[#c5ddc6] text-[9px] px-2 py-0.5 rounded-md font-extrabold uppercase">
                    {act.action || "AUDIT"}
                  </span>
                  <span className="text-[#65736D] text-[10px] font-mono">
                    {new Date(act.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-[#18332B] text-xs mt-1 font-medium">{act.details}</p>
                <span className="text-[10px] text-[#8B9690] block mt-0.5 font-mono">
                  Performed by: {act.userEmail || "SYSTEM"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
