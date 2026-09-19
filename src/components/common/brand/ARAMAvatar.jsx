import React from "react";
import { Mic, Sparkles, ShieldCheck, UserCheck } from "lucide-react";

/**
 * ARAM AI Avatar Component
 * One dedicated legal companion character with interactive states:
 * - idle: Calm subtle breathing
 * - listening: Ripple audio wave ring + Mic indicator
 * - thinking: Shimmering gold aura + Sparkles indicator
 * - speaking: Audio rhythm pulse
 * - verified: Green/gold verified legal shield
 * - human_help: Amber human guidance badge
 */
export const ARAMAvatar = ({
  size = "md",
  state = "idle",
  showStatus = true,
  className = ""
}) => {
  const sizeMap = {
    xs: { px: 28, badgeSize: 10, iconSize: 7, stroke: 1.5 },
    sm: { px: 36, badgeSize: 14, iconSize: 9, stroke: 1.5 },
    md: { px: 48, badgeSize: 18, iconSize: 11, stroke: 2 },
    lg: { px: 72, badgeSize: 22, iconSize: 13, stroke: 2 },
    xl: { px: 96, badgeSize: 28, iconSize: 16, stroke: 2.5 },
    "2xl": { px: 120, badgeSize: 34, iconSize: 20, stroke: 3 }
  };

  const s = sizeMap[size] || sizeMap.md;

  // Ring and glow classes based on state
  const stateStyles = {
    idle: {
      ring: "ring-2 ring-[#D4AF37]/30 shadow-sm",
      aura: "bg-gradient-to-b from-[#E8C978]/25 to-transparent",
      badgeBg: "bg-[#163D32] text-[#DCEBDD]",
      Icon: null
    },
    listening: {
      ring: "ring-3 ring-cyan-500 shadow-md animate-pulse",
      aura: "bg-cyan-500/20 animate-ping",
      badgeBg: "bg-cyan-600 text-white shadow-sm",
      Icon: Mic
    },
    thinking: {
      ring: "ring-3 ring-[#D4AF37] shadow-lg shadow-[#D4AF37]/25",
      aura: "bg-gradient-to-r from-amber-300/30 via-yellow-400/30 to-amber-300/30 animate-pulse",
      badgeBg: "bg-[#D4AF37] text-[#0F243A] shadow-sm animate-bounce",
      Icon: Sparkles
    },
    speaking: {
      ring: "ring-3 ring-[#1F5948] shadow-md",
      aura: "bg-[#1F5948]/20 animate-pulse",
      badgeBg: "bg-[#163D32] text-white",
      Icon: Sparkles
    },
    verified: {
      ring: "ring-2 ring-emerald-600 shadow-sm",
      aura: "bg-emerald-500/15",
      badgeBg: "bg-emerald-600 text-white shadow-sm",
      Icon: ShieldCheck
    },
    human_help: {
      ring: "ring-2 ring-amber-600 shadow-sm",
      aura: "bg-amber-500/20",
      badgeBg: "bg-amber-600 text-white shadow-sm",
      Icon: UserCheck
    }
  };

  const curState = stateStyles[state] || stateStyles.idle;
  const BadgeIcon = curState.Icon;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: s.px, height: s.px }}
      aria-label={`ARAM AI Avatar (${state})`}
    >
      {/* Background Ambient Glow for Thinking / Listening */}
      {(state === "thinking" || state === "listening") && (
        <div
          className={`absolute -inset-1 rounded-full blur-xs transition-all pointer-events-none ${curState.aura}`}
        />
      )}

      {/* Main Avatar Circular Wrapper */}
      <div
        className={`w-full h-full rounded-full overflow-hidden bg-[#FAF8F5] transition-all duration-300 ${curState.ring} flex items-center justify-center`}
      >
        {/* Vector Character: Dignified, Approachable Legal Guide */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Background Gradient */}
          <circle cx="50" cy="50" r="50" fill="url(#avatarBgGrad)" />

          {/* Golden Ambient Halo */}
          <circle cx="50" cy="42" r="34" fill="#D4AF37" fillOpacity="0.12" />

          {/* Shoulders & Dark Legal Coat */}
          <path
            d="M12 96 C12 74, 30 68, 50 68 C70 68, 88 74, 88 96 Z"
            fill="#0F243A"
          />

          {/* Crisp White Judicial Collar Bands */}
          <path
            d="M44 68 L50 82 L56 68 Z"
            fill="#FFFDF8"
            stroke="#E6E1D8"
            strokeWidth="0.8"
          />
          <rect x="47" y="74" width="2.5" height="13" rx="1" fill="#FFFDF8" stroke="#D1D5DB" strokeWidth="0.5" />
          <rect x="50.5" y="74" width="2.5" height="13" rx="1" fill="#FFFDF8" stroke="#D1D5DB" strokeWidth="0.5" />

          {/* Gold ARAM Justice Pin on Lapel */}
          <circle cx="34" cy="78" r="3.2" fill="#D4AF37" />
          <path d="M32.5 78 L35.5 78 M34 76.5 L34 79.5" stroke="#0F243A" strokeWidth="0.7" strokeLinecap="round" />

          {/* Neck */}
          <path d="M42 54 L58 54 L56 68 L44 68 Z" fill="#C58C68" />

          {/* Ears */}
          <circle cx="30" cy="46" r="4.5" fill="#C58C68" />
          <circle cx="70" cy="46" r="4.5" fill="#C58C68" />

          {/* Face (Warm South Indian complexion, friendly expression) */}
          <ellipse cx="50" cy="46" rx="19" ry="21" fill="#D69B75" />

          {/* Hair (Neat, professional with subtle grey accents at temples) */}
          <path
            d="M29 44 C28 26, 40 20, 50 20 C60 20, 72 26, 71 44 C67 33, 58 26, 50 27 C42 26, 33 33, 29 44 Z"
            fill="#23201E"
          />
          {/* Subtle distinguished grey temple highlights */}
          <path d="M29.5 40 C30.5 35, 33 32, 36 30" stroke="#9CA3AF" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          <path d="M70.5 40 C69.5 35, 67 32, 64 30" stroke="#9CA3AF" strokeWidth="1" strokeLinecap="round" opacity="0.6" />

          {/* Eyebrows */}
          <path d="M37 38 C40 37, 43 38, 45 40" stroke="#23201E" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M63 38 C60 37, 57 38, 55 40" stroke="#23201E" strokeWidth="1.6" strokeLinecap="round" />

          {/* Kind, Wise Eyes */}
          <ellipse cx="41" cy="43" rx="2.5" ry="2.2" fill="#23201E" />
          <circle cx="41.8" cy="42.2" r="0.8" fill="#FFFDF8" />

          <ellipse cx="59" cy="43" rx="2.5" ry="2.2" fill="#23201E" />
          <circle cx="59.8" cy="42.2" r="0.8" fill="#FFFDF8" />

          {/* Nose */}
          <path d="M50 43 L48.5 50 L51.5 50" stroke="#B87B57" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Trimmed Dignified Moustache */}
          <path
            d="M44 54 C47 52.5, 50 54, 50 54 C50 54, 53 52.5, 56 54 C54 56.5, 46 56.5, 44 54 Z"
            fill="#23201E"
          />

          {/* Reassuring Smile */}
          <path d="M46 57 C48 59, 52 59, 54 57" stroke="#8C4E33" strokeWidth="1.3" strokeLinecap="round" />

          {/* Soft Well-Groomed Stubble / Beard Line */}
          <path
            d="M38 49 C42 61, 58 61, 62 49"
            stroke="#23201E"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.35"
          />

          <defs>
            <linearGradient id="avatarBgGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F7F1E6" />
              <stop offset="1" stopColor="#E6E1D8" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* State Status Badge Overlay */}
      {showStatus && BadgeIcon && (
        <div
          className={`absolute -bottom-1 -right-1 rounded-full flex items-center justify-center border-2 border-[#FFFDF8] ${curState.badgeBg}`}
          style={{ width: s.badgeSize, height: s.badgeSize }}
          title={`Status: ${state}`}
        >
          <BadgeIcon size={s.iconSize} className="shrink-0" />
        </div>
      )}
    </div>
  );
};

export default ARAMAvatar;
