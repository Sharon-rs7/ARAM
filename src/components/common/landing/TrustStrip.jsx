import React from "react";
import { Languages, BookOpenCheck, Users2, MapPin } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const TrustStrip = () => {
  const { t } = useLanguage();

  const trustItems = [
    {
      icon: Languages,
      title: t("trustStrip.multilingual", "Multilingual Legal Assistance"),
      desc: t("trustStrip.multilingualDesc", "Tamil • English • Hindi"),
      iconBg: "bg-[#DCEBDD] text-[#163D32]"
    },
    {
      icon: BookOpenCheck,
      title: t("trustStrip.verified", "Grounded in Verified Statutes"),
      desc: t("trustStrip.verifiedDesc", "Certified Indian law provisions"),
      iconBg: "bg-[#F6D8C8] text-[#8C3B1E]"
    },
    {
      icon: Users2,
      title: t("trustStrip.humanSupport", "Human Guide & DLSA Support"),
      desc: t("trustStrip.humanSupportDesc", "Accredited legal escalation"),
      iconBg: "bg-[#E7E1F2] text-[#4F3F73]"
    },
    {
      icon: MapPin,
      title: t("trustStrip.districtAware", "District-Aware Guidance"),
      desc: t("trustStrip.districtAwareDesc", "All 38 Tamil Nadu districts"),
      iconBg: "bg-[#E8C978]/40 text-[#7A5A0A]"
    }
  ];

  return (
    <div className="relative z-20 -mt-6 sm:-mt-8 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="rounded-3xl bg-[#FFFDF8] border border-[#E6E1D8] shadow-md p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-[#E6E1D8]/70">
          {trustItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`flex items-center gap-3.5 ${idx !== 0 ? "pt-3 sm:pt-0 sm:pl-6" : ""}`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${item.iconBg}`}>
                  <Icon size={19} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-black text-[#163D32] truncate">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#65736D] truncate mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrustStrip;
