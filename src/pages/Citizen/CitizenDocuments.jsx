import DashboardLayout from "@/components/layout/DashboardLayout";
import DocumentVerificationPanel from "@/components/DocumentVerificationPanel";
import { FileText, Calendar, ShieldCheck, AlertCircle } from "lucide-react";
import { useState } from "react";

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

export default function CitizenDocuments() {
  const [docs] = useState(initialDocs);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">My Documents</h1>
          <p className="mt-2 text-slate-500">
            Manage your uploaded evidence slips, identity cards, and view AI OCR extraction logs.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Document list */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Uploaded Evidence Files</h2>
              
              <div className="space-y-4">
                {docs.map((doc) => (
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
                ))}
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
