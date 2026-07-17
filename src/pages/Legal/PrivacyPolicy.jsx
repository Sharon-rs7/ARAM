import { Link } from "react-router-dom";
import { Shield, ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
        <div className="flex items-center gap-4 border-b pb-6">
          <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
            <Shield size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
            <p className="text-slate-500 text-sm">Last updated: June 2026</p>
          </div>
        </div>

        <div className="mt-6 space-y-4 text-slate-600 leading-relaxed max-h-[350px] overflow-y-auto pr-2">
          <h3 className="font-semibold text-slate-800 text-lg">1. Data Collection</h3>
          <p>
            We collect personal details (name, email, mobile) and the description of complaints you submit. If you upload evidence files, they are securely stored and analyzed for OCR verification.
          </p>

          <h3 className="font-semibold text-slate-800 text-lg">2. Preliminary Guidance Warning</h3>
          <p className="font-medium text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-100">
            ARAM provides preliminary complaint guidance only. It does not replace police, court, lawyer, or official authority.
          </p>

          <h3 className="font-semibold text-slate-800 text-lg">3. Privacy Constraints</h3>
          <p>
            Citizens can set their Identity Visibility to **VISIBLE**, **PARTIAL**, or **HIDDEN**. We mask all detected PII data (Aadhaar cards, mobile numbers, UPI IDs) using regex and machine learning engines before volunteer review.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t flex justify-end">
          <Link
            to="/"
            className="flex items-center gap-2 px-6 h-12 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-medium transition"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
