import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  CheckCircle,
  Globe,
  AlertCircle
} from "lucide-react";
import { complaintService } from "../../services/complaintService";
import { toast } from "sonner";

const AIAnalysis = () => {
  const navigate = useNavigate();
  const { complaintId } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!complaintId) {
        // Fallback default
        setLoading(false);
        return;
      }
      try {
        const data = await complaintService.getComplaintById(Number(complaintId) || complaintId);
        setComplaint(data);
      } catch (err) {
        toast.error("Failed to load AI analysis details.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [complaintId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center text-slate-400">
          Loading AI analysis results...
        </div>
      </DashboardLayout>
    );
  }

  // Map backend values to friendly display
  const summary = complaint?.description || "You reported a property dispute involving reported threats and physical violence.";
  const priority = complaint?.priority || "HIGH";
  const language = complaint?.language === "ta-IN" ? "Tamil" : complaint?.language === "hi-IN" ? "Hindi" : "English";
  
  // Custom concerns tags list
  const concerns = [];
  if (complaint?.category === "PROPERTY_CIVIL_DISPUTE") concerns.push("Property Dispute");
  else if (complaint?.category === "LABOUR_DISPUTE") concerns.push("Labour Dispute");
  else if (complaint?.category === "CYBER_CRIME") concerns.push("Cyber Fraud");
  else concerns.push("General Legal Aid");
  
  if (priority === "HIGH") {
    concerns.push("Threat / Intimidation");
    concerns.push("Physical Assault");
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-xl mx-auto pb-6">
        
        {/* Navigation back */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition cursor-pointer"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Sparkles className="text-indigo-500" size={22} />
            AI Complaint Analysis
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            ✓ We understood your complaint
          </p>
        </div>

        {/* Summary Card */}
        <div className="glass-panel p-6 space-y-3">
          <h3 className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest">
            Summary
          </h3>
          <p className="text-xs leading-relaxed text-slate-650 dark:text-slate-350 font-medium bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100/50 dark:border-slate-850/40">
            {summary}
          </p>
        </div>

        {/* Detected Concerns */}
        <div className="glass-panel p-6 space-y-3">
          <h3 className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest">
            Detected Concerns
          </h3>
          <div className="flex flex-wrap gap-2">
            {concerns.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-350 text-[10px] font-bold"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Priority and Language */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-panel p-5">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Priority</span>
            <div className="flex items-center gap-2 mt-2">
              <span className={`h-2.5 w-2.5 rounded-full ${priority === "HIGH" ? "bg-red-500" : "bg-amber-500"}`} />
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{priority}</span>
            </div>
          </div>
          
          <div className="glass-panel p-5">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Language</span>
            <div className="flex items-center gap-2 mt-2">
              <Globe size={14} className="text-slate-450" />
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{language}</span>
            </div>
          </div>
        </div>

        {/* What Happens Next */}
        <div className="p-5 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/40 rounded-2xl text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
          <strong className="text-slate-700 dark:text-slate-350 block mb-1">What happens next?</strong>
          The ARAM Admin team will review your complaint and assign a suitable Legal Guide. You will receive real-time messages and updates in your case timeline.
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
          <button
            type="button"
            onClick={() => navigate("/citizen/my-complaints")}
            className="rounded-xl border border-slate-200 dark:border-slate-800 px-6 py-3 text-xs font-bold text-slate-650 hover:bg-slate-50 transition cursor-pointer"
          >
            My Complaints
          </button>
          <button
            type="button"
            onClick={() => navigate("/citizen/dashboard")}
            className="rounded-xl bg-indigo-650 dark:bg-indigo-500 text-white px-6 py-3 text-xs font-bold hover:bg-indigo-700 transition cursor-pointer shadow-md"
          >
            Go Home
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AIAnalysis;