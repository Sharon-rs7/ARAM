import React from "react";
import { CheckCircle2, Clock, XCircle, Info, AlertTriangle } from "lucide-react";

const Badge = ({
  status = "info",
  label = "",
  className = "",
  ...props
}) => {
  // Normalize key to handle case discrepancies
  const key = status.toLowerCase();

  const configs = {
    success: {
      bg: "bg-green-50 border-green-200 text-green-700",
      icon: CheckCircle2
    },
    resolved: {
      bg: "bg-green-50 border-green-200 text-green-700",
      icon: CheckCircle2
    },
    warning: {
      bg: "bg-amber-50 border-amber-200 text-amber-700",
      icon: Clock
    },
    pending: {
      bg: "bg-amber-50 border-amber-200 text-amber-700",
      icon: Clock
    },
    error: {
      bg: "bg-red-50 border-red-200 text-red-750",
      icon: XCircle
    },
    rejected: {
      bg: "bg-red-50 border-red-200 text-red-750",
      icon: XCircle
    },
    info: {
      bg: "bg-blue-50 border-blue-200 text-blue-700",
      icon: Info
    },
    review: {
      bg: "bg-blue-50 border-blue-200 text-blue-700",
      icon: Info
    },
    critical: {
      bg: "bg-rose-50 border-rose-200 text-rose-850",
      icon: AlertTriangle
    }
  };

  const selected = configs[key] || configs.info;
  const Icon = selected.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${selected.bg} ${className}`}
      {...props}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span>{label}</span>
    </span>
  );
};

export default Badge;
