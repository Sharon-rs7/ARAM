import React from "react";
import { User, Users, Landmark, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const WhoCanUse = () => {
  const { t } = useLanguage();

  const roles = [
    {
      icon: User,
      title: t("whoCanUse.u1Title", "Citizens"),
      desc: t("whoCanUse.u1Desc", "Explain grievances in your preferred language, understand statutory rights, organize evidence, and track case progress from home."),
      tag: t("whoCanUse.tagPublic", "Public Access"),
      color: "bg-[#DCEBDD] text-[#163D32]"
    },
    {
      icon: Users,
      title: t("whoCanUse.u2Title", "Legal Guides & Volunteers"),
      desc: t("whoCanUse.u2Desc", "Authorized paralegals and legal volunteers who review AI triage, assist citizens with petition drafting, and provide field guidance."),
      tag: t("whoCanUse.tagAssistance", "Case Assistance"),
      color: "bg-[#F6D8C8] text-[#8C3B1E]"
    },
    {
      icon: Landmark,
      title: t("whoCanUse.u3Title", "Government Officials"),
      desc: t("whoCanUse.u3Desc", "District department officers and DLSA representatives who receive structured petitions with verified evidence for statutory resolution."),
      tag: t("whoCanUse.tagAuthority", "Authority Triage"),
      color: "bg-[#E8C978]/40 text-[#7A5A0A]"
    },
    {
      icon: ShieldCheck,
      title: t("whoCanUse.u4Title", "Platform Administrators"),
      desc: t("whoCanUse.u4Desc", "Supervisors monitoring district-wide grievance resolution, audit trails, system performance, and legal service quality."),
      tag: t("whoCanUse.tagGovernance", "Governance"),
      color: "bg-[#E7E1F2] text-[#4F3F73]"
    }
  ];

  return (
    <section className="bg-[#FFFDF8] py-16 sm:py-24 border-t border-[#E6E1D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-[#1F5948] bg-[#DCEBDD] px-3.5 py-1.5 rounded-full inline-block shadow-2xs">
            {t("whoCanUse.tag", "Stakeholder Ecosystem")}
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#163D32] tracking-tight">
            {t("whoCanUse.title", "Who Can Use ARAM")}
          </h2>
          <p className="text-xs sm:text-sm text-[#65736D] max-w-xl mx-auto">
            {t("whoCanUse.subtitle", "Designed to connect every stakeholder in public legal awareness and dispute resolution.")}
          </p>
        </div>

        {/* Responsive Grid: 4 cols desktop, 2 cols tablet, 1 col mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {roles.map((role, idx) => {
            const Icon = role.icon;
            return (
              <div
                key={idx}
                className="p-6 sm:p-7 rounded-3xl bg-[#F7F1E6]/40 border border-[#E6E1D8] hover:border-[#163D32]/40 hover:bg-[#FFFDF8] hover:shadow-md transition duration-200 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold ${role.color}`}>
                      <Icon size={22} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#65736D] bg-[#FFFDF8] px-2.5 py-1 rounded-full border border-[#E6E1D8]">
                      {role.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-[#18332B] mb-2">
                    {role.title}
                  </h3>
                  <p className="text-xs text-[#65736D] leading-relaxed">
                    {role.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default WhoCanUse;