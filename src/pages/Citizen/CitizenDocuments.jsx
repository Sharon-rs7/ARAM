import DashboardLayout from "@/components/layout/DashboardLayout";
import DocumentVerificationPanel from "@/components/DocumentVerificationPanel";
import { FileText, Calendar, ShieldCheck, AlertCircle } from "lucide-react";
import { useState } from "react";
import EmptyState from "@/components/common/EmptyState";

const initialDocs = [
  {
    id: "DOC101",
    name: "Salary_Slip_March2026.pdf",
    size: "1.2 MB",
    uploadedAt: "2026-03-15",
    type: "Salary Slip",
    status: "VERIFIED",
    ocrConfidence: "98%",
  },
  {
    id: "DOC102",
    name: "Work_Contract.png",
    size: "2.4 MB",
    uploadedAt: "2026-03-10",
    type: "Employment Contract",
    status: "PENDING_REVIEW",
    ocrConfidence: "85%",
  }
];

// Update 7: Required document types for this case type
const REQUIRED_DOC_TYPES = [
  "Salary Slip",
  "Employment Contract",
  "Aadhaar Card",
  "Police Complaint Copy",
  "Witness Statement",
];

export default function CitizenDocuments() {
  const [docs] = useState(initialDocs);

  // Update 7: Compute document readiness score
  const verifiedCount = docs.filter(d => d.status === "VERIFIED").length;
  const totalRequired = REQUIRED_DOC_TYPES.length;
  const readinessPct = Math.round((verifiedCount / totalRequired) * 100);
  const missingTypes = REQUIRED_DOC_TYPES.filter(t => !docs.find(d => d.type === t && d.status === "VERIFIED"));

  const scoreColor = readinessPct >= 80 ? "bg-emerald-500" : readinessPct >= 50 ? "bg-amber-500" : "bg-rose-500";
  const scoreLabel = readinessPct >= 80 ? "✅ Strong Readiness" : readinessPct >= 50 ? "⚠️ Partially Ready" : "❌ More Documents Needed";

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">My Documents</h1>
          <p className="mt-2 text-slate-500">
            Manage your uploaded evidence slips, identity cards, and view AI OCR extraction logs.
          </p>
        </div>

        {/* Update 7: Document Readiness Score */}
        <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">Document Readiness Score</h3>
              <p className="text-xs text-slate-500 mt-0.5">{verifiedCount} of {totalRequired} required documents verified</p>
            </div>
            <span className={`text-xs font-extrabold px-3 py-1.5 rounded-full text-white ${
              readinessPct >= 80 ? "bg-emerald-500" : readinessPct >= 50 ? "bg-amber-500" : "bg-rose-500"
            }`}>{readinessPct}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${scoreColor}`}
              style={{ width: `${readinessPct}%` }}
            />
          </div>
          <p className="text-[11px] font-bold mt-2 text-slate-500">{scoreLabel}</p>
          {missingTypes.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {missingTypes.map(t => (
                <span key={t} className="text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-full">Missing: {t}</span>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Document list */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Uploaded Evidence Files</h2>
              
              <div className="space-y-4">
                {docs.length === 0 ? (
                  <EmptyState
                    title="No Evidence Uploaded"
                    description="You haven't uploaded any documents or proof slips for this case yet."
                  />
                ) : (
                  docs.map((doc) => (
                    <div key={doc.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border border-slate-200 rounded-2xl hover:bg-slate-50 transition gap-4">
                      <div className="flex items-start gap-4">
                        <div className="rounded-xl bg-blue-500/10 p-3 text-blue-600 mt-1">
                          <FileText size={24} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800 break-all">{doc.name}</h4>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                            <span>{doc.size}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar size={12} /> {doc.uploadedAt}
                            </span>
                            <span>•</span>
                            <span>{doc.type}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-end gap-2 w-full sm:w-auto justify-between sm:justify-start">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                          doc.status === "VERIFIED" 
                            ? "bg-green-500/10 text-green-700 border border-green-200" 
                            : "bg-yellow-500/10 text-yellow-700 border border-yellow-200"
                        }`}>
                          {doc.status === "VERIFIED" ? <ShieldCheck size={12} /> : <AlertCircle size={12} />}
                          {doc.status.replace("_", " ")}
                        </span>
                        <span className="text-[11px] text-slate-400">OCR: {doc.ocrConfidence}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* AI Verification upload panel */}
          <div>
            <DocumentVerificationPanel />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
