import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicRoute = ({ children }) => {
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated) {
    const userRole = role ? role.toUpperCase() : "";
    if (userRole === "ADMIN") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (userRole === "VOLUNTEER") {
      return <Navigate to="/volunteer/dashboard" replace />;
    } else {
      return <Navigate to="/citizen/dashboard" replace />;
    }
  }

  return children ? children : <Outlet />;
};

export default PublicRoute;
