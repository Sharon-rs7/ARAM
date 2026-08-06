import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/common/Button";
import { 
  Upload, Mic, MapPin, Sparkles, ArrowRight, ArrowLeft,
  CheckCircle, FileText, Globe, Home, Square
} from "lucide-react";
import { complaintService } from "../../services/complaintService";
import { documentService } from "../../services/documentService";
import { speechService } from "../../services/speechService";
import { aiService } from "../../services/aiService";
import { offlineDraftService } from "../../services/offlineDraftService";
import { toast } from "sonner";

const SubmitComplaint = () => {
  const navigate = useNavigate();
  
  // Tab selector state: 'simple' or 'detailed'
  const [mode, setMode] = useState("simple");
  
  // Multi-step sub-views: 'intake' -> 'analysis' -> 'success'
  const [currentStep, setCurrentStep] = useState("intake");
  
  // Main form states
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("Coimbatore");
  const [language, setLanguage] = useState("Tamil"); // 'Tamil', 'English', 'Hindi'
  const [incidentDate, setIncidentDate] = useState("");
  const [peopleInvolved, setPeopleInvolved] = useState("");
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [rawFile, setRawFile] = useState(null);
  
  // AI analysis extraction states (reviewed before submit)
  const [aiSummary, setAiSummary] = useState("");
  const [aiConcerns, setAiConcerns] = useState([]);
  const [aiPriority, setAiPriority] = useState("MEDIUM");
  const [aiCategory, setAiCategory] = useState("GENERAL_LEGAL_AID");
  
  // States for final created complaint
  const [createdComplaintId, setCreatedComplaintId] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  // Draft Auto-save notice state
  const [draftStatusText, setDraftStatusText] = useState("");

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
          if (draft.language) setLanguage(draft.language);
          if (draft.incidentDate) setIncidentDate(draft.incidentDate);
          if (draft.peopleInvolved) setPeopleInvolved(draft.peopleInvolved);
          setDraftStatusText("Draft restored");
          setTimeout(() => setDraftStatusText(""), 3000);
        }
      } catch (err) {
        console.warn("Failed to restore draft:", err);
      }
    };
    restoreDraft();
  }, []);

  // Debounced Auto-save to Local IndexedDB Storage
  useEffect(() => {
    if (!description.trim() && !title.trim()) {
      return;
    }

    setDraftStatusText("Saving...");
    const delayDebounceFn = setTimeout(async () => {
      try {
        const draftData = {
          mode,
          title,
          description,
          location,
          language,
          incidentDate,
          peopleInvolved
        };
        await offlineDraftService.saveDraft(draftData);
        setDraftStatusText("✓ Draft saved");
        setTimeout(() => setDraftStatusText(""), 2000);
      } catch (err) {
        console.warn("Failed to auto-save draft:", err);
      }
    }, 1000); // 1-second debounce

    return () => clearTimeout(delayDebounceFn);
  }, [mode, title, description, location, language, incidentDate, peopleInvolved]);

  const handleClearDraft = async () => {
    try {
      await offlineDraftService.clearDraft();
      setTitle("");
      setDescription("");
      setLocation("Coimbatore");
      setIncidentDate("");
      setPeopleInvolved("");
      setEvidenceFile(null);
      setRawFile(null);
      setDraftStatusText("Draft cleared");
      toast.success("Draft cleared successfully");
      setTimeout(() => setDraftStatusText(""), 2000);
    } catch (err) {
      toast.error("Failed to clear draft.");
    }
  };

  // Handle actual microphone capture & Faster-Whisper backend upload
  const handleVoiceRecord = async () => {
    if (recording) {
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        setRecording(false);
      }
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
        const audioBlob = new Blob(chunks, { type: "audio/wav" });
        toast.loading("Uploading voice to Faster-Whisper backend...");
        try {
          const langCode = language === "Tamil" ? "ta" : language === "Hindi" ? "hi" : "en";
          const res = await speechService.transcribeAudio(audioBlob, langCode);
          if (res && res.transcript) {
            setDescription(prev => (prev ? prev + " " : "") + res.transcript);
            toast.success("Voice transcribed successfully!");
          } else {
            toast.error("Failed to transcribe voice.");
          }
        } catch (err) {
          toast.error("Faster-Whisper service connection error. Please verify the AI service is running.");
        } finally {
          toast.dismiss();
        }
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
      toast.info("Microphone recording... Click mic again to stop.");
    } catch (err) {
      toast.error("Microphone permission denied.");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File exceeds 5MB size limit.");
      return;
    }
    setEvidenceFile(file.name);
    setRawFile(file);
    toast.success("Document attached successfully.");
  };

  const handleAnalyseWithAi = async () => {
    if (description.trim().length < 15) {
      toast.error("Please explain your problem in at least 15 characters.");
      return;
    }
    
    setLoading(true);
    toast.loading("Querying backend AI triage service...");
    
    try {
      const langCode = language === "Tamil" ? "ta" : language === "Hindi" ? "hi" : "en";
      const finalTitle = title.trim() || description.slice(0, 40).trim();
      
      const res = await aiService.analyzeComplaint(
        description,
        langCode,
        location,
        false,
        finalTitle
      );
      
      setAiSummary(res.summary || description);
      setAiPriority(res.priority || "MEDIUM");
      setAiCategory(res.category || "GENERAL_LEGAL_AID");
      
      const concernsList = [];
      if (res.category) concernsList.push(res.category.replace(/_/g, " "));
      if (res.subcategory) concernsList.push(res.subcategory.replace(/_/g, " "));
      if (res.priority === "HIGH" || res.priority === "CRITICAL") concernsList.push("High Urgency");
      
      setAiConcerns(concernsList.length > 0 ? concernsList : ["General Legal Aid"]);
      
      toast.dismiss();
      setCurrentStep("analysis");
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to fetch pre-submit AI analysis from server. Please verify the AI service is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSubmit = async () => {
    setLoading(true);
    try {
      const finalTitle = title.trim() || description.slice(0, 40).trim() || "Legal Aid Complaint";
      
      const payload = {
        title: finalTitle,
        category: aiCategory,
        location: location,
        district: location,
        description: description,
        priority: aiPriority,
        language: language === "Tamil" ? "TAMIL" : language === "Hindi" ? "HINDI" : "ENGLISH",
        identityVisibility: "VISIBLE",
        inputMode: "TEXT",
        disclaimerAccepted: true
      };
      
      const res = await complaintService.createComplaint(payload);
      
      if (rawFile && res && res.id) {
        try {
          const docFormData = new FormData();
          docFormData.append("file", rawFile);
          docFormData.append("complaintId", res.id);
          docFormData.append("documentType", "EVIDENCE_PROOF");
          await documentService.uploadDocument(docFormData);
        } catch (docErr) {
          console.warn("Evidence upload failed:", docErr);
        }
      }
      
      await offlineDraftService.clearDraft();
      setCreatedComplaintId(res.id || `ARAM-${Date.now()}`);
      setCurrentStep("success");
      toast.success("Complaint submitted successfully!");
    } catch (err) {
      toast.error("Failed to register complaint. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto space-y-6 pb-6">
        
        {/* VIEW 1: INTAKE SCREEN */}
        {currentStep === "intake" && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Submit a Complaint
                  </h2>
                  {draftStatusText && (
                    <span className="text-[9px] bg-indigo-50 text-indigo-650 px-2 py-0.5 rounded-full font-bold animate-pulse">
                      {draftStatusText}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1 font-semibold">
                  Tell us what happened. ARAM AI will help understand and route your complaint.
                </p>
              </div>
            </div>

            {/* Mode Select Buttons */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-800/40">
              <button
                type="button"
                onClick={() => setMode("simple")}
                className={`py-3 text-xs font-bold rounded-xl transition ${
                  mode === "simple"
                    ? "bg-white dark:bg-slate-900 text-indigo-650 dark:text-indigo-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                ● Simple Mode
              </button>
              <button
                type="button"
                onClick={() => setMode("detailed")}
                className={`py-3 text-xs font-bold rounded-xl transition ${
                  mode === "detailed"
                    ? "bg-white dark:bg-slate-900 text-indigo-650 dark:text-indigo-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Detailed Mode
              </button>
            </div>

            {/* Mode 1: Simple Intake Panel */}
            {mode === "simple" ? (
              <div className="glass-panel p-6 space-y-5">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[10px] font-extrabold text-slate-455 uppercase tracking-wider">
                      Describe your problem
                    </label>
                    {(description.trim() || title.trim()) && (
                      <button
                        type="button"
                        onClick={handleClearDraft}
                        className="text-[9px] font-extrabold text-rose-500 hover:text-rose-700 uppercase tracking-wider cursor-pointer transition"
                      >
                        Clear Draft
                      </button>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tell us what happened in your own words..."
                      rows={5}
                      className="w-full p-4 pr-12 rounded-2xl border border-slate-200 dark:border-slate-800 focus:border-indigo-500 outline-none text-xs font-medium bg-white dark:bg-slate-950/40 leading-relaxed"
                    />
                    <button
                      type="button"
                      onClick={handleVoiceRecord}
                      className={`absolute right-3 bottom-3 p-2 rounded-xl transition cursor-pointer ${
                        recording 
                          ? "bg-red-500 text-white animate-pulse" 
                          : "hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400 hover:text-slate-600"
                      }`}
                      title={recording ? "Stop" : "Voice mic"}
                    >
                      {recording ? <Square size={16} /> : <Mic size={18} />}
                    </button>
                  </div>
                </div>

                {/* Language Select buttons */}
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-450 uppercase tracking-wider mb-2">
                    Language
                  </label>
                  <div className="flex gap-2">
                    {["Tamil", "English", "Hindi"].map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setLanguage(lang)}
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                          language === lang
                            ? "bg-indigo-600 dark:bg-indigo-500 border-indigo-600 text-white shadow-sm"
                            : "border-slate-200 dark:border-slate-800 text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-850"
                        }`}
                      >
                        {lang === "Tamil" ? "தமிழ்" : lang === "Hindi" ? "हिंदी" : "English"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location Input */}
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-450 uppercase tracking-wider mb-2">
                    Location
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Enter location"
                      className="w-full h-11 pl-4 pr-10 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-xs font-semibold bg-white dark:bg-slate-950/40"
                    />
                    <MapPin className="absolute right-3.5 text-slate-400" size={16} />
                  </div>
                </div>

                {/* Evidence Upload */}
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-450 uppercase tracking-wider mb-2">
                    Evidence (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="simple-upload"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="simple-upload"
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer text-xs font-semibold text-slate-600 dark:text-slate-355 transition"
                    >
                      <Upload size={16} />
                      {evidenceFile ? evidenceFile : "Add photo or document"}
                    </label>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="primary"
                    onClick={handleAnalyseWithAi}
                    disabled={loading}
                    className="w-full py-4 text-xs font-bold rounded-xl bg-indigo-650 hover:bg-indigo-700 dark:bg-indigo-500 text-white flex items-center justify-center gap-2 btn-premium shadow-md cursor-pointer"
                  >
                    Analyse with AI <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
            ) : (
              /* Mode 2: Detailed Intake Panel */
              <div className="glass-panel p-6 space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[10px] font-extrabold text-slate-455 uppercase tracking-wider">
                      Title
                    </label>
                    {(description.trim() || title.trim()) && (
                      <button
                        type="button"
                        onClick={handleClearDraft}
                        className="text-[9px] font-extrabold text-rose-500 hover:text-rose-700 uppercase tracking-wider cursor-pointer transition"
                      >
                        Clear Draft
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter short title for grievance..."
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-455 uppercase tracking-wider mb-2">
                    Describe what happened
                  </label>
                  <div className="relative flex items-center">
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Explain the incident in detail..."
                      rows={4}
                      className="w-full p-4 pr-12 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-xs font-medium"
                    />
                    <button
                      type="button"
                      onClick={handleVoiceRecord}
                      className={`absolute right-3 bottom-3 p-2 rounded-xl transition cursor-pointer ${
                        recording ? "bg-red-500 text-white animate-pulse" : "text-slate-400 hover:bg-slate-100"
                      }`}
                      title={recording ? "Stop" : "Dictate"}
                    >
                      {recording ? <Square size={14} /> : <Mic size={16} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-455 uppercase tracking-wider mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-455 uppercase tracking-wider mb-2">
                      When did this happen?
                    </label>
                    <input
                      type="date"
                      value={incidentDate}
                      onChange={(e) => setIncidentDate(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-xs font-semibold text-slate-655 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-455 uppercase tracking-wider mb-2">
                    People involved (optional)
                  </label>
                  <input
                    type="text"
                    value={peopleInvolved}
                    onChange={(e) => setPeopleInvolved(e.target.value)}
                    placeholder="Names or relationship details..."
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-455 uppercase tracking-wider mb-2">
                    Evidence File (Optional)
                  </label>
                  <input
                    type="file"
                    id="detailed-upload"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="detailed-upload"
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-350 cursor-pointer text-xs font-bold text-slate-550 transition hover:bg-slate-50"
                  >
                    <Upload size={16} />
                    {evidenceFile ? evidenceFile : "Attach photo or document"}
                  </label>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-455 uppercase tracking-wider mb-2">
                    Language
                  </label>
                  <div className="flex gap-2">
                    {["Tamil", "English", "Hindi"].map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setLanguage(lang)}
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                          language === lang
                            ? "bg-indigo-650 border-indigo-600 text-white"
                            : "border-slate-200 text-slate-655 hover:bg-slate-50"
                        }`}
                      >
                        {lang === "Tamil" ? "தமிழ்" : lang === "Hindi" ? "हिंदी" : "English"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="primary"
                    onClick={handleAnalyseWithAi}
                    disabled={loading}
                    className="w-full py-4 text-xs font-bold rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 btn-premium cursor-pointer"
                  >
                    Analyse with AI <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: AI ANALYSIS SCREEN */}
        {currentStep === "analysis" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <button
                onClick={() => setCurrentStep("intake")}
                className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
              >
                <ArrowLeft size={16} /> Back
              </button>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Sparkles className="text-indigo-500" size={22} />
                AI Complaint Analysis
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-semibold">
                ✓ We understood your complaint. Please confirm details below.
              </p>
            </div>

            <div className="space-y-4">
              <div className="glass-panel p-6 space-y-3">
                <h3 className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest">
                  Summary
                </h3>
                <p className="text-xs leading-relaxed text-slate-655 dark:text-slate-355 font-medium">
                  {aiSummary}
                </p>
              </div>

              <div className="glass-panel p-6 space-y-3">
                <h3 className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest">
                  Detected Concerns
                </h3>
                <div className="flex flex-wrap gap-2">
                  {aiConcerns.map((tag) => (
                    <span 
                      key={tag}
                      className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-[10px] font-bold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="glass-panel p-5">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Priority</span>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${aiPriority === "HIGH" || aiPriority === "CRITICAL" ? "bg-red-500" : "bg-amber-500"}`} />
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{aiPriority}</span>
                  </div>
                </div>
                
                <div className="glass-panel p-5">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Language</span>
                  <div className="flex items-center gap-2 mt-2">
                    <Globe size={14} className="text-slate-455" />
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{language}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/40 rounded-2xl text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                <strong className="text-slate-700 dark:text-slate-350 block mb-1">What happens next?</strong>
                After submission, the ARAM Admin team will review your complaint and assign a suitable Guide to assist you.
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setCurrentStep("intake")}
                  className="flex-1 py-3 text-xs font-bold rounded-xl border border-slate-250 hover:bg-slate-50 transition cursor-pointer text-slate-700"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubmit}
                  disabled={loading}
                  className="flex-2 py-3 text-xs font-bold rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 btn-premium shadow-md cursor-pointer"
                >
                  Confirm & Submit →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: SUCCESS MODAL */}
        {currentStep === "success" && (
          <div className="glass-panel p-8 text-center space-y-6 animate-in zoom-in-95 duration-250">
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
              <CheckCircle size={32} />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Complaint Submitted
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Your complaint has been successfully registered.
              </p>
            </div>

            <div className="max-w-xs mx-auto border border-slate-100 dark:border-slate-800/40 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-950/20 text-left space-y-3.5">
              <div>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Complaint ID</span>
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                  {createdComplaintId || "ARAM-2026-00124"}
                </span>
              </div>
              <hr className="border-slate-200/50" />
              <div>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Status</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Awaiting Admin Review</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed max-w-sm mx-auto">
              We will notify you on your dashboard and via message as soon as a Legal Guide is assigned to your case.
            </p>

            <div className="flex gap-3 pt-4 max-w-sm mx-auto">
              <button
                onClick={() => navigate(`/citizen/my-complaints`)}
                className="flex-1 py-3 text-xs font-bold rounded-xl border border-slate-250 hover:bg-slate-50 transition cursor-pointer text-slate-700"
              >
                View Complaint
              </button>
              <button
                onClick={() => navigate("/citizen/dashboard")}
                className="flex-1 py-3 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5 btn-premium shadow-md cursor-pointer"
              >
                <Home size={14} /> Go Home
              </button>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default SubmitComplaint;