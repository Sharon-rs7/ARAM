import React from "react";

const Card = ({
  children,
  className = "",
  surface = "ivory",
  hoverEffect = false,
  padding = "p-6",
  ...props
}) => {
  const surfaces = {
    ivory: "bg-[#FFFDF8] border-[#E6E1D8] text-[#18332B]",
    cream: "bg-[#F7F1E6] border-[#E6E1D8] text-[#18332B]",
    sage: "bg-[#DCEBDD]/40 border-[#DCEBDD] text-[#163D32]",
    peach: "bg-[#F6D8C8]/40 border-[#F6D8C8] text-[#18332B]",
    sand: "bg-[#E8C978]/30 border-[#E8C978] text-[#18332B]",
    lavender: "bg-[#E7E1F2]/40 border-[#E7E1F2] text-[#18332B]",
    pink: "bg-[#F4DDE2]/40 border-[#F4DDE2] text-[#18332B]",
    forest: "bg-[#163D32] border-[#1F5948] text-white"
  };

  const selectedSurface = surfaces[surface] || surfaces.ivory;
  const hoverClass = hoverEffect ? "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200" : "";

  return (
    <div
      className={`rounded-2xl border ${selectedSurface} ${padding} shadow-sm ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
