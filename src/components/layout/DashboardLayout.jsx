import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Topbar from "./Topbar";
import useActivityTracker from "../../hooks/useActivityTracker";

import CitizenSidebar from "./CitizenSidebar";
import VolunteerSidebar from "./VolunteerSidebar";
import AdminSidebar from "./AdminSidebar";

const DashboardLayout = ({ children }) => {
  useActivityTracker();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile drawer when path changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const renderSidebar = () => {
    if (location.pathname.startsWith("/admin")) {
      return <AdminSidebar />;
    }

    if (location.pathname.startsWith("/volunteer")) {
      return <VolunteerSidebar />;
    }

    return <CitizenSidebar />;
  };

  return (
    <div className="min-h-screen bg-[#F6F8FC] overflow-x-hidden">
      {/* Mobile Drawer (Visible on < md screens) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Drawer Overlay Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          {/* Sidebar Drawer */}
          <div className="relative flex w-[260px] max-w-[80vw] flex-col bg-white shadow-2xl animate-in slide-in-from-left duration-200">
            <button
              onClick={() => setIsMobileOpen(false)}
              className="absolute right-4 top-5 p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
            {renderSidebar()}
          </div>
        </div>
      )}

      <div className="flex">
        {/* Desktop Sidebar (Permanent on md/lg viewports) */}
        <div className="hidden md:flex md:w-[260px] shrink-0">
          {renderSidebar()}
        </div>

        <div className="flex flex-1 flex-col min-w-0">
          <Topbar onToggleSidebar={() => setIsMobileOpen(!isMobileOpen)} />

          <main className="flex-1 p-4 md:p-8 min-w-0">
            {children ? children : <Outlet />}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;