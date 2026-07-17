import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import Modal from "../common/Modal";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  UserCheck,
  Building2,
  BarChart3,
  FileText,
  User,
  Settings,
  LogOut,
  ShieldAlert,
  Activity,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Manage Users",
    path: "/admin/users",
    icon: Users,
  },
  {
    title: "Manage Complaints",
    path: "/admin/complaints",
    icon: ClipboardList,
  },
  {
    title: "Manage Volunteers",
    path: "/admin/volunteers",
    icon: UserCheck,
  },
  {
    title: "Departments",
    path: "/admin/departments",
    icon: Building2,
  },
  {
    title: "Analytics",
    path: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Reports",
    path: "/admin/reports",
    icon: FileText,
  },
  {
    title: "Audit Logs",
    path: "/admin/audit-logs",
    icon: ShieldAlert,
  },
  {
    title: "Volunteer Activity",
    path: "/admin/volunteer-activity",
    icon: Activity,
  },
  {
    title: "Profile",
    path: "/admin/profile",
    icon: User,
  },
  {
    title: "Settings",
    path: "/admin/settings",
    icon: Settings,
  },
];

const AdminSidebar = () => {
  const { logout } = useAuth();
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  const handleLogout = () => {
    logout();
    setShowConfirmLogout(false);
  };

  return (
    <aside className="flex min-h-screen w-[260px] flex-col bg-[#0B1F36] text-white">
      {/* Logo */}
      <div className="border-b border-white/10 p-8">
        <h1 className="text-3xl font-bold text-red-400">ARAM</h1>
        <p className="mt-2 text-xs text-slate-400">Admin Panel</p>
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
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                    isActive
                      ? "bg-red-600/20 text-white ring-1 ring-red-400/20 font-medium"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon size={22} />
                <span className="font-medium">{item.title}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-700 p-5">
        <button
          onClick={() => setShowConfirmLogout(true)}
          className="flex w-full items-center gap-4 rounded-xl px-5 py-4 text-red-400 transition hover:bg-red-600 hover:text-white"
        >
          <LogOut size={22} />
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

export default AdminSidebar;