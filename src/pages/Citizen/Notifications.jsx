import React from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/common/DashboardLayout";
import { Bell, CheckCircle2, Clock, ShieldCheck, ArrowRight, CheckCheck, Trash2 } from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";
import Button from "@/components/common/Button";

const Notifications = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll, isConnected } = useNotifications();

  return (
    <DashboardLayout role="citizen">
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-[#18332B] tracking-tight">Notifications Center</h1>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                isConnected ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-emerald-500 animate-ping" : "bg-slate-400"}`} />
                {isConnected ? "Real-time Live" : "Polling"}
              </span>
            </div>
            <p className="text-xs text-[#65736D]">Case status updates, guide assignments, and official alerts.</p>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-3 py-1.5 bg-[#DCEBDD] text-[#163D32] hover:bg-emerald-100 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
              >
                <CheckCheck size={14} />
                <span>Mark all as read</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 border border-rose-200"
              >
                <Trash2 size={13} />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        <div className="rounded-3xl bg-[#FFFDF8] border border-[#E6E1D8] shadow-sm divide-y divide-[#E6E1D8] overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 flex items-start gap-4 transition ${n.read ? "bg-white" : "bg-[#F7F1E6]/40"}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                n.read ? "bg-[#F7F1E6] text-[#65736D]" : "bg-[#DCEBDD] text-[#163D32]"
              }`}>
                <Bell size={16} />
              </div>
              <div className="flex-1 space-y-0.5">
                <h4 className="text-xs font-bold text-[#18332B]">{n.title}</h4>
                <p className="text-xs text-[#65736D] leading-relaxed">{n.message}</p>
                <span className="block text-[10px] text-[#8B9690] mt-1">{n.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
