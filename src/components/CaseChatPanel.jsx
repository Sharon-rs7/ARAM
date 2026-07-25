import React, { useState, useEffect, useRef } from "react";
import { Send, FileText, AlertTriangle, ShieldCheck, CheckSquare, Sparkles, RefreshCw, Paperclip } from "lucide-react";
import api, { USE_MOCKS } from "../services/api";
import { toast } from "sonner";

export default function CaseChatPanel({ complaintId, userRole }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showDocRequestModal, setShowDocRequestModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [docName, setDocName] = useState("");
  const [escalateReason, setEscalateReason] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("IN_PROGRESS");
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    try {
      if (USE_MOCKS) {
        setMessages([
          { id: 1, senderRole: "SYSTEM", messageType: "SYSTEM", messageText: "Legal Guide Sharon Mary has been assigned to this case.", createdAt: new Date(Date.now() - 3600000).toISOString() },
          { id: 2, senderRole: "HELPER", messageType: "TEXT", messageText: "Hello! I am reviewing your document slip. Can you please upload a clear scanned copy of the grievance description?", createdAt: new Date(Date.now() - 1800000).toISOString() }
        ]);
        setLoading(false);
        return;
      }
      const res = await api.get(`/cases/${complaintId}/messages`);
      setMessages(res.data || []);
    } catch (err) {
      console.error("Failed to load chat messages", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [complaintId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText;
    setInputText("");

    try {
      if (USE_MOCKS) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now(),
            senderRole: userRole === "HELPER" ? "HELPER" : userRole === "ADMIN" ? "ADMIN" : "CITIZEN",
            messageType: "TEXT",
            messageText: textToSend,
            createdAt: new Date().toISOString()
          }
        ]);
        return;
      }
      const res = await api.post(`/cases/${complaintId}/messages`, {
        messageText: textToSend,
        messageType: "TEXT"
      });
      setMessages(prev => [...prev, res.data]);
    } catch (err) {
      toast.error("Failed to send message.");
    }
  };

  const handleRequestDocument = async () => {
    if (!docName.trim()) return;
    setActionLoading(true);
    try {
      if (USE_MOCKS) {
        setMessages(prev => [
          ...prev,
          { id: Date.now(), senderRole: "HELPER", messageType: "DOCUMENT_REQUEST", messageText: `Document requested: ${docName}`, createdAt: new Date().toISOString() }
        ]);
        setShowDocRequestModal(false);
        setDocName("");
        toast.success("Document request sent!");
        return;
      }
      await api.post(`/volunteer/cases/${complaintId}/request-documents`, { documentName: docName });
      toast.success("Document request sent!");
      setShowDocRequestModal(false);
      setDocName("");
      fetchMessages();
    } catch (err) {
      toast.error("Failed to request documents.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    setActionLoading(true);
    try {
      if (USE_MOCKS) {
        setMessages(prev => [
          ...prev,
          { id: Date.now(), senderRole: "SYSTEM", messageType: "STATUS_UPDATE", messageText: `Case status updated to: ${selectedStatus}`, createdAt: new Date().toISOString() }
        ]);
        setShowStatusModal(false);
        toast.success("Case status updated successfully.");
        return;
      }
      await api.put(`/volunteer/cases/${complaintId}/status`, { status: selectedStatus });
      toast.success("Case status updated successfully.");
      setShowStatusModal(false);
      fetchMessages();
    } catch (err) {
      toast.error("Failed to update status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEscalate = async () => {
    if (!escalateReason.trim()) return;
    setActionLoading(true);
    try {
      if (USE_MOCKS) {
        setMessages(prev => [
          ...prev,
          { id: Date.now(), senderRole: "SYSTEM", messageType: "SYSTEM", messageText: `Case escalated to Admin. Reason: ${escalateReason}`, createdAt: new Date().toISOString() }
        ]);
        setShowEscalateModal(false);
        setEscalateReason("");
        toast.success("Case escalated to Admin.");
        return;
      }
      await api.post(`/volunteer/cases/${complaintId}/escalate`, { reason: escalateReason });
      toast.success("Case escalated to Admin.");
      setShowEscalateModal(false);
      setEscalateReason("");
      fetchMessages();
    } catch (err) {
      toast.error("Failed to escalate case.");
    } finally {
      setActionLoading(false);
    }
  };

  const getSenderLabel = (role) => {
    if (role === "ADMIN") return "Admin";
    if (role === "HELPER" || role === "VOLUNTEER") return "Legal Guide";
    if (role === "SYSTEM") return "System Updates";
    return "Public User";
  };

  return (
    <div className="flex flex-col h-[550px] bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between bg-white px-6 py-4 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></div>
          <h3 className="font-bold text-slate-800 text-sm tracking-wide">Secure Case Communication</h3>
        </div>
        <div className="flex items-center gap-2.5">
          {userRole === "HELPER" && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowStatusModal(true)}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold cursor-pointer border border-indigo-100 transition"
              >
                <CheckSquare size={13} /> Update Status
              </button>
              <button
                onClick={() => setShowDocRequestModal(true)}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold cursor-pointer border border-blue-100 transition"
              >
                <FileText size={13} /> Request Docs
              </button>
              <button
                onClick={() => setShowEscalateModal(true)}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold cursor-pointer border border-red-100 transition"
              >
                <AlertTriangle size={13} /> Escalate
              </button>
            </div>
          )}
          <button onClick={fetchMessages} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-55 transition">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Messages Console */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs gap-2">
            <RefreshCw size={18} className="animate-spin" />
            Loading secure connection...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">
            No messages yet. Send a message below to start secure consultation.
          </div>
        ) : (
          messages.map((m) => {
            const isSystem = m.senderRole === "SYSTEM";
            const isSelf = m.senderRole === userRole || (m.senderRole === "CITIZEN" && userRole === "CITIZEN") || (m.senderRole === "HELPER" && userRole === "HELPER");

            if (isSystem) {
              return (
                <div key={m.id} className="flex justify-center my-2">
                  <div className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-center max-w-[85%] text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles size={11} className="shrink-0" />
                    <span>{m.messageText}</span>
                  </div>
                </div>
              );
            }

            return (
              <div key={m.id} className={`flex ${isSelf ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl p-4 shadow-sm border ${
                  isSelf 
                    ? "bg-indigo-600 border-indigo-700 text-white rounded-br-none" 
                    : "bg-white border-slate-150 text-slate-800 rounded-bl-none"
                }`}>
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wide ${
                      isSelf ? "text-indigo-200" : "text-slate-400"
                    }`}>
                      {getSenderLabel(m.senderRole)}
                    </span>
                    <span className={`text-[9px] ${
                      isSelf ? "text-indigo-300" : "text-slate-400 font-medium"
                    }`}>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed font-medium select-text whitespace-pre-wrap">{m.messageText}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Chips */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto shrink-0 select-none">
        {(userRole === "CITIZEN" 
          ? ["I will upload document", "I need help", "Please call later", "I don't understand"]
          : ["Please upload documents", "When can we talk?", "I am reviewing this", "Case resolved"]
        ).map((text, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setInputText(text)}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-500 rounded-full text-[10px] font-bold text-slate-600 hover:text-indigo-700 transition shrink-0 cursor-pointer shadow-sm active:scale-95 min-h-[32px]"
          >
            {text}
          </button>
        ))}
      </div>

      {/* Input controls */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex items-center gap-3 shrink-0">
        <button type="button" className="p-2 text-slate-400 hover:text-slate-600 transition rounded-xl hover:bg-slate-50 cursor-pointer">
          <Paperclip size={18} />
        </button>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Write your secure message..."
          className="flex-1 h-10 border border-slate-200 rounded-xl px-4 text-xs outline-none focus:border-indigo-500 font-medium bg-slate-50/50"
        />
        <button
          type="submit"
          className="flex items-center justify-center h-10 w-10 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition cursor-pointer shrink-0"
        >
          <Send size={16} />
        </button>
      </form>

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm uppercase">Update Case Status</h3>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-indigo-500 outline-none bg-white font-medium"
            >
              <option value="HELPER_ASSIGNED">ASSIGNED (Legal Guide Assigned)</option>
              <option value="IN_PROGRESS">IN_PROGRESS (Under Review / Mediation)</option>
              <option value="DOCUMENTS_PENDING">DOCUMENTS_REQUIRED (Pending User Upload)</option>
              <option value="RESOLVED">RESOLVED (Issue Solved)</option>
              <option value="CLOSED">CLOSED (Case Closed)</option>
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowStatusModal(false)} className="h-9 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 transition cursor-pointer">Cancel</button>
              <button onClick={handleUpdateStatus} disabled={actionLoading} className="h-9 px-4 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold transition cursor-pointer">Update</button>
            </div>
          </div>
        </div>
      )}

      {/* Document Request Modal */}
      {showDocRequestModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm uppercase">Request Additional Documents</h3>
            <input
              type="text"
              placeholder="e.g. Aadhaar Card / ID Slip / Copy of Contract"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              className="h-10 w-full border border-slate-200 rounded-xl px-3 text-xs outline-none focus:border-indigo-500"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDocRequestModal(false)} className="h-9 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 transition cursor-pointer">Cancel</button>
              <button onClick={handleRequestDocument} disabled={actionLoading} className="h-9 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold transition cursor-pointer">Send Request</button>
            </div>
          </div>
        </div>
      )}

      {/* Escalate Modal */}
      {showEscalateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm uppercase">Escalate to Administrator</h3>
            <textarea
              placeholder="Enter reason for escalation..."
              value={escalateReason}
              onChange={(e) => setEscalateReason(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-indigo-500 h-24"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowEscalateModal(false)} className="h-9 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 transition cursor-pointer">Cancel</button>
              <button onClick={handleEscalate} disabled={actionLoading} className="h-9 px-4 rounded-xl bg-red-600 text-white hover:bg-red-700 text-xs font-bold transition cursor-pointer">Escalate Case</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
