import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  ArrowLeft, MessageSquare, ClipboardList, FileText, Calendar, 
  Sparkles, CheckCircle2, User, Globe, AlertTriangle, Loader2,
  Trash2, Upload, MessageCircle, Info, Clock, Plus
} from "lucide-react";
import { volunteerService } from "../../services/volunteerService";
import { complaintService } from "../../services/complaintService";
import { chatbotService } from "../../services/chatbotService";
import { toast } from "sonner";
import CaseChatPanel from "@/components/CaseChatPanel";

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
  const [updating, setUpdating] = useState(false);
  
  // AI assistant helpers
  const [aiAssistantResult, setAiAssistantResult] = useState("");
  const [aiAssistantLoading, setAiAssistantLoading] = useState(false);

  // Document requests state
  const [docRequests, setDocRequests] = useState([]);
  const [newDocName, setNewDocName] = useState("");
  const [showRequestDocModal, setShowRequestDocModal] = useState(false);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true);
        const data = await volunteerService.getCaseById(id);
        setComplaint(data);
        setStatus(data.status || "IN_PROGRESS");
        setNotes(data.legalOpinion || "");
        setResolutionSummary(data.resolutionSummary || "");

        const requests = await complaintService.getDocumentRequests(id);
        setDocRequests(requests || []);
      } catch (err) {
        toast.error("Failed to load case workspace details.");
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [id]);

  // Update Case status
  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      await volunteerService.updateCaseStatus(id, {
        status: newStatus,
        notes: notes
      });
      setStatus(newStatus);
      toast.success(`Case status updated to ${newStatus.replace("_", " ")}`);
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
        reason: "Required for boundary evidence verification."
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

  // Mark Case as Resolved
  const handleProposeResolution = async () => {
    const summary = prompt("Please enter the resolution summary details:", resolutionSummary);
    if (summary === null) return;
    if (!summary.trim()) {
      toast.error("Resolution summary cannot be empty.");
      return;
    }
    
    try {
      setUpdating(true);
      await volunteerService.markResolved(id, summary.trim());
      setResolutionSummary(summary);
      setStatus("RESOLVED");
      toast.success("Resolution summary saved. Case marked resolved!");
    } catch (err) {
      toast.error("Failed to resolve case.");
    } finally {
      setUpdating(false);
    }
  };

  // Trigger ARAM AI Assistant prompts
  const triggerAiAssistant = async (promptType) => {
    setAiAssistantLoading(true);
    setAiAssistantResult("");
    
    let promptText = "";
    if (promptType === "summarize") {
      promptText = `Please summarize this complaint case in 2 concise sentences: Title: ${complaint.title}. Description: ${complaint.description}.`;
    } else if (promptType === "missing") {
      promptText = `Identify missing information or evidence documents for this legal aid case: Title: ${complaint.title}. Description: ${complaint.description}.`;
    } else if (promptType === "questions") {
      promptText = `Suggest 3 relevant clarifying questions I should ask the citizen for this legal case: Title: ${complaint.title}. Description: ${complaint.description}.`;
    } else {
      promptText = `Provide 3 recommended next action steps for the guide handling this complaint case: Title: ${complaint.title}. Description: ${complaint.description}.`;
    }

    try {
      const response = await chatbotService.askChatbot({
        message: promptText,
        chatHistory: []
      });
      setAiAssistantResult(response.reply || response.response || "No recommendations generated.");
    } catch (err) {
      toast.error("AI Case Assistant is currently offline.");
    } finally {
      setAiAssistantLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center text-slate-400">
          <Loader2 className="animate-spin mr-2" size={20} />
          Loading Guide Workspace...
        </div>
      </DashboardLayout>
    );
  }

  if (!complaint) {
    return (
      <DashboardLayout>
        <div className="text-center py-16 text-slate-500">Case details not found.</div>
      </DashboardLayout>
    );
  }

  const priority = complaint.priority || "HIGH";

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-6 max-w-5xl mx-auto">
        
        {/* Top Back Link */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 pb-4">
          <button
            onClick={() => navigate("/volunteer/assigned-cases")}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <ArrowLeft size={16} /> My Cases
          </button>
        </div>

        {/* Workspace Title Header */}
        <div className="glass-panel p-6 relative overflow-hidden">
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-slate-450">
                  ARAM-{complaint.id}
                </span>
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-[10px] font-extrabold text-red-500 tracking-wider uppercase">
                  {priority} Priority
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                {complaint.title}
              </h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-500 font-semibold mt-2">
                <span>Citizen: <strong>{complaint.citizenName || "Sharon"}</strong></span>
                <span>•</span>
                <span>Language: <strong>{complaint.language === "ta-IN" ? "Tamil" : "English"}</strong></span>
                <span>•</span>
                <span>Assigned by Admin</span>
              </div>
            </div>
            
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              status === "RESOLVED" ? "bg-emerald-500/10 text-emerald-600" : "bg-indigo-500/10 text-indigo-600"
            }`}>
              ● {status.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Tab Selection Row */}
        <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200/50 dark:border-slate-850/40 w-fit">
          {["overview", "evidence", "timeline", "chat"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 text-xs font-bold rounded-lg capitalize transition cursor-pointer ${
                activeTab === tab
                  ? "bg-white dark:bg-slate-900 text-indigo-650 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab}
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
                <div className="glass-panel p-6 space-y-3">
                  <h3 className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest">
                    Original Complaint
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-350 bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-slate-850/40 font-medium">
                    {complaint.description}
                  </p>
                </div>

                {/* AI Case Summary */}
                <div className="glass-panel p-6 space-y-3">
                  <h3 className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest">
                    AI Case Summary
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                    Citizen Sharon indicates encroached land wall boundary issue in Coimbatore. Primary category resolved to Property Dispute with high priority threats elements.
                  </p>
                </div>

                {/* Detected Concerns */}
                <div className="glass-panel p-6 space-y-3">
                  <h3 className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest">
                    Detected Concerns
                  </h3>
                  <ul className="text-xs text-slate-650 dark:text-slate-350 space-y-1.5 font-medium pl-1">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                      Property boundary dispute and encroachment
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                      Neighbor intimidation/threat warning
                    </li>
                  </ul>
                </div>

                {/* Admin Note */}
                <div className="glass-panel p-6 space-y-3 bg-amber-500/5 border-l-4 border-amber-500">
                  <h3 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                    Admin Note
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-bold">
                    Please verify ownership documents and land boundary survey receipt first.
                  </p>
                </div>

                {/* ARAM AI Assistant Panel */}
                <div className="glass-panel p-6 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/40 pb-3">
                    <Sparkles size={16} className="text-indigo-500" />
                    <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-widest">
                      ARAM AI Assistant
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      onClick={() => triggerAiAssistant("summarize")}
                      className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 rounded-xl text-[10px] font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      Summarize Case
                    </button>
                    <button
                      onClick={() => triggerAiAssistant("missing")}
                      className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 rounded-xl text-[10px] font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      Find Missing Info
                    </button>
                    <button
                      onClick={() => triggerAiAssistant("questions")}
                      className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 rounded-xl text-[10px] font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      Suggest Questions
                    </button>
                    <button
                      onClick={() => triggerAiAssistant("steps")}
                      className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 rounded-xl text-[10px] font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      Suggest Steps
                    </button>
                  </div>

                  {aiAssistantLoading && (
                    <div className="text-center py-4 text-xs text-slate-400">AI is analyzing...</div>
                  )}

                  {aiAssistantResult && (
                    <div className="p-4 bg-indigo-50/20 dark:bg-indigo-950/10 rounded-xl border border-indigo-100/50 dark:border-indigo-950/20 text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-semibold whitespace-pre-line animate-in fade-in duration-200">
                      {aiAssistantResult}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Evidence tab content */}
            {activeTab === "evidence" && (
              <div className="glass-panel p-6 space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <h3 className="text-xs font-extrabold text-slate-450 uppercase tracking-widest">
                    Evidence Files
                  </h3>
                  <button
                    onClick={() => setShowRequestDocModal(true)}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} /> Request Document
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-indigo-500" />
                      <div>
                        <h4 className="font-bold text-xs text-slate-850">land_deed_receipt.pdf</h4>
                        <span className="text-[10px] text-slate-400">Uploaded by citizen • 1.2 MB</span>
                      </div>
                    </div>
                  </div>

                  {docRequests.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-800">{req.documentName}</span>
                        <p className="text-[10px] text-slate-450 mt-0.5">{req.reason}</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-bold uppercase tracking-wider text-[9px]">
                        {req.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline tab content */}
            {activeTab === "timeline" && (
              <div className="glass-panel p-6 space-y-6">
                <h3 className="text-xs font-extrabold text-slate-450 uppercase tracking-widest border-b pb-4">
                  Case Timeline
                </h3>

                <div className="space-y-6 pl-2">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center shrink-0">
                      <span className="h-3.5 w-3.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10" />
                      <span className="w-0.5 h-12 bg-slate-100 dark:bg-slate-800/40 mt-1" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Complaint Submitted</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Aug 6 • 09:00 AM</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex flex-col items-center shrink-0">
                      <span className="h-3.5 w-3.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10" />
                      <span className="w-0.5 h-12 bg-slate-100 dark:bg-slate-800/40 mt-1" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">AI Triage Completed</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Aug 6 • 09:02 AM</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex flex-col items-center shrink-0">
                      <span className="h-3.5 w-3.5 rounded-full bg-indigo-500 ring-4 ring-indigo-500/10" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Guide Assigned</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Aug 6 • 11:20 AM</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Chat Tab content */}
            {activeTab === "chat" && (
              <div className="glass-panel p-6">
                <CaseChatPanel complaintId={complaint.id} userRole="HELPER" />
              </div>
            )}

          </div>

          {/* Right Area Workspace Panels (35% width equivalent) */}
          <div className="space-y-6">
            
            {/* Case Status Dropdown card */}
            <div className="glass-panel p-6 space-y-4">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">
                Case Status
              </span>
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">
                  ● {status.replace("_", " ")}
                </span>
                
                <select
                  value={status}
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                  disabled={updating}
                  className="h-9 px-2 rounded-lg border border-slate-250 dark:border-slate-850 text-xs font-bold text-slate-750 bg-white"
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="glass-panel p-6 space-y-4">
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-widest border-b pb-3">
                Quick Actions
              </h3>
              
              <div className="space-y-2.5">
                <button
                  onClick={() => setActiveTab("chat")}
                  className="w-full text-center py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Message Citizen
                </button>
                <button
                  onClick={() => {
                    setActiveTab("evidence");
                    setShowRequestDocModal(true);
                  }}
                  className="w-full text-center py-2.5 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-850 hover:bg-slate-50 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Request Evidence
                </button>
                <button
                  onClick={() => {
                    const updateText = prompt("Enter Case Update notes:");
                    if (updateText) {
                      setNotes(prev => prev + "\n" + updateText);
                      toast.success("Case notes update appended!");
                    }
                  }}
                  className="w-full text-center py-2.5 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-850 hover:bg-slate-50 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Add Case Update
                </button>
                <button
                  onClick={() => {
                    toast.info("Escalation request submitted to DLSA team.");
                  }}
                  className="w-full text-center py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-650 rounded-xl text-xs font-bold transition border border-rose-200 cursor-pointer"
                >
                  Escalate Case
                </button>
              </div>
            </div>

            {/* Propose Resolution Panel */}
            <div className="glass-panel p-6 space-y-4">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">
                Resolution
              </span>
              <button
                onClick={handleProposeResolution}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer text-center"
              >
                Propose Resolution
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Request document modal popup */}
      {showRequestDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 p-6 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Request Evidence Document</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                placeholder="e.g. Land Registry Slip"
                className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-indigo-500 bg-white"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowRequestDocModal(false)}
                className="px-4 py-2 border border-slate-250 rounded-xl text-xs font-bold text-slate-500"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestDocument}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
              >
                Request
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default ComplaintDetails;