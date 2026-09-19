import React from "react";
import { Scale, HeartHandshake, ShieldCheck, Award } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const About = () => {
  const { t } = useLanguage();

  return (
    <section id="about" className="bg-[#FFFDF8] py-16 sm:py-24 border-t border-[#E6E1D8]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div className="space-y-4">
          <span className="text-xs font-black uppercase tracking-widest text-[#1F5948] bg-[#DCEBDD] px-3.5 py-1.5 rounded-full inline-block shadow-2xs">
            {t("about.tag", "Our Mission")}
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-[#163D32] tracking-tight">
            {t("about.title", "Democratizing Legal Rights for Every Citizen")}
          </h2>
          <p className="text-xs sm:text-sm text-[#65736D] leading-relaxed">
            {t("about.desc1", "ARAM (அறம்) is built on the fundamental belief that access to justice should not be barred by language, geography, or economic standing.")}
          </p>
          <p className="text-xs sm:text-sm text-[#65736D] leading-relaxed">
            {t("about.desc2", "By connecting citizens directly with grounded statutory knowledge and verified legal guides, ARAM ensures equitable legal awareness.")}
          </p>
        </div>

        <div className="rounded-3xl bg-[#163D32] p-6 sm:p-8 text-white space-y-4 shadow-lg border border-[#1F5948]">
          <h3 className="text-base sm:text-lg font-bold text-[#DCEBDD]">
            {t("about.commitmentsTitle", "ARAM Core Commitments")}
          </h3>
          <div className="space-y-3 text-xs text-white/90">
            <p className="flex items-start gap-2">
              <span className="text-[#DCEBDD] font-bold">✓</span>
              <span>{t("about.c1", "Grounded Statutory Guidance: All legal explanations are verified against certified statutes.")}</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-[#DCEBDD] font-bold">✓</span>
              <span>{t("about.c2", "Privacy Protection: Automatic PII masking of Aadhaar and personal details.")}</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-[#DCEBDD] font-bold">✓</span>
              <span>{t("about.c3", "Official Support Gateway: Centralized communication from ouraramsupport@gmail.com.")}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
