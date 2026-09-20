import { useState, useEffect } from "react";
import Topbar from "@/components/common/Topbar";
import CitizenSidebar from "@/components/citizen/CitizenSidebar";
import GuideSidebar from "@/components/guide/GuideSidebar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import SuperAdminSidebar from "@/components/superadmin/SuperAdminSidebar";
import MobileDrawer from "@/components/common/MobileDrawer";
import MobileBottomNav from "@/components/common/MobileBottomNav";
import { useAuth } from "@/context/AuthContext";

const DashboardLayout = ({ children, role }) => {
  const { user } = useAuth();
  const isSuperAdmin = role === "superadmin" || (!role && user?.role === "SUPER_ADMIN" && (user?.district === "GLOBAL" || user?.email === "superadmin@gmail.com"));
  const currentRole = role || (
    isSuperAdmin
      ? "superadmin"
      : (user?.role === "ADMIN" || user?.role === "REGIONAL_ADMIN"
          ? "admin" 
          : (user?.role === "VOLUNTEER" || user?.role === "GUIDE" || user?.role === "HELPER" ? "guide" : "citizen"))
  );
  
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F7F1E6] text-[#18332B]" data-role={currentRole}>
      {/* Slide-out Mobile Navigation Drawer (For small screens < 1024px) */}
      <MobileDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        role={currentRole}
      />

      {/* Desktop Sidebar (For screens >= 1024px) */}
      {!isMobile && (
        <aside style={{ width: `${sidebarWidth}px` }} className="shrink-0 h-full">
          {currentRole === "superadmin" && <SuperAdminSidebar />}
          {currentRole === "admin" && <AdminSidebar />}
          {currentRole === "guide" && <GuideSidebar />}
          {currentRole === "citizen" && <CitizenSidebar />}
        </aside>
      )}

      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Topbar 
          role={currentRole} 
          onToggleSidebar={() => setMobileDrawerOpen((prev) => !prev)} 
        />
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 pb-24 lg:pb-8 bg-[#F7F1E6]">
          {children}
        </main>
      </div>

      {/* Modern Sticky Bottom Navigation Bar (For mobile screens < 1024px) */}
      <MobileBottomNav role={currentRole} />
    </div>
  );
};

export default DashboardLayout;
