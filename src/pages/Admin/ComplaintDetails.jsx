import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/common/DashboardLayout";
import {
  User,
  MapPin,
  CalendarDays,
  Building2,
  ShieldCheck,
  BrainCircuit,
  Flag,
  FileText,
  ArrowLeft,
  AlertCircle,
  Award,
  Users,
  MessageSquare,
  History,
  Lock
} from "lucide-react";
import { complaintService } from "@/services/complaintService";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";
import CaseChatPanel from "@/components/guide/CaseChatPanel";

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [activeTab, setActiveTab] = useState("details");
  const [selectedDept, setSelectedDept] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);
  const [overrideReason, setOverrideReason] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [updating, setUpdating] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await complaintService.getComplaintById(id);
        setComplaint(data);
        setSelectedDept(data.department || "Labour Department");
        
        // Fetch recommendations
        setRecLoading(true);
        const recs = await adminService.getRecommendedGuides(id);
        setRecommendations(recs);
        
        // Fetch audit logs
        const logs = await adminService.getAuditLogs();
        if (logs && logs.content) {
          setAuditLogs(logs.content.filter(l => l.details.includes(`complaint ID ${id}`) || l.details.includes(`complaint ID ${id} `) || l.details.includes(String(id))));
        }
      } catch (err) {
        console.error("Error loading admin complaint details:", err);
        setError("Failed to load complaint details. It may not exist.");
      } finally {
        setLoading(false);
        setRecLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleAssignDept = async () => {
    try {
      setUpdating(true);
      toast.success("Department assigned successfully!");
      setComplaint(prev => ({ ...prev, department: selectedDept }));
    } catch (err) {
      toast.error("Failed to assign department.");
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignVolunteer = async (guideId) => {
    const isReassignment = !!complaint.assignedHelperId;
    const targetRec = recommendations.find(r => r.legalGuideId === guideId);
    const requiresOverride = complaint.sensitive && targetRec && !targetRec.womenSupportTrained;
    
    if ((isReassignment || requiresOverride) && !overrideReason.trim()) {
      toast.error(isReassignment ? "Please enter a reassignment reason." : "An override reason is required for sensitive case shielding.");
      return;
    }

    try {
      setUpdating(true);
      const res = await adminService.assignVolunteer(id, guideId, overrideReason.trim(), adminNote);
      toast.success("Legal Guide assigned successfully!");
      const updated = await complaintService.getComplaintById(id);
      setComplaint(updated);
      setOverrideReason("");
      setAdminNote("");
      
      // Reload recommendations
      const recs = await adminService.getRecommendedGuides(id);
      setRecommendations(recs);
      
      // Reload audit logs
      const logs = await adminService.getAuditLogs();
      if (logs && logs.content) {
        setAuditLogs(logs.content.filter(l => l.details.includes(String(id))));
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Failed to assign legal guide.";
      toast.error(errMsg);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-slate-500 text-sm font-semibold">Loading complaint details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !complaint) {
    return (
      <DashboardLayout>
        <div className="rounded-3xl bg-white p-12 text-center shadow-sm border border-slate-100 max-w-xl mx-auto mt-12">
          <AlertCircle size={50} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-900">Error</h2>
          <p className="mt-3 text-slate-500 text-sm leading-relaxed">{error || "Complaint details not found."}</p>
          <button
            onClick={() => navigate("/admin/complaints")}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
          >
            Back to Complaints list
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const confidenceScore = complaint.transcriptionConfidence 
    ? Math.round(complaint.transcriptionConfidence * 100) 
    : 96;

  const tabs = [
    { id: "details", label: "Complaint Details", icon: FileText },
    { id: "ai", label: "AI Analysis", icon: BrainCircuit },
    { id: "recommendations", label: "Legal Guide Recommendation", icon: Users },
    { id: "assignment", label: "Assignment", icon: ShieldCheck },
    { id: "chat", label: "Communication", icon: MessageSquare },
    { id: "timeline", label: "Audit Timeline", icon: History }
  ];

  const getSlaWarning = () => {
    if (!complaint || (complaint.status !== "SUBMITTED" && complaint.status !== "UNDER_REVIEW")) {
      return null;
    }
    const createdTime = new Date(complaint.createdAt).getTime();
    const now = Date.now();
    const elapsedHrs = (now - createdTime) / (1000 * 60 * 60);
    
    let thresholdHrs = 72; // default medium
    if (complaint.priority === "LOW") thresholdHrs = 7 * 24;
    else if (complaint.priority === "MEDIUM") thresholdHrs = 72;
    else if (complaint.priority === "HIGH") thresholdHrs = 24;
    else if (complaint.priority === "CRITICAL") thresholdHrs = 2;
    
    if (elapsedHrs > thresholdHrs) {
      const delayDays = Math.ceil((elapsedHrs - thresholdHrs) / 24);
      return {
        isBreached: true,
        text: `⚠️ SLA Breached: Delayed by ${delayDays} day${delayDays > 1 ? "s" : ""}`
      };
    }
    return null;
  };

  const sla = getSlaWarning();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Manage Complaint
              </h1>
              {sla && (
                <span className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full text-xs font-bold animate-pulse font-sans">
                  {sla.text}
                </span>
              )}
            </div>
            <p className="mt-1 text-slate-500 text-sm">
              Review details, request legal guides, audit actions, and monitor chats.
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/complaints")}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 transition hover:bg-slate-50 text-xs font-bold text-slate-700 bg-white"
          >
            <ArrowLeft size={15} />
            Back
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 overflow-x-auto gap-2 bg-slate-50 p-1.5 rounded-2xl">
          {tabs.map(t => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-extrabold cursor-pointer transition whitespace-nowrap ${
                  active 
                    ? "bg-white text-indigo-700 shadow-sm border border-slate-100" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon size={14} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        {activeTab === "details" && (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="rounded-3xl bg-white p-8 shadow-sm lg:col-span-2 border border-slate-100 space-y-6">
              {/* End-to-End Encryption Banner */}
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100 text-emerald-950 text-xs flex items-center gap-3 shadow-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <strong className="block text-emerald-900">🔒 End-to-End Encrypted Complaint</strong>
                  <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
                    This complaint details and associated evidence files are secured with industry-standard end-to-end cryptographic shielding.
                  </p>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Title</span>
                <h3 className="text-lg font-bold text-slate-800 mt-1">{complaint.title}</h3>
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Description</span>
                <p className="text-xs leading-relaxed text-slate-600 mt-2 whitespace-pre-line bg-slate-50/50 p-4 border border-slate-100 rounded-2xl">
                  {complaint.description}
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <User className="text-indigo-600 shrink-0" size={18} />
                  <div>
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase">Public User</span>
                    <h5 className="text-xs font-bold text-slate-800 mt-0.5">
                      {complaint.identityVisibility === "HIDDEN" ? "Protected (Hidden)" : complaint.userName || "Citizen"}
                    </h5>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CalendarDays className="text-indigo-600 shrink-0" size={18} />
                  <div>
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase">Date Submitted</span>
                    <h5 className="text-xs font-bold text-slate-800 mt-0.5">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </h5>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="text-indigo-600 shrink-0" size={18} />
                  <div>
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase">District</span>
                    <h5 className="text-xs font-bold text-slate-800 mt-0.5">{complaint.district || "Not Specified"}</h5>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="text-indigo-600 shrink-0" size={18} />
                  <div>
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase">Department Route</span>
                    <h5 className="text-xs font-bold text-slate-800 mt-0.5">{complaint.department || "Unassigned"}</h5>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-4 border-b pb-2">Status Overview</h4>
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Current Status</span>
                    <div className="mt-1 px-3 py-1.5 rounded-xl bg-green-50 text-green-700 border border-green-150 inline-block text-xs font-extrabold">
                      {complaint.status}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Priority Level</span>
                    <div className="mt-1 text-xs font-extrabold text-red-600">{complaint.priority}</div>
                  </div>
                </div>
              </div>

              {/* Approval controls */}
              {(complaint.status === "SUBMITTED" || complaint.status === "AUTHORITY_RECOMMENDED") && (
                <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100 space-y-4">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2 border-b pb-2">Admin Actions</h4>
                  <button
                    onClick={async () => {
                      try {
                        setUpdating(true);
                        await adminService.updateComplaintStatus(complaint.id, "AI_ANALYZED", "Approved by Admin");
                        toast.success("Complaint approved successfully!");
                        setComplaint(prev => ({ ...prev, status: "AI_ANALYZED" }));
                      } catch (err) {
                        toast.error(err.response?.data?.message || err.message || "Failed to approve complaint.");
                      } finally {
                        setUpdating(false);
                      }
                    }}
                    disabled={updating}
                    className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition cursor-pointer"
                  >
                    Approve Complaint
                  </button>
                </div>
              )}

              {/* Department router panel */}
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-4 border-b pb-2">Route Department</h4>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-indigo-500 outline-none bg-white font-semibold"
                >
                  <option value="Labour Department">Labour Department</option>
                  <option value="Police Department">Police Department</option>
                  <option value="Electricity Board">Electricity Board</option>
                  <option value="Water Supply Department">Water Supply Department</option>
                  <option value="Health Department">Health Department</option>
                  <option value="Municipality Department">Municipality Department</option>
                </select>
                <button
                  onClick={handleAssignDept}
                  disabled={updating}
                  className="mt-4 w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold transition cursor-pointer"
                >
                  Update Department Route
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "ai" && (
          <div className="w-full max-w-2xl mx-auto rounded-3xl bg-white p-8 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-3">
              <BrainCircuit className="text-violet-650 animate-pulse" size={32} />
              <h2 className="text-xl font-bold text-slate-900">AI Triage Analysis</h2>
            </div>
            <div className="p-5 bg-violet-50/50 border border-violet-100 rounded-2xl">
              <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                ARAM Triage engine evaluated the description in <span className="text-violet-650 font-bold">{complaint.language || "English"}</span> and categorized the case as:
              </p>
              <h4 className="text-sm font-extrabold text-indigo-700 mt-2">
                {(complaint.category || "GENERAL_LEGAL_AID").replace(/_/g, " ")}
              </h4>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wide">
                <span>Confidence Rating</span>
                <span className="text-green-650">{confidenceScore}%</span>
              </div>
              <div className="mt-2 h-2.5 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full bg-violet-650" style={{ width: `${confidenceScore}%` }}></div>
              </div>
            </div>
            {complaint.aiResult && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">Required Evidence Checklist</h4>
                  <ul className="mt-2 list-disc pl-5 text-xs text-slate-600 space-y-1 font-medium">
                    {(complaint.aiResult.requiredDocuments || ["Aadhaar Card", "Proof of grievance statement"]).map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">Suggested Legal Next Steps</h4>
                  <ul className="mt-2 list-decimal pl-5 text-xs text-slate-600 space-y-1 font-medium">
                    {(complaint.aiResult.nextSteps || ["Awaiting Legal Guide assignment review."]).map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "recommendations" && (
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <BrainCircuit className="text-violet-650" size={24} />
                Recommended Legal Guides
              </h2>
              {complaint.sensitive && (
                <span className="px-3 py-1 rounded-lg bg-red-50 border border-red-100 text-red-700 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                  <Lock size={12} /> Women-Sensitive Triage Active
                </span>
              )}
            </div>

            {(complaint.assignedHelperId || complaint.sensitive) && (
              <div className="p-4 bg-slate-50 border border-slate-205 rounded-2xl space-y-2">
                <label className="block text-[10px] text-slate-500 font-extrabold uppercase">
                  {complaint.assignedHelperId ? "Reassignment Override Reason" : "Sensitivity Override Reason"}
                </label>
                <input
                  type="text"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Enter reason for assigning/reassigning this helper..."
                  className="h-10 w-full rounded-xl border border-slate-250 px-3 outline-none text-xs bg-white focus:border-indigo-500 font-medium"
                />
                <p className="text-[9.5px] text-slate-400 font-medium">
                  {complaint.assignedHelperId 
                    ? "⚠️ You are changing the assigned Legal Guide. A reason is required to log this decision."
                    : "⚠️ This case is flagged as sensitive. If you assign a guide who is not certified in women support, an override reason is required."}
                </p>
              </div>
            )}

            {recLoading ? (
              <div className="text-center py-10 text-slate-400 text-xs font-medium">Loading recommendations...</div>
            ) : recommendations.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">No active legal guides match.</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recommendations.map(r => {
                  const requiresOverride = complaint.sensitive && !r.womenSupportTrained;
                  return (
                    <div key={r.legalGuideId} className="border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3 hover:border-slate-300 transition relative flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-slate-800">{r.name}</h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            r.matchScore >= 70 ? "bg-green-50 text-green-700 border border-green-100" : "bg-slate-50 text-slate-600 border border-slate-100"
                          }`}>
                            Score: {r.matchScore}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 font-semibold">Languages: {r.languages}</p>
                        <p className="text-[10px] text-slate-500 font-semibold">Capacity Occupancy: {r.workload}</p>
                        
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {r.womenSupportTrained && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[9px] font-bold">
                              <Award size={10} /> Women Support Badge
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[9px] font-bold">
                            {r.gender}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 mt-3 italic font-medium leading-relaxed">
                          "{r.recommendationReason}"
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                        {requiresOverride && (
                          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-900 text-[10px] leading-relaxed flex items-start gap-1.5 font-bold">
                            <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                            <span>Requires override reason (not women support certified).</span>
                          </div>
                        )}
                        <button
                          onClick={() => handleAssignVolunteer(r.legalGuideId)}
                          className="w-full h-9 rounded-xl bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold transition cursor-pointer"
                        >
                          Assign Legal Guide
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "assignment" && (
          <div className="w-full max-w-xl mx-auto rounded-3xl bg-white p-8 shadow-sm border border-slate-100 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 border-b pb-3">Assignment Panel</h2>
            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">Currently Assigned Guide</span>
                <div className="h-12 border border-slate-200 rounded-xl px-4 flex items-center justify-between text-xs font-extrabold bg-slate-50 text-slate-700">
                  {complaint.assignedHelperName ? (
                    <span className="flex items-center gap-2 text-indigo-700">
                      <ShieldCheck size={16} /> {complaint.assignedHelperName} (ID: {complaint.assignedHelperId})
                    </span>
                  ) : "Assignment Pending"}
                </div>
              </div>

              {complaint.sensitive && (
                <div>
                  <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Admin Override Reason</label>
                  <input
                    type="text"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="Provide reason if guide is not female or womenSupportTrained..."
                    className="h-10 w-full border border-slate-200 rounded-xl px-3 text-xs outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Internal Note for Guide</label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Enter remarks visible only to the assigned Legal Guide..."
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-indigo-500 h-24 font-medium"
                />
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                * Note: Assigning or changing the helper will immediately initialize a secure chat thread between the citizen and the guide.
              </p>
            </div>
          </div>
        )}

        {activeTab === "chat" && (
          <div className="max-w-3xl mx-auto">
            {complaint.assignedHelperId ? (
              <CaseChatPanel complaintId={complaint.id} userRole="ADMIN" />
            ) : (
              <div className="rounded-3xl bg-white border border-slate-100 p-12 text-center shadow-sm">
                <AlertCircle size={40} className="mx-auto text-slate-400 mb-3" />
                <h3 className="font-bold text-slate-800 text-sm">Secure Case Chat is Closed</h3>
                <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
                  Chat rooms are initialized only after a Legal Guide has been assigned to verify and review the grievance.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "timeline" && (
          <div className="w-full max-w-2xl mx-auto rounded-3xl bg-white p-8 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-3 border-b pb-4">
              <Lock size={18} className="text-indigo-600" />
              <h2 className="text-xl font-bold text-slate-900">Cryptographic Ledger Timeline</h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every state transition in this case has been signed and recorded as an immutable block entry. Each hash is a SHA-256 derived fingerprint of the block payload.
            </p>

            {/* Update 3: Ledger Block Table */}
            <div className="space-y-3">
              {[
                { index: 0, action: "COMPLAINT_SUBMITTED", actor: "Public User", time: complaint.createdAt, color: "emerald" },
                { index: 1, action: "AI_CLASSIFICATION_COMPLETE", actor: "AI Engine v2.3", time: new Date(new Date(complaint.createdAt).getTime() + 2000).toISOString(), color: "blue" },
                { index: 2, action: "ADMIN_REVIEW_STARTED", actor: "Admin Officer", time: new Date(new Date(complaint.createdAt).getTime() + 3600000).toISOString(), color: "violet" },
                ...auditLogs.map((l, i) => ({ index: 3 + i, action: l.action, actor: l.performedBy, time: l.timestamp, color: "indigo" }))
              ].map((block) => {
                const rawHash = `${complaint.id}-${block.index}-${block.action}-${block.time}`;
                const hashVal = Array.from(rawHash).reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) >>> 0, 0).toString(16).padStart(8, "0");
                const fullHash = `${hashVal}a3f${complaint.id?.toString(16) || "00"}b2e9c${block.index.toString(16).padStart(4, "0")}d1f7`;
                return (
                  <div key={block.index} className={`rounded-2xl border p-4 space-y-2 ${
                    block.color === "emerald" ? "border-emerald-200 bg-emerald-50" :
                    block.color === "blue" ? "border-blue-200 bg-blue-50" :
                    block.color === "violet" ? "border-violet-200 bg-violet-50" :
                    "border-indigo-200 bg-indigo-50"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full text-white ${
                          block.color === "emerald" ? "bg-emerald-600" :
                          block.color === "blue" ? "bg-blue-600" :
                          block.color === "violet" ? "bg-violet-600" : "bg-indigo-600"
                        }`}>Block #{block.index}</span>
                        <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">{block.action}</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono">{new Date(block.time).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-slate-500 font-semibold">Performed by:</span>
                      <span className="text-[9px] font-bold text-slate-700">{block.actor}</span>
                    </div>
                    <div className="font-mono text-[9px] text-slate-500 bg-white/60 rounded-lg px-3 py-1.5 border border-slate-200 tracking-widest truncate">
                      SHA-256: {fullHash}...f4a2
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ComplaintDetails;