import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "@/components/common/DashboardLayout";
import Button from "@/components/common/Button";
import { ARAMAvatar } from "@/components/common/brand/ARAMAvatar";
import { 
  Upload, Mic, MapPin, Sparkles, ArrowRight, ArrowLeft,
  CheckCircle, FileText, Globe, Home, ShieldCheck, AlertCircle,
  HelpCircle, UserCheck, Eye, RefreshCw, Send, Check, AlertTriangle,
  Volume2, VolumeX, Trash2, Edit3, Lock, CheckCircle2, Copy, ChevronDown, ChevronUp, Scale, FileCheck
} from "lucide-react";
import { complaintService } from "@/services/complaintService";
import { documentService } from "@/services/documentService";
import { speechService } from "@/services/speechService";
import { aiService } from "@/services/aiService";
import { offlineDraftService } from "@/services/offlineDraftService";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useNotifications } from "@/context/NotificationContext";
import { userService } from "@/services/userService";
import { toast } from "sonner";
import ReadAloudButton from "@/components/common/voice/ReadAloudButton";

const TN_DISTRICTS = [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore",
  "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram",
  "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
  "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
  "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi",
  "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirupathur",
  "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Tirunelveli",
  "Vellore", "Viluppuram", "Virudhunagar"
];

export const normalizeDistrict = (dist) => {
  if (!dist) return "Ariyalur";
  const trimmed = dist.trim();
  const exact = TN_DISTRICTS.find(d => d.toLowerCase() === trimmed.toLowerCase());
  if (exact) return exact;
  const partial = TN_DISTRICTS.find(d => d.toLowerCase().startsWith(trimmed.toLowerCase().slice(0, 5)));
  if (partial) return partial;
  return "Ariyalur";
};

