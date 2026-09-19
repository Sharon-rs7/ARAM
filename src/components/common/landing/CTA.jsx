import React from "react";
import { ArrowRight, MessageSquare, FileText, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

const CTA = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-[#FAF8F2] py-16 sm:py-24 border-t border-[#E6E1D8]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
        
        <div className="inline-flex items-center gap-2 rounded-full bg-[#DCEBDD] border border-[#B8D7BC] px-3.5 py-1.5 text-xs font-black text-[#163D32] shadow-2xs">
          <Sparkles size={14} />
          <span>Begin Your Legal Resolution</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#163D32] tracking-tight">
          Not sure where to start?
        </h2>

        <p className="text-sm sm:text-base text-[#4A5D54] max-w-xl mx-auto leading-relaxed">
          Tell ARAM what happened. We'll help you understand your rights, prepare your documents, and find the next step.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          {/* Primary CTA */}
          <Link
            to="/citizen/chatbot"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#0D3B2E] hover:bg-[#165340] text-white font-bold text-sm shadow-md hover:shadow-lg transition inline-flex items-center justify-center gap-2.5 min-h-[48px]"
          >
            <MessageSquare size={16} />
            <span>Ask ARAM AI</span>
            <ArrowRight size={15} />
          </Link>

          {/* Secondary CTA */}
          <Link
            to="/citizen/submit-complaint"
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white border border-[#12805A] hover:border-[#0D3B2E] text-[#12805A] hover:bg-[#E8F3ED] font-bold text-sm shadow-2xs transition inline-flex items-center justify-center gap-2 min-h-[48px]"
          >
            <FileText size={16} />
            <span>File a Grievance</span>
          </Link>
        </div>

        <p className="text-xs text-[#65736D] pt-2">
          Free Public Service • Confidential • Grounded in Indian Law
        </p>

      </div>
    </section>
  );
};

export default CTA;
