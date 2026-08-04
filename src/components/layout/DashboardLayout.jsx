import { Outlet, useLocation, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { X, Home, PlusCircle, ClipboardList, MessageSquare, User, Settings, Briefcase, ShieldOff, ShieldAlert } from "lucide-react";
import Topbar from "./Topbar";
import useActivityTracker from "../../hooks/useActivityTracker";

import CitizenSidebar from "./CitizenSidebar";
import VolunteerSidebar from "./VolunteerSidebar";
import AdminSidebar from "./AdminSidebar";

const DashboardLayout = ({ children }) => {
  useActivityTracker();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [stealthMode, setStealthMode] = useState(false);
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
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-[#F6F8FC] flex flex-col pb-16 md:pb-0">
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

      <div className="flex flex-1 md:h-full md:overflow-hidden min-w-0">
        {/* Desktop Sidebar (Permanent on md/lg viewports) */}
        <div 
          className="hidden md:flex shrink-0 relative h-full"
          style={{ width: `${sidebarWidth}px` }}
        >
          <div className="w-full h-full overflow-hidden flex flex-col">
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

        <div className="flex flex-1 flex-col min-w-0 md:h-full md:overflow-hidden">
          <Topbar onToggleSidebar={() => setIsMobileOpen(!isMobileOpen)} />

          {/* Update 2: Stealth Privacy Shield Toggle Button */}
          <button
            onClick={() => setStealthMode(s => !s)}
            title={stealthMode ? "Exit Privacy Shield" : "Privacy Shield (Panic Button)"}
            className={`fixed bottom-20 md:bottom-6 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full shadow-xl text-xs font-bold transition-all duration-300 ${
              stealthMode
                ? "bg-rose-600 text-white hover:bg-rose-700 animate-pulse"
                : "bg-slate-800/80 text-slate-300 hover:bg-rose-600 hover:text-white backdrop-blur-sm border border-slate-700"
            }`}
          >
            {stealthMode ? <ShieldOff size={14} /> : <ShieldAlert size={14} />}
            {stealthMode ? "Exit Shield" : "Privacy Shield"}
          </button>

          <main className="flex-1 md:overflow-y-auto md:overflow-x-hidden p-4 md:p-8 min-w-0">
            {stealthMode ? (
              /* Update 2: Fake Tamil Nadu Daily News feed */
              <div className="space-y-6 max-w-3xl mx-auto">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-extrabold text-sm">TN</div>
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Tamil Nadu Daily</h1>
                    <p className="text-xs text-slate-500">Today's Top Headlines — {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                  </div>
                </div>
                {[
                  { tag: "Politics", headline: "CM announces new bus route expansion across 12 districts", time: "2 hours ago", img: "🚌" },
                  { tag: "Economy", headline: "Chennai IT corridor sees 18% rise in startup registrations this quarter", time: "4 hours ago", img: "💼" },
                  { tag: "Sports", headline: "Tamil Nadu cricket team qualifies for Ranji Trophy finals", time: "6 hours ago", img: "🏏" },
                  { tag: "Education", headline: "State govt announces free tablet scheme for Class 11–12 students", time: "8 hours ago", img: "📱" },
                  { tag: "Weather", headline: "IMD issues yellow alert for coastal districts — moderate rain expected", time: "10 hours ago", img: "🌧" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition cursor-pointer">
                    <span className="text-3xl mt-1 shrink-0">{item.img}</span>
                    <div className="flex-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">{item.tag}</span>
                      <p className="mt-1.5 text-sm font-bold text-slate-800 leading-snug">{item.headline}</p>
                      <p className="mt-1 text-[11px] text-slate-400">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              children ? children : <Outlet />
            )}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {renderBottomNavigation()}
    </div>
  );
};

export default DashboardLayout;