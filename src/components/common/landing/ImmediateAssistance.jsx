import React from "react";
import { PhoneCall, ShieldAlert, HeartHandshake, Shield, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const ImmediateAssistance = () => {
  const { t } = useLanguage();

  const helplines = [
    {
      number: "112",
      tel: "tel:112",
      title: t("immediateHelp.emergency", "Emergency Services"),
      desc: t("immediateHelp.emergencySub", "Police, Fire & Ambulance (24x7)"),
      icon: ShieldAlert,
      badge: t("immediateHelp.badgeEmergency", "National Emergency"),
      badgeColor: "bg-red-100 text-red-800 border-red-200"
    },
    {
      number: "181",
      tel: "tel:181",
      title: t("immediateHelp.women", "Women Helpline"),
      desc: t("immediateHelp.womenSub", "Safety & Domestic Violence (24x7)"),
      icon: HeartHandshake,
      badge: t("immediateHelp.badgeWomen", "Women Safety"),
      badgeColor: "bg-rose-100 text-rose-800 border-rose-200"
    },
    {
      number: "1930",
      tel: "tel:1930",
      title: t("immediateHelp.cyber", "Cyber Crime Helpline"),
      desc: t("immediateHelp.cyberSub", "National Financial Fraud Reporting"),
      icon: Shield,
      badge: t("immediateHelp.badgeCyber", "Cyber Fraud"),
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200"
    },
    {
      number: "15100",
      tel: "tel:15100",
      title: t("immediateHelp.legalAid", "NALSA Legal Aid"),
      desc: t("immediateHelp.legalAidSub", "Free Legal Aid & DLSA Services"),
      icon: PhoneCall,
      badge: t("immediateHelp.badgeLegalAid", "Free Legal Aid"),
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200"
    }
  ];

  return (
    <section className="bg-[#F7F1E6] py-16 sm:py-24 border-t border-[#E6E1D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-100 border border-red-200 px-3.5 py-1.5 text-xs font-black text-red-800 shadow-2xs">
            <AlertTriangle size={14} />
            <span>{t("immediateHelp.tag", "Emergency & Statutory Support")}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#163D32] tracking-tight">
            {t("immediateHelp.title", "Need Immediate Assistance?")}
          </h2>
          <p className="text-xs sm:text-sm text-[#65736D] max-w-xl mx-auto">
            {t("immediateHelp.subtitle", "Official government helplines for urgent emergencies, women safety, cybercrime, and free legal aid.")}
          </p>
        </div>

        {/* Helplines Grid: 4 cols on desktop, clean stacked cards on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {helplines.map((item, idx) => {
            const Icon = item.icon;
            const tapText = t("immediateHelp.tapToCall", "Tap to Call {number}").replace("{number}", item.number);
            return (
              <a
                key={idx}
                href={item.tel}
                className="p-6 sm:p-7 rounded-3xl bg-[#FFFDF8] border border-[#E6E1D8] hover:border-[#163D32]/40 hover:shadow-md transition duration-200 flex flex-col justify-between space-y-4 group cursor-pointer"
                title={tapText}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-[#DCEBDD]/50 text-[#163D32] flex items-center justify-center group-hover:bg-[#163D32] group-hover:text-white transition">
                      <Icon size={18} />
                    </div>
                  </div>

                  <div className="pt-1">
                    <div className="text-2xl sm:text-3xl font-black text-[#163D32] font-mono tracking-tight group-hover:text-[#1F5948] transition">
                      {item.number}
                    </div>
                    <h3 className="text-sm font-bold text-[#18332B] mt-1">
                      {item.title}
                    </h3>
                  </div>

                  <p className="text-xs text-[#65736D] leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E6E1D8]/60 text-xs font-bold text-[#1F5948] flex items-center gap-1.5 group-hover:translate-x-0.5 transition">
                  <PhoneCall size={13} />
                  <span>{tapText}</span>
                </div>
              </a>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default ImmediateAssistance;
