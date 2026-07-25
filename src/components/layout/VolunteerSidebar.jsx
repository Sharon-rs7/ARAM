import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
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

  const handleLogout = () => {
    logout();
    setShowConfirmLogout(false);
  };

  return (
    <aside className="sidebar flex min-h-screen w-full flex-col border-r border-slate-800 bg-slate-900">
      {/* Logo */}
      <div className="border-b border-slate-800 p-8">
        <h1 className="text-3xl font-extrabold text-white">ARAM</h1>
        <p className="mt-1.5 text-xs text-slate-500 font-semibold uppercase tracking-wider">Legal Guide Portal</p>
      </div>

      {/* Menu */}
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
                      ? "bg-slate-800 text-white font-semibold shadow-sm border-l-4 border-blue-500 rounded-l-none pl-3"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
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