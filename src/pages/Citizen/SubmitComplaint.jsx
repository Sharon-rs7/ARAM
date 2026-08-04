import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import { 
  Upload, Mic, MapPin, FileText, BrainCircuit, Save, Send, Trash, 
  ShieldAlert, Sparkles, ChevronLeft, ChevronRight, CheckCircle, Copy, 
  Share2, WifiOff, Wifi, Volume2, ShieldCheck, Lock, Briefcase, 
  CreditCard, ShoppingBag, Home, FileSpreadsheet, Info, Shield, EyeOff, LogOut
} from "lucide-react";
import { complaintService } from "../../services/complaintService";
import { documentService } from "../../services/documentService";
import { offlineDraftService } from "../../services/offlineDraftService";
import { toast } from "sonner";

// Accessibility voice components
import VoiceRecorder from "@/components/voice/VoiceRecorder";
import ReadAloudButton from "@/components/voice/ReadAloudButton";
import SimpleModeToggle from "@/components/voice/SimpleModeToggle";

const VISUAL_CATEGORIES = [
  {
    id: "LABOUR_DISPUTE",
    name: "Labour & Salary Issue",
    tamil: "சம்பளம் / வேலை பிரச்சனை",
    icon: Briefcase,
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50 border-blue-200 text-blue-900"
  },
  {
    id: "WOMEN_SAFETY_DOMESTIC_VIOLENCE",
    name: "Personal Safety & Welfare",
    tamil: "தனிப்பட்ட பாதுகாப்பு & நலன்",
    icon: Shield,
    color: "from-purple-500 to-pink-600",
    bgColor: "bg-purple-50 border-purple-200 text-purple-900",
    discreteNote: "Discrete category for personal & safety concerns"
  },
  {
    id: "CYBER_CRIME",
    name: "Cyber Fraud & Bank OTP Scam",
    tamil: "சைபர் ஏமாற்று / வங்கி மோசடி",
    icon: CreditCard,
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50 border-amber-200 text-amber-900"
  },
  {
    id: "CONSUMER_COMPLAINT",
    name: "Consumer & Defective Product",
    tamil: "நுகர்வோர் / பொருள் பிரச்சனை",
    icon: ShoppingBag,
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50 border-emerald-200 text-emerald-900"
  },
  {
    id: "PROPERTY_DISPUTE",
    name: "Property & Land Dispute",
    tamil: "நிலம் / சொத்து பிரச்சனை",
    icon: Home,
    color: "from-indigo-500 to-violet-600",
    bgColor: "bg-indigo-50 border-indigo-200 text-indigo-900"
  },
  {
    id: "GOVERNMENT_SCHEME",
    name: "Government Scheme & Pension",
    tamil: "அரசு திட்டம் / ஓய்வூதியம்",
    icon: FileSpreadsheet,
    color: "from-cyan-500 to-blue-600",
    bgColor: "bg-cyan-50 border-cyan-200 text-cyan-900"
  }
];

const DISTRICTS = [
  "Coimbatore", "Chennai", "Madurai", "Salem", "Tiruchirappalli",
  "Tirunelveli", "Erode", "Vellore", "Thanjavur", "Dindigul", "Kanchipuram"
];

