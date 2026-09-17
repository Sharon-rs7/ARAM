import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/common/DashboardLayout";
import { 
  ArrowLeft, MessageSquare, ClipboardList, FileText, Calendar, 
  Sparkles, CheckCircle2, User, Globe, AlertTriangle, Loader2,
  Trash2, Upload, MessageCircle, Info, Clock, Plus, Check, X,
  Award, Send, ExternalLink, ShieldCheck, Star
} from "lucide-react";
import { volunteerService } from "@/services/volunteerService";
import { complaintService } from "@/services/complaintService";
import { chatbotService } from "@/services/chatbotService";
import { toast } from "sonner";
import CaseChatPanel from "@/components/guide/CaseChatPanel";

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Tab states: 'overview', 'evidence', 'timeline', 'chat'
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview");
  
  const [loading, setLoading] = useState(true);
  const [complaint, setComplaint] = useState(null);
  const [status, setStatus] = useState("IN_PROGRESS");
  const [notes, setNotes] = useState("");
  const [resolutionSummary, setResolutionSummary] = useState("");
  const [resolutionType, setResolutionType] = useState("COMMUNITY_MEDIATION");
  const [updating, setUpdating] = useState(false);
  
  // AI assistant helpers
  const [aiAssistantResult, setAiAssistantResult] = useState("");
  const [aiAssistantLoading, setAiAssistantLoading] = useState(false);
  const [customAiQuery, setCustomAiQuery] = useState("");

  // Documents & Requests state
  const [docRequests, setDocRequests] = useState([]);
  const [evidenceDocs, setEvidenceDocs] = useState([]);
  const [newDocName, setNewDocName] = useState("");
  const [showRequestDocModal, setShowRequestDocModal] = useState(false);

  // Resolution modal state
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveFormSummary, setResolveFormSummary] = useState("");
  const [resolveFormType, setResolveFormType] = useState("COMMUNITY_MEDIATION");

  // Self Evaluation state
  const [showSelfEvalModal, setShowSelfEvalModal] = useState(false);
  const [selfEvalSubmitted, setSelfEvalSubmitted] = useState(false);
  const [selfEvalData, setSelfEvalData] = useState(null);
  const [selfEvalForm, setSelfEvalForm] = useState({
    preparationRating: 5,
    communicationRating: 5,
    legalClarityRating: 5,
    citizenSatisfactionPerception: 5,
    outcomeAchieved: "FULL_RESOLUTION",
    challengesFaced: "",
    lessonsLearned: ""
  });

  const loadDetails = async () => {
    try {
      setLoading(true);
      const data = await volunteerService.getCaseById(id);
      setComplaint(data);
      setStatus(data.status || "IN_PROGRESS");
      setNotes(data.legalOpinion || "");
      setResolutionSummary(data.resolutionSummary || "");
      setResolutionType(data.resolutionType || "COMMUNITY_MEDIATION");

      try {
        const requests = await complaintService.getDocumentRequests(id);
        setDocRequests(requests || []);
      } catch (e) {
        console.warn("Could not load document requests:", e);
      }

      try {
        const docs = await volunteerService.getDocuments(id);
        setEvidenceDocs(docs || []);
      } catch (e) {
        console.warn("Could not load evidence documents:", e);
      }

      // Check for existing self-evaluation
      if (data.status === "RESOLVED") {
        try {
          const evalRes = await volunteerService.getSelfEvaluation(id);
          if (evalRes && evalRes.id) {
            setSelfEvalSubmitted(true);
            setSelfEvalData(evalRes);
          }
        } catch (e) {
          // not yet evaluated
        }
      }
    } catch (err) {
      toast.error("Failed to load case workspace details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [id]);

  // Update Case status
  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      await volunteerService.updateCaseStatus(id, newStatus, notes);
      setStatus(newStatus);
      setComplaint(prev => ({ ...prev, status: newStatus }));
      toast.success(`Case status updated to ${newStatus.replace(/_/g, " ")}`);
    } catch (err) {
      toast.error("Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  // Add custom doc request
  const handleRequestDocument = async () => {
    if (!newDocName.trim()) return;
    try {
      await volunteerService.requestDocument(id, {
        documentName: newDocName.trim(),
        reason: "Required for legal aid evidence verification."
      });
      toast.success("Evidence document requested!");
      setNewDocName("");
      setShowRequestDocModal(false);
      const requests = await complaintService.getDocumentRequests(id);
      setDocRequests(requests || []);
    } catch (err) {
      toast.error("Failed to request document.");
    }
  };

  // Verify Document
  const handleVerifyDocument = async (docId) => {
    try {
      await volunteerService.verifyDocument(docId);
      toast.success("Document marked as verified!");
      const docs = await volunteerService.getDocuments(id);
      setEvidenceDocs(docs || []);
    } catch (err) {
      toast.error("Failed to verify document.");
    }
  };

  // Reject Document
  const handleRejectDocument = async (docId) => {
    try {
      await volunteerService.rejectDocument(docId);
      toast.warning("Document rejected.");
      const docs = await volunteerService.getDocuments(id);
      setEvidenceDocs(docs || []);
    } catch (err) {
      toast.error("Failed to reject document.");
    }
  };

  // Submit Case Resolution
  const handleConfirmResolution = async () => {
    if (!resolveFormSummary.trim()) {
      toast.error("Please provide a summary of the resolution.");
      return;
    }

    try {
      setUpdating(true);
      await volunteerService.resolveCase(id, {
        resolutionSummary: resolveFormSummary.trim(),
        resolutionType: resolveFormType
      });
      setResolutionSummary(resolveFormSummary.trim());
      setResolutionType(resolveFormType);
      setStatus("RESOLVED");
      setComplaint(prev => ({ ...prev, status: "RESOLVED", resolutionSummary: resolveFormSummary.trim(), resolutionType: resolveFormType }));
      setShowResolveModal(false);
      toast.success("Case successfully marked as RESOLVED! Notification sent to citizen.");
      // Prompt self-evaluation
      setShowSelfEvalModal(true);
    } catch (err) {
      toast.error("Failed to resolve case. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  // Submit Volunteer Self-Evaluation
  const handleSubmitSelfEvaluation = async () => {
    try {
      setUpdating(true);
      const res = await volunteerService.submitSelfEvaluation(id, selfEvalForm);
      setSelfEvalSubmitted(true);
      setSelfEvalData(res);
      setShowSelfEvalModal(false);
      toast.success("Volunteer self-evaluation submitted successfully! Experience points awarded.");
    } catch (err) {
      toast.error("Failed to submit self-evaluation.");
    } finally {
      setUpdating(false);
    }
  };

  const handleAcknowledge = async () => {
    try {
      setUpdating(true);
      await volunteerService.acknowledgeCase(id);
      setStatus("IN_PROGRESS");
      setComplaint(prev => ({ ...prev, status: "IN_PROGRESS" }));
      toast.success("Case acknowledged! Status transitioned to IN PROGRESS.");
    } catch (err) {
      toast.error("Failed to acknowledge case.");
    } finally {
      setUpdating(false);
    }
  };

  // Trigger ARAM AI Assistant prompts
  const triggerAiAssistant = async (promptType, customText = "") => {
    setAiAssistantLoading(true);
    setAiAssistantResult("");
    
    let promptText = "";
    if (customText) {
      promptText = customText;
    } else if (promptType === "summarize") {
      promptText = `Please summarize this complaint case in 2 concise sentences: Title: ${complaint.title}. Description: ${complaint.description}.`;
    } else if (promptType === "missing") {
      promptText = `Identify missing information or evidence documents for this legal aid case: Title: ${complaint.title}. Description: ${complaint.description}.`;
    } else if (promptType === "questions") {
      promptText = `Suggest 3 relevant clarifying questions I should ask the citizen for this legal case: Title: ${complaint.title}. Description: ${complaint.description}.`;
    } else {
      promptText = `Provide 3 recommended next action steps for the guide handling this complaint case: Title: ${complaint.title}. Description: ${complaint.description}.`;
    }

    try {
      // Try high-context case assistant
      const response = await chatbotService.askCaseAssistant({
        complaintId: id,
        userQuery: promptText,
        userRole: "GUIDE",
        language: complaint.language || "en",
        caseTitle: complaint.title,
        caseDescription: complaint.description
      });
      setAiAssistantResult(response.answer || response.reply || response.response || "No response generated.");
    } catch (err) {
      // Fallback to legal AI
      try {
        const fallbackRes = await chatbotService.askLegalAI(promptText, complaint.language || "en");
        setAiAssistantResult(fallbackRes.explanation || fallbackRes.reply || "AI guidance generated.");
      } catch (fErr) {
        toast.error("AI Case Assistant is currently offline.");
      }
    } finally {
      setAiAssistantLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center text-[#65736D] font-bold">
          <Loader2 className="animate-spin mr-2 text-[#163D32]" size={20} />
          Loading Guide Workspace...
        </div>
      </DashboardLayout>
    );
  }

  if (!complaint) {
    return (
      <DashboardLayout>
        <div className="text-center py-16 text-[#65736D] font-bold">Case details not found.</div>
      </DashboardLayout>
    );
  }

  const priority = complaint.priority || "HIGH";
  const customCaseId = complaint.complaintCustomId || complaint.customId || `ARAM-2026-TN-${String(complaint.id).padStart(6, "0")}`;

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-8 max-w-5xl mx-auto">
        
        {/* Top Back Link */}
        <div className="flex items-center justify-between border-b border-[#E6E1D8] pb-4">
          <button
            onClick={() => navigate("/guide/assigned-cases")}
            className="flex items-center gap-1.5 text-xs font-bold text-[#65736D] hover:text-[#163D32] transition cursor-pointer"
          >
            <ArrowLeft size={16} /> Back to My Assigned Cases
          </button>
        </div>

        {/* Acknowledgment Banner Action */}
        {(complaint.status === "HELPER_ASSIGNED" || complaint.status === "PENDING" || status === "HELPER_ASSIGNED") && (
          <div className="bg-[#FFF9EB] border border-[#F3DEB2] rounded-2xl p-4.5 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
            <div className="flex gap-3">
              <span className="text-[#B96845] font-black text-sm">⚠️ Action Required:</span>
              <div className="text-xs">
                <p className="text-[#163D32] font-black">Awaiting Case Acknowledgment</p>
                <p className="text-[#65736D] mt-0.5 font-medium">Please acknowledge your assignment to unlock communication and work on this case.</p>
              </div>
            </div>
            <button
              onClick={handleAcknowledge}
              disabled={updating}
              className="bg-[#B96845] hover:bg-[#a25938] disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-sm cursor-pointer whitespace-nowrap"
            >
              {updating ? "Acknowledging..." : "Acknowledge Case"}
            </button>
          </div>
        )}

        {/* Resolved Case Banner & Self Evaluation Banner */}
        {status === "RESOLVED" && (
          <div className="bg-[#DCEBDD]/60 border border-[#c5ddc6] rounded-2xl p-4.5 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-[#1F5948] w-5 h-5 shrink-0" />
              <div className="text-xs">
                <p className="text-[#163D32] font-black">Case Successfully Resolved</p>
                <p className="text-[#65736D] mt-0.5 font-medium">
                  {resolutionSummary || "Grievance resolved through community legal guidance and mediation."}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSelfEvalModal(true)}
              className="px-5 py-2.5 bg-[#163D32] hover:bg-[#1F5948] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
            >
              <Award size={14} />
              {selfEvalSubmitted ? "View Self-Evaluation" : "Complete Self-Evaluation"}
            </button>
          </div>
        )}

        {/* Workspace Title Header Card */}
        <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-black text-[#163D32] bg-[#FAF6F0] px-2.5 py-1 rounded-lg border border-[#E6E1D8]">
                  {customCaseId}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  priority === "HIGH" || priority === "EMERGENCY"
                    ? "bg-[#FDE8E8] text-[#9E2A2B] border-[#F8B4B4]"
                    : "bg-[#DCEBDD] text-[#163D32] border-[#c5ddc6]"
                }`}>
                  {priority} Priority
                </span>
                {complaint.emergencyFlag && (
                  <span className="px-2.5 py-0.5 bg-[#9E2A2B] text-white font-black text-[10px] rounded-full uppercase">
                    Emergency
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-[#163D32] tracking-tight">
                {complaint.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#65736D] font-medium pt-1">
                <span>Citizen: <strong className="text-[#163D32]">{complaint.citizenName || complaint.userName || "Citizen"}</strong></span>
                <span>•</span>
                <span>District: <strong className="text-[#163D32]">{complaint.district || "Default"}</strong></span>
                <span>•</span>
                <span>Language: <strong className="text-[#163D32]">{complaint.language === "ta-IN" ? "Tamil" : "English"}</strong></span>
                <span>•</span>
                <span>Category: <strong className="text-[#163D32]">{complaint.category || "GENERAL"}</strong></span>
              </div>
            </div>
            
            <div className="shrink-0">
              <span className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 ${
                status === "RESOLVED"
                  ? "bg-[#DCEBDD] text-[#163D32] border-[#c5ddc6]"
                  : "bg-[#F7F1E6] text-[#B96845] border-[#E6E1D8]"
              }`}>
                <span className="h-2 w-2 rounded-full bg-current" />
                {status.replace(/_/g, " ")}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Selection Row */}
        <div className="flex gap-1.5 p-1.5 bg-[#F7F1E6]/80 rounded-2xl border border-[#E6E1D8] w-fit">
          {[
            { id: "overview", label: "Overview & Copilot" },
            { id: "evidence", label: `Evidence (${evidenceDocs.length})` },
            { id: "timeline", label: "Timeline" },
            { id: "chat", label: "Secure Chat" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#163D32] text-white shadow-sm"
                  : "text-[#65736D] hover:text-[#163D32]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Split workspace Grid layout */}
        <div className="grid gap-6 lg:grid-cols-3 items-start">
          
          {/* Left Area (65% width equivalent) */}
          <div className="lg:col-span-2 space-y-6">
            
            {activeTab === "overview" && (
              <div className="space-y-6">
                
                {/* Original Complaint Description */}
                <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-6 shadow-sm space-y-3">
                  <h3 className="text-[10px] font-extrabold text-[#65736D] uppercase tracking-wider">
                    Original Citizen Grievance
                  </h3>
                  <p className="text-xs leading-relaxed text-[#18332B] bg-[#FAF6F0] p-4.5 rounded-2xl border border-[#E6E1D8] font-medium whitespace-pre-line">
                    {complaint.description}
                  </p>
                </div>

                {/* AI Case Assistant Panel */}
                <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#E6E1D8] pb-3">
                    <Sparkles size={16} className="text-[#1F5948]" />
                    <h3 className="text-xs font-extrabold text-[#163D32] uppercase tracking-wider">
                      ARAM AI Copilot & Statutory Guidance
                    </h3>
                  </div>

                  {/* Preset quick actions */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      onClick={() => triggerAiAssistant("summarize")}
                      className="py-2.5 bg-[#FAF6F0] hover:bg-[#DCEBDD] border border-[#E6E1D8] hover:border-[#c5ddc6] rounded-xl text-[11px] font-bold text-[#163D32] cursor-pointer transition"
                    >
                      Summarize Case
                    </button>
                    <button
                      onClick={() => triggerAiAssistant("missing")}
                      className="py-2.5 bg-[#FAF6F0] hover:bg-[#DCEBDD] border border-[#E6E1D8] hover:border-[#c5ddc6] rounded-xl text-[11px] font-bold text-[#163D32] cursor-pointer transition"
                    >
                      Find Missing Info
                    </button>
                    <button
                      onClick={() => triggerAiAssistant("questions")}
                      className="py-2.5 bg-[#FAF6F0] hover:bg-[#DCEBDD] border border-[#E6E1D8] hover:border-[#c5ddc6] rounded-xl text-[11px] font-bold text-[#163D32] cursor-pointer transition"
                    >
                      Suggest Questions
                    </button>
                    <button
                      onClick={() => triggerAiAssistant("steps")}
                      className="py-2.5 bg-[#FAF6F0] hover:bg-[#DCEBDD] border border-[#E6E1D8] hover:border-[#c5ddc6] rounded-xl text-[11px] font-bold text-[#163D32] cursor-pointer transition"
                    >
                      Suggest Steps
                    </button>
                  </div>

                  {/* Custom query input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customAiQuery}
                      onChange={(e) => setCustomAiQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && customAiQuery.trim()) {
                          triggerAiAssistant("custom", customAiQuery.trim());
                        }
                      }}
                      placeholder="Ask copilot about legal sections, precedents, or drafting guidance..."
                      className="flex-1 h-10 px-3.5 bg-[#FAF6F0] border border-[#E6E1D8] focus:border-[#163D32] rounded-xl text-xs text-[#18332B] placeholder:text-[#8B9690] outline-none font-medium"
                    />
                    <button
                      onClick={() => {
                        if (customAiQuery.trim()) {
                          triggerAiAssistant("custom", customAiQuery.trim());
                        }
                      }}
                      disabled={aiAssistantLoading || !customAiQuery.trim()}
                      className="px-4 bg-[#163D32] hover:bg-[#1F5948] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
                    >
                      <Send size={12} /> Ask
                    </button>
                  </div>

                  {aiAssistantLoading && (
                    <div className="flex items-center justify-center py-4 text-xs text-[#163D32] font-bold gap-2">
                      <Loader2 size={16} className="animate-spin text-[#1F5948]" />
                      Analyzing case facts and statutory RAG corpus...
                    </div>
                  )}

                  {aiAssistantResult && (
                    <div className="p-4.5 bg-[#DCEBDD]/40 border border-[#c5ddc6] rounded-2xl text-xs text-[#163D32] leading-relaxed font-medium whitespace-pre-line animate-in fade-in duration-200">
                      {aiAssistantResult}
                    </div>
                  )}
                </div>

                {/* Legal Opinion / Case Notes */}
                <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-6 shadow-sm space-y-3">
                  <h3 className="text-[10px] font-extrabold text-[#65736D] uppercase tracking-wider">
                    Legal Guide Assessment & Notes
                  </h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter your confidential legal assessment, observation notes, or action recommendations..."
                    rows={4}
                    className="w-full p-3.5 bg-[#FAF6F0] border border-[#E6E1D8] focus:border-[#163D32] rounded-2xl text-xs text-[#18332B] placeholder:text-[#8B9690] outline-none font-medium"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={async () => {
                        try {
                          await volunteerService.addCaseNote(id, notes);
                          toast.success("Case assessment notes saved.");
                        } catch (e) {
                          toast.error("Failed to save note.");
                        }
                      }}
                      className="px-5 py-2.5 bg-[#163D32] hover:bg-[#1F5948] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm"
                    >
                      Save Notes
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* Evidence tab content */}
            {activeTab === "evidence" && (
              <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E1D8] pb-4">
                  <div>
                    <h3 className="text-xs font-extrabold text-[#163D32] uppercase tracking-wider">
                      Evidence Documents & Verifications
                    </h3>
                    <p className="text-xs text-[#65736D] font-medium mt-0.5">
                      Review uploaded evidence, verify authenticity, or request missing documents.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRequestDocModal(true)}
                    className="px-4 py-2 bg-[#163D32] hover:bg-[#1F5948] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
                  >
                    <Plus size={14} /> Request Document
                  </button>
                </div>

                {/* Uploaded Evidence Files */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-extrabold text-[#65736D] uppercase tracking-wider">
                    Uploaded Files ({evidenceDocs.length})
                  </h4>

                  {evidenceDocs.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#65736D] border border-dashed border-[#E6E1D8] rounded-2xl bg-[#FAF6F0] font-medium">
                      No evidence documents have been uploaded for this complaint yet.
                    </div>
                  ) : (
                    evidenceDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-[#E6E1D8] bg-[#FAF6F0] gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-[#DCEBDD] rounded-xl text-[#163D32]">
                            <FileText size={18} />
                          </div>
                          <div>
                            <h5 className="font-bold text-xs text-[#163D32]">
                              {doc.fileName || doc.originalFilename || `Document #${doc.id}`}
                            </h5>
                            <div className="flex items-center gap-2 text-[10px] text-[#65736D] font-medium mt-0.5">
                              <span>Status: <strong className={doc.verificationStatus === "VERIFIED" ? "text-[#1F5948]" : doc.verificationStatus === "REJECTED" ? "text-[#9E2A2B]" : "text-[#B96845]"}>{doc.verificationStatus || "PENDING"}</strong></span>
                              {doc.fileSize && <span>• {(doc.fileSize / 1024).toFixed(1)} KB</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {doc.verificationStatus !== "VERIFIED" && (
                            <button
                              onClick={() => handleVerifyDocument(doc.id)}
                              className="px-3 py-1.5 bg-[#DCEBDD] hover:bg-[#c5ddc6] text-[#163D32] rounded-xl text-xs font-bold transition flex items-center gap-1 border border-[#c5ddc6] cursor-pointer"
                            >
                              <Check size={12} /> Verify
                            </button>
                          )}
                          {doc.verificationStatus !== "REJECTED" && (
                            <button
                              onClick={() => handleRejectDocument(doc.id)}
                              className="px-3 py-1.5 bg-[#FDE8E8] hover:bg-[#fbd0d0] text-[#9E2A2B] rounded-xl text-xs font-bold transition flex items-center gap-1 border border-[#F8B4B4] cursor-pointer"
                            >
                              <X size={12} /> Reject
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Requested Documents List */}
                {docRequests.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-[#E6E1D8]">
                    <h4 className="text-[10px] font-extrabold text-[#65736D] uppercase tracking-wider">
                      Requested from Citizen ({docRequests.length})
                    </h4>
                    {docRequests.map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center justify-between p-4 rounded-2xl border border-[#E6E1D8] bg-[#FAF6F0] text-xs"
                      >
                        <div>
                          <span className="font-bold text-[#163D32]">{req.documentName}</span>
                          <p className="text-[10px] text-[#65736D] font-medium mt-0.5">{req.reason}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-[#FFF9EB] text-[#B96845] border border-[#F3DEB2] font-black uppercase tracking-wider text-[9px]">
                          {req.status || "REQUESTED"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Timeline tab content */}
            {activeTab === "timeline" && (
              <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-6 shadow-sm space-y-6">
                <h3 className="text-xs font-extrabold text-[#163D32] uppercase tracking-wider border-b border-[#E6E1D8] pb-4">
                  Case Lifecycle Timeline
                </h3>

                <div className="space-y-6 pl-2">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center shrink-0">
                      <span className="h-3.5 w-3.5 rounded-full bg-[#1F5948] ring-4 ring-[#DCEBDD]" />
                      <span className="w-0.5 h-12 bg-[#E6E1D8] mt-1" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#163D32]">Complaint Submitted & Grounded</h4>
                      <p className="text-[11px] text-[#65736D] mt-0.5 font-medium">{complaint.createdAt ? new Date(complaint.createdAt).toLocaleString() : "Initial stage"}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex flex-col items-center shrink-0">
                      <span className="h-3.5 w-3.5 rounded-full bg-[#1F5948] ring-4 ring-[#DCEBDD]" />
                      <span className="w-0.5 h-12 bg-[#E6E1D8] mt-1" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#163D32]">AI Triage & Classification Completed</h4>
                      <p className="text-[11px] text-[#65736D] mt-0.5 font-medium">Automated RAG grounded analysis</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex flex-col items-center shrink-0">
                      <span className="h-3.5 w-3.5 rounded-full bg-[#163D32] ring-4 ring-[#DCEBDD]" />
                      {status === "RESOLVED" && <span className="w-0.5 h-12 bg-[#E6E1D8] mt-1" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#163D32]">Legal Guide Assigned</h4>
                      <p className="text-[11px] text-[#65736D] mt-0.5 font-medium">{complaint.assignedAt ? new Date(complaint.assignedAt).toLocaleString() : "Active Legal Guide"}</p>
                    </div>
                  </div>

                  {status === "RESOLVED" && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center shrink-0">
                        <span className="h-3.5 w-3.5 rounded-full bg-[#1F5948] ring-4 ring-[#DCEBDD]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-[#1F5948]">Case Resolved</h4>
                        <p className="text-[11px] text-[#65736D] mt-0.5 font-medium">{complaint.resolvedAt ? new Date(complaint.resolvedAt).toLocaleString() : "Resolution completed"}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Chat Tab content */}
            {activeTab === "chat" && (
              <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-6 shadow-sm">
                <CaseChatPanel complaintId={complaint.id} userRole="HELPER" />
              </div>
            )}

          </div>

          {/* Right Area Workspace Panels (35% width equivalent) */}
          <div className="space-y-6">
            
            {/* Case Status Dropdown card */}
            <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-6 shadow-sm space-y-4">
              <span className="text-[10px] font-extrabold text-[#65736D] uppercase tracking-wider block">
                Case Status Update
              </span>
              
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-black text-[#163D32] uppercase">
                  ● {status.replace(/_/g, " ")}
                </span>
                
                <select
                  value={status}
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                  disabled={updating}
                  className="h-10 px-3 rounded-xl border border-[#E6E1D8] text-xs font-bold text-[#163D32] bg-[#FAF6F0] outline-none cursor-pointer"
                >
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="WAITING_FOR_CITIZEN">Waiting for Citizen</option>
                  <option value="EVIDENCE_REVIEW">Evidence Review</option>
                  <option value="ACTION_RECOMMENDED">Action Recommended</option>
                  <option value="REFERRED_TO_AUTHORITY">Referred to Authority</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-extrabold text-[#163D32] uppercase tracking-wider border-b border-[#E6E1D8] pb-3">
                Quick Actions
              </h3>
              
              <div className="space-y-2.5">
                <button
                  onClick={() => setActiveTab("chat")}
                  className="w-full text-center py-3 bg-[#163D32] hover:bg-[#1F5948] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm"
                >
                  Message Citizen
                </button>
                <button
                  onClick={() => {
                    setActiveTab("evidence");
                    setShowRequestDocModal(true);
                  }}
                  className="w-full text-center py-3 bg-[#FAF6F0] hover:bg-[#E6E1D8] border border-[#E6E1D8] text-[#163D32] rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Request Evidence
                </button>
                <button
                  onClick={async () => {
                    const reason = prompt("Please provide reason for escalating this case to Regional Admin:");
                    if (reason && reason.trim()) {
                      try {
                        await volunteerService.escalateCase(id, reason.trim());
                        toast.success("Case escalated to Regional Administrator.");
                        setStatus("ESCALATED");
                      } catch (e) {
                        toast.error("Failed to escalate case.");
                      }
                    }
                  }}
                  className="w-full text-center py-3 bg-[#FDE8E8] hover:bg-[#fbd0d0] text-[#9E2A2B] rounded-xl text-xs font-bold transition border border-[#F8B4B4] cursor-pointer"
                >
                  Escalate Case to Admin
                </button>
              </div>
            </div>

            {/* Propose Resolution Panel */}
            <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-6 shadow-sm space-y-4">
              <span className="text-[10px] font-extrabold text-[#65736D] uppercase tracking-wider block">
                Resolution Workflow
              </span>
              {status !== "RESOLVED" ? (
                <button
                  onClick={() => {
                    setResolveFormSummary(resolutionSummary || "");
                    setShowResolveModal(true);
                  }}
                  className="w-full py-3.5 bg-[#1F5948] hover:bg-[#163D32] text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer text-center"
                >
                  Propose Final Resolution
                </button>
              ) : (
                <button
                  onClick={() => setShowSelfEvalModal(true)}
                  className="w-full py-3.5 bg-[#163D32] hover:bg-[#1F5948] text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer text-center flex items-center justify-center gap-2"
                >
                  <Award size={14} />
                  {selfEvalSubmitted ? "View Self-Evaluation" : "Complete Self-Evaluation"}
                </button>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Request document modal popup */}
      {showRequestDocModal && (
        <div className="fixed inset-0 z-50 bg-[#163D32]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF8] rounded-3xl border border-[#E6E1D8] p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-sm font-black text-[#163D32]">Request Evidence Document</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                placeholder="e.g. Land Registry Deed or FIR Copy"
                className="w-full h-10 px-3.5 bg-[#FAF6F0] border border-[#E6E1D8] focus:border-[#163D32] rounded-xl text-xs text-[#18332B] outline-none font-medium"
              />
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={() => setShowRequestDocModal(false)}
                className="px-4 py-2 border border-[#E6E1D8] bg-[#FAF6F0] rounded-xl text-xs font-bold text-[#65736D] hover:text-[#163D32] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestDocument}
                className="px-5 py-2 bg-[#163D32] hover:bg-[#1F5948] text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm"
              >
                Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Case Resolution Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 bg-[#163D32]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF8] rounded-3xl border border-[#E6E1D8] p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-[#163D32]">
              Propose Final Case Resolution
            </h3>
            <p className="text-xs text-[#65736D] font-medium">
              Document how this legal aid grievance was settled or guided. The citizen will be notified via email and in-app alert.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-extrabold text-[#65736D] uppercase tracking-wider block mb-1">
                  Resolution Type
                </label>
                <select
                  value={resolveFormType}
                  onChange={(e) => setResolveFormType(e.target.value)}
                  className="w-full h-10 px-3 bg-[#FAF6F0] border border-[#E6E1D8] rounded-xl text-xs text-[#163D32] font-bold outline-none cursor-pointer"
                >
                  <option value="COMMUNITY_MEDIATION">Community / Informal Mediation</option>
                  <option value="DOCUMENT_ASSISTANCE">Document Drafting & Filing Guidance</option>
                  <option value="REFERRED_TO_DLSA">Referred to District Legal Services Authority (DLSA)</option>
                  <option value="LEGAL_COUNSEL_PROVIDED">Formal Legal Counsel & Advice Provided</option>
                  <option value="MUTUAL_SETTLEMENT">Mutual Settlement Reached</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-[#65736D] uppercase tracking-wider block mb-1">
                  Resolution Summary
                </label>
                <textarea
                  value={resolveFormSummary}
                  onChange={(e) => setResolveFormSummary(e.target.value)}
                  placeholder="Summarize the resolution steps, agreements reached, or official representations submitted..."
                  rows={4}
                  className="w-full p-3.5 bg-[#FAF6F0] border border-[#E6E1D8] focus:border-[#163D32] rounded-2xl text-xs text-[#18332B] outline-none font-medium"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowResolveModal(false)}
                disabled={updating}
                className="px-4 py-2 border border-[#E6E1D8] bg-[#FAF6F0] rounded-xl text-xs font-bold text-[#65736D] hover:text-[#163D32] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResolution}
                disabled={updating}
                className="px-5 py-2.5 bg-[#1F5948] hover:bg-[#163D32] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {updating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Volunteer Self Evaluation Modal */}
      {showSelfEvalModal && (
        <div className="fixed inset-0 z-50 bg-[#163D32]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF8] rounded-3xl border border-[#E6E1D8] p-6 max-w-lg w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-black text-[#163D32] flex items-center gap-2">
                  <Award className="text-[#1F5948]" size={18} />
                  Volunteer Self-Evaluation
                </h3>
                <p className="text-xs text-[#65736D] font-medium mt-0.5">
                  Reflect on your guidance experience for Case {customCaseId} to maintain certification and build your legal aid profile.
                </p>
              </div>
              <button
                onClick={() => setShowSelfEvalModal(false)}
                className="text-[#65736D] hover:text-[#163D32] text-xl font-black leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            {selfEvalSubmitted && selfEvalData ? (
              <div className="space-y-4 py-2 text-xs">
                <div className="p-4.5 bg-[#DCEBDD]/60 border border-[#c5ddc6] rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-[#163D32] font-black">
                    <CheckCircle2 size={16} /> Evaluation Submitted
                  </div>
                  <p className="text-[#65736D] font-medium">
                    Outcome: <strong className="text-[#163D32]">{selfEvalData.outcomeAchieved}</strong>
                  </p>
                  <p className="text-[#65736D] font-medium">
                    Preparation Rating: <strong className="text-[#163D32]">{selfEvalData.preparationRating}/5</strong> • Legal Clarity: <strong className="text-[#163D32]">{selfEvalData.legalClarityRating}/5</strong>
                  </p>
                </div>
                {selfEvalData.lessonsLearned && (
                  <div>
                    <span className="font-extrabold text-[#163D32] block mb-1">Lessons Learned:</span>
                    <p className="text-[#65736D] font-medium italic bg-[#FAF6F0] p-3.5 rounded-xl border border-[#E6E1D8]">
                      "{selfEvalData.lessonsLearned}"
                    </p>
                  </div>
                )}
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowSelfEvalModal(false)}
                    className="px-5 py-2.5 bg-[#163D32] text-white rounded-xl font-bold cursor-pointer shadow-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                {/* Rating fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-extrabold text-[#65736D] uppercase tracking-wider block mb-1">
                      Preparation Rating (1-5)
                    </label>
                    <select
                      value={selfEvalForm.preparationRating}
                      onChange={(e) => setSelfEvalForm(prev => ({ ...prev, preparationRating: Number(e.target.value) }))}
                      className="w-full h-10 px-3 bg-[#FAF6F0] border border-[#E6E1D8] rounded-xl text-xs text-[#163D32] font-bold outline-none cursor-pointer"
                    >
                      {[5, 4, 3, 2, 1].map(num => <option key={num} value={num}>{num} ★</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-[#65736D] uppercase tracking-wider block mb-1">
                      Communication Rating (1-5)
                    </label>
                    <select
                      value={selfEvalForm.communicationRating}
                      onChange={(e) => setSelfEvalForm(prev => ({ ...prev, communicationRating: Number(e.target.value) }))}
                      className="w-full h-10 px-3 bg-[#FAF6F0] border border-[#E6E1D8] rounded-xl text-xs text-[#163D32] font-bold outline-none cursor-pointer"
                    >
                      {[5, 4, 3, 2, 1].map(num => <option key={num} value={num}>{num} ★</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-[#65736D] uppercase tracking-wider block mb-1">
                      Legal Clarity (1-5)
                    </label>
                    <select
                      value={selfEvalForm.legalClarityRating}
                      onChange={(e) => setSelfEvalForm(prev => ({ ...prev, legalClarityRating: Number(e.target.value) }))}
                      className="w-full h-10 px-3 bg-[#FAF6F0] border border-[#E6E1D8] rounded-xl text-xs text-[#163D32] font-bold outline-none cursor-pointer"
                    >
                      {[5, 4, 3, 2, 1].map(num => <option key={num} value={num}>{num} ★</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-[#65736D] uppercase tracking-wider block mb-1">
                      Citizen Satisfaction (1-5)
                    </label>
                    <select
                      value={selfEvalForm.citizenSatisfactionPerception}
                      onChange={(e) => setSelfEvalForm(prev => ({ ...prev, citizenSatisfactionPerception: Number(e.target.value) }))}
                      className="w-full h-10 px-3 bg-[#FAF6F0] border border-[#E6E1D8] rounded-xl text-xs text-[#163D32] font-bold outline-none cursor-pointer"
                    >
                      {[5, 4, 3, 2, 1].map(num => <option key={num} value={num}>{num} ★</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold text-[#65736D] uppercase tracking-wider block mb-1">
                    Outcome Achieved
                  </label>
                  <select
                    value={selfEvalForm.outcomeAchieved}
                    onChange={(e) => setSelfEvalForm(prev => ({ ...prev, outcomeAchieved: e.target.value }))}
                    className="w-full h-10 px-3 bg-[#FAF6F0] border border-[#E6E1D8] rounded-xl text-xs text-[#163D32] font-bold outline-none cursor-pointer"
                  >
                    <option value="FULL_RESOLUTION">Full Resolution</option>
                    <option value="PARTIAL_RESOLUTION">Partial Resolution</option>
                    <option value="REFERRED_EXTERNAL">Referred to Legal Body / DLSA</option>
                    <option value="WITHDRAWN">Withdrawn / Settled Privately</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold text-[#65736D] uppercase tracking-wider block mb-1">
                    Key Challenges Faced
                  </label>
                  <textarea
                    value={selfEvalForm.challengesFaced}
                    onChange={(e) => setSelfEvalForm(prev => ({ ...prev, challengesFaced: e.target.value }))}
                    placeholder="e.g. Delays in evidence documents, jurisdictional boundary issues..."
                    rows={2}
                    className="w-full p-3 bg-[#FAF6F0] border border-[#E6E1D8] focus:border-[#163D32] rounded-xl text-xs text-[#18332B] outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold text-[#65736D] uppercase tracking-wider block mb-1">
                    Lessons Learned & Guidance Insights
                  </label>
                  <textarea
                    value={selfEvalForm.lessonsLearned}
                    onChange={(e) => setSelfEvalForm(prev => ({ ...prev, lessonsLearned: e.target.value }))}
                    placeholder="What worked well, or what could be improved for future similar cases..."
                    rows={2}
                    className="w-full p-3 bg-[#FAF6F0] border border-[#E6E1D8] focus:border-[#163D32] rounded-xl text-xs text-[#18332B] outline-none font-medium"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    onClick={() => setShowSelfEvalModal(false)}
                    className="px-4 py-2 border border-[#E6E1D8] bg-[#FAF6F0] rounded-xl text-xs font-bold text-[#65736D] hover:text-[#163D32] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitSelfEvaluation}
                    disabled={updating}
                    className="px-5 py-2.5 bg-[#163D32] hover:bg-[#1F5948] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    {updating ? <Loader2 size={14} className="animate-spin" /> : <Award size={14} />}
                    Submit Self-Evaluation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default ComplaintDetails;