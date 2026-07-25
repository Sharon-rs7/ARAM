import React from "react";
import { Loader2 } from "lucide-react";

const Button = ({
  children,
  variant = "primary",
  type = "button",
  onClick,
  disabled = false,
  loading = false,
  icon: Icon = null,
  iconPosition = "left",
  className = "",
  ariaLabel,
  ...props
}) => {
  // Base classes for accessible height, centering, border, transitions, active state
  const baseClasses = "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px] px-5 py-2.5";

  // Specific classes matching design tokens
  const variants = {
    primary: "bg-[#173B66] text-white shadow-sm hover:bg-[#0F2747] hover:shadow-md focus:ring-blue-200",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-200",
    outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 focus:ring-slate-200",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-200 px-3",
    success: "bg-green-700 text-white shadow-sm hover:bg-green-800 focus:ring-green-200",
    danger: "bg-red-600 text-white shadow-sm hover:bg-red-700 focus:ring-red-250",
    ai: "bg-teal-600 text-white shadow-sm hover:bg-teal-700 hover:shadow-md focus:ring-teal-200"
  };

  const selectedVariant = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${selectedVariant} ${className}`}
      aria-label={ariaLabel}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === "left" && <Icon className="h-4.5 w-4.5 shrink-0" />}
          {children}
          {Icon && iconPosition === "right" && <Icon className="h-4.5 w-4.5 shrink-0" />}
        </>
      )}
    </button>
  );
};

export default Button;
