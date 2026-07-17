import { Menu, Search, Bell, Settings, Moon, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Topbar = ({ onToggleSidebar }) => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const handleSettingsClick = () => {
    if (!role) return;
    const userRole = role.toUpperCase();
    if (userRole === "ADMIN") {
      navigate("/admin/settings");
    } else if (userRole === "VOLUNTEER" || userRole === "HELPER") {
      navigate("/volunteer/settings");
    } else {
      navigate("/citizen/settings");
    }
  };

  const handleNotificationsClick = () => {
    if (!role) return;
    const userRole = role.toUpperCase();
    if (userRole === "ADMIN") {
      navigate("/admin/settings");
    } else if (userRole === "VOLUNTEER") {
      navigate("/volunteer/dashboard");
    } else {
      navigate("/citizen/notifications");
    }
  };

  const formatRole = (roleStr) => {
    if (!roleStr) return "";
    const lower = roleStr.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  return (
    <header className="flex items-center justify-between border-b bg-white px-4 md:px-8 py-4 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Hamburger Menu button */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden rounded-xl bg-slate-100 p-2.5 transition hover:bg-slate-200"
        >
          <Menu size={20} />
        </button>

        {/* Search */}
        <div className="relative w-full max-w-[200px] md:max-w-md hidden sm:block">
          <Search
            size={18}
            className="absolute left-4 top-3 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search..."
            className="h-10 w-full rounded-xl border border-slate-300 pl-11 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-sm"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Theme Toggle placeholder */}
        <button className="rounded-xl bg-slate-100 p-2.5 transition hover:bg-slate-200">
          <Moon size={18} />
        </button>

        {/* Notifications */}
        <button 
          onClick={handleNotificationsClick}
          className="relative rounded-xl bg-slate-100 p-2.5 transition hover:bg-slate-200"
        >
          <Bell size={18} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        {/* Settings */}
        <button 
          onClick={handleSettingsClick}
          className="rounded-xl bg-slate-100 p-2.5 transition hover:bg-slate-200"
        >
          <Settings size={18} />
        </button>

        {/* User Card */}
        <div className="flex items-center gap-2 md:gap-3 rounded-xl bg-slate-100 p-1.5 md:px-4 md:py-2">
          {user?.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt="Avatar" 
              className="h-8 w-8 md:h-10 md:w-10 rounded-full object-cover border border-slate-200"
            />
          ) : (
            <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-blue-600">
              <User
                size={16}
                className="text-white"
              />
            </div>
          )}

          <div className="hidden md:block">
            <h3 className="font-semibold text-slate-800 leading-tight text-sm">
              {user?.name || "User"}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {formatRole(role)}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;