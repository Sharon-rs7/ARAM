import React, { useState } from "react";
import DashboardLayout from "@/components/common/DashboardLayout";
import DocumentVerificationPanel from "@/components/citizen/DocumentVerificationPanel";
import { FileText, ShieldCheck, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const CitizenDocuments = () => {
  const { t } = useLanguage();

  return (
    <DashboardLayout role="citizen">
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18332B] tracking-tight">
            {t("evidenceVault.title", "Documents & Evidence Vault")}
          </h1>
          <p className="text-xs text-[#65736D] mt-1">
            {t("evidenceVault.subtitle", "Upload deeds, agreements, notices, and FIRs for instant OCR readiness validation and SHA-256 encrypted storage.")}
          </p>
        </div>

        <DocumentVerificationPanel />
      </div>
    </DashboardLayout>
  );
};

export default CitizenDocuments;
