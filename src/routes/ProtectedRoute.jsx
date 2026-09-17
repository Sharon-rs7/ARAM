import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/utils/roleLabels";

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100">
    <div className="flex flex-col items-center space-y-3">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm font-medium text-slate-400">Verifying session...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { accessToken, role, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader />;
  }

  if (!isAuthenticated || !accessToken) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Normalize role matching using the centralized normalization function
  const userRole = normalizeRole(role);

  const allowed = allowedRoles.map(r => normalizeRole(r));

  if (allowed.length > 0 && !allowed.includes(userRole)) {
    // Intentionally allow SUPER_ADMIN full access, and ADMIN access to administrative/superadmin routes
    if (userRole === "SUPER_ADMIN") {
      // Full statewide access granted
    } else if (userRole === "ADMIN" && (allowed.includes("SUPER_ADMIN") || allowed.includes("ADMIN"))) {
      // Access granted
    } else {
      console.warn(`Access denied for role '${userRole}'. Expected one of:`, allowed);
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
