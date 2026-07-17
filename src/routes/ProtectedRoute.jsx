import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { accessToken, role, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !accessToken) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Ensure role is upper case matched
  const userRole = role ? role.toUpperCase() : "";
  const allowed = allowedRoles.map(r => r.toUpperCase());

  if (allowed.length > 0 && !allowed.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
