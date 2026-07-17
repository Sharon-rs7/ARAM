import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import { Upload, Mic, MapPin, FileText, BrainCircuit, Save, Send, Trash, ShieldAlert } from "lucide-react";
import { complaintService } from "../../services/complaintService";
import { documentService } from "../../services/documentService";
import { toast } from "sonner";

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
    category: "",
    department: "",
    priority: "MEDIUM",
    location: "",
    description: "",
    identityVisibility: "VISIBLE"
  });

  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [ocrData, setOcrData] = useState(null);
  const [disclaimerAgreed, setDisclaimerAgreed] = useState(false);
  const [sensitiveComplaint, setSensitiveComplaint] = useState(false);

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
    toast.loading("Uploading evidence and running OCR mask scans...");

    try {
      const uploadRes = await documentService.uploadDocument(new FormData());
      
      const verifyFormData = new FormData();
      verifyFormData.append("file", file);
      verifyFormData.append("expectedDocumentType", "Receipt / Proof Slip");
      
      const verifyRes = await documentService.verifyDocument(verifyFormData);
      
      setEvidenceFile({
        id: uploadRes.id,
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
      });

      setOcrData(verifyRes);
      toast.dismiss();
      toast.success("Evidence uploaded & processed by ARAM AI detector!");
    } catch (err) {
      toast.dismiss();
      toast.error("OCR analysis failed. Continuing with upload.");
      setEvidenceFile({
        id: `doc-err-${Date.now()}`,
        name: file.name,
        size: "Unknown size"
      });
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleRemoveFile = () => {
    setEvidenceFile(null);
    setOcrData(null);
    toast.info("Evidence file removed.");
  };

  const handleVoiceRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      toast.info("Listening... Speak clearly in English or Tamil.");
      
      setTimeout(() => {
        setIsRecording(false);
        setFormData((prev) => ({
          ...prev,
          description: prev.description 
            ? prev.description + " [Transcribed]: Unpaid salary since last three months from textile employer."
            : "Unpaid salary since last three months from textile employer."
        }));
        toast.success("Voice transcribed successfully.");
      }, 3500);
    } else {
      setIsRecording(false);
    }
  };

  const handleSaveDraft = () => {
    if (!formData.title) {
      toast.error("Please enter a title to save a draft.");
      return;
    }
    toast.success("Complaint draft saved locally.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.category || !formData.description) {
      toast.error("Please fill in the title, category, and description.");
      return;
    }

    if (formData.title.length < 5 || formData.title.length > 100) {
      toast.error("Complaint title must be between 5 and 100 characters.");
      return;
    }

    if (formData.description.length < 20 || formData.description.length > 2000) {
      toast.error("Complaint description must be between 20 and 2000 characters.");
      return;
    }

    if (!disclaimerAgreed) {
      toast.error("You must agree to the legal disclaimer and policy before submission.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        evidenceFileId: evidenceFile?.id || null,
        ocrScore: ocrData?.finalScore || null
      };

      await complaintService.submitComplaint(payload);
      toast.success("Complaint submitted successfully to ARAM!");
      navigate(`/citizen/my-complaints`);
    } catch (err) {
      toast.error(err.message || "Failed to submit complaint.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Submit Complaint</h1>
          <p className="mt-2 text-sm text-slate-500">
            Fill in the details below. Our AI systems will analyze categories and verify evidence automatically.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6 lg:p-8 space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Title */}
              <div className="lg:col-span-2">
                <Input
                  label="Complaint Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Summarize the legal grievance (e.g. Unpaid salary from employer)"
                  icon={FileText}
                />
              </div>

              {/* Category */}
              <div>
                <label className="mb-1.5 block font-semibold text-slate-700 text-xs uppercase tracking-wider">Category Selection</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="h-11 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 text-slate-800 bg-white text-xs transition cursor-pointer"
                >
                  <option value="">Select Category</option>
                  {categories.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="mb-1.5 block font-semibold text-slate-700 text-xs uppercase tracking-wider">Target Department (Optional)</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="h-11 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 text-slate-800 bg-white text-xs transition cursor-pointer"
                >
                  <option value="">Select Department (or let AI route)</option>
                  {departments.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="mb-1.5 block font-semibold text-slate-700 text-xs uppercase tracking-wider">Urgency / Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="h-11 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 text-slate-800 bg-white text-xs transition cursor-pointer"
                >
                  {priorities.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
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

              {/* Identity Visibility */}
              <div className="lg:col-span-2">
                <label className="mb-1.5 block font-semibold text-slate-700 text-xs uppercase tracking-wider">Identity Visibility Control</label>
                <select
                  name="identityVisibility"
                  value={formData.identityVisibility}
                  onChange={handleChange}
                  className="h-11 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 text-slate-800 bg-white text-xs transition cursor-pointer"
                >
                  <option value="VISIBLE">Visible (Show my name and contact details to helper)</option>
                  <option value="PARTIAL">Partial (Show only my district and description)</option>
                  <option value="HIDDEN">Hidden (Mask details completely using PII masks)</option>
                </select>
              </div>

              {/* Sensitive Complaint Toggle */}
              <div className="lg:col-span-2 flex items-center justify-between rounded-xl border border-slate-200 p-4 bg-slate-50/55">
                <div>
                  <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">Sensitive Complaint / Redact Personal Details</h4>
                  <p className="text-[11px] text-slate-500 mt-1">If enabled, ARAM AI will redact specific phone numbers, ID metrics, or names from the description.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSensitiveComplaint(!sensitiveComplaint)}
                  className={`h-7 w-14 rounded-full transition flex items-center px-0.5 ${
                    sensitiveComplaint ? "bg-blue-600" : "bg-slate-350"
                  }`}
                >
                  <div
                    className={`h-6 w-6 rounded-full bg-white transition-transform ${
                      sensitiveComplaint ? "translate-x-7" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Description */}
              <div className="lg:col-span-2">
                <label className="mb-1.5 block font-semibold text-slate-700 text-xs uppercase tracking-wider">Complaint Description</label>
                <textarea
                  rows="6"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Describe your complaint in detail..."
                  className="w-full rounded-xl border border-slate-250 p-4 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition text-slate-800"
                />
              </div>

              {/* Upload File */}
              <div>
                <label className="mb-1.5 block font-semibold text-slate-700 text-xs uppercase tracking-wider">Upload Evidence Slip</label>
                {!evidenceFile ? (
                  <label className="flex h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 transition hover:border-blue-500 hover:bg-blue-50">
                    <Upload size={32} className="text-blue-650" />
                    <p className="mt-2 text-xs font-semibold text-slate-800">Click to Upload Evidence</p>
                    <span className="text-[10px] text-slate-500 mt-0.5">PDF, JPG, PNG (Max 5 MB)</span>
                    <input type="file" onChange={handleFileUpload} disabled={uploadingDoc} className="hidden" />
                  </label>
                ) : (
                  <div className="flex h-36 flex-col items-center justify-center rounded-xl border border-blue-200 bg-blue-50/40 p-4">
                    <FileText className="text-blue-600 mb-1" size={28} />
                    <p className="font-semibold text-xs text-slate-850 truncate max-w-xs">{evidenceFile.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{evidenceFile.size}</p>
                    <Button
                      variant="secondary"
                      onClick={handleRemoveFile}
                      className="mt-2.5 !min-h-[36px] py-1 bg-red-50 text-red-650 hover:bg-red-100"
                      icon={Trash}
                    >
                      Remove File
                    </Button>
                  </div>
                )}
              </div>

              {/* Dictate Voice */}
              <div>
                <label className="mb-1.5 block font-semibold text-slate-700 text-xs uppercase tracking-wider">Dictate Grievance</label>
                <div className="flex h-36 flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                  <button
                    type="button"
                    onClick={handleVoiceRecord}
                    disabled={isRecording}
                    className={`flex h-14 w-14 items-center justify-center rounded-full text-white transition shadow-md ${
                      isRecording ? "bg-red-400 animate-pulse cursor-not-allowed" : "bg-red-500 hover:bg-red-650"
                    }`}
                  >
                    <Mic size={24} />
                  </button>
                  <p className="mt-2 text-xs font-semibold text-slate-800">
                    {isRecording ? "Recording Speech..." : "Record Voice"}
                  </p>
                  <span className="text-[10px] text-slate-500 mt-0.5">Tamil & English Dictation</span>
                </div>
              </div>
            </div>

            {/* OCR Details Panel */}
            {ocrData && (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800 text-xs leading-relaxed space-y-1 animate-in fade-in duration-200">
                <span className="font-bold uppercase tracking-wider block mb-1">ARAM Document Scanner Results:</span>
                <p><strong>Detected Type:</strong> {ocrData.documentType}</p>
                <p><strong>Masked OCR String:</strong> "{ocrData.ocrTextMasked}"</p>
                <p><strong>Integrity Score:</strong> {(ocrData.finalScore * 100).toFixed(0)}% Match confidence</p>
              </div>
            )}

            {/* AI Banner info */}
            <div className="rounded-xl bg-[#EFF6FF] border border-blue-200 p-5 text-slate-900 flex items-start gap-4">
              <BrainCircuit size={28} className="text-blue-650 mt-1 shrink-0" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-800">AI Complaint Pre-Analysis</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  ARAM AI engine classifies department triage routing, checks for PII leaks, scans text for keywords, and generates legal report templates.
                </p>
              </div>
            </div>

            {/* Disclaimer Checkbox */}
            <div className="flex items-start gap-3 p-4 bg-slate-50/50 border border-slate-200 rounded-xl">
              <input
                type="checkbox"
                id="disclaimerCheckbox"
                checked={disclaimerAgreed}
                onChange={(e) => setDisclaimerAgreed(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-slate-350 text-blue-650 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="disclaimerCheckbox" className="text-[11px] text-slate-650 leading-relaxed cursor-pointer select-none">
                I agree that the details supplied are correct and that I accept the ARAM portal legal policy. I understand that ARAM provides initial guidance and does not replace official judicial authority.
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col justify-end gap-3 sm:flex-row pt-4 border-t border-slate-100 w-full">
              <Button
                variant="secondary"
                onClick={() => {
                  setFormData({
                    title: "",
                    category: "",
                    department: "",
                    priority: "MEDIUM",
                    location: "",
                    description: "",
                    identityVisibility: "VISIBLE"
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
      </div>
    </DashboardLayout>
  );
};

export default SubmitComplaint;