import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const PublicRoute = ({ children }) => {
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated) {
    const userRole = role ? role.toUpperCase() : "";
    if (userRole === "SUPER_ADMIN") {
      return <Navigate to="/superadmin/dashboard" replace />;
    } else if (userRole === "ADMIN") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (userRole === "GUIDE" || userRole === "VOLUNTEER") {
      return <Navigate to="/guide/dashboard" replace />;
    } else {
      return <Navigate to="/citizen/dashboard" replace />;
    }
  }

  return children ? children : <Outlet />;
};

export default PublicRoute;
