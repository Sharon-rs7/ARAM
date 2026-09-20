import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, MessageSquare, Plus, Clock, Bell, 
  FolderCheck, BarChart3, User, ShieldAlert, Users, LayoutDashboard, Settings
} from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";
import { useLanguage } from "@/context/LanguageContext";

const MobileBottomNav = ({ role = "citizen" }) => {
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const { t } = useLanguage();

  // Role-specific bottom navigation tab definitions
  const getNavItems = () => {
    switch (role) {
      case "guide":
        return [
          { id: "dashboard", label: "Home", href: "/guide/dashboard", icon: Home },
          { id: "cases", label: "Cases", href: "/guide/assigned-cases", icon: FolderCheck },
          { id: "analytics", label: "XP & Stats", href: "/guide/my-analytics", icon: BarChart3 },
          { id: "profile", label: "Profile", href: "/guide/profile", icon: User },
        ];
      case "admin":
        return [
          { id: "dashboard", label: "Overview", href: "/admin/dashboard", icon: Home },
          { id: "complaints", label: "Grievances", href: "/admin/complaints", icon: FolderCheck },
          { id: "volunteers", label: "Guides", href: "/admin/volunteers", icon: Users },
          { id: "analytics", label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
        ];
      case "superadmin":
        return [
          { id: "dashboard", label: "Master", href: "/superadmin/dashboard", icon: LayoutDashboard },
          { id: "control", label: "Control", href: "/superadmin/control-center", icon: ShieldAlert },
          { id: "complaints", label: "Grievances", href: "/superadmin/complaints", icon: FolderCheck },
          { id: "settings", label: "Settings", href: "/superadmin/settings", icon: Settings },
        ];
      case "citizen":
      default:
        return [
          { 
            id: "home", 
            label: t("bottomNav.home", "Home"), 
            href: "/citizen/dashboard", 
            icon: Home 
          },
          { 
            id: "ai", 
            label: t("bottomNav.ai", "ARAM AI"), 
            href: "/citizen/chatbot", 
            icon: MessageSquare 
          },
          { 
            id: "submit", 
            label: t("bottomNav.file", "File"), 
            href: "/citizen/submit-complaint", 
            icon: Plus,
            isFab: true 
          },
          { 
            id: "cases", 
            label: t("bottomNav.cases", "My Cases"), 
            href: "/citizen/history", 
            icon: Clock 
          },
          { 
            id: "notifications", 
            label: t("bottomNav.alerts", "Alerts"), 
            href: "/citizen/notifications", 
            icon: Bell,
            badge: unreadCount 
          },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-[#DDE2DF] bg-[#FFFDF8]/95 backdrop-blur-lg shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href || 
            (item.href !== "/citizen/dashboard" && location.pathname.startsWith(item.href));

          // Center elevated FAB button for filing new grievances
          if (item.isFab) {
            return (
              <Link
                key={item.id}
                to={item.href}
                className="relative -top-3.5 flex flex-col items-center group focus:outline-none"
                aria-label={item.label}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#163D32] to-[#1F5948] text-white flex items-center justify-center shadow-lg shadow-[#163D32]/30 border-2 border-[#FFFDF8] group-hover:scale-105 group-active:scale-95 transition-all duration-200">
                  <Icon size={24} strokeWidth={2.6} />
                </div>
                <span className="text-[10px] font-extrabold text-[#163D32] tracking-tight mt-0.5">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.id}
              to={item.href}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 focus:outline-none ${
                isActive 
                  ? "text-[#163D32] font-black" 
                  : "text-[#65736D] hover:text-[#18332B] font-medium"
              }`}
              aria-label={item.label}
            >
              <div className="relative">
                <Icon 
                  size={20} 
                  strokeWidth={isActive ? 2.5 : 1.9}
                  className={`transition-transform duration-200 ${isActive ? "scale-110" : ""}`}
                />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[#E05252] text-white text-[9px] font-black flex items-center justify-center border-2 border-[#FFFDF8] animate-pulse">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] tracking-tight mt-1 transition-colors ${
                isActive ? "text-[#163D32] font-bold" : "text-[#8B9690]"
              }`}>
                {item.label}
              </span>

              {/* Active pill dot indicator */}
              {isActive && (
                <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[#163D32]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
