import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/common/DashboardLayout";
import { 
  Send, Mic, Sparkles, Scale, BookOpen, AlertCircle, 
  RotateCcw, Shield, Download, ArrowRight, Loader2, Copy, Check, FileCheck, ExternalLink
} from "lucide-react";
import { chatbotService } from "@/services/chatbotService";
import { complaintService } from "@/services/complaintService";
import { speechService } from "@/services/speechService";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";

// Simple Markdown-to-JSX Formatter for Gemini-like chat bubbles
const FormattedMessageText = ({ text }) => {
  if (!text) return null;

  const lines = text.split("\n");
  return (
    <div className="space-y-2 text-xs sm:text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Headers (### or ##)
        if (trimmed.startsWith("###") || trimmed.startsWith("##")) {
          const headerText = trimmed.replace(/^#+\s*/, "");
          return (
            <h4 key={idx} className="font-extrabold text-[#163D32] text-xs sm:text-sm pt-2 pb-0.5 border-b border-[#E6E1D8]/60 flex items-center gap-1.5">
              {headerText}
            </h4>
          );
        }

        // Bullet Points (• or - or *)
        if (trimmed.startsWith("•") || trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const bulletContent = trimmed.replace(/^[•\-\*]\s*/, "");
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 py-0.5">
              <span className="text-[#1F5948] font-black text-sm select-none">•</span>
              <span className="flex-1" dangerouslySetInnerHTML={{ __html: renderInlineFormatting(bulletContent) }} />
            </div>
          );
        }

        // Numbered List (1. 2. etc)
        const numMatch = trimmed.match(/^(\d+)\.\s*(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 py-0.5">
              <span className="text-[#163D32] font-bold text-xs bg-[#DCEBDD] w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-2xs select-none">
                {numMatch[1]}
              </span>
              <span className="flex-1 self-center" dangerouslySetInnerHTML={{ __html: renderInlineFormatting(numMatch[2]) }} />
            </div>
          );
        }

        // Normal text paragraph
        return (
          <p key={idx} dangerouslySetInnerHTML={{ __html: renderInlineFormatting(line) }} />
        );
      })}
    </div>
  );
};

