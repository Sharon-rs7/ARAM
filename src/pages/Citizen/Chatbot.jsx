import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/common/DashboardLayout";
import { 
  Send, Mic, Sparkles, Scale, BookOpen, AlertCircle, 
  RotateCcw, Shield, Download, ArrowRight, Loader2, Copy, Check, FileCheck, ExternalLink, Globe
} from "lucide-react";
import { chatbotService } from "@/services/chatbotService";
import { complaintService } from "@/services/complaintService";
import { speechService } from "@/services/speechService";
import { useAuth } from "@/context/AuthContext";
import { useLanguage, availableLanguages } from "@/context/LanguageContext";
import { useNotifications } from "@/context/NotificationContext";
import { toast } from "sonner";
import { ARAMAvatar } from "@/components/common/brand/ARAMAvatar";
import { ARAMBadge } from "@/components/common/brand/ARAMBadge";
import { ARAMQuickActions } from "@/components/citizen/ARAMQuickActions";
import ReadAloudButton from "@/components/common/voice/ReadAloudButton";

// Safe inline formatting for bold text (**text**)
const renderInlineFormatting = (str, isUser = false) => {
  if (!str) return "";
  let escaped = str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  
  const strongColor = isUser ? "text-[#E8C978]" : "text-[#163D32]";
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, `<strong class="font-bold ${strongColor}">$1</strong>`);
  return escaped;
};

