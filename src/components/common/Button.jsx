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
  const baseClasses = "inline-flex items-center justify-center gap-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px] px-6 py-2.5 cursor-pointer";

  const variants = {
    primary: "bg-[#163D32] text-white shadow-sm hover:bg-[#1F5948] hover:shadow-md focus:ring-[#DCEBDD]",
    secondary: "bg-[#1F5948] text-white shadow-sm hover:bg-[#163D32] focus:ring-[#DCEBDD]",
    outline: "border-1.5 border-[#163D32] bg-[#FFFDF8] text-[#163D32] hover:bg-[#DCEBDD] focus:ring-[#DCEBDD]",
    ghost: "text-[#163D32] hover:bg-[#DCEBDD]/50 hover:text-[#163D32] focus:ring-[#DCEBDD] px-3",
    success: "bg-[#2E7D5B] text-white shadow-sm hover:bg-[#163D32] focus:ring-[#DCEBDD]",
    danger: "bg-[#C94B4B] text-white shadow-sm hover:bg-[#A83838] focus:ring-red-200",
    ai: "bg-[#1F5948] text-white shadow-sm hover:bg-[#163D32] hover:shadow-md focus:ring-[#DCEBDD]",
    voice: "bg-[#B96845] text-white shadow-sm hover:bg-[#9E5333] hover:shadow-md focus:ring-[#F6D8C8]",
    cream: "bg-[#F7F1E6] text-[#163D32] border border-[#E6E1D8] hover:bg-[#DCEBDD] focus:ring-[#DCEBDD]"
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
          {Icon && iconPosition === "left" && <Icon className="h-4 w-4 shrink-0" />}
          {children}
          {Icon && iconPosition === "right" && <Icon className="h-4 w-4 shrink-0" />}
        </>
      )}
    </button>
  );
};

export default Button;
