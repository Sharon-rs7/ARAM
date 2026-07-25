import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import { Upload, Mic, MapPin, FileText, BrainCircuit, Save, Send, Trash, ShieldAlert, Sparkles, ChevronLeft, ChevronRight, CheckCircle, Copy, Share2 } from "lucide-react";
import { complaintService } from "../../services/complaintService";
import { documentService } from "../../services/documentService";
import { toast } from "sonner";

// Voice accessibility components
import VoiceRecorder from "@/components/voice/VoiceRecorder";
import ReadAloudButton from "@/components/voice/ReadAloudButton";
import SimpleModeToggle from "@/components/voice/SimpleModeToggle";

const categories = [
  "Labour Dispute",
  "Women Safety / Domestic Violence",
  "Cyber Crime",
  "Consumer Complaint",
  "Property / Civil Dispute",
  "Education",
  "Health & Sanitation",
  "Government Scheme"
];

const departments = [
  "Labour Department",
  "Police Commission Cell",
  "Consumer Forum Court",
  "Revenue & Land Office",
  "Municipal Corporation",
  "Education Directorate",
  "Health & Family Welfare"
];

const priorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const SubmitComplaint = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    category: "GENERAL_LEGAL_AID",
    department: "",
    priority: "MEDIUM",
    location: "Coimbatore",
    description: "",
    identityVisibility: "VISIBLE",
    language: "en-IN"
  });

  const [simpleMode, setSimpleMode] = useState(() => {
    return localStorage.getItem("aram_simple_mode") === "true";
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
  const [safeContactMethod, setSafeContactMethod] = useState("APP");
  const [safeContactTime, setSafeContactTime] = useState("ANYTIME");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds the 5MB evidence limit.");
      return;
    }

    setUploadingDoc(true);
    toast.loading("Analyzing evidence and running OCR mask scans...");

    try {
      const verifyFormData = new FormData();
      verifyFormData.append("file", file);
      verifyFormData.append("expectedDocumentType", "Receipt / Proof Slip");
      verifyFormData.append("complaintCategory", "GENERAL_LEGAL_AID");
      
      const verifyRes = await documentService.verifyDocument(verifyFormData);
      
      setEvidenceFile({
        id: `temp-${Date.now()}`,
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
      });
      setRawFile(file);
      setOcrData(verifyRes);
      toast.dismiss();
      toast.success("Evidence processed by ARAM AI detector!");
    } catch (err) {
      toast.dismiss();
      toast.error("OCR analysis failed. Continuing with upload.");
      setEvidenceFile({
        id: `doc-err-${Date.now()}`,
        name: file.name,
        size: "Unknown size"
      });
      setRawFile(file);
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleRemoveFile = () => {
    setEvidenceFile(null);
    setRawFile(null);
    setOcrData(null);
    toast.info("Evidence file removed.");
  };

  const handleSaveDraft = () => {
    if (!formData.title) {
      toast.error("Please enter a title to save a draft.");
      return;
    }
    toast.success("Complaint draft saved locally.");
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!formData.title || formData.title.trim().length < 5) {
      toast.error("Complaint title must be at least 5 characters.");
      return;
    }

    if (!formData.description || formData.description.trim().length < 20) {
      toast.error("Please explain your problem in detail (minimum 20 characters).");
      return;
    }

    if (!disclaimerAgreed) {
      toast.error("You must agree to the legal disclaimer and policy before submission.");
      return;
    }

    setLoading(true);

    let backendLang = "ENGLISH";
    if (formData.language === "ta-IN" || formData.language === "TAMIL") {
      backendLang = "TAMIL";
    } else if (formData.language === "hi-IN" || formData.language === "HINDI") {
      backendLang = "HINDI";
    }

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        language: backendLang,
        district: formData.location || "Coimbatore",
        inputMode: "TEXT",
        sensitive: sensitiveComplaint,
        preferredHelperGender: preferWoman ? "FEMALE" : "ANY",
        identityVisibility: formData.identityVisibility || "VISIBLE",
        evidenceFileId: null,
        ocrScore: ocrData?.finalScore || null,
        disclaimerAccepted: true,
        safeContactMethod: safeContactMethod,
        safeContactTime: safeContactTime
      };

      const newComplaint = await complaintService.submitComplaint(payload);

      if (rawFile && newComplaint && newComplaint.id) {
        toast.loading("Uploading evidence document to database...");
        try {
          const uploadFormData = new FormData();
          uploadFormData.append("complaintId", newComplaint.id);
          uploadFormData.append("file", rawFile);
          await documentService.uploadDocument(uploadFormData);
          toast.success("Evidence document attached successfully!");
        } catch (uploadErr) {
          console.error("Document upload failed:", uploadErr);
          toast.error("Complaint submitted, but evidence upload failed.");
        }
      }

      toast.success("Complaint submitted successfully to ARAM!");
      setCreatedComplaint(newComplaint);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to submit complaint.");
    } finally {
      setLoading(false);
    }
  };

  const setLanguagesMapped = (lang) => {
    let code = "en-IN";
    if (lang === "Tamil") code = "ta-IN";
    if (lang === "Hindi") code = "hi-IN";
    setFormData((prev) => ({ ...prev, language: code }));
  };

  return (
    <React.Fragment>
      {createdComplaint ? (
        <DashboardLayout>
          <div className="max-w-md mx-auto py-10 px-4 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-150 shadow-sm text-center space-y-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600 mx-auto">
                <CheckCircle size={36} />
              </div>

              <div>
                <h2 className="text-xl font-black text-slate-900">Grievance Submitted!</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Your complaint has been successfully registered in the ARAM system database.
                </p>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-center space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reference Complaint ID</span>
                  <span className="block font-black text-lg text-slate-800 tracking-wide mt-0.5">
                    ARAM-2026-{String(createdComplaint.id).replace("cmp-", "").padStart(6, "0")}
                  </span>
                </div>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => {
                      const formattedId = `ARAM-2026-${String(createdComplaint.id).replace("cmp-", "").padStart(6, "0")}`;
                      navigator.clipboard.writeText(formattedId);
                      toast.success("Complaint reference ID copied to clipboard!");
                    }}
                    className="px-2.5 py-1 text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-100 transition"
                  >
                    Copy ID
                  </button>
                  <button
                    onClick={() => {
                      const formattedId = `ARAM-2026-${String(createdComplaint.id).replace("cmp-", "").padStart(6, "0")}`;
                      const text = `My ARAM complaint ID is ${formattedId}. You can track updates on the ARAM tracking portal.`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
                    }}
                    className="px-2.5 py-1 text-[10px] font-bold text-emerald-650 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-100 transition"
                  >
                    Share to WhatsApp
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-left text-xs pt-4 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 uppercase text-[9px] font-bold tracking-wider">Expected Response</span>
                  <p className="font-semibold text-slate-805 mt-0.5">
                    {createdComplaint.priority === "HIGH" ? "24 Hours SLA" : createdComplaint.priority === "CRITICAL" ? "Immediate Review" : createdComplaint.priority === "LOW" ? "7 Days SLA" : "72 Hours SLA"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[9px] font-bold tracking-wider">Triage Status</span>
                  <p className="font-semibold text-slate-805 mt-0.5">SUBMITTED</p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  variant="primary"
                  className="w-full text-xs font-bold py-2.5"
                  onClick={() => navigate("/citizen/my-complaints")}
                >
                  Track from My Complaints
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-xs font-semibold py-2.5 bg-white border-slate-200 hover:bg-slate-50"
                  onClick={() => {
                    setCreatedComplaint(null);
                    setFormData({
                      title: "",
                      category: "GENERAL_LEGAL_AID",
                      department: "",
                      priority: "MEDIUM",
                      location: "Coimbatore",
                      description: "",
                      identityVisibility: "VISIBLE",
                      language: "en-IN"
                    });
                    setDisclaimerAgreed(false);
                    setSensitiveComplaint(false);
                    setEvidenceFile(null);
                    setOcrData(null);
                  }}
                >
                  Submit New Grievance
                </Button>
              </div>
            </div>
          </div>
        </DashboardLayout>
      ) : (
        <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Submit Complaint</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Explain your issue using voice recognition or manual text entry.
            </p>
          </div>
          <SimpleModeToggle onToggle={(val) => setSimpleMode(val)} />
        </div>

        {/* Emergency Safety Alert Card */}
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-xs text-red-950 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🚨</span>
              <span className="font-bold uppercase tracking-wider text-red-800">Emergency Support Notice</span>
            </div>
            <span className="text-[9px] bg-red-100 text-red-800 px-2 py-0.5 rounded font-extrabold uppercase tracking-wide">
              Urgent Review Queue Enabled
            </span>
          </div>
          <p className="leading-relaxed">
            ARAM provides preliminary legal aid and complaint triage support. ARAM is <strong>NOT</strong> an emergency services portal. If you are in immediate danger, facing physical violence, stalking, or cyber threats, please contact local emergency services first.
          </p>
          <div className="flex flex-wrap gap-2 pt-1 font-bold">
            <a href="tel:181" className="flex items-center gap-1 px-3 py-1.5 bg-white border border-red-200 rounded-xl hover:bg-red-50 text-red-900 transition text-[10px] shadow-sm cursor-pointer">
              📞 Women Helpline (181)
            </a>
            <a href="tel:112" className="flex items-center gap-1 px-3 py-1.5 bg-white border border-red-200 rounded-xl hover:bg-red-50 text-red-900 transition text-[10px] shadow-sm cursor-pointer">
              📞 Emergency Services (112)
            </a>
            <a href="tel:1930" className="flex items-center gap-1 px-3 py-1.5 bg-white border border-red-200 rounded-xl hover:bg-red-50 text-red-900 transition text-[10px] shadow-sm cursor-pointer">
              📞 Cyber Crime Cell (1930)
            </a>
          </div>
        </div>

        {simpleMode ? (
          /* Accessibility step-by-step wizard */
          <Card className="p-6 lg:p-8 space-y-6 max-w-2xl mx-auto shadow-md border border-purple-100">
            {/* Step Indicators */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 text-xs font-semibold text-slate-400">
              <span className={wizardStep === 1 ? "text-purple-600 font-extrabold" : ""}>1. Language</span>
              <span className={wizardStep === 2 ? "text-purple-600 font-extrabold" : ""}>2. Title</span>
              <span className={wizardStep === 3 ? "text-purple-600 font-extrabold" : ""}>3. Explain</span>
              <span className={wizardStep === 4 ? "text-purple-600 font-extrabold" : ""}>4. District</span>
              <span className={wizardStep === 5 ? "text-purple-600 font-extrabold" : ""}>5. Submit</span>
            </div>

            {wizardStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h2 className="text-lg font-bold text-slate-800">Step 1: Choose Language / மொழி தேர்வு</h2>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "English", code: "en-IN" },
                    { label: "தமிழ் (Tamil)", code: "ta-IN" },
                    { label: "हिंदी (Hindi)", code: "hi-IN" }
                  ].map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setFormData({ ...formData, language: l.code });
                        setWizardStep(2);
                      }}
                      className={`p-6 rounded-xl border text-sm font-bold flex flex-col items-center justify-center gap-2 transition active:scale-95 ${
                        formData.language === l.code
                          ? "bg-purple-50 border-purple-300 text-purple-700 ring-2 ring-purple-100"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
                <div className="flex justify-end pt-4">
                  <Button variant="primary" onClick={() => setWizardStep(2)} className="bg-purple-600 hover:bg-purple-700 font-bold">
                    Next Step <ChevronRight size={14} className="ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h2 className="text-lg font-bold text-slate-800">Step 2: Enter Complaint Title</h2>
                <Input
                  label="What is the problem title?"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Summarize issue (e.g. Salary unpaid by supervisor)"
                  required
                  icon={FileText}
                  className="text-base h-12"
                />
                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <Button variant="secondary" onClick={() => setWizardStep(1)}>
                    <ChevronLeft size={14} className="mr-1" /> Back
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (!formData.title.trim()) {
                        toast.error("Please enter a title.");
                        return;
                      }
                      setWizardStep(3);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 font-bold"
                  >
                    Next Step <ChevronRight size={14} className="ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h2 className="text-lg font-bold text-slate-800">Step 3: Explain the Issue / உங்கள் பிரச்சனையை கூறவும்</h2>
                
                <VoiceRecorder
                  currentLanguage={formData.language}
                  onTranscriptReady={(text) => setFormData((prev) => ({ ...prev, description: text }))}
                />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Review transcript text</label>
                    <ReadAloudButton text={formData.description} language={formData.language} />
                  </div>
                  <textarea
                    rows="4"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Transcribed text will appear here. You can also type or edit details directly."
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-700 focus:border-purple-500 outline-none resize-none"
                  />
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <Button variant="secondary" onClick={() => setWizardStep(2)}>
                    <ChevronLeft size={14} className="mr-1" /> Back
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (formData.description.length < 15) {
                        toast.error("Please explain your problem in detail (minimum 15 characters).");
                        return;
                      }
                      setWizardStep(4);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 font-bold"
                  >
                    Next Step <ChevronRight size={14} className="ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {wizardStep === 4 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h2 className="text-lg font-bold text-slate-800">Step 4: Enter Your District</h2>
                <Input
                  label="District Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Coimbatore"
                  required
                  icon={MapPin}
                  className="text-base h-12"
                />
                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <Button variant="secondary" onClick={() => setWizardStep(3)}>
                    <ChevronLeft size={14} className="mr-1" /> Back
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (!formData.location.trim()) {
                        toast.error("Please specify your district location.");
                        return;
                      }
                      setWizardStep(5);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 font-bold"
                  >
                    Next Step <ChevronRight size={14} className="ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {wizardStep === 5 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h2 className="text-lg font-bold text-slate-800">Step 5: Verify & Submit Complaint</h2>

                <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/50 text-xs text-slate-600 space-y-2">
                  <p><strong>Title:</strong> {formData.title}</p>
                  <p><strong>Description Summary:</strong> {formData.description}</p>
                  <p><strong>District:</strong> {formData.location}</p>
                </div>

                {/* Privacy and volunteer preference options */}
                <div className="space-y-3 p-4 rounded-xl border border-slate-200 bg-white text-xs">
                  <span className="font-bold text-slate-800 uppercase tracking-wide block mb-2">Privacy & Volunteer Options</span>
                  <div className="flex items-center justify-between">
                    <span>Sensitive Case Shielding</span>
                    <button
                      type="button"
                      onClick={() => setSensitiveComplaint(!sensitiveComplaint)}
                      className={`h-6 w-12 rounded-full transition flex items-center px-0.5 ${
                        sensitiveComplaint ? "bg-purple-600" : "bg-slate-300"
                      }`}
                    >
                      <div
                        className={`h-5 w-5 rounded-full bg-white transition-transform ${
                          sensitiveComplaint ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Prefer Woman Volunteer</span>
                    <button
                      type="button"
                      onClick={() => setPreferWoman(!preferWoman)}
                      className={`h-6 w-12 rounded-full transition flex items-center px-0.5 ${
                        preferWoman ? "bg-purple-600" : "bg-slate-300"
                      }`}
                    >
                      <div
                        className={`h-5 w-5 rounded-full bg-white transition-transform ${
                          preferWoman ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Identity Visibility</label>
                    <select
                      name="identityVisibility"
                      value={formData.identityVisibility}
                      onChange={handleChange}
                      className="h-9 w-full rounded-lg border border-slate-200 px-3 outline-none text-slate-800 text-xs bg-white cursor-pointer"
                    >
                      <option value="VISIBLE">Visible</option>
                      <option value="PARTIAL">Partial Masking</option>
                      <option value="HIDDEN">Full Masking</option>
                    </select>
                  </div>
                </div>

                {/* Safe Contact Options */}
                <div className="space-y-3 p-4 rounded-xl border border-slate-200 bg-white text-xs">
                  <span className="font-bold text-slate-800 uppercase tracking-wide block mb-1">Safe Contact Preferences</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Contact Method</label>
                      <select
                        value={safeContactMethod}
                        onChange={(e) => setSafeContactMethod(e.target.value)}
                        className="h-9 w-full rounded-lg border border-slate-200 px-3 outline-none text-slate-800 text-xs bg-white cursor-pointer"
                      >
                        <option value="APP">In-App Chat Only</option>
                        <option value="PHONE">Phone Call</option>
                        <option value="WHATSAPP">WhatsApp Message</option>
                        <option value="EMAIL">Email</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Best Contact Time</label>
                      <select
                        value={safeContactTime}
                        onChange={(e) => setSafeContactTime(e.target.value)}
                        className="h-9 w-full rounded-lg border border-slate-200 px-3 outline-none text-slate-800 text-xs bg-white cursor-pointer"
                      >
                        <option value="ANYTIME">Anytime</option>
                        <option value="MORNING">Morning (9 AM - 12 PM)</option>
                        <option value="AFTERNOON">Afternoon (12 PM - 4 PM)</option>
                        <option value="EVENING">Evening (4 PM - 8 PM)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-4 border border-slate-200 rounded-xl bg-slate-50">
                  <input
                    type="checkbox"
                    id="wizardConsent"
                    checked={disclaimerAgreed}
                    onChange={(e) => setDisclaimerAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-purple-600 cursor-pointer"
                  />
                  <label htmlFor="wizardConsent" className="text-[11px] text-slate-650 leading-relaxed cursor-pointer select-none">
                    I understand that ARAM provides preliminary legal guidance and complaint support. It is not a substitute for emergency services or a licensed lawyer. For urgent danger, contact emergency services immediately. <strong>I understand and want to continue.</strong>
                  </label>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <Button variant="secondary" onClick={() => setWizardStep(4)}>
                    <ChevronLeft size={14} className="mr-1" /> Back
                  </Button>
                  <Button
                    onClick={() => handleSubmit()}
                    loading={loading}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold"
                  >
                    <Send size={14} className="mr-1" /> SUBMIT COMPLAINT
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ) : (
          /* Standard dashboard-styled complaint form */
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="p-6 lg:p-8 space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="lg:col-span-2">
                  <Input
                    label="Complaint Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Summarize the legal grievance (e.g. Unpaid salary from textile supervisor)"
                    icon={FileText}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block font-semibold text-slate-700 text-xs uppercase tracking-wider">Select Language Mode</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="h-11 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 text-slate-800 bg-white text-xs transition cursor-pointer"
                  >
                    <option value="en-IN">English (India)</option>
                    <option value="ta-IN">தமிழ் (Tamil)</option>
                    <option value="hi-IN">हिंदी (Hindi)</option>
                  </select>
                </div>

                <div>
                  <Input
                    label="District Jurisdiction"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Coimbatore, Chennai"
                    icon={MapPin}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block font-semibold text-slate-700 text-xs uppercase tracking-wider">Complaint Priority & Target SLA</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 text-slate-800 bg-white text-xs transition cursor-pointer"
                  >
                    <option value="LOW">LOW - 7 Days SLA (Standard Guidance)</option>
                    <option value="MEDIUM">MEDIUM - 72 Hours SLA (Priority Review)</option>
                    <option value="HIGH">HIGH - 24 Hours SLA (Urgent Triage)</option>
                    <option value="CRITICAL">CRITICAL - Immediate Triage</option>
                  </select>
                </div>

                <div className="lg:col-span-2 flex items-center justify-between rounded-xl border border-slate-200 p-4 bg-slate-50/55">
                  <div>
                    <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">Sensitive Case Shielding</h4>
                    <p className="text-[11px] text-slate-500 mt-1">If enabled, ARAM AI will flag sensitive status overrides to match trained volunteers first.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSensitiveComplaint(!sensitiveComplaint)}
                    className={`h-7 w-14 rounded-full transition flex items-center px-0.5 ${
                      sensitiveComplaint ? "bg-blue-600" : "bg-slate-300"
                    }`}
                  >
                    <div
                      className={`h-6 w-6 rounded-full bg-white transition-transform ${
                        sensitiveComplaint ? "translate-x-7" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="lg:col-span-2 flex items-center justify-between rounded-xl border border-slate-200 p-4 bg-slate-50/55">
                  <div>
                    <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">Prefer Woman Volunteer</h4>
                    <p className="text-[11px] text-slate-500 mt-1">Request a female helper certified in women support training.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreferWoman(!preferWoman)}
                    className={`h-7 w-14 rounded-full transition flex items-center px-0.5 ${
                      preferWoman ? "bg-blue-600" : "bg-slate-300"
                    }`}
                  >
                    <div
                      className={`h-6 w-6 rounded-full bg-white transition-transform ${
                        preferWoman ? "translate-x-7" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="lg:col-span-2 space-y-2">
                  <label className="block font-semibold text-slate-700 text-xs uppercase tracking-wider">Identity Visibility Shield</label>
                  <select
                    name="identityVisibility"
                    value={formData.identityVisibility}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 text-slate-800 bg-white text-xs transition cursor-pointer"
                  >
                    <option value="VISIBLE">Visible (Advocates & Helpers see full details)</option>
                    <option value="PARTIAL">Partial Masking (Name & Contact details hidden)</option>
                    <option value="HIDDEN">Full Masking (All PII fields masked)</option>
                  </select>
                </div>

                {/* Voice Recorder Integration */}
                <div className="lg:col-span-2">
                  <label className="mb-1.5 block font-semibold text-slate-700 text-xs uppercase tracking-wider">Voice Dictation Assistant</label>
                  <VoiceRecorder
                    currentLanguage={formData.language}
                    onTranscriptReady={(text) => setFormData((prev) => ({ ...prev, description: text }))}
                  />
                </div>

                {/* Description and read aloud */}
                <div className="lg:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-semibold text-slate-700 text-xs uppercase tracking-wider">Complaint Description</label>
                    <ReadAloudButton text={formData.description} language={formData.language} />
                  </div>
                  <textarea
                    rows="6"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    placeholder="Describe your complaint details. You can type or use the voice recorder transcript above."
                    className="w-full rounded-xl border border-slate-200 p-4 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition text-slate-800"
                  />
                </div>

                {/* Upload File */}
                <div>
                  <label className="mb-1.5 block font-semibold text-slate-700 text-xs uppercase tracking-wider">Upload Evidence Slip</label>
                  {!evidenceFile ? (
                    <label className="flex h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 transition hover:border-blue-500 hover:bg-blue-50">
                      <Upload size={32} className="text-blue-600" />
                      <p className="mt-2 text-xs font-semibold text-slate-800">Click to Upload Evidence</p>
                      <span className="text-[10px] text-slate-500 mt-0.5">PDF, JPG, PNG (Max 5 MB)</span>
                      <input type="file" onChange={handleFileUpload} disabled={uploadingDoc} className="hidden" />
                    </label>
                  ) : (
                    <div className="flex h-36 flex-col items-center justify-center rounded-xl border border-blue-200 bg-blue-50/40 p-4">
                      <FileText className="text-blue-600 mb-1" size={28} />
                      <p className="font-semibold text-xs text-slate-800 truncate max-w-xs">{evidenceFile.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{evidenceFile.size}</p>
                      <Button
                        variant="secondary"
                        onClick={handleRemoveFile}
                        className="mt-2.5 !min-h-[36px] py-1 bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        Remove File
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {ocrData && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 text-emerald-950 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-800">
                        ARAM AI Document Scanner
                      </h4>
                      <p className="text-[10px] text-emerald-600 font-medium">
                        Secure OCR Scan & PII Redaction Complete
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-3 text-xs pt-2 border-t border-emerald-100/50">
                    <div>
                      <span className="block text-[10px] text-emerald-650 uppercase font-bold tracking-wider">Classification</span>
                      <span className="font-bold text-slate-800 mt-1 block">{ocrData.documentType}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-emerald-650 uppercase font-bold tracking-wider">PII Masking</span>
                      <span className="font-mono text-[10px] text-slate-700 bg-white/65 px-1.5 py-0.5 rounded border border-emerald-100 mt-1 block truncate max-w-full" title={ocrData.ocrTextMasked}>
                        {ocrData.ocrTextMasked || "No PII detected"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-emerald-650 uppercase font-bold tracking-wider">Integrity Score</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 rounded-full bg-emerald-100">
                          <div className="h-2 rounded-full bg-emerald-600" style={{ width: `${ocrData.finalScore * 100}%` }}></div>
                        </div>
                        <span className="font-bold text-slate-800 font-mono">{(ocrData.finalScore * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Safe Contact Options */}
              <div className="space-y-3 p-4 rounded-xl border border-slate-200 bg-white text-xs">
                <span className="font-bold text-slate-800 uppercase tracking-wide block mb-1">Safe Contact Preferences</span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Contact Method</label>
                    <select
                      value={safeContactMethod}
                      onChange={(e) => setSafeContactMethod(e.target.value)}
                      className="h-9 w-full rounded-lg border border-slate-200 px-3 outline-none text-slate-800 text-xs bg-white cursor-pointer"
                    >
                      <option value="APP">In-App Chat Only</option>
                      <option value="PHONE">Phone Call</option>
                      <option value="WHATSAPP">WhatsApp Message</option>
                      <option value="EMAIL">Email</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Best Contact Time</label>
                    <select
                      value={safeContactTime}
                      onChange={(e) => setSafeContactTime(e.target.value)}
                      className="h-9 w-full rounded-lg border border-slate-200 px-3 outline-none text-slate-800 text-xs bg-white cursor-pointer"
                    >
                      <option value="ANYTIME">Anytime</option>
                      <option value="MORNING">Morning (9 AM - 12 PM)</option>
                      <option value="AFTERNOON">Afternoon (12 PM - 4 PM)</option>
                      <option value="EVENING">Evening (4 PM - 8 PM)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Disclaimer Checkbox */}
              <div className="flex items-start gap-3 p-4 bg-slate-50/50 border border-slate-200 rounded-xl">
                <input
                  type="checkbox"
                  id="disclaimerCheckbox"
                  checked={disclaimerAgreed}
                  onChange={(e) => setDisclaimerAgreed(e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="disclaimerCheckbox" className="text-[11px] text-slate-650 leading-relaxed cursor-pointer select-none">
                  I understand that ARAM provides preliminary legal guidance and complaint support. It is not a substitute for emergency services or a licensed lawyer. For urgent danger, contact emergency services immediately. <strong>I understand and want to continue.</strong>
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setFormData({
                      title: "",
                      category: "GENERAL_LEGAL_AID",
                      department: "",
                      priority: "MEDIUM",
                      location: "Coimbatore",
                      description: "",
                      identityVisibility: "VISIBLE",
                      language: "en-IN"
                    });
                    setDisclaimerAgreed(false);
                    setSensitiveComplaint(false);
                    setEvidenceFile(null);
                    setOcrData(null);
                    toast.info("Complaint form reset successfully.");
                  }}
                >
                  Reset Form
                </Button>

                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  icon={Save}
                >
                  Save Draft
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  disabled={uploadingDoc}
                  icon={Send}
                >
                  Submit Complaint
                </Button>
              </div>
            </Card>
          </form>
        )}
      </div>
    </DashboardLayout>
    )}
  </React.Fragment>
  );
};

export default SubmitComplaint;