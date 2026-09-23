import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { complaintService } from "@/services/complaintService";
import { useAuth } from "@/context/AuthContext";
import SensitiveCasePanel from "@/components/admin/SensitiveCasePanel";
import GuideAssignmentPanel from "@/components/admin/GuideAssignmentPanel";
import {
  Sparkles,
  ShieldCheck,
  MapPin,
  FileText,
  CheckCircle,
  Building2,
  AlertCircle,
  User,
  Clock,
  ArrowLeft,
  Calendar,
  Layers,
  FileCheck
} from "lucide-react";

export default function RegionalComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "SUPER_ADMIN" || user?.role?.toUpperCase() === "SUPER_ADMIN";
  const dashboardUrl = isSuperAdmin ? "/superadmin/dashboard?tab=complaints" : "/admin/dashboard";
  const dashboardTitle = isSuperAdmin ? "Super Admin Grievance Queue" : "Regional Admin Dashboard";
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadComplaintDetails();
  }, [id]);

  const loadComplaintDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await complaintService.getComplaintById(id);
      setComplaint(data);
    } catch (err) {
      console.error(err);
      setError("Unauthorized or case not found. Access is restricted to your local district only.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#163D32] border-t-transparent mx-auto" />
          <p className="text-xs font-black text-[#163D32] uppercase tracking-wider">
            Loading Regional Case Details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex flex-col items-center justify-center p-6">
        <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <AlertCircle size={44} className="text-[#C94B4B] mx-auto" />
          <h2 className="text-lg font-black text-[#163D32] uppercase">
            Access Restricted
          </h2>
          <p className="text-xs text-[#65736D] leading-relaxed font-medium">
            {error || "Case details not found."}
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <Link
              to={dashboardUrl}
              className="px-4 py-2.5 bg-[#163D32] hover:bg-[#1F5948] text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              {isSuperAdmin ? "Return to Command Center" : "Go to Dashboard"}
            </Link>
            <button
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = "/login";
              }}
              className="px-4 py-2.5 bg-[#F7F1E6] hover:bg-[#E6E1D8] text-[#163D32] rounded-xl text-xs font-bold transition cursor-pointer border border-[#E6E1D8]"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  const aiResult = complaint.aiResult || {};
  const caseSummary = aiResult.caseSummary || {};
  const importantFacts = caseSummary.importantFacts || {};

  const situationOverview =
    aiResult.translatedSummary ||
    caseSummary.whatHappened ||
    "Complaint triaged and structured by ARAM Legal AI. Key details and statutory routing prepared for official legal aid intake.";

  const legalConcerns =
    (aiResult.detectedIssues && aiResult.detectedIssues.length > 0)
      ? aiResult.detectedIssues
      : [complaint.categoryLabel || complaint.category || "General Civil Grievance", "Statutory Redressal"];

  const requiredDocs = (aiResult.requiredDocuments && aiResult.requiredDocuments.length > 0)
    ? aiResult.requiredDocuments
    : (caseSummary.evidenceNeeded && caseSummary.evidenceNeeded.length > 0)
    ? caseSummary.evidenceNeeded
    : ["Aadhaar / Photo ID", "Incident Written Statement / Proof", "Property / Dispute Documents"];

  const actionPlan =
    caseSummary.actionPlan ||
    aiResult.nextSteps || [
      "Verify citizen statement against submitted documents.",
      "Dispatch case to assigned regional Legal Guide.",
      "Coordinate representation with recommended redressal authority."
    ];

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#18332B] p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#65736D] font-bold uppercase tracking-wider">
              <Link to={dashboardUrl} className="hover:text-[#163D32] flex items-center gap-1 transition">
                <ArrowLeft size={14} /> {dashboardTitle}
              </Link>
              <span>/</span>
              <span className="text-[#163D32]">Case #{complaint.id}</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-[#163D32] tracking-tight mt-1">
              {complaint.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#65736D] font-medium mt-1.5">
              <span className="font-bold text-[#163D32] bg-[#DCEBDD] px-2.5 py-0.5 rounded-full border border-[#c5ddc6]">
                ID: {complaint.complaintCustomId || `ARAM-${complaint.id}`}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={13} className="text-[#1F5948]" /> Jurisdiction: <strong className="text-[#163D32]">{complaint.district || "Coimbatore"}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <User size={13} className="text-[#1F5948]" /> Citizen: <strong className="text-[#163D32]">{complaint.userName || "Applicant"}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar size={13} className="text-[#1F5948]" /> {new Date(complaint.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-2xs ${
                complaint.status === "RESOLVED" || complaint.status === "RESOLVED_BY_GUIDE"
                  ? "bg-[#DCEBDD] text-[#163D32] border-[#c5ddc6]"
                  : complaint.status === "IN_PROGRESS" || complaint.status === "HELPER_ASSIGNED"
                  ? "bg-blue-50 text-blue-900 border-blue-200"
                  : "bg-[#E8C978]/30 text-[#C58A25] border-[#D6B45E]"
              }`}
            >
              {complaint.status === "SUBMITTED" ? "Awaiting Legal Guide Assignment" : complaint.status.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        {/* Sensitive case banner */}
        <SensitiveCasePanel complaint={complaint} />

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E6E1D8] gap-2 text-xs font-black uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`py-3 px-4 border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === "overview"
                ? "border-[#163D32] text-[#163D32]"
                : "border-transparent text-[#65736D] hover:text-[#163D32]"
            }`}
          >
            <Layers size={14} /> Overview & Guide Assignment
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ai")}
            className={`py-3 px-4 border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === "ai"
                ? "border-[#163D32] text-[#163D32]"
                : "border-transparent text-[#65736D] hover:text-[#163D32]"
            }`}
          >
            <Sparkles size={14} className="text-[#1F5948]" /> AI Legal Analysis & Breakdown
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("evidence")}
            className={`py-3 px-4 border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === "evidence"
                ? "border-[#163D32] text-[#163D32]"
                : "border-transparent text-[#65736D] hover:text-[#163D32]"
            }`}
          >
            <FileCheck size={14} /> Evidence & Documents ({requiredDocs.length})
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW & GUIDE ASSIGNMENT                                        */}
        {/* ========================================================================= */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              
              {/* Original Grievance Statement */}
              <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-6 sm:p-7 shadow-sm space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#65736D] block">
                  Original Citizen Grievance Statement
                </span>
                <p className="text-sm font-medium text-[#18332B] whitespace-pre-wrap leading-relaxed bg-[#F7F1E6]/60 p-4 rounded-2xl border border-[#E6E1D8]">
                  "{complaint.description}"
                </p>
              </div>

              {/* Guide Assignment Engine */}
              {complaint.status !== "RESOLVED" && complaint.status !== "CLOSED" && (
                <GuideAssignmentPanel
                  complaint={complaint}
                  onAssignSuccess={loadComplaintDetails}
                />
              )}
            </div>

            {/* Case Metadata Sidebar */}
            <div className="space-y-6">
              <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-6 shadow-sm space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#65736D] block">
                  Case Metadata
                </span>
                
                <div className="divide-y divide-[#E6E1D8] text-xs">
                  <div className="py-3 flex justify-between items-center">
                    <span className="text-[#65736D] font-bold">Category</span>
                    <span className="font-extrabold text-[#163D32] bg-[#DCEBDD] px-2.5 py-0.5 rounded-full border border-[#c5ddc6]">
                      {complaint.categoryLabel || complaint.category || "GENERAL"}
                    </span>
                  </div>
                  <div className="py-3 flex justify-between items-center">
                    <span className="text-[#65736D] font-bold">Language</span>
                    <span className="font-bold text-[#18332B] uppercase">
                      {complaint.language || "ENGLISH / TAMIL"}
                    </span>
                  </div>
                  <div className="py-3 flex justify-between items-center">
                    <span className="text-[#65736D] font-bold">Priority Triage</span>
                    <span className="font-bold text-[#18332B]">
                      {complaint.priority || "MEDIUM"}
                    </span>
                  </div>
                  <div className="py-3 flex justify-between items-center">
                    <span className="text-[#65736D] font-bold">Target Authority</span>
                    <span className="font-bold text-[#18332B] text-right max-w-[180px] truncate">
                      {complaint.authority || aiResult.recommendedAuthority || "DLSA Office"}
                    </span>
                  </div>
                  <div className="py-3 flex justify-between items-center">
                    <span className="text-[#65736D] font-bold">Assigned Guide</span>
                    <span className="font-extrabold text-[#1F5948]">
                      {complaint.assignedHelperName || "Pending Assignment"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Redressal Department Callout */}
              <div className="bg-[#DCEBDD]/40 border border-[#c5ddc6] rounded-3xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-[#163D32]">
                  <Building2 size={16} className="text-[#1F5948]" />
                  <span>Administrative Routing</span>
                </div>
                <p className="text-xs text-[#18332B] font-medium leading-relaxed">
                  {aiResult.recommendedAuthority || complaint.authority || "District Legal Services Authority (DLSA), Coimbatore"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: AI LEGAL ANALYSIS & BREAKDOWN                                      */}
        {/* ========================================================================= */}
        {activeTab === "ai" && (
          <div className="space-y-6">
            
            {/* AI Synthesized Case Summary Card */}
            <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6E1D8] pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-[#163D32] bg-[#DCEBDD] border border-[#c5ddc6] px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                    <ShieldCheck size={14} className="text-[#1F5948]" /> {complaint.categoryLabel || complaint.category || "Legal Aid"}
                  </span>
                  <span className="text-xs font-bold text-[#65736D] bg-[#F7F1E6] border border-[#E6E1D8] px-3 py-1 rounded-full flex items-center gap-1">
                    <MapPin size={13} className="text-[#65736D]" /> {complaint.district || "Coimbatore"}
                  </span>
                </div>
                <span className="text-xs font-extrabold text-[#1F5948] flex items-center gap-1.5">
                  <Sparkles size={14} /> AI Verified Legal Triage
                </span>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#65736D] block">
                  AI Formulated Case Headline
                </span>
                <h3 className="text-xl font-black text-[#163D32] tracking-tight">
                  {complaint.title}
                </h3>
              </div>

              {/* Situation Overview */}
              <div className="p-5 bg-[#F7F1E6]/70 rounded-2xl border border-[#E6E1D8] text-xs text-[#18332B] space-y-2 leading-relaxed font-medium">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1F5948] block">
                  Case Understanding & Situation Overview
                </span>
                <p className="text-sm">
                  {situationOverview}
                </p>
              </div>

              {/* Extracted Facts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 bg-[#FFFDF8] rounded-2xl border border-[#E6E1D8] shadow-2xs">
                  <span className="text-[10px] text-[#65736D] font-bold uppercase block">Parties Identified</span>
                  <span className="font-bold text-[#18332B] capitalize mt-1 block">
                    {importantFacts.entities ? importantFacts.entities.join(", ") : "Citizen & Opposing Party"}
                  </span>
                </div>
                <div className="p-3.5 bg-[#FFFDF8] rounded-2xl border border-[#E6E1D8] shadow-2xs">
                  <span className="text-[10px] text-[#65736D] font-bold uppercase block">Claim / Value Involved</span>
                  <span className="font-black text-[#163D32] mt-1 block">
                    {importantFacts.amounts && importantFacts.amounts[0] !== "Not specified" ? importantFacts.amounts.join(", ") : "Property / Title Value"}
                  </span>
                </div>
                <div className="p-3.5 bg-[#FFFDF8] rounded-2xl border border-[#E6E1D8] shadow-2xs">
                  <span className="text-[10px] text-[#65736D] font-bold uppercase block">Timeline / Notice</span>
                  <span className="font-bold text-[#18332B] mt-1 block">
                    {importantFacts.dates && importantFacts.dates[0] !== "As mentioned in complaint" ? importantFacts.dates.join(", ") : "Recent Transaction Dispute"}
                  </span>
                </div>
              </div>

              {/* Identified Legal Rights & Concerns */}
              <div className="space-y-2.5 pt-2">
                <label className="text-[10px] font-extrabold text-[#65736D] uppercase tracking-widest block">
                  Identified Legal Rights & Statutory Concerns
                </label>
                <div className="flex flex-wrap gap-2">
                  {legalConcerns.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 rounded-full bg-[#DCEBDD] text-[#163D32] text-xs font-bold border border-[#c5ddc6] flex items-center gap-1.5 shadow-2xs"
                    >
                      <CheckCircle size={13} className="text-[#1F5948]" /> {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommended Redressal Authority Card */}
              <div className="p-5 rounded-2xl bg-[#DCEBDD]/30 border border-[#c5ddc6] space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-[#1F5948] uppercase tracking-wider">
                    Recommended Redressal Authority & Department
                  </span>
                  <span className="text-[10px] font-bold text-[#163D32] bg-white border border-[#c5ddc6] px-2.5 py-0.5 rounded-md">
                    Jurisdiction: {complaint.district || "Coimbatore"}
                  </span>
                </div>
                <p className="text-base font-black text-[#163D32]">
                  {aiResult.recommendedAuthority || complaint.authority || "Tahsildar / RDO / Taluk Office, Coimbatore"}
                </p>
                <p className="text-[11px] text-[#65736D] font-medium">
                  Official grievance routing verified based on Tamil Nadu administrative & revenue jurisdiction.
                </p>
              </div>

              {/* Action Plan Checklist */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-extrabold text-[#65736D] uppercase tracking-widest block">
                  Recommended Next Steps & Action Plan
                </span>
                <div className="space-y-2">
                  {actionPlan.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 bg-[#F7F1E6]/50 rounded-xl border border-[#E6E1D8] text-xs font-medium text-[#18332B]"
                    >
                      <span className="h-5 w-5 rounded-full bg-[#163D32] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: REQUIRED EVIDENCE & DOCUMENTS                                      */}
        {/* ========================================================================= */}
        {activeTab === "evidence" && (
          <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-black text-[#163D32]">
                Required Legal Supporting Evidence
              </h3>
              <p className="text-xs text-[#65736D] font-medium mt-1">
                Mandatory and recommended verification documents for {complaint.categoryLabel || complaint.category || "this case"}.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {requiredDocs.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-[#F7F1E6]/60 border border-[#E6E1D8] font-bold text-[#18332B] shadow-2xs"
                >
                  <div className="p-2 bg-[#DCEBDD] text-[#163D32] rounded-xl shrink-0">
                    <FileText size={16} />
                  </div>
                  <div>
                    <p className="font-bold text-[#163D32]">{doc}</p>
                    <span className="text-[10px] text-[#65736D] font-medium">Official Supporting Document</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
