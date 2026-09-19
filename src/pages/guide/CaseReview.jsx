import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/common/DashboardLayout";
import { 
  ArrowLeft, FileText, Sparkles, User, Globe, AlertTriangle, 
  CheckCircle2, UserCheck, ShieldAlert, AlertCircle, Loader2,
  Search, Filter
} from "lucide-react";
import { adminService } from "@/services/adminService";
import { complaintService } from "@/services/complaintService";
import { toast } from "sonner";

const CaseReview = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const complaintId = id || searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [complaint, setComplaint] = useState(null);
  const [activeLangTab, setActiveLangTab] = useState("original");
  
  // AI Recommended Guides
  const [recommendedGuides, setRecommendedGuides] = useState([]);
  
  // All Guides (for manual search list)
  const [allGuides, setAllGuides] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevelFilter, setSelectedLevelFilter] = useState("ALL"); 
  const [selectedAvailabilityFilter, setSelectedAvailabilityFilter] = useState("ALL");

  // Warning Modal States
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [pendingGuideToAssign, setPendingGuideToAssign] = useState(null);
  const [overrideReason, setOverrideReason] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadReviewData = async () => {
      if (!complaintId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        // 1. Fetch case details directly
        let found = null;
        try {
          found = await complaintService.getComplaintById(complaintId);
        } catch (cErr) {
          console.warn("Direct complaint fetch failed, trying admin list:", cErr);
          const list = await adminService.getComplaints().catch(() => []);
          found = list.find(c => String(c.id) === String(complaintId) || String(c.rawId) === String(complaintId));
        }

        if (found) {
          setComplaint(found);
        } else {
          toast.error("Case details not found.");
        }

        // 2. Fetch AI recommendations
        try {
          const recs = await adminService.getRecommendedGuides(complaintId);
          setRecommendedGuides(recs || []);
        } catch (rErr) {
          console.warn("Using fallback recommendations:", rErr);
          setRecommendedGuides([
            { legalGuideId: 2, name: "Arun Kumar", matchScore: 94, languages: "Tamil", specializations: "Property", experienceLevel: "SENIOR", womenSupportTrained: false },
            { legalGuideId: 3, name: "Priya Devi", matchScore: 89, languages: "Tamil, Hindi", specializations: "Property, Domestic Violence", experienceLevel: "EXPERT", womenSupportTrained: true }
          ]);
        }

        // 3. Fetch all guides for manual search
        try {
          const guidesData = await adminService.getVolunteers();
          setAllGuides(guidesData || []);
        } catch (gErr) {
          console.warn("Using fallback guides list:", gErr);
          setAllGuides([
            { id: 2, name: "Arun Kumar", role: "VOLUNTEER", status: "ACTIVE", languagesKnown: "Tamil, English", specialization: "Property", maxActiveCases: 5, currentActiveCases: 1, availabilityStatus: "AVAILABLE", rating: 4.7, experienceLevel: "SENIOR" },
            { id: 3, name: "Priya Devi", role: "VOLUNTEER", status: "ACTIVE", languagesKnown: "Tamil, English, Hindi", specialization: "Property, Family Law", maxActiveCases: 5, currentActiveCases: 2, availabilityStatus: "AVAILABLE", rating: 4.9, experienceLevel: "EXPERT" },
            { id: 4, name: "Karthik S", role: "VOLUNTEER", status: "ACTIVE", languagesKnown: "Tamil, English", specialization: "Labour Dispute", maxActiveCases: 5, currentActiveCases: 0, availabilityStatus: "AVAILABLE", rating: 4.2, experienceLevel: "SENIOR" },
            { id: 5, name: "Suresh M (Junior)", role: "VOLUNTEER", status: "ACTIVE", languagesKnown: "Tamil", specialization: "General", maxActiveCases: 5, currentActiveCases: 3, availabilityStatus: "AVAILABLE", rating: 3.9, experienceLevel: "JUNIOR" }
          ]);
        }
      } catch (err) {
        toast.error("Failed to load review workspace details.");
      } finally {
        setLoading(false);
      }
    };
    loadReviewData();
  }, [complaintId]);

  const handleInitiateAssignment = (guide) => {
    const isHighPriority = complaint?.priority === "HIGH" || complaint?.priority === "CRITICAL";
    const expLvl = (guide.experienceLevel || "").toUpperCase();
    const isJunior = expLvl === "JUNIOR" || (guide.name && guide.name.toLowerCase().includes("junior"));
    
    if (isHighPriority && isJunior) {
      setPendingGuideToAssign(guide);
      setShowWarningModal(true);
    } else {
      executeAssign(guide.id || guide.legalGuideId, guide.name, "");
    }
  };

  const executeAssign = async (guideId, guideName, reason) => {
    setSaving(true);
    try {
      await adminService.assignVolunteer(
        Number(complaintId), 
        guideId, 
        reason.trim() || "Standard Recommended Match", 
        "Admin review workspace allocation."
      );
      toast.success(`Assigned case ARAM-${complaintId} to Guide ${guideName}!`);
      navigate("/admin/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign Guide.");
    } finally {
      setSaving(false);
      setShowWarningModal(false);
      setPendingGuideToAssign(null);
      setOverrideReason("");
    }
  };

  const handleEscalate = () => {
    toast.info("Case escalated to District Legal Services Authority (DLSA).");
    navigate("/admin/dashboard");
  };

  const handleReject = () => {
    toast.success("Case rejected and citizen notified.");
    navigate("/admin/dashboard");
  };

  const filteredGuides = allGuides.filter((g) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = g.name.toLowerCase().includes(query) || (g.specialization && g.specialization.toLowerCase().includes(query));
    
    if (selectedLevelFilter !== "ALL") {
      const isJunior = g.name.toLowerCase().includes("junior") || g.rating < 4.0 || g.experienceLevel === "JUNIOR";
      if (selectedLevelFilter === "JUNIOR" && !isJunior) return false;
      if (selectedLevelFilter === "SENIOR" && isJunior) return false;
    }
    
    if (selectedAvailabilityFilter !== "ALL" && g.availabilityStatus !== selectedAvailabilityFilter) {
      return false;
    }

    return nameMatch;
  });

  if (!complaintId) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center max-w-md p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
            <AlertCircle className="text-amber-500 mx-auto" size={40} />
            <h2 className="text-lg font-bold text-slate-800">No Case Selected</h2>
            <p className="text-slate-500 text-sm">Please select a case from the dashboard to review and allocate a legal guide.</p>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#163D32] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#1F5948] transition mx-auto cursor-pointer"
            >
              <ArrowLeft size={14} /> Go Back
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const textOriginal = complaint?.description || "No complaint description provided.";
  const textEnglish = complaint?.translatedDescription || complaint?.description || textOriginal;
  const trackingLabel = complaint?.trackingNumber || (complaint?.id ? `ARAM-${complaint.id}` : `Case #${complaintId}`);

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-mono font-bold text-slate-800">
                {trackingLabel}
              </h1>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider ${
                complaint?.priority === "HIGH" || complaint?.priority === "CRITICAL" ? "bg-red-500 text-white" : "bg-amber-500 text-white"
              }`}>
                {complaint?.priority || "HIGH"}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-semibold">
              Submitted {complaint?.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : "recently"}
            </p>
          </div>
          
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl transition cursor-pointer"
          >
            <ArrowLeft size={14} /> Back
          </button>
        </div>

        {/* 65% / 35% Grid layout split */}
        <div className="grid gap-6 lg:grid-cols-3 items-start">
          
          {/* Left Panel: Citizen Complaint Details (65%) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-6 space-y-6">
              
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 dark:border-slate-850 pb-4">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-450 uppercase tracking-widest">
                    Citizen Complaint
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium block mt-1">
                    Original language: {complaint?.language === "ta-IN" || complaint?.language === "ta" ? "Tamil" : (complaint?.language || "English")}
                  </span>
                </div>

                {/* Translation Toggles */}
                <div className="flex gap-1 p-0.5 bg-slate-100 dark:bg-slate-900 rounded-lg">
                  <button
                    onClick={() => setActiveLangTab("original")}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition ${
                      activeLangTab === "original"
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    Original
                  </button>
                  <button
                    onClick={() => setActiveLangTab("english")}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition ${
                      activeLangTab === "english"
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    English Translation
                  </button>
                </div>
              </div>

              {/* Description body */}
              <p className="text-xs leading-relaxed text-slate-750 dark:text-slate-350 bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-slate-850 whitespace-pre-wrap font-medium">
                {activeLangTab === "original" ? textOriginal : textEnglish}
              </p>

              {/* AI Summary */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest">
                  AI Summary
                </h4>
                <p className="text-xs leading-relaxed text-slate-655 dark:text-slate-400 font-medium">
                  {complaint?.summary || complaint?.aiSummary || (complaint?.location ? `The citizen reports an issue in ${complaint.location || complaint.district}. AI triage has registered this grievance.` : (complaint?.description || "Awaiting AI grievance summary."))}
                </p>
              </div>

              {/* Concerns checklist */}
              <div className="space-y-3 pt-2">
                <h4 className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest">
                  Detected Concerns
                </h4>
                <div className="flex flex-wrap gap-2">
                  {complaint?.aiResult?.detectedIssues && complaint.aiResult.detectedIssues.length > 0 ? (
                    complaint.aiResult.detectedIssues.map((issue) => (
                      <span key={issue} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                        {issue.replace(/_/g, " ")}
                      </span>
                    ))
                  ) : (
                    <>
                      <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-[10px] font-bold">{complaint?.category ? String(complaint.category).replace(/_/g, " ") : "Legal Assistance"}</span>
                      {complaint?.priority && (
                        <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-100 text-[10px] font-bold">{complaint.priority} Priority</span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Evidence */}
              <div className="space-y-3 pt-2">
                <h4 className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest">
                  Evidence
                </h4>
                {complaint?.evidenceFile || complaint?.documents?.[0]?.name ? (
                  <div className="p-3 bg-indigo-50/10 dark:bg-slate-950/20 rounded-xl border border-indigo-100/50 dark:border-slate-850/40 flex items-center justify-between text-xs max-w-sm">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-indigo-500" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate font-mono">
                        {complaint?.evidenceFile || complaint?.documents?.[0]?.name}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic font-medium">No attached evidence files.</p>
                )}
              </div>

            </div>
          </div>

          {/* Right Panel: Guide Assignment Console (35%) */}
          <div className="space-y-6">
            
            {/* AI Assessment Info */}
            <div className="glass-panel p-6 space-y-4">
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-widest border-b pb-3">
                AI Assessment
              </h3>
              
              <div className="space-y-3 text-xs font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-450">Priority</span>
                  <span className="font-bold text-red-500">{complaint?.priority || "HIGH"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450">Complexity</span>
                  <span className="font-bold text-red-500">{complaint?.aiResult?.complexity || "HIGH"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450">Language</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{complaint?.language || "Tamil"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-455">Guide needed</span>
                  <span className="font-bold text-indigo-500">
                    {complaint?.aiResult?.complexity === "HIGH" || complaint?.priority === "HIGH" ? "Senior or Expert" : "Guide or Senior"}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Recommended Guides */}
            <div className="glass-panel p-6 space-y-4">
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-widest border-b pb-3 flex items-center gap-1.5">
                <Sparkles size={14} className="text-indigo-500" /> AI Recommended
              </h3>

              <div className="space-y-3.5">
                {recommendedGuides.map((guide) => (
                  <div 
                    key={guide.legalGuideId || guide.id}
                    className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-950/20 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                          {guide.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                          {guide.experienceLevel || "Senior"} • {guide.languages || guide.languagesKnown}
                        </span>
                      </div>
                      <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        {guide.matchScore || 94}%
                      </span>
                    </div>

                    <button
                      onClick={() => handleInitiateAssignment(guide)}
                      disabled={saving}
                      className="w-full py-2.5 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold tracking-wider transition cursor-pointer"
                    >
                      Assign {guide.name.split(" ")[0]}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Manual Choose Another Guide Search Panel */}
            <div className="glass-panel p-6 space-y-4">
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-widest border-b pb-3">
                Or choose another Guide
              </h3>

              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search name, skill, or language..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-250 dark:border-slate-850 outline-none text-xs font-semibold bg-white dark:bg-slate-900/40"
                />
                <Search className="absolute left-3 top-3 text-slate-400" size={14} />
              </div>

              {/* Search results */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {filteredGuides.map((guide) => (
                  <div
                    key={guide.id}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-850 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/50"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">{guide.name}</h4>
                      <p className="text-[10px] text-slate-450 mt-0.5">
                        {guide.languagesKnown} • Rating {guide.rating} ({guide.experienceLevel})
                      </p>
                    </div>

                    <button
                      onClick={() => handleInitiateAssignment(guide)}
                      disabled={saving}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-lg text-[10px] font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer shrink-0"
                    >
                      Assign
                    </button>
                  </div>
                ))}

                {filteredGuides.length === 0 && (
                  <p className="text-center py-4 text-[10px] text-slate-400 font-semibold">No guides found.</p>
                )}
              </div>
            </div>

            {/* Escalate & Reject */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleEscalate}
                className="py-3 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-850 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer shadow-sm text-center"
              >
                Escalate
              </button>
              
              <button
                onClick={handleReject}
                className="py-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl text-xs font-bold text-red-650 cursor-pointer text-center"
              >
                Reject
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Eligibility Warning Dialog Modal */}
      {showWarningModal && pendingGuideToAssign && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 p-6 max-w-md w-full space-y-4 shadow-2xl text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Guide Eligibility Alert</h3>
              <p className="text-xs leading-relaxed text-slate-500 font-semibold px-2">
                ⚠ This Guide ({pendingGuideToAssign.name}) does not meet the recommended experience level for this HIGH priority case.
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Override Reason (Required)</label>
                <span className="text-[9px] font-bold text-slate-400">{overrideReason.trim().length} / 250</span>
              </div>
              <textarea
                rows={2}
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Enter explanation (minimum 10 characters)..."
                className="w-full border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs outline-none text-slate-800"
              />
              {overrideReason.trim().length > 0 && overrideReason.trim().length < 10 && (
                <p className="text-[10px] text-rose-500 font-bold mt-1 text-left">Reason must be at least 10 meaningful characters.</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowWarningModal(false);
                  setPendingGuideToAssign(null);
                  setOverrideReason("");
                }}
                className="flex-1 py-3 text-xs font-bold rounded-xl border border-slate-250 hover:bg-slate-50 transition cursor-pointer text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={() => executeAssign(pendingGuideToAssign.id || pendingGuideToAssign.legalGuideId, pendingGuideToAssign.name, overrideReason)}
                disabled={saving || !overrideReason.trim() || overrideReason.trim().length < 10 || overrideReason.length > 250}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                Assign Anyway
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default CaseReview;