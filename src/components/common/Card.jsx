import React from "react";

const Card = ({
  children,
  className = "",
  onClick,
  hoverable = false,
  ...props
}) => {
  const isClickable = !!onClick || hoverable;
  
  // Base classes with 16px borders, white background, shadow, and transition overrides
  const baseClasses = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";
  const hoverClasses = isClickable 
    ? "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
    : "";

  return (
    <div
      onClick={onClick}
      className={`${baseClasses} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
