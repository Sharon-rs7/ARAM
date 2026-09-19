import React, { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Logo from "@/components/common/Logo";
import { 
  MapPin, Users, Scale, ShieldAlert, FileText, 
  Bot, ShieldCheck, Settings, LogOut, ChevronLeft,
  ChevronDown, ExternalLink, Activity, Search
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export const TN_DISTRICTS = [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", 
  "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", 
  "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", 
  "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", 
  "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", 
  "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", 
  "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", 
  "Vellore", "Viluppuram", "Virudhunagar"
];

const SuperAdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { logout, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [districtJumpOpen, setDistrictJumpOpen] = useState(false);
  const [districtQuery, setDistrictQuery] = useState("");

  const currentTab = searchParams.get("tab") || "analytics";
  const isDashboard = location.pathname === "/superadmin/dashboard" || location.pathname === "/superadmin";

  const navItems = [
    {
      group: "Core Governance",
      items: [
        {
          id: "analytics",
          label: "Statewide Analytics",
          href: "/superadmin/dashboard?tab=analytics",
          tab: "analytics",
          icon: Activity,
          badge: "Live"
        },
        {
          id: "districts",
          label: "District Grievance Portals",
          href: "/superadmin/dashboard?tab=districts",
          tab: "districts",
          icon: MapPin,
          badge: "38"
        },
        {
          id: "complaints",
          label: "Grievance Queue",
          href: "/superadmin/dashboard?tab=complaints",
          tab: "complaints",
          icon: FileText
        },
        {
          id: "citizens",
          label: "Citizen Registry",
          href: "/superadmin/dashboard?tab=citizens",
          tab: "citizens",
          icon: Users
        }
      ]
    },
    {
      group: "Operations and Auditing",
      items: [
        {
          id: "guides",
          label: "Legal Guide Force",
          href: "/superadmin/dashboard?tab=guides",
          tab: "guides",
          icon: Scale,
          badge: "120+"
        },
        {
          id: "admins",
          label: "District Admins",
          href: "/superadmin/dashboard?tab=admins",
          tab: "admins",
          icon: ShieldCheck,
          badge: "38"
        },
        {
          id: "ai_audit",
          label: "AI Compliance and Audit",
          href: "/superadmin/dashboard?tab=ai_audit",
          tab: "ai_audit",
          icon: Bot
        }
      ]
    }
  ];

  const filteredDistricts = TN_DISTRICTS.filter((d) =>
    d.toLowerCase().includes(districtQuery.toLowerCase())
  );

  return (
    <div
      className={`h-full flex flex-col justify-between bg-[#163D32] text-white border-r border-[#1F5948] transition-all duration-300 select-none shadow-xl ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Top Header / Branding */}
      <div className="p-4 border-b border-emerald-800/60 flex items-center justify-between bg-[#13352B]">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <Logo size="sm" light={true} />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#DCEBDD] bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-600/40 w-fit">
                Super Admin
              </span>
            </div>
          </div>
        ) : (
          <div className="mx-auto">
            <Logo variant="mark" size="sm" light={true} />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-emerald-200/80 hover:bg-emerald-800/60 hover:text-white transition cursor-pointer"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <ChevronLeft
            className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
            size={16}
          />
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-emerald-800">
        {navItems.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-[10px] font-black uppercase tracking-wider text-[#DCEBDD]/60 mb-2">
                {group.group}
              </p>
            )}

            <nav className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = isDashboard && currentTab === item.tab;

                return (
                  <Link
                    key={item.id}
                    to={item.href}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                      isActive
                        ? "bg-[#DCEBDD] text-[#163D32] shadow-sm font-extrabold translate-x-0.5"
                        : "text-emerald-100/80 hover:bg-emerald-800/40 hover:text-white"
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={17}
                        className={isActive ? "text-[#163D32]" : "text-emerald-300/80"}
                      />
                      {!collapsed && <span>{item.label}</span>}
                    </div>

                    {!collapsed && item.badge && (
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          isActive
                            ? "bg-[#163D32] text-white"
                            : "bg-emerald-950/70 text-[#DCEBDD] border border-emerald-700/50"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}

        {/* District Quick Selector */}
        {!collapsed && (
          <div className="pt-2 border-t border-emerald-800/50">
            <button
              onClick={() => setDistrictJumpOpen(!districtJumpOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-emerald-200/90 hover:text-white hover:bg-emerald-800/30 rounded-xl transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                 <MapPin size={15} className="text-emerald-400" />
                 <span className="text-[11px] font-black uppercase tracking-wider text-[#DCEBDD]/70">
                   District Portals (38)
                 </span>
              </div>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${
                  districtJumpOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {districtJumpOpen && (
              <div className="mt-2 bg-[#122D24] p-2 rounded-xl border border-emerald-700/40 space-y-2 animate-in fade-in duration-150">
                <div className="relative">
                  <Search
                    size={12}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-400/60"
                  />
                  <input
                    type="text"
                    value={districtQuery}
                    onChange={(e) => setDistrictQuery(e.target.value)}
                    placeholder="Search district portal..."
                    className="w-full h-7 rounded-lg bg-emerald-950/80 border border-emerald-700/50 pl-7 pr-2 text-[11px] text-white placeholder-emerald-400/50 outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="max-h-40 overflow-y-auto space-y-0.5 pr-1 scrollbar-thin scrollbar-thumb-emerald-700">
                  {filteredDistricts.map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        navigate(`/superadmin/regions/${encodeURIComponent(d)}`);
                        setDistrictJumpOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-emerald-100 hover:bg-[#1F5948] hover:text-white transition flex items-center justify-between cursor-pointer"
                    >
                      <span>{d}</span>
                      <ExternalLink size={11} className="text-emerald-400/70" />
                    </button>
                  ))}
                  {filteredDistricts.length === 0 && (
                    <p className="text-[11px] text-emerald-400/60 text-center py-2">
                      No district matched
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer User Info & Sign Out */}
      <div className="p-3 border-t border-emerald-800/60 bg-[#13352B]/60 space-y-2">
        {!collapsed && (
          <div className="px-2 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-700/40 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#DCEBDD] text-[#163D32] font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
              SA
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">
                {user?.name || "Super Admin"}
              </p>
              <p className="text-[10px] text-emerald-300/80 truncate">
                {user?.email || "superadmin@gmail.com"}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-rose-300 hover:bg-rose-950/60 hover:text-rose-100 border border-transparent hover:border-rose-800/50 transition cursor-pointer"
          title="Sign Out"
        >
          <LogOut size={16} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );
};

export default SuperAdminSidebar;
