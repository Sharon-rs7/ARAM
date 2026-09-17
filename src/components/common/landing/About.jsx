import React from "react";
import { Scale, HeartHandshake, ShieldCheck, Award } from "lucide-react";

const About = () => {
  return (
    <section className="bg-[#FFFDF8] py-20 border-t border-[#E6E1D8]">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-4">
          <span className="text-xs font-black uppercase tracking-widest text-[#1F5948] bg-[#DCEBDD] px-3.5 py-1.5 rounded-full inline-block">
            Our Mission
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#163D32] tracking-tight">
            Democratizing Legal Rights for Every Citizen
          </h2>
          <p className="text-xs sm:text-sm text-[#65736D] leading-relaxed">
            ARAM (அறம்) is built on the fundamental belief that access to justice should not be barred by language, geography, or economic standing.
          </p>
          <p className="text-xs sm:text-sm text-[#65736D] leading-relaxed">
            By connecting citizens directly with grounded statutory knowledge and verified legal guides, ARAM ensures equitable legal awareness.
          </p>
        </div>

        <div className="rounded-3xl bg-[#163D32] p-8 text-white space-y-4 shadow-lg">
          <h3 className="text-lg font-bold text-[#DCEBDD]">ARAM Core Commitments</h3>
          <div className="space-y-3 text-xs text-white/90">
            <p>✓ <strong>Zero Hallucination:</strong> All legal advice is verified against certified statutes.</p>
            <p>✓ <strong>Privacy Protection:</strong> Automatic PII masking of Aadhaar and personal details.</p>
            <p>✓ <strong>Official Email Gateway:</strong> Centralized communication from ouraramsupport@gmail.com.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
