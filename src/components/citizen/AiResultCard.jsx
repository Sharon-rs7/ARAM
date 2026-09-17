import React from "react";
import { 
  Scale, BookOpen, AlertCircle, ShieldAlert, 
  CheckCircle2, FileText, Building2, UserPlus, 
  ArrowRight, Sparkles 
} from "lucide-react";
import Button from "@/components/common/Button";

const AiResultCard = ({ data, onProceedToComplaint }) => {
  if (!data) return null;

  const problemSummary = data.problemSummary || data.summary || data.question || "Citizen Legal Dispute";
  const applicableLaw = data.applicableLaw || data.law || "Indian Statutory Law";
  const section = data.section || data.sections || "Statutory Legal Provision";
  const explanation = data.explanation || data.answer || "Detailed legal guidance.";
  const groundedPenalty = data.groundedPenalty || data.penalty || "Statutory relief and applicable judicial remedy.";
  const nextSteps = Array.isArray(data.nextSteps) ? data.nextSteps : [data.nextSteps || "Consult DLSA legal guide"];
  const documentChecklist = Array.isArray(data.documentChecklist) ? data.documentChecklist : (data.docs || []);
  const authority = data.authority || data.recommendedAuthority || "District Legal Services Authority (DLSA)";
  const safetyNotice = data.safetyNotice || data.disclaimer || "Preliminary AI legal assistance only. In emergencies contact 112/181.";
  const sourceReference = data.sourceReference || "ARAM Grounded Indian Legal Corpus (1,306 Verified Chunks)";

  return (
    <div className="rounded-3xl bg-[#FFFDF8] border border-[#E6E1D8] p-6 sm:p-8 shadow-sm space-y-6 text-[#18332B]">
      
      {/* 1. Header & Problem Summary */}
      <div className="border-b border-[#E6E1D8] pb-4 flex items-start justify-between gap-4">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#DCEBDD] text-[#163D32]">
            <Sparkles size={12} /> Grounded Legal Assessment
          </span>
          <h3 className="text-base sm:text-lg font-extrabold text-[#18332B] mt-1 leading-snug">
            {problemSummary}
          </h3>
        </div>
      </div>

      {/* 2 & 3. Law & Section Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-[#F7F1E6]/60 border border-[#E6E1D8]">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#65736D]">Applicable Law</span>
          <p className="text-xs font-bold text-[#18332B] mt-1 leading-relaxed">{applicableLaw}</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#DCEBDD]/30 border border-[#DCEBDD]">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#163D32]">Relevant Section</span>
          <p className="text-xs font-bold text-[#163D32] mt-1 leading-relaxed">{section}</p>
        </div>
      </div>

      {/* 4. Substantive Explanation */}
      <div className="space-y-1.5">
        <h4 className="text-xs font-bold text-[#18332B] uppercase tracking-wider">Statutory Explanation</h4>
        <p className="text-xs text-[#18332B] leading-relaxed bg-[#F7F1E6]/40 p-4 rounded-2xl border border-[#E6E1D8] font-medium whitespace-pre-wrap">
          {explanation}
        </p>
      </div>

      {/* 5. Grounded Penalty */}
      {groundedPenalty && (
        <div className="p-4 rounded-2xl bg-[#F6D8C8]/40 border border-[#F6D8C8] space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8C3B1E]">Statutory Penalty & Remedy</span>
          <p className="text-xs font-medium text-[#18332B]">{groundedPenalty}</p>
        </div>
      )}

      {/* 6. Next Steps */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-[#18332B] uppercase tracking-wider">Recommended Next Action Steps</h4>
        <div className="space-y-2">
          {nextSteps.map((st, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F7F1E6]/40 border border-[#E6E1D8] text-xs text-[#18332B]">
              <span className="w-5 h-5 rounded-full bg-[#163D32] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="font-medium leading-relaxed">{st}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Document Checklist */}
      {documentChecklist.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-[#18332B] uppercase tracking-wider">Required Document Checklist</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {documentChecklist.map((doc, idx) => (
              <div key={idx} className="flex items-center gap-2 p-3 rounded-xl bg-[#FFFDF8] border border-[#E6E1D8] text-xs text-[#18332B]">
                <FileText size={15} className="text-[#1F5948] shrink-0" />
                <span className="font-medium">{doc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. Authority Routing */}
      <div className="p-4 rounded-2xl bg-[#E7E1F2]/40 border border-[#E7E1F2] flex items-center justify-between text-xs">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#4F3F73]">Competent Legal Authority</span>
          <p className="font-bold text-[#18332B] mt-0.5">{authority}</p>
        </div>
        <Building2 size={20} className="text-[#4F3F73]" />
      </div>

      {/* 9 & 10. Safety Notice & Source */}
      <div className="text-[11px] text-[#8B9690] space-y-1 pt-2 border-t border-[#E6E1D8]">
        <p>⚠️ <strong>Disclaimer:</strong> {safetyNotice}</p>
        <p>📚 <strong>Verified Source:</strong> {sourceReference}</p>
      </div>

      {/* 11. Human Guide Escalation Trigger */}
      {onProceedToComplaint && (
        <div className="pt-2">
          <Button
            variant="primary"
            onClick={onProceedToComplaint}
            className="w-full"
            icon={ArrowRight}
            iconPosition="right"
          >
            File Formal Grievance with this Assessment
          </Button>
        </div>
      )}

    </div>
  );
};

export default AiResultCard;
