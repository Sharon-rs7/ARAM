import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import {
  Mic,
  Send,
  PlusCircle,
  Sparkles,
  ClipboardList,
  MessageSquare,
  Bell,
  User,
  ArrowRight
} from "lucide-react";
import { complaintService } from "../../services/complaintService";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [complaintList, setComplaintList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [queryText, setQueryText] = useState("");
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const data = await complaintService.getMyComplaints();
        // Sort newest first and limit to 3 items for clean space design
        const sorted = (data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
        setComplaintList(sorted);
      } catch (err) {
        console.error("Failed to load dashboard complaints:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const handleVoiceRecord = () => {
    if (recording) return;
    setRecording(true);
    toast.info("Listening... Speak now");
    
    setTimeout(() => {
      setRecording(false);
      setQueryText("My neighbour is encroaching my property and threatening me");
      toast.success("Voice transcribed!");
    }, 2500);
  };

  const handleGetAiHelp = () => {
    if (!queryText.trim()) {
      navigate("/citizen/chatbot");
      return;
    }
    // Navigate to chatbot page passing the query parameter
    navigate(`/citizen/chatbot?query=${encodeURIComponent(queryText)}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto pb-6">
        
        {/* Section 1: Custom Welcome & Ask Box Card */}
        <div className="glass-panel p-6 md:p-8 relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
                Good morning, {user?.name || "Sharon"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
                How can ARAM help you today?
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate("/citizen/notifications")}
                className="p-2.5 rounded-full border border-slate-200/50 dark:border-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-650 dark:text-slate-350 cursor-pointer"
              >
                <Bell size={18} />
              </button>
              <button 
                onClick={() => navigate("/citizen/profile")}
                className="p-2.5 rounded-full border border-slate-200/50 dark:border-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-650 dark:text-slate-350 cursor-pointer"
              >
                <User size={18} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
              Tell us what happened
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="Describe your problem in simple words..."
                className="w-full h-14 pr-14 pl-5 rounded-2xl border border-slate-200 dark:border-slate-800 focus:border-indigo-500 outline-none text-sm font-medium bg-white dark:bg-slate-950/40"
              />
              <button
                type="button"
                onClick={handleVoiceRecord}
                className={`absolute right-4 p-2.5 rounded-xl transition cursor-pointer ${
                  recording ? "bg-red-500 text-white animate-pulse" : "hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600"
                }`}
                title="Use voice transcription"
              >
                <Mic size={18} />
              </button>
            </div>

            <div className="flex justify-between items-center pt-2 px-1">
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 tracking-wider">
                தமிழ் / English / हिंदी
              </span>
              <button
                onClick={handleGetAiHelp}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition cursor-pointer"
              >
                Get AI Help <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Two primary action buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate("/citizen/submit-complaint")}
            className="h-16 rounded-2xl bg-indigo-600 dark:bg-indigo-500 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 dark:hover:bg-indigo-650 transition-all shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-98 cursor-pointer"
          >
            <PlusCircle size={18} />
            Submit Complaint
          </button>
          
          <button
            onClick={() => navigate("/citizen/chatbot")}
            className="h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all shadow-sm active:scale-98 cursor-pointer"
          >
            <Sparkles size={18} className="text-indigo-500 dark:text-indigo-400" />
            Ask ARAM AI
          </button>
        </div>

        {/* Section 3: Your Active Complaints List */}
        <div className="glass-panel p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Your Active Complaints
            </h3>
            <button
              onClick={() => navigate("/citizen/my-complaints")}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              View All →
            </button>
          </div>

          {loading ? (
            <div className="py-10 text-center text-xs text-slate-400">Loading complaints list...</div>
          ) : complaintList.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400 font-medium">
              You haven't submitted any complaints yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {complaintList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/citizen/complaints/${item.id}`)}
                  className="py-4 first:pt-0 last:pb-0 flex justify-between items-center hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition cursor-pointer px-1 rounded-xl"
                >
                  <div className="min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500 shrink-0">
                        {item.id}
                      </span>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-[10px] text-slate-450 mt-1">
                      {item.assignedHelperName ? `Guide: ${item.assignedHelperName}` : "Awaiting Admin Review"}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Badge
                      status={item.status === "PENDING" ? "pending" : item.status === "IN_PROGRESS" ? "info" : "success"}
                      label={item.status.replace("_", " ")}
                    />
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
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