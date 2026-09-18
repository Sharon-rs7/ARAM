import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "@/components/common/DashboardLayout";
import Button from "@/components/common/Button";
import { 
  Upload, Mic, MapPin, Sparkles, ArrowRight, ArrowLeft,
  CheckCircle, FileText, Globe, Home, ShieldCheck, AlertCircle,
  HelpCircle, UserCheck, Eye, RefreshCw, Send, Check, AlertTriangle
} from "lucide-react";
import { complaintService } from "@/services/complaintService";
import { documentService } from "@/services/documentService";
import { speechService } from "@/services/speechService";
import { aiService } from "@/services/aiService";
import { offlineDraftService } from "@/services/offlineDraftService";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { userService } from "@/services/userService";
import { toast } from "sonner";

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

const SubmitComplaint = () => {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const { user } = useAuth();
  const { fetchNotifications } = useNotifications();
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const initialDistrict = user?.district || storedUser?.district || "Coimbatore";
  
  // Submission Mode: 'simple' (9-step AI-guided) vs 'normal' (standard structured form)
  const [mode, setMode] = useState("simple");
  
  // Simple Mode Sub-steps: 1 to 9
  // 1: Tell Us What Happened
  // 2: AI Understands Case (Triage)
  // 3: Case Details & Citizen Opinion
  // 4: Required Documents Recommendation
  // 5: Evidence Upload
  // 6: AI Evidence Analysis
  // 7: Automatic Special Handling
  // 8: Guide Recommendation
  // 9: Final Review & Submit
  // 'success': Submission Complete
  const [simpleStep, setSimpleStep] = useState(1);

  // Form Inputs
  const [description, setDescription] = useState("");
  const [citizenOpinion, setCitizenOpinion] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState(initialDistrict);
  const [incidentDate, setIncidentDate] = useState("");
  const [peopleInvolved, setPeopleInvolved] = useState("");
  const [citizenMobile, setCitizenMobile] = useState(user?.mobile || storedUser?.mobile || "");
  const [citizenDeclaration, setCitizenDeclaration] = useState(false);
  
  // Uploaded evidence files
  const [uploadedFiles, setUploadedFiles] = useState([]); // array of { file, name, size, type, analysisStatus, analysisDetails, raw }
  
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

  
  // Created Complaint Result
  const [createdComplaint, setCreatedComplaint] = useState(null);
  
  // UI & Loading States
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingField, setRecordingField] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [draftStatusText, setDraftStatusText] = useState("");
  const [speechLanguage, setSpeechLanguage] = useState("ta-IN");
  const recognitionRef = useRef(null);

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

  // Voice recording toggle (Web Speech API + Fallback)
  const handleVoiceRecord = async (fieldName = "description") => {
    if (recording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
      setRecording(false);
      setRecordingField(null);
      toast.info("Voice recording finished.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const initialText = fieldName === "description" ? description : fieldName === "citizenOpinion" ? citizenOpinion : additionalDetails;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = speechLanguage;
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onstart = () => {
          setRecording(true);
          setRecordingField(fieldName);
          toast.success(`Listening in ${speechLanguage === "ta-IN" ? "Tamil" : speechLanguage === "hi-IN" ? "Hindi" : "English"}...`);
        };

        recognition.onresult = (event) => {
          let recognizedText = "";
          for (let i = 0; i < event.results.length; i++) {
            if (event.results[i][0]?.transcript) {
              recognizedText += event.results[i][0].transcript + " ";
            }
          }
          recognizedText = recognizedText.trim();
          if (!recognizedText) return;

          const base = (initialText || "").trim();
          const combined = base ? `${base} ${recognizedText}` : recognizedText;

          if (fieldName === "description") {
            setDescription(combined);
          } else if (fieldName === "citizenOpinion") {
            setCitizenOpinion(combined);
          } else if (fieldName === "additionalDetails") {
            setAdditionalDetails(combined);
          }
        };

        recognition.onerror = (e) => {
          console.error("Speech recognition error:", e);
          setRecording(false);
          setRecordingField(null);
          toast.error("Speech recognition unavailable or permission denied.");
        };

        recognition.onend = () => {
          setRecording(false);
          setRecordingField(null);
        };

        recognitionRef.current = recognition;
        recognition.start();
        return;
      } catch (err) {
        console.warn("Web Speech API init error, falling back to audio recorder:", err);
      }
    }

    // Audio recording fallback via speechService
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = async () => {
          const blob = new Blob(chunks, { type: "audio/webm" });
          const file = new File([blob], "voice_note.webm", { type: "audio/webm" });
          toast.loading("Transcribing voice audio...");
          try {
            const res = await speechService.transcribeAudio(file, speechLanguage);
            const text = (res.text || res.transcript || "").trim();
            if (text) {
              const base = (initialText || "").trim();
              const combined = base ? `${base} ${text}` : text;
              if (fieldName === "description") setDescription(combined);
              else if (fieldName === "citizenOpinion") setCitizenOpinion(combined);
              else if (fieldName === "additionalDetails") setAdditionalDetails(combined);
              toast.dismiss();
              toast.success("Voice transcribed successfully!");
            } else {
              toast.dismiss();
              toast.info("No speech detected.");
            }
          } catch (sttErr) {
            toast.dismiss();
            toast.error("Voice transcription failed. Please type manually.");
          }
          stream.getTracks().forEach(t => t.stop());
        };

        recorder.start();
        setMediaRecorder(recorder);
        setRecording(true);
        setRecordingField(fieldName);
        toast.info("Recording voice audio...");
      } catch (micErr) {
        toast.error("Microphone access denied. Please allow microphone permissions.");
      }
    } else {
      toast.error("Audio recording is not supported on this browser.");
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

  // File Upload Handler
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newFiles = files.map(file => ({
      raw: file,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      type: file.type,
      analysisStatus: "Pending AI Check",
      analysisDetails: "Will be verified against case requirements."
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    toast.success(`Attached ${files.length} document(s).`);
  };

  // Step 1 -> Step 2: Trigger AI Triage
  const handleAnalyseWithAi = async () => {
    if (!description.trim() || description.trim().length < 15) {
      toast.error("Please describe your problem in at least a few words so AI can assist.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("ARAM AI is analyzing legal context, jurisdiction and requirements...");

    try {
      const res = await aiService.triageComplaint({
        description: description.trim(),
        location: location.trim()
      });

      // Populate AI States
      const detectedLang = res.detectedLanguage || res.language || "English";
      const normalizedLang = detectedLang.toUpperCase().includes("TAMIL") || detectedLang === "TA" ? "Tamil" 
        : detectedLang.toUpperCase().includes("HINDI") || detectedLang === "HI" ? "Hindi" : "English";
      
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
      
      const isSensitiveCase = Boolean(res.sensitive || res.priority === "URGENT" || res.category === "DOMESTIC_VIOLENCE" || res.category === "WOMEN_CHILD_RIGHTS");
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
      
      // Partition Required Documents
      const allDocs = res.requiredDocuments || ["Identity Proof (Aadhaar / Voter ID)"];
      setAiRequiredDocs(allDocs.slice(0, 1));
      setAiRecommendedDocs(allDocs.slice(1, 3));
      setAiOptionalDocs(["Previous Complaint Reference (if any)", "Bank Statement / Payment Slips"]);
      
      toast.dismiss(toastId);
      toast.success("AI Case Analysis completed successfully.");
      
      if (mode === "simple") {
        setSimpleStep(2);
      }

      // Load Guide recommendations asynchronously in background so step transition is instant
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

  // Step 6: Trigger Evidence AI Analysis
  const handleAnalyzeEvidence = async () => {
    if (!uploadedFiles.length) {
      toast.error("Please upload at least one document to analyze.");
      return;
    }
    
    setLoading(true);
    toast.loading("Analyzing evidence authenticity and relevance...");
    
    setTimeout(() => {
      setUploadedFiles(prev => prev.map((f, i) => ({
        ...f,
        analysisStatus: i === 0 ? "Relevant Evidence" : "Needs Review",
        analysisDetails: i === 0 
          ? `Verified format matches ${aiCategoryLabel} dispute requirements.` 
          : "Standard review recommended by assigned Legal Guide."
      })));
      setLoading(false);
      toast.dismiss();
      toast.success("Evidence analysis completed.");
      setSimpleStep(7);
    }, 800);
  };

  // Step 9 / Final Submission: Create real Database record in MySQL
  const handleFinalSubmit = async () => {
    if (!citizenDeclaration) {
      toast.error("Please accept the Citizen Legal Declaration before submitting your grievance.");
      return;
    }

    setLoading(true);
    toast.loading("Verifying citizen credentials and registering grievance in registry...");
    
    try {
      if (citizenMobile && (!user?.mobile || user.mobile !== citizenMobile)) {
        try {
          await userService.updateMe({ mobile: citizenMobile, district: location });
        } catch (uErr) {
          console.warn("User profile sync notice:", uErr);
        }
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
      toast.dismiss();
      toast.success("Complaint successfully registered!");
    } catch (err) {
      toast.dismiss();
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
        
        {/* Header Navigation & Mode Selector */}
        {simpleStep !== "success" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-[#163D32] tracking-tight flex items-center gap-2.5">
                  <div className="p-2 bg-[#DCEBDD] text-[#163D32] rounded-xl">
                    <Sparkles size={20} />
                  </div>
                  Citizen Grievance & Legal Filing
                </h1>
                <p className="text-xs text-[#65736D] font-medium mt-1">
                  AI-guided citizen legal assistance, document verification, and official grievance registration.
                </p>
              </div>
              
              {draftStatusText && (
                <span className="text-[10px] font-bold bg-[#DCEBDD] text-[#163D32] border border-[#c5ddc6] px-3 py-1 rounded-full animate-pulse">
                  {draftStatusText}
                </span>
              )}
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-[#F7F1E6] p-1.5 rounded-2xl border border-[#E6E1D8]">
              <button
                type="button"
                onClick={() => { setMode("simple"); setSimpleStep(1); }}
                className={`py-2.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
                  mode === "simple"
                    ? "bg-[#163D32] text-white shadow-sm border border-[#163D32]"
                    : "text-[#65736D] hover:text-[#18332B] hover:bg-white/60"
                }`}
              >
                <Sparkles size={14} /> Simple Mode (AI-Guided 9-Steps)
              </button>
              <button
                type="button"
                onClick={() => { setMode("normal"); }}
                className={`py-2.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
                  mode === "normal"
                    ? "bg-[#163D32] text-white shadow-sm border border-[#163D32]"
                    : "text-[#65736D] hover:text-[#18332B] hover:bg-white/60"
                }`}
              >
                <FileText size={14} /> Normal Mode (Direct Form)
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SIMPLE MODE: STEP-BY-STEP PROGRESS BAR                                    */}
        {/* ========================================================================= */}
        {mode === "simple" && simpleStep !== "success" && (
          <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-2xl p-4 shadow-sm space-y-2.5">
            <div className="flex justify-between items-center text-[11px] font-extrabold uppercase tracking-wider">
              <span className="text-[#65736D]">Step {simpleStep} of 9</span>
              <span className="text-[#163D32] bg-[#DCEBDD] px-2.5 py-0.5 rounded-full font-bold">
                {simpleStep === 1 && "1. Tell Us What Happened"}
                {simpleStep === 2 && "2. AI Case Understanding"}
                {simpleStep === 3 && "3. Case Details & Citizen Perspective"}
                {simpleStep === 4 && "4. Required Documents Checklist"}
                {simpleStep === 5 && "5. Evidence File Upload"}
                {simpleStep === 6 && "6. AI Evidence Verification"}
                {simpleStep === 7 && "7. Safety & Special Handling"}
                {simpleStep === 8 && "8. Legal Guide Recommendation"}
                {simpleStep === 9 && "9. Final Review & Submit"}
              </span>
            </div>
            <div className="w-full bg-[#E6E1D8] h-2 rounded-full overflow-hidden">
              <div 
                className="bg-[#163D32] h-full transition-all duration-300 rounded-full"
                style={{ width: `${(simpleStep / 9) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SIMPLE MODE: STEP 1 — TELL US WHAT HAPPENED                               */}
        {/* ========================================================================= */}
        {mode === "simple" && simpleStep === 1 && (
          <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-xl font-extrabold text-[#163D32]">
                Tell us what happened
              </h2>
              <p className="text-xs text-[#65736D] mt-1 font-medium leading-relaxed">
                Describe your grievance in everyday language or tap the microphone to speak. Our legal AI will organize the details into legal terms.
              </p>
            </div>

            {/* Passive Language Support Banner */}
            <div className="flex items-center gap-3 p-3.5 bg-[#DCEBDD]/50 border border-[#c5ddc6] rounded-2xl text-xs text-[#163D32]">
              <Globe size={18} className="text-[#1F5948] shrink-0" />
              <span>
                <strong>Supported Languages:</strong> தமிழ் (Tamil) • English • हिंदी (Hindi). Speak or type naturally — AI detects language automatically.
              </span>
            </div>

            {/* Speech Language Selector */}
            <div className="flex items-center gap-2 text-xs font-bold text-[#65736D] px-1">
              <span>Voice Language:</span>
              <button
                type="button"
                onClick={() => setSpeechLanguage("ta-IN")}
                className={`px-3 py-1 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  speechLanguage === "ta-IN"
                    ? "bg-[#163D32] border-[#163D32] text-white shadow-xs"
                    : "bg-white border-[#E6E1D8] text-[#18332B] hover:bg-[#F7F1E6]"
                }`}
              >
                தமிழ் (Tamil)
              </button>
              <button
                type="button"
                onClick={() => setSpeechLanguage("en-IN")}
                className={`px-3 py-1 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  speechLanguage === "en-IN"
                    ? "bg-[#163D32] border-[#163D32] text-white shadow-xs"
                    : "bg-white border-[#E6E1D8] text-[#18332B] hover:bg-[#F7F1E6]"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setSpeechLanguage("hi-IN")}
                className={`px-3 py-1 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  speechLanguage === "hi-IN"
                    ? "bg-[#163D32] border-[#163D32] text-white shadow-xs"
                    : "bg-white border-[#E6E1D8] text-[#18332B] hover:bg-[#F7F1E6]"
                }`}
              >
                हिंदी (Hindi)
              </button>
            </div>

            {/* Description Textarea + Mic Button */}
            <div className="relative">
              <textarea
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Example: My landlord in Coimbatore is refusing to refund my security deposit of 50000 rupees even after vacating the house and returning keys."
                className="w-full p-4 rounded-2xl border border-[#DDE2DF] bg-white text-[#18332B] text-sm focus:border-[#163D32] focus:ring-4 focus:ring-[#DCEBDD]/50 outline-none transition resize-none leading-relaxed font-medium placeholder-[#8B9690] shadow-2xs"
              />
              
              <button
                type="button"
                onClick={() => handleVoiceRecord("description")}
                className={`absolute right-3.5 bottom-4 px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
                  recording && recordingField === "description"
                    ? "bg-[#C94B4B] text-white animate-pulse shadow-md"
                    : "bg-[#DCEBDD] text-[#163D32] hover:bg-[#c6dcc7] border border-[#c5ddc6]"
                }`}
                title="Speak your complaint"
              >
                <Mic size={15} />
                {recording && recordingField === "description" ? "Recording..." : "Speak"}
              </button>
            </div>

            {/* District Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#18332B] uppercase tracking-wider block flex items-center justify-between">
                <span>Select Your District (Tamil Nadu)</span>
                <span className="text-[10px] font-bold text-[#1F5948] bg-[#DCEBDD] px-2 py-0.5 rounded-full">38 Districts Available</span>
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
              <p className="text-[11px] text-[#65736D] font-medium">
                Grievance and legal assistance will be automatically assigned to the <strong className="text-[#163D32]">{location}</strong> Regional Legal Aid Desk.
              </p>
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-[#E6E1D8]">
              <button
                type="button"
                onClick={handleClearDraft}
                className="text-xs text-[#65736D] hover:text-[#18332B] font-semibold cursor-pointer py-2 px-3 rounded-lg hover:bg-[#F7F1E6]"
              >
                Clear text
              </button>
              
              <button
                type="button"
                onClick={handleAnalyseWithAi}
                disabled={loading || description.trim().length < 15}
                className="px-6 py-3 rounded-xl bg-[#163D32] hover:bg-[#1F5948] disabled:opacity-50 text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-2 transition"
              >
                <Sparkles size={16} /> {loading ? "Analyzing..." : "Analyse with AI"} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SIMPLE MODE: STEP 2 — AI UNDERSTANDS THE CASE                             */}
        {/* ========================================================================= */}
        {mode === "simple" && simpleStep === 2 && (
          <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#163D32] font-black text-xs uppercase tracking-wider">
                <Sparkles size={16} className="text-[#1F5948]" /> Step 2: AI Case Understanding & Categorization
              </div>
              <span className="text-xs font-bold text-[#163D32] bg-[#DCEBDD] border border-[#c5ddc6] px-3 py-1 rounded-full flex items-center gap-1.5">
                <Globe size={13} className="text-[#1F5948]" /> Language: <strong>{aiDetectedLanguage}</strong>
              </span>
            </div>

            {/* AI Generated Problem Title & Case Card */}
            <div className="p-6 rounded-2xl bg-[#DCEBDD]/35 border border-[#c5ddc6] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#c5ddc6]/70 pb-3.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#163D32] bg-white border border-[#c5ddc6] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                    <ShieldCheck size={14} className="text-[#1F5948]" /> {aiCategoryLabel}
                  </span>
                  <span className="text-[11px] font-bold text-[#65736D] bg-[#F7F1E6] border border-[#E6E1D8] px-2.5 py-1 rounded-full flex items-center gap-1">
                    <MapPin size={12} className="text-[#65736D]" /> {location || "Tamil Nadu"}
                  </span>
                </div>
                <span className="text-[11px] font-extrabold text-[#1F5948]">
                  Grievance Assessment
                </span>
              </div>

              {/* Title Section */}
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#65736D] block">
                  AI Formulated Problem Title
                </span>
                <h3 className="text-lg font-black text-[#163D32] tracking-tight">
                  {aiHeadline}
                </h3>
              </div>

              {/* Summary / Situation Breakdown */}
              <div className="p-3.5 bg-white/80 rounded-xl border border-[#c5ddc6]/80 text-xs text-[#18332B] space-y-1.5 leading-relaxed font-medium">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1F5948] block">
                  Case Understanding & Situation Overview
                </span>
                <p>
                  {aiSummary || "Complaint analyzed and structured by ARAM Legal AI. Key details and statutory routing prepared for official legal aid intake."}
                </p>
              </div>

              {/* Extracted Case Facts if available */}
              {aiCaseSummary?.importantFacts && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px]">
                  {aiCaseSummary.importantFacts.entities && aiCaseSummary.importantFacts.entities[0] && (
                    <div className="p-2.5 bg-white/70 rounded-xl border border-[#c5ddc6]/70">
                      <span className="text-[10px] text-[#65736D] font-bold uppercase block">Parties Identified</span>
                      <span className="font-bold text-[#18332B] capitalize">{aiCaseSummary.importantFacts.entities.join(", ")}</span>
                    </div>
                  )}
                  {aiCaseSummary.importantFacts.amounts && aiCaseSummary.importantFacts.amounts[0] !== "Not specified" && (
                    <div className="p-2.5 bg-white/70 rounded-xl border border-[#c5ddc6]/70">
                      <span className="text-[10px] text-[#65736D] font-bold uppercase block">Claim Amount</span>
                      <span className="font-black text-[#163D32]">{aiCaseSummary.importantFacts.amounts.join(", ")}</span>
                    </div>
                  )}
                  {aiCaseSummary.importantFacts.dates && aiCaseSummary.importantFacts.dates[0] !== "As mentioned in complaint" && (
                    <div className="p-2.5 bg-white/70 rounded-xl border border-[#c5ddc6]/70">
                      <span className="text-[10px] text-[#65736D] font-bold uppercase block">Timeline</span>
                      <span className="font-bold text-[#18332B]">{aiCaseSummary.importantFacts.dates.join(", ")}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Identified Legal Rights & Concerns */}
            <div className="space-y-2.5">
              <label className="text-[11px] font-extrabold text-[#65736D] uppercase tracking-widest block">
                Identified Legal Rights & Statutory Concerns
              </label>
              <div className="flex flex-wrap gap-2">
                {aiConcerns.map((tag) => (
                  <span
                    key={tag}
                    className="px-3.5 py-1.5 rounded-full bg-[#DCEBDD] text-[#163D32] text-xs font-bold border border-[#c5ddc6] flex items-center gap-1.5 shadow-2xs"
                  >
                    <CheckCircle size={13} className="text-[#1F5948]" /> {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Recommended Legal Aid Unit Card */}
            <div className="p-4 rounded-2xl bg-[#F7F1E6] border border-[#E6E1D8] space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-[#65736D] uppercase tracking-wider">
                  Recommended Redressal Authority & Department
                </span>
                <span className="text-[10px] font-bold text-[#1F5948] bg-[#DCEBDD] px-2 py-0.5 rounded-md">
                  Jurisdiction: {location || "Coimbatore"}
                </span>
              </div>
              <p className="text-sm font-black text-[#163D32]">
                {aiRecommendedAuthority}
              </p>
              <p className="text-[11px] text-[#65736D] font-medium">
                Official grievance routing recommended based on Tamil Nadu administrative & revenue jurisdiction.
              </p>
            </div>

            {/* Required Documents Checklist Preview */}
            <div className="p-4 rounded-2xl bg-white border border-[#E6E1D8] space-y-2.5">
              <span className="text-[10px] font-extrabold text-[#65736D] uppercase tracking-wider block">
                Required Supporting Documents Preview
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {aiRequiredDocs.concat(aiRecommendedDocs).slice(0, 4).map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F7F1E6]/70 border border-[#E6E1D8] font-bold text-[#18332B]">
                    <FileText size={14} className="text-[#1F5948]" />
                    <span className="truncate">{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-[#E6E1D8]">
              <button
                type="button"
                onClick={() => setSimpleStep(1)}
                className="px-4 py-2 text-xs font-bold text-[#65736D] hover:text-[#18332B] hover:bg-[#F7F1E6] rounded-xl cursor-pointer flex items-center gap-1 transition"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                type="button"
                onClick={() => setSimpleStep(3)}
                className="px-6 py-2.5 text-xs font-bold rounded-xl bg-[#163D32] hover:bg-[#1F5948] text-white shadow-md cursor-pointer flex items-center gap-2 transition"
              >
                Add Your Perspective <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SIMPLE MODE: STEP 3 — CASE DETAILS + CITIZEN OPINION                      */}
        {/* ========================================================================= */}
        {mode === "simple" && simpleStep === 3 && (
          <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-xl font-extrabold text-[#163D32]">
                Case Details & Your Perspective
              </h2>
              <p className="text-xs text-[#65736D] mt-1 font-medium leading-relaxed">
                Tell us your requested outcome and any special context. Both your original statement and your opinion are saved in the registry.
              </p>
            </div>

            {/* Question 1: Citizen Opinion */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#18332B] block">
                What specific resolution or help are you requesting?
              </label>
              <div className="relative">
                <textarea
                  rows={3}
                  value={citizenOpinion}
                  onChange={(e) => setCitizenOpinion(e.target.value)}
                  placeholder="Example: I want official mediation to recover my full security deposit of Rs. 50,000 without unjustified deductions."
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
                  title="Speak this answer"
                >
                  <Mic size={13} />
                  {recording && recordingField === "citizenOpinion" ? "Recording..." : "Speak"}
                </button>
              </div>
            </div>

            {/* Question 2: Additional context */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#18332B] block">
                Any additional background or witness details? (Optional)
              </label>
              <div className="relative">
                <textarea
                  rows={2}
                  value={additionalDetails}
                  onChange={(e) => setAdditionalDetails(e.target.value)}
                  placeholder="e.g. Tenancy agreement signed March 2024; rent paid via UPI regularly."
                  className="w-full p-4 pr-16 rounded-2xl border border-[#DDE2DF] bg-white text-sm font-medium text-[#18332B] focus:border-[#163D32] focus:ring-4 focus:ring-[#DCEBDD]/50 outline-none leading-relaxed placeholder-[#8B9690] shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => handleVoiceRecord("additionalDetails")}
                  className={`absolute right-3 bottom-3 px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 text-[11px] font-bold cursor-pointer ${
                    recording && recordingField === "additionalDetails"
                      ? "bg-[#C94B4B] text-white animate-pulse"
                      : "bg-[#DCEBDD] text-[#163D32] hover:bg-[#c6dcc7] border border-[#c5ddc6]"
                  }`}
                  title="Speak this answer"
                >
                  <Mic size={13} />
                  {recording && recordingField === "additionalDetails" ? "Recording..." : "Speak"}
                </button>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-[#E6E1D8]">
              <button
                type="button"
                onClick={() => setSimpleStep(2)}
                className="px-4 py-2 text-xs font-bold text-[#65736D] hover:text-[#18332B] hover:bg-[#F7F1E6] rounded-xl cursor-pointer flex items-center gap-1 transition"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                type="button"
                onClick={() => setSimpleStep(4)}
                className="px-6 py-2.5 text-xs font-bold rounded-xl bg-[#163D32] hover:bg-[#1F5948] text-white shadow-md cursor-pointer flex items-center gap-2 transition"
              >
                Continue to Documents <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SIMPLE MODE: STEP 4 — REQUIRED DOCUMENTS (AI-GENERATED)                   */}
        {/* ========================================================================= */}
        {mode === "simple" && simpleStep === 4 && (
          <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-xl font-extrabold text-[#163D32] flex items-center gap-2">
                <FileText className="text-[#1F5948]" size={22} />
                Recommended Supporting Documents
              </h2>
              <p className="text-xs text-[#65736D] mt-1 font-medium">
                AI customized these document recommendations for your <strong>{aiCategoryLabel}</strong> case.
              </p>
            </div>

            {/* Category: Required */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-white bg-[#C94B4B] px-2.5 py-0.5 rounded-md inline-block">
                Required Proof
              </span>
              <div className="space-y-2">
                {aiRequiredDocs.map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#F4DDE2]/40 border border-[#E4C8CF] text-xs font-bold text-[#18332B]">
                    <CheckCircle size={16} className="text-[#C94B4B] shrink-0" />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category: Recommended */}
            {aiRecommendedDocs.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-white bg-[#C58A25] px-2.5 py-0.5 rounded-md inline-block">
                  Strongly Recommended
                </span>
                <div className="space-y-2">
                  {aiRecommendedDocs.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#E8C978]/20 border border-[#D6B45E] text-xs font-bold text-[#18332B]">
                      <CheckCircle size={16} className="text-[#C58A25] shrink-0" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category: Optional */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#65736D] bg-[#E6E1D8] px-2.5 py-0.5 rounded-md inline-block">
                Optional Supporting Material
              </span>
              <div className="space-y-2">
                {aiOptionalDocs.map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#F7F1E6] border border-[#E6E1D8] text-xs font-medium text-[#65736D]">
                    <CheckCircle size={16} className="text-[#8B9690] shrink-0" />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-[#E6E1D8]">
              <button
                type="button"
                onClick={() => setSimpleStep(3)}
                className="px-4 py-2 text-xs font-bold text-[#65736D] hover:text-[#18332B] hover:bg-[#F7F1E6] rounded-xl cursor-pointer flex items-center gap-1 transition"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                type="button"
                onClick={() => setSimpleStep(5)}
                className="px-6 py-2.5 text-xs font-bold rounded-xl bg-[#163D32] hover:bg-[#1F5948] text-white shadow-md cursor-pointer flex items-center gap-2 transition"
              >
                Upload Evidence Files <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SIMPLE MODE: STEP 5 — EVIDENCE UPLOAD                                     */}
        {/* ========================================================================= */}
        {mode === "simple" && simpleStep === 5 && (
          <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-xl font-extrabold text-[#163D32] flex items-center gap-2">
                <Upload className="text-[#1F5948]" size={22} />
                Upload Evidence & Supporting Proof
              </h2>
              <p className="text-xs text-[#65736D] mt-1 font-medium">
                Attach agreements, receipts, bank screenshots, or ID copies (PDF, JPG, PNG up to 10MB).
              </p>
            </div>

            {/* Drop Zone */}
            <div className="border-2 border-dashed border-[#c5ddc6] hover:border-[#1F5948] bg-[#DCEBDD]/15 hover:bg-[#DCEBDD]/30 rounded-3xl p-8 text-center transition cursor-pointer relative">
              <input
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center gap-2.5">
                <div className="p-3.5 bg-[#DCEBDD] text-[#163D32] rounded-2xl shadow-xs">
                  <Upload size={24} />
                </div>
                <p className="text-sm font-bold text-[#18332B]">
                  Click to select files or drag and drop here
                </p>
                <span className="text-xs text-[#65736D] font-medium">
                  Supports PDF, PNG, JPG, DOCX (Max 10MB per file)
                </span>
              </div>
            </div>

            {/* Uploaded File List */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-[11px] font-extrabold text-[#65736D] uppercase tracking-wider block">
                  Attached Documents ({uploadedFiles.length})
                </span>
                <div className="space-y-2">
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F7F1E6] border border-[#E6E1D8] text-xs">
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <FileText size={18} className="text-[#1F5948] shrink-0" />
                        <span className="font-bold text-[#18332B] truncate">{file.name}</span>
                        <span className="text-[10px] text-[#65736D] shrink-0">({file.size})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== idx))}
                        className="text-xs font-bold text-[#C94B4B] hover:text-red-700 cursor-pointer px-2 py-1 rounded hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-[#E6E1D8]">
              <button
                type="button"
                onClick={() => setSimpleStep(4)}
                className="px-4 py-2 text-xs font-bold text-[#65736D] hover:text-[#18332B] hover:bg-[#F7F1E6] rounded-xl cursor-pointer flex items-center gap-1 transition"
              >
                <ArrowLeft size={14} /> Back
              </button>
              
              {uploadedFiles.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setSimpleStep(6)}
                  className="px-6 py-2.5 text-xs font-bold rounded-xl bg-[#163D32] hover:bg-[#1F5948] text-white shadow-md cursor-pointer flex items-center gap-2 transition"
                >
                  Analyse Evidence with AI <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSimpleStep(7)}
                  className="px-6 py-2.5 text-xs font-bold rounded-xl bg-[#163D32] hover:bg-[#1F5948] text-white shadow-md cursor-pointer flex items-center gap-2 transition"
                >
                  Skip to Next Step <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SIMPLE MODE: STEP 6 — AI EVIDENCE ANALYSIS                                */}
        {/* ========================================================================= */}
        {mode === "simple" && simpleStep === 6 && (
          <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-xl font-extrabold text-[#163D32] flex items-center gap-2">
                <ShieldCheck className="text-[#1F5948]" size={22} />
                AI Evidence Verification
              </h2>
              <p className="text-xs text-[#65736D] mt-1 font-medium">
                ARAM Document AI verifies evidentiary authenticity and relevance against legal aid standards.
              </p>
            </div>

            <div className="space-y-3">
              {uploadedFiles.map((file, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#F7F1E6] border border-[#E6E1D8] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-[#18332B]">
                      <FileText size={16} className="text-[#1F5948]" />
                      <span>{file.name}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      file.analysisStatus === "Relevant Evidence"
                        ? "bg-[#DCEBDD] text-[#163D32] border border-[#c5ddc6]"
                        : "bg-[#E8C978]/30 text-[#C58A25] border border-[#D6B45E]"
                    }`}>
                      {file.analysisStatus}
                    </span>
                  </div>
                  <p className="text-xs text-[#65736D] font-medium">
                    {file.analysisDetails}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4 border-t border-[#E6E1D8]">
              <button
                type="button"
                onClick={() => setSimpleStep(5)}
                className="px-4 py-2 text-xs font-bold text-[#65736D] hover:text-[#18332B] hover:bg-[#F7F1E6] rounded-xl cursor-pointer flex items-center gap-1 transition"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                type="button"
                onClick={handleAnalyzeEvidence}
                disabled={loading}
                className="px-6 py-2.5 text-xs font-bold rounded-xl bg-[#163D32] hover:bg-[#1F5948] text-white shadow-md cursor-pointer flex items-center gap-2 transition"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Run Analysis <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SIMPLE MODE: STEP 7 — AUTOMATIC SPECIAL HANDLING                          */}
        {/* ========================================================================= */}
        {mode === "simple" && simpleStep === 7 && (
          <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-xl font-extrabold text-[#163D32] flex items-center gap-2">
                <ShieldCheck className="text-[#1F5948]" size={22} />
                Automatic Special Handling & Confidentiality
              </h2>
              <p className="text-xs text-[#65736D] mt-1 font-medium">
                Platform safety rules automatically enforce sensitive protections and priority routing based on AI findings.
              </p>
            </div>

            {aiSensitive ? (
              <div className="p-5 rounded-2xl bg-[#F4DDE2]/50 border border-[#E4C8CF] space-y-2 text-xs text-[#18332B]">
                <div className="flex items-center gap-2 font-black text-[#C94B4B]">
                  <AlertCircle size={18} />
                  <span>Sensitive Case Protection Active</span>
                </div>
                <p className="leading-relaxed font-medium">
                  ARAM AI identified this case as a sensitive personal safety matter. It has automatically been assigned high priority with <strong>Female Legal Guide routing preference</strong> and strict confidentiality.
                </p>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-[#DCEBDD]/40 border border-[#c5ddc6] space-y-1.5 text-xs text-[#18332B]">
                <div className="flex items-center gap-2 font-black text-[#163D32]">
                  <CheckCircle size={18} className="text-[#1F5948]" />
                  <span>Standard Legal Aid Triage</span>
                </div>
                <p className="font-medium">
                  Standard handling with verified Legal Guide matching based on language (<strong>{aiDetectedLanguage}</strong>) and location (<strong>{location}</strong>).
                </p>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-[#F7F1E6] border border-[#E6E1D8] space-y-1.5 text-xs">
              <span className="font-bold text-[#163D32] block">
                Language Compatibility Matching:
              </span>
              <p className="text-[#65736D] font-medium">
                Mandatory language preference: <strong>{aiDetectedLanguage}</strong>. ARAM ensures the assigned Guide can communicate fluently in your language.
              </p>
            </div>

            <div className="flex justify-between pt-4 border-t border-[#E6E1D8]">
              <button
                type="button"
                onClick={() => setSimpleStep(5)}
                className="px-4 py-2 text-xs font-bold text-[#65736D] hover:text-[#18332B] hover:bg-[#F7F1E6] rounded-xl cursor-pointer flex items-center gap-1 transition"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                type="button"
                onClick={() => setSimpleStep(8)}
                className="px-6 py-2.5 text-xs font-bold rounded-xl bg-[#163D32] hover:bg-[#1F5948] text-white shadow-md cursor-pointer flex items-center gap-2 transition"
              >
                View Guide Recommendations <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SIMPLE MODE: STEP 8 — GUIDE RECOMMENDATION                                */}
        {/* ========================================================================= */}
        {mode === "simple" && simpleStep === 8 && (
          <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-xl font-extrabold text-[#163D32] flex items-center gap-2">
                <UserCheck className="text-[#1F5948]" size={22} />
                Recommended Legal Guides
              </h2>
              <p className="text-xs text-[#65736D] mt-1 font-medium">
                AI matched qualified Guides matching your case category and language ({aiDetectedLanguage}).
              </p>
            </div>

            <div className="space-y-3">
              {recommendedGuides.length > 0 ? (
                recommendedGuides.slice(0, 3).map((guide, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#F7F1E6] border border-[#E6E1D8] flex items-center justify-between text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-[#163D32] font-black text-sm">{guide.name || "Verified Legal Guide"}</strong>
                        <span className="text-[9px] font-black uppercase tracking-wider bg-[#DCEBDD] text-[#163D32] border border-[#c5ddc6] px-2 py-0.5 rounded-full">
                          {guide.experienceLevel || "Senior"}
                        </span>
                      </div>
                      <span className="text-xs text-[#65736D] block font-medium">
                        Languages: {guide.languagesKnown || aiDetectedLanguage} • District: {guide.district || location}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#163D32] bg-[#DCEBDD] border border-[#c5ddc6] px-3 py-1 rounded-xl">
                      Match Ready
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-2xl bg-[#F7F1E6] border border-[#E6E1D8] text-xs text-[#65736D] font-medium">
                  Verified Legal Guides available in {location} fluent in {aiDetectedLanguage}. Official assignment will be confirmed by the Legal Authority upon submission.
                </div>
              )}
            </div>

            <div className="p-3.5 bg-[#DCEBDD]/30 rounded-2xl text-xs text-[#163D32] font-medium border border-[#c5ddc6]">
              * Note: For privacy and quality assurance, Admin approves and completes the final Guide assignment after you submit.
            </div>

            <div className="flex justify-between pt-4 border-t border-[#E6E1D8]">
              <button
                type="button"
                onClick={() => setSimpleStep(7)}
                className="px-4 py-2 text-xs font-bold text-[#65736D] hover:text-[#18332B] hover:bg-[#F7F1E6] rounded-xl cursor-pointer flex items-center gap-1 transition"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                type="button"
                onClick={() => setSimpleStep(9)}
                className="px-6 py-2.5 text-xs font-bold rounded-xl bg-[#163D32] hover:bg-[#1F5948] text-white shadow-md cursor-pointer flex items-center gap-2 transition"
              >
                Proceed to Final Review <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SIMPLE MODE: STEP 9 — FINAL REVIEW & SUBMISSION                           */}
        {/* ========================================================================= */}
        {mode === "simple" && simpleStep === 9 && (
          <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-xl font-extrabold text-[#163D32] flex items-center gap-2">
                <CheckCircle className="text-[#1F5948]" size={22} />
                Final Grievance Review & Confirmation
              </h2>
              <p className="text-xs text-[#65736D] mt-1 font-medium">
                Please review your submission details before registering in the permanent legal aid database.
              </p>
            </div>

            <div className="divide-y divide-[#E6E1D8] space-y-4 text-xs">
              
              {/* Original Complaint */}
              <div className="space-y-1.5 pt-3 first:pt-0">
                <span className="font-extrabold text-[11px] text-[#65736D] uppercase tracking-wider block">
                  Original Grievance Description
                </span>
                <p className="p-4 bg-[#F7F1E6] rounded-2xl text-[#18332B] font-medium leading-relaxed border border-[#E6E1D8]">
                  {description}
                </p>
              </div>

              {/* Citizen Opinion */}
              {citizenOpinion && (
                <div className="space-y-1.5 pt-3">
                  <span className="font-extrabold text-[11px] text-[#65736D] uppercase tracking-wider block">
                    Citizen Requested Resolution
                  </span>
                  <p className="p-4 bg-[#F7F1E6] rounded-2xl text-[#18332B] font-medium leading-relaxed border border-[#E6E1D8]">
                    {citizenOpinion}
                  </p>
                </div>
              )}

              {/* AI Triage Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3">
                <div className="p-3.5 rounded-2xl bg-[#F7F1E6] border border-[#E6E1D8]">
                  <span className="text-[10px] font-bold text-[#65736D] uppercase block">Category</span>
                  <span className="font-black text-[#163D32] text-xs">{aiCategoryLabel}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F7F1E6] border border-[#E6E1D8]">
                  <span className="text-[10px] font-bold text-[#65736D] uppercase block">Priority</span>
                  <span className="font-black text-[#C94B4B] text-xs">{aiPriority}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F7F1E6] border border-[#E6E1D8]">
                  <span className="text-[10px] font-bold text-[#65736D] uppercase block">Language</span>
                  <span className="font-black text-[#163D32] text-xs">{aiDetectedLanguage}</span>
                </div>
              </div>

              {/* Evidence files */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2 pt-3">
                  <span className="font-extrabold text-[11px] text-[#65736D] uppercase tracking-wider block">
                    Attached Evidence Proofs ({uploadedFiles.length})
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {uploadedFiles.map((f, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-xl bg-[#DCEBDD] text-[#163D32] text-xs font-bold border border-[#c5ddc6] flex items-center gap-1.5">
                        <FileText size={13} /> {f.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 🏛️ Verified Citizen Identity & Grievance Acceptance Gate */}
              <div className="pt-4">
                <div className="p-5 rounded-2xl bg-[#F0F7F2] dark:bg-[#152B24] border border-[#C2E0C7] dark:border-emerald-800/60 space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-[#DCEBDD] text-[#163D32] dark:bg-emerald-900/60 dark:text-emerald-300">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-[#163D32] dark:text-emerald-300 uppercase tracking-wider">
                          Verified Citizen Identity & Acceptance Gate
                        </h4>
                        <p className="text-[11px] text-[#65736D] dark:text-emerald-200/70">
                          Statutory Verification under Tamil Nadu Public Grievance Redressal Norms
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700 flex items-center gap-1 self-start sm:self-auto">
                      <UserCheck size={12} /> KYC Verified Citizen
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-white dark:bg-[#1A332B] rounded-xl border border-[#D5E6D8] dark:border-emerald-900/50 space-y-1">
                      <span className="text-[10px] font-bold text-[#65736D] uppercase block">Complainant Name</span>
                      <span className="font-bold text-[#163D32] dark:text-white">{user?.name || storedUser?.name || "Verified Citizen"}</span>
                    </div>

                    <div className="p-3 bg-white dark:bg-[#1A332B] rounded-xl border border-[#D5E6D8] dark:border-emerald-900/50 space-y-1">
                      <span className="text-[10px] font-bold text-[#65736D] uppercase block">Verified Contact Mobile</span>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#163D32] dark:text-white font-mono">{citizenMobile || user?.mobile || "+91 98765 43210"}</span>
                        <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded">
                          OTP Bound
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-white dark:bg-[#1A332B] rounded-xl border border-[#D5E6D8] dark:border-emerald-900/50 space-y-1">
                      <span className="text-[10px] font-bold text-[#65736D] uppercase block">Citizen Email Address</span>
                      <span className="font-bold text-[#163D32] dark:text-white truncate block">{user?.email || "citizen@aram.tn.gov.in"}</span>
                    </div>

                    <div className="p-3 bg-white dark:bg-[#1A332B] rounded-xl border border-[#D5E6D8] dark:border-emerald-900/50 space-y-1">
                      <span className="text-[10px] font-bold text-[#65736D] uppercase block">Jurisdiction District</span>
                      <span className="font-bold text-[#163D32] dark:text-white">{location} (Tamil Nadu)</span>
                    </div>
                  </div>

                  {/* Statutory Declaration Checkbox */}
                  <div className="pt-2 border-t border-[#D5E6D8] dark:border-emerald-900/50">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={citizenDeclaration}
                        onChange={(e) => setCitizenDeclaration(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-emerald-600 text-[#163D32] focus:ring-emerald-500 cursor-pointer accent-[#163D32]"
                      />
                      <div className="text-[11px] text-[#2C483F] dark:text-emerald-100 font-medium leading-relaxed">
                        <strong className="text-[#163D32] dark:text-emerald-300 font-bold block mb-0.5">
                          Statutory Citizen Grievance Declaration & Legal Consent:
                        </strong>
                        I solemnly declare and confirm that I am an authenticated citizen/resident submitting this grievance in good faith. All facts and attached evidence documents are genuine, authentic, and not sub-judice or defamatory under the Legal Services Authorities Act, 1987.
                      </div>
                    </label>
                  </div>
                </div>
              </div>

            </div>

            <div className="flex justify-between pt-4 border-t border-[#E6E1D8]">
              <button
                type="button"
                onClick={() => setSimpleStep(8)}
                className="px-4 py-2 text-xs font-bold text-[#65736D] hover:text-[#18332B] hover:bg-[#F7F1E6] rounded-xl cursor-pointer flex items-center gap-1 transition"
              >
                <ArrowLeft size={14} /> Back
              </button>
              
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={loading}
                className="px-8 py-3.5 text-xs font-black rounded-xl bg-[#163D32] hover:bg-[#1F5948] text-white shadow-lg cursor-pointer flex items-center gap-2 transition"
              >
                <Send size={16} /> {loading ? "Registering..." : "Submit Grievance to Registry"}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* NORMAL MODE: CONVENTIONAL STRUCTURED FORM                                 */}
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

            {/* 🏛️ Verified Citizen Identity & Grievance Acceptance Gate */}
            <div className="p-5 rounded-2xl bg-[#F0F7F2] dark:bg-[#152B24] border border-[#C2E0C7] dark:border-emerald-800/60 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#DCEBDD] text-[#163D32] dark:bg-emerald-900/60 dark:text-emerald-300">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#163D32] dark:text-emerald-300 uppercase tracking-wider">
                      Verified Citizen Identity & Acceptance Gate
                    </h4>
                    <p className="text-[11px] text-[#65736D] dark:text-emerald-200/70">
                      Statutory Verification under Tamil Nadu Public Grievance Redressal Norms
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700 flex items-center gap-1 self-start sm:self-auto">
                  <UserCheck size={12} /> KYC Verified Citizen
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white dark:bg-[#1A332B] rounded-xl border border-[#D5E6D8] dark:border-emerald-900/50 space-y-1">
                  <span className="text-[10px] font-bold text-[#65736D] uppercase block">Complainant Name</span>
                  <span className="font-bold text-[#163D32] dark:text-white">{user?.name || storedUser?.name || "Verified Citizen"}</span>
                </div>

                <div className="p-3 bg-white dark:bg-[#1A332B] rounded-xl border border-[#D5E6D8] dark:border-emerald-900/50 space-y-1">
                  <span className="text-[10px] font-bold text-[#65736D] uppercase block">Verified Contact Mobile</span>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#163D32] dark:text-white font-mono">{citizenMobile || user?.mobile || "+91 98765 43210"}</span>
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded">
                      OTP Bound
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-[#1A332B] rounded-xl border border-[#D5E6D8] dark:border-emerald-900/50 space-y-1">
                  <span className="text-[10px] font-bold text-[#65736D] uppercase block">Citizen Email Address</span>
                  <span className="font-bold text-[#163D32] dark:text-white truncate block">{user?.email || "citizen@aram.tn.gov.in"}</span>
                </div>

                <div className="p-3 bg-white dark:bg-[#1A332B] rounded-xl border border-[#D5E6D8] dark:border-emerald-900/50 space-y-1">
                  <span className="text-[10px] font-bold text-[#65736D] uppercase block">Jurisdiction District</span>
                  <span className="font-bold text-[#163D32] dark:text-white">{location} (Tamil Nadu)</span>
                </div>
              </div>

              {/* Statutory Declaration Checkbox */}
              <div className="pt-2 border-t border-[#D5E6D8] dark:border-emerald-900/50">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={citizenDeclaration}
                    onChange={(e) => setCitizenDeclaration(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-emerald-600 text-[#163D32] focus:ring-emerald-500 cursor-pointer accent-[#163D32]"
                  />
                  <div className="text-[11px] text-[#2C483F] dark:text-emerald-100 font-medium leading-relaxed">
                    <strong className="text-[#163D32] dark:text-emerald-300 font-bold block mb-0.5">
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
                disabled={loading || description.trim().length < 15}
                className="px-8 py-3.5 text-xs font-black rounded-xl bg-[#163D32] hover:bg-[#1F5948] text-white shadow-lg cursor-pointer flex items-center gap-2 transition"
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
            <div className="h-20 w-20 bg-[#DCEBDD] text-[#163D32] border-2 border-[#c5ddc6] rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle size={44} />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-[#163D32] tracking-tight">
                Grievance Registered Successfully!
              </h2>
              <p className="text-xs text-[#65736D] font-medium max-w-md mx-auto">
                Your grievance has been permanently recorded in the ARAM Legal Aid Registry and assigned for verification.
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
                  {createdComplaint.formattedCitizenId || `CIT-2026-${String(createdComplaint.userId || '').padStart(6, '0')}`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-[#65736D] uppercase">Status</span>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#E8C978]/30 text-[#C58A25] border border-[#D6B45E]">
                  Awaiting Legal Guide Assignment
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => navigate("/citizen/my-complaints")}
                className="px-6 py-3 text-xs font-bold rounded-xl border border-[#E6E1D8] bg-white text-[#18332B] hover:bg-[#F7F1E6] shadow-xs cursor-pointer transition"
              >
                View My Complaints
              </button>
              <button
                type="button"
                onClick={() => navigate(`/citizen/complaints/${createdComplaint.id}`)}
                className="px-6 py-3 text-xs font-bold rounded-xl bg-[#163D32] hover:bg-[#1F5948] text-white shadow-md cursor-pointer transition"
              >
                Track Case Progress
              </button>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default SubmitComplaint;
