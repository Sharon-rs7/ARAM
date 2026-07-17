import { Link } from "react-router-dom";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function ServerError() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl text-center border border-slate-100">
        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={40} />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">500</h1>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Internal Server Error</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          The ARAM core backend service returned an unexpected response. Please try again or restart the Spring Boot server.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center gap-2 h-14 px-8 w-full bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-semibold transition shadow-lg"
        >
          <RotateCcw size={18} />
          Reload Page
        </button>
        <Link to="/" className="block mt-4 text-sm font-semibold text-blue-600 hover:underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
