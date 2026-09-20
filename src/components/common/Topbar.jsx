import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Bell, Search, User, LogOut, Shield, ChevronDown, 
  HelpCircle, Settings, CheckCircle2, AlertTriangle, FileText,
  Sun, Moon, Menu
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useNotifications } from "@/context/NotificationContext";
import { useTheme } from "@/context/ThemeContext";
import Avatar from "@/components/common/Avatar";

const Topbar = ({ onToggleSidebar, role = "citizen" }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { resolvedTheme, setMode } = useTheme();
  const { language, changeLanguage, availableLanguages, t } = useLanguage();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [notifDropdown, setNotifDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (user?.role === "SUPER_ADMIN") {
      navigate(`/superadmin/dashboard?tab=complaints&search=${encodeURIComponent(searchQuery)}`);
    } else if (user?.role === "ADMIN") {
      navigate(`/admin/complaints?search=${encodeURIComponent(searchQuery)}`);
    } else if (user?.role === "LEGAL_GUIDE" || user?.role === "VOLUNTEER") {
      navigate(`/volunteer/dashboard?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate(`/citizen/chatbot?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const searchPlaceholder = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN"
    ? t("topbar.searchAdmin", "Search grievances across all 38 districts (ID, citizen, keyword)...")
    : user?.role === "LEGAL_GUIDE" || user?.role === "VOLUNTEER"
    ? t("topbar.searchGuide", "Search assigned cases or legal topics...")
    : t("topbar.searchCitizen", "Ask ARAM AI legal questions (e.g., land title, RTI, 498A)...");

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#DDE2DF] bg-[#FFFDF8]/95 px-3 backdrop-blur-md sm:px-6">
      
      {/* Left Area: Mobile Hamburger & Search Input */}
      <div className="flex flex-1 items-center gap-2 max-w-lg min-w-0">
        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 -ml-1 text-[#163D32] hover:bg-[#DCEBDD]/50 active:scale-95 rounded-xl transition cursor-pointer lg:hidden flex items-center justify-center shrink-0 border border-[#E6E1D8]/70 bg-[#F7F1E6]/60 shadow-2xs"
          aria-label="Open mobile menu"
          title="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <form onSubmit={handleSearch} className="relative w-full min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#65736D]" size={15} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full h-10 rounded-full border border-[#DDE2DF] bg-white pl-9 sm:pl-10 pr-3 sm:pr-4 text-xs font-medium text-[#18332B] placeholder-[#8B9690] focus:border-[#163D32] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#DCEBDD]/50 transition shadow-2xs"
          />
        </form>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-1.5 sm:gap-3 ml-2 sm:ml-4 shrink-0">
        
        {/* Language selector pill */}
        <div className="flex items-center bg-[#F7F1E6] rounded-full p-1 border border-[#E6E1D8]">
          {availableLanguages.map((l) => (
            <button
              key={l.code}
              onClick={() => changeLanguage(l.code)}
              className={`px-2 sm:px-3 py-1 text-[11px] font-bold rounded-full transition cursor-pointer ${
                language === l.code ? "bg-[#163D32] text-white shadow-sm" : "text-[#65736D] hover:text-[#18332B]"
              }`}
            >
              {l.nativeLabel || l.label}
            </button>
          ))}
        </div>

        {/* Light & Dark Mode Toggle Icon */}
        <button
          type="button"
          onClick={() => setMode(resolvedTheme === "dark" ? "LIGHT" : "DARK")}
          className="p-2 rounded-full text-[#163D32] hover:bg-[#DCEBDD]/40 transition cursor-pointer border border-[#E6E1D8] bg-[#F7F1E6]/70 flex items-center justify-center shadow-2xs"
          title={resolvedTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle light/dark theme"
        >
          {resolvedTheme === "dark" ? (
            <Sun size={17} className="text-[#C58A25]" />
          ) : (
            <Moon size={17} className="text-[#163D32]" />
          )}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotifDropdown(!notifDropdown);
              setProfileDropdown(false);
            }}
            className="relative p-2 rounded-full text-[#163D32] hover:bg-[#DCEBDD]/40 transition cursor-pointer"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#163D32] text-white text-[10px] font-black flex items-center justify-center border-2 border-white animate-pulse shadow-xs">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notifDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#FFFDF8] border border-[#E6E1D8] shadow-2xl py-3 px-4 z-50 animate-in fade-in space-y-3">
              <div className="flex items-center justify-between border-b border-[#E6E1D8] pb-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#163D32] flex items-center gap-1.5">
                  <Bell size={14} className="text-[#1F5948]" /> Notifications & Alerts
                </span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[10px] font-bold text-[#1F5948] hover:underline cursor-pointer"
                    >
                      Mark read
                    </button>
                  )}
                  <span className="text-[10px] font-bold bg-[#DCEBDD] text-[#163D32] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                    Live
                  </span>
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto divide-y divide-[#E6E1D8]/60 text-xs">
                {notifications.slice(0, 6).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      markAsRead(n.id);
                      if (n.complaintId) {
                        navigate(role === "admin" ? `/admin/complaint/${n.complaintId}` : `/citizen/complaint/${n.complaintId}`);
                        setNotifDropdown(false);
                      }
                    }}
                    className={`pt-2 pb-1.5 space-y-0.5 cursor-pointer transition rounded-lg p-1.5 ${
                      n.read || n.readFlag ? "opacity-75 hover:bg-[#F7F1E6]/40" : "bg-[#DCEBDD]/20 hover:bg-[#DCEBDD]/40"
                    }`}
                  >
                    <p className="font-bold text-[#18332B] flex items-center justify-between">
                      <span className="truncate pr-2">{n.title || "Legal Alert"}</span>
                      <span className="text-[9px] text-[#8B9690] font-normal shrink-0">
                        {n.time || "Just now"}
                      </span>
                    </p>
                    <p className="text-[11px] text-[#65736D] leading-relaxed line-clamp-2">
                      {n.message}
                    </p>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <p className="text-center py-6 text-xs text-[#8B9690]">
                    No notifications yet. You're completely up to date!
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-[#E6E1D8] flex justify-between items-center text-[11px]">
                <Link
                  to={role === "admin" ? "/admin/notifications" : "/citizen/notifications"}
                  onClick={() => setNotifDropdown(false)}
                  className="font-bold text-[#1F5948] hover:underline"
                >
                  View full center →
                </Link>
                <button
                  type="button"
                  onClick={() => setNotifDropdown(false)}
                  className="text-[#8B9690] hover:text-[#18332B] font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdown(!profileDropdown)}
            className="flex items-center gap-2 rounded-full p-1.5 pr-3 hover:bg-[#DCEBDD]/30 transition"
          >
            <Avatar
              src={user?.avatarUrl}
              name={user?.name}
              role={user?.role}
              size="sm"
              showRoleBadge={true}
            />
            <div className="hidden text-left sm:block">
              <p className="text-xs font-bold text-[#18332B] leading-none">{user?.name || "Citizen"}</p>
              <p className="text-[10px] text-[#65736D] font-medium mt-0.5">{user?.role || "CITIZEN"}</p>
            </div>
            <ChevronDown size={14} className="text-[#8B9690]" />
          </button>

          {profileDropdown && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#FFFDF8] border border-[#E6E1D8] shadow-xl py-2 z-50">
              <Link
                to={role === "admin" ? "/admin/profile" : role === "guide" ? "/guide/profile" : "/citizen/profile"}
                onClick={() => setProfileDropdown(false)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#18332B] hover:bg-[#DCEBDD]/40"
              >
                <User size={14} /> {t("sidebar.profileSettings", "Profile & Settings")}
              </Link>
              <Link
                to="/citizen/help"
                onClick={() => setProfileDropdown(false)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#18332B] hover:bg-[#DCEBDD]/40"
              >
                <HelpCircle size={14} /> {t("sidebar.helpRights", "Help & Legal Aid")}
              </Link>
              <div className="my-1 border-t border-[#E6E1D8]" />
              <button
                onClick={() => {
                  setProfileDropdown(false);
                  logout();
                }}
                className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 cursor-pointer"
              >
                <LogOut size={14} /> {t("sidebar.signOut", "Sign Out")}
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Topbar;
