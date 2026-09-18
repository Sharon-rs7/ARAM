import React from "react";
import { Link } from "react-router-dom";

/**
 * ARAM Legal Aid Official Emblem & Logo Mark.
 * Clean, balanced, civic, and dignified. Not overly ornate; simple and user-friendly.
 */
export const AramMark = ({ size = 36, light = false, className = "" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-200 hover:scale-105 ${className}`}
    >
      {/* Outer rounded squircle container */}
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="12"
        fill={light ? "#163D32" : "#163D32"}
        stroke={light ? "#2D6A56" : "#1F5948"}
        strokeWidth="1.5"
      />

      {/* Subtle background glow/depth */}
      <rect
        x="4"
        y="4"
        width="40"
        height="40"
        rx="10"
        fill="url(#aramGrad)"
        fillOpacity="0.4"
      />

      {/* Central Pillar of Justice & Dharma */}
      <line x1="24" y1="12" x2="24" y2="34" stroke="#DCEBDD" strokeWidth="2.4" strokeLinecap="round" />

      {/* Top Finial / Apex of Truth */}
      <circle cx="24" cy="11.5" r="2" fill="#E5B869" />

      {/* Cross Beam of Equity */}
      <line x1="13" y1="17" x2="35" y2="17" stroke="#DCEBDD" strokeWidth="2.4" strokeLinecap="round" />
      
      {/* Central Fulcrum Pivot */}
      <circle cx="24" cy="17" r="2.2" fill="#E5B869" stroke="#163D32" strokeWidth="1" />

      {/* Left Pan Suspension Cords */}
      <line x1="14" y1="17.5" x2="9.5" y2="25" stroke="#DCEBDD" strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />
      <line x1="14" y1="17.5" x2="18.5" y2="25" stroke="#DCEBDD" strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />

      {/* Left Balance Pan */}
      <path
        d="M9 25 C9 29, 19 29, 19 25 Z"
        fill="#E5B869"
        fillOpacity="0.3"
        stroke="#DCEBDD"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Right Pan Suspension Cords */}
      <line x1="34" y1="17.5" x2="29.5" y2="25" stroke="#DCEBDD" strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />
      <line x1="34" y1="17.5" x2="38.5" y2="25" stroke="#DCEBDD" strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />

      {/* Right Balance Pan */}
      <path
        d="M29 25 C29 29, 39 29, 39 25 Z"
        fill="#E5B869"
        fillOpacity="0.3"
        stroke="#DCEBDD"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Solid Foundation / Open Book Base */}
      <path
        d="M17 35 Q24 33 31 35"
        stroke="#E5B869"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <line x1="18" y1="37" x2="30" y2="37" stroke="#DCEBDD" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />

      <defs>
        <linearGradient id="aramGrad" x1="2" y1="2" x2="46" y2="46" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1F5948" />
          <stop offset="1" stopColor="#0B201A" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const Logo = ({
  size = "md",
  light = false,
  withLink = true,
  variant = "full",
  tamil = true,
  className = ""
}) => {
  const sizes = {
    xs: { mark: 26, title: "text-xs", sub: "text-[8px]", badge: "text-[8px] px-1", gap: "gap-2" },
    sm: { mark: 32, title: "text-sm font-black", sub: "text-[9px]", badge: "text-[9px] px-1.5", gap: "gap-2.5" },
    md: { mark: 38, title: "text-lg font-black", sub: "text-[10px]", badge: "text-[10px] px-1.5", gap: "gap-3" },
    lg: { mark: 46, title: "text-2xl font-black", sub: "text-xs", badge: "text-xs px-2", gap: "gap-3.5" },
    xl: { mark: 56, title: "text-3xl font-black", sub: "text-sm", badge: "text-xs px-2.5", gap: "gap-4" },
  };

  const s = sizes[size] || sizes.md;

  if (variant === "mark") {
    const markContent = <AramMark size={s.mark} light={light} className={className} />;
    return withLink ? <Link to="/" aria-label="ARAM Home">{markContent}</Link> : markContent;
  }

  const content = (
    <div className={`inline-flex items-center ${s.gap} select-none group cursor-pointer ${className}`}>
      <AramMark size={s.mark} light={light} />

      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5">
          <span
            className={`tracking-tight leading-none transition-colors ${s.title} ${
              light ? "text-white group-hover:text-white/90" : "text-[#163D32] group-hover:text-[#1F5948]"
            }`}
          >
            ARAM
          </span>

          {tamil && (
            <span
              className={`rounded font-bold py-0.5 leading-none transition ${s.badge} ${
                light
                  ? "bg-white/15 text-emerald-100 border border-white/20"
                  : "bg-[#DCEBDD] text-[#163D32] border border-[#B8D8BC]"
              }`}
            >
              அறம்
            </span>
          )}
        </div>

        <span
          className={`font-extrabold uppercase tracking-widest leading-none mt-1 ${s.sub} ${
            light ? "text-[#DCEBDD]/80" : "text-[#5A6E65]"
          }`}
        >
          LEGAL AID & JUSTICE
        </span>
      </div>
    </div>
  );

  if (withLink) {
    return (
      <Link to="/" className="inline-block" aria-label="ARAM Legal Aid Home">
        {content}
      </Link>
    );
  }

  return content;
};

export default Logo;