// Safe inline formatting for bold text (**text**)
const renderInlineFormatting = (str) => {
  if (!str) return "";
  let escaped = str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[#163D32]">$1</strong>');
  return escaped;
};

const Chatbot = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();

  const [messages, setMessages] = useState([
    {
      id: "welcome-msg",
      sender: "ai",
      text: "Vanakkam! I am your ARAM AI Legal Assistant. 👋\n\nYou can describe any legal problem, dispute, or question in Tamil, Tanglish, English, or Hindi to get grounded statutory sections, document checklists, and authorized guide assistance.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  
  const [conversationId, setConversationId] = useState(() => "chat_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now());
  
  // Store accumulated case state for seamless in-chat submission
  const [activeCaseContext, setActiveCaseContext] = useState({
    title: "",
    description: "",
    category: "GENERAL_LEGAL_AID",
    district: "Coimbatore",
    priority: "MEDIUM"
  });

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Handle URL query parameter
  useEffect(() => {
    const q = searchParams.get("q");
    if (q && q.trim()) {
      setInputQuery(q);
      handleSend(q);
    }
  }, [searchParams]);

  // Copy message text to clipboard
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Legal guidance copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Direct In-Chat Complaint Submission
  const handleDirectSubmitComplaint = async (assessmentData = null) => {
    setSubmittingComplaint(true);
    const toastId = toast.loading("Registering complaint in ARAM Legal Registry...");

    try {
      const caseData = assessmentData || activeCaseContext;
      const finalTitle = caseData.title || caseData.headline || (caseData.description ? caseData.description.slice(0, 50) : "Legal Aid Grievance");
      const finalDesc = caseData.description || caseData.problemUnderstanding || caseData.understanding || "Legal Aid Grievance submitted via ARAM Chatbot.";
      const finalCat = caseData.category || "GENERAL_LEGAL_AID";
      const finalPriority = caseData.priority || caseData.severity || "MEDIUM";

      const payload = {
        title: finalTitle,
        description: finalDesc,
        category: finalCat,
        location: caseData.district || "Coimbatore",
        district: caseData.district || "Coimbatore",
        priority: finalPriority,
        language: (language || "en").toUpperCase(),
        identityVisibility: "VISIBLE",
        inputMode: "CHATBOT_DIRECT",
        disclaimerAccepted: true
      };

      const res = await complaintService.createComplaint(payload);
      toast.dismiss(toastId);
      toast.success("Complaint successfully registered!");

      // Add success message bubble into chat stream
      const successMsg = {
        id: "complaint-success-" + Date.now(),
        sender: "ai",
        isComplaintSuccess: true,
        complaintId: res.id,
        text: `✅ **Grievance Registered Successfully in ARAM Registry!**\n\n📋 **Complaint Reference ID**: #${res.id}\n📁 **Category**: ${res.category || finalCat}\n⚡ **Priority Level**: ${res.priority || finalPriority}\n📍 **Assigned Jurisdiction**: ${res.district || "Coimbatore"}\n\nOur legal aid volunteer network and DLSA grievance cell have been notified. You can track real-time resolution progress anytime under **Track Complaints**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, successMsg]);
    } catch (err) {
      toast.dismiss(toastId);
      const errMsg = err.response?.data?.message || err.message || "Failed to submit complaint.";
      toast.error(`Submission failed: ${errMsg}`);
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const handleSend = async (queryToSend) => {
    const text = (queryToSend || inputQuery).trim();
    if (!text || loading) return;

    // Check if user explicitly typed a complaint submission trigger
    const lower = text.toLowerCase();
    if (
      lower === "submit complaint" || 
      lower === "file complaint" || 
      lower === "register complaint" || 
      lower === "complaint submit pannu" || 
      lower === "complaint register pannu" ||
      lower === "complaint submit panu" ||
      lower === "ithai complaint ah register pannu"
    ) {
      const userMsg = {
        id: "usr-" + Date.now(),
        sender: "user",
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, userMsg]);
      setInputQuery("");
      await handleDirectSubmitComplaint();
      return;
    }

    const userMsg = {
      id: "usr-" + Date.now(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setLoading(true);

    try {
      const response = await chatbotService.askLegalAI({
        message: text,
        language: language || "en",
        conversationId: conversationId
      });
      const isConversational = response?.is_conversational || response?.is_greeting || response?.category === "CONVERSATIONAL" || response?.responseType === "LANGUAGE_PREFERENCE";
      
      const displayText = response?.reply || response?.answer || response?.summary || "I am analyzing your legal query.";

      // Update active case context in memory for seamless in-chat filing
      if (!isConversational && response?.category) {
        setActiveCaseContext({
          title: text.length > 50 ? text.slice(0, 50) + "..." : text,
          description: text,
          category: response.category,
          district: "Coimbatore",
          priority: response.severity || response.priority || "MEDIUM",
          documents: response.documents || response.documents_required || [],
          authority: response.recommendedAuthority || (response.where_to_complain && response.where_to_complain[0]) || ""
        });
      }

      const aiMsg = {
        id: "ai-" + Date.now(),
        sender: "ai",
        text: displayText,
        data: isConversational ? null : response,
        options: response?.options || [],
        canSubmit: !isConversational && Boolean(response?.category && response?.category !== "GENERAL_LEGAL_AID"),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("AI triage query error:", err);
      toast.error("Failed to fetch legal AI advice. Please try again.");
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          sender: "ai",
          text: "I encountered an issue retrieving legal provisions. Please try asking your question again in simple words.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = async () => {
    if (isRecording) {
      if (mediaRecorder) mediaRecorder.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        toast.info("Transcribing voice input...");
        try {
          const res = await speechService.transcribeAudio(audioBlob, language || "ta-IN");
          if (res?.text) {
            setInputQuery(res.text);
            handleSend(res.text);
          }
        } catch (err) {
          toast.error("Voice transcription failed.");
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      toast.info("Listening... Speak your legal problem.");
    } catch (err) {
      toast.error("Microphone access unavailable.");
    }
  };

  return (
    <DashboardLayout role="citizen">
      <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-7rem)]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 rounded-3xl bg-[#FFFDF8] border border-[#E6E1D8] shadow-sm mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DCEBDD] text-[#163D32] flex items-center justify-center font-bold shadow-xs">
              <Scale size={20} />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-[#163D32]">ARAM Legal AI Assistant</h1>
              <p className="text-[11px] text-[#65736D] font-medium">Conversational Legal Aid • Grounded Indian Law • Multilingual (Tamil, Tanglish, Hindi, English)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setMessages([messages[0]]);
                setConversationId("chat_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now());
                toast.info("Conversation reset. Fresh session started.");
              }}
              className="p-2 text-[#65736D] hover:text-[#18332B] hover:bg-[#F7F1E6] rounded-xl transition cursor-pointer"
              title="Reset Conversation"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={() => navigate("/citizen/submit-complaint")}
              className="px-4 py-2 bg-[#163D32] hover:bg-[#1F5948] text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer flex items-center gap-1.5"
            >
              Detailed Grievance Form <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Chat Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 rounded-3xl bg-[#FFFDF8] border border-[#E6E1D8] shadow-sm mb-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-2xl rounded-2xl p-4 sm:p-5 shadow-xs transition-all ${
                  msg.sender === "user"
                    ? "bg-[#163D32] text-white rounded-br-none font-medium text-xs sm:text-sm"
                    : msg.isComplaintSuccess
                    ? "bg-[#DCEBDD]/60 border border-[#163D32]/30 text-[#163D32] rounded-bl-none"
                    : "bg-[#F7F1E6]/70 border border-[#E6E1D8] text-[#18332B] rounded-bl-none"
                }`}
              >
                {/* Formatted Markdown Body */}
                <FormattedMessageText text={msg.text} />
                
                {/* Direct Action Link for Complaint Success */}
                {msg.isComplaintSuccess && msg.complaintId && (
                  <div className="mt-3.5 pt-3 border-t border-[#163D32]/20 flex flex-wrap gap-2">
                    <button
                      onClick={() => navigate(`/citizen/track-complaints`)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#163D32] text-white text-xs font-bold shadow-xs hover:bg-[#1F5948] transition cursor-pointer flex items-center gap-1.5"
                    >
                      <FileCheck size={14} /> Track Complaint #{msg.complaintId}
                    </button>
                  </div>
                )}

                <span className={`block text-[9px] mt-2 text-right font-mono ${msg.sender === "user" ? "text-white/60" : "text-[#8B9690]"}`}>
                  {msg.timestamp}
                </span>
              </div>

              {/* In-Chat Quick Action Buttons for AI Legal Advice */}
              {msg.sender === "ai" && !msg.isComplaintSuccess && (
                <div className="flex flex-wrap items-center gap-2 mt-2 ml-1">
                  {msg.canSubmit && (
                    <button
                      onClick={() => handleDirectSubmitComplaint(msg.data)}
                      disabled={submittingComplaint}
                      className="px-3 py-1.5 rounded-xl bg-[#163D32] text-white hover:bg-[#1F5948] text-xs font-bold transition shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <FileCheck size={13} />
                      {submittingComplaint ? "Registering..." : "📝 Submit Formal Complaint with this Assessment"}
                    </button>
                  )}

                  <button
                    onClick={() => handleCopy(msg.text, msg.id)}
                    className="px-2.5 py-1.5 rounded-xl bg-[#FFFDF8] border border-[#E6E1D8] text-[#65736D] hover:text-[#18332B] hover:bg-[#F7F1E6] text-xs font-semibold transition shadow-2xs flex items-center gap-1 cursor-pointer"
                    title="Copy Advice"
                  >
                    {copiedId === msg.id ? <Check size={13} className="text-[#1F5948]" /> : <Copy size={13} />}
                    {copiedId === msg.id ? "Copied" : "Copy"}
                  </button>
                </div>
              )}

              {/* Contextual Dynamic Suggestion Chips from AI response only */}
              {msg.options && msg.options.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2.5 max-w-2xl">
                  {msg.options.map((opt, optIdx) => (
                    <button
                      key={optIdx}
                      onClick={() => {
                        setInputQuery(opt);
                        handleSend(opt);
                      }}
                      className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#FFFDF8] border border-[#163D32]/30 text-[#163D32] hover:bg-[#163D32] hover:text-white transition cursor-pointer shadow-2xs flex items-center gap-1"
                    >
                      <Sparkles size={11} className="text-[#163D32] group-hover:text-white" />
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-[#DCEBDD]/40 border border-[#DCEBDD] text-xs font-bold text-[#163D32] animate-pulse">
              <Loader2 className="animate-spin text-[#163D32]" size={16} />
              <span>ARAM AI is formulating conversational legal guidance...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-2.5 sm:p-3 rounded-3xl bg-[#FFFDF8] border border-[#E6E1D8] shadow-sm flex items-center gap-2">

          <button
            onClick={handleVoiceInput}
            className={`p-3 rounded-2xl transition cursor-pointer shrink-0 ${
              isRecording 
                ? "bg-[#C94B4B] text-white animate-pulse shadow-md" 
                : "bg-[#DCEBDD] text-[#163D32] hover:bg-[#c6dcc7] border border-[#c5ddc6]"
            }`}
            title="Voice Input (Tamil, English, Hindi)"
          >
            <Mic size={17} />
          </button>

          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your question or legal problem in Tamil, Tanglish, English, or Hindi..."
            className="flex-1 bg-[#F7F1E6]/40 border border-[#E6E1D8] focus:border-[#1F5948] focus:bg-[#FFFDF8] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#18332B] placeholder-[#8B9690] outline-none transition"
          />

          <button
            onClick={() => handleSend()}
            disabled={!inputQuery.trim() || loading}
            className="px-4 py-2.5 rounded-2xl bg-[#163D32] hover:bg-[#1F5948] disabled:opacity-50 text-white font-bold text-xs shadow-sm transition cursor-pointer flex items-center justify-center shrink-0 min-h-[40px]"
          >
            <Send size={15} />
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Chatbot;
