import React, { useState, useEffect } from "react";
import { Sparkles, Eye, HelpCircle } from "lucide-react";
import { toast } from "sonner";

const SimpleModeToggle = ({ onToggle }) => {
  const [isSimple, setIsSimple] = useState(() => {
    return localStorage.getItem("aram_simple_mode") === "true";
  });

  useEffect(() => {
    localStorage.setItem("aram_simple_mode", isSimple);
    if (onToggle) {
      onToggle(isSimple);
    }
  }, [isSimple, onToggle]);

  const toggle = () => {
    const nextVal = !isSimple;
    setIsSimple(nextVal);
    toast.success(
      nextVal
        ? "Simple Voice Mode enabled. UI buttons are enlarged, and steps are simplified."
        : "Standard dashboard view restored."
    );
  };

  return (
    <button
      onClick={toggle}
      type="button"
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition border shadow-sm ${
        isSimple
          ? "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100/70"
          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
      }`}
    >
      <Sparkles size={14} className={isSimple ? "animate-pulse" : ""} />
      {isSimple ? "SIMPLE MODE: ON" : "ACTIVATE SIMPLE ASSISTANT"}
    </button>
  );
};

export default SimpleModeToggle;
