import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useNavigate, useParams } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  User,
  Building2,
  ShieldCheck,
  BrainCircuit,
  Paperclip,
  Download,
  ArrowLeft,
  Clock3,
  FileText,
  BadgeAlert
} from "lucide-react";
import { complaintService } from "../../services/complaintService";
import { toast } from "sonner";
import ReadAloudButton from "@/components/voice/ReadAloudButton";
import CaseChatPanel from "@/components/CaseChatPanel";
import AuthorityLocationCard from "@/components/authority/AuthorityLocationCard";

const ComplaintDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionPlan, setActionPlan] = useState(null);
  const [offices, setOffices] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  const [docRequests, setDocRequests] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackHelpful, setFeedbackHelpful] = useState(true);
  const [submittingFlow, setSubmittingFlow] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        const data = await complaintService.getComplaintById(Number(id) || id);
        setComplaint(data);

        // Fetch custom next action plan
        const planData = await complaintService.getActionPlan(id);
        setActionPlan(planData);

        // Fetch matched offices
        const officesData = await complaintService.getAuthorityLocations(id);
        setOffices(officesData);

        // Fetch requested documents list
        const docReqsData = await complaintService.getDocumentRequests(id);
        setDocRequests(docReqsData);

        // Fetch appointments list
        const appsData = await complaintService.getAppointments(id);
        setAppointments(appsData);
      } catch (err) {
        toast.error("Failed to load complaint details.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleUploadDocument = async (requestId, file) => {
    if (!file) return;
    setSubmittingFlow(true);
    toast.loading("Uploading requested document...");
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      await complaintService.uploadRequestedDocument(requestId, id, uploadFormData);
      toast.dismiss();
      toast.success("Document uploaded successfully!");
      const docReqsData = await complaintService.getDocumentRequests(id);
      setDocRequests(docReqsData);
    } catch (err) {
      toast.dismiss();
      toast.error("Document upload failed.");
    } finally {
      setSubmittingFlow(false);
    }
  };

  const handleRequestCall = async (mode, preferredTime, note) => {
    setSubmittingFlow(true);
    try {
      await complaintService.requestCall({
        complaintId: id,
        mode,
        preferredTime,
        note
      });
      toast.success("Call/Appointment requested successfully!");
      const appsData = await complaintService.getAppointments(id);
      setAppointments(appsData);
    } catch (err) {
      toast.error("Failed to request call.");
    } finally {
      setSubmittingFlow(false);
    }
  };

  const handleConfirmResolution = async () => {
    setSubmittingFlow(true);
    try {
      await complaintService.submitFeedback({
        complaintId: id,
        rating: feedbackRating,
        comment: feedbackComment,
        helpful: feedbackHelpful
      });
      const updated = await complaintService.updateWorkflowStatus(id, {
        status: "CLOSED_BY_USER",
        details: "Citizen confirmed case resolved successfully"
      });
      setComplaint(updated);
      setShowFeedbackModal(false);
      toast.success("Case resolved and closed! Thank you for your feedback.");
    } catch (err) {
      toast.error("Failed to close complaint.");
    } finally {
      setSubmittingFlow(false);
    }
  };

  const handleReopenCase = async () => {
    if (!reopenReason.trim()) {
      toast.error("Please enter a reason to reopen your case.");
      return;
    }
    setSubmittingFlow(true);
    try {
      const updated = await complaintService.updateWorkflowStatus(id, {
        status: "REOPEN_REQUESTED",
        details: reopenReason.trim()
      });
      setComplaint(updated);
      setShowReopenModal(false);
      toast.success("Case reopen request submitted to Admin.");
    } catch (err) {
      toast.error("Failed to reopen case.");
    } finally {
      setSubmittingFlow(false);
    }
  };

  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation({ lat, lng });
        toast.success("Location retrieved! Sorting nearest offices...");
        try {
          const officesData = await complaintService.getAuthorityLocations(id, lat, lng);
          setOffices(officesData);
        } catch (err) {
          toast.error("Failed to load sorted locations.");
        }
      },
      (error) => {
        toast.error("Location access denied.");
        console.error(error);
      }
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center text-slate-400">
          Loading complaint details...
        </div>
      </DashboardLayout>
    );
  }

  if (!complaint) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] flex-col items-center justify-center text-slate-400 space-y-4">
          <p>Complaint not found.</p>
          <button onClick={() => navigate("/citizen/history")} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold">
            Go Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const category = complaint.categoryLabel || complaint.category || "GENERAL_LEGAL_AID";
  const priority = complaint.priority || "MEDIUM";
  const status = complaint.status || "SUBMITTED";
  const desc = complaint.description || "";
  const docs = complaint.aiResult?.requiredDocuments || ["Aadhaar Card"];
  const steps = complaint.aiResult?.nextSteps || ["Awaiting volunteer assignment review."];
  const visibility = complaint.identityVisibility || "VISIBLE";

  const getSlaDeadline = (priorityVal) => {
    switch (priorityVal?.toUpperCase()) {
      case "CRITICAL":
        return "Immediate Review";
      case "HIGH":
        return "24 Hours SLA";
      case "MEDIUM":
        return "72 Hours SLA";
      case "LOW":
      default:
        return "7 Days SLA";
    }
  };

  const handleWhatsAppShare = () => {
    const formattedId = `ARAM-2026-${String(complaint.id).replace("cmp-", "").padStart(6, "0")}`;
    const text = `My ARAM complaint ID is ${formattedId} and its status is ${status}. You can check updates on the ARAM tracking portal.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    toast.success("Opened WhatsApp share link!");
  };

  const formattedRefId = `ARAM-2026-${String(complaint.id).replace("cmp-", "").padStart(6, "0")}`;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Emergency Alert Card if highRisk is true */}
        {complaint.highRisk && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-xs text-red-950 space-y-3 animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-2">
              <span className="text-base">🚨</span>
              <span className="font-bold uppercase tracking-wider text-red-800">Urgent Safety Warning</span>
            </div>
            <p className="leading-relaxed font-semibold">
              This case has been flagged as High Risk. If you are in immediate danger or facing threats/violence, please call emergency services immediately. ARAM has prioritized your case for expedited review.
            </p>
            <div className="flex flex-wrap gap-2 pt-1 font-bold">
              <a href="tel:181" className="flex items-center gap-1 px-3 py-1.5 bg-white border border-red-200 rounded-xl hover:bg-red-50 text-red-900 transition text-[10px] shadow-sm cursor-pointer">
                📞 Women Helpline (181)
              </a>
              <a href="tel:112" className="flex items-center gap-1 px-3 py-1.5 bg-white border border-red-200 rounded-xl hover:bg-red-50 text-red-900 transition text-[10px] shadow-sm cursor-pointer">
                📞 Emergency Services (112)
              </a>
              <a href="tel:1930" className="flex items-center gap-1 px-3 py-1.5 bg-white border border-red-200 rounded-xl hover:bg-red-50 text-red-900 transition text-[10px] shadow-sm cursor-pointer">
                📞 Cyber Crime Cell (1930)
              </a>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Complaint Information</h1>
            <p className="text-xs text-slate-400 mt-0.5">ID: {formattedRefId} • Status: <span className="font-semibold text-blue-600">{status}</span></p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100"
            >
              Share via WhatsApp
            </button>
            <button
              onClick={() => navigate("/citizen/history")}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
            >
              <ArrowLeft size={16} /> Back
            </button>
          </div>
        </div>

        {/* Visibility Alert if partial/hidden */}
        {visibility !== "VISIBLE" && (
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-900 text-xs flex items-center gap-2">
            <BadgeAlert size={16} className="text-amber-600 shrink-0" />
            <span>
              <strong>Identity Visibility Shield Enabled:</strong> Your profile is configured as <strong>{visibility}</strong>. Volunteers will not see your personal details.
            </span>
          </div>
        )}

        {/* Blockchain Integrity Verification Alert */}
        {complaint.blockchainInfo && (
          complaint.blockchainInfo.verified ? (
            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100 text-emerald-950 text-xs flex flex-col gap-2 shadow-sm">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                <span>
                  <strong>🔒 Verified on Blockchain:</strong> This complaint's cryptographic integrity has been successfully validated against a tamper-proof ledger.
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-emerald-100/50 font-mono text-[10px] text-emerald-800">
                <div><strong>Block Index:</strong> #{complaint.blockchainInfo.blockIndex}</div>
                <div><strong>Nonce / Pow:</strong> {complaint.blockchainInfo.nonce}</div>
                <div className="sm:col-span-2 break-all"><strong>Block Hash:</strong> <span className="bg-emerald-100/70 px-1 py-0.5 rounded font-bold text-[9px]">{complaint.blockchainInfo.blockHash}</span></div>
                <div className="sm:col-span-2 break-all"><strong>Previous Hash:</strong> <span className="bg-emerald-100/50 px-1 py-0.5 rounded text-[9px]">{complaint.blockchainInfo.previousHash}</span></div>
                <div className="sm:col-span-2 break-all"><strong>Complaint Payload Hash:</strong> <span className="bg-emerald-100/50 px-1 py-0.5 rounded text-[9px]">{complaint.blockchainInfo.complaintHash}</span></div>
                <div><strong>Block Timestamp:</strong> {new Date(complaint.blockchainInfo.timestamp).toLocaleString()}</div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-100 text-rose-950 text-xs flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <BadgeAlert size={16} className="text-rose-600 shrink-0 animate-pulse" />
                <span>
                  <strong>🚨 Cryptographic Integrity Verification Failed!</strong> This complaint's details (Title, Description, or Timestamp) do not match the hash recorded in the blockchain ledger. Possible unauthorized modification detected!
                </span>
              </div>
              <div className="grid grid-cols-1 gap-1 mt-1 pt-2 border-t border-rose-100/50 font-mono text-[10px] text-rose-800">
                <div className="break-all"><strong>Registered Hash on Chain:</strong> {complaint.blockchainInfo.complaintHash}</div>
              </div>
            </div>
          )
        )}

        {/* Info Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Triage Category</p>
            <h3 className="text-sm font-bold text-slate-805 mt-1">{category.replace("_", " ")}</h3>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Priority / SLA Target</p>
            <h3 className="text-sm font-bold text-red-600 mt-1">{getSlaDeadline(priority)}</h3>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Assigned Helper</p>
            <h3 className="text-sm font-bold text-slate-805 mt-1">{complaint.assignedHelperName || "Awaiting Assignment"}</h3>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Date Submitted</p>
            <h3 className="text-xs font-bold text-slate-600 mt-1">{new Date(complaint.createdAt).toLocaleDateString()}</h3>
          </div>
        </div>

        {/* Description Panel */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Grievance Description</h3>
            <ReadAloudButton text={desc} language={complaint.language || "en-IN"} />
          </div>
          <div className="rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-600 border border-slate-100 whitespace-pre-line">
            {desc}
          </div>
        </div>

        {/* AI Action Checklist */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Document Rules */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Required Evidence Checklist</h3>
              <ReadAloudButton text={`Required documents: ${docs.join(", ")}`} language={complaint.language || "en-IN"} />
            </div>
            <div className="space-y-2">
              {docs.map((doc, idx) => (
                <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-700">
                  <FileText size={16} className="text-blue-600 shrink-0" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Next Steps */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Suggested Guidance Rules</h3>
              <ReadAloudButton text={steps.join(". ")} language={complaint.language || "en-IN"} />
            </div>
            <div className="space-y-2">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                  <span className="h-5 w-5 shrink-0 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-[10px]">{idx + 1}</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Next Action Plan Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 mt-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2 uppercase">
              <span>📋</span> Your Next Action Plan
            </h3>
            {actionPlan && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-green-50 text-green-700">
                Active Plan
              </span>
            )}
          </div>

          {!actionPlan ? (
            <div className="text-center py-6 text-slate-500 space-y-2">
              <p className="text-xs font-medium">
                Your Legal Guide is currently reviewing your case details and will share your custom step-by-step Next Action Plan shortly.
              </p>
              <p className="text-[10px] text-slate-400">
                You will be notified once next steps are shared.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary */}
              {actionPlan.summary && (
                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Solution Summary</h4>
                  <p className="text-xs leading-relaxed text-slate-650 bg-slate-50/50 p-4 border border-slate-100 rounded-xl">
                    {actionPlan.summary}
                  </p>
                </div>
              )}

              {/* Immediate Steps Checklist */}
              {actionPlan.immediateSteps && actionPlan.immediateSteps.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Immediate Steps (Checklist)</h4>
                  <div className="space-y-2">
                    {actionPlan.immediateSteps.filter(s => s && s.trim()).map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 font-medium">
                        <input
                          type="checkbox"
                          className="h-4 w-4 shrink-0 rounded border-slate-200 text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer"
                        />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Required Documents Checklist */}
              {actionPlan.documentChecklist && actionPlan.documentChecklist.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Required Evidence / Documents</h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {actionPlan.documentChecklist.filter(d => d && d.trim()).map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-indigo-50/30 border border-indigo-100/50 text-xs text-indigo-900 font-semibold">
                        <span className="h-5 w-5 shrink-0 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <span>{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Authority & Location Matcher */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recommended Authority</h4>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">
                      {actionPlan.recommendedAuthorityName || "Not Specified"}
                    </p>
                  </div>
                  {/* Location Consent Control */}
                  {!userLocation ? (
                    <button
                      onClick={handleRequestLocation}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[10px] font-bold text-slate-650 bg-white hover:bg-slate-50 transition shrink-0 cursor-pointer"
                    >
                      📍 Find Nearest Office
                    </button>
                  ) : (
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg">
                      Sorted by Distance
                    </span>
                  )}
                </div>

                {/* Consent Text */}
                {!userLocation && (
                  <p className="text-[10px] text-slate-400 leading-normal">
                    💡 <em>ARAM uses your location only to suggest nearby offices. Your exact location is not shared with the Legal Guide.</em>
                  </p>
                )}

                {/* Offices Directory Display */}
                {offices && offices.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {offices.map((office) => {
                      const distVal = userLocation ? office.distance : null;
                      return (
                        <AuthorityLocationCard
                          key={office.id}
                          office={office}
                          distance={distVal}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No local authority offices configured for your district.</p>
                )}
              </div>

              {/* Extra notes */}
              <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t border-slate-100 text-xs">
                {actionPlan.expectedTimeline && (
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Expected Resolution Timeline</span>
                    <p className="text-slate-700 font-semibold mt-0.5">{actionPlan.expectedTimeline}</p>
                  </div>
                )}
                {actionPlan.visitRequired !== undefined && (
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Office Visit Required?</span>
                    <p className="text-slate-700 font-semibold mt-0.5">
                      {actionPlan.visitRequired ? "Yes, physical submission or hearing required" : "No, can be resolved online"}
                    </p>
                  </div>
                )}
                {actionPlan.safetyNote && (
                  <div className="sm:col-span-2 p-3 bg-amber-50 rounded-xl border border-amber-100 text-amber-900">
                    <span className="font-bold text-amber-950 uppercase tracking-wider text-[10px] block">Safety instructions</span>
                    <p className="mt-0.5 leading-relaxed font-medium">{actionPlan.safetyNote}</p>
                  </div>
                )}
                {actionPlan.legalGuideNote && (
                  <div className="sm:col-span-2 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50 text-indigo-950">
                    <span className="font-bold text-indigo-950 uppercase tracking-wider text-[10px] block">Personal Note from Legal Guide</span>
                    <p className="mt-0.5 leading-relaxed font-medium">{actionPlan.legalGuideNote}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Resolution Summary Card */}
        {(complaint.resolutionSummary || status === "RESOLVED_BY_GUIDE") && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/10 p-6 shadow-sm space-y-4 mt-6">
            <div className="flex items-center gap-2 border-b border-emerald-100 pb-2">
              <span className="text-lg">✅</span>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Case Resolution Shared</h3>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Resolution Summary</span>
              <p className="text-xs leading-relaxed text-slate-700 bg-white p-4 border border-emerald-100 rounded-xl whitespace-pre-line shadow-sm">
                {complaint.resolutionSummary || "Legal Guide has confirmed this grievance is successfully resolved."}
              </p>
            </div>
            {status === "RESOLVED_BY_GUIDE" && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer"
                >
                  Confirm & Close Case
                </button>
                <button
                  onClick={() => setShowReopenModal(true)}
                  className="px-4 py-2 border border-red-200 bg-white hover:bg-red-50 text-red-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Need More Help (Reopen)
                </button>
              </div>
            )}
            {status === "CLOSED_BY_USER" && (
              <span className="inline-block text-[10px] font-extrabold text-emerald-750 bg-emerald-100/60 px-3 py-1 rounded-full uppercase tracking-wider mt-2">
                Closed by User ✓
              </span>
            )}
          </div>
        )}

        {/* Requested Documents Tracker Card */}
        {docRequests && docRequests.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 mt-6">
            <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2 uppercase border-b border-slate-100 pb-3">
              <span>📂</span> Requested Evidence & Documents
            </h3>
            <div className="space-y-3">
              {docRequests.map((req) => (
                <div key={req.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-200 text-slate-700">
                      {req.status}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800">{req.documentName}</h4>
                    {req.reason && <p className="text-[10px] text-slate-500 italic">{req.reason}</p>}
                    {req.status === "REJECTED" && (
                      <p className="text-[10px] text-red-650 font-semibold mt-0.5">⚠️ Rejection Reason: {req.rejectionReason}</p>
                    )}
                  </div>
                  <div className="shrink-0">
                    {(req.status === "REQUESTED" || req.status === "REJECTED") ? (
                      <label className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer">
                        Upload Document
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleUploadDocument(req.id, e.target.files[0])}
                        />
                      </label>
                    ) : (
                      <span className="text-xs font-semibold text-slate-500">
                        {req.status === "UPLOADED" ? "Awaiting Verification" : "Verified ✓"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Appointment Scheduler / Call Request */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 mt-6">
          <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2 uppercase border-b border-slate-100 pb-3">
            <span>📞</span> Legal Guide Call Scheduler
          </h3>
          
          {/* Active Call Schedules */}
          {appointments && appointments.length > 0 && (
            <div className="space-y-3 pb-4 border-b border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Schedules List</span>
              {appointments.map((app) => (
                <div key={app.id} className="p-3 bg-indigo-50/20 border border-indigo-100/50 rounded-xl text-xs flex justify-between items-center gap-4">
                  <div>
                    <p className="font-bold text-slate-850">Call mode: {app.mode} ({app.preferredTime})</p>
                    {app.scheduledAt ? (
                      <p className="text-[10.5px] text-indigo-750 font-semibold mt-0.5">
                        Scheduled for: {new Date(app.scheduledAt).toLocaleString()}
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-400 mt-0.5">Status: Pending Schedule Confirmation</p>
                    )}
                    {app.note && <p className="text-[10px] text-slate-500 mt-1 italic">Note: "{app.note}"</p>}
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-indigo-105 text-indigo-700">
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Form to Request Call */}
          <div className="space-y-3 bg-slate-50/50 p-4 border border-slate-150 rounded-xl">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Request a New Call</span>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Preferred Safe Contact Mode</label>
                <select id="callModeSelect" className="h-9 w-full rounded-lg border border-slate-200 px-3 outline-none text-slate-805 text-xs bg-white cursor-pointer">
                  <option value="IN_APP">In-App Secure Chat</option>
                  <option value="PHONE">Phone Call (Prefers Privacy Masking)</option>
                  <option value="WHATSAPP">WhatsApp Message</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Preferred Call Time Slot</label>
                <select id="callTimeSelect" className="h-9 w-full rounded-lg border border-slate-200 px-3 outline-none text-slate-805 text-xs bg-white cursor-pointer">
                  <option value="ANYTIME">Anytime (Free to pick)</option>
                  <option value="MORNING">Morning (9 AM - 12 PM)</option>
                  <option value="AFTERNOON">Afternoon (12 PM - 4 PM)</option>
                  <option value="EVENING">Evening (4 PM - 8 PM)</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Reason or Agenda Note</label>
                <input
                  id="callNoteInput"
                  type="text"
                  placeholder="e.g. Discussing the required document slips..."
                  className="h-9 w-full rounded-lg border border-slate-200 px-3 outline-none text-slate-850 text-xs bg-white"
                />
              </div>
            </div>
            <button
              onClick={() => {
                const mode = document.getElementById("callModeSelect").value;
                const time = document.getElementById("callTimeSelect").value;
                const note = document.getElementById("callNoteInput").value;
                handleRequestCall(mode, time, note);
                document.getElementById("callNoteInput").value = "";
              }}
              disabled={submittingFlow}
              className="mt-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer disabled:opacity-50"
            >
              Submit Call Request
            </button>
          </div>
        </div>

        {/* Feedback Rating Dialog Modal */}
        {showFeedbackModal && (
          <div className="fixed inset-0 z-50 bg-slate-905/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">Rate Legal Triage Support</h3>
              <p className="text-xs text-slate-500">How would you rate the assistance provided by your ARAM Legal Guide?</p>
              
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className={`text-2xl transition hover:scale-110 cursor-pointer ${star <= feedbackRating ? "text-amber-400" : "text-slate-200"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Comments (Optional)</label>
                  <textarea
                    rows={3}
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Write a brief comment about the solution provided..."
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none text-slate-800"
                  />
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-150">
                  <span className="text-xs font-semibold text-slate-700">Was namma Legal Guide helpful?</span>
                  <button
                    type="button"
                    onClick={() => setFeedbackHelpful(!feedbackHelpful)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition uppercase ${feedbackHelpful ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}
                  >
                    {feedbackHelpful ? "Yes" : "No"}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmResolution}
                  disabled={submittingFlow}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  Submit & Close Case
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reopen Explaining Modal */}
        {showReopenModal && (
          <div className="fixed inset-0 z-50 bg-slate-905/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">Explain Reason to Reopen Case</h3>
              <p className="text-xs text-slate-500">Provide details on what steps or guidance was missing so our admin panel can assign a reviewer.</p>
              
              <textarea
                rows={4}
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                placeholder="Describe your remaining grievance details in simple terms..."
                className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none text-slate-800"
              />

              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setShowReopenModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReopenCase}
                  disabled={submittingFlow}
                  className="px-4 py-2 bg-red-650 hover:bg-red-700 text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  Submit Reopen Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Secure Communication Panel */}
        {complaint.assignedHelperId && (
          <div className="mt-6">
            <CaseChatPanel complaintId={complaint.id} userRole="CITIZEN" />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ComplaintDetails;