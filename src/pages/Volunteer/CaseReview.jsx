import DashboardLayout from "@/components/layout/DashboardLayout";
import { FileText, BrainCircuit, User, CalendarDays, MapPin, ClipboardCheck, Loader2, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { volunteerService } from "../../services/volunteerService";
import { toast } from "sonner";

const CaseReview = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [complaint, setComplaint] = useState(null);
  const [status, setStatus] = useState("IN_PROGRESS");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Overrides States
  const [minCost, setMinCost] = useState(0);
  const [maxCost, setMaxCost] = useState(500);
  const [costNotes, setCostNotes] = useState("");
  const [freeAid, setFreeAid] = useState(true);
  const [matchingOffices, setMatchingOffices] = useState([]);
  const [selectedOffice, setSelectedOffice] = useState("");

  useEffect(() => {
    const fetchCase = async () => {
      try {
        let targetId = id;
        if (!targetId) {
          const list = await volunteerService.getAssignedCases();
          if (list && list.length > 0) {
            targetId = list[0].id;
          } else {
            throw new Error("No cases assigned to review.");
          }
        }
        
        const data = await volunteerService.getCaseById(targetId);
        setComplaint(data);
        setStatus(data.status || "IN_PROGRESS");
        setNotes(data.legalOpinion || "");
        setSelectedOffice(data.authority || "");

        // Fetch cost estimate
        try {
          const costData = await volunteerService.getCostEstimate(targetId);
          if (costData) {
            setMinCost(costData.estimatedMinAmount);
            setMaxCost(costData.estimatedMaxAmount);
            setCostNotes(costData.notes || "");
            setFreeAid(costData.freeLegalAidAvailable);
          }
        } catch (cErr) {
          console.error("Failed to load cost estimate:", cErr);
        }

        // Fetch matching authority offices
        try {
          const officesData = await volunteerService.getAuthorityLocations(targetId);
          setMatchingOffices(officesData || []);
        } catch (oErr) {
          console.error("Failed to load matching offices:", oErr);
        }
      } catch (err) {
        console.error("Failed to load case for review:", err);
        toast.error(err.message || "Failed to load complaint data.");
      } finally {
        setLoading(false);
      }
    };
    fetchCase();
  }, [id]);

  const handleSave = async (isSubmit = false) => {
    if (!notes.trim()) {
      toast.error("Please add review notes or recommendations first.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        note: notes,
        status: isSubmit ? "RESOLVED" : status
      };

      // 1. Save standard case notes and status update
      await volunteerService.submitReview(complaint.id, payload);

      // 2. Save cost estimate overrides
      await volunteerService.updateCostEstimate(complaint.id, {
        estimatedMinAmount: minCost,
        estimatedMaxAmount: maxCost,
        freeLegalAidAvailable: freeAid,
        costType: freeAid ? "Free Legal Aid" : "Custom Fee",
        notes: costNotes
      });

      // 3. Save authority office location override
      if (selectedOffice && selectedOffice !== complaint.authority) {
        await volunteerService.updateAuthorityLocation(complaint.id, selectedOffice);
      }

      toast.success(isSubmit ? "Case review submitted & resolved successfully!" : "Case review overrides and progress saved.");
      
      if (isSubmit) {
        navigate("/volunteer/assigned-cases");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save review details.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center text-slate-400">
          <Loader2 className="animate-spin mr-2" size={20} />
          Loading case review panel...
        </div>
      </DashboardLayout>
    );
  }

  if (!complaint) {
    return (
      <DashboardLayout>
        <div className="text-center py-16 text-slate-500">
          No active case found to review. Ensure you have cases assigned.
        </div>
      </DashboardLayout>
    );
  }

  const isWomenSensitive = complaint.sensitive || complaint.womenSensitive;
  const isHiddenIdentity = complaint.identityVisibility === "HIDDEN";
  const isPartialIdentity = complaint.identityVisibility === "PARTIAL";

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-5">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Case Review Panel</h1>
            <p className="mt-2 text-slate-500 text-xs font-semibold">
              Submit recommendation and update status for case: 
              <span className="font-mono text-indigo-600 font-bold ml-1.5">
                ARAM-2026-{String(complaint.id).replace("cmp-", "").padStart(6, "0")}
              </span>
            </p>
          </div>
          <button
            onClick={() => navigate("/volunteer/assigned-cases")}
            className="flex items-center gap-1 rounded-xl border border-slate-300 px-5 py-2.5 hover:bg-slate-50 transition text-xs font-bold text-slate-700 cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Cases
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* Complaint Info Summary */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-150 space-y-4">
              <div className="flex items-center gap-3 border-b pb-4">
                <FileText className="text-indigo-600" />
                <h3 className="text-xl font-bold text-slate-900">{complaint.title}</h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-slate-400" />
                  <span>
                    {"Public User: "}
                    <strong>
                      {isHiddenIdentity
                        ? "Protected Identity"
                        : isPartialIdentity
                        ? "Masked Public User (Partial)"
                        : complaint.userName || complaint.citizenName || complaint.citizen?.name || "Public User"}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} className="text-slate-400" />
                  <span>Submitted: <strong>{complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : "07/02/2026"}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-slate-400" />
                  <span>District: <strong>{complaint.district || complaint.location || "Chennai"}</strong></span>
                </div>
              </div>

              {isWomenSensitive && (
                <div className="p-3.5 bg-red-50/50 border border-red-150 rounded-2xl text-xs text-red-750">
                  <strong>Women-Sensitive Privacy Shield Active:</strong> Personal identification data is protected. Do not expose this case details outside the platform.
                </div>
              )}

              <div className="pt-4 border-t">
                <h4 className="font-bold text-slate-800 text-sm mb-2">Complaint Description</h4>
                <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-wrap bg-slate-55 p-4 rounded-2xl border border-slate-150">
                  {complaint.description}
                </p>
              </div>
            </div>

            {/* AI Insights display */}
            <div className="rounded-3xl bg-indigo-50/30 p-6 border border-indigo-100 space-y-4">
              <div className="flex items-center gap-2.5">
                <BrainCircuit className="text-indigo-600" size={20} />
                <h3 className="text-sm font-bold text-indigo-900">AI Triage Routing Summary</h3>
              </div>
              <div className="text-xs text-indigo-950 space-y-2 leading-relaxed">
                <p><strong>Predicted Category:</strong> {complaint.categoryDisplayName || complaint.category || "Labour Dispute"}</p>
                <p><strong>Integrity Integrity Index:</strong> Verified Evidence slip with confidence score of 89%.</p>
              </div>
            </div>
          </div>

          {/* Review input Form */}
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-150 space-y-6">
            <div className="flex items-center gap-3 border-b pb-4">
              <ClipboardCheck className="text-emerald-600" />
              <h3 className="text-xl font-bold text-slate-900">Helper Review</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Notes & Recommendations</label>
                <textarea
                  rows="6"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Draft your legal opinion or mediation actions here..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-indigo-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Case Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none text-slate-800 bg-white font-semibold cursor-pointer"
                >
                  <option value="AI_ANALYZED">AI Analyzed</option>
                  <option value="HELPER_ASSIGNED">Helper Assigned</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              {/* Overrides section */}
              <div className="pt-4 border-t space-y-4">
                <h4 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">Triage Overrides</h4>
                
                {/* 1. Authority Office Override */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Recommended Authority Office</label>
                  <select
                    value={selectedOffice}
                    onChange={(e) => setSelectedOffice(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none text-slate-800 bg-white font-semibold cursor-pointer"
                  >
                    <option value="">-- Select Authority Office --</option>
                    {matchingOffices.map((office) => (
                      <option key={office.id} value={office.name}>
                        {office.name} ({office.district})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Cost Estimate Override */}
                <div className="space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-150">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Cost Estimate Range</span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[8px] font-bold text-slate-450 uppercase mb-1">Min Amount (INR)</label>
                      <input
                        type="number"
                        value={minCost}
                        onChange={(e) => setMinCost(Number(e.target.value))}
                        className="h-9 w-full rounded-lg border border-slate-200 px-2 text-xs outline-none text-slate-850"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-slate-450 uppercase mb-1">Max Amount (INR)</label>
                      <input
                        type="number"
                        value={maxCost}
                        onChange={(e) => setMaxCost(Number(e.target.value))}
                        className="h-9 w-full rounded-lg border border-slate-200 px-2 text-xs outline-none text-slate-855"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="freeAidCheck"
                      checked={freeAid}
                      onChange={(e) => setFreeAid(e.target.checked)}
                      className="rounded border-slate-350 text-indigo-650 focus:ring-indigo-500"
                    />
                    <label htmlFor="freeAidCheck" className="text-[10px] font-semibold text-slate-650 cursor-pointer">
                      Free Legal Aid Available
                    </label>
                  </div>

                  <div>
                    <label className="block text-[8px] font-bold text-slate-455 uppercase mb-1">Cost range explanation / Travel notes</label>
                    <textarea
                      rows="2"
                      value={costNotes}
                      onChange={(e) => setCostNotes(e.target.value)}
                      placeholder="e.g. print charges + travel to district court"
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs outline-none text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t space-y-3">
                <button
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className="w-full py-3 bg-indigo-600 text-white hover:bg-indigo-700 transition rounded-xl font-bold text-xs cursor-pointer"
                >
                  {saving ? "Saving..." : "Save Draft Opinion"}
                </button>
                <button
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  className="w-full py-3 bg-emerald-600 text-white hover:bg-emerald-700 transition rounded-xl font-bold text-xs cursor-pointer"
                >
                  Confirm Resolution
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default CaseReview;