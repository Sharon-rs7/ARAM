import React from "react";
import { ShieldCheck, CheckCircle2, UserCheck, Sparkles, Scale } from "lucide-react";

/**
 * Reusable ARAM Legal Verification Badge & Status Pill
 */
export const ARAMBadge = ({
  type = "verified",
  label,
  size = "md",
  className = ""
}) => {
  const configs = {
    verified: {
      defaultLabel: "Verified Legal Grounding",
      icon: ShieldCheck,
      classes: "bg-[#DCEBDD] text-[#163D32] border border-[#B8D8BC]"
    },
    statutory: {
      defaultLabel: "Indian Statutory Authority",
      icon: Scale,
      classes: "bg-[#E8C978]/30 text-[#7A5A0A] border border-[#D4AF37]/50"
    },
    human_guide: {
      defaultLabel: "District Legal Guide Assigned",
      icon: UserCheck,
      classes: "bg-[#F6D8C8]/60 text-[#8C3B1E] border border-[#EAA88C]"
    },
    online: {
      defaultLabel: "Online & Ready",
      icon: CheckCircle2,
      classes: "bg-emerald-50 text-emerald-800 border border-emerald-200"
    },
    ai_companion: {
      defaultLabel: "Legal Companion",
      icon: Sparkles,
      classes: "bg-slate-100 text-[#0F243A] border border-slate-200"
    }
  };

  const cfg = configs[type] || configs.verified;
  const Icon = cfg.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-2"
  };

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full select-none shrink-0 ${sizeClasses[size]} ${cfg.classes} ${className}`}
    >
      <Icon size={size === "sm" ? 11 : size === "lg" ? 16 : 13} className="shrink-0" />
      <span>{label || cfg.defaultLabel}</span>
    </span>
  );
};

export default ARAMBadge;
