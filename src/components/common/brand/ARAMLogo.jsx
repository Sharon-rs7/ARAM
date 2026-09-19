import React from "react";
import { Link } from "react-router-dom";

/**
 * ARAM Official Brand Emblem & Logo System.
 * Colors: Deep Navy (#0F243A, #163D32), Warm Gold (#D4AF37, #E5B869), Off-White (#FFFDF8)
 */
export const ARAMEmblem = ({ size = 40, className = "", light = false }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-200 hover:scale-105 ${className}`}
      aria-label="ARAM Emblem"
    >
      {/* Outer Squircle Container */}
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="13"
        fill={light ? "#0F243A" : "#163D32"}
        stroke={light ? "#23415E" : "#2D6A56"}
        strokeWidth="1.5"
      />

      {/* Subtle Inner Gradient Fill */}
      <rect
        x="4"
        y="4"
        width="40"
        height="40"
        rx="11"
        fill="url(#aramEmblemGrad)"
        fillOpacity="0.45"
      />

      {/* Central Pillar of Justice */}
      <line x1="24" y1="12" x2="24" y2="35" stroke="#FFFDF8" strokeWidth="2.5" strokeLinecap="round" />
      
      {/* Top Apex Finial / Star of Truth */}
      <circle cx="24" cy="11.5" r="2.2" fill="#D4AF37" />

      {/* Horizontal Beam of Equity */}
      <line x1="12" y1="17.5" x2="36" y2="17.5" stroke="#FFFDF8" strokeWidth="2.2" strokeLinecap="round" />

      {/* Central Fulcrum */}
      <circle cx="24" cy="17.5" r="2" fill="#D4AF37" stroke="#0F243A" strokeWidth="1" />

      {/* Left Balance Pan Cords */}
      <line x1="14" y1="18" x2="10" y2="25.5" stroke="#FFFDF8" strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />
      <line x1="14" y1="18" x2="18" y2="25.5" stroke="#FFFDF8" strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />

      {/* Left Pan */}
      <path
        d="M9.5 25.5 C9.5 29.5, 18.5 29.5, 18.5 25.5 Z"
        fill="#D4AF37"
      />

      {/* Right Balance Pan Cords */}
      <line x1="34" y1="18" x2="30" y2="25.5" stroke="#FFFDF8" strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />
      <line x1="34" y1="18" x2="38" y2="25.5" stroke="#FFFDF8" strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />

      {/* Right Pan */}
      <path
        d="M29.5 25.5 C29.5 29.5, 38.5 29.5, 38.5 25.5 Z"
        fill="#D4AF37"
      />

      {/* Solid Foundation Pedestal */}
      <path
        d="M16 35 L32 35 L34 38 L14 38 Z"
        fill="#D4AF37"
      />

      <defs>
        <linearGradient id="aramEmblemGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D4AF37" stopOpacity="0.25" />
          <stop offset="1" stopColor="#0F243A" stopOpacity="0.8" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const ARAMLogo = ({
  size = "md",
  withLink = true,
  light = false,
  showTamil = true,
  subtitle = "LEGAL AID & CITIZEN JUSTICE",
  className = ""
}) => {
  const sizeMap = {
    sm: { mark: 30, title: "text-base font-extrabold", badge: "text-[10px] px-1.5", sub: "text-[8px]" },
    md: { mark: 38, title: "text-xl font-extrabold", badge: "text-xs px-2", sub: "text-[9px]" },
    lg: { mark: 48, title: "text-2xl font-black", badge: "text-xs px-2.5", sub: "text-[10px]" }
  };

  const s = sizeMap[size] || sizeMap.md;

  const content = (
    <div className={`inline-flex items-center gap-3 select-none group ${className}`}>
      <ARAMEmblem size={s.mark} light={light} />
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <span
            className={`tracking-tight leading-none transition-colors font-serif ${s.title} ${
              light ? "text-[#FFFDF8]" : "text-[#0F243A]"
            }`}
          >
            ARAM
          </span>

          {showTamil && (
            <span
              className={`rounded-md font-bold py-0.5 leading-none transition ${s.badge} ${
                light
                  ? "bg-white/15 text-amber-200 border border-white/25"
                  : "bg-[#E8C978]/30 text-[#0F243A] border border-[#D4AF37]/50"
              }`}
            >
              அறம்
            </span>
          )}
        </div>

        <span
          className={`font-bold tracking-widest uppercase mt-1 leading-none ${s.sub} ${
            light ? "text-amber-200/80" : "text-[#65736D]"
          }`}
        >
          {subtitle}
        </span>
      </div>
    </div>
  );

  if (withLink) {
    return (
      <Link to="/" className="inline-block" aria-label="ARAM Home">
        {content}
      </Link>
    );
  }

  return content;
};

export default ARAMLogo;
