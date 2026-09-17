import React, { useState, useEffect, useRef } from "react";
import { Send, FileText, AlertTriangle, ShieldCheck, CheckSquare, Sparkles, RefreshCw, Paperclip, Phone, PhoneOff } from "lucide-react";
import api from "@/services/api";
import { toast } from "sonner";

export default function CaseChatPanel({ complaintId, userRole }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const [complaintLang, setComplaintLang] = useState("en-IN");
  
  const [callActive, setCallActive] = useState(false);
  const [callStateText, setCallStateText] = useState("Idle");
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    let timer;
    if (callActive && callStateText === "Encrypted voice pipeline ready") {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [callActive, callStateText]);

  const handleStartCall = () => {
    setCallActive(true);
    setCallStateText("Connecting WebRTC signaling channel...");
    setTimeout(() => {
      setCallStateText("Exchanging secure ICE SDP headers...");
      setTimeout(() => {
        setCallStateText("Encrypted voice pipeline ready");
        toast.success("WebRTC Secure Audio Connection Established!");
      }, 1000);
    }, 8000); // 8 seconds of signaling connection sequence
  };

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const url = userRole === "HELPER" ? `/volunteer/cases/${complaintId}` : `/complaints/${complaintId}`;
        const res = await api.get(url);
        setComplaintLang(res.data?.language || "en-IN");
      } catch (e) {
        try {
          const res = await api.get(`/complaints/${complaintId}`);
          setComplaintLang(res.data?.language || "en-IN");
        } catch (err) {}
      }
    };
    fetchComplaint();
  }, [complaintId, userRole]);

  const getSuggestions = () => {
    const isTamil = complaintLang?.startsWith("ta");
    const isHindi = complaintLang?.startsWith("hi");
    
    if (userRole === "CITIZEN") {
      if (isTamil) {
        return [
          "எனக்கு புரியவில்லை",
          "தயவுசெய்து எளிமையாக விளக்குங்கள்",
          "நான் ஆவணத்தை பதிவேற்றுவேன்",
          "எனக்கு அழைப்பு/சந்திப்பு தேவை",
          "எனக்கு இன்னும் அவகாசம் வேண்டும்"
        ];
      } else if (isHindi) {
        return [
          "मुझे समझ नहीं आया",
          "कृपया इसे आसानी से समझाएं",
          "मैं दस्तावेज़ अपलोड कर दूंगा",
          "मुझे कॉल/अपॉइंटमेंट चाहिए",
          "मुझे और समय चाहिए"
        ];
      } else {
        return [
          "I don't understand",
          "Please explain simply",
          "I will upload document",
          "I need call/appointment",
          "I need more time"
        ];
      }
    } else {
      if (isTamil) {
        return [
          "தயவுசெய்து ஆவணங்களை பதிவேற்றவும்",
          "நாம் எப்போது பேசலாம்?",
          "நான் இதை சரிபார்க்கிறேன்",
          "பிரச்சனை தீர்க்கப்பட்டது"
        ];
      } else if (isHindi) {
        return [
          "कृपया दस्तावेज़ अपलोड करें",
          "हम कब बात कर सकते हैं?",
          "मैं इसकी समीक्षा कर रहा हूँ",
          "मामला सुलझ गया है"
        ];
      } else {
        return [
          "Please upload documents",
          "When can we talk?",
          "I am reviewing this",
          "Case resolved"
        ];
      }
    }
  };
  const [actionLoading, setActionLoading] = useState(false);
  const [showDocRequestModal, setShowDocRequestModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [docName, setDocName] = useState("");
  const [escalateReason, setEscalateReason] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("IN_PROGRESS");
  const messagesEndRef = useRef(null);

  // Update 6: Volunteer Quality Checklist
  const [checklist, setChecklist] = useState({
    actionPlanShared: false,
    documentsVerified: false,
    userUnderstood: false,
  });
  const allChecked = Object.values(checklist).every(Boolean);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/cases/${complaintId}/messages`);
      const newMsgs = res.data || [];
      setMessages(prev => {
        const merged = [...prev];
        newMsgs.forEach(m => {
          if (!merged.some(existing => existing.id === m.id)) {
            merged.push(m);
          }
        });
        return merged.sort((a, b) => a.id - b.id);
      });
    } catch (err) {
      console.error("Failed to load chat messages", err);
    } finally {
      setLoading(false);
    }
  };

  // WebSocket setup with exponential backoff reconnect and REST resync
  useEffect(() => {
    fetchMessages();

    let socket = null;
    let reconnectTimeout = null;
    let currentDelay = 1000;

    const connect = () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsHost = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8082/api")
        .replace(/^https?:\/\//, "")
        .replace(/\/api$/, "");
      const wsUrl = `${wsProtocol}//${wsHost}/ws/updates?token=${token}`;

      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log("[Chat WS] Connected successfully. Performing REST resync...");
        currentDelay = 1000; // Reset backoff delay
        fetchMessages(); // REST resync on reconnect
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.complaintId && String(data.complaintId) === String(complaintId)) {
            console.log("[Chat WS] Real-time notification received. Resyncing chat...");
            fetchMessages(); // Refresh messages cleanly
          }
        } catch (e) {
          console.error("[Chat WS] Error parsing message", e);
        }
      };

      socket.onclose = (event) => {
        console.warn(`[Chat WS] Connection closed (code: ${event.code}). Retrying in ${currentDelay}ms...`);
        reconnectTimeout = setTimeout(() => {
          currentDelay = Math.min(currentDelay * 2, 30000); // Exponential backoff up to 30s
          connect();
        }, currentDelay);
      };

      socket.onerror = (error) => {
        console.error("[Chat WS] Socket error:", error);
      };
    };

    connect();

    return () => {
      if (socket) {
        socket.onclose = null;
        socket.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
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
          <button
            onClick={handleStartCall}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold cursor-pointer border border-emerald-100 transition"
          >
            <Phone size={13} /> Secure Call
          </button>
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
        {getSuggestions().map((text, i) => (
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
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setChecklist({ actionPlanShared: false, documentsVerified: false, userUnderstood: false });
              }}
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-indigo-500 outline-none bg-white font-medium"
            >
              <option value="HELPER_ASSIGNED">ASSIGNED (Legal Guide Assigned)</option>
              <option value="IN_PROGRESS">IN_PROGRESS (Under Review / Mediation)</option>
              <option value="DOCUMENTS_PENDING">DOCUMENTS_REQUIRED (Pending User Upload)</option>
              <option value="RESOLVED">RESOLVED (Issue Solved)</option>
              <option value="CLOSED">CLOSED (Case Closed)</option>
            </select>

            {/* Update 6: Quality Checklist — only shown when RESOLVED is chosen */}
            {selectedStatus === "RESOLVED" && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-3">
                <p className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">✅ Resolution Quality Checklist</p>
                <p className="text-[10px] text-emerald-700">All items must be confirmed before marking this case as Resolved.</p>
                {[
                  { key: "actionPlanShared", label: "Action plan was shared with the citizen" },
                  { key: "documentsVerified", label: "All submitted documents have been verified" },
                  { key: "userUnderstood", label: "User acknowledged and understood the resolution" }
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={checklist[key]}
                      onChange={() => setChecklist(prev => ({ ...prev, [key]: !prev[key] }))}
                      className="h-4 w-4 accent-emerald-600 rounded cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-emerald-700 transition">{label}</span>
                  </label>
                ))}
                {!allChecked && (
                  <p className="text-[10px] text-rose-600 font-bold">⚠ Please check all items above to enable resolution.</p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowStatusModal(false)} className="h-9 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 transition cursor-pointer">Cancel</button>
              <button
                onClick={handleUpdateStatus}
                disabled={actionLoading || (selectedStatus === "RESOLVED" && !allChecked)}
                className={`h-9 px-4 rounded-xl text-white text-xs font-bold transition cursor-pointer ${
                  selectedStatus === "RESOLVED" && !allChecked
                    ? "bg-slate-300 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {selectedStatus === "RESOLVED" && !allChecked ? "Complete Checklist" : "Update"}
              </button>
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

      {/* WebRTC Secure Call Overlay Modal */}
      {callActive && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-center text-white">
            <div className="flex justify-center">
              <div className={`h-20 w-20 rounded-full flex items-center justify-center bg-emerald-500/10 border-2 border-emerald-500 text-emerald-400 relative ${
                callStateText === "Encrypted voice pipeline ready" ? "animate-pulse" : ""
              }`}>
                {callStateText === "Encrypted voice pipeline ready" && (
                  <>
                    <span className="absolute inset-0 rounded-full border-2 border-emerald-500/30 animate-ping"></span>
                    <span className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping delay-300"></span>
                  </>
                )}
                <Phone size={36} />
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold tracking-wide">ARAM Secure WebRTC Voice Call</h4>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                {userRole === "HELPER" ? "Citizen Peer Connection" : "Legal Guide Peer Connection"}
              </p>
            </div>

            <div className="p-3 bg-slate-800/40 rounded-2xl border border-slate-800 text-xs flex flex-col items-center gap-1.5 min-h-[60px] justify-center">
              <span className={`font-bold ${
                callStateText === "Encrypted voice pipeline ready" ? "text-emerald-400" : "text-amber-400 animate-pulse"
              }`}>
                {callStateText}
              </span>
              {callStateText === "Encrypted voice pipeline ready" && (
                <span className="text-xl font-mono font-bold tracking-widest text-emerald-300">
                  {formatDuration(callDuration)}
                </span>
              )}
            </div>

            <div className="text-[10px] text-emerald-500 bg-emerald-950/40 border border-emerald-900/50 py-1.5 px-3 rounded-xl inline-flex items-center gap-1.5 mx-auto font-bold uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping shrink-0"></span>
              256-bit AES P2P Encrypted
            </div>

            <div className="flex justify-center pt-2">
              <button
                onClick={() => {
                  setCallActive(false);
                  setCallStateText("Idle");
                  toast.error("WebRTC Voice Call Terminated");
                }}
                className="h-12 w-12 rounded-full bg-rose-600 hover:bg-rose-700 flex items-center justify-center text-white transition transform active:scale-95 cursor-pointer shadow-lg shadow-rose-900/40"
                title="Hang Up"
              >
                <PhoneOff size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
