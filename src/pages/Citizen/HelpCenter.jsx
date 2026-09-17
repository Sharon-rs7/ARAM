import React, { useState } from "react";
import DashboardLayout from "@/components/common/DashboardLayout";
import { HelpCircle, Phone, BookOpen, ShieldCheck, Scale, ExternalLink } from "lucide-react";

const HelpCenter = () => {
  const helplines = [
    { title: "National Legal Services (NALSA)", number: "15100", desc: "Free legal aid for eligible citizens under Legal Services Authorities Act" },
    { title: "Women Helpline", number: "181", desc: "24x7 support for domestic violence and emergency protection" },
    { title: "National Cyber Crime Reporting", number: "1930", desc: "Financial fraud and cyber harassment immediate reporting" },
    { title: "Senior Citizen Helpline", number: "14567", desc: "Elder abuse and maintenance dispute legal assistance" }
  ];

  return (
    <DashboardLayout role="citizen">
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18332B] tracking-tight">
            Legal Rights & Emergency Help Center
          </h1>
          <p className="text-xs text-[#65736D] mt-1">
            Certified statutory helplines, District Legal Services Authority (DLSA) access, and dispute guidelines.
          </p>
        </div>

        {/* Helplines Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {helplines.map((h, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-[#FFFDF8] border border-[#E6E1D8] shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#18332B]">{h.title}</h3>
                <a
                  href={`tel:${h.number}`}
                  className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#163D32] text-white hover:bg-[#1F5948] transition"
                >
                  📞 {h.number}
                </a>
              </div>
              <p className="text-xs text-[#65736D] leading-relaxed">{h.desc}</p>
            </div>
          ))}
        </div>

        {/* Official Email Notice */}
        <div className="p-6 rounded-3xl bg-[#DCEBDD]/40 border border-[#DCEBDD] space-y-2 text-[#163D32]">
          <h3 className="text-sm font-bold">Official ARAM Support Gateway</h3>
          <p className="text-xs leading-relaxed text-[#18332B]">
            For formal petition drafting inquiries or system support, email our dedicated gateway at{" "}
            <strong>ouraramsupport@gmail.com</strong>.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HelpCenter;
