import React, { useState } from "react";
import { Mic, FileText, FolderGit2, UserCheck, ChevronRight, X, Clock, AlertCircle } from "lucide-react";

/**
 * 4 Clean Quick Action Pillars for ARAM Chatbot
 * 1. 🎙️ Tell ARAM - Explain your problem
 * 2. 📄 Check a Document - Upload & understand
 * 3. 📂 My Cases - Continue a case
 * 4. 👨‍⚖️ Talk to a Guide - Get human assistance
 */
export const ARAMQuickActions = ({
  onTellAram,
  onCheckDocument,
  onSelectCase,
  onTalkToGuide,
  userCases = [],
  loadingCases = false,
  className = ""
}) => {
  const [showCasePicker, setShowCasePicker] = useState(false);

  const actions = [
    {
      id: "tell_aram",
      icon: Mic,
      title: "Tell ARAM",
      desc: "Explain your problem in voice or text",
      iconBg: "bg-[#DCEBDD] text-[#163D32] border-[#B8D8BC]",
      borderHover: "hover:border-[#163D32] hover:bg-[#F7F1E6]/40",
      onClick: () => onTellAram && onTellAram()
    },
    {
      id: "check_doc",
      icon: FileText,
      title: "Check a Document",
      desc: "Upload & understand legal agreements & deeds",
      iconBg: "bg-[#E8C978]/30 text-[#7A5A0A] border-[#D4AF37]/40",
      borderHover: "hover:border-[#D4AF37] hover:bg-[#FFFDF8]",
      onClick: () => onCheckDocument && onCheckDocument()
    },
    {
      id: "my_cases",
      icon: FolderGit2,
      title: "My Cases",
      desc: userCases.length > 0 
        ? `${userCases.length} active grievance${userCases.length > 1 ? "s" : ""} registered`
        : "Continue or review an active grievance",
      iconBg: "bg-[#DDE8F6] text-[#1E3A8A] border-[#BFDBFE]",
      borderHover: "hover:border-[#1E3A8A] hover:bg-[#F0F5FF]/50",
      onClick: () => {
        if (userCases.length > 0) {
          setShowCasePicker(true);
        } else if (onSelectCase) {
          onSelectCase(null);
        }
      }
    },
    {
      id: "talk_guide",
      icon: UserCheck,
      title: "Talk to a Guide",
      desc: "Get assistance from a verified district volunteer",
      iconBg: "bg-[#F6D8C8]/60 text-[#8C3B1E] border-[#EAA88C]",
      borderHover: "hover:border-[#8C3B1E] hover:bg-[#FFF9F6]",
      onClick: () => onTalkToGuide && onTalkToGuide()
    }
  ];

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      {/* 2x2 Clean Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={act.onClick}
              className={`p-4 rounded-2xl bg-[#FFFDF8] border border-[#E6E1D8] shadow-xs text-left transition-all duration-200 cursor-pointer group flex items-start gap-3.5 ${act.borderHover}`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-105 ${act.iconBg}`}
              >
                <Icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs sm:text-sm text-[#163D32] group-hover:text-[#1F5948]">
                    {act.title}
                  </h3>
                  <ChevronRight
                    size={14}
                    className="text-[#9CA3AF] group-hover:text-[#163D32] group-hover:translate-x-0.5 transition-all"
                  />
                </div>
                <p className="text-[11px] text-[#65736D] mt-0.5 leading-snug">
                  {act.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Case Picker Modal / Drawer if citizen clicks 'My Cases' and has complaints */}
      {showCasePicker && (
        <div className="mt-4 p-4 rounded-2xl bg-[#FFFDF8] border border-[#163D32]/30 shadow-md animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D8]">
            <div className="flex items-center gap-2">
              <FolderGit2 size={16} className="text-[#163D32]" />
              <span className="font-bold text-xs text-[#163D32]">Select an Active Case to Continue:</span>
            </div>
            <button
              onClick={() => setShowCasePicker(false)}
              className="p-1 rounded-lg text-[#65736D] hover:bg-slate-100 transition cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          <div className="mt-2.5 space-y-2 max-h-48 overflow-y-auto pr-1">
            {userCases.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setShowCasePicker(false);
                  onSelectCase && onSelectCase(c);
                }}
                className="p-3 rounded-xl border border-[#E6E1D8] hover:border-[#163D32] hover:bg-[#DCEBDD]/30 transition cursor-pointer flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-[#163D32]">
                      #{c.complaintCustomId || c.id}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#DCEBDD] text-[#163D32]">
                      {c.status || "PENDING"}
                    </span>
                  </div>
                  <h4 className="font-bold text-[#163D32] truncate mt-0.5">{c.title || "Grievance"}</h4>
                  <p className="text-[10px] text-[#65736D] truncate">{c.description}</p>
                </div>
                <ChevronRight size={14} className="text-[#9CA3AF] shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ARAMQuickActions;
