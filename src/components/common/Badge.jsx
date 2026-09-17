import React from "react";

const Badge = ({
  children,
  variant = "default",
  size = "md",
  className = "",
  ...props
}) => {
  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3.5 py-1.5 text-sm"
  };

  const variants = {
    default: "bg-[#F7F1E6] text-[#18332B] border border-[#E6E1D8]",
    forest: "bg-[#163D32] text-white border border-[#1F5948]",
    deepGreen: "bg-[#1F5948] text-white border border-[#163D32]",
    sage: "bg-[#DCEBDD] text-[#163D32] border border-[#B8D7BC]",
    peach: "bg-[#F6D8C8] text-[#8C3B1E] border border-[#F0BEA7]",
    sand: "bg-[#E8C978]/60 text-[#7A5A0A] border border-[#E8C978]",
    lavender: "bg-[#E7E1F2] text-[#4F3F73] border border-[#D5CBE5]",
    pink: "bg-[#F4DDE2] text-[#8C2C48] border border-[#E6BAC5]",
    terracotta: "bg-[#B96845] text-white border border-[#9E5333]",
    danger: "bg-red-50 text-red-700 border border-red-200",
    warning: "bg-amber-50 text-amber-800 border border-amber-200",
    success: "bg-emerald-50 text-emerald-800 border border-emerald-200"
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full ${sizes[size] || sizes.md} ${variants[variant] || variants.default} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
