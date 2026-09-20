import React, { useState, useEffect } from "react";
import { 
  Upload, FileText, CheckCircle2, AlertCircle, Loader2, ShieldCheck, Eye, 
  Copy, Check, ChevronDown, ChevronUp, Scale, FileCheck, FolderPlus, Download,
  ExternalLink, Sparkles, AlertTriangle
} from "lucide-react";
import { documentService } from "@/services/documentService";
import { complaintService } from "@/services/complaintService";
import { aiService } from "@/services/aiService";
import { toast } from "sonner";
import Button from "@/components/common/Button";
import { useLanguage } from "@/context/LanguageContext";

const DocumentVerificationPanel = () => {
  const { t } = useLanguage();
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaintId, setSelectedComplaintId] = useState("");
  const [existingEvidence, setExistingEvidence] = useState([]);
  const [loadingEvidence, setLoadingEvidence] = useState(false);

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [documentType, setDocumentType] = useState("DEED");
  const [analyzing, setAnalyzing] = useState(false);
  const [attaching, setAttaching] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [copiedText, setCopiedText] = useState(false);
  const [expandedText, setExpandedText] = useState(false);
  const [viewingResultModal, setViewingResultModal] = useState(null);

  // Load citizen's complaints on mount
  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      const data = await complaintService.getMyComplaints();
      const list = Array.isArray(data) ? data : (data?.content || []);
      setComplaints(list);
      if (list.length > 0 && !selectedComplaintId) {
        setSelectedComplaintId(String(list[0].id));
        loadComplaintEvidence(list[0].id);
      }
    } catch (err) {
      console.warn("Failed to load citizen complaints:", err);
    }
  };

  const loadComplaintEvidence = async (cid) => {
    if (!cid) {
      setExistingEvidence([]);
      return;
    }
    setLoadingEvidence(true);
    try {
      const docs = await documentService.getComplaintDocuments(cid);
      setExistingEvidence(Array.isArray(docs) ? docs : []);
    } catch (err) {
      console.warn("Could not load evidence for complaint " + cid, err);
      setExistingEvidence([]);
    } finally {
      setLoadingEvidence(false);
    }
  };

  const handleComplaintChange = (e) => {
    const cid = e.target.value;
    setSelectedComplaintId(cid);
    loadComplaintEvidence(cid);
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setAnalysisResult(null);
      setCopiedText(false);
      setExpandedText(false);

      if (selected.type?.startsWith("image/") || /\.(jpg|jpeg|png|webp)$/i.test(selected.name)) {
        try {
          setPreviewUrl(URL.createObjectURL(selected));
        } catch (err) {
          setPreviewUrl(null);
        }
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast.error(t("evidenceVault.selectFileError", "Please select a document file to verify."));
      return;
    }

    setAnalyzing(true);
    try {
      let res;
      try {
        res = await documentService.verifyDocument(file, documentType);
      } catch (e1) {
        // Fallback to direct AI OCR endpoint
        res = await aiService.runOcr(file);
      }

      setAnalysisResult(res);
      toast.success("Document OCR & Evidence Analysis completed successfully!");
    } catch (err) {
      console.error("Document analysis error:", err);
      toast.error("Document verification encountered an issue. Please check file format.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAttachToComplaint = async () => {
    if (!file) {
      toast.error("Please choose a file to attach.");
      return;
    }
    if (!selectedComplaintId) {
      toast.error("Please select a registered complaint to attach this evidence to.");
      return;
    }

    setAttaching(true);
    const toastId = toast.loading("Attaching document and updating complaint evidence in database...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("complaintId", selectedComplaintId);
      formData.append("expectedDocumentType", documentType);

      const savedDoc = await documentService.uploadDocument(formData);
      toast.dismiss(toastId);
      toast.success(`Successfully attached to Complaint #${selectedComplaintId} and verified in database!`);
      
      // Reload evidence list
      await loadComplaintEvidence(selectedComplaintId);
    } catch (err) {
      toast.dismiss(toastId);
      const msg = err.response?.data?.message || err.message || "Failed to attach document.";
      toast.error(`Attachment failed: ${msg}`);
      console.error("Document upload error:", err);
    } finally {
      setAttaching(false);
    }
  };

  const handleInspectVerification = async (doc) => {
    try {
      const verification = await documentService.getDocumentVerification(doc.id);
      let parsedFields = {};
      try {
        parsedFields = JSON.parse(verification.extractedFieldsJson || "{}");
      } catch (e) {}

      let parsedReasons = [];
      try {
        parsedReasons = JSON.parse(verification.reasonsJson || "[]");
      } catch (e) {}

      setViewingResultModal({
        doc,
        verification,
        parsedFields,
        parsedReasons
      });
    } catch (err) {
      toast.error("Verification details not yet generated for this document.");
    }
  };

  const fullText = analysisResult?.exactText || analysisResult?.extractedText || analysisResult?.rawText || "";
  const isLongText = fullText.length > 250;
  const displayText = (!expandedText && isLongText) ? fullText.slice(0, 250) + "..." : fullText;

  const getStatusBadge = (status) => {
    switch (status) {
      case "VERIFIED":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">Verified</span>;
      case "REUPLOAD_REQUIRED":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300">Reupload Required</span>;
      case "REJECTED":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-300">Rejected / Non-Legal</span>;
      case "OCR_PROCESSING":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-800 border border-blue-300">Analyzing</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-stone-100 text-stone-700 border border-stone-300">{status || "Uploaded"}</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* ========================================================================= */}
      {/* 1. DOCUMENT UPLOAD & OCR ANALYZER CARD                                    */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-[#FFFDF8] border border-[#E6E1D8] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-[#E6E1D8] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-[#18332B] flex items-center gap-2">
              <Sparkles size={18} className="text-[#163D32]" />
              {t("evidenceVault.analyzerTitle", "Multimodal OCR & Legal Evidence Analyzer")}
            </h3>
            <p className="text-xs text-[#65736D] mt-0.5">
              {t("evidenceVault.analyzerSubtitle", "Upload photographs, deeds, or notices to extract exact text and evaluate legal relevance under Tamil Nadu statutory norms.")}
            </p>
          </div>

          {complaints.length > 0 && (
            <div className="sm:w-72">
              <label className="text-[10px] font-bold text-[#65736D] uppercase block mb-1">
                Attach to Grievance:
              </label>
              <select
                value={selectedComplaintId}
                onChange={handleComplaintChange}
                className="w-full px-3 py-1.5 rounded-xl border border-[#D8D2C5] bg-white text-xs font-bold text-[#18332B] focus:outline-none shadow-2xs"
              >
                {complaints.map(c => (
                  <option key={c.id} value={c.id}>
                    #{c.id}: {c.title?.slice(0, 30)}...
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Upload Zone */}
        <div className="p-8 rounded-2xl border-2 border-dashed border-[#DCEBDD] bg-[#F7F1E6]/30 hover:bg-[#DCEBDD]/20 transition text-center space-y-3 cursor-pointer relative">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          
          {previewUrl ? (
            <div className="flex flex-col items-center space-y-2">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-28 h-28 object-cover rounded-xl border border-[#D5CEBF] shadow-xs" 
              />
              <p className="text-xs font-bold text-[#18332B]">{file.name}</p>
              <span className="text-[10px] text-[#65736D]">{(file.size / 1024).toFixed(1)} KB • Image Loaded</span>
            </div>
          ) : (
            <div>
              <Upload className="mx-auto text-[#163D32]" size={36} />
              <p className="text-xs font-bold text-[#18332B] mt-2">
                {file ? file.name : t("evidenceVault.uploadBoxTitle", "Click to select or drag & drop document (PDF, PNG, JPG)")}
              </p>
              <p className="text-[10px] text-[#8B9690] mt-0.5">{t("evidenceVault.uploadBoxSubtitle", "PDF, JPG, JPEG, PNG, WEBP (Max 25MB)")} • Real OCR & Multimodal AI</p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-[#E6E1D8] bg-[#FFFDF8] text-xs font-bold text-[#18332B] focus:outline-none"
          >
            <option value="DEED">Title Deed / Sale Agreement</option>
            <option value="PATTA">Patta Passbook / Chitta / Land Record</option>
            <option value="RENTAL">Rental Agreement / Tenancy Proof</option>
            <option value="SALARY">Salary Slip / Wage Record</option>
            <option value="NOTICE">Court / Legal Notice</option>
            <option value="FIR">Police FIR / Complaint Copy</option>
            <option value="PHOTO_EVIDENCE">On-Site Dispute / Encroachment Photo</option>
          </select>

          <Button
            variant="primary"
            onClick={handleAnalyze}
            loading={analyzing}
            disabled={!file}
            className="flex-1"
          >
            {analyzing ? t("evidenceVault.verifyingBtn", "Analyzing Document OCR & Evidence...") : t("evidenceVault.verifyBtn", "Verify Document Readiness")}
          </Button>

          {selectedComplaintId && (
            <Button
              variant="outline"
              onClick={handleAttachToComplaint}
              loading={attaching}
              disabled={!file}
              className="border-[#163D32] text-[#163D32] hover:bg-[#DCEBDD]/40 font-bold"
            >
              <FolderPlus size={16} className="mr-1.5" />
              {attaching ? "Attaching..." : "Attach to Complaint"}
            </Button>
          )}
        </div>

        {/* Live Analysis Result */}
        {analysisResult && (
          <div className="p-6 rounded-2xl bg-[#F7F3EB] border border-[#DDD6C8] space-y-5 shadow-xs animate-in fade-in">
            {/* Header Score Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-[#163D32]" size={20} />
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#163D32] block">
                    AI Evidence Assessment
                  </span>
                  <span className="text-[11px] font-bold text-[#65736D]">
                    Detected: {analysisResult.documentType || documentType}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#65736D]">Readiness Score:</span>
                <span className={`px-3.5 py-1 rounded-full text-xs font-black shadow-xs text-white ${
                  (analysisResult.readinessScore ?? 0) >= 70 ? "bg-emerald-700" :
                  (analysisResult.readinessScore ?? 0) >= 40 ? "bg-amber-700" : "bg-rose-700"
                }`}>
                  {analysisResult.readinessScore ?? analysisResult.legibilityScore ?? 0}%
                </span>
              </div>
            </div>

            {/* AI Legal Evidence Analysis */}
            {(analysisResult.legalRelevance || analysisResult.caseRelevance || analysisResult.recommendations) && (
              <div className="p-4 rounded-2xl bg-[#EDE7DA] border border-[#DDD6C8] space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#163D32]">
                  <Scale size={16} className="text-[#1F5948]" />
                  <span>How This Evidence Relates to Legal Claims:</span>
                </div>
                <p className="text-xs text-[#203D32] leading-relaxed font-medium">
                  {analysisResult.legalRelevance || analysisResult.caseRelevance || analysisResult.recommendations}
                </p>
                {analysisResult.actionableAdvice && (
                  <div className="p-2.5 rounded-xl bg-white/80 border border-[#E2DBD0] text-[11px] text-[#2F473F] flex items-start gap-1.5">
                    <span className="font-bold text-[#163D32] shrink-0">💡 Legal Guidance:</span>
                    <span>{analysisResult.actionableAdvice}</span>
                  </div>
                )}
              </div>
            )}

            {/* Key Extracted Entities */}
            {((analysisResult.detectedDates?.length > 0) || (analysisResult.detectedReferenceNumbers?.length > 0) || (analysisResult.detectedParties?.length > 0) || analysisResult.sealOrSignatureDetected) ? (
              <div className="p-3 bg-white rounded-xl border border-[#E6E1D8] space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase text-[#65736D] block">Key Extracted Entities:</span>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.detectedDates?.map((d, di) => (
                    <span key={`date-${di}`} className="px-2.5 py-0.5 rounded-md bg-[#DCEBDD] text-[#163D32] text-[10px] font-bold border border-[#c5ddc6]">
                      📅 Date: {d}
                    </span>
                  ))}
                  {analysisResult.detectedReferenceNumbers?.map((r, ri) => (
                    <span key={`ref-${ri}`} className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-900 text-[10px] font-bold border border-blue-200">
                      🔢 Ref/ID: {r}
                    </span>
                  ))}
                  {analysisResult.detectedParties?.map((p, pi) => (
                    <span key={`party-${pi}`} className="px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-900 text-[10px] font-bold border border-purple-200">
                      👤 Party: {p}
                    </span>
                  ))}
                  {analysisResult.sealOrSignatureDetected && (
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                      ✓ Official Seal / Stamped
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-white rounded-xl border border-[#E6E1D8] text-[11px] text-[#65736D]">
                ℹ️ No dates, reference numbers, or official seals detected in this image.
              </div>
            )}

            {/* Exact OCR Document Content */}
            <div className="p-3.5 bg-white rounded-xl border border-[#E6E1D8] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-[#163D32] tracking-wider flex items-center gap-1.5">
                  <FileCheck size={14} className="text-[#1F5948]" />
                  Exact Document Content (OCR Transcribed):
                </span>
                {fullText && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(fullText);
                      setCopiedText(true);
                      setTimeout(() => setCopiedText(false), 2000);
                    }}
                    className="text-[10px] font-bold text-[#1F5948] hover:text-[#163D32] flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#FAF8F5] border border-[#E6E1D8] hover:bg-[#F2ECE1] transition cursor-pointer shadow-xs"
                  >
                    {copiedText ? (
                      <>
                        <Check size={11} className="text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={11} />
                        <span>Copy Content</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              
              {fullText ? (
                <>
                  <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E4DDD0] font-mono text-xs text-[#1D362C] leading-relaxed select-text whitespace-pre-wrap max-h-56 overflow-y-auto">
                    {displayText}
                  </div>
                  {isLongText && (
                    <button
                      type="button"
                      onClick={() => setExpandedText(prev => !prev)}
                      className="text-[11px] font-bold text-[#1F5948] hover:text-[#163D32] hover:underline flex items-center gap-1 cursor-pointer pt-0.5"
                    >
                      {expandedText ? (
                        <>Show Less <ChevronUp size={12} /></>
                      ) : (
                        <>Show Full Document Text ({fullText.length} chars) <ChevronDown size={12} /></>
                      )}
                    </button>
                  )}
                </>
              ) : (
                <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E4DDD0] text-xs text-[#65736D] italic">
                  No textual clauses, numbers, or stamps detected in this image.
                </div>
              )}
            </div>

            {/* Quick Action to attach to selected complaint */}
            {selectedComplaintId && (
              <div className="pt-2 flex justify-end">
                <Button
                  variant="primary"
                  onClick={handleAttachToComplaint}
                  loading={attaching}
                  className="bg-[#163D32] hover:bg-[#1F5948] text-xs font-bold"
                >
                  <FolderPlus size={15} className="mr-1.5" />
                  Save & Link to Complaint #{selectedComplaintId} Evidence Vault
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. ATTACHED EVIDENCE VAULT FOR SELECTED COMPLAINT                         */}
      {/* ========================================================================= */}
      {selectedComplaintId && (
        <div className="rounded-3xl bg-[#FFFDF8] border border-[#E6E1D8] p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E6E1D8] pb-3">
            <div>
              <h4 className="text-sm font-extrabold text-[#18332B] flex items-center gap-2">
                <FileText size={16} className="text-[#163D32]" />
                Attached Evidence for Complaint #{selectedComplaintId}
              </h4>
              <p className="text-[11px] text-[#65736D]">
                Records securely hashed and stored in MySQL database (`documents` & `document_verification_results`)
              </p>
            </div>
            <span className="text-xs font-bold text-[#163D32] bg-[#DCEBDD] px-2.5 py-1 rounded-full">
              {existingEvidence.length} Document(s)
            </span>
          </div>

          {loadingEvidence ? (
            <div className="py-8 flex justify-center items-center gap-2 text-xs text-[#65736D]">
              <Loader2 className="animate-spin text-[#163D32]" size={18} />
              Loading attached documents...
            </div>
          ) : existingEvidence.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#65736D] bg-[#F7F1E6]/40 rounded-2xl border border-dashed border-[#D8D2C5]">
              No evidence files attached to this complaint yet. Use the upload panel above to attach verified evidence.
            </div>
          ) : (
            <div className="divide-y divide-[#E6E1D8]">
              {existingEvidence.map((doc) => (
                <div key={doc.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#18332B]">{doc.fileName}</span>
                      {getStatusBadge(doc.verificationStatus)}
                      {doc.verificationScore !== null && (
                        <span className="text-[10px] font-bold text-[#65736D] bg-white px-2 py-0.5 rounded border border-[#E6E1D8]">
                          Score: {(doc.verificationScore * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#65736D]">
                      Type: <strong className="text-[#18332B]">{doc.predictedDocumentType || "Evidence Document"}</strong> • 
                      Uploaded: {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString() : "Recently"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleInspectVerification(doc)}
                      className="px-3 py-1.5 rounded-xl border border-[#D5CEBF] bg-white text-[11px] font-bold text-[#18332B] hover:bg-[#F7F1E6] transition cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <Eye size={13} className="text-[#163D32]" />
                      Inspect Findings
                    </button>
                    <a
                      href={documentService.downloadDocumentUrl(doc.id)}
                      download
                      className="px-3 py-1.5 rounded-xl bg-[#DCEBDD] text-[11px] font-bold text-[#163D32] hover:bg-[#cbe1cc] transition flex items-center gap-1 shadow-2xs"
                    >
                      <Download size={13} />
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MODAL: DETAILED AI EVIDENCE VERIFICATION FINDINGS                      */}
      {/* ========================================================================= */}
      {viewingResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#FFFDF8] border border-[#DDD6C8] rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E6E1D8] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={22} className="text-[#163D32]" />
                <h3 className="text-base font-extrabold text-[#18332B]">
                  Evidence Verification Dossier
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingResultModal(null)}
                className="w-8 h-8 rounded-full bg-[#F2EDE2] hover:bg-[#E5DFD2] text-[#18332B] font-bold text-xs flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-white rounded-xl border border-[#E6E1D8] space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#65736D]">File Name:</span>
                  <span className="font-extrabold text-[#18332B]">{viewingResultModal.doc.fileName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#65736D]">Document Classification:</span>
                  <span className="font-extrabold text-[#163D32]">{viewingResultModal.verification.documentType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#65736D]">Verification Status:</span>
                  <span>{getStatusBadge(viewingResultModal.verification.status)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#65736D]">AI Engine / Model:</span>
                  <span className="font-mono text-[10px] text-[#65736D]">{viewingResultModal.verification.engine}</span>
                </div>
              </div>

              {/* Legal Relevance */}
              {viewingResultModal.parsedFields.legalRelevance && (
                <div className="p-4 bg-[#EDE7DA] rounded-xl border border-[#DDD6C8] space-y-1.5">
                  <span className="text-xs font-black text-[#163D32] flex items-center gap-1.5">
                    <Scale size={15} /> Statutory Relevance to Dispute:
                  </span>
                  <p className="text-xs text-[#203D32] leading-relaxed">
                    {viewingResultModal.parsedFields.legalRelevance}
                  </p>
                </div>
              )}

              {/* Actionable Advice */}
              {viewingResultModal.parsedFields.actionableAdvice && (
                <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
                  <span className="font-bold block">💡 Next Steps / Actionable Advice:</span>
                  <p>{viewingResultModal.parsedFields.actionableAdvice}</p>
                </div>
              )}

              {/* OCR Transcribed Text */}
              <div className="p-3.5 bg-white rounded-xl border border-[#E6E1D8] space-y-2">
                <span className="text-[10px] font-extrabold uppercase text-[#163D32] block">
                  Transcribed Text / OCR Content:
                </span>
                <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E4DDD0] font-mono text-xs text-[#1D362C] leading-relaxed select-text whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {viewingResultModal.verification.ocrText || viewingResultModal.verification.maskedOcrText || "(No textual content detected in this image)"}
                </div>
              </div>

              {/* Reasons if any */}
              {viewingResultModal.parsedReasons?.length > 0 && (
                <div className="p-3 bg-white rounded-xl border border-[#E6E1D8] space-y-1 text-xs">
                  <span className="text-[10px] font-extrabold uppercase text-[#65736D] block">System Observations:</span>
                  <ul className="list-disc list-inside text-[#65736D] space-y-0.5">
                    {viewingResultModal.parsedReasons.map((r, ri) => (
                      <li key={ri}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="primary"
                onClick={() => setViewingResultModal(null)}
                className="bg-[#163D32] hover:bg-[#1F5948] text-xs font-bold"
              >
                Close Dossier
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentVerificationPanel;
