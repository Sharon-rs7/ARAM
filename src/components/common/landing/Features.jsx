import React from "react";
import { 
  Globe2, Sparkles, FileSearch, MapPin, History, Users 
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const Features = () => {
  const { t } = useLanguage();

  const capabilities = [
    {
      icon: Globe2,
      title: "Multilingual Assistance",
      desc: "Native voice recognition, natural understanding, and text-to-speech support in Tamil (தமிழ்), English, and Hindi (हिंदी).",
      badge: "Tamil • English • Hindi",
      color: "bg-[#DCEBDD] text-[#163D32]"
    },
    {
      icon: Sparkles,
      title: "AI Legal Triage",
      desc: "Instantly analyzes facts, maps them to relevant Indian legal provisions, and structures an actionable dispute summary.",
      badge: "Statutory Triage",
      color: "bg-[#F6D8C8] text-[#8C3B1E]"
    },
    {
      icon: FileSearch,
      title: "Evidence & Document Inspection",
      desc: "Deep OCR inspection for deeds, FIRs, notices, and receipts to verify legibility, key dates, parties, and document readiness.",
      badge: "Deep OCR Verification",
      color: "bg-[#E8C978]/40 text-[#7A5A0A]"
    },
    {
      icon: MapPin,
      title: "Jurisdiction-Aware Routing",
      desc: "Identifies competent District Legal Services Authorities (DLSA), police stations, and departmental grievance cells for your district.",
      badge: "38 Districts Covered",
      color: "bg-[#E7E1F2] text-[#4F3F73]"
    },
    {
      icon: History,
      title: "Citizen Case Memory",
      desc: "Authenticated citizens work with their linked grievance history and past documents seamlessly without repeating facts.",
      badge: "Encrypted Context",
      color: "bg-[#DCEBDD] text-[#12805A]"
    },
    {
      icon: Users,
      title: "Human Legal Support",
      desc: "Direct confidential 2-way case communication with accredited Legal Guides, paralegals, and legal aid coordinators.",
      badge: "DLSA Accredited",
      color: "bg-[#F5E6DA] text-[#8C3B1E]"
    }
  ];

  return (
    <section id="services" className="bg-[#FFFDF8] py-16 sm:py-24 border-t border-[#E6E1D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-[#1F5948] bg-[#DCEBDD] px-3.5 py-1.5 rounded-full inline-block shadow-2xs">
            Engineered for Justice
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#163D32] tracking-tight">
            Key ARAM Capabilities
          </h2>
          <p className="text-xs sm:text-sm text-[#65736D] max-w-xl mx-auto">
            Practical, citizen-first legal tools designed to make rights understandable, accessible, and actionable.
          </p>
        </div>

        {/* 6 Capabilities Grid: 1 col on mobile, 2 col on tablet, 3 col on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {capabilities.map((c, idx) => {
            const Icon = c.icon;
            return (
              <div
                key={idx}
                className="p-6 sm:p-7 rounded-3xl bg-[#FAF8F2] border border-[#E6E1D8] hover:border-[#163D32]/40 hover:bg-[#FFFDF8] hover:shadow-md transition duration-200 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold ${c.color} shadow-2xs group-hover:scale-105 transition`}>
                      <Icon size={21} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#65736D] bg-[#FFFDF8] px-2.5 py-1 rounded-full border border-[#E6E1D8]">
                      {c.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-[#18332B] pt-1">
                    {c.title}
                  </h3>
                  <p className="text-xs text-[#65736D] leading-relaxed">
                    {c.desc}
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

export default Features;
