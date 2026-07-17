import { Link } from "react-router-dom";
import { Info, ArrowLeft } from "lucide-react";

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
        <div className="flex items-center gap-4 border-b pb-6">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <Info size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Cookie Policy</h1>
            <p className="text-slate-500 text-sm">Last updated: June 2026</p>
          </div>
        </div>

        <div className="mt-6 space-y-4 text-slate-600 leading-relaxed">
          <h3 className="font-semibold text-slate-800 text-lg">1. How We Use Cookies</h3>
          <p>
            ARAM only uses essential cookies and local storage tokens to keep you logged in and preserve UI appearance preferences (such as light/dark mode selection).
          </p>
          <p className="font-medium text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-100">
            ARAM provides preliminary complaint guidance only. It does not replace police, court, lawyer, or official authority.
          </p>
          <p>
            We do not run tracking cookies, third-party analytics pixels, or advertising beacons.
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
