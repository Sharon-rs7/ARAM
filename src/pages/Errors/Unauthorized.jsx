import { Link } from "react-router-dom";
import { Lock, ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Unauthorized() {
  const { isAuthenticated, role } = useAuth();

  const getDashboardPath = () => {
    if (!isAuthenticated || !role) return "/login";
    const userRole = role.toUpperCase();
    if (userRole === "ADMIN") return "/admin/dashboard";
    if (userRole === "VOLUNTEER") return "/volunteer/dashboard";
    return "/citizen/dashboard";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl text-center border border-slate-100">
        <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock size={40} />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">403</h1>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Access Denied</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          You do not have permissions to access this department or dashboard.
        </p>
        <Link
          to={getDashboardPath()}
          className="inline-flex items-center justify-center gap-2 h-14 px-8 w-full bg-amber-600 text-white rounded-xl hover:bg-amber-700 font-semibold transition shadow-lg shadow-amber-100"
        >
          <ArrowLeft size={18} />
          {isAuthenticated ? "Back to Dashboard" : "Go to Login"}
        </Link>
      </div>
    </div>
  );
}
