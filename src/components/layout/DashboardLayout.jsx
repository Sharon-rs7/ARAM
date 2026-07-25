import { Outlet, useLocation, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { X, Home, PlusCircle, ClipboardList, MessageSquare, User, Settings, Briefcase } from "lucide-react";
import Topbar from "./Topbar";
import useActivityTracker from "../../hooks/useActivityTracker";

import CitizenSidebar from "./CitizenSidebar";
import VolunteerSidebar from "./VolunteerSidebar";
import AdminSidebar from "./AdminSidebar";

const DashboardLayout = ({ children }) => {
  useActivityTracker();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem("dashboard_sidebar_width");
    return saved ? parseInt(saved, 10) : 260;
  });
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = (mouseDownEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (mouseMoveEvent) => {
      if (!isResizing) return;
      const newWidth = Math.max(180, Math.min(450, mouseMoveEvent.clientX));
      setSidebarWidth(newWidth);
      localStorage.setItem("dashboard_sidebar_width", newWidth.toString());
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
    } else {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

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

  const isCitizen = location.pathname.startsWith("/citizen");
  const isVolunteer = location.pathname.startsWith("/volunteer");

  const renderBottomNavigation = () => {
    if (!isCitizen && !isVolunteer) return null;

    if (isCitizen) {
      return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-slate-950 border-t border-slate-800 h-16 flex justify-around items-center px-2 shadow-2xl">
          <NavLink
            to="/citizen/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center text-center w-12 transition-colors ${
                isActive ? "text-blue-400 font-bold" : "text-slate-400 hover:text-slate-200"
              }`
            }
          >
            <Home size={20} />
            <span className="text-[9px] mt-1 font-medium tracking-wide">Home</span>
          </NavLink>

          <NavLink
            to="/citizen/submit-complaint"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center text-center w-12 transition-colors ${
                isActive ? "text-blue-400 font-bold" : "text-slate-400 hover:text-slate-200"
              }`
            }
          >
            <PlusCircle size={20} />
            <span className="text-[9px] mt-1 font-medium tracking-wide">Submit</span>
          </NavLink>

          <NavLink
            to="/citizen/my-complaints"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center text-center w-12 transition-colors ${
                isActive ? "text-blue-400 font-bold" : "text-slate-400 hover:text-slate-200"
              }`
            }
          >
            <ClipboardList size={20} />
            <span className="text-[9px] mt-1 font-medium tracking-wide">Track</span>
          </NavLink>

          <NavLink
            to="/citizen/chatbot"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center text-center w-12 transition-colors ${
                isActive ? "text-blue-400 font-bold" : "text-slate-400 hover:text-slate-200"
              }`
            }
          >
            <MessageSquare size={20} />
            <span className="text-[9px] mt-1 font-medium tracking-wide">AI Help</span>
          </NavLink>

          <NavLink
            to="/citizen/profile"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center text-center w-12 transition-colors ${
                isActive ? "text-blue-400 font-bold" : "text-slate-400 hover:text-slate-200"
              }`
            }
          >
            <User size={20} />
            <span className="text-[9px] mt-1 font-medium tracking-wide">Profile</span>
          </NavLink>
        </nav>
      );
    }

    if (isVolunteer) {
      return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-slate-955 border-t border-slate-800 h-16 flex justify-around items-center px-2 shadow-2xl">
          <NavLink
            to="/volunteer/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center text-center w-12 transition-colors ${
                isActive ? "text-blue-400 font-bold" : "text-slate-400 hover:text-slate-200"
              }`
            }
          >
            <Home size={20} />
            <span className="text-[9px] mt-1 font-medium tracking-wide">Home</span>
          </NavLink>

          <NavLink
            to="/volunteer/assigned-cases"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center text-center w-12 transition-colors ${
                isActive ? "text-blue-400 font-bold" : "text-slate-400 hover:text-slate-200"
              }`
            }
          >
            <Briefcase size={20} />
            <span className="text-[9px] mt-1 font-medium tracking-wide">Cases</span>
          </NavLink>

          <NavLink
            to="/volunteer/profile"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center text-center w-12 transition-colors ${
                isActive ? "text-blue-400 font-bold" : "text-slate-400 hover:text-slate-200"
              }`
            }
          >
            <User size={20} />
            <span className="text-[9px] mt-1 font-medium tracking-wide">Profile</span>
          </NavLink>

          <NavLink
            to="/volunteer/settings"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center text-center w-12 transition-colors ${
                isActive ? "text-blue-400 font-bold" : "text-slate-400 hover:text-slate-200"
              }`
            }
          >
            <Settings size={20} />
            <span className="text-[9px] mt-1 font-medium tracking-wide">Settings</span>
          </NavLink>
        </nav>
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FC] overflow-x-hidden pb-16 md:pb-0">
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
        <div 
          className="hidden md:flex shrink-0 relative"
          style={{ width: `${sidebarWidth}px` }}
        >
          <div className="w-full h-full overflow-hidden">
            {renderSidebar()}
          </div>
          {/* Draggable Divider Handler */}
          <div
            onMouseDown={startResizing}
            className="absolute top-0 -right-1.5 w-3 h-full cursor-col-resize z-30 group flex items-center justify-center select-none"
          >
            <div className="w-[1.5px] h-full bg-slate-200 dark:bg-slate-800 group-hover:bg-indigo-500/70 group-active:bg-indigo-500 transition-colors duration-150" />
            <div className="absolute top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-full bg-slate-900 border border-slate-700 opacity-50 group-hover:opacity-100 group-active:opacity-100 transition-all duration-150 flex flex-col items-center justify-center gap-0.5 shadow-md">
              <span className="w-0.5 h-0.5 rounded-full bg-slate-400" />
              <span className="w-0.5 h-0.5 rounded-full bg-slate-400" />
              <span className="w-0.5 h-0.5 rounded-full bg-slate-400" />
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col min-w-0">
          <Topbar onToggleSidebar={() => setIsMobileOpen(!isMobileOpen)} />

          <main className="flex-1 p-4 md:p-8 min-w-0">
            {children ? children : <Outlet />}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {renderBottomNavigation()}
    </div>
  );
};

export default DashboardLayout;