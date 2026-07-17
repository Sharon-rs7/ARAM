import { Link } from "react-router-dom";
import { FileText, ArrowLeft } from "lucide-react";

export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
        <div className="flex items-center gap-4 border-b pb-6">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <FileText size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Terms & Conditions</h1>
            <p className="text-slate-500 text-sm">Last updated: June 2026</p>
          </div>
        </div>

        <div className="mt-6 space-y-4 text-slate-600 leading-relaxed max-h-[350px] overflow-y-auto pr-2">
          <h3 className="font-semibold text-slate-800 text-lg">1. Acceptance of Terms</h3>
          <p>
            By accessing or using ARAM, you agree to be bound by these terms. If you disagree with any part, you may not access the service.
          </p>

          <h3 className="font-semibold text-slate-800 text-lg">2. Preliminary Guidance Only</h3>
          <p className="font-medium text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-100">
            ARAM provides preliminary complaint guidance only. It does not replace police, court, lawyer, or official authority.
          </p>

          <h3 className="font-semibold text-slate-800 text-lg">3. User Accounts & Security</h3>
          <p>
            You are responsible for safeguarding your login credentials. Do not share your password or access token with third parties. ARAM will never ask for your password.
          </p>

          <h3 className="font-semibold text-slate-800 text-lg">4. Permitted Use</h3>
          <p>
            You agree not to submit false, malicious, defamatory, or abusive complaints. Doing so may result in account suspension and reference to local law enforcement.
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
