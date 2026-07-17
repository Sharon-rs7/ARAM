import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import Modal from "../common/Modal";
import {
  LayoutDashboard,
  ClipboardPlus,
  History,
  Bot,
  Bell,
  User,
  Settings,
  LogOut,
  FileText,
  MessageSquare,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    path: "/citizen/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Submit Complaint",
    path: "/citizen/submit-complaint",
    icon: ClipboardPlus,
  },
  {
    title: "My Complaints",
    path: "/citizen/my-complaints",
    icon: History,
  },
  {
    title: "AI Analysis",
    path: "/citizen/ai-analysis",
    icon: Bot,
  },
  {
    title: "Chatbot",
    path: "/citizen/chatbot",
    icon: MessageSquare,
  },
  {
    title: "Notifications",
    path: "/citizen/notifications",
    icon: Bell,
  },
  {
    title: "Documents",
    path: "/citizen/documents",
    icon: FileText,
  },
  {
    title: "Profile",
    path: "/citizen/profile",
    icon: User,
  },
  {
    title: "Settings",
    path: "/citizen/settings",
    icon: Settings,
  },
];

const CitizenSidebar = () => {
  const { logout } = useAuth();
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  const handleLogout = () => {
    logout();
    setShowConfirmLogout(false);
  };

  return (
    <aside className="sidebar flex min-h-screen w-[260px] flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="border-b border-slate-100 p-8">
        <h1 className="text-3xl font-extrabold text-blue-600">ARAM</h1>
        <p className="mt-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider">Citizen Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-5">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all duration-200 ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-semibold shadow-sm"
                      : "text-slate-605 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                <Icon size={20} className="shrink-0" />
                <span className="font-medium">{item.title}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-100 p-5">
        <button
          onClick={() => setShowConfirmLogout(true)}
          className="flex w-full items-center gap-4 rounded-xl px-5 py-4 text-red-500 hover:bg-red-50 hover:text-red-700 transition duration-200"
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

export default CitizenSidebar;