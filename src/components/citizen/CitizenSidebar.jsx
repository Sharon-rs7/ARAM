import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "@/components/common/Logo";
import { 
  Home, MessageSquare, PlusCircle, Clock, FileText, 
  Search, Shield, HelpCircle, Bell, User, LogOut, ChevronLeft
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const CitizenSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const mainLinks = [
    { label: "Dashboard", href: "/citizen/dashboard", icon: Home },
    { label: "Ask ARAM AI", href: "/citizen/chatbot", icon: MessageSquare },
    { label: "Submit Grievance", href: "/citizen/submit-complaint", icon: PlusCircle },
    { label: "My Grievances", href: "/citizen/history", icon: Clock },
    { label: "Documents & Evidence", href: "/citizen/documents", icon: FileText },
    { label: "Track Status", href: "/track-complaint", icon: Search },
  ];

  const secondaryLinks = [
    { label: "Notifications", href: "/citizen/notifications", icon: Bell },
    { label: "Help & Rights Guide", href: "/citizen/help", icon: HelpCircle },
    { label: "Profile & Settings", href: "/citizen/profile", icon: User },
  ];

  return (
    <div className={`h-full flex flex-col justify-between bg-[#163D32] text-white border-r border-[#1F5948] transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}>
      
      {/* Top Brand */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        {!collapsed && <Logo size="sm" light={true} />}
        {collapsed && <div className="font-extrabold text-lg text-white">ARAM</div>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
        >
          <ChevronLeft className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} size={16} />
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          {!collapsed && <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-[#DCEBDD]/60 mb-2">Legal Aid Portal</p>}
          <nav className="space-y-1">
            {mainLinks.map((item) => {
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

        <div>
          {!collapsed && <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-[#DCEBDD]/60 mb-2">Support & Settings</p>}
          <nav className="space-y-1">
            {secondaryLinks.map((item) => {
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

export default CitizenSidebar;
