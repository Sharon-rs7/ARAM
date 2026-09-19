import React, { useState } from "react";
import DashboardLayout from "@/components/common/DashboardLayout";
import { Search, ShieldCheck, Clock, CheckCircle2, AlertCircle, FileText, ArrowRight, Download, MessageCircle } from "lucide-react";
import { complaintService } from "@/services/complaintService";
import { toast } from "sonner";
import Button from "@/components/common/Button";
import { useLanguage } from "@/context/LanguageContext";

const TrackComplaint = () => {
  const { t } = useLanguage();
  const [complaintId, setComplaintId] = useState("");
  const [loading, setLoading] = useState(false);
  const [caseData, setCaseData] = useState(null);
  const [searched, setSearched] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [waLoading, setWaLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    const cleanId = complaintId.replace(/[^0-9]/g, "");
    if (!cleanId) {
      toast.error("Please enter a valid numeric Case ID (e.g., ARAM-2026-000001 or 1).");
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const data = await complaintService.getComplaintDetails(cleanId);
      setCaseData(data);
    } catch (err) {
      console.error("Failed to track case:", err);
      setCaseData(null);
      toast.error("No record found matching this Case ID.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!caseData?.id) return;
    setPdfLoading(true);
    try {
      await complaintService.downloadStatusPdf(caseData.id, caseData.complaintCustomId);
      toast.success("Official ARAM Status Report PDF downloaded successfully.");
    } catch (err) {
      console.error("Failed to download PDF:", err);
      toast.error(err?.response?.data?.message || "Failed to download status PDF.");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleSendWhatsAppPdf = async () => {
    if (!caseData?.id) return;
    setWaLoading(true);
    try {
      const res = await complaintService.sendWhatsappPdf(caseData.id);
      toast.success(res?.message || "Status PDF dispatched to registered WhatsApp number!");
    } catch (err) {
      console.error("Failed to dispatch WhatsApp PDF:", err);
      toast.error(err?.response?.data?.message || "Failed to send PDF to WhatsApp.");
    } finally {
      setWaLoading(false);
    }
  };

  const steps = [
    { 
      title: t("trackComplaint.step1Title", "Grievance Filed"), 
      desc: t("trackComplaint.step1Desc", "Submitted securely to ARAM official registry"), 
      done: true 
    },
    { 
      title: t("trackComplaint.step2Title", "AI Triage & Categorization"), 
      desc: t("trackComplaint.step2Desc", "Applicable legal sections and checklists identified"), 
      done: !!caseData 
    },
    { 
      title: t("trackComplaint.step3Title", "Legal Guide Assignment"), 
      desc: t("trackComplaint.step3Desc", "Verified legal guide assigned for assistance"), 
      done: caseData?.assignedHelperName || caseData?.status === "IN_PROGRESS" || caseData?.status === "RESOLVED" 
    },
    { 
      title: t("trackComplaint.step4Title", "Authority Resolution"), 
      desc: t("trackComplaint.step4Desc", "Taluk / District legal action completed"), 
      done: caseData?.status === "RESOLVED" 
    }
  ];

  return (
    <DashboardLayout role="citizen">
      <div className="max-w-3xl mx-auto space-y-8 pb-12">
        
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18332B] tracking-tight">
            {t("trackComplaint.title", "Track Grievance Milestone Status")}
          </h1>
          <p className="text-xs text-[#65736D] max-w-md mx-auto">
            {t("trackComplaint.subtitle", "Enter your ARAM case reference ID to inspect official review progress, assigned guide, and next action plan.")}
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleTrack} className="p-4 rounded-3xl bg-[#FFFDF8] border border-[#E6E1D8] shadow-sm flex items-center gap-3">
          <Search size={18} className="text-[#8B9690] ml-2" />
          <input
            type="text"
            value={complaintId}
            onChange={(e) => setComplaintId(e.target.value)}
            placeholder={t("trackComplaint.inputPlaceholder", "Enter Case ID (e.g., ARAM-2026-000001 or 1)")}
            className="flex-1 bg-transparent text-xs sm:text-sm text-[#18332B] placeholder-[#8B9690] focus:outline-none"
          />
          <Button variant="primary" type="submit" loading={loading}>
            {loading ? t("trackComplaint.trackingBtn", "Searching...") : t("trackComplaint.trackBtn", "Track Status")}
          </Button>
        </form>

        {/* Tracking Milestone Result */}
        {searched && (
          <div>
            {!caseData && !loading ? (
              <div className="p-8 text-center rounded-3xl bg-[#FFFDF8] border border-[#E6E1D8] shadow-sm space-y-2">
                <AlertCircle className="mx-auto text-amber-600" size={32} />
                <h3 className="text-sm font-bold text-[#18332B]">No Record Found</h3>
                <p className="text-xs text-[#65736D]">Please double-check the Case ID or contact support at ouraramsupport@gmail.com.</p>
              </div>
            ) : caseData ? (
              <div className="rounded-3xl bg-[#FFFDF8] border border-[#E6E1D8] p-6 sm:p-8 shadow-sm space-y-6">
                
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E6E1D8] pb-4 gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#65736D]">
                      Case ID: ARAM-2026-{String(caseData.id).padStart(6, "0")}
                    </span>
                    <h2 className="text-lg font-bold text-[#18332B] mt-0.5">{caseData.title || "Legal Assistance Case"}</h2>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#DCEBDD] text-[#163D32] self-start sm:self-center">
                    {String(caseData.status || "SUBMITTED").replace(/_/g, " ")}
                  </span>
                </div>

                {/* Progress Timeline */}
                <div className="space-y-6">
                  {steps.map((st, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        st.done ? "bg-[#163D32] text-white" : "bg-[#F7F1E6] text-[#8B9690] border border-[#E6E1D8]"
                      }`}>
                        {st.done ? "✓" : idx + 1}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className={`text-xs font-bold ${st.done ? "text-[#18332B]" : "text-[#8B9690]"}`}>{st.title}</h4>
                        <p className="text-[11px] text-[#65736D]">{st.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Assigned Guide details if any */}
                {caseData.assignedHelperName && (
                  <div className="p-4 rounded-2xl bg-[#DCEBDD]/30 border border-[#DCEBDD] flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-[#163D32]">Assigned Legal Guide</span>
                      <p className="font-bold text-[#18332B]">{caseData.assignedHelperName}</p>
                    </div>
                    <span className="text-[10px] text-[#65736D]">Direct Chat Available in Dashboard</span>
                  </div>
                )}

                {/* Official PDF & WhatsApp Actions */}
                <div className="pt-4 border-t border-[#E6E1D8] flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={pdfLoading}
                    className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#0D3B2E] hover:bg-[#165340] text-white font-bold text-xs shadow-sm transition cursor-pointer disabled:opacity-50"
                  >
                    <Download size={15} />
                    <span>{pdfLoading ? "Generating Official PDF..." : "Download Status PDF"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendWhatsAppPdf}
                    disabled={waLoading}
                    className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#E8F8EE] hover:bg-[#D5F2DF] border border-[#25D366]/50 text-[#0F6B38] font-bold text-xs shadow-2xs transition cursor-pointer disabled:opacity-50"
                  >
                    <MessageCircle size={15} className="text-[#25D366]" />
                    <span>{waLoading ? "Dispatching to WhatsApp..." : "Send PDF to WhatsApp"}</span>
                  </button>
                </div>

              </div>
            ) : null}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default TrackComplaint;
