import React, { useState } from "react";
import { X, PhoneCall, Calendar, Clock, MessageSquare, ShieldCheck, CheckCircle2 } from "lucide-react";
import { complaintService } from "@/services/complaintService";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";

const ScheduleAppointmentModal = ({ isOpen, onClose, complaintId, guideName, onAppointmentCreated }) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState("PHONE");
  const [preferredTime, setPreferredTime] = useState("MORNING");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!complaintId) {
      toast.error("Invalid Complaint ID");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        complaintId,
        mode,
        preferredTime,
        note: note.trim() || "Guidance consultation requested by citizen."
      };
      const res = await complaintService.requestCall(payload);
      toast.success(t("civicFeatures.appointmentActive", "Guidance call requested successfully!"));
      if (onAppointmentCreated) {
        onAppointmentCreated(res);
      }
      onClose();
    } catch (err) {
      console.error("Failed to schedule appointment:", err);
      toast.error(err?.response?.data?.message || "Failed to schedule consultation request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#FAF8F2] rounded-3xl border border-[#E6E1D8] shadow-2xl max-w-md w-full overflow-hidden my-auto flex flex-col">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#163D32] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <PhoneCall size={20} />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">
                {t("civicFeatures.appointmentTitle", "Request 10-Min Guidance Call")}
              </h2>
              <p className="text-xs text-white/70">
                {guideName ? `With ${guideName}` : t("civicFeatures.appointmentSub", "Schedule a telephonic or voice consultation with your assigned Legal Guide.")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Mode Selection */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700">
              {t("civicFeatures.selectMode", "Consultation Mode")}
            </label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: "PHONE", label: t("civicFeatures.modePhone", "Phone Call (Mobile)"), desc: "Direct call on registered phone" },
                { id: "IN_APP", label: t("civicFeatures.modeApp", "In-App Audio Consultation"), desc: "Secure browser voice call" },
                { id: "WHATSAPP", label: t("civicFeatures.modeWa", "WhatsApp Voice/Text Guidance"), desc: "Official WhatsApp guidance" }
              ].map((m) => (
                <div
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    mode === m.id
                      ? "bg-[#DCEBDD]/50 border-[#163D32] text-[#163D32] font-bold"
                      : "bg-white border-[#E6E1D8] text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <div className="text-xs">
                    <p className="font-bold">{m.label}</p>
                    <p className="text-[10px] text-slate-500 font-normal">{m.desc}</p>
                  </div>
                  {mode === m.id && <CheckCircle2 size={16} className="text-[#163D32]" />}
                </div>
              ))}
            </div>
          </div>

          {/* Time Slot Selection */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700">
              {t("civicFeatures.selectSlot", "Preferred Time Window")}
            </label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: "MORNING", label: t("civicFeatures.slotMorning", "Morning (10:00 AM – 01:00 PM)") },
                { id: "AFTERNOON", label: t("civicFeatures.slotAfternoon", "Afternoon (02:00 PM – 05:00 PM)") },
                { id: "EVENING", label: t("civicFeatures.slotEvening", "Evening (05:00 PM – 08:00 PM)") }
              ].map((slot) => (
                <div
                  key={slot.id}
                  onClick={() => setPreferredTime(slot.id)}
                  className={`p-2.5 px-3 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition ${
                    preferredTime === slot.id
                      ? "bg-[#DCEBDD]/50 border-[#163D32] text-[#163D32] font-bold"
                      : "bg-white border-[#E6E1D8] text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <span>{slot.label}</span>
                  {preferredTime === slot.id && <CheckCircle2 size={15} className="text-[#163D32]" />}
                </div>
              ))}
            </div>
          </div>

          {/* Note Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700">
              {t("civicFeatures.appointmentNote", "Specific Question / Discussion Topic")}
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Need clarification regarding required Patta documents or police CSR..."
              className="w-full p-3 text-xs rounded-xl border border-[#E6E1D8] bg-white focus:outline-none focus:border-[#163D32] focus:ring-1 focus:ring-[#163D32]"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-2xl bg-[#163D32] hover:bg-[#1F5948] disabled:opacity-50 text-white text-xs sm:text-sm font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <PhoneCall size={16} />
            <span>{submitting ? "Submitting..." : t("civicFeatures.btnSubmitAppointment", "Confirm Call Request")}</span>
          </button>
        </form>

      </div>
    </div>
  );
};

export default ScheduleAppointmentModal;
