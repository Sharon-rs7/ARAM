import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, CheckCircle, Clock, Volume2, VolumeX } from "lucide-react";
import Button from "@/components/common/Button";
import { getMockComplaints } from "../../data/mock";
import { complaintService } from "../../services/complaintService";

const TrackComplaint = () => {
  const navigate = useNavigate();
  const [complaintId, setComplaintId] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [complaint, setComplaint] = useState(null);
  const [speaking, setSpeaking] = useState(false);

  const handleSpeakStatus = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    if (!complaint) return;
    const currentStepIndex = getStatusStepIndex(complaint.status);
    const currentStatusDesc = steps[currentStepIndex]?.desc || "";
    const text = `Your complaint reference ID is ARAM 2026 ${String(complaint.id).replace("cmp-", "")}. Its status is ${complaint.status}. ${currentStatusDesc}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!complaintId || !mobile) {
      setError("Please enter both Complaint ID and Mobile Number.");
      return;
    }

    setError("");
    setComplaint(null);
    setLoading(true);

    // Standardize user entered ID (e.g., ARAM-2026-102 or ARAM-2026-000102 -> cmp-102)
    let searchId = complaintId.trim().toLowerCase();
    if (searchId.startsWith("aram-")) {
      const parts = searchId.split("-");
      const lastPart = parts[parts.length - 1];
      // remove leading zeros
      const numStr = parseInt(lastPart, 10);
      searchId = isNaN(numStr) ? lastPart : `cmp-${numStr}`;
    }

    try {
      const hasToken = localStorage.getItem("token");
      let data = null;

      if (hasToken) {
        try {
          data = await complaintService.getComplaintById(searchId);
        } catch (apiErr) {
          console.warn("API lookup failed, falling back to mock search");
        }
      }

      if (!data) {
        // Fallback to mock complaints search
        const mockList = getMockComplaints();
        data = mockList.find(
          (c) =>
            c.id.toLowerCase() === searchId ||
            c.id.toLowerCase() === complaintId.trim().toLowerCase()
        );
      }

      if (!data) {
        throw new Error("Complaint reference not found. Please verify details.");
      }

      setComplaint(data);
    } catch (err) {
      setError(err.message || "Failed to locate complaint records.");
    } finally {
      setLoading(false);
    }
  };

  const getSlaDeadline = (priority) => {
    switch (priority?.toUpperCase()) {
      case "CRITICAL":
        return "Immediate Admin Review";
      case "HIGH":
        return "24 Hours SLA (Urgent Triage)";
      case "MEDIUM":
        return "72 Hours SLA (Standard Triage)";
      case "LOW":
      default:
        return "7 Days SLA (Standard Guidance)";
    }
  };

  const getStatusStepIndex = (status) => {
    const s = status?.toUpperCase();
    if (s === "SUBMITTED") return 0;
    if (s === "AI_ANALYSED" || s === "AI_REVIEWED") return 1;
    if (s === "ADMIN_REVIEWED" || s === "ASSIGNED" || s === "HELPER_ASSIGNED") return 3;
    if (s === "IN_PROGRESS") return 4;
    if (s === "RESOLVED") return 5;
    return 0; // Default
  };

  const steps = [
    { title: "Submitted", desc: "Complaint successfully registered in ARAM ledger." },
    { title: "AI Reviewed", desc: "AI automatically classified category and legal tags." },
    { title: "Admin Reviewed", desc: "Admin verified evidence validity." },
    { title: "Legal Guide Assigned", desc: "Trained Legal Guide assigned to case." },
    { title: "In Progress", desc: "Case under active mediation and advice guidance." },
    { title: "Resolved", desc: "Mediation complete and resolved." }
  ];

  const currentStep = complaint ? getStatusStepIndex(complaint.status) : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto w-full space-y-8">
        {/* Brand Header */}
        <div className="text-center">
          <div className="flex justify-center items-center gap-2.5 text-blue-600 font-extrabold text-2xl tracking-wide">
            <ShieldCheck size={32} />
            <span>ARAM</span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">Track Your Complaint</h2>
          <p className="mt-2 text-xs text-slate-500">
            Check your legal complaint status using your unique reference ID.
          </p>
        </div>

        {/* Form panel */}
        {!complaint ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-150 shadow-sm space-y-6">
            <form onSubmit={handleTrack} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Complaint ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ARAM-2026-000102"
                  value={complaintId}
                  onChange={(e) => setComplaintId(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Mobile Number / Email
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter registered mobile or email"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              {error && <p className="text-xs font-semibold text-red-605">{error}</p>}

              <Button
                type="submit"
                variant="primary"
                className="w-full h-12 rounded-xl text-xs font-bold"
                disabled={loading}
              >
                {loading ? "Searching ledger..." : "Track Status"}
              </Button>
            </form>

            <div className="text-center pt-2 border-t border-slate-100">
              <button
                onClick={() => navigate("/login")}
                className="text-xs text-blue-600 font-semibold hover:underline flex items-center justify-center gap-1.5 mx-auto"
              >
                <ArrowLeft size={14} /> Back to Sign In
              </button>
            </div>
          </div>
        ) : (
          /* Track Results Panel */
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reference ID</span>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900 mt-0.5">
                      ARAM-2026-{complaint.id?.replace("cmp-", "").padStart(6, "0")}
                    </h3>
                    <button
                      onClick={handleSpeakStatus}
                      className="p-1 text-indigo-600 hover:text-indigo-850 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                      title="Read Status Aloud"
                    >
                      {speaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
                    </button>
                  </div>
                </div>
                <div className="bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-blue-100">
                  {complaint.status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 uppercase text-[9px] font-bold tracking-wider">Category</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{complaint.categoryDisplayName || complaint.category}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[9px] font-bold tracking-wider">Priority / SLA</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{getSlaDeadline(complaint.priority)}</p>
                </div>
              </div>
            </div>

            {/* Timeline Steps Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status Timeline</h4>
              
              <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                {steps.map((step, idx) => {
                  const isCompleted = idx <= currentStep;
                  const isActive = idx === currentStep;

                  return (
                    <div key={step.title} className="flex gap-4 items-start relative pl-1">
                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition z-10 ${
                          isCompleted
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "bg-white border-slate-200 text-slate-400"
                        }`}
                      >
                        {isCompleted ? <CheckCircle size={12} className="fill-white text-blue-600" /> : <Clock size={10} />}
                      </div>
                      <div>
                        <h5
                          className={`text-xs font-bold ${
                            isActive
                              ? "text-blue-600"
                              : isCompleted
                              ? "text-slate-800"
                              : "text-slate-400"
                          }`}
                        >
                          {step.title}
                        </h5>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1 bg-white border-slate-200 hover:bg-slate-50"
                onClick={() => setComplaint(null)}
              >
                Track Another
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => navigate("/login")}
              >
                Sign In to View Files
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-[10px] text-slate-400 mt-8">
        © 2026 ARAM AI Portal. Secure Legal Triage Infrastructure.
      </div>
    </div>
  );
};

export default TrackComplaint;
