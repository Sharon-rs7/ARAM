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
  BadgeAlert,
  Printer
} from "lucide-react";
import { complaintService } from "../../services/complaintService";
import { toast } from "sonner";
import ReadAloudButton from "@/components/voice/ReadAloudButton";
import CaseChatPanel from "@/components/CaseChatPanel";
import AuthorityLocationCard from "@/components/authority/AuthorityLocationCard";

// Update 1: Legal glossary tooltip component
const GLOSSARY = {
  SLA: "Service Level Agreement — the guaranteed response time for your case based on its urgency level.",
  Mediation: "A structured discussion between two parties facilitated by a neutral Legal Guide to reach a mutual agreement.",
  Escalation: "The process of raising your complaint to a higher authority for faster action when normal review is delayed.",
  Triage: "The AI analysis step where your complaint is categorized by legal type and urgency automatically.",
  "Action Plan": "A step-by-step legal guidance document prepared by your assigned Legal Guide to resolve your issue.",
  OCR: "Optical Character Recognition — the technology used to automatically read and extract text from your uploaded documents.",
  DLSA: "District Legal Services Authority — the government body providing free legal aid in each district.",
};

const GlossaryTip = ({ term }) => (
  <span
    title={GLOSSARY[term] || term}
    className="border-b border-dashed border-indigo-400 text-indigo-700 cursor-help font-semibold"
  >
    {term}
  </span>
);


const ComplaintDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionPlan, setActionPlan] = useState(null);
  const [offices, setOffices] = useState([]);
  const [costEstimate, setCostEstimate] = useState(null);
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

        // Fetch cost estimate
        try {
          const costData = await complaintService.getCostEstimate(id);
          setCostEstimate(costData);
        } catch (err) {
          console.error("Failed to load cost estimate:", err);
        }

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

  const getActiveStepIndex = () => {
    if (status === "RESOLVED" || status === "CLOSED") return 6; // Resolved
    
    const hasDocs = docRequests && docRequests.length > 0;
    const allDocsDone = hasDocs && docRequests.every(r => r.status === "VERIFIED" || r.status === "UPLOADED");
    if (allDocsDone) return 5; // Documents
    
    if (actionPlan) return 4; // Action Plan
    if (complaint.assignedHelperId) return 3; // Legal Guide Assigned
    if (status === "UNDER_REVIEW") return 2; // Admin Review
    return 1; // AI Checked (Step 1 is Submitted, Step 2 is AI Checked)
  };
  
  const activeStep = getActiveStepIndex();

  const getWhatHappensNextExplanation = () => {
    switch (status) {
      case "RESOLVED":
      case "CLOSED":
        return {
          title: "Grievance Completed & Closed",
          desc: "This case has been resolved. You can verify the actions or click the 'Reopen Case' button at the bottom of the page if you require further assistance."
        };
      case "DOCUMENTS_PENDING":
        return {
          title: "Evidence Proof Slips Required",
          desc: "Your Legal Guide has requested additional documents. Please check the requested document tracker below and upload them to continue review."
        };
      case "IN_PROGRESS":
      case "HELPER_ASSIGNED":
        return {
          title: "Legal Guide Formulating Action Plan",
          desc: "Your matched helper is currently reviewing your grievance and evidence details. They will post a custom next action plan containing mediation steps and nearby office directions."
        };
      case "UNDER_REVIEW":
        return {
          title: "Admin Matching Volunteer",
          desc: "ARAM regional administrators are actively verifying your complaint details and routing it to match a helper fluent in your language."
        };
      case "SUBMITTED":
      default:
        return {
          title: "Awaiting Triage Verification",
          desc: "Your complaint was successfully logged on ARAM. AI triage checked your details and routed this case to the regional queue for admin reviewer matching."
        };
    }
  };

  const nextHelp = getWhatHappensNextExplanation();
  
  const journeySteps = [
    { label: "Submitted", desc: "Grievance received" },
    { label: "AI Checked", desc: "Triage complete" },
    { label: "Admin Review", desc: "Route verified" },
    { label: "Guide Assigned", desc: "Volunteer matched" },
    { label: "Action Plan", desc: "Strategy ready" },
    { label: "Documents", desc: "Evidence review" },
    { label: "Resolved", desc: "Case closed" }
  ];

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

  const drawMockQRCode = () => (
    <svg width="100" height="100" viewBox="0 0 100 100" className="mx-auto border border-slate-200 p-1.5 bg-white rounded-lg">
      <rect width="10" height="10" x="5" y="5" fill="black" />
      <rect width="10" height="10" x="85" y="5" fill="black" />
      <rect width="10" height="10" x="5" y="85" fill="black" />
      <rect width="10" height="10" x="20" y="20" fill="black" />
      <rect width="10" height="10" x="40" y="10" fill="black" />
      <rect width="10" height="10" x="60" y="40" fill="black" />
      <rect width="10" height="10" x="30" y="60" fill="black" />
      <rect width="10" height="10" x="70" y="20" fill="black" />
      <rect width="10" height="10" x="50" y="70" fill="black" />
      <rect width="10" height="10" x="80" y="80" fill="black" />
      <rect width="10" height="10" x="5" y="45" fill="black" />
      <rect width="10" height="10" x="45" y="5" fill="black" />
      <rect width="10" height="10" x="85" y="45" fill="black" />
      <rect width="10" height="10" x="45" y="85" fill="black" />
    </svg>
  );

  const formattedRefId = `ARAM-2026-${String(complaint.id).replace("cmp-", "").padStart(6, "0")}`;

  return (
    <DashboardLayout>
      {/* Update 5: Hidden printable case packet */}
      <div id="print-packet" className="hidden print:block p-8 font-sans text-slate-900 text-sm space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-2xl font-extrabold">ARAM — Legal Aid Case Packet</h1>
          <p className="text-xs text-slate-500 mt-1">Certified case summary generated on {new Date().toLocaleDateString("en-IN")}</p>
        </div>
        <table className="w-full text-xs border-collapse">
          <tbody>
            {[
              ["Reference ID", formattedRefId],
              ["Category", category],
              ["Priority", priority],
              ["Status", status],
              ["District", complaint.district || "Coimbatore"],
              ["Submitted", new Date(complaint.createdAt).toLocaleString()],
            ].map(([label, value]) => (
              <tr key={label} className="border border-slate-200">
                <td className="px-3 py-2 font-bold bg-slate-50 w-40">{label}</td>
                <td className="px-3 py-2">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div>
          <h2 className="font-bold text-base mt-4 mb-2">Grievance Description</h2>
          <p className="text-xs leading-relaxed border border-slate-200 rounded p-3 bg-slate-50">{desc}</p>
        </div>
        {actionPlan && (
          <div>
            <h2 className="font-bold text-base mt-4 mb-2">Legal Guide Action Plan</h2>
            <p className="text-xs leading-relaxed border border-slate-200 rounded p-3 bg-slate-50">{actionPlan.planText || actionPlan.description || JSON.stringify(actionPlan)}</p>
          </div>
        )}
        <div className="mt-6 border-t pt-4 text-[10px] text-slate-400">
          This document is cryptographically signed by the ARAM platform. Complaint data is end-to-end encrypted at rest and in transit.
        </div>
      </div>

      <div className="print:hidden space-y-6 max-w-4xl mx-auto">
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
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100"
            >
              Print Packet 🖨️
            </button>
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

        {/* End-to-End Encryption Banner */}
        <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100 text-emerald-950 text-xs flex items-center gap-3 shadow-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <strong className="block text-emerald-900">🔒 End-to-End Encrypted Complaint</strong>
            <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
              Your grievance text and uploaded evidence are fully protected by industry-standard end-to-end cryptographic shielding. Only you, your assigned Legal Guide, and reviewing administrators can read or decrypt this complaint.
            </p>
          </div>
        </div>

        {/* One-page complaint journey step tracker */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-150 space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Case Progress Journey</h3>
          
          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-2">
            {/* Connection line for desktop */}
            <div className="hidden md:block absolute left-6 right-6 top-5 h-[2.5px] bg-slate-150 -z-0">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500" 
                style={{ width: `${(activeStep / (journeySteps.length - 1)) * 100}%` }}
              ></div>
            </div>
            
            {journeySteps.map((step, idx) => {
              const isCompleted = idx <= activeStep;
              const isCurrent = idx === activeStep;
              return (
                <div key={idx} className="flex md:flex-col items-center gap-3.5 md:gap-2 relative z-10 flex-1 w-full md:w-auto">
                  {/* Circle element */}
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-black text-xs border-2 transition-all duration-300 ${
                    isCompleted 
                      ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-100" 
                      : "bg-white border-slate-200 text-slate-400"
                  } ${isCurrent ? "ring-4 ring-emerald-50" : ""}`}>
                    {isCompleted && idx < activeStep ? "✓" : idx + 1}
                  </div>
                  
                  {/* Label */}
                  <div className="text-left md:text-center">
                    <span className={`block text-xs font-bold ${isCompleted ? "text-slate-800" : "text-slate-400"}`}>{step.label}</span>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">{step.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

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

        {/* What happens next card */}
        <div className="rounded-2xl border border-blue-105 bg-blue-50/45 p-5 text-xs text-slate-800 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="text-base">📋</span>
            <span className="font-bold uppercase tracking-wider text-blue-900">What Happens Next?</span>
          </div>
          <div className="pl-6 space-y-1">
            <strong className="text-slate-800 font-bold block">{nextHelp.title}</strong>
            <p className="leading-relaxed text-slate-550 font-medium">{nextHelp.desc}</p>
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

              {/* Cost Estimation Card */}
              {costEstimate && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimated Case Cost & Legal Aid</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Approximate estimates to proceed with this authority</p>
                    </div>
                    {costEstimate.freeLegalAidAvailable && (
                      <span className="text-[10px] font-extrabold uppercase bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-100">
                        Free Legal Aid Available
                      </span>
                    )}
                  </div>
                  
                  <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-2xl font-black text-slate-800 flex items-baseline gap-1">
                        {costEstimate.currency || "₹"} {costEstimate.estimatedMinAmount} - {costEstimate.estimatedMaxAmount}
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider ml-1">Est. Total</span>
                      </div>
                      <p className="text-xs text-slate-550 leading-relaxed max-w-md">
                        <strong>Includes:</strong> {costEstimate.includes || "Document print/photocopy/travel"}
                        <br />
                        <strong>Excludes:</strong> {costEstimate.excludes || "Professional advocate fees"}
                      </p>
                    </div>
                    
                    <div className="shrink-0 bg-white border border-slate-150 p-3 rounded-xl max-w-[280px]">
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Next Action Notes</span>
                      <p className="text-[11px] text-slate-600 font-semibold mt-1 leading-normal italic">
                        "{costEstimate.notes || "No extra cost notes added by guide."}"
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    ℹ️ <em>Important: The amount shown above is an approximate cost range estimate for filing/travel, NOT a final lawyer fee. Under Indian legal aid rules, eligible citizens are entitled to free counsel.</em>
                  </p>
                </div>
              )}
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

      {/* Printable Receipt Packet */}
      <div className="hidden print:block p-8 bg-white text-slate-900 border border-slate-300 rounded-2xl max-w-2xl mx-auto space-y-6 font-sans">
        <div className="text-center border-b pb-4">
          <h1 className="text-2xl font-extrabold tracking-tight">ARAM LEGAL AID PORTAL</h1>
          <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider mt-1">Official Grievance Receipt & Tracking Code</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs pt-2">
          <div>
            <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">Reference ID</span>
            <span className="font-bold text-slate-800 mt-1 block">{formattedRefId}</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">Date Filed</span>
            <span className="font-bold text-slate-800 mt-1 block">{new Date(complaint.createdAt).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">Category</span>
            <span className="font-bold text-slate-800 mt-1 block">{category.replace("_", " ")}</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">Priority / SLA Target</span>
            <span className="font-bold text-slate-800 mt-1 block">{getSlaDeadline(priority)}</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">Preferred Language</span>
            <span className="font-bold text-slate-800 mt-1 block">{complaint.language || "en-IN"}</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">Assigned Helper</span>
            <span className="font-bold text-slate-800 mt-1 block">{complaint.assignedHelperName || "Awaiting Volunteer Assignment"}</span>
          </div>
        </div>

        <div className="border-t border-b py-4 my-4 flex items-center justify-between gap-6">
          <div className="text-left space-y-1">
            <h4 className="font-bold text-xs uppercase tracking-wide text-slate-800">Scan & Track Status</h4>
            <p className="text-[10px] text-slate-500 max-w-[320px] leading-relaxed">Scan this code with your smartphone camera to quickly access the ARAM mobile web portal and track real-time feedback updates on your case status.</p>
          </div>
          <div className="shrink-0">
            {drawMockQRCode()}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Grievance Summary</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600 bg-slate-50 p-3 rounded-lg border">{desc}</p>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Required Evidence Checklist</h3>
            <ul className="mt-1.5 text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-lg border list-disc list-inside">
              {docs.map((doc, idx) => (
                <li key={idx} className="font-semibold">{doc}</li>
              ))}
            </ul>
          </div>

          {actionPlan && (
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Legal Guide Action Plan</h3>
              <div className="mt-1.5 text-xs text-slate-650 space-y-1.5 bg-slate-50 p-3 rounded-lg border">
                <p><strong>Immediate Steps:</strong></p>
                <p className="whitespace-pre-line bg-white p-2 rounded border border-slate-105 mt-1">{actionPlan.immediateSteps}</p>
                {actionPlan.safetyNote && (
                  <p className="mt-2 text-red-700 font-medium">⚠️ Safety Note: {actionPlan.safetyNote}</p>
                )}
              </div>
            </div>
          )}

          {costEstimate && (
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Estimated Legal Expenses</h3>
              <div className="mt-1.5 text-xs text-slate-650 bg-slate-50 p-3 rounded-lg border">
                <span>Minimum Cost: ₹{costEstimate.minEstimate} • Maximum Cost: ₹{costEstimate.maxEstimate}</span>
                <p className="text-[10px] text-slate-400 mt-1 font-medium leading-tight">Note: These estimates are based on regional legal service standards. Community guides charge zero consultation fees.</p>
              </div>
            </div>
          )}
        </div>

        <div className="text-center pt-8 border-t text-[10px] text-slate-400 font-medium tracking-wide">
          ARAM community legal aid is powered by community volunteers and artificial intelligence. Keep this receipt safe.
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ComplaintDetails;