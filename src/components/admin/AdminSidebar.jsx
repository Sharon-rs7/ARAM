import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "@/components/common/Logo";
import { 
  Home, Users, FileSpreadsheet, ShieldAlert, BarChart3, 
  Building2, UserCheck, Settings, LogOut, ChevronLeft
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const AdminSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navLinks = [
    { label: "Regional Dashboard", href: "/admin/dashboard", icon: Home },
    { label: "Manage Complaints", href: "/admin/complaints", icon: FileSpreadsheet },
    { label: "Manage Citizens", href: "/admin/users", icon: Users },
    { label: "Legal Guides", href: "/admin/volunteers", icon: UserCheck },
    { label: "Authorities & Depts", href: "/admin/departments", icon: Building2 },
    { label: "Analytics & Reports", href: "/admin/analytics", icon: BarChart3 },
    { label: "Admin Profile", href: "/admin/profile", icon: Settings },
  ];

  return (
    <div className={`h-full flex flex-col justify-between bg-[#163D32] text-white border-r border-[#1F5948] transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}>
      
      {/* Top Brand */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <Logo size="sm" light={true} variant={collapsed ? "mark" : "full"} />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
        >
          <ChevronLeft className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} size={16} />
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {!collapsed && <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-[#DCEBDD]/60 mb-2">Regional Administration</p>}
        <nav className="space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive 
                    ? "bg-[#DCEBDD] text-[#163D32] shadow-sm" 
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={18} className={isActive ? "text-[#163D32]" : "text-white/80"} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Sign Out */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-300 hover:bg-red-500/20 hover:text-red-100 transition"
        >
          <LogOut size={18} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

    </div>
  );
};

export default AdminSidebar;
