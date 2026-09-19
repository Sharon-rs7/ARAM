import React, { useState } from "react";
import { Shield, Scale, User, CheckCircle2 } from "lucide-react";

/**
 * Clean, user-friendly Avatar component for ARAM Legal Aid.
 * Designed to be professional, dignified, and accessible without being cartoonish.
 */
export default function Avatar({
  src,
  name = "",
  role = "CITIZEN",
  size = "md",
  showRoleBadge = false,
  status = null,
  className = "",
  alt = ""
}) {
  const [imageError, setImageError] = useState(false);

  // Size specifications
  const sizeMap = {
    xs: { box: "w-6 h-6", text: "text-[10px]", badge: "w-2.5 h-2.5", iconSize: 8, statusDot: "w-1.5 h-1.5" },
    sm: { box: "w-8 h-8", text: "text-xs", badge: "w-3 h-3", iconSize: 9, statusDot: "w-2 h-2" },
    md: { box: "w-10 h-10", text: "text-sm", badge: "w-3.5 h-3.5", iconSize: 11, statusDot: "w-2.5 h-2.5" },
    lg: { box: "w-12 h-12", text: "text-base", badge: "w-4 h-4", iconSize: 12, statusDot: "w-3 h-3" },
    xl: { box: "w-16 h-16", text: "text-xl", badge: "w-5 h-5", iconSize: 14, statusDot: "w-3.5 h-3.5" },
    "2xl": { box: "w-20 h-20", text: "text-2xl", badge: "w-6 h-6", iconSize: 16, statusDot: "w-4 h-4" },
  };

  const s = sizeMap[size] || sizeMap.md;

  // Extract up to two uppercase initials, skipping common titles
  const getInitials = (fullName) => {
    if (!fullName) return "";
    const clean = fullName.replace(/^(adv\.|dr\.|mr\.|mrs\.|ms\.|thiru\.|selvi\.)\s+/i, "").trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(name);

  // Clean, professional, role-tailored color gradients
  const normalizedRole = (role || "").toUpperCase();
  const getRoleGradient = () => {
    switch (normalizedRole) {
      case "SUPER_ADMIN":
        return "bg-gradient-to-br from-[#0F3D32] via-[#163D32] to-[#1E1B4B] text-[#DCEBDD] border border-emerald-500/30";
      case "ADMIN":
      case "REGIONAL_ADMIN":
        return "bg-gradient-to-br from-[#123E33] via-[#184E40] to-[#1F2937] text-[#DCEBDD] border border-[#2B6E5B]/40";
      case "GUIDE":
      case "VOLUNTEER":
      case "HELPER":
        return "bg-gradient-to-br from-[#163D32] via-[#245244] to-[#78350F] text-[#FDE68A] border border-amber-600/30";
      case "CITIZEN":
      default:
        return "bg-gradient-to-br from-[#1F4E40] via-[#2A6553] to-[#163D32] text-white border border-[#2E725F]/30";
    }
  };

  // Role Badge Icon
  const renderRoleBadge = () => {
    if (!showRoleBadge) return null;
    let badgeBg = "bg-[#163D32] text-[#DCEBDD] border-white";
    let Icon = User;

    if (normalizedRole === "SUPER_ADMIN") {
      badgeBg = "bg-amber-600 text-white border-white";
      Icon = Shield;
    } else if (normalizedRole === "ADMIN" || normalizedRole === "REGIONAL_ADMIN") {
      badgeBg = "bg-[#1F5948] text-white border-white";
      Icon = Shield;
    } else if (normalizedRole === "GUIDE" || normalizedRole === "VOLUNTEER" || normalizedRole === "HELPER") {
      badgeBg = "bg-amber-700 text-amber-100 border-white";
      Icon = Scale;
    }

    return (
      <span
        className={`absolute -bottom-0.5 -right-0.5 rounded-full ${s.badge} ${badgeBg} border-1.5 flex items-center justify-center shadow-xs`}
        title={normalizedRole}
      >
        <Icon size={s.iconSize} />
      </span>
    );
  };

  // Online Status Dot
  const renderStatus = () => {
    if (!status) return null;
    const statusColors = {
      online: "bg-emerald-500 ring-white",
      away: "bg-amber-500 ring-white",
      offline: "bg-slate-400 ring-white",
    };
    const color = statusColors[status] || statusColors.online;
    return (
      <span
        className={`absolute bottom-0 right-0 rounded-full ${s.statusDot} ${color} ring-2`}
        title={`Status: ${status}`}
      />
    );
  };

  const hasValidImage = src && !imageError;

  return (
    <div className={`relative inline-flex shrink-0 select-none ${className}`}>
      <div
        className={`${s.box} rounded-full overflow-hidden flex items-center justify-center font-bold tracking-tight shadow-2xs transition-transform duration-150 ${
          hasValidImage ? "bg-slate-100 dark:bg-slate-800" : getRoleGradient()
        }`}
      >
        {hasValidImage ? (
          <img
            src={src}
            alt={alt || name || "User Avatar"}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover rounded-full"
            loading="lazy"
          />
        ) : initials ? (
          <span className={`${s.text} font-extrabold uppercase select-none`}>
            {initials}
          </span>
        ) : (
          // Elegant SVG Silhouette Fallback
          <svg
            className="w-3/5 h-3/5 text-current opacity-85"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        )}
      </div>

      {renderRoleBadge()}
      {renderStatus()}
    </div>
  );
}
