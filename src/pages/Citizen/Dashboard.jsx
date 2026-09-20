import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/common/DashboardLayout";
import { 
  MessageSquare, PlusCircle, Clock, ShieldCheck, 
  Mic, ArrowRight, FileText, CheckCircle2, ChevronRight,
  HelpCircle, AlertCircle, Sparkles, Building2, User, Scale
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { complaintService } from "@/services/complaintService";
import { speechService } from "@/services/speechService";
import { toast } from "sonner";
import Button from "@/components/common/Button";
import Section12EligibilityModal from "@/components/citizen/Section12EligibilityModal";

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [showSec12Modal, setShowSec12Modal] = useState(false);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const data = await complaintService.getMyComplaints();
        setComplaints(data || []);
      } catch (err) {
        console.error("Failed to load user grievances:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const handleStartVoiceTriage = async () => {
    if (isRecording) {
      if (mediaRecorder) mediaRecorder.stop();
      setIsRecording(false);
      return;
    }

    if (!navigator?.mediaDevices?.getUserMedia) {
      if (!window.isSecureContext) {
        toast.error("Microphone requires HTTPS on mobile! Please use the secure HTTPS link.", {
          duration: 8000
        });
      } else {
        toast.error("Audio recording is not supported on this browser.");
      }
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        toast.info("Transcribing your grievance voice input...");
        try {
          const res = await speechService.transcribeAudio(audioBlob, "auto");
          const transcribedText = (res?.transcript || res?.text || "").trim();
          if (transcribedText) {
            if (res?.detectedLanguage) {
              toast.success(`Recognized in ${res.detectedLanguage}!`);
            }
            navigate(`/citizen/chatbot?q=${encodeURIComponent(transcribedText)}`);
          } else {
            toast.info("No speech detected. Please speak clearly.");
          }
        } catch (err) {
          toast.error("Voice transcription failed. Please type your query.");
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      toast.info("Listening... Speak your grievance clearly in Tamil, English, or Hindi.");
    } catch (err) {
      toast.error("Microphone access denied or unavailable.");
    }
  };

  const categories = [
    { title: t("citizenDashboard.domainWomenTitle", "Women & Family Law"), desc: t("citizenDashboard.domainWomenDesc", "Maintenance, 498A, DV Act, Custody"), color: "bg-[#F6D8C8]/50 border-[#F6D8C8]", query: "Women and family legal protection rights" },
    { title: t("citizenDashboard.domainLandTitle", "Land & Property"), desc: t("citizenDashboard.domainLandDesc", "Patta, Encroachment, Boundary disputes"), color: "bg-[#E8C978]/40 border-[#E8C978]", query: "Land title deed patta transfer dispute" },
    { title: t("citizenDashboard.domainConsumerTitle", "Consumer & RTI"), desc: t("citizenDashboard.domainConsumerDesc", "Product defect, RTI filing, Fair trade"), color: "bg-[#E7E1F2]/50 border-[#E7E1F2]", query: "RTI filing procedure and consumer court claim" },
    { title: t("citizenDashboard.domainLabourTitle", "Labour & Wage Rights"), desc: t("citizenDashboard.domainLabourDesc", "Unpaid dues, Gratuity, PF settlement"), color: "bg-[#DCEBDD] border-[#B8D7BC]", query: "Labour wage non-payment and gratuity settlement" },
    { title: t("citizenDashboard.domainCyberTitle", "Emergency & Cyber Aid"), desc: t("citizenDashboard.domainCyberDesc", "Online fraud, 1930 Helpline, Harassment"), color: "bg-[#F4DDE2]/50 border-[#F4DDE2]", query: "Cyber crime financial fraud and emergency helpline" },
  ];

  return (
    <DashboardLayout role="citizen">
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-[#163D32] p-8 sm:p-10 text-white shadow-md">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#DCEBDD]/20 px-3 py-1 text-xs font-bold text-[#DCEBDD]">
              <Sparkles size={14} /> {t("citizenDashboard.portalBadge", "Tamil Nadu Public Legal Aid & Grievance Portal")}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
              {t("citizenDashboard.heroGreeting", "Hello, {name}. How can ARAM assist you today?").replace("{name}", user?.name || "Citizen")}
            </h1>
            <p className="text-xs sm:text-sm text-[#DCEBDD]/90 leading-relaxed">
              {t("citizenDashboard.heroDescription", "Describe any grievance, legal issue, or dispute in Tamil, English, or Hindi to receive immediate verified guidance, document requirements, and assigned legal guide assistance.")}
            </p>

            {/* Hero Actions */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                variant="cream"
                onClick={() => navigate("/citizen/chatbot")}
                icon={MessageSquare}
              >
                {t("citizenDashboard.askLegalAssistant", "Ask ARAM Legal Assistant")}
              </Button>
              <button
                onClick={handleStartVoiceTriage}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition shadow-sm cursor-pointer ${
                  isRecording 
                    ? "bg-red-600 text-white animate-pulse" 
                    : "bg-[#B96845] hover:bg-[#9E5333] text-white"
                }`}
              >
                <Mic size={16} />
                <span>{isRecording ? t("citizenDashboard.stopTranscribe", "Stop & Transcribe") : t("citizenDashboard.speakGrievance", "Speak Grievance (Voice)")}</span>
              </button>
            </div>
          </div>

          <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-[#1F5948]/60 blur-2xl pointer-events-none" />
        </div>

        {/* 4 Quick Action Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/citizen/submit-complaint"
            className="group p-5 rounded-2xl bg-[#FFFDF8] border border-[#E6E1D8] shadow-sm hover:border-[#163D32] transition space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-[#DCEBDD] text-[#163D32] flex items-center justify-center font-bold group-hover:scale-105 transition">
              <PlusCircle size={20} />
            </div>
            <h3 className="text-sm font-bold text-[#18332B] group-hover:text-[#163D32]">{t("citizenDashboard.cardSubmitTitle", "Submit Grievance")}</h3>
            <p className="text-xs text-[#65736D]">{t("citizenDashboard.cardSubmitDesc", "File a structured complaint with AI document analysis.")}</p>
          </Link>

          <Link
            to="/citizen/documents"
            className="group p-5 rounded-2xl bg-[#FFFDF8] border border-[#E6E1D8] shadow-sm hover:border-[#163D32] transition space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-[#F6D8C8]/60 text-[#8C3B1E] flex items-center justify-center font-bold group-hover:scale-105 transition">
              <FileText size={20} />
            </div>
            <h3 className="text-sm font-bold text-[#18332B] group-hover:text-[#163D32]">{t("citizenDashboard.cardUploadTitle", "Upload Evidence")}</h3>
            <p className="text-xs text-[#65736D]">{t("citizenDashboard.cardUploadDesc", "Verify deeds, agreements & FIRs via OCR readiness.")}</p>
          </Link>

          <Link
            to="/track-complaint"
            className="group p-5 rounded-2xl bg-[#FFFDF8] border border-[#E6E1D8] shadow-sm hover:border-[#163D32] transition space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-[#E8C978]/40 text-[#7A5A0A] flex items-center justify-center font-bold group-hover:scale-105 transition">
              <Clock size={20} />
            </div>
            <h3 className="text-sm font-bold text-[#18332B] group-hover:text-[#163D32]">{t("citizenDashboard.cardTrackTitle", "Track Status")}</h3>
            <p className="text-xs text-[#65736D]">{t("citizenDashboard.cardTrackDesc", "Milestone progress timeline & guide action plans.")}</p>
          </Link>

          <Link
            to="/citizen/help"
            className="group p-5 rounded-2xl bg-[#FFFDF8] border border-[#E6E1D8] shadow-sm hover:border-[#163D32] transition space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-[#E7E1F2]/60 text-[#4F3F73] flex items-center justify-center font-bold group-hover:scale-105 transition">
              <HelpCircle size={20} />
            </div>
            <h3 className="text-sm font-bold text-[#18332B] group-hover:text-[#163D32]">{t("citizenDashboard.cardRightsTitle", "Legal Rights Guide")}</h3>
            <p className="text-xs text-[#65736D]">{t("citizenDashboard.cardRightsDesc", "DLSA contacts, government schemes & helplines.")}</p>
          </Link>
        </div>

        {/* Civic Legal Aid Eligibility Strip */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-[#FAF8F2] to-emerald-50 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#163D32] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Scale size={20} className="text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-black text-[#163D32]">
                  {t("civicFeatures.sec12Title", "NALSA Section 12 Legal Aid Eligibility")}
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                  Govt. Funded
                </span>
              </div>
              <p className="text-[11px] text-[#65736D] mt-0.5">
                Check if you qualify for 100% free legal defense counsel & DLSA court advocate.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowSec12Modal(true)}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-[#163D32] hover:bg-[#1F5948] text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <span>{t("civicFeatures.btnCheckSec12", "Check Free Legal Aid Eligibility")}</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Legal Aid Topic Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-[#18332B] tracking-tight">
              {t("citizenDashboard.exploreDomainTitle", "Explore Legal Rights by Domain")}
            </h2>
            <Link to="/citizen/chatbot" className="text-xs font-bold text-[#1F5948] hover:underline flex items-center gap-1">
              {t("citizenDashboard.askAnyTopic", "Ask any topic >")}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {categories.map((cat, idx) => (
              <div
                key={idx}
                onClick={() => navigate(`/citizen/chatbot?q=${encodeURIComponent(cat.query)}`)}
                className={`p-4 rounded-2xl border ${cat.color} cursor-pointer hover:shadow-md transition space-y-1.5`}
              >
                <h4 className="text-xs font-bold text-[#18332B]">{cat.title}</h4>
                <p className="text-[11px] text-[#65736D] leading-snug">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Grievances List */}
        <div className="rounded-3xl bg-[#FFFDF8] border border-[#E6E1D8] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E6E1D8] pb-4">
            <div>
              <h3 className="text-base font-extrabold text-[#18332B]">{t("citizenDashboard.activeGrievancesTitle", "My Active Grievances")}</h3>
              <p className="text-xs text-[#65736D] mt-0.5">{t("citizenDashboard.activeGrievancesDesc", "Track your submitted complaints and legal guide notes.")}</p>
            </div>
            <Link to="/citizen/history" className="text-xs font-bold text-[#1F5948] hover:underline">
              {t("citizenDashboard.viewAllGrievances", "View All Grievances →")}
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-[#8B9690]">{t("citizenDashboard.loadingGrievances", "Loading your grievances...")}</div>
          ) : complaints.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <ShieldCheck className="mx-auto text-[#163D32]" size={36} />
              <p className="text-xs font-bold text-[#18332B]">{t("citizenDashboard.noGrievancesTitle", "No active grievances found.")}</p>
              <p className="text-[11px] text-[#65736D] max-w-sm mx-auto">
                {t("citizenDashboard.noGrievancesDesc", "Whenever you submit a grievance or request legal guide representation, your case details will appear here.")}
              </p>
              <Button variant="primary" onClick={() => navigate("/citizen/submit-complaint")}>
                {t("citizenDashboard.submitFirstGrievance", "Submit First Grievance")}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {complaints.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/citizen/complaint/${item.id}`)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-[#E6E1D8] hover:bg-[#F7F1E6]/50 transition cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#65736D]">
                        ARAM-2026-{String(item.id).replace("cmp-", "").padStart(6, "0")}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#DCEBDD] text-[#163D32]">
                        {String(item.status || "SUBMITTED").replace(/_/g, " ")}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-[#18332B]">{item.title || "Legal Aid Complaint"}</h4>
                    <p className="text-[11px] text-[#65736D] line-clamp-1">{item.description}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <span className="text-[11px] text-[#8B9690] font-medium">
                      {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                    <ChevronRight size={16} className="text-[#8B9690]" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 12 Free Legal Aid Eligibility Modal */}
        <Section12EligibilityModal
          isOpen={showSec12Modal}
          onClose={() => setShowSec12Modal(false)}
          district={user?.district || "Salem District"}
        />

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
