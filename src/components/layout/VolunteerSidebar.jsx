import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import Modal from "../common/Modal";
import {
  Home,
  ClipboardList,
  MessageSquare,
  Sparkles,
  Star,
  User,
  Settings,
  LogOut,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    path: "/volunteer/dashboard",
    icon: Home,
  },
  {
    title: "My Cases",
    path: "/volunteer/assigned-cases",
    icon: ClipboardList,
  },
  {
    title: "Messages",
    path: "/volunteer/messages",
    icon: MessageSquare,
  },
  {
    title: "ARAM AI",
    path: "/citizen/chatbot",
    icon: Sparkles,
  },
  {
    title: "Experience",
    path: "/volunteer/my-analytics",
    icon: Star,
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

  const handleLogout = () => {
    logout();
    setShowConfirmLogout(false);
  };

  const primaryItems = menuItems.slice(0, 5);
  const secondaryItems = menuItems.slice(5);

  return (
    <aside className="sidebar flex h-full w-full flex-col border-r border-slate-800 bg-slate-900 select-none">
      {/* Logo */}
      <div className="border-b border-slate-800 p-8 shrink-0">
        <h1 className="text-3xl font-extrabold text-white text-gradient">ARAM</h1>
        <p className="mt-1.5 text-xs text-slate-500 font-semibold uppercase tracking-wider">Legal Guide Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-5 sidebar-scroll space-y-6">
        <div>
          <span className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mb-3 px-3">Guide Workspace</span>
          <div className="space-y-1.5">
            {primaryItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.title}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all duration-150 ${
                      isActive
                        ? "bg-slate-850 text-white font-semibold shadow-sm border-l-4 border-indigo-500 rounded-l-none pl-3"
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

        <div>
          <span className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mb-3 px-3">Account & Preferences</span>
          <div className="space-y-1.5">
            {secondaryItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.title}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all duration-150 ${
                      isActive
                        ? "bg-slate-850 text-white font-semibold shadow-sm border-l-4 border-indigo-500 rounded-l-none pl-3"
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
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-800 p-5 shrink-0">
        <button
          onClick={() => setShowConfirmLogout(true)}
          className="flex w-full items-center gap-4 rounded-xl px-5 py-4 text-red-450 hover:bg-red-950/20 hover:text-red-300 transition duration-200"
        >
          <LogOut size={18} className="shrink-0" />
          <span className="font-medium text-xs">Logout</span>
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
            className="px-4 py-2 bg-red-650 text-white rounded-xl hover:bg-red-755 transition text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </Modal>
    </aside>
  );
};

export default VolunteerSidebar;