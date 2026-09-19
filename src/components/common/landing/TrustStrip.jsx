import React from "react";
import { Scale, Landmark, FileCheck, Users, Quote } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const TrustStrip = () => {
  const { t } = useLanguage();

  return (
    <div className="relative z-20 -mt-2 sm:-mt-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-[#FFFDF8] border border-[#E6E1D8] shadow-md p-5 sm:p-6 lg:p-7">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 lg:gap-6 items-center divide-y lg:divide-y-0 lg:divide-x divide-[#E6E1D8]/80">
          
          {/* Stat 1: Total Complaints */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#DCEBDD] text-[#12805A] flex items-center justify-center shrink-0 shadow-2xs">
              <Scale size={24} />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#163D32] font-mono leading-none">
                104
              </div>
              <div className="text-xs font-bold text-[#18332B] mt-1">Total Complaints</div>
              <div className="text-[11px] text-[#65736D]">Across 38 Districts</div>
            </div>
          </div>

          {/* Stat 2: Active in Review */}
          <div className="flex items-center gap-3.5 lg:pl-6">
            <div className="w-12 h-12 rounded-2xl bg-[#E7E1F2] text-[#4F3F73] flex items-center justify-center shrink-0 shadow-2xs">
              <Landmark size={24} />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#163D32] font-mono leading-none">
                72
              </div>
              <div className="text-xs font-bold text-[#18332B] mt-1">Active in Review</div>
              <div className="text-[11px] text-[#65736D]">Under Process</div>
            </div>
          </div>

          {/* Stat 3: Resolved Cases */}
          <div className="flex items-center gap-3.5 pt-4 md:pt-0 lg:pl-6">
            <div className="w-12 h-12 rounded-2xl bg-[#DCEBDD] text-[#163D32] flex items-center justify-center shrink-0 shadow-2xs">
              <FileCheck size={24} />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#163D32] font-mono leading-none">
                32
              </div>
              <div className="text-xs font-bold text-[#18332B] mt-1">Resolved Cases</div>
              <div className="text-[11px] text-[#65736D]">Citizens Helped</div>
            </div>
          </div>

          {/* Stat 4: Legal Guides */}
          <div className="flex items-center gap-3.5 pt-4 md:pt-0 lg:pl-6">
            <div className="w-12 h-12 rounded-2xl bg-[#E8C978]/40 text-[#7A5A0A] flex items-center justify-center shrink-0 shadow-2xs">
              <Users size={24} />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#163D32] font-mono leading-none">
                395
              </div>
              <div className="text-xs font-bold text-[#18332B] mt-1">Legal Guides</div>
              <div className="text-[11px] text-[#65736D]">Across Tamil Nadu</div>
            </div>
          </div>

          {/* Stat 5: NALSA Civic Quote */}
          <div className="col-span-2 md:col-span-1 lg:col-span-1 pt-4 lg:pt-0 lg:pl-6 flex flex-col justify-center">
            <p className="text-xs sm:text-sm font-bold text-[#163D32] leading-snug">
              “Access to justice strengthens democracy.”
            </p>
            <p className="text-[11px] font-semibold text-[#65736D] mt-1">
              — NALSA
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TrustStrip;
