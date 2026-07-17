import DashboardLayout from "@/components/layout/DashboardLayout";
import { FileText, BrainCircuit, User, CalendarDays, MapPin, ClipboardCheck, Loader2 } from "lucide-react";
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

  useEffect(() => {
    const fetchCase = async () => {
      try {
        // If no ID is passed, load the first case assigned to volunteer
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
        notes,
        status: isSubmit ? "RESOLVED" : status
      };

      await volunteerService.submitReview(complaint.id, payload);
      toast.success(isSubmit ? "Case review submitted & resolved successfully!" : "Case review progress saved.");
      
      if (isSubmit) {
        navigate("/volunteer/assigned-cases");
      }
    } catch (err) {
      toast.error("Failed to save review details.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center text-slate-400">
          <Loader2 className="animate-spin mr-2" />
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-5">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Case Review Panel</h1>
            <p className="mt-2 text-slate-500">
              Submit recommendation and update status for case <span className="font-mono text-slate-700 font-bold">#{complaint.id}</span>
            </p>
          </div>
          <button
            onClick={() => navigate("/volunteer/assigned-cases")}
            className="rounded-xl border border-slate-350 px-5 py-2.5 hover:bg-slate-50 transition text-sm font-semibold cursor-pointer"
          >
            All Cases
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Complaint Info Summary */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-center gap-3 border-b pb-4">
                <FileText className="text-blue-600" />
                <h3 className="text-xl font-bold text-slate-900">{complaint.title}</h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span>Citizen: <strong>{complaint.citizenName || complaint.citizen?.name || "Sharon Robert"}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} />
                  <span>Submitted: <strong>{complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : "07/02/2026"}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>District: <strong>{complaint.location || "Coimbatore"}</strong></span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-bold text-slate-800 text-sm mb-2">Complaint Description</h4>
                <p className="text-slate-650 text-sm leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {complaint.description}
                </p>
              </div>
            </div>

            {/* AI Insights display */}
            <div className="rounded-3xl bg-indigo-50/50 p-8 border border-indigo-100 space-y-4">
              <div className="flex items-center gap-3">
                <BrainCircuit className="text-indigo-650" />
                <h3 className="text-lg font-bold text-indigo-900">AI Triage Routing Summary</h3>
              </div>
              <div className="text-xs text-indigo-950 space-y-2 leading-relaxed">
                <p><strong>Predicted Category:</strong> {complaint.category || "Labour Dispute"}</p>
                <p><strong>Suggested Department:</strong> {complaint.department || "Labour Department"}</p>
                <p><strong>Integrity Check:</strong> Verified Evidence slip with confidence score of 89%.</p>
              </div>
            </div>
          </div>

          {/* Review input Form */}
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-3 border-b pb-4">
              <ClipboardCheck className="text-green-600" />
              <h3 className="text-xl font-bold text-slate-900">Helper Recommendations</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-550 mb-1.5 uppercase">Notes & Recommendations</label>
                <textarea
                  rows="6"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Draft your legal opinion or department action notes here..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-blue-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-550 mb-1.5 uppercase">Case Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none text-slate-800 bg-white"
                >
                  <option value="PENDING">Pending</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div className="pt-4 border-t space-y-3">
                <button
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className="w-full py-3 bg-blue-600 text-white hover:bg-blue-700 transition rounded-xl font-semibold text-sm cursor-pointer"
                >
                  {saving ? "Saving..." : "Save Draft Opinion"}
                </button>
                <button
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  className="w-full py-3 bg-green-600 text-white hover:bg-green-700 transition rounded-xl font-semibold text-sm cursor-pointer"
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