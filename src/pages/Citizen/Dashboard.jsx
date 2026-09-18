import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/common/DashboardLayout";
import { 
  MessageSquare, PlusCircle, Clock, ShieldCheck, 
  Mic, ArrowRight, FileText, CheckCircle2, ChevronRight,
  HelpCircle, AlertCircle, Sparkles, Building2, User
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { complaintService } from "@/services/complaintService";
import { speechService } from "@/services/speechService";
import { toast } from "sonner";
import Button from "@/components/common/Button";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

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
          const res = await speechService.transcribeAudio(audioBlob, "ta-IN");
          if (res?.text) {
            navigate(`/citizen/chatbot?q=${encodeURIComponent(res.text)}`);
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
    { title: "Women & Family Law", desc: "Maintenance, 498A, DV Act, Custody", color: "bg-[#F6D8C8]/50 border-[#F6D8C8]", query: "Women and family legal protection rights" },
    { title: "Land & Property", desc: "Patta, Encroachment, Boundary disputes", color: "bg-[#E8C978]/40 border-[#E8C978]", query: "Land title deed patta transfer dispute" },
    { title: "Consumer & RTI", desc: "Product defect, RTI filing, Fair trade", color: "bg-[#E7E1F2]/50 border-[#E7E1F2]", query: "RTI filing procedure and consumer court claim" },
    { title: "Labour & Wage Rights", desc: "Unpaid dues, Gratuity, PF settlement", color: "bg-[#DCEBDD] border-[#B8D7BC]", query: "Labour wage non-payment and gratuity settlement" },
    { title: "Emergency & Cyber Aid", desc: "Online fraud, 1930 Helpline, Harassment", color: "bg-[#F4DDE2]/50 border-[#F4DDE2]", query: "Cyber crime financial fraud and emergency helpline" },
  ];

  return (
    <DashboardLayout role="citizen">
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-[#163D32] p-8 sm:p-10 text-white shadow-md">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#DCEBDD]/20 px-3 py-1 text-xs font-bold text-[#DCEBDD]">
              <Sparkles size={14} /> Tamil Nadu Public Legal Aid & Grievance Portal
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Hello, {user?.name || "Citizen"}. How can ARAM assist you today?
            </h1>
            <p className="text-xs sm:text-sm text-[#DCEBDD]/90 leading-relaxed">
              Describe any grievance, legal issue, or dispute in Tamil, English, or Hindi to receive immediate verified guidance, document requirements, and assigned legal guide assistance.
            </p>

            {/* Hero Actions */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                variant="cream"
                onClick={() => navigate("/citizen/chatbot")}
                icon={MessageSquare}
              >
                Ask ARAM Legal Assistant
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
                <span>{isRecording ? "Stop & Transcribe" : "Speak Grievance (Voice)"}</span>
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
            <h3 className="text-sm font-bold text-[#18332B] group-hover:text-[#163D32]">Submit Grievance</h3>
            <p className="text-xs text-[#65736D]">File a structured complaint with AI document analysis.</p>
          </Link>

          <Link
            to="/citizen/documents"
            className="group p-5 rounded-2xl bg-[#FFFDF8] border border-[#E6E1D8] shadow-sm hover:border-[#163D32] transition space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-[#F6D8C8]/60 text-[#8C3B1E] flex items-center justify-center font-bold group-hover:scale-105 transition">
              <FileText size={20} />
            </div>
            <h3 className="text-sm font-bold text-[#18332B] group-hover:text-[#163D32]">Upload Evidence</h3>
            <p className="text-xs text-[#65736D]">Verify deeds, agreements & FIRs via OCR readiness.</p>
          </Link>

          <Link
            to="/track-complaint"
            className="group p-5 rounded-2xl bg-[#FFFDF8] border border-[#E6E1D8] shadow-sm hover:border-[#163D32] transition space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-[#E8C978]/40 text-[#7A5A0A] flex items-center justify-center font-bold group-hover:scale-105 transition">
              <Clock size={20} />
            </div>
            <h3 className="text-sm font-bold text-[#18332B] group-hover:text-[#163D32]">Track Status</h3>
            <p className="text-xs text-[#65736D]">Milestone progress timeline & guide action plans.</p>
          </Link>

          <Link
            to="/citizen/help"
            className="group p-5 rounded-2xl bg-[#FFFDF8] border border-[#E6E1D8] shadow-sm hover:border-[#163D32] transition space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-[#E7E1F2]/60 text-[#4F3F73] flex items-center justify-center font-bold group-hover:scale-105 transition">
              <HelpCircle size={20} />
            </div>
            <h3 className="text-sm font-bold text-[#18332B] group-hover:text-[#163D32]">Legal Rights Guide</h3>
            <p className="text-xs text-[#65736D]">DLSA contacts, government schemes & helplines.</p>
          </Link>
        </div>

        {/* Legal Aid Topic Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-[#18332B] tracking-tight">
              Explore Legal Rights by Domain
            </h2>
            <Link to="/citizen/chatbot" className="text-xs font-bold text-[#1F5948] hover:underline flex items-center gap-1">
              Ask any topic <ChevronRight size={14} />
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
              <h3 className="text-base font-extrabold text-[#18332B]">My Active Grievances</h3>
              <p className="text-xs text-[#65736D] mt-0.5">Track your submitted complaints and legal guide notes.</p>
            </div>
            <Link to="/citizen/history" className="text-xs font-bold text-[#1F5948] hover:underline">
              View All Grievances →
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-[#8B9690]">Loading your grievances...</div>
          ) : complaints.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <ShieldCheck className="mx-auto text-[#163D32]" size={36} />
              <p className="text-xs font-bold text-[#18332B]">No active grievances found.</p>
              <p className="text-[11px] text-[#65736D] max-w-sm mx-auto">
                Whenever you submit a grievance or request legal guide representation, your case details will appear here.
              </p>
              <Button variant="primary" onClick={() => navigate("/citizen/submit-complaint")}>
                Submit First Grievance
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

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
