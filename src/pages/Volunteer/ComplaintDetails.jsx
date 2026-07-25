import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  CalendarDays,
  MapPin,
  User,
  Building2,
  ShieldCheck,
  Paperclip,
  Download,
  Clock3,
  AlertCircle
} from "lucide-react";
import { volunteerService } from "../../services/volunteerService";
import { complaintService } from "../../services/complaintService";
import { toast } from "sonner";
import CaseChatPanel from "@/components/CaseChatPanel";

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  const [docRequests, setDocRequests] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [showRequestDocModal, setShowRequestDocModal] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [newDocReason, setNewDocReason] = useState("");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [scheduleDateTime, setScheduleDateTime] = useState("");
  const [resolutionSummary, setResolutionSummary] = useState("");
  const [rejectingDocId, setRejectingDocId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submittingFlow, setSubmittingFlow] = useState(false);

  useEffect(() => {
    async function loadComplaint() {
      try {
        setLoading(true);
        const data = await volunteerService.getCaseById(id);
        setComplaint(data);
        setNotes(data.legalOpinion || "");
        setResolutionSummary(data.resolutionSummary || "");

        // Load document requests list
        const docReqs = await complaintService.getDocumentRequests(id);
        setDocRequests(docReqs);

        // Load appointments list
        const apps = await complaintService.getAppointments(id);
        setAppointments(apps);
      } catch (err) {
        console.error("Error loading case details:", err);
        setError("Failed to load case details. It may not exist or you may not be assigned to it.");
      } finally {
        setLoading(false);
      }
    }
    loadComplaint();
  }, [id]);

  const handleRequestDocument = async () => {
    if (!newDocName.trim()) {
      toast.error("Please enter a document name.");
      return;
    }
    setSubmittingFlow(true);
    try {
      await volunteerService.requestDocument(id, {
        documentName: newDocName.trim(),
        reason: newDocReason.trim()
      });
      toast.success("Document request created!");
      setShowRequestDocModal(false);
      setNewDocName("");
      setNewDocReason("");
      const docReqs = await complaintService.getDocumentRequests(id);
      setDocRequests(docReqs);
    } catch (err) {
      toast.error("Failed to create document request.");
    } finally {
      setSubmittingFlow(false);
    }
  };

  const handleVerifyDocument = async (requestId) => {
    try {
      await volunteerService.verifyDocument(requestId, id);
      toast.success("Document marked as verified!");
      const docReqs = await complaintService.getDocumentRequests(id);
      setDocRequests(docReqs);
    } catch (err) {
      toast.error("Failed to verify document.");
    }
  };

  const handleRejectDocument = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please enter a rejection reason.");
      return;
    }
    setSubmittingFlow(true);
    try {
      await volunteerService.rejectDocument(rejectingDocId, id, rejectionReason.trim());
      toast.success("Document request marked as rejected.");
      setRejectingDocId(null);
      setRejectionReason("");
      const docReqs = await complaintService.getDocumentRequests(id);
      setDocRequests(docReqs);
    } catch (err) {
      toast.error("Failed to reject document.");
    } finally {
      setSubmittingFlow(false);
    }
  };

  const handleScheduleCall = async () => {
    if (!scheduleDateTime) {
      toast.error("Please pick a schedule date & time.");
      return;
    }
    setSubmittingFlow(true);
    try {
      await volunteerService.scheduleAppointment(selectedAppId, id, scheduleDateTime);
      toast.success("Meeting scheduled successfully!");
      setShowScheduleModal(false);
      setSelectedAppId(null);
      setScheduleDateTime("");
      const apps = await complaintService.getAppointments(id);
      setAppointments(apps);
    } catch (err) {
      toast.error("Failed to schedule meeting.");
    } finally {
      setSubmittingFlow(false);
    }
  };

  const handleMarkResolved = async () => {
    if (!resolutionSummary.trim()) {
      toast.error("Please enter a resolution summary first.");
      return;
    }
    setSubmittingFlow(true);
    try {
      const updated = await volunteerService.markResolved(id, resolutionSummary.trim());
      setComplaint(updated);
      toast.success("Case successfully resolved! Citizen notified to confirm.");
    } catch (err) {
      toast.error("Failed to resolve case.");
    } finally {
      setSubmittingFlow(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      const res = await volunteerService.updateCaseStatus(id, {
        status: newStatus,
        notes: notes
      });
      toast.success(res.message || `Case marked as ${newStatus.toLowerCase()} successfully!`);
      // Reload
      const updatedData = await volunteerService.getCaseById(id);
      setComplaint(updatedData);
    } catch (err) {
      toast.error(err.message || "Failed to update case status.");
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
          <h2 className="text-xl font-bold text-slate-900">Access Denied / Error</h2>
          <p className="mt-3 text-slate-500 text-sm leading-relaxed">{error || "Case details not found."}</p>
          <button
            onClick={() => navigate("/volunteer/assigned-cases")}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
          >
            Back to Assigned Cases
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Emergency Alert Banner */}
        {complaint.highRisk && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-xs text-red-950 space-y-2 animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-2">
              <span className="text-base">🚨</span>
              <span className="font-bold uppercase tracking-wider text-red-800">High Risk / Safety Warning Alert</span>
            </div>
            <p className="leading-relaxed font-semibold">
              This case has been marked as High Risk / Women Sensitive. Ensure safe communication preferences are strictly followed. Do not share user location without consent.
            </p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">
              Complaint Details
            </h1>
            <p className="mt-2 text-slate-500">
              Review the assigned complaint and update its progress.
            </p>
          </div>
          <button
            onClick={() => navigate("/volunteer/assigned-cases")}
            className="rounded-xl border border-slate-300 px-6 py-3 hover:bg-slate-100 transition text-xs font-semibold text-slate-700 bg-white"
          >
            Back
          </button>
        </div>

        {/* Status Cards */}
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Status</p>
            <h2 className={`mt-3 text-2xl font-bold ${
              complaint.status === "RESOLVED" ? "text-green-600" :
              complaint.status === "REJECTED" ? "text-red-600" : "text-orange-600"
            }`}>
              {complaint.status}
            </h2>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Priority</p>
            <h2 className={`mt-3 text-2xl font-bold ${
              complaint.priority === "CRITICAL" || complaint.priority === "HIGH" ? "text-red-600" : "text-slate-700"
            }`}>
              {complaint.priority}
            </h2>
            <p className="text-[10px] font-semibold text-slate-400 mt-1">
              {complaint.priority === "HIGH" ? "24 Hours SLA Target" : complaint.priority === "CRITICAL" ? "Immediate Review Target" : complaint.priority === "LOW" ? "7 Days SLA Target" : "72 Hours SLA Target"}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Category</p>
            <h2 className="mt-3 text-base font-bold text-slate-800 truncate">
              {complaint.category ? complaint.category.replace(/_/g, " ") : "GENERAL LEGAL AID"}
            </h2>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Submitted On</p>
            <h2 className="mt-3 text-lg font-bold text-slate-800">
              {new Date(complaint.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric"
              })}
            </h2>
          </div>
        </div>

        {/* Complaint Info */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="rounded-3xl bg-white p-8 shadow-sm lg:col-span-2 border border-slate-100">
            <h2 className="mb-6 text-2xl font-bold text-slate-900 border-b pb-4">
              Complaint Information
            </h2>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Complaint Title
                </label>
                <h3 className="mt-1.5 text-xl font-bold text-slate-800">
                  {complaint.title}
                </h3>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Description
                </label>
                <p className="mt-1.5 leading-relaxed text-slate-600 text-sm whitespace-pre-line">
                  {complaint.description}
                </p>
              </div>

              {/* Blockchain Integrity Verification Alert */}
              {complaint.blockchainInfo && (
                complaint.blockchainInfo.verified ? (
                  <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100 text-emerald-950 text-xs flex flex-col gap-2 shadow-sm my-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                      <span>
                        <strong>🔒 Verified on Blockchain:</strong> This case's cryptographic integrity has been successfully validated against a tamper-proof ledger.
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
                  <div className="p-4 bg-rose-50 rounded-xl border border-rose-100 text-rose-950 text-xs flex flex-col gap-2 my-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={16} className="text-rose-600 shrink-0 animate-pulse" />
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

              <div className="grid gap-6 md:grid-cols-2 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Public User Info
                    </p>
                    <h4 className="font-semibold text-slate-800 text-sm">
                      {complaint.identityVisibility === "HIDDEN" ? "Masked / Anonymous" : (complaint.citizenName || "Sharon Robert")}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      District
                    </p>
                    <h4 className="font-semibold text-slate-800 text-sm">
                      {complaint.district || "Coimbatore"}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Verification Priority Score
                    </p>
                    <h4 className="font-semibold text-slate-800 text-sm">
                      {complaint.priorityScore || 50} / 100
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-violet-50 text-violet-650 rounded-xl">
                    <CalendarDays size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Last Updated
                    </p>
                    <h4 className="font-semibold text-slate-800 text-sm">
                      {new Date(complaint.updatedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Volunteer Card */}
          <div className="rounded-3xl bg-slate-900 p-8 text-white flex flex-col justify-between shadow-md">
            <div>
              <ShieldCheck size={48} className="text-blue-400" />
              <h2 className="mt-6 text-2xl font-bold">
                Assigned Case
              </h2>
              <p className="mt-4 leading-relaxed text-slate-300 text-xs">
                You are assigned as the primary Legal Aid/Social Volunteer to inspect, intermediate, and verify this report. Check the document evidence and draft your recommendations.
              </p>
            </div>

            <div className="mt-8 rounded-2xl bg-slate-800 p-4 border border-slate-800">
              <div className="flex items-center gap-3 text-xs font-semibold">
                <Clock3 className="text-blue-400" size={16} />
                <span>Response Target: 48 Hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline & Attachments */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Timeline */}
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
            <h2 className="mb-6 text-xl font-bold text-slate-900 border-b pb-4">
              Complaint Timeline
            </h2>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <div className="h-12 w-[2px] bg-slate-200 mt-1"></div>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-800">
                    Complaint Submitted
                  </h4>
                  <p className="mt-1 text-slate-500 text-xs font-medium">
                    {new Date(complaint.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-800">
                    Assigned to Helper Service
                  </h4>
                  <p className="mt-1 text-slate-500 text-xs font-medium">
                    {new Date(complaint.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
            <h2 className="mb-6 text-xl font-bold text-slate-900 border-b pb-4">
              Evidence Attachments
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <Paperclip className="text-slate-400" size={18} />
                  <div>
                    <h4 className="font-semibold text-xs text-slate-800 truncate max-w-xs">
                      evidence_slip_{complaint.id}.pdf
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Attachment Proof (OCR Screened)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toast.success("Downloading attachment proof slip...")}
                  className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition"
                >
                  <Download size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Document Requests Management */}
        <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xl font-bold text-slate-900">Requested Case Documents</h2>
            <button
              onClick={() => setShowRequestDocModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              + Request Document
            </button>
          </div>

          {docRequests && docRequests.length > 0 ? (
            <div className="space-y-3">
              {docRequests.map((req) => (
                <div key={req.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-200 text-slate-700">
                      {req.status}
                    </span>
                    <h4 className="text-xs font-bold text-slate-805 mt-1">{req.documentName}</h4>
                    {req.reason && <p className="text-[10px] text-slate-500 italic mt-0.5">{req.reason}</p>}
                    {req.status === "REJECTED" && (
                      <p className="text-[9.5px] text-red-650 font-semibold mt-1">Rejection Reason: {req.rejectionReason}</p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {req.status === "UPLOADED" && (
                      <>
                        <button
                          onClick={() => handleVerifyDocument(req.id)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                        >
                          Verify
                        </button>
                        <button
                          onClick={() => setRejectingDocId(req.id)}
                          className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition cursor-pointer"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {req.status === "VERIFIED" && (
                      <span className="text-xs text-emerald-600 font-bold">Verified ✓</span>
                    )}
                    {req.status === "REQUESTED" && (
                      <span className="text-xs text-slate-400 font-semibold">Awaiting Upload</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No custom evidence documents have been requested for this case yet.</p>
          )}
        </div>

        {/* Appointment Call Schedule Confirmation */}
        <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">Appointments & Call Schedules</h2>
          {appointments && appointments.length > 0 ? (
            <div className="space-y-3">
              {appointments.map((app) => (
                <div key={app.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-805">
                      Requested Mode: {app.mode} ({app.preferredTime})
                    </h4>
                    {app.scheduledAt ? (
                      <p className="text-[11px] text-indigo-700 font-semibold mt-0.5">
                        Scheduled Time: {new Date(app.scheduledAt).toLocaleString()}
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-400 mt-0.5">Status: Pending Guide confirmation</p>
                    )}
                    {app.note && <p className="text-[10px] text-slate-500 mt-1 italic">Citizen Note: "{app.note}"</p>}
                  </div>
                  <div className="shrink-0 flex gap-2">
                    {app.status === "REQUESTED" && (
                      <button
                        onClick={() => {
                          setSelectedAppId(app.id);
                          setShowScheduleModal(true);
                        }}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        Confirm Schedule
                      </button>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-indigo-100 text-indigo-700">
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No calls or appointments have been scheduled or requested for this case.</p>
          )}
        </div>

        {/* Case Resolution Panel */}
        <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">Grievance Resolution</h2>
          <p className="text-xs text-slate-500">
            Submit a detailed summary of the actions taken, documents checked, and final guidance advice given to resolve the citizen's complaint.
          </p>
          <textarea
            rows={5}
            value={resolutionSummary}
            onChange={(e) => setResolutionSummary(e.target.value)}
            placeholder="Write a clear resolution summary (e.g. Verified offer letter, routed case to the Labour Inspector office for final hearing. Citizen advised to visit on Monday.)"
            className="w-full rounded-2xl border border-slate-200 p-4 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 transition text-sm text-slate-800"
          />
          <button
            onClick={handleMarkResolved}
            disabled={submittingFlow}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-755 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer disabled:opacity-50"
          >
            Share Resolution & Mark Resolved
          </button>
        </div>

        {/* Volunteer Update */}
        <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
          <h2 className="mb-4 text-xl font-bold text-slate-900">
            Volunteer Update Remarks (Internal)
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Enter your inspection summary, notes on local verification, or legal opinion for the administrators to act on.
          </p>

          <textarea
            rows={5}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write details on verification, citizen testimony, local status, etc..."
            className="w-full rounded-2xl border border-slate-200 p-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition text-sm text-slate-800"
          />

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => handleUpdateStatus("UNDER_REVIEW")}
              disabled={updating}
              className="rounded-xl bg-slate-800 px-6 py-3 text-xs font-semibold text-white hover:bg-slate-900 transition disabled:opacity-50 cursor-pointer"
            >
              {updating ? "Saving..." : "Save Update & Keep Reviewing"}
            </button>
            <button
              onClick={() => handleUpdateStatus("RESOLVED")}
              disabled={updating}
              className="rounded-xl bg-blue-600 px-6 py-3 text-xs font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
            >
              {updating ? "Saving..." : "Mark as Resolved (Admin Review)"}
            </button>

            <button
              onClick={() => navigate(`/volunteer/case-review/${complaint.id}`)}
              className="rounded-xl border border-slate-300 px-6 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition bg-white cursor-pointer"
            >
              Detailed Case Review Triage
            </button>
          </div>
        </div>

        {/* Secure Communication Panel */}
        <div className="mt-8">
          <CaseChatPanel complaintId={complaint.id} userRole="HELPER" />
        </div>
      </div>

      {/* Request Document Modal Dialog */}
      {showRequestDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">Request Evidence Document</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Document / Proof Name</label>
                <input
                  type="text"
                  placeholder="e.g. Salary Bank Statement / Pay Slip"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 px-3 outline-none text-slate-850 text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Reason / Explanation</label>
                <textarea
                  rows={3}
                  placeholder="Explain why this proof is required..."
                  value={newDocReason}
                  onChange={(e) => setNewDocReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none text-slate-850"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowRequestDocModal(false)}
                className="px-4 py-2 border border-slate-205 text-slate-600 rounded-lg text-xs font-semibold bg-white hover:bg-slate-55 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestDocument}
                disabled={submittingFlow}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Document Confirmation Modal */}
      {rejectingDocId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">Reject Document Proof</h3>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Rejection Reason</label>
              <textarea
                rows={3}
                placeholder="Explain why this document was rejected (e.g. blur image, incorrect document type)..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none text-slate-850"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setRejectingDocId(null)}
                className="px-4 py-2 border border-slate-205 text-slate-600 rounded-lg text-xs font-semibold bg-white hover:bg-slate-55 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectDocument}
                disabled={submittingFlow}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Call Modal Dialog */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">Confirm Scheduled Call Slot</h3>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Date & Time Selection</label>
              <input
                type="datetime-local"
                value={scheduleDateTime}
                onChange={(e) => setScheduleDateTime(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 px-3 outline-none text-slate-850 text-xs bg-white cursor-pointer"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 border border-slate-205 text-slate-600 rounded-lg text-xs font-semibold bg-white hover:bg-slate-55 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleCall}
                disabled={submittingFlow}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Confirm Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ComplaintDetails;