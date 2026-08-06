import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Search, MessageSquare, ArrowLeft, Loader2 } from "lucide-react";
import { complaintService } from "../../services/complaintService";
import { volunteerService } from "../../services/volunteerService";
import { useAuth } from "../../context/AuthContext";
import CaseChatPanel from "@/components/CaseChatPanel";
import { toast } from "sonner";

const MessagesInbox = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCaseId, setSelectedCaseId] = useState(searchParams.get("caseId") || null);
  const [selectedCase, setSelectedCase] = useState(null);

  const isGuide = user?.role === "VOLUNTEER" || user?.role === "HELPER";

  useEffect(() => {
    const fetchInbox = async () => {
      try {
        setLoading(true);
        let list = [];
        if (isGuide) {
          const data = await volunteerService.getAssignedCases();
          list = data || [];
        } else {
          const data = await complaintService.getMyComplaints();
          list = data || [];
        }
        
        const formatted = list.map((item) => ({
          id: item.id,
          caseId: `ARAM-00${item.id}`,
          title: item.title,
          peerName: isGuide 
            ? (item.citizenName || item.citizen?.name || "Citizen Sharon") 
            : (item.assignedHelperName || "Awaiting Guide Assignment"),
          peerLevel: isGuide ? "Citizen" : (item.assignedHelperLevel || "Guide"),
          lastMessage: item.resolutionSummary || "Secure conversation initialized.",
          timeAgo: "Recently",
          isActive: item.status !== "RESOLVED"
        }));
        
        setConversations(formatted);
        
        if (selectedCaseId) {
          const match = formatted.find(c => String(c.id) === String(selectedCaseId));
          if (match) setSelectedCase(match);
        }
      } catch (err) {
        toast.error("Failed to load conversation inbox threads.");
      } finally {
        setLoading(false);
      }
    };
    fetchInbox();
  }, [isGuide, selectedCaseId]);

  const handleSelectConversation = (conv) => {
    setSelectedCaseId(conv.id);
    setSelectedCase(conv);
    setSearchParams({ caseId: conv.id });
  };

  const filteredConversations = conversations.filter((conv) => {
    const searchLower = searchQuery.toLowerCase();
    return conv.title.toLowerCase().includes(searchLower) || 
           conv.peerName.toLowerCase().includes(searchLower) ||
           conv.caseId.toLowerCase().includes(searchLower);
  });

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-6">
        
        {/* Header (Only show if not in mobile chat detail view) */}
        <div className={`items-center gap-3 ${selectedCaseId ? "hidden lg:flex" : "flex"}`}>
          <button 
            onClick={() => navigate(isGuide ? "/volunteer/dashboard" : "/citizen/dashboard")}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition text-slate-500 cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Messages
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Secure case-linked communication workspace.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex h-[50vh] items-center justify-center text-slate-400">
            <Loader2 className="animate-spin mr-2" size={20} />
            Loading conversations inbox...
          </div>
        ) : conversations.length === 0 ? (
          <div className="glass-panel p-10 text-center text-xs text-slate-400 font-medium">
            No active case conversations found. Chat threads initialize after guide assignment.
          </div>
        ) : (
          /* Mobile Toggle Split Grid */
          <div className="grid gap-6 lg:grid-cols-3 items-start min-h-[580px]">
            
            {/* Left Thread List Panel (Hidden on mobile if a thread is active) */}
            <div className={`glass-panel p-4 space-y-4 h-[580px] flex-col lg:col-span-1 ${
              selectedCaseId ? "hidden lg:flex" : "flex"
            }`}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-xs font-medium"
                />
                <Search className="absolute left-3 top-3 text-slate-400" size={14} />
              </div>

              <div className="flex-1 overflow-y-auto space-y-2.5">
                {filteredConversations.map((conv) => {
                  const isSelected = String(conv.id) === String(selectedCaseId);
                  return (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer text-left space-y-1.5 ${
                        isSelected
                          ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200"
                          : "border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-900/10"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                            {conv.peerName}
                          </h4>
                          <span className="text-[9px] font-mono font-semibold text-slate-450 mt-0.5 block">
                            {conv.caseId} • {conv.title.slice(0, 20)}...
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-semibold">{conv.timeAgo}</span>
                      </div>
                      
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-medium">
                        {conv.lastMessage}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Chat Panel (Hidden on mobile if no thread is active) */}
            <div className={`lg:col-span-2 ${
              selectedCaseId ? "block" : "hidden lg:block"
            }`}>
              {selectedCase ? (
                <div className="space-y-4">
                  {/* Selected Chat Header */}
                  <div className="glass-panel px-6 py-3 flex justify-between items-center border-b-2 border-indigo-500">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setSelectedCaseId(null);
                          setSelectedCase(null);
                          setSearchParams({});
                        }}
                        className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition text-slate-500 cursor-pointer"
                      >
                        <ArrowLeft size={16} />
                      </button>
                      <div>
                        <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                          {selectedCase.peerName}
                        </h3>
                        <span className="text-[9.5px] font-mono font-semibold text-slate-450 block mt-0.5">
                          {selectedCase.caseId} • {selectedCase.title}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <CaseChatPanel 
                    complaintId={selectedCase.id} 
                    userRole={isGuide ? "HELPER" : "CITIZEN"} 
                  />
                </div>
              ) : (
                <div className="glass-panel h-[580px] flex flex-col justify-center items-center text-slate-400 text-xs">
                  <MessageSquare size={32} className="text-slate-300 mb-2" />
                  Select a case conversation thread to begin secure chat.
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default MessagesInbox;