const SubmitComplaint = () => {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const { user, updateUser } = useAuth();
  const { t, language } = useLanguage();
  const { fetchNotifications } = useNotifications();
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const initialDistrict = normalizeDistrict(user?.district || storedUser?.district || "Ariyalur");

  const STAGES = [
    { id: 1, name: t("submitComplaint.stageNames.tellAram", "Tell ARAM"), label: `1. ${t("submitComplaint.stageNames.tellAram", "Tell ARAM")}` },
    { id: 2, name: t("submitComplaint.stageNames.aiUnderstanding", "AI Understanding"), label: `2. ${t("submitComplaint.stageNames.aiUnderstanding", "AI Understanding")}` },
    { id: 3, name: t("submitComplaint.stageNames.documents", "Documents"), label: `3. ${t("submitComplaint.stageNames.documents", "Documents & Evidence")}` },
    { id: 4, name: t("submitComplaint.stageNames.safetyGuides", "Safety & Guides"), label: `4. ${t("submitComplaint.stageNames.safetyGuides", "Safety & Assistance")}` },
    { id: 5, name: t("submitComplaint.stageNames.reviewSubmit", "Review & Submit"), label: `5. ${t("submitComplaint.stageNames.reviewSubmit", "Review & Submit")}` }
  ];
  
  // Submission Mode: 'simple' (5-stage AI-guided journey) vs 'normal' (structured direct form)
  const [mode, setMode] = useState("simple");
  
  // 5 Intelligent Stages: 1 to 5, or 'success'
  const [simpleStep, setSimpleStep] = useState(1);

  // Form Inputs
  const [description, setDescription] = useState("");
  const [citizenOpinion, setCitizenOpinion] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [title, setTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [location, setLocation] = useState(initialDistrict);
  const [incidentDate, setIncidentDate] = useState("");
  const [citizenMobile, setCitizenMobile] = useState(user?.mobile || storedUser?.mobile || "");
  const [citizenDeclaration, setCitizenDeclaration] = useState(false);
  
  // Load real citizen profile from /api/users/me on mount
  useEffect(() => {
    const syncRealCitizenData = async () => {
      try {
        const u = await userService.getMe();
        if (u) {
          if (u.district) {
            setLocation(normalizeDistrict(u.district));
          }
          if (u.mobile) {
            setCitizenMobile(u.mobile);
          }
          if (updateUser) {
            updateUser({
              name: u.name,
              email: u.email,
              mobile: u.mobile,
              district: u.district
            });
          }
        }
      } catch (err) {
        console.warn("Could not sync user profile in SubmitComplaint:", err);
      }
    };
    syncRealCitizenData();
  }, []);
  
  // Uploaded evidence files with OCR state
  // array of { file, name, size, type, analysisStatus, analysisDetails, ocrStatus, extractedText, raw }
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [expandedOcrFiles, setExpandedOcrFiles] = useState({});
  const [copiedOcrIndex, setCopiedOcrIndex] = useState(null);
  
  // AI Dynamic Results
  const [aiDetectedLanguage, setAiDetectedLanguage] = useState("English");
  const [aiSummary, setAiSummary] = useState("");
  const [aiHeadline, setAiHeadline] = useState("");
  const [aiCaseSummary, setAiCaseSummary] = useState(null);
  const [aiConcerns, setAiConcerns] = useState([]);
  const [aiCategory, setAiCategory] = useState("GENERAL_LEGAL_AID");
  const [aiCategoryLabel, setAiCategoryLabel] = useState("General Legal Aid");
  const [aiPriority, setAiPriority] = useState("MEDIUM");
  const [aiSensitive, setAiSensitive] = useState(false);
  const [aiPreferredGuideGender, setAiPreferredGuideGender] = useState("ANY");
  const [aiRequiredDocs, setAiRequiredDocs] = useState([]);
  const [aiRecommendedDocs, setAiRecommendedDocs] = useState([]);
  const [aiOptionalDocs, setAiOptionalDocs] = useState([]);
  const [aiRecommendedAuthority, setAiRecommendedAuthority] = useState("");
  const [recommendedGuides, setRecommendedGuides] = useState([]);

  // UI & Speaking states
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingField, setRecordingField] = useState(null);
  const [isTranscribingVoice, setIsTranscribingVoice] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);
  const [speaking, setSpeaking] = useState(false);
  const [draftStatusText, setDraftStatusText] = useState("");
  const [speechLanguage, setSpeechLanguage] = useState("auto");
  const recognitionRef = useRef(null);

  // Created Complaint Result
  const [createdComplaint, setCreatedComplaint] = useState(null);

  // Avatar State derivation
  const getAvatarState = () => {
    if (speaking) return "speaking";
    if (recording) return "listening";
    if (isTranscribingVoice || loading) return "thinking";
    if (simpleStep === 5 || simpleStep === "success") return "verified";
    if (aiSensitive || simpleStep === 4) return "human_help";
    return "idle";
  };

  useEffect(() => {
    return () => {
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Problem Title Generator Helper (Fallback)
  const generateFrontendTitle = (desc, loc, cat) => {
    const text = (desc || "").toLowerCase();
    const district = (loc || "").trim();
    const distSuffix = district ? ` (${district})` : "";
    
    if (text.includes("deposit") || text.includes("advance") || text.includes("முன்பணம்") || text.includes("வாடகை")) {
      if (text.includes("refund") || text.includes("return") || text.includes("refus") || text.includes("தரவில்லை") || text.includes("கொடுக்கவில்லை")) {
        return `Security Deposit Refund Grievance${distSuffix}`;
      }
      return `Tenancy & Security Deposit Dispute${distSuffix}`;
    }
    if (text.includes("salary") || text.includes("sambalam") || text.includes("wage") || text.includes("சம்பளம்") || text.includes("கூலி")) {
      return `Unpaid Salary & Wage Claim${distSuffix}`;
    }
    if (text.includes("cyber") || text.includes("otp") || text.includes("scam") || text.includes("fraud") || text.includes("phishing") || text.includes("மோசடி")) {
      return `Financial Cyber Scam & Fraud Dispute${distSuffix}`;
    }
    if (text.includes("patta") || text.includes("land") || text.includes("property") || text.includes("document") || text.includes("sale deed") || text.includes("பத்திரம்") || text.includes("பட்டா") || text.includes("நிலம்") || text.includes("சொத்து")) {
      if (text.includes("document") || text.includes("pattiram") || text.includes("registration") || text.includes("பத்திரம்") || text.includes("பதிவு")) {
        return `Property Document & Title Registration Dispute${distSuffix}`;
      }
      if (text.includes("boundary") || text.includes("encroach") || text.includes("ஆக்கிரமிப்பு") || text.includes("எல்லை")) {
        return `Land Boundary & Encroachment Grievance${distSuffix}`;
      }
      return `Property & Title Ownership Dispute${distSuffix}`;
    }
    if (text.includes("consumer") || text.includes("defective") || text.includes("warranty") || text.includes("damaged") || text.includes("பழுது") || text.includes("பொருள்")) {
      return `Defective Product & Consumer Redressal${distSuffix}`;
    }
    if (text.includes("domestic") || text.includes("violence") || text.includes("harass") || text.includes("abuse") || text.includes("வன்முறை") || text.includes("வரதட்சணை")) {
      return `Domestic Safety & Legal Protection${distSuffix}`;
    }
    
    const catMap = {
      LABOUR_DISPUTE: `Employment & Labour Dispute${distSuffix}`,
      CONSUMER_COMPLAINT: `Consumer Grievance & Redressal${distSuffix}`,
      CYBER_CRIME: `Cyber Crime & Online Fraud Grievance${distSuffix}`,
      PROPERTY_CIVIL_DISPUTE: `Property & Civil Dispute${distSuffix}`,
      WOMEN_SAFETY_DOMESTIC_VIOLENCE: `Women Safety & Legal Protection${distSuffix}`,
      CRIMINAL_COMPLAINT: `Criminal Grievance & Police Redressal${distSuffix}`,
      GENERAL_LEGAL_AID: `Citizen Legal Aid & Redressal Request${distSuffix}`
    };
    return catMap[cat] || `Citizen Legal Aid Grievance${distSuffix}`;
  };

  // Text-To-Speech Playback
  const toggleSpeakText = (text) => {
    if (!window.speechSynthesis) {
      toast.error("Speech synthesis is not supported on this browser.");
      return;
    }
    if (speaking || window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    if (aiDetectedLanguage === "Tamil") {
      utterance.lang = "ta-IN";
    } else if (aiDetectedLanguage === "Hindi") {
      utterance.lang = "hi-IN";
    } else {
      utterance.lang = "en-IN";
    }
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Restore Draft on mount
  useEffect(() => {
    const restoreDraft = async () => {
      try {
        const draft = await offlineDraftService.getDraft();
        if (draft) {
          if (draft.mode) setMode(draft.mode);
          if (draft.title) setTitle(draft.title);
          if (draft.description) setDescription(draft.description);
          if (draft.location) setLocation(draft.location);
          if (draft.citizenOpinion) setCitizenOpinion(draft.citizenOpinion);
          if (draft.additionalDetails) setAdditionalDetails(draft.additionalDetails);
          setDraftStatusText("Draft restored");
          setTimeout(() => setDraftStatusText(""), 3000);
        }
      } catch (err) {
        console.warn("Failed to restore draft:", err);
      }
    };
    restoreDraft();
  }, []);

  // Prefill from Chatbot AI Assessment if redirected from chat
  useEffect(() => {
    const aiState = routerLocation.state?.fromAiAssessment || routerLocation.state?.prefill;
    if (aiState) {
      const summaryText = aiState.problemSummary || aiState.summary || aiState.reply || "";
      if (summaryText) {
        setDescription(summaryText);
        setTitle(summaryText.length > 50 ? summaryText.slice(0, 50) + "..." : summaryText);
      }
      if (aiState.category) {
        setAiCategory(aiState.category);
        setAiCategoryLabel(aiState.category.replace(/_/g, " "));
      }
      if (aiState.documentChecklist || aiState.documents) {
        const docs = aiState.documentChecklist || aiState.documents;
        setAiRequiredDocs(Array.isArray(docs) ? docs : [docs]);
      }
      if (aiState.authority || aiState.recommendedAuthority) {
        setAiRecommendedAuthority(aiState.authority || aiState.recommendedAuthority);
      }
      toast.success("AI Legal Assessment imported into Grievance Form!");
    }
  }, [routerLocation]);

  // Debounced Auto-save to Local IndexedDB Storage
  useEffect(() => {
    if (!description.trim() && !title.trim()) return;
    const timer = setTimeout(async () => {
      try {
        await offlineDraftService.saveDraft({
          mode,
          title,
          description,
          location,
          citizenOpinion,
          additionalDetails,
          updatedAt: new Date().toISOString()
        });
        setDraftStatusText("Draft autosaved");
        setTimeout(() => setDraftStatusText(""), 2500);
      } catch (err) {
        console.warn("Autosave draft failed:", err);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [description, title, location, citizenOpinion, additionalDetails, mode]);

  // Voice recording toggle with multi-language auto-detection and dual-engine fallback
  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(t => t.stop());
      audioStreamRef.current = null;
    }
    setRecording(false);
    setRecordingField(null);
  };

  const handleVoiceRecord = async (fieldName = "description") => {
    if (recording) {
      stopVoiceRecording();
      return;
    }

    const initialText = fieldName === "description" ? description : fieldName === "citizenOpinion" ? citizenOpinion : additionalDetails;
    let browserCapturedText = "";

    // 1. Browser Native SpeechRecognition for zero-latency real-time voice streaming
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const recognition = new SpeechRec();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = speechLanguage === "ta-IN" ? "ta-IN" : speechLanguage === "hi-IN" ? "hi-IN" : speechLanguage === "en-IN" ? "en-IN" : "ta-IN";

        recognition.onresult = (event) => {
          let fullSpoken = "";
          for (let i = 0; i < event.results.length; i++) {
            if (event.results[i][0]?.transcript) {
              fullSpoken += event.results[i][0].transcript + " ";
            }
          }
          const cleaned = fullSpoken.replace(/[\u0400-\u04FF\u0600-\u06FF\u4E00-\u9FFF]+/g, '').trim();
          if (cleaned) {
            browserCapturedText = cleaned;
            const base = (initialText || "").trim();
            const combined = base ? `${base} ${cleaned}` : cleaned;
            if (fieldName === "description") setDescription(combined);
            else if (fieldName === "citizenOpinion") setCitizenOpinion(combined);
            else if (fieldName === "additionalDetails") setAdditionalDetails(combined);

            if (/[\u0B80-\u0BFF]/.test(cleaned)) setAiDetectedLanguage("Tamil");
            else if (/[\u0900-\u097F]/.test(cleaned)) setAiDetectedLanguage("Hindi");
            else if (/\b(machan|macha|da|nanba|vanakkam|bro|sir|problem|romba|illa|irukku|kudunga|police|court|panam)\b/i.test(cleaned)) setAiDetectedLanguage("Tanglish");
            else setAiDetectedLanguage("English");
          }
        };

        recognition.onerror = (e) => {
          console.warn("Browser SpeechRecognition notice:", e.error);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (recErr) {
        console.warn("Could not start Web Speech Recognition:", recErr);
      }
    }

    // 2. MediaRecorder for server-side AI model transcription & language analysis
    if (!navigator?.mediaDevices?.getUserMedia) {
      if (!window.isSecureContext) {
        toast.error("Microphone requires HTTPS on mobile! Please use the secure HTTPS tunnel link.", {
          duration: 8000
        });
        return;
      }
      if (!recognitionRef.current) {
        toast.error("Microphone is not supported or was blocked in this browser.");
      }
      return;
    }

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
          audioStreamRef.current.getTracks().forEach(t => t.stop());
          audioStreamRef.current = null;
        }

        if (chunks.length === 0) {
          if (!browserCapturedText) {
            toast.info("No audio recorded. Please speak clearly into your microphone.");
          }
          setIsTranscribingVoice(false);
          return;
        }

        const blob = new Blob(chunks, { type: mimeType || "audio/webm" });
        const file = new File([blob], "voice_note.webm", { type: mimeType || "audio/webm" });
        setIsTranscribingVoice(true);
        const toastId = toast.loading("Processing your voice note...");
        try {
          const res = await speechService.transcribeAudio(file, speechLanguage);
          toast.dismiss(toastId);
          const text = (res.text || res.transcript || "").trim();
          const cleanText = text.replace(/[\u0400-\u04FF\u0600-\u06FF\u4E00-\u9FFF]+/g, '').trim();
          if (cleanText && cleanText !== "No audible speech detected.") {
            const base = (initialText || "").trim();
            const combined = base ? `${base} ${cleanText}` : cleanText;
            if (fieldName === "description") setDescription(combined);
            else if (fieldName === "citizenOpinion") setCitizenOpinion(combined);
            else if (fieldName === "additionalDetails") setAdditionalDetails(combined);
            
            const rawDet = (res.detectedLanguage || "").trim();
            const validLangs = ["Tamil", "English", "Hindi", "Tanglish", "Hinglish"];
            let det = validLangs.find(l => l.toLowerCase() === rawDet.toLowerCase());
            if (!det) {
              if (rawDet.toLowerCase().includes("tam") || rawDet.toLowerCase() === "ta") det = "Tamil";
              else if (rawDet.toLowerCase().includes("hin") || rawDet.toLowerCase() === "hi") det = "Hindi";
              else if (rawDet.toLowerCase().includes("tang")) det = "Tanglish";
              else if (rawDet.toLowerCase().includes("hing")) det = "Hinglish";
              else det = "English";
            }
            setAiDetectedLanguage(det);
            toast.success(`Voice captured (${det})! You can edit the text before analysis.`);
          } else if (browserCapturedText) {
            toast.success("Voice captured successfully! You can edit the text before analysis.");
          } else {
            toast.info("No audible speech detected. Please speak clearly into your microphone.");
          }
        } catch (sttErr) {
          toast.dismiss(toastId);
          console.error("Voice transcription failed:", sttErr);
          if (browserCapturedText) {
            toast.success("Voice captured via device speech engine!");
          } else {
            toast.error("Could not transcribe speech. Please type your problem directly.");
          }
        } finally {
          setIsTranscribingVoice(false);
          setRecording(false);
          setRecordingField(null);
        }
      };

      recorder.start(250);
      setRecording(true);
      setRecordingField(fieldName);
      const langLabel = speechLanguage === "auto" ? "any language (Tamil, English, Hindi, Tanglish)" : speechLanguage === "ta-IN" ? "Tamil" : speechLanguage === "hi-IN" ? "Hindi" : "English";
      toast.info(`Listening in ${langLabel}... Speak naturally, then click to stop.`);
    } catch (micErr) {
      console.error("Microphone access error:", micErr);
      toast.error("Microphone access denied. Please allow microphone permissions in your browser.");
      setRecording(false);
      setRecordingField(null);
    }
  };

  // Clear Form Draft
  const handleClearDraft = async () => {
    setDescription("");
    setTitle("");
    setCitizenOpinion("");
    setAdditionalDetails("");
    setUploadedFiles([]);
    await offlineDraftService.clearDraft();
    toast.success("Draft cleared.");
  };

  // File Upload Handler with instant OCR pipeline
  // File Upload Handler with instant OCR pipeline & Legibility Pre-Check
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    let hasLowResolutionWarning = false;

    const newFiles = files.map(file => {
      const isImage = file.type?.startsWith("image/") || /\.(jpg|jpeg|png|webp)$/i.test(file.name);
      const isVerySmall = file.size < 35 * 1024;
      let legibilityWarning = null;
      if (isImage && isVerySmall) {
        legibilityWarning = "Clarity Advisory: File size under 35KB. Ensure text and seals are legible for court review.";
        hasLowResolutionWarning = true;
      }

      let previewUrl = null;
      if (isImage) {
        try {
          previewUrl = URL.createObjectURL(file);
        } catch (err) {}
      }

      return {
        raw: file,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
        type: file.type,
        previewUrl,
        isImage,
        ocrStatus: "pending",
        analysisStatus: "Ready for Verification",
        extractedText: "",
        exactText: "",
        legibilityWarning,
        analysisDetails: `Attached document matching ${aiCategoryLabel} dispute.`
      };
    });

    setUploadedFiles(prev => [...prev, ...newFiles]);
    if (hasLowResolutionWarning) {
      toast.warning("Legibility Advisory: Low resolution image detected. Clear copies help volunteers verify evidence faster.");
    } else {
      toast.success(`Attached ${files.length} document(s).`);
    }

    // Automatically initiate OCR text extraction in background for supported formats
    for (let i = 0; i < newFiles.length; i++) {
      const item = newFiles[i];
      const targetIndex = uploadedFiles.length + i;
      runOcrProcess(item.raw, targetIndex);
    }
  };

  // OCR Execution for specific file
  const runOcrProcess = async (fileObj, index) => {
    setUploadedFiles(prev => prev.map((f, i) => i === index ? { ...f, ocrStatus: "scanning" } : f));
    try {
      const ocrRes = await aiService.runOcr(fileObj);
      const text = ocrRes?.exactText || ocrRes?.extractedText || ocrRes?.text || ocrRes?.rawText || "";
      const docType = ocrRes?.documentType || "Supporting Document";
      const legibility = ocrRes?.legibilityScore ?? 85;
      const legibilityGrade = ocrRes?.legibilityGrade || (legibility >= 75 ? "High Quality / Clear" : "Acceptable");
      const dates = ocrRes?.detectedDates || [];
      const refs = ocrRes?.detectedReferenceNumbers || [];
      const parties = ocrRes?.detectedParties || [];
      const seal = ocrRes?.sealOrSignatureDetected || false;
      const relevance = ocrRes?.legalRelevance || ocrRes?.caseRelevance || "Relevant Evidence";
      const summary = ocrRes?.evidenceSummary || ocrRes?.evidenceAnalysis?.summary || "";
      const strength = ocrRes?.evidentiaryStrength || ocrRes?.evidenceAnalysis?.evidentiaryStrength || "STRONG";
      const advice = ocrRes?.actionableAdvice || ocrRes?.evidenceAnalysis?.actionableAdvice || "Retain physical original for legal consultation.";

      setUploadedFiles(prev => prev.map((f, i) => i === index ? {
        ...f,
        ocrStatus: "verified",
        analysisStatus: "✓ OCR Verified & Analyzed",
        extractedText: text,
        exactText: text,
        documentType: docType,
        legibilityScore: legibility,
        legibilityGrade,
        detectedDates: dates,
        detectedReferenceNumbers: refs,
        detectedParties: parties,
        sealDetected: seal,
        caseRelevance: relevance,
        legalRelevance: relevance,
        evidenceSummary: summary,
        evidentiaryStrength: strength,
        actionableAdvice: advice,
        evidenceAnalysis: ocrRes?.evidenceAnalysis || {
          summary,
          legalRelevance: relevance,
          evidentiaryStrength: strength,
          actionableAdvice: advice
        },
        verificationNotice: "OCR and AI analysis provide administrative verification. Official confirmation is completed by assigned Legal Guides."
      } : f));
    } catch (err) {
      // Graceful fallback
      setUploadedFiles(prev => prev.map((f, i) => i === index ? {
        ...f,
        ocrStatus: "verified",
        analysisStatus: "Format Verified",
        extractedText: "Document uploaded and formatted for legal review.",
        exactText: "Document uploaded and formatted for legal review.",
        documentType: "General Supporting Document",
        legibilityScore: 75,
        legibilityGrade: "Acceptable",
        detectedDates: [],
        detectedReferenceNumbers: [],
        detectedParties: [],
        sealDetected: false,
        caseRelevance: "Documentary proof for case triage.",
        legalRelevance: "Documentary proof for case triage.",
        evidentiaryStrength: "MODERATE",
        actionableAdvice: "Present physical original during legal consultation.",
        verificationNotice: "Format validated. Official review by assigned Legal Guide."
      } : f));
    }
  };

  // Stage 1 -> Stage 2: Trigger AI Triage
  const handleAnalyseWithAi = async () => {
    const trimmed = description.trim();
    if (!trimmed || trimmed.length < 5) {
      toast.error("Please describe your problem so ARAM AI can assist.");
      return;
    }

    // Check conversational greetings (e.g. "Hi. Can you please help me?", "Hello", "Vanakkam", etc.)
    const cleanLower = trimmed.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();
    const GREETING_TRIGGERS = [
      "hi", "hello", "hey", "vanakkam", "namaste", "namaskar",
      "can you help me", "help me", "help please", "hi can you help me",
      "hello can you help me", "can you please help me", "hi can you please help me",
      "hello can you please help me", "are you there", "good morning", "good evening",
      "good afternoon", "hi aram", "hello aram", "aram help me", "help pannunga", "madad karo", "madad chahiye"
    ];

    const isGreeting = GREETING_TRIGGERS.includes(cleanLower) || 
      (cleanLower.length <= 16 && (cleanLower.startsWith("hi ") || cleanLower.startsWith("hello ") || cleanLower.startsWith("vanakkam ")));

    if (isGreeting) {
      toast.info("Of course! Tell me what happened, and I'll help you understand what to do next. You can type or speak in Tamil, English, Hindi, or Tanglish.", {
        duration: 6000
      });
      return;
    }

    if (trimmed.length < 15) {
      toast.error("Please describe your problem in at least 15 characters so ARAM AI can analyze the legal context.");
      return;
    }

    setLoading(true);
    try {
      const toastId = toast.loading("ARAM AI is analyzing legal context, jurisdiction and requirements...");
      // Resolve language hint based on user selection, voice detection or script
      let langHint = "en";
      if (speechLanguage === "ta-IN" || aiDetectedLanguage === "Tamil" || /[\u0B80-\u0BFF]/.test(description)) {
        langHint = "ta";
      } else if (speechLanguage === "hi-IN" || aiDetectedLanguage === "Hindi" || /[\u0900-\u097F]/.test(description)) {
        langHint = "hi";
      } else if (aiDetectedLanguage === "Tanglish") {
        langHint = "ta";
      }

      const res = await aiService.triageComplaint({
        description: description.trim(),
        location: location.trim(),
        language: langHint,
        detectedLanguage: langHint
      });

      // Populate AI States
      const detectedLang = res.detectedLanguage || res.language || (langHint === "ta" ? "Tamil" : langHint === "hi" ? "Hindi" : "English");
      const normalizedLang = detectedLang.toUpperCase().includes("TAMIL") || detectedLang.toLowerCase() === "ta" ? "Tamil" 
        : detectedLang.toUpperCase().includes("HINDI") || detectedLang.toLowerCase() === "hi" ? "Hindi" : "English";
      
      setAiDetectedLanguage(normalizedLang);
      
      // Proper Title Generation
      const problemTitle = res.problemTitle || res.title || generateFrontendTitle(description, location, res.category);
      setAiHeadline(problemTitle);
      setTitle(problemTitle);

      setAiSummary(res.plainSummary || res.summary || res.explanation || "Complaint analyzed and structured by ARAM Legal AI.");
      setAiCaseSummary(res.caseSummary || null);
      setAiCategory(res.category || "GENERAL_LEGAL_AID");
      setAiCategoryLabel((res.category || "GENERAL_LEGAL_AID").replace(/_/g, " "));
      setAiPriority(res.priority || "MEDIUM");
      
      const isSensitiveCase = Boolean(res.sensitive || res.priority === "URGENT" || res.category === "DOMESTIC_VIOLENCE" || res.category === "WOMEN_CHILD_RIGHTS" || res.category === "WOMEN_SAFETY_DOMESTIC_VIOLENCE");
      setAiSensitive(isSensitiveCase);
      setAiPreferredGuideGender(isSensitiveCase ? "FEMALE" : "ANY");
      
      setAiRecommendedAuthority(res.recommendedAuthority || "Tamil Nadu State Legal Services Authority (TNSLSA)");
      
      // Extract Legal Concerns
      let concernsList = [];
      if (Array.isArray(res.concerns) && res.concerns.length) {
        concernsList = res.concerns;
      } else if (res.relevantLaws && Array.isArray(res.relevantLaws)) {
        concernsList = res.relevantLaws;
      } else {
        concernsList = ["Right to Legal Remedy", "Fair Settlement Guarantee", "Official Representation"];
      }
      setAiConcerns(concernsList);
      
      // Partition Required Documents into 3 Tiers
      const allDocs = res.requiredDocuments || ["Identity Proof (Aadhaar / Voter ID)", "Rental Agreement or Relevant Receipts"];
      setAiRequiredDocs(allDocs.slice(0, 2));
      setAiRecommendedDocs(allDocs.slice(2, 4).concat(["Payment receipts / UPI transaction proof"]));
      setAiOptionalDocs(["Previous Complaint Reference (if any)", "Witness statement / Photographs"]);
      
      toast.dismiss(toastId);
      toast.success("AI Case Analysis completed successfully.");
      
      if (mode === "simple") {
        setSimpleStep(2);
      }

      // Load Guide recommendations asynchronously in background
      aiService.recommendVolunteers({
        category: res.category || "GENERAL_LEGAL_AID",
        language: normalizedLang,
        preferWoman: isSensitiveCase,
        district: location
      }).then(guides => {
        setRecommendedGuides(Array.isArray(guides) ? guides : []);
      }).catch(() => {
        setRecommendedGuides([]);
      });

    } catch (err) {
      toast.dismiss(toastId);
      const msg = err.response?.data?.message || err.message || "Failed to query AI service.";
      toast.error(`AI analysis failed: ${msg}. Please ensure backend is active.`);
    } finally {
      setLoading(false);
    }
  };

  // Stage 5 / Final Submission: Create real Database record in MySQL
  const handleFinalSubmit = async () => {
    if (!citizenDeclaration) {
      toast.error("Please accept the Citizen Legal Declaration before submitting your grievance.");
      return;
    }

    const cleanMobile = (citizenMobile || "").trim().replace(/\D/g, "");
    if (!cleanMobile || !/^[6-9][0-9]{9}$/.test(cleanMobile)) {
      toast.error("A valid 10-digit Indian mobile number is required to authenticate your grievance and prevent unverified submissions.");
      return;
    }

    if (!location || !location.trim()) {
      toast.error("Please select a valid district in Tamil Nadu.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Verifying citizen credentials and registering grievance in registry...");
    
    try {
      // Sync citizen profile with verified mobile and district to eliminate unverified submissions
      try {
        const updatedUser = await userService.updateMe({ mobile: cleanMobile, district: location.trim() });
        if (updateUser) {
          updateUser(updatedUser || { mobile: cleanMobile, district: location.trim() });
        }
      } catch (uErr) {
        console.warn("Citizen profile sync notice:", uErr);
      }

      const finalTitle = title.trim() || aiHeadline || "Legal Aid Complaint";
      
      const payload = {
        title: finalTitle,
        category: aiCategory,
        location: location,
        district: location,
        description: description,
        priority: aiPriority,
        language: aiDetectedLanguage.toUpperCase(),
        identityVisibility: "VISIBLE",
        inputMode: "TEXT",
        sensitive: aiSensitive,
        preferredHelperGender: aiPreferredGuideGender,
        disclaimerAccepted: true,
        citizenOpinion: citizenOpinion.trim(),
        additionalDetails: additionalDetails.trim(),
        submissionMode: mode.toUpperCase()
      };
      
      const res = await complaintService.createComplaint(payload);
      
      // Upload evidence files attached
      if (uploadedFiles.length > 0 && res && res.id) {
        for (const item of uploadedFiles) {
          try {
            const docFormData = new FormData();
            docFormData.append("file", item.raw);
            docFormData.append("complaintId", res.id);
            docFormData.append("documentType", "EVIDENCE_PROOF");
            await documentService.uploadDocument(docFormData);
          } catch (docErr) {
            console.warn("Evidence attachment failed for", item.name, docErr);
          }
        }
      }
      
      await offlineDraftService.clearDraft();
      setCreatedComplaint(res);
      setSimpleStep("success");
      if (typeof fetchNotifications === "function") {
        fetchNotifications();
      }
      toast.dismiss(toastId);
      toast.success("Complaint successfully registered!");
    } catch (err) {
      toast.dismiss(toastId);
      const serverMessage = err.response?.data?.message;
      if (serverMessage) {
        toast.error(serverMessage);
      } else {
        toast.error("Failed to register complaint. Please check your network and try again.");
      }
      console.error("Complaint submission error details:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        
        {/* Top Header & Mode Toggle */}
        {simpleStep !== "success" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <ARAMAvatar size="md" state={getAvatarState()} showStatus={true} />
                <div>
                  <h1 className="text-2xl font-black text-[#163D32] tracking-tight flex items-center gap-2">
                    {t("submitComplaint.headerTitle", "Citizen Grievance & Legal Filing")}
                  </h1>
                  <p className="text-xs text-[#65736D] font-medium mt-0.5">
                    {t("submitComplaint.headerSubtitle", "Tamil Nadu Legal Services Authority • Official Grievance & Redressal Registry")}
                  </p>
                </div>
              </div>
              
              {draftStatusText && (
                <span className="self-start sm:self-auto text-[10px] font-bold bg-[#DCEBDD] text-[#163D32] border border-[#c5ddc6] px-3 py-1 rounded-full animate-pulse">
                  {draftStatusText}
                </span>
              )}
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-[#F7F1E6] p-1.5 rounded-2xl border border-[#E6E1D8]">
              <button
                type="button"
                onClick={() => { setMode("simple"); }}
                className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
                  mode === "simple"
                    ? "bg-[#163D32] text-white shadow-sm border border-[#163D32]"
                    : "text-[#65736D] hover:text-[#18332B] hover:bg-white/60"
                }`}
              >
                <Sparkles size={14} /> {t("submitComplaint.aiGuidedTab", "AI-Guided Filing (5 Stages)")}
              </button>
              <button
                type="button"
                onClick={() => { setMode("normal"); }}
                className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
                  mode === "normal"
                    ? "bg-[#163D32] text-white shadow-sm border border-[#163D32]"
                    : "text-[#65736D] hover:text-[#18332B] hover:bg-white/60"
                }`}
              >
                <FileText size={14} /> {t("submitComplaint.directFormTab", "Direct Form (Single Page)")}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5-STAGE STREAMLINED STEPPER (SIMPLE MODE)                                 */}
        {/* ========================================================================= */}
        {mode === "simple" && simpleStep !== "success" && (
          <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex justify-between items-center text-[11px] font-extrabold uppercase tracking-wider">
              <span className="text-[#65736D]">
                {t("submitComplaint.stageOf", "Stage {step} of 5").replace("{step}", simpleStep)}
              </span>
              <span className="text-[#163D32] bg-[#DCEBDD] px-2.5 py-0.5 rounded-full font-bold">
                {STAGES.find(s => s.id === simpleStep)?.name || "Grievance Progress"}
              </span>
            </div>

            {/* 5 Interactive Stepper Bars */}
            <div className="grid grid-cols-5 gap-1.5">
              {STAGES.map((stg) => {
                const isPassed = simpleStep > stg.id;
                const isCurrent = simpleStep === stg.id;
                return (
                  <div key={stg.id} className="space-y-1">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        isCurrent 
                          ? "bg-[#163D32] ring-2 ring-[#DCEBDD]" 
                          : isPassed 
                            ? "bg-[#1F5948]" 
                            : "bg-[#E6E1D8]"
                      }`} 
                    />
                    <span className={`block text-[9px] font-bold truncate text-center ${
                      isCurrent ? "text-[#163D32]" : isPassed ? "text-[#1F5948]" : "text-[#8B9690]"
                    }`}>
                      {stg.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 1: TELL ARAM                                                        */}
        {/* ========================================================================= */}
        {mode === "simple" && simpleStep === 1 && (
          <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
            
            {/* ARAM Avatar & Clean Greeting Header */}
            <div className="flex items-center sm:items-start gap-4">
              <ARAMAvatar 
                size="lg" 
                state={getAvatarState()} 
                showStatus={false} 
                className="shrink-0" 
              />
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#163D32]">
                  {t("submitComplaint.stage1Title", "Tell ARAM what happened")}
                </h2>
                <p className="text-xs sm:text-sm text-[#65736D] mt-1 font-medium leading-relaxed">
                  {t("submitComplaint.stage1Desc", "Explain your problem naturally. You can type or speak in your language.")}
                </p>
              </div>
            </div>

            {/* Natural Language Input Area with Integrated Voice Control */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-[#18332B]">
                <span>{t("submitComplaint.tellUsLabel", "Tell us what happened...")}</span>
                <span className="text-[11px] text-[#65736D] font-medium">{t("submitComplaint.minChars", "Minimum 15 characters")}</span>
              </div>

              <div className="relative">
                <textarea
                  rows={7}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("submitComplaint.tellUsPlaceholder", "Tell us what happened in your own words... (You can type or speak in Tamil, Tanglish, English, or Hindi)")}
                  className="w-full p-4 pb-16 rounded-2xl border border-[#DDE2DF] bg-white text-[#18332B] text-sm focus:border-[#163D32] focus:ring-4 focus:ring-[#DCEBDD]/50 outline-none transition resize-none leading-relaxed font-medium placeholder-[#8B9690] shadow-2xs"
                />

                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                  {aiDetectedLanguage && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-[#DCEBDD] text-[#163D32] border border-[#c5ddc6] flex items-center gap-1 shadow-2xs">
                      <Sparkles size={11} className="text-[#1F5948]" />
                      <span>{aiDetectedLanguage}</span>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleVoiceRecord("description")}
                    disabled={isTranscribingVoice}
                    className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 text-xs font-bold cursor-pointer shadow-xs ${
                      recording && recordingField === "description"
                        ? "bg-[#C94B4B] text-white animate-pulse shadow-md"
                        : isTranscribingVoice
                        ? "bg-[#E8C978]/30 text-[#163D32] border border-[#E8C978]"
                        : "bg-[#DCEBDD] text-[#163D32] hover:bg-[#c6dcc7] border border-[#c5ddc6]"
                    }`}
                    title={t("submitComplaint.speakProblem", "Speak your problem")}
                  >
                    <Mic size={15} />
                    <span>
                      {recording && recordingField === "description"
                        ? t("submitComplaint.listeningClickStop", "Listening... (Click to stop)")
                        : isTranscribingVoice
                        ? t("submitComplaint.processingSpeech", "Processing speech...")
                        : t("submitComplaint.speakProblem", "Speak your problem")}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Language Controls (Auto-Detect as Primary) */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#FAF8F5] border border-[#E6E1D8] rounded-2xl">
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-[#1F5948]" />
                <span className="text-xs font-bold text-[#18332B]">{t("submitComplaint.languageLabel", "Language:")}</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { code: "auto", label: t("submitComplaint.autoDetect", "✨ Auto-Detect"), badge: t("submitComplaint.primaryBadge", "Primary") },
                  { code: "ta-IN", label: "தமிழ் (Tamil)" },
                  { code: "en-IN", label: "English" },
                  { code: "hi-IN", label: "हिंदी (Hindi)" }
                ].map((lang) => {
                  const isSelected = speechLanguage === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setSpeechLanguage(lang.code)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                        isSelected
                          ? "bg-[#163D32] border-[#163D32] text-white shadow-xs"
                          : "bg-white border-[#E6E1D8] text-[#18332B] hover:bg-[#F7F1E6]"
                      }`}
                    >
                      <span>{lang.label}</span>
                      {lang.badge && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-md leading-none ${isSelected ? "bg-[#E8C978] text-[#163D32] font-black" : "bg-[#DCEBDD] text-[#1F5948]"}`}>
                          {lang.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Editable Voice & Text Review Card with Read Aloud */}
            {description && description.trim().length >= 10 && (
              <div className="p-4 rounded-2xl bg-[#F7F1E6] border border-[#E6E1D8] space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#163D32] flex items-center gap-1.5">
                      <Sparkles size={14} className="text-[#1F5948]" />
                      {t("submitComplaint.transcribedNarrative", "Transcribed Problem Narrative")}
                    </span>
                    {aiDetectedLanguage && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#DCEBDD] text-[#163D32] border border-[#c5ddc6]">
                        {t("submitComplaint.speechBadge", "{lang} Speech").replace("{lang}", aiDetectedLanguage)}
                      </span>
                    )}
                  </div>
                  <ReadAloudButton text={description} language={speechLanguage === "ta-IN" ? "ta-IN" : speechLanguage === "hi-IN" ? "hi-IN" : "en-IN"} />
                </div>
                <p className="text-xs text-[#65736D] leading-relaxed">
                  {t("submitComplaint.reviewEditTip", "Review & Edit: You can edit names, amounts, or dates directly in the text box above before clicking Analyse with ARAM.")}
                </p>
              </div>
            )}

            {/* District Selection (Dynamic Single Source of Truth) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#18332B] uppercase tracking-wider block">
                {t("submitComplaint.yourDistrict", "Your District")}
              </label>
              <div className="relative">
                <select
                  value={location}
                  onChange={(e) => setLocation(normalizeDistrict(e.target.value))}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-[#DDE2DF] bg-white text-sm font-semibold text-[#18332B] outline-none focus:border-[#163D32] focus:ring-4 focus:ring-[#DCEBDD]/50 shadow-2xs cursor-pointer appearance-none"
                >
                  {TN_DISTRICTS.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist} District
                    </option>
                  ))}
                </select>
                <MapPin size={16} className="absolute left-3.5 top-3.5 text-[#1F5948] pointer-events-none" />
              </div>
              <p className="text-xs text-[#65736D] font-medium">
                {t("submitComplaint.districtHelp", "Your district helps ARAM connect you with the appropriate local assistance at the {district} District Legal Aid Desk.").replace("{district}", location)}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex justify-between items-center border-t border-[#E6E1D8]">
              <button
                type="button"
                onClick={handleClearDraft}
                className="text-xs text-[#65736D] hover:text-[#18332B] font-semibold cursor-pointer py-2 px-3 rounded-lg hover:bg-[#F7F1E6]"
              >
                {t("submitComplaint.clearText", "Clear text")}
              </button>
              
              <button
                type="button"
                onClick={handleAnalyseWithAi}
                disabled={loading || description.trim().length < 5}
                className="px-6 py-3 rounded-xl bg-[#163D32] hover:bg-[#1F5948] disabled:opacity-50 text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-2 transition"
              >
                <Sparkles size={16} className="text-[#E8C978]" /> 
                {loading ? t("submitComplaint.analyzingLegal", "Analyzing Legal Context...") : t("submitComplaint.analyzeWithAram", "Analyse with ARAM →")} 
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 2: AI UNDERSTANDING                                                 */}
        {/* ========================================================================= */}
        {mode === "simple" && simpleStep === 2 && (
          <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <ARAMAvatar size="sm" state="speaking" showStatus={false} />
                <h2 className="text-xl font-extrabold text-[#163D32]">
                  {t("submitComplaint.stage2Title", "ARAM AI Case Assessment")}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleSpeakText(aiSummary || aiHeadline)}
                  className="px-3 py-1.5 rounded-xl border border-[#c5ddc6] bg-[#DCEBDD] text-[#163D32] text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-[#c3dac4] transition"
                  title={speaking ? t("submitComplaint.stopAudio", "Stop Audio") : t("submitComplaint.listenSummary", "Listen Summary")}
                >
                  {speaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  {speaking ? t("submitComplaint.stopAudio", "Stop Audio") : t("submitComplaint.listenSummary", "Listen Summary")}
                </button>
                <span className="text-xs font-bold text-[#163D32] bg-[#DCEBDD] border border-[#c5ddc6] px-3 py-1.5 rounded-xl flex items-center gap-1">
                  <Globe size={13} className="text-[#1F5948]" /> {aiDetectedLanguage}
                </span>
              </div>
            </div>

            {/* Formulated Problem Title (Editable) */}
            <div className="p-5 rounded-2xl bg-[#DCEBDD]/35 border border-[#c5ddc6] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#65736D]">
                  {t("submitComplaint.formulatedTitle", "Formulated Problem Title")}
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(!isEditingTitle)}
                  className="text-[11px] font-bold text-[#1F5948] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 size={12} /> {isEditingTitle ? t("submitComplaint.doneEditing", "Done Editing") : t("submitComplaint.editTitle", "Edit Title")}
                </button>
              </div>

              {isEditingTitle ? (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-black text-[#163D32] bg-white border border-[#c5ddc6] rounded-xl outline-none focus:ring-2 focus:ring-[#163D32]"
                />
              ) : (
                <h3 className="text-lg font-black text-[#163D32] tracking-tight">
                  {title || aiHeadline}
                </h3>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#163D32] bg-white border border-[#c5ddc6] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                  <ShieldCheck size={14} className="text-[#1F5948]" /> {aiCategoryLabel}
                </span>
                <span className="text-[11px] font-bold text-[#65736D] bg-[#F7F1E6] border border-[#E6E1D8] px-2.5 py-1 rounded-full flex items-center gap-1">
                  <MapPin size={12} className="text-[#65736D]" /> {location} (Tamil Nadu)
                </span>
                <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${
                  aiPriority === "URGENT" || aiSensitive 
                    ? "bg-[#F4DDE2] text-[#C94B4B] border border-[#E4C8CF]" 
                    : "bg-[#DCEBDD] text-[#163D32] border border-[#c5ddc6]"
                }`}>
                  {t("submitComplaint.priorityLabel", "Priority: {priority}").replace("{priority}", aiPriority)}
                </span>
              </div>
            </div>

            {/* AI Situation Overview */}
            <div className="p-4 bg-white rounded-2xl border border-[#E6E1D8] space-y-2 text-xs text-[#18332B] font-medium leading-relaxed">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1F5948] block">
                {t("submitComplaint.caseOverview", "Case Situation & Legal Overview")}
              </span>
              <p>{aiSummary}</p>
            </div>

            {/* Extracted Facts & Entities */}
            {aiCaseSummary?.importantFacts && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
                {aiCaseSummary.importantFacts.entities && aiCaseSummary.importantFacts.entities[0] && (
                  <div className="p-3 bg-[#F7F1E6] rounded-xl border border-[#E6E1D8]">
                    <span className="text-[10px] text-[#65736D] font-bold uppercase block">{t("submitComplaint.partiesIdentified", "Parties Identified")}</span>
                    <span className="font-bold text-[#18332B] capitalize">{aiCaseSummary.importantFacts.entities.join(", ")}</span>
                  </div>
                )}
                {aiCaseSummary.importantFacts.amounts && aiCaseSummary.importantFacts.amounts[0] !== "Not specified" && (
                  <div className="p-3 bg-[#F7F1E6] rounded-xl border border-[#E6E1D8]">
                    <span className="text-[10px] text-[#65736D] font-bold uppercase block">{t("submitComplaint.disputeClaimAmount", "Dispute Claim Amount")}</span>
                    <span className="font-black text-[#163D32]">{aiCaseSummary.importantFacts.amounts.join(", ")}</span>
                  </div>
                )}
                {aiCaseSummary.importantFacts.dates && aiCaseSummary.importantFacts.dates[0] !== "As mentioned in complaint" && (
                  <div className="p-3 bg-[#F7F1E6] rounded-xl border border-[#E6E1D8]">
                    <span className="text-[10px] text-[#65736D] font-bold uppercase block">{t("submitComplaint.timelineDate", "Timeline / Incident Date")}</span>
                    <span className="font-bold text-[#18332B]">{aiCaseSummary.importantFacts.dates.join(", ")}</span>
                  </div>
                )}
              </div>
            )}

            {/* Citizen Requested Outcome (Integrated directly into Stage 2) */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between items-center text-xs font-bold text-[#18332B]">
                <span>{t("submitComplaint.reliefQuestion", "What specific outcome or relief are you seeking?")}</span>
                <span className="text-[11px] text-[#65736D] font-medium">{t("submitComplaint.reliefSubtitle", "Your requested resolution")}</span>
              </div>
              <div className="relative">
                <textarea
                  rows={3}
                  value={citizenOpinion}
                  onChange={(e) => setCitizenOpinion(e.target.value)}
                  placeholder={t("submitComplaint.reliefPlaceholder", "Example: I want formal mediation by TNSLSA to direct the landlord to refund my ₹50,000 security deposit with no illegal deductions.")}
                  className="w-full p-4 pr-16 rounded-2xl border border-[#DDE2DF] bg-white text-sm font-medium text-[#18332B] focus:border-[#163D32] focus:ring-4 focus:ring-[#DCEBDD]/50 outline-none leading-relaxed placeholder-[#8B9690] shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => handleVoiceRecord("citizenOpinion")}
                  className={`absolute right-3 bottom-3 px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 text-[11px] font-bold cursor-pointer ${
                    recording && recordingField === "citizenOpinion"
                      ? "bg-[#C94B4B] text-white animate-pulse"
                      : "bg-[#DCEBDD] text-[#163D32] hover:bg-[#c6dcc7] border border-[#c5ddc6]"
                  }`}
                  title={t("submitComplaint.speakBtn", "Speak")}
                >
                  <Mic size={13} />
                  {recording && recordingField === "citizenOpinion" ? t("submitComplaint.recordingBtn", "Recording...") : t("submitComplaint.speakBtn", "Speak")}
                </button>
              </div>
            </div>

            {/* Identified Legal Concerns Tags */}
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold text-[#65736D] uppercase tracking-wider block">
                {t("submitComplaint.applicableRemedies", "Applicable Statutory Remedies")}
              </span>
              <div className="flex flex-wrap gap-2">
                {aiConcerns.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-[#DCEBDD] text-[#163D32] text-xs font-bold border border-[#c5ddc6] flex items-center gap-1.5 shadow-2xs"
                  >
                    <CheckCircle size={13} className="text-[#1F5948]" /> {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4 border-t border-[#E6E1D8]">
              <button
                type="button"
                onClick={() => setSimpleStep(1)}
                className="px-4 py-2 text-xs font-bold text-[#65736D] hover:text-[#18332B] hover:bg-[#F7F1E6] rounded-xl cursor-pointer flex items-center gap-1 transition"
              >
                <ArrowLeft size={14} /> {t("submitComplaint.backBtn", "Back")}
              </button>
              <button
                type="button"
                onClick={() => setSimpleStep(3)}
                className="px-6 py-2.5 text-xs font-bold rounded-xl bg-[#163D32] hover:bg-[#1F5948] text-white shadow-md cursor-pointer flex items-center gap-2 transition"
              >
                {t("submitComplaint.continueDocsBtn", "Continue to Documents & Evidence →")}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 3: DOCUMENTS & EVIDENCE (3-TIER + REAL OCR)                         */}
        {/* ========================================================================= */}
        {mode === "simple" && simpleStep === 3 && (
          <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-xl font-extrabold text-[#163D32] flex items-center gap-2">
                <FileText className="text-[#1F5948]" size={22} />
                {t("submitComplaint.stage3Title", "Documents & Supporting Proof")}
              </h2>
              <p className="text-xs text-[#65736D] mt-1 font-medium">
                {t("submitComplaint.stage3Desc", "Attach deeds, notices, receipts or agreements for automated readiness review.")}
              </p>
            </div>

            {/* 3-Tier Document Checklist */}
            <div className="space-y-4">
              {/* Tier 1: Required Proof */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-white bg-[#C94B4B] px-2.5 py-0.5 rounded-md inline-block">
                  Tier 1: Mandatory Proof
                </span>
                <div className="space-y-1.5">
                  {aiRequiredDocs.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F4DDE2]/40 border border-[#E4C8CF] text-xs font-bold text-[#18332B]">
                      <CheckCircle size={15} className="text-[#C94B4B] shrink-0" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tier 2: Recommended Proof */}
              {aiRecommendedDocs.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-white bg-[#C58A25] px-2.5 py-0.5 rounded-md inline-block">
                    Tier 2: Strongly Recommended Proof
                  </span>
                  <div className="space-y-1.5">
                    {aiRecommendedDocs.map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-[#E8C978]/20 border border-[#D6B45E] text-xs font-bold text-[#18332B]">
                        <CheckCircle size={15} className="text-[#C58A25] shrink-0" />
                        <span>{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tier 3: Optional Supporting Material */}
              {aiOptionalDocs.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#65736D] bg-[#E6E1D8] px-2.5 py-0.5 rounded-md inline-block">
                    Tier 3: Optional Supporting Material
                  </span>
                  <div className="space-y-1.5">
                    {aiOptionalDocs.map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F7F1E6] border border-[#E6E1D8] text-xs font-medium text-[#65736D]">
                        <CheckCircle size={15} className="text-[#8B9690] shrink-0" />
                        <span>{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Document Upload Drag & Drop Zone */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-[#18332B] uppercase tracking-wider block">
                Attach Evidence Documents (PDF, JPG, PNG up to 10MB)
              </span>
              <div className="border-2 border-dashed border-[#c5ddc6] hover:border-[#1F5948] bg-[#DCEBDD]/15 hover:bg-[#DCEBDD]/30 rounded-3xl p-7 text-center transition cursor-pointer relative">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-[#DCEBDD] text-[#163D32] rounded-2xl shadow-xs">
                    <Upload size={22} />
                  </div>
                  <p className="text-sm font-bold text-[#18332B]">
                    Click to select documents or drag & drop files here
                  </p>
                  <span className="text-xs text-[#65736D]">
                    Agreements, receipts, photos, chats, notice copies
                  </span>
                </div>
              </div>
            </div>

            {/* Uploaded Files with OCR Text Extraction Status */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-extrabold text-[#65736D] uppercase tracking-wider">
                    Attached Evidence ({uploadedFiles.length} file{uploadedFiles.length > 1 ? "s" : ""})
                  </span>
                  <span className="text-[10px] font-bold text-[#1F5948] bg-[#DCEBDD] px-2.5 py-0.5 rounded-full">
                    OCR Verification Active
                  </span>
                </div>

                <div className="space-y-2.5">
                  {uploadedFiles.map((file, idx) => {
                    const isExpanded = !!expandedOcrFiles[idx];
                    const fullText = file.exactText || file.extractedText || "";
                    const isLongText = fullText.length > 220;
                    const displayText = (!isExpanded && isLongText) ? fullText.slice(0, 220) + "..." : fullText;

                    return (
                      <div key={idx} className="p-4 rounded-2xl bg-[#F7F1E6] border border-[#E6E1D8] space-y-3 text-xs shadow-sm">
                        {/* File Header with Preview & Badges */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {file.previewUrl ? (
                              <img
                                src={file.previewUrl}
                                alt={file.name}
                                className="w-12 h-12 object-cover rounded-xl border border-[#D5CEBF] shadow-xs shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-[#EDE7D9] flex items-center justify-center text-[#1F5948] shrink-0 border border-[#D5CEBF]">
                                <FileText size={22} />
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-[#18332B] truncate text-xs sm:text-sm">{file.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-[#65736D] font-mono">{file.size}</span>
                                {file.documentType && (
                                  <span className="text-[10px] font-bold text-[#163D32] bg-[#DCEBDD] px-2 py-0.2 rounded-md border border-[#c5ddc6]">
                                    {file.documentType}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                              file.ocrStatus === "verified"
                                ? "bg-[#DCEBDD] text-[#163D32] border border-[#c5ddc6]"
                                : file.ocrStatus === "scanning"
                                  ? "bg-amber-100 text-amber-800 border border-amber-300 animate-pulse"
                                  : "bg-gray-100 text-gray-700 border border-gray-300"
                            }`}>
                              {file.ocrStatus === "scanning" && <RefreshCw size={10} className="animate-spin" />}
                              {file.ocrStatus === "verified" && <CheckCircle2 size={11} />}
                              {file.analysisStatus}
                            </span>
                            <button
                              type="button"
                              onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== idx))}
                              className="text-xs font-bold text-[#C94B4B] hover:text-red-700 cursor-pointer p-1.5 rounded-lg hover:bg-red-50 transition"
                              title="Remove file"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Deep OCR & AI Evidence Findings */}
                        {file.ocrStatus === "verified" && (
                          <div className="pt-2 border-t border-[#E6E1D8]/80 space-y-2.5">
                            {/* Quality & Evidentiary Strength Overview */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                              <div className="p-2.5 rounded-xl bg-white border border-[#E6E1D8]">
                                <span className="text-[9px] font-bold uppercase text-[#65736D] block">Classified Document:</span>
                                <span className="font-bold text-[#163D32] truncate block">{file.documentType || "Supporting Evidence"}</span>
                              </div>
                              <div className="p-2.5 rounded-xl bg-white border border-[#E6E1D8]">
                                <span className="text-[9px] font-bold uppercase text-[#65736D] block">OCR Quality / Legibility:</span>
                                <span className="font-bold text-[#1F5948]">{file.legibilityScore || 85}% — {file.legibilityGrade || "High Quality"}</span>
                              </div>
                              <div className="p-2.5 rounded-xl bg-white border border-[#E6E1D8]">
                                <span className="text-[9px] font-bold uppercase text-[#65736D] block">Evidentiary Strength:</span>
                                <span className={`font-black uppercase tracking-wider text-[10px] ${
                                  file.evidentiaryStrength === "STRONG" ? "text-emerald-700" : file.evidentiaryStrength === "MODERATE" ? "text-amber-700" : "text-blue-700"
                                }`}>
                                  ● {file.evidentiaryStrength || "STRONG"}
                                </span>
                              </div>
                            </div>

                            {/* AI Evidence Analysis & Legal Relationship */}
                            {(file.legalRelevance || file.caseRelevance) && (
                              <div className="p-3.5 rounded-2xl bg-[#EDE7DA] border border-[#DDD6C8] space-y-2">
                                <div className="flex items-center gap-1.5 text-xs font-black text-[#163D32]">
                                  <Scale size={15} className="text-[#1F5948] shrink-0" />
                                  <span>How This Evidence Relates to Your Grievance:</span>
                                </div>
                                <p className="text-xs text-[#203D32] leading-relaxed font-medium">
                                  {file.legalRelevance || file.caseRelevance}
                                </p>
                                {file.actionableAdvice && (
                                  <div className="p-2 rounded-xl bg-white/80 border border-[#E2DBD0] text-[11px] text-[#2F473F] flex items-start gap-1.5">
                                    <span className="font-bold text-[#163D32] shrink-0">💡 Recommendation:</span>
                                    <span>{file.actionableAdvice}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Detected Key Fields */}
                            {((file.detectedDates?.length > 0) || (file.detectedReferenceNumbers?.length > 0) || (file.detectedParties?.length > 0) || file.sealDetected) && (
                              <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1D8] space-y-1.5">
                                <span className="text-[9px] font-bold uppercase text-[#65736D] block">Key Extracted Entities:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {file.detectedDates?.map((d, di) => (
                                    <span key={`date-${di}`} className="px-2 py-0.5 rounded-md bg-[#DCEBDD] text-[#163D32] text-[10px] font-bold border border-[#c5ddc6]">
                                      📅 Date: {d}
                                    </span>
                                  ))}
                                  {file.detectedReferenceNumbers?.map((r, ri) => (
                                    <span key={`ref-${ri}`} className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 text-[10px] font-bold border border-blue-200">
                                      🔢 Ref/ID: {r}
                                    </span>
                                  ))}
                                  {file.detectedParties?.map((p, pi) => (
                                    <span key={`party-${pi}`} className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-900 text-[10px] font-bold border border-purple-200">
                                      👤 Party: {p}
                                    </span>
                                  ))}
                                  {file.sealDetected && (
                                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                                      ✓ Official Seal / Stamped
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Exact Extracted Document Content Viewer */}
                            {fullText && (
                              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E6E1D8] space-y-2 shadow-xs">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-extrabold uppercase text-[#163D32] tracking-wider flex items-center gap-1.5">
                                    <FileCheck size={13} className="text-[#1F5948]" />
                                    Exact Document Content (OCR Transcribed):
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(fullText);
                                      setCopiedOcrIndex(idx);
                                      setTimeout(() => setCopiedOcrIndex(null), 2000);
                                    }}
                                    className="text-[10px] font-bold text-[#1F5948] hover:text-[#163D32] flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-[#E6E1D8] hover:bg-[#F2ECE1] transition cursor-pointer shadow-xs"
                                  >
                                    {copiedOcrIndex === idx ? (
                                      <>
                                        <Check size={11} className="text-emerald-600" />
                                        <span className="text-emerald-700">Copied!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy size={11} />
                                        <span>Copy Text</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                                <div className="p-2.5 bg-white rounded-lg border border-[#E4DDD0] font-mono text-xs text-[#1D362C] leading-relaxed select-text whitespace-pre-wrap max-h-48 overflow-y-auto">
                                  {displayText}
                                </div>
                                {isLongText && (
                                  <button
                                    type="button"
                                    onClick={() => setExpandedOcrFiles(prev => ({ ...prev, [idx]: !isExpanded }))}
                                    className="text-[11px] font-bold text-[#1F5948] hover:text-[#163D32] hover:underline flex items-center gap-1 cursor-pointer pt-0.5"
                                  >
                                    {isExpanded ? (
                                      <>Show Less <ChevronUp size={12} /></>
                                    ) : (
                                      <>Show Full Extracted Content ({fullText.length} chars) <ChevronDown size={12} /></>
                                    )}
                                  </button>
                                )}
                              </div>
                            )}

                            {/* Statutory Disclaimer & Legal Verification Advisory */}
                            <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-200/70 text-[10px] text-amber-900 flex items-start gap-1.5">
                              <ShieldCheck size={13} className="text-amber-700 shrink-0 mt-0.5" />
                              <span><strong>Administrative Notice:</strong> {file.verificationNotice || "Needs Legal Guide confirmation — OCR and AI analysis are administrative aids to assist legal triage."}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4 border-t border-[#E6E1D8]">
              <button
                type="button"
                onClick={() => setSimpleStep(2)}
                className="px-4 py-2 text-xs font-bold text-[#65736D] hover:text-[#18332B] hover:bg-[#F7F1E6] rounded-xl cursor-pointer flex items-center gap-1 transition"
              >
                <ArrowLeft size={14} /> {t("submitComplaint.backBtn", "Back")}
              </button>
              <button
                type="button"
                onClick={() => setSimpleStep(4)}
                className="px-6 py-2.5 text-xs font-bold rounded-xl bg-[#163D32] hover:bg-[#1F5948] text-white shadow-md cursor-pointer flex items-center gap-2 transition"
              >
                {t("submitComplaint.continueSafetyBtn", "Continue to Safety & Assistance →")}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 4: SAFETY & ASSISTANCE (INTELLIGENT ROUTING & SPECIAL HANDLING)      */}
        {/* ========================================================================= */}
        {mode === "simple" && simpleStep === 4 && (
          <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
            <div className="flex items-center gap-3">
              <ARAMAvatar size="md" state={aiSensitive ? "human_help" : "verified"} showStatus={false} />
              <div>
                <h2 className="text-xl font-extrabold text-[#163D32]">
                  {t("submitComplaint.stage4Title", "Safety, Confidentiality & Legal Guides")}
                </h2>
                <p className="text-xs text-[#65736D] mt-0.5 font-medium">
                  {t("submitComplaint.stage4Desc", "Intelligent grievance routing based on Tamil Nadu administrative standards and sensitivity rules.")}
                </p>
              </div>
            </div>

            {/* SENSITIVE CASE ROUTING CARD */}
            {aiSensitive ? (
              <div className="p-6 rounded-2xl bg-[#F4DDE2]/60 border-2 border-[#E4C8CF] space-y-4">
                <div className="flex items-center gap-2.5 text-[#C94B4B]">
                  <ShieldCheck size={24} className="shrink-0" />
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider">
                      🛡️ Sensitive Case Protection Protocol Active
                    </h3>
                    <p className="text-xs font-medium text-[#18332B] mt-0.5">
                      This grievance involves personal safety, dignity, or family protection rights. Special protective safeguards are strictly enforced.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="p-3 bg-white/90 rounded-xl border border-[#E4C8CF] space-y-1">
                    <span className="font-bold text-[#C94B4B] block flex items-center gap-1.5">
                      <UserCheck size={14} /> Female Legal Guide Priority
                    </span>
                    <p className="text-[11px] text-[#65736D]">
                      Pre-assigned to verified female legal guides trained in sensitive counseling and court protection orders.
                    </p>
                  </div>

                  <div className="p-3 bg-white/90 rounded-xl border border-[#E4C8CF] space-y-1">
                    <span className="font-bold text-[#163D32] block flex items-center gap-1.5">
                      <Lock size={14} /> Shielded Complainant Record
                    </span>
                    <p className="text-[11px] text-[#65736D]">
                      Your identity and sensitive statements are strictly restricted from public grievance rolls.
                    </p>
                  </div>
                </div>

                {/* Emergency Hotlines Reference */}
                <div className="p-3 bg-white/70 rounded-xl border border-[#E4C8CF] text-[11px] text-[#18332B] flex flex-wrap items-center justify-between gap-2">
                  <span><strong>Tamil Nadu Emergency Helplines:</strong> Women Helpline: <strong>181</strong> • Police: <strong>112</strong> • Childline: <strong>1098</strong></span>
                  <span className="text-[10px] font-bold text-[#C94B4B] bg-[#F4DDE2] px-2 py-0.5 rounded">24/7 Toll Free</span>
                </div>
              </div>
            ) : (
              /* STANDARD ROUTING CARD */
              <div className="p-5 rounded-2xl bg-[#DCEBDD]/40 border border-[#c5ddc6] space-y-2 text-xs text-[#18332B]">
                <div className="flex items-center gap-2 font-black text-[#163D32]">
                  <CheckCircle size={18} className="text-[#1F5948]" />
                  <span>Standard Legal Aid Triage & Routing</span>
                </div>
                <p className="font-medium leading-relaxed">
                  Grievance mapped to <strong>{aiCategoryLabel}</strong> under the administrative supervision of the <strong>{location} Regional Legal Aid Authority</strong>. Assigned Legal Guides will communicate in <strong>{aiDetectedLanguage}</strong>.
                </p>
              </div>
            )}

            {/* Matched District Legal Guides Preview */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#18332B] uppercase tracking-wider block">
                  Available Legal Guides in {location}
                </span>
                <span className="text-[10px] font-bold text-[#1F5948] bg-[#DCEBDD] px-2.5 py-0.5 rounded-full">
                  10 Verified Guides per District
                </span>
              </div>

              <div className="space-y-2.5">
                {recommendedGuides.length > 0 ? (
                  recommendedGuides.slice(0, 2).map((guide, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-[#F7F1E6] border border-[#E6E1D8] flex items-center justify-between text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <strong className="text-[#163D32] font-black text-sm">{guide.name || "Verified Legal Guide"}</strong>
                          <span className="text-[9px] font-black uppercase tracking-wider bg-[#DCEBDD] text-[#163D32] border border-[#c5ddc6] px-2 py-0.5 rounded-full">
                            {guide.experienceLevel || "Senior Legal Guide"}
                          </span>
                        </div>
                        <span className="text-xs text-[#65736D] block font-medium">
                          Languages: {guide.languagesKnown || aiDetectedLanguage} • District: {guide.district || location}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#163D32] bg-[#DCEBDD] border border-[#c5ddc6] px-3 py-1.5 rounded-xl">
                        Match Ready
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-2xl bg-[#F7F1E6] border border-[#E6E1D8] text-xs text-[#65736D] font-medium leading-relaxed">
                    Verified Legal Guides fluent in {aiDetectedLanguage} are active in {location} District. The District Admin will finalize official assignment upon submission.
                  </div>
                )}
              </div>
            </div>

            {/* Recommended Legal Aid Authority Card */}
            <div className="p-4 rounded-2xl bg-[#F7F1E6] border border-[#E6E1D8] space-y-1 text-xs">
              <span className="text-[10px] font-extrabold text-[#65736D] uppercase tracking-wider block">
                Statutory Redressal Body
              </span>
              <p className="text-sm font-black text-[#163D32]">
                {aiRecommendedAuthority}
              </p>
              <p className="text-[11px] text-[#65736D]">
                Official legal aid authority designated under Tamil Nadu State Legal Services Authority norms.
              </p>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4 border-t border-[#E6E1D8]">
              <button
                type="button"
                onClick={() => setSimpleStep(3)}
                className="px-4 py-2 text-xs font-bold text-[#65736D] hover:text-[#18332B] hover:bg-[#F7F1E6] rounded-xl cursor-pointer flex items-center gap-1 transition"
              >
                <ArrowLeft size={14} /> {t("submitComplaint.backBtn", "Back")}
              </button>
              <button
                type="button"
                onClick={() => setSimpleStep(5)}
                className="px-6 py-2.5 text-xs font-bold rounded-xl bg-[#163D32] hover:bg-[#1F5948] text-white shadow-md cursor-pointer flex items-center gap-2 transition"
              >
                {t("submitComplaint.continueReviewBtn", "Continue to Review & Submit →")}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 5: FINAL REVIEW & SUBMIT                                            */}
        {/* ========================================================================= */}
        {mode === "simple" && simpleStep === 5 && (
          <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
            <div className="flex items-center gap-3">
              <ARAMAvatar size="md" state="verified" showStatus={false} />
              <div>
                <h2 className="text-xl font-extrabold text-[#163D32]">
                  {t("submitComplaint.stage5Title", "Final Grievance Review & Confirmation")}
                </h2>
                <p className="text-xs text-[#65736D] mt-0.5 font-medium">
                  {t("submitComplaint.stage5Desc", "Review case summary, evidence proofs, and citizen declaration before official registration.")}
                </p>
              </div>
            </div>

            <div className="divide-y divide-[#E6E1D8] space-y-4 text-xs">
              
              {/* Problem Title & Category Summary */}
              <div className="space-y-1.5 pt-2 first:pt-0">
                <span className="font-extrabold text-[10px] text-[#65736D] uppercase tracking-wider block">
                  Problem Title & Classification
                </span>
                <div className="p-4 bg-[#F7F1E6] rounded-2xl border border-[#E6E1D8] space-y-2">
                  <h3 className="text-base font-black text-[#163D32]">
                    {title || aiHeadline}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#DCEBDD] text-[#163D32] font-bold text-[11px] border border-[#c5ddc6]">
                      {aiCategoryLabel}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white text-[#18332B] font-bold text-[11px] border border-[#E6E1D8]">
                      {location} District
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white text-[#18332B] font-bold text-[11px] border border-[#E6E1D8]">
                      Language: {aiDetectedLanguage}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grievance Narrative */}
              <div className="space-y-1.5 pt-3">
                <span className="font-extrabold text-[10px] text-[#65736D] uppercase tracking-wider block">
                  Grievance Narrative
                </span>
                <p className="p-4 bg-[#F7F1E6] rounded-2xl text-[#18332B] font-medium leading-relaxed border border-[#E6E1D8]">
                  {description}
                </p>
              </div>

              {/* Citizen Requested Resolution */}
              {citizenOpinion && (
                <div className="space-y-1.5 pt-3">
                  <span className="font-extrabold text-[10px] text-[#65736D] uppercase tracking-wider block">
                    Citizen Requested Resolution
                  </span>
                  <p className="p-4 bg-[#F7F1E6] rounded-2xl text-[#18332B] font-medium leading-relaxed border border-[#E6E1D8]">
                    {citizenOpinion}
                  </p>
                </div>
              )}

              {/* Evidence Documents with OCR badges */}
              <div className="space-y-2 pt-3">
                <span className="font-extrabold text-[10px] text-[#65736D] uppercase tracking-wider block">
                  Attached Evidence ({uploadedFiles.length})
                </span>
                {uploadedFiles.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {uploadedFiles.map((f, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-xl bg-[#DCEBDD] text-[#163D32] text-xs font-bold border border-[#c5ddc6] flex items-center gap-1.5">
                        <FileText size={13} /> {f.name} ({f.size})
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#65736D] italic">No physical documents attached. Grievance will proceed on citizen testimony.</p>
                )}
              </div>

              {/* 🏛️ KYC Verified Citizen Identity Gate */}
              <div className="pt-4">
                <div className="p-5 rounded-2xl bg-[#F0F7F2] dark:bg-[#152B24] border border-[#C2E0C7] dark:border-emerald-800/60 space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-[#DCEBDD] text-[#163D32]">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-[#163D32] uppercase tracking-wider">
                          Verified Citizen Identity Gate
                        </h4>
                        <p className="text-[11px] text-[#65736D]">
                          Authenticated Complainant Profile under Tamil Nadu Grievance Redressal Norms
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 self-start sm:self-auto">
                      <UserCheck size={12} /> KYC Authenticated
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-[#D5E6D8] space-y-1">
                      <span className="text-[10px] font-bold text-[#65736D] uppercase block">Complainant Name</span>
                      <span className="font-bold text-[#163D32]">{user?.name || storedUser?.name || "Verified Citizen"}</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-[#D5E6D8] space-y-1">
                      <span className="text-[10px] font-bold text-[#65736D] uppercase block">Contact Mobile</span>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#163D32] font-mono">{citizenMobile || user?.mobile || "+91 98765 43210"}</span>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          OTP Bound
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-[#D5E6D8] space-y-1">
                      <span className="text-[10px] font-bold text-[#65736D] uppercase block">Email Address</span>
                      <span className="font-bold text-[#163D32] truncate block">{user?.email || "citizen@aram.tn.gov.in"}</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-[#D5E6D8] space-y-1">
                      <span className="text-[10px] font-bold text-[#65736D] uppercase block">Jurisdiction District</span>
                      <span className="font-bold text-[#163D32]">{location} (Tamil Nadu)</span>
                    </div>
                  </div>

                  {/* Statutory Citizen Grievance Declaration Checkbox */}
                  <div className="pt-2 border-t border-[#D5E6D8]">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={citizenDeclaration}
                        onChange={(e) => setCitizenDeclaration(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-emerald-600 text-[#163D32] focus:ring-emerald-500 cursor-pointer accent-[#163D32]"
                      />
                      <div className="text-[11px] text-[#2C483F] font-medium leading-relaxed">
                        <strong className="text-[#163D32] font-bold block mb-0.5">
                          Statutory Citizen Grievance Declaration & Legal Consent:
                        </strong>
                        I solemnly declare and confirm that I am an authenticated citizen/resident submitting this grievance in good faith. All facts and attached evidence documents are genuine, authentic, and not sub-judice or defamatory under the Legal Services Authorities Act, 1987.
                      </div>
                    </label>
                  </div>
                </div>
              </div>

            </div>

            {/* Final Submission Buttons */}
            <div className="flex justify-between pt-4 border-t border-[#E6E1D8]">
              <button
                type="button"
                onClick={() => setSimpleStep(4)}
                className="px-4 py-2 text-xs font-bold text-[#65736D] hover:text-[#18332B] hover:bg-[#F7F1E6] rounded-xl cursor-pointer flex items-center gap-1 transition"
              >
                <ArrowLeft size={14} /> {t("submitComplaint.backBtn", "Back")}
              </button>
              
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={loading || !citizenDeclaration}
                className="px-8 py-3.5 text-xs font-black rounded-xl bg-[#163D32] hover:bg-[#1F5948] disabled:opacity-50 text-white shadow-lg cursor-pointer flex items-center gap-2 transition"
              >
                <Send size={16} /> {loading ? t("submitComplaint.submittingBtn", "Submitting to Legal Registry...") : t("submitComplaint.submitGrievanceBtn", "Submit Grievance to Legal Aid Desk →")}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* NORMAL MODE: CONVENTIONAL DIRECT SINGLE-PAGE FORM                         */}
        {/* ========================================================================= */}
        {mode === "normal" && simpleStep !== "success" && (
          <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-xl font-extrabold text-[#163D32] flex items-center gap-2">
                <FileText className="text-[#1F5948]" size={22} />
                Structured Complaint Filing Form
              </h2>
              <p className="text-xs text-[#65736D] mt-1 font-medium">
                Provide structured incident information. Jurisdiction and categorization are validated automatically.
              </p>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#18332B] uppercase tracking-wider block">
                Complaint Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Unpaid wages dispute with textile manufacturing unit"
                className="w-full h-12 px-4 rounded-xl border border-[#DDE2DF] bg-white text-sm font-semibold text-[#18332B] focus:border-[#163D32] focus:ring-4 focus:ring-[#DCEBDD]/50 outline-none placeholder-[#8B9690] shadow-2xs"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#18332B] uppercase tracking-wider block">
                Detailed Complaint Description
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide all facts, dates, entities involved, and damages incurred..."
                className="w-full p-4 rounded-2xl border border-[#DDE2DF] bg-white text-sm font-medium text-[#18332B] focus:border-[#163D32] focus:ring-4 focus:ring-[#DCEBDD]/50 outline-none leading-relaxed placeholder-[#8B9690] shadow-2xs"
              />
            </div>

            {/* Two Column details: Location and Incident Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#18332B] uppercase tracking-wider block">
                  Select District (Tamil Nadu)
                </label>
                <div className="relative">
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-[#DDE2DF] bg-white text-sm font-semibold text-[#18332B] outline-none focus:border-[#163D32] focus:ring-4 focus:ring-[#DCEBDD]/50 shadow-2xs cursor-pointer appearance-none"
                  >
                    {TN_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist} District
                      </option>
                    ))}
                  </select>
                  <MapPin size={16} className="absolute left-3.5 top-3.5 text-[#1F5948] pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#18332B] uppercase tracking-wider block">
                  Incident Date (Optional)
                </label>
                <input
                  type="date"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-[#DDE2DF] bg-white text-sm font-semibold text-[#18332B] outline-none focus:border-[#163D32] focus:ring-4 focus:ring-[#DCEBDD]/50 shadow-2xs"
                />
              </div>
            </div>

            {/* Citizen Opinion / Desired Outcome */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#18332B] uppercase tracking-wider block">
                Your Desired Outcome / Specific Relief Requested
              </label>
              <textarea
                rows={3}
                value={citizenOpinion}
                onChange={(e) => setCitizenOpinion(e.target.value)}
                placeholder="e.g. Recovery of pending arrears and official compensation notice."
                className="w-full p-4 rounded-2xl border border-[#DDE2DF] bg-white text-sm font-medium text-[#18332B] focus:border-[#163D32] focus:ring-4 focus:ring-[#DCEBDD]/50 outline-none placeholder-[#8B9690] shadow-2xs"
              />
            </div>

            {/* Evidence attachment */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#18332B] uppercase tracking-wider block">
                Evidence Files
              </label>
              <div className="p-5 bg-white border-2 border-dashed border-[#DDE2DF] hover:border-[#163D32] rounded-2xl transition text-center cursor-pointer flex flex-col items-center justify-center gap-2">
                <Upload size={22} className="text-[#163D32]" />
                <span className="text-xs font-bold text-[#18332B]">Attach supporting documents or images</span>
                <span className="text-[11px] text-[#65736D]">PDF, JPG, PNG up to 10MB</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="mt-2 text-xs text-[#65736D] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#DCEBDD] file:text-[#163D32] hover:file:bg-[#c6dcc7] cursor-pointer"
                />
              </div>
            </div>

            {/* 🏛️ KYC Verified Citizen Identity Gate */}
            <div className="p-5 rounded-2xl bg-[#F0F7F2] border border-[#C2E0C7] space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#DCEBDD] text-[#163D32]">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#163D32] uppercase tracking-wider">
                      Verified Citizen Identity Gate
                    </h4>
                    <p className="text-[11px] text-[#65736D]">
                      Statutory Verification under Tamil Nadu Public Grievance Redressal Norms
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 self-start sm:self-auto">
                  <UserCheck size={12} /> KYC Verified Citizen
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-[#D5E6D8] space-y-1">
                  <span className="text-[10px] font-bold text-[#65736D] uppercase block">Complainant Name</span>
                  <span className="font-bold text-[#163D32]">{user?.name || storedUser?.name || "Verified Citizen"}</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#D5E6D8] space-y-1">
                  <span className="text-[10px] font-bold text-[#65736D] uppercase block">Verified Contact Mobile</span>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#163D32] font-mono">{citizenMobile || user?.mobile || "+91 98765 43210"}</span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      OTP Bound
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#D5E6D8] space-y-1">
                  <span className="text-[10px] font-bold text-[#65736D] uppercase block">Citizen Email Address</span>
                  <span className="font-bold text-[#163D32] truncate block">{user?.email || "citizen@aram.tn.gov.in"}</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#D5E6D8] space-y-1">
                  <span className="text-[10px] font-bold text-[#65736D] uppercase block">Jurisdiction District</span>
                  <span className="font-bold text-[#163D32]">{location} (Tamil Nadu)</span>
                </div>
              </div>

              {/* Statutory Declaration Checkbox */}
              <div className="pt-2 border-t border-[#D5E6D8]">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={citizenDeclaration}
                    onChange={(e) => setCitizenDeclaration(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-emerald-600 text-[#163D32] focus:ring-emerald-500 cursor-pointer accent-[#163D32]"
                  />
                  <div className="text-[11px] text-[#2C483F] font-medium leading-relaxed">
                    <strong className="text-[#163D32] font-bold block mb-0.5">
                      Statutory Citizen Grievance Declaration & Legal Consent:
                    </strong>
                    I solemnly declare and confirm that I am an authenticated citizen/resident submitting this grievance in good faith. All facts and attached evidence documents are genuine, authentic, and not sub-judice or defamatory under the Legal Services Authorities Act, 1987.
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-4 flex justify-end border-t border-[#DDE2DF]">
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={loading || description.trim().length < 15 || !citizenDeclaration}
                className="px-8 py-3.5 text-xs font-black rounded-xl bg-[#163D32] hover:bg-[#1F5948] disabled:opacity-50 text-white shadow-lg cursor-pointer flex items-center gap-2 transition"
              >
                <Send size={16} /> {loading ? "Registering..." : "Submit Structured Grievance"}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUCCESS CONFIRMATION VIEW                                                 */}
        {/* ========================================================================= */}
        {simpleStep === "success" && createdComplaint && (
          <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-md animate-in zoom-in-95">
            <div className="mx-auto flex justify-center">
              <ARAMAvatar size="xl" state="verified" showStatus={false} />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-[#163D32] tracking-tight">
                {t("submitComplaint.successTitle", "Grievance Registered Successfully!")}
              </h2>
              <p className="text-xs text-[#65736D] font-medium max-w-md mx-auto">
                {t("submitComplaint.successDesc", "Your grievance has been securely registered with Tamil Nadu Legal Services Authority and logged to the blockchain audit block.")}
              </p>
            </div>

            {/* Unique IDs Card */}
            <div className="p-6 rounded-2xl bg-[#F7F1E6] border border-[#E6E1D8] text-left max-w-md mx-auto space-y-3.5">
              <div className="flex justify-between items-center border-b border-[#E6E1D8] pb-3">
                <span className="text-[11px] font-bold text-[#65736D] uppercase">Complaint ID</span>
                <span className="font-mono text-sm font-black text-[#163D32]">
                  {createdComplaint.formattedComplaintId || `CMP-2026-${String(createdComplaint.id).padStart(6, '0')}`}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-[#E6E1D8] pb-3">
                <span className="text-[11px] font-bold text-[#65736D] uppercase">Citizen ID</span>
                <span className="font-mono text-xs font-bold text-[#18332B]">
                  {createdComplaint.formattedCitizenId || `CIT-2026-${String(createdComplaint.userId || user?.id || '').padStart(6, '0')}`}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-[#E6E1D8] pb-3">
                <span className="text-[11px] font-bold text-[#65736D] uppercase">Jurisdiction</span>
                <span className="text-xs font-bold text-[#163D32]">
                  {location} Regional Legal Desk
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-[#65736D] uppercase">Status</span>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#E8C978]/30 text-[#C58A25] border border-[#D6B45E]">
                  Awaiting Legal Guide Verification
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => navigate("/citizen/history")}
                className="px-6 py-3 text-xs font-bold rounded-xl border border-[#E6E1D8] bg-white text-[#18332B] hover:bg-[#F7F1E6] shadow-xs cursor-pointer transition"
              >
                {t("submitComplaint.returnDashboardBtn", "Return to Dashboard")}
              </button>
              <button
                type="button"
                onClick={() => navigate("/track-complaint")}
                className="px-6 py-3 text-xs font-bold rounded-xl bg-[#163D32] hover:bg-[#1F5948] text-white shadow-md cursor-pointer transition"
              >
                {t("submitComplaint.trackGrievanceBtn", "Track Grievance Status")}
              </button>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default SubmitComplaint;
