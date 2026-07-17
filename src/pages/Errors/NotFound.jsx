import { Link } from "react-router-dom";
import { HelpCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl text-center border border-slate-100">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <HelpCircle size={40} />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">404</h1>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Page Not Found</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 h-14 px-8 w-full bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition shadow-lg shadow-blue-100"
        >
          <ArrowLeft size={18} />
          Go to Home
        </Link>
      </div>
    </div>
  );
}
