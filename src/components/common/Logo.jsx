import React from "react";
import { Scale } from "lucide-react";
import { Link } from "react-router-dom";

const Logo = ({ size = "md", light = false, withLink = true }) => {
  const sizes = {
    sm: { box: "h-7 w-7", icon: 14, text: "text-sm", sub: "text-[9px]" },
    md: { box: "h-9 w-9", icon: 18, text: "text-lg", sub: "text-[10px]" },
    lg: { box: "h-12 w-12", icon: 24, text: "text-2xl", sub: "text-xs" }
  };

  const s = sizes[size] || sizes.md;

  const content = (
    <div className="flex items-center gap-2.5 select-none cursor-pointer">
      <div className={`${s.box} rounded-xl bg-[#163D32] border border-[#1F5948] flex items-center justify-center text-[#DCEBDD] shadow-sm`}>
        <Scale size={s.icon} />
      </div>
      <div className="flex flex-col">
        <span className={`font-black tracking-tight leading-none ${s.text} ${light ? "text-white" : "text-[#163D32]"}`}>
          ARAM
        </span>
        <span className={`font-extrabold uppercase tracking-widest leading-none mt-1 ${s.sub} ${light ? "text-[#DCEBDD]/70" : "text-[#65736D]"}`}>
          LEGAL AID
        </span>
      </div>
    </div>
  );

  if (withLink) {
    return <Link to="/">{content}</Link>;
  }
  return content;
};

export default Logo;
