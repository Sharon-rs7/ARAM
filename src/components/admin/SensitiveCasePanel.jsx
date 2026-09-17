import React from "react";

export default function SensitiveCasePanel({ complaint }) {
  if (!complaint || (!complaint.sensitive && !complaint.womenSensitive)) return null;

  return (
    <div className="bg-[#E8C978]/20 border border-[#D6B45E] rounded-2xl p-4.5 mb-6 shadow-2xs">
      <div className="flex items-start gap-3.5">
        <span className="text-xl">🛡️</span>
        <div>
          <h4 className="text-[#C58A25] text-xs font-black uppercase tracking-wider">
            Sensitive Case Flag Active
          </h4>
          <p className="text-[#18332B] text-xs mt-1 font-medium leading-relaxed">
            This case relates to personal protection, harassment, or vulnerable citizen rights. Specialized legal guide matching is enforced.
          </p>
          <div className="flex flex-wrap gap-2 mt-3 text-[10px] font-bold uppercase">
            <span className="bg-[#FFFDF8] text-[#C58A25] border border-[#D6B45E] px-2.5 py-1 rounded-full">
              Identity Protected
            </span>
            <span className="bg-[#DCEBDD] text-[#163D32] border border-[#c5ddc6] px-2.5 py-1 rounded-full">
              Certified Legal Guide Matcher
            </span>
            {complaint.preferredHelperGender && complaint.preferredHelperGender !== "ANY" && (
              <span className="bg-[#FFFDF8] text-[#163D32] border border-[#E6E1D8] px-2.5 py-1 rounded-full">
                Preferred Guide: {complaint.preferredHelperGender}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
