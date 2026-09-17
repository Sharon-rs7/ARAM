import React from "react";
import { 
  Sparkles, Mic, FileCheck, ShieldCheck, Scale, 
  BookOpen, Users, BellRing 
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "11-Part Structured Legal Triage",
    desc: "Every query receives grounded statutory citation, section applicability, next steps, document checklists, and DLSA authority routing.",
    color: "bg-[#DCEBDD] text-[#163D32]"
  },
  {
    icon: Mic,
    title: "Multilingual Voice AI (Faster-Whisper)",
    desc: "Direct local voice input in Tamil (தமிழ்), Hindi (हिंदी), and English with high-accuracy phonetic parsing for legal terminology.",
    color: "bg-[#F6D8C8] text-[#8C3B1E]"
  },
  {
    icon: FileCheck,
    title: "OCR Document Readiness Checker",
    desc: "Automated optical character verification of sale deeds, partition agreements, and notices with legal readiness scoring.",
    color: "bg-[#E8C978]/50 text-[#7A5A0A]"
  },
  {
    icon: Users,
    title: "Certified Legal Guide Workflow",
    desc: "Seamless escalation from AI triage to verified local paralegal guides and District Legal Services Authorities (DLSA).",
    color: "bg-[#E7E1F2] text-[#4F3F73]"
  }
];

const Features = () => {
  return (
    <section className="bg-[#FFFDF8] py-20 border-t border-[#E6E1D8]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-[#1F5948] bg-[#DCEBDD] px-3.5 py-1.5 rounded-full inline-block">
            Engineered for Justice
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#163D32] tracking-tight">
            How ARAM AI Protects Your Legal Rights
          </h2>
          <p className="text-xs sm:text-sm text-[#65736D]">
            Strictly grounded against 1,306 certified Indian law provisions with zero synthetic hallucination.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-[#F7F1E6]/40 border border-[#E6E1D8] hover:border-[#163D32] transition space-y-3"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${f.color}`}>
                  <Icon size={22} />
                </div>
                <h3 className="text-base font-extrabold text-[#18332B]">{f.title}</h3>
                <p className="text-xs text-[#65736D] leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
