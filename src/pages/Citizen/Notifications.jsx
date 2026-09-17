import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/common/DashboardLayout";
import { Bell, CheckCircle2, Clock, ShieldCheck, ArrowRight } from "lucide-react";
import { notificationService } from "@/services/notificationService";
import Button from "@/components/common/Button";

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: "n1",
      title: "Legal Guide Assigned",
      message: "Advocate Rajesh has been assigned to review your land title inquiry.",
      time: "2 hours ago",
      read: false
    },
    {
      id: "n2",
      title: "Document Verification Passed",
      message: "Your uploaded Sale Deed was verified with 100% legal clarity score.",
      time: "1 day ago",
      read: true
    }
  ]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <DashboardLayout role="citizen">
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-[#18332B] tracking-tight">Notifications</h1>
            <p className="text-xs text-[#65736D]">Case status updates and official alerts.</p>
          </div>
          <button
            onClick={markAllRead}
            className="text-xs font-bold text-[#1F5948] hover:underline"
          >
            Mark all as read
          </button>
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
