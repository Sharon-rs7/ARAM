import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import Modal from "../common/Modal";
import {
  LayoutDashboard,
  ClipboardList,
  FileSearch,
  User,
  LogOut,
  Settings,
  BarChart3,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    path: "/volunteer/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Assigned Cases",
    path: "/volunteer/assigned-cases",
    icon: ClipboardList,
  },
  {
    title: "Case Review",
    path: "/volunteer/case-review",
    icon: FileSearch,
  },
  {
    title: "Analytics",
    path: "/volunteer/my-analytics",
    icon: BarChart3,
  },
  {
    title: "Profile",
    path: "/volunteer/profile",
    icon: User,
  },
  {
    title: "Settings",
    path: "/volunteer/settings",
    icon: Settings,
  },
];

const VolunteerSidebar = () => {
  const { logout } = useAuth();
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [topHeight, setTopHeight] = useState(() => {
    const saved = localStorage.getItem("sidebar_volunteer_top_height");
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
      const rect = document.getElementById("sidebar-nav-container")?.getBoundingClientRect();
      if (!rect) return;
      const newHeight = Math.max(100, Math.min(rect.height - 120, mouseMoveEvent.clientY - rect.top));
      setTopHeight(newHeight);
      localStorage.setItem("sidebar_volunteer_top_height", newHeight.toString());
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const handleLogout = () => {
    logout();
    setShowConfirmLogout(false);
  };

  const primaryItems = menuItems.slice(0, 4);
  const secondaryItems = menuItems.slice(4);

  return (
    <aside className="sidebar flex min-h-screen w-full flex-col border-r border-slate-800 bg-slate-900 select-none">
      {/* Logo */}
      <div className="border-b border-slate-800 p-8 shrink-0">
        <h1 className="text-3xl font-extrabold text-white">ARAM</h1>
        <p className="mt-1.5 text-xs text-slate-500 font-semibold uppercase tracking-wider">Legal Guide Portal</p>
      </div>

      {/* Navigation Split Container */}
      <div 
        id="sidebar-nav-container"
        className="flex-1 flex flex-col min-h-0 overflow-hidden"
      >
        {/* Top Primary Navigation */}
        <div 
          className="overflow-y-auto p-4 shrink-0" 
          style={{ height: `${topHeight}px` }}
        >
          <span className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mb-3 px-3">Primary Action</span>
          <div className="space-y-1.5">
            {primaryItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-2 transition-all duration-150 ${
                      isActive
                        ? "bg-slate-855 text-white font-semibold shadow-sm border-l-4 border-indigo-500 rounded-l-none pl-3"
                        : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
                    }`
                  }
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="font-medium text-xs whitespace-nowrap overflow-hidden text-ellipsis">{item.title}</span>
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Draggable Horizontal Divider */}
        <div
          onMouseDown={startResizing}
          className="h-2.5 bg-slate-950 border-t border-b border-slate-800 hover:bg-indigo-500/10 cursor-row-resize flex items-center justify-center group shrink-0 select-none z-10"
        >
          <div className="w-8 h-1 rounded-full bg-slate-800 group-hover:bg-indigo-500/80 group-active:bg-indigo-500 transition-colors duration-150" />
        </div>

        {/* Bottom Secondary Navigation */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          <span className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mb-3 px-3">Account & Settings</span>
          <div className="space-y-1.5">
            {secondaryItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-2 transition-all duration-150 ${
                      isActive
                        ? "bg-slate-855 text-white font-semibold shadow-sm border-l-4 border-indigo-500 rounded-l-none pl-3"
                        : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
                    }`
                  }
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="font-medium text-xs whitespace-nowrap overflow-hidden text-ellipsis">{item.title}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="border-t border-slate-800 p-5">
        <button
          onClick={() => setShowConfirmLogout(true)}
          className="flex w-full items-center gap-4 rounded-xl px-5 py-4 text-red-400 hover:bg-red-950/20 hover:text-red-300 transition duration-200"
        >
          <LogOut size={20} className="shrink-0" />
          <span className="font-medium">Logout</span>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal 
        isOpen={showConfirmLogout} 
        onClose={() => setShowConfirmLogout(false)} 
        title="Confirm Logout"
      >
        <p className="text-slate-600 text-sm leading-relaxed mb-6">
          Are you sure you want to log out of the ARAM portal? This will end your active session.
        </p>
        <div className="flex justify-end gap-3">
          <button 
            onClick={() => setShowConfirmLogout(false)}
            className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition text-sm font-medium text-slate-600"
          >
            Cancel
          </button>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </Modal>
    </aside>
  );
};

export default VolunteerSidebar;