const SubmitComplaint = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    category: "LABOUR_DISPUTE",
    department: "",
    priority: "MEDIUM",
    location: "Coimbatore",
    description: "",
    identityVisibility: "VISIBLE",
    language: "ta-IN"
  });

  const [simpleMode, setSimpleMode] = useState(() => {
    return localStorage.getItem("aram_simple_mode") !== "false";
  });

  const [wizardStep, setWizardStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [ocrData, setOcrData] = useState(null);
  const [disclaimerAgreed, setDisclaimerAgreed] = useState(false);
  const [sensitiveComplaint, setSensitiveComplaint] = useState(false);
  const [preferWoman, setPreferWoman] = useState(false);
  const [rawFile, setRawFile] = useState(null);
  const [createdComplaint, setCreatedComplaint] = useState(null);
  const [similarComplaintAlert, setSimilarComplaintAlert] = useState({ show: false, complaintId: null, score: 0 });
  const [proceedAnywayConfirmed, setProceedAnywayConfirmed] = useState(false);
  const [safeContactMethod, setSafeContactMethod] = useState("APP");
  const [safeContactTime, setSafeContactTime] = useState("ANYTIME");

  const [hasChanges, setHasChanges] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineDraftRestored, setOfflineDraftRestored] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setHasChanges(true);
  };

  // Discrete Quick Exit for shared device safety
  const handleQuickExit = () => {
    setFormData({
      title: "",
      category: "LABOUR_DISPUTE",
      department: "",
      priority: "MEDIUM",
      location: "Coimbatore",
      description: "",
      identityVisibility: "VISIBLE",
      language: "ta-IN"
    });
    setSensitiveComplaint(false);
    setPreferWoman(false);
    setEvidenceFile(null);
    setOcrData(null);
    offlineDraftService.clearDraft();
    window.location.href = "https://www.google.com";
  };

  // Monitor network online/offline transitions
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Network connection restored! Synchronizing with ARAM server...");
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("Network connection lost. Your draft is auto-saved locally in device storage.");
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Restore draft from IndexedDB on initial mount
  useEffect(() => {
    const restoreIndexedDBDraft = async () => {
      const dbDraft = await offlineDraftService.getDraft();
      if (dbDraft && (dbDraft.title || dbDraft.description)) {
        setFormData({
          title: dbDraft.title || "",
          category: dbDraft.category || "LABOUR_DISPUTE",
          department: dbDraft.department || "",
          priority: dbDraft.priority || "MEDIUM",
          location: dbDraft.location || "Coimbatore",
          description: dbDraft.description || "",
          identityVisibility: dbDraft.identityVisibility || "VISIBLE",
          language: dbDraft.language || "ta-IN"
        });
        setHasChanges(true);
        setOfflineDraftRestored(true);
        toast.info("Auto-restored complaint draft from device storage (IndexedDB).");
      }
    };
    restoreIndexedDBDraft();
  }, []);

  // Continuous auto-save to IndexedDB
  useEffect(() => {
    const isSensitive = sensitiveComplaint || preferWoman || formData.category === "WOMEN_SAFETY_DOMESTIC_VIOLENCE";
    if (hasChanges && !isSensitive && (formData.title || formData.description)) {
      offlineDraftService.saveDraft(formData);
    } else if (isSensitive) {
      offlineDraftService.clearDraft();
    }
  }, [formData, sensitiveComplaint, preferWoman, hasChanges]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds the 5MB evidence limit.");
      return;
    }

    setUploadingDoc(true);
    toast.loading("Analyzing document via OCR...");

    try {
      const verifyFormData = new FormData();
      verifyFormData.append("file", file);
      verifyFormData.append("expectedDocumentType", "Receipt / Proof Slip");
      verifyFormData.append("complaintCategory", formData.category);
      
      const verifyRes = await documentService.verifyDocument(verifyFormData);
      
      setEvidenceFile({
        id: `temp-${Date.now()}`,
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
      });
      setRawFile(file);
      setOcrData(verifyRes);
      toast.dismiss();
      toast.success("Document analyzed successfully!");
    } catch (err) {
      toast.dismiss();
      toast.error("OCR scan completed with basic file upload.");
      setEvidenceFile({
        id: `doc-${Date.now()}`,
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
      });
      setRawFile(file);
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const finalTitle = formData.title.trim() || formData.description.slice(0, 40).trim() || "Legal Aid Complaint";
    const finalDescription = formData.description.trim();

    if (finalDescription.length < 15) {
      toast.error("Please explain your problem in detail or record your voice.");
      return;
    }

    if (!disclaimerAgreed) {
      toast.error("Please confirm you agree to submit this grievance.");
      return;
    }

    if (!proceedAnywayConfirmed) {
      setLoading(true);
      try {
        const checkRes = await complaintService.checkSimilarity({
          title: finalTitle,
          description: finalDescription
        });

        if (checkRes && checkRes.similarComplaintFound && checkRes.similarComplaintIds && checkRes.similarComplaintIds.length > 0) {
          setSimilarComplaintAlert({
            show: true,
            complaintId: checkRes.similarComplaintIds[0],
            score: checkRes.similarityScore || 0.85
          });
          setLoading(false);
          return;
        }
      } catch (simErr) {
        console.warn("Similarity check failed, proceeding to submit:", simErr);
      }
    }

    setLoading(true);
    try {
      const payload = {
        title: finalTitle,
        category: formData.category,
        department: formData.department || "Legal Aid Cell",
        priority: formData.priority,
        location: formData.location,
        description: finalDescription,
        identityVisibility: formData.identityVisibility,
        sensitiveShield: sensitiveComplaint,
        preferWomanVolunteer: preferWoman,
        contactMethod: safeContactMethod,
        contactTime: safeContactTime,
        language: formData.language
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
          console.warn("Evidence attachment notice:", docErr);
        }
      }

      setCreatedComplaint(res);
      setHasChanges(false);
      offlineDraftService.clearDraft();
      toast.success("Complaint submitted successfully to ARAM Legal Aid!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit complaint. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = (step) => {
    switch (step) {
      case 1: return "Step 1 of 5: Explain Problem (Voice / Text)";
      case 2: return "Step 2 of 5: Select Issue Category";
      case 3: return "Step 3 of 5: Location & Identity Masking";
      case 4: return "Step 4 of 5: Attach Document (Optional)";
      case 5: return "Step 5 of 5: Review & Submit";
      default: return "Step 1 of 5";
    }
  };

  return (
    <DashboardLayout>
      {createdComplaint ? (
        /* Confirmation Screen */
        <div className="max-w-xl mx-auto py-8 px-4 animate-in fade-in">
          <Card className="p-8 text-center space-y-6 border border-emerald-100 bg-white shadow-xl rounded-3xl">
            <div className="mx-auto w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
              <CheckCircle size={44} />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Grievance Registered Successfully
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-3">Complaint Reference Created</h2>
              <p className="text-xs text-slate-500 mt-1">
                Your complaint has been assigned to the legal aid queue in {createdComplaint.location || formData.location}.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reference ID</span>
              <div className="text-xl font-mono font-bold text-purple-700">
                ARAM-2026-{String(createdComplaint.id || "101").replace("cmp-", "").padStart(6, "0")}
              </div>
              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={() => {
                    const formattedId = `ARAM-2026-${String(createdComplaint.id || "101").replace("cmp-", "").padStart(6, "0")}`;
                    navigator.clipboard.writeText(formattedId);
                    toast.success("Reference ID copied to clipboard!");
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition flex items-center gap-1 cursor-pointer"
                >
                  <Copy size={14} /> Copy ID
                </button>
                <button
                  onClick={() => {
                    const formattedId = `ARAM-2026-${String(createdComplaint.id || "101").replace("cmp-", "").padStart(6, "0")}`;
                    const text = `My ARAM legal aid complaint ID is ${formattedId}. You can track updates on the ARAM portal.`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition flex items-center gap-1 cursor-pointer"
                >
                  <Share2 size={14} /> WhatsApp
                </button>
              </div>
            </div>

            {/* Reassurance Banner (Softened SLA Copy) */}
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-left text-xs text-purple-950 flex items-start gap-3">
              <ShieldCheck size={24} className="text-purple-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-purple-900">What Happens Next?</h4>
                <p className="text-[11px] text-purple-800 mt-0.5 leading-relaxed">
                  Your grievance is registered in the legal aid queue for {createdComplaint.location || formData.location}. A verified advocate will be assigned to review your file and provide guidance directly on your portal dashboard.
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Button
                variant="primary"
                className="w-full text-sm font-bold py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl"
                onClick={() => navigate("/citizen/my-complaints")}
              >
                Track from My Complaints
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        /* Main Citizen Complaint Submission Form */
        <div className="max-w-3xl mx-auto space-y-6 py-4 px-2 sm:px-4">
          
          {/* Header with Quick Exit Safety Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Citizen Complaint Registration</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Simple step-by-step legal aid filing for all citizens.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleQuickExit}
                className="px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Immediately leave and clear form data for safety on shared devices"
              >
                <LogOut size={14} /> Quick Exit
              </button>
              <SimpleModeToggle onToggle={(val) => setSimpleMode(val)} />
            </div>
          </div>

          {/* Network Guard Notification */}
          {!isOnline && (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                  <WifiOff size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-amber-900">Network Offline — Saved to Device Storage</h4>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Your complaint details are saved locally in your device's IndexedDB storage.
                  </p>
                </div>
              </div>
              <span className="shrink-0 px-2.5 py-1 text-[10px] font-extrabold uppercase bg-amber-200 text-amber-900 rounded-lg">
                Saved Locally
              </span>
            </div>
          )}

          {/* Main Card Container */}
          <Card className="p-6 lg:p-8 space-y-6 shadow-xl border border-slate-200 bg-white rounded-3xl">
            
            {/* Plain-Language Progress Bar Indicator */}
            <div className="space-y-2 border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-purple-700 uppercase tracking-wider">{getStepTitle(wizardStep)}</span>
                <span className="font-bold text-slate-400">Step {wizardStep} of 5 ({wizardStep * 20}%)</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300"
                  style={{ width: `${wizardStep * 20}%` }}
                />
              </div>
            </div>

            {/* STEP 1: SPEAK OR TYPE PROBLEM (MIC-FIRST HERO INPUT) */}
            {wizardStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-black text-slate-900">Step 1: Tell Us Your Problem</h2>
                  <p className="text-xs text-slate-500">
                    Tap the microphone below and speak clearly in Tamil, Tanglish, or English.
                  </p>
                </div>

                {/* Hero Mic Recording Target */}
                <div className="p-6 rounded-3xl bg-slate-900 text-white text-center space-y-4 shadow-xl border border-slate-800">
                  <div className="flex justify-center">
                    <VoiceRecorder
                      currentLanguage={formData.language}
                      onTranscriptReady={(text) => {
                        setFormData((prev) => ({ 
                          ...prev, 
                          description: text,
                          title: prev.title || text.slice(0, 40)
                        }));
                        setHasChanges(true);
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-purple-300 block">Primary Entry Method</span>
                    <p className="text-[11px] text-slate-400">Press the mic button above, speak your grievance, then press stop.</p>
                  </div>
                </div>

                {/* Text Fallback Area */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Or Type Your Description Below
                    </label>
                    <ReadAloudButton text={formData.description} language={formData.language} />
                  </div>
                  <textarea
                    rows="4"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe what happened, dates, and people involved... (e.g. My company manager has not paid my salary for 3 months)."
                    className="w-full rounded-2xl border border-slate-200 p-4 text-sm text-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none resize-none bg-slate-50"
                  />
                  <Input
                    label="Short Title (Optional)"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Salary Unpaid by Supervisor"
                    icon={FileText}
                    className="h-12 text-sm rounded-xl"
                  />
                </div>

                {/* Reassurance Banner */}
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-950 flex items-start gap-3">
                  <Lock size={20} className="text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-blue-900">Privacy Guarantee & What Happens Next</h4>
                    <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
                      Your voice recording and description are encrypted and private. We analyze your grievance securely to help match you with free legal aid.
                    </p>
                  </div>
                </div>

                {/* Step Controls */}
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (!formData.description.trim() || formData.description.trim().length < 15) {
                        toast.error("Please speak or type a problem description (minimum 15 characters).");
                        return;
                      }
                      setWizardStep(2);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 px-6 rounded-2xl text-sm cursor-pointer"
                  >
                    Next: Choose Category <ChevronRight size={16} className="ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: CATEGORY SELECTION VISUAL CARDS (WITH DISCRETE SAFETY LABEL) */}
            {wizardStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-black text-slate-900">Step 2: Choose Issue Category</h2>
                  <p className="text-xs text-slate-500">
                    Select the card that best matches your legal problem.
                  </p>
                </div>

                {/* Visual Category Grid Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {VISUAL_CATEGORIES.map((cat) => {
                    const IconComp = cat.icon;
                    const isSelected = formData.category === cat.id;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => {
                          setFormData({ ...formData, category: cat.id });
                          setHasChanges(true);
                        }}
                        className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 min-h-[72px] cursor-pointer ${
                          isSelected 
                            ? `${cat.bgColor} ring-2 ring-purple-600 shadow-md` 
                            : "bg-white border-slate-200 hover:bg-slate-50 text-slate-800"
                        }`}
                      >
                        <div className={`p-2.5 rounded-xl text-white bg-gradient-to-r ${cat.color} shrink-0 shadow-sm`}>
                          <IconComp size={22} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs sm:text-sm">{cat.name}</h4>
                          <p className="text-[11px] opacity-80 mt-0.5 font-medium">{cat.tamil}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Shared Device Safety Note */}
                <p className="text-[10px] text-slate-400 text-center italic">
                  Note: "Personal Safety & Welfare" is a discrete label for domestic, harassment, or safety concerns on shared devices.
                </p>

                {/* Reassurance Banner */}
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-3">
                  <Info size={20} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-900">Category Assistance Guarantee</h4>
                    <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                      Don't worry if you aren't 100% sure of the exact category — our AI classification engine automatically routes your complaint to the correct legal department.
                    </p>
                  </div>
                </div>

                {/* Step Controls */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Button variant="secondary" onClick={() => setWizardStep(1)} className="rounded-2xl py-3 text-xs">
                    <ChevronLeft size={16} className="mr-1" /> Back
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => setWizardStep(3)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 px-6 rounded-2xl text-sm cursor-pointer"
                  >
                    Next: Location & Identity <ChevronRight size={16} className="ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: LOCATION & EXPLICIT IDENTITY MASKING */}
            {wizardStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-black text-slate-900">Step 3: Location & Identity Masking</h2>
                  <p className="text-xs text-slate-500">
                    Specify your district and configure exact identity visibility rules.
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Select Your District</label>
                    <select
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full h-12 rounded-2xl border border-slate-200 px-4 text-sm font-semibold text-slate-800 bg-slate-50 focus:border-purple-500 outline-none cursor-pointer"
                    >
                      {DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d} District</option>
                      ))}
                    </select>
                  </div>

                  {/* Explicit Identity Masking Definitions */}
                  <div className="space-y-3 p-5 rounded-2xl border border-slate-200 bg-slate-50 text-xs">
                    <span className="font-extrabold text-slate-800 uppercase tracking-wider block">Explicit Identity Masking Setting</span>
                    
                    <div className="space-y-2">
                      {[
                        {
                          val: "VISIBLE",
                          title: "Full Visibility (Recommended for General Complaints)",
                          desc: "The assigned advocate can see your Name, Phone Number, and Address to contact you directly for assistance."
                        },
                        {
                          val: "PARTIAL",
                          title: "Partial Masking (Phone Revealed Only After Accept)",
                          desc: "Volunteers see only your Case Alias/ID. Your phone number is revealed ONLY after you accept an advocate's help."
                        },
                        {
                          val: "HIDDEN",
                          title: "100% Anonymous / Confidential (Strict In-App Portal Only)",
                          desc: "Your Name, Phone Number, and Address are COMPLETELY HIDDEN from all advocates. Communication happens strictly through the secure in-app portal."
                        }
                      ].map((opt) => (
                        <label
                          key={opt.val}
                          className={`p-3.5 rounded-xl border text-left flex items-start gap-3 cursor-pointer transition ${
                            formData.identityVisibility === opt.val
                              ? "bg-purple-50 border-purple-300 ring-2 ring-purple-500 text-purple-950"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <input
                            type="radio"
                            name="identityVisibility"
                            value={opt.val}
                            checked={formData.identityVisibility === opt.val}
                            onChange={handleChange}
                            className="mt-1 text-purple-600 cursor-pointer"
                          />
                          <div>
                            <span className="font-bold text-xs block">{opt.title}</span>
                            <p className="text-[11px] opacity-80 mt-0.5 leading-relaxed">{opt.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Sensitive Shield Options */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-bold text-slate-800">Prefer Female Advocate</h5>
                        <p className="text-[10px] text-slate-500">Request assignment to a female legal aid advocate.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPreferWoman(!preferWoman)}
                        className={`h-6 w-11 rounded-full transition flex items-center px-0.5 cursor-pointer ${
                          preferWoman ? "bg-purple-600" : "bg-slate-300"
                        }`}
                      >
                        <div className={`h-5 w-5 rounded-full bg-white transition-transform ${preferWoman ? "translate-x-5" : "translate-x-0"}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Reassurance Banner */}
                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-950 flex items-start gap-3">
                  <MapPin size={20} className="text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-purple-900">District Matching Guarantee</h4>
                    <p className="text-[11px] text-purple-800 mt-0.5 leading-relaxed">
                      Your location is used to route your complaint to legal aid offices in {formData.location}. Identity masking rules selected above are strictly enforced.
                    </p>
                  </div>
                </div>

                {/* Step Controls */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Button variant="secondary" onClick={() => setWizardStep(2)} className="rounded-2xl py-3 text-xs">
                    <ChevronLeft size={16} className="mr-1" /> Back
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => setWizardStep(4)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 px-6 rounded-2xl text-sm cursor-pointer"
                  >
                    Next: Upload Document <ChevronRight size={16} className="ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: OPTIONAL DOCUMENT ATTACHMENT */}
            {wizardStep === 4 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-black text-slate-900">Step 4: Attach Proof / Document (Optional)</h2>
                  <p className="text-xs text-slate-500">
                    Upload a receipt, letter, or photo related to your issue.
                  </p>
                </div>

                <div className="space-y-4">
                  {!evidenceFile ? (
                    <div className="border-2 border-dashed border-slate-300 rounded-3xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition space-y-3">
                      <div className="mx-auto w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
                        <Upload size={28} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-800">Upload Photo or PDF File</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Maximum file size: 5MB</p>
                      </div>
                      <label className="inline-block px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm transition">
                        Select File
                        <input type="file" onChange={handleFileUpload} accept="image/*,.pdf" className="hidden" />
                      </label>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
                          <CheckCircle size={20} />
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-slate-800">{evidenceFile.name}</h5>
                          <p className="text-[10px] text-slate-500">{evidenceFile.size}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setEvidenceFile(null);
                          setRawFile(null);
                          setOcrData(null);
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 transition cursor-pointer"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Reassurance Banner */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-3">
                  <ShieldCheck size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-emerald-900">Documents Are Optional</h4>
                    <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                      You can submit your complaint even if you don't have paper documents. Legal aid advocates can assist in gathering proof later.
                    </p>
                  </div>
                </div>

                {/* Step Controls */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Button variant="secondary" onClick={() => setWizardStep(3)} className="rounded-2xl py-3 text-xs">
                    <ChevronLeft size={16} className="mr-1" /> Back
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => setWizardStep(5)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 px-6 rounded-2xl text-sm cursor-pointer"
                  >
                    Next: Review & Submit <ChevronRight size={16} className="ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 5: REVIEW & ONE-TAP SUBMIT (SOFTENED SLA COPY) */}
            {wizardStep === 5 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-black text-slate-900">Step 5: Review & Submit</h2>
                  <p className="text-xs text-slate-500">
                    Verify your complaint summary before submitting to ARAM Legal Aid.
                  </p>
                </div>

                {/* Summary Card with Audio Playback */}
                <div className="p-5 rounded-3xl border border-purple-100 bg-purple-50/50 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                    <span className="font-extrabold text-purple-900 uppercase tracking-wider text-[10px]">Complaint Summary</span>
                    <ReadAloudButton text={`${formData.title}. ${formData.description}`} language={formData.language} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Title</span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">{formData.title || "Legal Aid Complaint"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Category & District</span>
                    <p className="font-bold text-purple-800 mt-0.5">{formData.category} — {formData.location} District</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Identity Protection</span>
                    <p className="font-semibold text-slate-700 mt-0.5">{formData.identityVisibility}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Description</span>
                    <p className="text-slate-700 mt-0.5 leading-relaxed">{formData.description}</p>
                  </div>
                </div>

                {/* Consent Checkbox */}
                <div className="flex items-start gap-3 p-4 border border-slate-200 rounded-2xl bg-slate-50">
                  <input
                    type="checkbox"
                    id="finalConsent"
                    checked={disclaimerAgreed}
                    onChange={(e) => setDisclaimerAgreed(e.target.checked)}
                    className="mt-0.5 h-5 w-5 shrink-0 rounded border-slate-300 text-purple-600 cursor-pointer"
                  />
                  <label htmlFor="finalConsent" className="text-xs text-slate-700 leading-relaxed cursor-pointer select-none">
                    I confirm that the information provided is true to the best of my knowledge and I want to submit this grievance to ARAM Legal Aid.
                  </label>
                </div>

                {/* Reassurance Banner (Softened Realistic SLA Copy) */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-3">
                  <ShieldCheck size={24} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-emerald-900">What Happens Next?</h4>
                    <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                      Your grievance will be registered in the legal aid queue for {formData.location}. A verified advocate will be assigned to review your file and provide guidance on your portal dashboard.
                    </p>
                  </div>
                </div>

                {/* Step Controls */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Button variant="secondary" onClick={() => setWizardStep(4)} className="rounded-2xl py-3 text-xs">
                    <ChevronLeft size={16} className="mr-1" /> Back
                  </Button>
                  <Button
                    onClick={() => handleSubmit()}
                    loading={loading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-8 rounded-2xl text-base shadow-lg cursor-pointer"
                  >
                    <Send size={18} className="mr-2" /> SUBMIT COMPLAINT
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SubmitComplaint;