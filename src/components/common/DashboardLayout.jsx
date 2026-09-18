import { useState, useEffect } from "react";
import Topbar from "@/components/common/Topbar";
import CitizenSidebar from "@/components/citizen/CitizenSidebar";
import GuideSidebar from "@/components/guide/GuideSidebar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import SuperAdminSidebar from "@/components/superadmin/SuperAdminSidebar";
import { useAuth } from "@/context/AuthContext";

const DashboardLayout = ({ children, role }) => {
  const { user } = useAuth();
  const isSuperAdmin = role === "superadmin" || user?.role === "SUPER_ADMIN" || user?.district === "GLOBAL" || user?.email === "superadmin@gmail.com";
  const currentRole = role || (
    isSuperAdmin
      ? "superadmin"
      : (user?.role === "ADMIN" || user?.role === "REGIONAL_ADMIN"
          ? "admin" 
          : (user?.role === "VOLUNTEER" || user?.role === "GUIDE" || user?.role === "HELPER" ? "guide" : "citizen"))
  );
  
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F7F1E6] text-[#18332B]" data-role={currentRole}>
      {/* Sidebar */}
      {!isMobile && (
        <aside style={{ width: `${sidebarWidth}px` }} className="shrink-0 h-full">
          {currentRole === "superadmin" && <SuperAdminSidebar />}
          {currentRole === "admin" && <AdminSidebar />}
          {currentRole === "guide" && <GuideSidebar />}
          {currentRole === "citizen" && <CitizenSidebar />}
        </aside>
      )}

      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar role={currentRole} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F7F1E6]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
