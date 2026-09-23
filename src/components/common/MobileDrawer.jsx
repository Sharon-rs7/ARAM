import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  X, Home, MessageSquare, PlusCircle, Clock, FileText, 
  Search, HelpCircle, Bell, User, LogOut, PhoneCall, Shield,
  FolderCheck, BarChart3, Users, LayoutDashboard, ShieldAlert, Settings,
  Sun, Moon
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useNotifications } from "@/context/NotificationContext";
import Avatar from "@/components/common/Avatar";
import Logo from "@/components/common/Logo";

const MobileDrawer = ({ isOpen, onClose, role = "citizen" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language, changeLanguage, availableLanguages, t } = useLanguage();
  const { resolvedTheme, setMode } = useTheme();
  const { unreadCount } = useNotifications();

  // Close drawer on route change
  useEffect(() => {
    if (isOpen) onClose();
  }, [location.pathname]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Role-specific navigation sections
  const getNavSections = () => {
    switch (role) {
      case "guide":
        return [
          {
            title: "Legal Guide Workspace",
            links: [
              { label: "Dashboard", href: "/guide/dashboard", icon: Home },
              { label: "Assigned Cases", href: "/guide/assigned-cases", icon: FolderCheck },
              { label: "Performance & XP", href: "/guide/my-analytics", icon: BarChart3 },
              { label: "Guide Profile", href: "/guide/profile", icon: User },
            ],
          },
        ];
      case "admin":
        return [
          {
            title: "District Administration",
            links: [
              { label: "Dashboard", href: "/admin/dashboard", icon: Home },
              { label: "Grievances Queue", href: "/admin/complaints", icon: FolderCheck },
              { label: "Legal Guides & Volunteers", href: "/admin/volunteers", icon: Users },
              { label: "Analytics & Reports", href: "/admin/analytics", icon: BarChart3 },
              { label: "Settings", href: "/admin/settings", icon: Settings },
            ],
          },
        ];
      case "superadmin":
        return [
          {
            title: "State Command Center",
            links: [
              { label: "Statewide Analytics", href: "/superadmin/dashboard?tab=analytics", icon: LayoutDashboard },
              { label: "Regional Control", href: "/superadmin/dashboard?tab=districts", icon: ShieldAlert },
              { label: "All State Grievances", href: "/superadmin/dashboard?tab=complaints", icon: FolderCheck },
              { label: "Immutable Audit Logs", href: "/superadmin/audit-logs", icon: FileText },
            ],
          },
        ];
      case "citizen":
      default:
        return [
          {
            title: t("sidebar.portalTitle", "Legal Aid Portal"),
            links: [
              { label: t("sidebar.dashboard", "Dashboard"), href: "/citizen/dashboard", icon: Home },
              { label: t("sidebar.askAi", "Ask ARAM AI Legal Companion"), href: "/citizen/chatbot", icon: MessageSquare },
              { label: t("sidebar.submitGrievance", "Submit Grievance"), href: "/citizen/submit-complaint", icon: PlusCircle },
              { label: t("sidebar.myGrievances", "My Grievances"), href: "/citizen/history", icon: Clock },
              { label: t("sidebar.documentsEvidence", "Documents & Evidence Locker"), href: "/citizen/documents", icon: FileText },
              { label: t("sidebar.trackStatus", "Track Complaint Status"), href: "/track-complaint", icon: Search },
            ],
          },
          {
            title: t("sidebar.supportSettings", "Support & Account"),
            links: [
              { 
                label: t("sidebar.notifications", "Notifications & Alerts"), 
                href: "/citizen/notifications", 
                icon: Bell,
                badge: unreadCount 
              },
              { label: t("sidebar.helpRights", "Legal Rights & FAQs"), href: "/citizen/help", icon: HelpCircle },
              { label: t("sidebar.profileSettings", "My Profile & Identity"), href: "/citizen/profile", icon: User },
            ],
          },
        ];
    }
  };

  const navSections = getNavSections();

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="relative w-4/5 max-w-xs h-full bg-[#163D32] text-white flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-250 border-r border-[#1F5948]">
        
        {/* Top Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#113128]">
          <Logo size="sm" light={true} variant="full" />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 bg-white/5 border-b border-white/10 flex items-center gap-3">
          <Avatar
            src={user?.avatarUrl}
            name={user?.name || "Citizen User"}
            role={user?.role}
            size="md"
            showRoleBadge={false}
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{user?.name || "Citizen User"}</p>
            <p className="text-[10px] text-[#DCEBDD]/70 truncate">{user?.email || "Signed in"}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[9px] font-black uppercase tracking-wider bg-[#DCEBDD]/20 text-[#DCEBDD] px-1.5 py-0.5 rounded">
                {role.toUpperCase()}
              </span>
              {user?.district && (
                <span className="text-[9px] text-white/60 truncate font-medium">
                  • {user.district}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1.5">
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-[#DCEBDD]/60">
                {section.title}
              </p>
              <nav className="space-y-1">
                {section.links.map((link) => {
                  const Icon = link.icon;
                  const fullCurrentPath = location.pathname + location.search;
                  const isActive = link.href.includes("?")
                    ? (fullCurrentPath === link.href || (location.pathname === "/superadmin/dashboard" && (!location.search || location.search === "?tab=analytics") && link.href.includes("tab=analytics")))
                    : (location.pathname === link.href);

                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                        isActive
                          ? "bg-[#DCEBDD] text-[#163D32] shadow-sm"
                          : "text-white/85 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={17} className={isActive ? "text-[#163D32]" : "text-white/80"} />
                        <span>{link.label}</span>
                      </div>
                      {link.badge > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-[#E05252] text-white text-[9px] font-black">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}

          {/* Quick Language Switcher Inside Drawer */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-[#DCEBDD]/60">
              Language / மொழி / भाषा
            </p>
            <div className="flex flex-wrap gap-1.5 px-2">
              {availableLanguages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => changeLanguage(l.code)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg transition ${
                    language === l.code
                      ? "bg-[#DCEBDD] text-[#163D32] shadow-xs"
                      : "bg-white/10 text-white/80 hover:bg-white/15"
                  }`}
                >
                  {l.nativeLabel || l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Emergency Legal Helpline Quick Access */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <PhoneCall size={14} className="text-[#C58A25]" />
              <span>Free Legal Aid Helpline</span>
            </div>
            <p className="text-[10px] text-white/70 leading-relaxed">
              NALSA National Tele-Law Toll-Free citizen support:
            </p>
            <a
              href="tel:15100"
              className="flex items-center justify-center gap-2 w-full py-1.5 bg-[#C58A25] hover:bg-[#b0781e] text-[#18332B] rounded-xl text-xs font-black transition shadow-xs"
            >
              <PhoneCall size={13} />
              <span>Call 15100 (Toll-Free)</span>
            </a>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-white/10 bg-[#113128] space-y-2">
          {/* Light / Dark Mode Toggle */}
          <button
            type="button"
            onClick={() => setMode(resolvedTheme === "dark" ? "LIGHT" : "DARK")}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-white/80 hover:bg-white/10 transition"
          >
            <div className="flex items-center gap-2">
              {resolvedTheme === "dark" ? <Sun size={15} className="text-[#C58A25]" /> : <Moon size={15} />}
              <span>{resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </div>
            <span className="text-[10px] text-white/60">
              {resolvedTheme === "dark" ? "ON" : "OFF"}
            </span>
          </button>

          {/* Sign Out */}
          <button
            onClick={() => {
              onClose();
              logout();
              navigate("/login");
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition cursor-pointer"
          >
            <LogOut size={16} />
            <span>{t("common.logout", "Sign Out")}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default MobileDrawer;