// Simple Markdown-to-JSX Formatter for ARAM chat bubbles
const FormattedMessageText = ({ text, isUser = false }) => {
  if (!text) return null;

  const lines = text.split("\n");
  return (
    <div className={`space-y-2 text-xs sm:text-sm leading-relaxed ${isUser ? "text-white font-medium" : "text-[#18332B]"}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Headers (### or ##)
        if (trimmed.startsWith("###") || trimmed.startsWith("##")) {
          const headerText = trimmed.replace(/^#+\s*/, "");
          return (
            <h4 key={idx} className={`font-extrabold text-xs sm:text-sm pt-2 pb-0.5 border-b flex items-center gap-1.5 ${
              isUser ? "text-[#E8C978] border-white/20" : "text-[#163D32] border-[#E6E1D8]/60"
            }`}>
              {headerText}
            </h4>
          );
        }

        // Bullet Points (• or - or *)
        if (trimmed.startsWith("•") || trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const bulletContent = trimmed.replace(/^[•\-\*]\s*/, "");
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 py-0.5">
              <span className={`font-black text-sm select-none ${isUser ? "text-[#E8C978]" : "text-[#1F5948]"}`}>•</span>
              <span className="flex-1" dangerouslySetInnerHTML={{ __html: renderInlineFormatting(bulletContent, isUser) }} />
            </div>
          );
        }

        // Numbered List (1. 2. etc)
        const numMatch = trimmed.match(/^(\d+)\.\s*(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 py-0.5">
              <span className={`font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-2xs select-none ${
                isUser ? "bg-[#E8C978] text-[#163D32]" : "bg-[#E8C978]/40 text-[#163D32]"
              }`}>
                {numMatch[1]}
              </span>
              <span className="flex-1 self-center" dangerouslySetInnerHTML={{ __html: renderInlineFormatting(numMatch[2], isUser) }} />
            </div>
          );
        }

        // Normal text paragraph
        return (
          <p key={idx} className={isUser ? "text-white" : "text-[#18332B]"} dangerouslySetInnerHTML={{ __html: renderInlineFormatting(line, isUser) }} />
        );
      })}
    </div>
  );
};

const Chatbot = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const { fetchNotifications } = useNotifications();

  const [messages, setMessages] = useState([
    {
      id: "welcome-msg",
      sender: "ai",
      text: "Vanakkam! I am your ARAM AI Legal Companion. 👋\n\nTell me what happened, and I will help you understand relevant statutory provisions, document requirements, and connect you with verified legal aid.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);
  const recognitionRef = useRef(null);
  const [copiedId, setCopiedId] = useState(null);
  
  // Real citizen cases for context-aware quick actions
  const [userCases, setUserCases] = useState([]);
  const [loadingCases, setLoadingCases] = useState(false);

  const [conversationId, setConversationId] = useState(() => "chat_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now());
  
  // Store accumulated case state for seamless in-chat submission
  const [activeCaseContext, setActiveCaseContext] = useState({
    title: "",
    description: "",
    category: "GENERAL_LEGAL_AID",
    district: user?.district || "Coimbatore",
    priority: "MEDIUM"
  });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    return () => {
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Load real authenticated user cases for context-aware quick actions
  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoadingCases(true);
        const data = await complaintService.getMyComplaints();
        setUserCases(data || []);
      } catch (err) {
        console.warn("Could not load user cases for chatbot context:", err);
      } finally {
        setLoadingCases(false);
      }
    };
    fetchCases();
  }, []);

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
        location: caseData.district || user?.district || "Coimbatore",
        district: caseData.district || user?.district || "Coimbatore",
        priority: finalPriority,
        language: (language || "en").toUpperCase(),
        identityVisibility: "VISIBLE",
        inputMode: "CHATBOT_DIRECT",
        disclaimerAccepted: true
      };

      const res = await complaintService.createComplaint(payload);
      if (typeof fetchNotifications === "function") {
        fetchNotifications();
      }
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

  const handleSend = async (queryToSend, languageHint = null) => {
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

    // Resolve target speaking language
    let targetLang = "en";
    if (languageHint) {
      const lh = languageHint.toLowerCase();
      targetLang = (lh.includes("tam") || lh === "ta" || lh.includes("tang")) ? "ta" :
                   (lh.includes("hin") || lh === "hi" || lh.includes("hing")) ? "hi" : "en";
    } else if (/[\u0B80-\u0BFF]/.test(text) || /\b(romba|illai|illa|vanakkam|sollunga|kudunga|panren|panna|irukku|sambalam|macha|nanba)\b/i.test(text)) {
      targetLang = "ta";
    } else if (/[\u0900-\u097F]/.test(text) || /\b(karo|chahiye|batao|madad|mera|meri|mujhe|aapko|shikayat|namaste)\b/i.test(text)) {
      targetLang = "hi";
    } else if (language && (language.startsWith("ta") || language.startsWith("hi"))) {
      targetLang = language.startsWith("ta") ? "ta" : "hi";
    }

    try {
      const response = await chatbotService.askLegalAI({
        message: text,
        language: targetLang,
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
          district: user?.district || "Coimbatore",
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
          text: "I encountered an issue retrieving verified legal provisions. Please try asking your question again in simple words.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn("Error stopping recorder:", e);
      }
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    setIsRecording(false);
  };

  const handleVoiceInput = async () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    let browserCaptured = "";

    // 1. Browser Native SpeechRecognition for zero-latency recognition
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const recognition = new SpeechRec();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "ta-IN"; // Catches Tamil, Tanglish, and Indian English

        recognition.onresult = (event) => {
          let full = "";
          for (let i = 0; i < event.results.length; i++) {
            if (event.results[i][0]?.transcript) {
              full += event.results[i][0].transcript + " ";
            }
          }
          const clean = full.replace(/[\u0400-\u04FF\u0600-\u06FF\u4E00-\u9FFF]+/g, '').trim();
          if (clean) {
            browserCaptured = clean;
            setInputQuery(clean);
          }
        };

        recognition.onerror = (e) => {
          console.warn("Chatbot Web Speech notice:", e.error);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (recErr) {
        console.warn("Could not start Web Speech in Chatbot:", recErr);
      }
    }

    // 2. MediaRecorder for server-side AI model audio transcription
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      let mimeType = "audio/webm";
      if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported) {
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          mimeType = "audio/webm;codecs=opus";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        }
      }

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach((track) => track.stop());
          audioStreamRef.current = null;
        }

        if (chunks.length === 0) {
          if (browserCaptured) {
            handleSend(browserCaptured);
          } else {
            toast.info("No speech detected. Please speak clearly.");
          }
          return;
        }

        const audioBlob = new Blob(chunks, { type: mimeType || "audio/webm" });
        const toastId = toast.loading("Processing voice with ARAM AI...");
        try {
          const res = await speechService.transcribeAudio(audioBlob, "auto");
          toast.dismiss(toastId);
          const rawText = (res?.transcript || res?.text || "").trim();
          const transcribedText = rawText.replace(/[\u0400-\u04FF\u0600-\u06FF\u4E00-\u9FFF]+/g, '').trim();
          const finalText = transcribedText && transcribedText !== "No audible speech detected." ? transcribedText : browserCaptured;
          
          if (finalText) {
            setInputQuery(finalText);
            const detected = res?.detectedLanguage || (/[\u0B80-\u0BFF]/.test(finalText) ? "Tamil" : /[\u0900-\u097F]/.test(finalText) ? "Hindi" : "English");
            toast.success(`Speech transcribed (${detected})! You can edit the text or press Send.`);
            if (inputRef.current) {
              inputRef.current.focus();
            }
          } else {
            toast.info("No speech detected. Please speak clearly into your microphone.");
          }
        } catch (err) {
          toast.dismiss(toastId);
          console.error("Voice transcription fallback notice:", err);
          if (browserCaptured) {
            setInputQuery(browserCaptured);
            toast.success("Speech captured via browser! You can edit the text before sending.");
            if (inputRef.current) inputRef.current.focus();
          } else {
            toast.error("Voice transcription failed. Please try again or type manually.");
          }
        }
      };

      // 250ms timeslice ensures steady audio chunking
      recorder.start(250);
      setIsRecording(true);
      toast.info("Listening... Speak in Tamil, English, Hindi, Tanglish, or Hinglish.");
    } catch (err) {
      console.error("Microphone access error:", err);
      if (browserCaptured) {
        setIsRecording(true);
      } else {
        toast.error("Microphone access unavailable. Please check microphone permissions.");
        setIsRecording(false);
      }
    }
  };

  // Quick Action Handlers
  const handleQuickTellAram = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    toast.info("Type your issue or click the microphone to speak.");
  };

  const handleQuickCheckDocument = () => {
    navigate("/citizen/documents");
  };

  const handleQuickSelectCase = (caseItem) => {
    if (!caseItem) {
      const q = "I want to review the procedure to register a new legal grievance.";
      setInputQuery(q);
      handleSend(q);
      return;
    }
    const q = `What is the current status and recommended next steps for my active case #${caseItem.complaintCustomId || caseItem.id} ("${caseItem.title || "Legal Complaint"}")?`;
    setInputQuery(q);
    handleSend(q);
  };

  const handleQuickTalkToGuide = () => {
    const distName = user?.district || "my district";
    const q = `I would like to speak with a verified legal guide or volunteer in ${distName} for human assistance with my grievance.`;
    setInputQuery(q);
    handleSend(q);
  };

  // Current avatar state
  const avatarState = isRecording 
    ? "listening" 
    : loading 
    ? "thinking" 
    : "idle";

  const isFreshConversation = messages.length <= 1;

  return (
    <DashboardLayout role="citizen">
      <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-7rem)]">
        
        {/* Top Header: Dignified, Non-Technical */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-3xl bg-[#FFFDF8] border border-[#E6E1D8] shadow-xs mb-3">
          <div className="flex items-center gap-3">
            <ARAMAvatar size="sm" state={avatarState} showStatus={true} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black text-[#163D32] tracking-tight">
                  ARAM AI
                </h1>
                <span className="text-xs text-[#9CA3AF]">•</span>
                <span className="text-xs font-semibold text-[#65736D]">Your Legal Companion</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online & Ready
                </span>
                <span className="text-[10px] text-[#8B9690] hidden sm:inline">
                  Tamil • Tanglish • English • Hindi
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setMessages([messages[0]]);
                setConversationId("chat_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now());
                toast.info("Fresh session started.");
              }}
              className="p-2 text-[#65736D] hover:text-[#163D32] hover:bg-[#F7F1E6] rounded-xl transition cursor-pointer"
              title="Reset Conversation"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={() => navigate("/citizen/submit-complaint")}
              className="px-3.5 py-2 bg-[#163D32] hover:bg-[#1F5948] text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <span className="hidden sm:inline">Formal Grievance Form</span>
              <span className="sm:hidden">File Form</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Chat Messages Stream & Welcome Screen */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 rounded-3xl bg-[#FFFDF8] border border-[#E6E1D8] shadow-xs mb-3">
          
          {/* Welcome Screen when Fresh Conversation */}
          {isFreshConversation && (
            <div className="py-6 sm:py-8 text-center space-y-5 animate-in fade-in duration-300">
              {/* Primary Avatar Character */}
              <div className="flex justify-center">
                <ARAMAvatar size="xl" state={avatarState} showStatus={true} />
              </div>

              {/* Greeting */}
              <div className="space-y-1.5 max-w-lg mx-auto">
                <h2 className="text-xl sm:text-2xl font-black text-[#163D32] tracking-tight">
                  Vanakkam! 👋
                </h2>
                <p className="text-sm sm:text-base font-bold text-[#18332B]">
                  Tell me what happened, and I will help you understand what you can do next.
                </p>
                <p className="text-xs text-[#65736D]">
                  Conversational legal aid grounded in verified Indian statutes and Tamil Nadu procedures.
                </p>
              </div>

              {/* The 4 Clean Quick Actions */}
              <div className="pt-2">
                <ARAMQuickActions
                  onTellAram={handleQuickTellAram}
                  onCheckDocument={handleQuickCheckDocument}
                  onSelectCase={handleQuickSelectCase}
                  onTalkToGuide={handleQuickTalkToGuide}
                  userCases={userCases}
                  loadingCases={loadingCases}
                />
              </div>
            </div>
          )}

          {/* Active Conversation Stream */}
          {!isFreshConversation && messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div className={`flex items-start gap-2.5 max-w-2xl ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                
                {/* Avatar Icon next to AI Messages */}
                {msg.sender === "ai" && (
                  <ARAMAvatar
                    size="xs"
                    state={msg.isComplaintSuccess ? "verified" : "speaking"}
                    showStatus={false}
                    className="mt-1 shadow-2xs"
                  />
                )}

                {/* Message Bubble Container */}
                <div
                  className={`rounded-2xl p-4 sm:p-5 shadow-xs transition-all ${
                    msg.sender === "user"
                      ? "bg-[#163D32] text-white rounded-tr-none font-medium text-xs sm:text-sm border border-[#1F5948]"
                      : msg.isComplaintSuccess
                      ? "bg-[#DCEBDD]/60 border border-[#163D32]/30 text-[#163D32] rounded-tl-none"
                      : "bg-[#FAF8F5] border border-[#E6E1D8] text-[#18332B] rounded-tl-none"
                  }`}
                >
                  {/* Sender Header for AI */}
                  {msg.sender === "ai" && (
                    <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-[#E6E1D8]/60">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-[#163D32]">ARAM AI</span>
                        <ARAMBadge type="ai_companion" size="sm" label="Companion" />
                      </div>
                      {msg.data?.statutoryGrounding && (
                        <ARAMBadge type="statutory" size="sm" label="Statutory Grounding" />
                      )}
                    </div>
                  )}

                  {/* Formatted Markdown Body with High-Contrast User & AI Theme */}
                  <FormattedMessageText text={msg.text} isUser={msg.sender === "user"} />
                  
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

                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#E6E1D8]/40 gap-2">
                    {msg.sender === "ai" ? (
                      <ReadAloudButton 
                        text={msg.text} 
                        language={language === "ta" ? "ta-IN" : language === "hi" ? "hi-IN" : "en-IN"} 
                      />
                    ) : <span />}
                    <span className={`text-[9px] font-mono shrink-0 ${msg.sender === "user" ? "text-emerald-100/75" : "text-[#8B9690]"}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              </div>

              {/* In-Chat Action Buttons for AI Guidance */}
              {msg.sender === "ai" && !msg.isComplaintSuccess && (
                <div className="flex flex-wrap items-center gap-2 mt-2 ml-9">
                  {msg.canSubmit && (
                    <button
                      onClick={() => handleDirectSubmitComplaint(msg.data)}
                      disabled={submittingComplaint}
                      className="px-3 py-1.5 rounded-xl bg-[#163D32] text-white hover:bg-[#1F5948] text-xs font-bold transition shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <FileCheck size={13} />
                      {submittingComplaint ? "Registering..." : "📝 File Formal Grievance with this Assessment"}
                    </button>
                  )}

                  <button
                    onClick={() => handleCopy(msg.text, msg.id)}
                    className="px-2.5 py-1.5 rounded-xl bg-[#FFFDF8] border border-[#E6E1D8] text-[#65736D] hover:text-[#163D32] hover:bg-[#F7F1E6] text-xs font-semibold transition shadow-2xs flex items-center gap-1 cursor-pointer"
                    title="Copy Guidance"
                  >
                    {copiedId === msg.id ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    {copiedId === msg.id ? "Copied" : "Copy"}
                  </button>
                </div>
              )}

              {/* Contextual Dynamic Suggestion Chips from AI response */}
              {msg.options && msg.options.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2.5 ml-9 max-w-2xl">
                  {msg.options.map((opt, optIdx) => (
                    <button
                      key={optIdx}
                      onClick={() => {
                        setInputQuery(opt);
                        handleSend(opt);
                      }}
                      className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#FFFDF8] border border-[#E8C978] text-[#163D32] hover:bg-[#163D32] hover:text-white transition cursor-pointer shadow-2xs flex items-center gap-1.5"
                    >
                      <Sparkles size={11} className="text-[#E8C978]" />
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Truthful Processing States */}
          {loading && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E6E1D8] text-xs font-bold text-[#163D32] animate-pulse max-w-md">
              <ARAMAvatar size="xs" state="thinking" showStatus={false} />
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin text-[#E8C978]" size={15} />
                <span>Checking verified statutory sections & formulating guidance...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar with Auto-Detect & Language Bar */}
        <div className="p-2.5 sm:p-3 rounded-3xl bg-[#FFFDF8] border border-[#E6E1D8] shadow-xs space-y-2">
          
          {/* Auto-Detect Status & Supported Languages Info */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 px-2 pt-0.5 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#DCEBDD] text-[#163D32] border border-[#c5ddc6]">
                <Sparkles size={11} className="text-[#1F5948]" />
                Auto-Detect Active
              </span>
              <span className="text-[10px] text-[#65736D]">
                <span className="font-semibold text-[#18332B]">Available:</span> தமிழ் (Tamil) • English • हिंदी (Hindi) • Tanglish • Hinglish
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Globe size={12} className="text-[#65736D]" />
              <button
                onClick={() => changeLanguage("auto")}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                  (language === "auto" || !language)
                    ? "bg-[#163D32] text-white shadow-2xs"
                    : "bg-[#F7F1E6]/70 text-[#65736D] hover:bg-[#E6E1D8]"
                }`}
                title="Auto detect language"
              >
                Auto
              </button>
              {availableLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                    language === lang.code
                      ? "bg-[#163D32] text-white shadow-2xs"
                      : "bg-[#F7F1E6]/70 text-[#65736D] hover:bg-[#E6E1D8]"
                  }`}
                >
                  {lang.nativeLabel}
                </button>
              ))}
            </div>
          </div>

          {/* Input Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleVoiceInput}
              className={`p-3 rounded-2xl transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                isRecording 
                  ? "bg-red-600 text-white animate-pulse shadow-md px-3.5" 
                  : "bg-[#DCEBDD] text-[#163D32] hover:bg-[#c6dcc7] border border-[#c5ddc6]"
              }`}
              title="Voice Input (Auto-Detect: Tamil, English, Hindi, Tanglish, Hinglish)"
            >
              <Mic size={17} />
              {isRecording && <span className="text-[11px] font-bold hidden sm:inline">Listening...</span>}
            </button>

            <input
              ref={inputRef}
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type or speak in Tamil, Tanglish, English, or Hindi..."
              className="flex-1 bg-[#FAF8F5] border border-[#E6E1D8] focus:border-[#163D32] focus:bg-[#FFFDF8] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#18332B] placeholder-[#8B9690] outline-none transition shadow-2xs"
            />

            <button
              onClick={() => handleSend()}
              disabled={!inputQuery.trim() || loading}
              className="px-5 py-2.5 rounded-2xl bg-[#163D32] hover:bg-[#1F5948] disabled:opacity-50 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center justify-center shrink-0 min-h-[40px]"
            >
              <Send size={15} />
            </button>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Chatbot;
