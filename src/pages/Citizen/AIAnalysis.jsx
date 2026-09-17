import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "@/components/common/DashboardLayout";
import AiResultCard from "@/components/citizen/AiResultCard";
import { Sparkles, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import Button from "@/components/common/Button";

const AIAnalysis = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [analysisData, setAnalysisData] = useState(location.state?.analysis || null);

  useEffect(() => {
    if (!analysisData) {
      // Fallback sample view
      setAnalysisData({
        problemSummary: "Dispute concerning agricultural land boundary encroachment and delayed patta mutation.",
        applicableLaw: "Tamil Nadu Land Reforms & Patta Passbook Act, 1983",
        section: "Section 10 & 14 (Appeals against boundary survey orders)",
        explanation: "Citizens possess the legal right to apply for a formal resurvey through the local Taluk Tahsildar with fee challan submission.",
        groundedPenalty: "Fine up to Rs. 2,000 and correction of survey revenue registry records.",
        nextSteps: [
          "Submit Form-VI to the Taluk Revenue Office",
          "Pay government survey challan at e-Seva center",
          "Obtain certified FMB (Field Measurement Book) sketch"
        ],
        documentChecklist: ["Encumbrance Certificate (13 years)", "Registered Sale Deed", "Current Year Land Tax Receipt"],
        authority: "Taluk Tahsildar / Revenue Divisional Officer (RDO)",
        safetyNotice: "Do not enter physical altercation; request police protection if threatened."
      });
    }
  }, [analysisData]);

  return (
    <DashboardLayout role="citizen">
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-bold text-[#163D32] hover:underline"
          >
            <ArrowLeft size={14} /> Back
          </button>

          <Button
            variant="primary"
            onClick={() => navigate("/citizen/submit-complaint")}
            icon={ArrowRight}
            iconPosition="right"
          >
            Proceed to Submit Grievance
          </Button>
        </div>

        {analysisData && (
          <AiResultCard
            data={analysisData}
            onProceedToComplaint={() => navigate("/citizen/submit-complaint")}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default AIAnalysis;
