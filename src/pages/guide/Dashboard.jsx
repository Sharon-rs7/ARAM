import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/common/DashboardLayout";
import { Bell, User, Clock, ArrowRight, MessageSquare, AlertCircle } from "lucide-react";
import { volunteerService } from "@/services/volunteerService";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [guideInfo, setGuideInfo] = useState({
    levelName: "Junior Guide",
    creditScore: 0,
    levelNumber: 1
  });
  const [stats, setStats] = useState({
    activeCases: 0,
    needsResponse: 0,
    resolved: 0
  });
  
  const [assignedList, setAssignedList] = useState([]);
  const [attentionCase, setAttentionCase] = useState(null);
  const [recentMessages, setRecentMessages] = useState([]);

  useEffect(() => {
    const fetchGuideDashboard = async () => {
      try {
        setLoading(true);
        const data = await volunteerService.getDashboard();
        
        // Count statuses
        const cases = data?.assignedCases || [];
        setAssignedList(cases);
        const active = cases.filter(c => c.status !== "RESOLVED" && c.status !== "CLOSED").length;
        const resolved = cases.filter(c => c.status === "RESOLVED" || c.status === "RESOLVED_BY_GUIDE" || c.status === "CLOSED").length;
        const pending = cases.filter(c => c.status === "PENDING" || c.status === "SUBMITTED" || c.status === "HELPER_ASSIGNED").length;
        
        setStats({
          activeCases: active || 0,
          needsResponse: pending || 0,
          resolved: resolved || 0
        });

        if (data?.volunteer) {
          setGuideInfo({
            levelName: data.volunteer.levelName || "Community Legal Guide",
            creditScore: data.volunteer.creditScore || 350,
            levelNumber: data.volunteer.levelNumber || 1
          });
        }

        if (cases.length > 0) {
          const first = cases[0];
          const customId = first.complaintCustomId || `ARAM-2026-TN-${String(first.id).padStart(6, "0")}`;
          setAttentionCase({
            id: customId,
            rawId: first.id,
            title: first.title || `${first.categoryLabel || first.category || "Legal Aid"} — Case #${first.id}`,
            priority: first.priority || "MEDIUM",
            citizenName: first.citizenName || first.userName || first.citizen?.name || "Citizen Applicant",
            language: first.language === "ta-IN" ? "Tamil" : first.language === "hi-IN" ? "Hindi" : "English",
            assignedTime: "Active jurisdiction case",
            status: first.status || "IN_PROGRESS"
          });

          setRecentMessages(
            cases.slice(0, 3).map((c) => ({
              sender: c.citizenName || c.userName || "Citizen Applicant",
              caseId: c.complaintCustomId || `ARAM-${c.id}`,
              text: c.title || "Case discussion channel is open. Click to communicate.",
              timeAgo: new Date(c.createdAt || Date.now()).toLocaleDateString(),
              rawId: c.id
            }))
          );
        } else {
          setAttentionCase(null);
          setRecentMessages([]);
        }
      } catch (err) {
        console.error("Failed to load guide dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGuideDashboard();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-8">
        
        {/* Top Header Card */}
        <div className="bg-[#FFFDF8] border border-[#E6E1D8] rounded-3xl p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#65736D] uppercase tracking-wider">
                <span className="bg-[#DCEBDD] text-[#163D32] px-2.5 py-0.5 rounded-full font-black border border-[#c5ddc6]">
                  {user?.district || "Regional"} Jurisdiction
                </span>
                <span>•</span>
                <span>{guideInfo.levelName}</span>
              </div>
              <h1 className="text-xl sm:text-3xl font-black text-[#163D32] tracking-tight">
                Welcome back, {user?.name || "Legal Guide"} 👋
              </h1>
              <p className="text-xs text-[#65736D] font-medium">
                Assist assigned citizens, review evidence documents, and facilitate direct community mediation.
              </p>
            </div>

            {/* XP & Level Status */}
            <div className="flex items-center justify-between sm:justify-start gap-3 bg-[#F7F1E6]/60 border border-[#E6E1D8] p-3.5 sm:p-4 rounded-2xl w-full sm:w-auto shrink-0">
              <div className="space-y-1 flex-1 sm:flex-none">
                <div className="flex justify-between items-center text-[10px] font-extrabold uppercase text-[#65736D] gap-2">
                  <span>Experience Rank</span>
                  <span className="text-[#1F5948] font-black">{guideInfo.creditScore} XP</span>
                </div>
                <div className="w-full sm:w-36 bg-[#E6E1D8] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#163D32] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(15, (guideInfo.creditScore / 1000) * 100))}%` }}
                  />
                </div>
                <span className="text-[10px] text-[#8B9690] font-semibold block">Level {guideInfo.levelNumber} Practitioner</span>
              </div>
              <button
                onClick={() => navigate("/guide/my-analytics")}
                className="px-3 py-2 bg-[#FFFDF8] border border-[#E6E1D8] hover:bg-[#DCEBDD] transition rounded-xl text-[#163D32] text-xs font-bold shrink-0 cursor-pointer shadow-2xs"
                title="View Performance Analytics"
              >
                Analytics
              </button>
            </div>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#FFFDF8] rounded-3xl p-4 sm:p-6 border border-[#E6E1D8] shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-[#65736D] uppercase tracking-wider block">
                Active Cases
              </span>
              <span className="text-2xl sm:text-3xl font-black text-[#163D32] mt-1 block">
                {stats.activeCases}
              </span>
              <span className="text-[11px] text-[#8B9690] font-medium mt-0.5 block">Under ongoing guidance</span>
            </div>
            <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-[#DCEBDD]/50 border border-[#c5ddc6] flex items-center justify-center text-[#163D32] font-black text-lg shrink-0">
              📂
            </div>
          </div>

          <div className="bg-[#FFFDF8] rounded-3xl p-4 sm:p-6 border border-[#E6E1D8] shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-[#65736D] uppercase tracking-wider block">
                Needs Your Response
              </span>
              <span className="text-2xl sm:text-3xl font-black text-[#B96845] mt-1 block">
                {stats.needsResponse}
              </span>
              <span className="text-[11px] text-[#8B9690] font-medium mt-0.5 block">Awaiting consultation review</span>
            </div>
            <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-[#F7F1E6] border border-[#E6E1D8] flex items-center justify-center text-[#B96845] font-black text-lg shrink-0">
              ⏳
            </div>
          </div>

          <div className="bg-[#FFFDF8] rounded-3xl p-4 sm:p-6 border border-[#E6E1D8] shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-[#65736D] uppercase tracking-wider block">
                Resolved Grievances
              </span>
              <span className="text-2xl sm:text-3xl font-black text-[#1F5948] mt-1 block">
                {stats.resolved}
              </span>
              <span className="text-[11px] text-[#8B9690] font-medium mt-0.5 block">Successfully closed cases</span>
            </div>
            <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-[#DCEBDD] border border-[#c5ddc6] flex items-center justify-center text-[#1F5948] font-black text-lg shrink-0">
              ✅
            </div>
          </div>
        </div>

        {/* Priority Case: Needs Your Attention */}
        <div className="bg-[#FFFDF8] rounded-3xl p-6 border border-[#E6E1D8] space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E6E1D8] pb-3">
            <h3 className="text-xs font-extrabold text-[#163D32] uppercase tracking-wider flex items-center gap-2">
              <AlertCircle size={15} className="text-[#B96845]" /> Highest Priority Case
            </h3>
            <span className="text-[10px] font-bold text-[#65736D] uppercase tracking-wider">
              Assigned to you
            </span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-[#65736D] font-medium">Loading priority case...</div>
          ) : attentionCase ? (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-[#c5ddc6] bg-[#DCEBDD]/20">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#163D32] bg-[#DCEBDD] px-2 py-0.5 rounded-md border border-[#c5ddc6]">
                    {attentionCase.id}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    attentionCase.priority === "HIGH" || attentionCase.priority === "CRITICAL"
                      ? "bg-red-100 text-red-800 border border-red-200"
                      : "bg-[#DCEBDD] text-[#163D32] border border-[#c5ddc6]"
                  }`}>
                    {attentionCase.priority} Priority
                  </span>
                </div>
                
                <h4 className="font-black text-base text-[#18332B] tracking-tight">
                  {attentionCase.title}
                </h4>
                
                <div className="flex flex-wrap gap-3 text-xs text-[#65736D] font-medium pt-1">
                  <span>Citizen: <strong className="text-[#18332B]">{attentionCase.citizenName}</strong></span>
                  <span>•</span>
                  <span>Language: <strong className="text-[#18332B]">{attentionCase.language}</strong></span>
                  <span>•</span>
                  <span>Status: <strong className="text-[#1F5948]">{attentionCase.status}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => navigate(`/guide/complaint/${attentionCase.rawId}`)}
                  className="px-5 py-2.5 bg-[#163D32] hover:bg-[#1F5948] text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  Open Workspace <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[#8B9690] font-medium">
              No urgent complaints requiring attention. All assigned cases are up to date.
            </div>
          )}
        </div>

        {/* Assigned Cases Table List */}
        <div className="bg-[#FFFDF8] rounded-3xl p-6 border border-[#E6E1D8] space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E6E1D8] pb-3">
            <h3 className="text-xs font-extrabold text-[#163D32] uppercase tracking-wider flex items-center gap-2">
              <MessageSquare size={15} className="text-[#1F5948]" /> My Active Case Queue ({assignedList.length})
            </h3>
            <button
              onClick={() => navigate("/guide/assigned-cases")}
              className="text-xs font-bold text-[#1F5948] hover:underline cursor-pointer flex items-center gap-1"
            >
              View Full Queue <ArrowRight size={13} />
            </button>
          </div>

          {/* Mobile Card List (< sm) */}
          <div className="sm:hidden divide-y divide-[#E6E1D8]">
            {assignedList.length === 0 ? (
              <div className="py-8 text-center text-[#65736D] font-medium text-xs">
                No cases currently assigned. New cases from district admin will appear here.
              </div>
            ) : (
              assignedList.slice(0, 5).map((c) => (
                <div key={c.id} className="py-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#163D32]">
                      {c.complaintCustomId || `ARAM-${c.id}`}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      c.priority === "CRITICAL" || c.priority === "HIGH"
                        ? "bg-red-100 text-red-800"
                        : "bg-[#DCEBDD] text-[#163D32]"
                    }`}>
                      {c.priority || "MEDIUM"}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#18332B] truncate">
                    {c.title || c.categoryLabel || "Grievance Case"}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-[#65736D] pt-1">
                    <span>Citizen: <strong className="text-[#18332B]">{c.citizenName || c.userName || "Applicant"}</strong></span>
                    <button
                      onClick={() => navigate(`/guide/complaint/${c.id}`)}
                      className="px-3 py-1.5 bg-[#163D32] hover:bg-[#1F5948] text-white rounded-lg text-[10px] font-bold transition cursor-pointer"
                    >
                      Workspace →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View (>= sm) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E6E1D8] text-[#65736D] uppercase text-[10px] font-black tracking-wider bg-[#F7F1E6]/40">
                  <th className="py-3 px-4">Case ID</th>
                  <th className="py-3 px-4">Case Title</th>
                  <th className="py-3 px-4">Citizen</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E1D8] text-[#18332B]">
                {assignedList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-[#65736D] font-medium">
                      No cases currently assigned. New cases from district admin will appear here.
                    </td>
                  </tr>
                ) : (
                  assignedList.slice(0, 5).map((c) => (
                    <tr key={c.id} className="hover:bg-[#F7F1E6]/50 transition duration-100">
                      <td className="py-3 px-4 font-bold text-[#163D32]">
                        {c.complaintCustomId || `ARAM-${c.id}`}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#18332B] max-w-xs truncate">
                        {c.title || c.categoryLabel || "Grievance Case"}
                      </td>
                      <td className="py-3 px-4 font-medium text-[#65736D]">
                        {c.citizenName || c.userName || "Applicant"}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          c.priority === "CRITICAL" || c.priority === "HIGH"
                            ? "bg-red-100 text-red-800"
                            : "bg-[#DCEBDD] text-[#163D32]"
                        }`}>
                          {c.priority || "MEDIUM"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-[#F7F1E6] border border-[#E6E1D8] text-[#18332B]">
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => navigate(`/guide/complaint/${c.id}`)}
                          className="px-3 py-1.5 bg-[#163D32] hover:bg-[#1F5948] text-white rounded-lg text-[10px] font-bold transition cursor-pointer inline-flex items-center gap-1"
                        >
                          Workspace →
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Recent Communications */}
        <div className="bg-[#FFFDF8] rounded-3xl p-6 border border-[#E6E1D8] space-y-4 shadow-sm">
          <h3 className="text-xs font-extrabold text-[#163D32] uppercase tracking-wider border-b border-[#E6E1D8] pb-3 flex items-center gap-2">
            <MessageSquare size={15} className="text-[#1F5948]" /> Citizen Communication Feed
          </h3>

          <div className="space-y-3">
            {recentMessages.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#8B9690] font-medium">
                No active messages yet. Communication threads with citizens will appear here.
              </div>
            ) : (
              recentMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-2xl border border-[#E6E1D8] hover:bg-[#F7F1E6]/50 transition cursor-pointer"
                  onClick={() => navigate(`/guide/complaint/${msg.rawId}?tab=chat`)}
                >
                  <div className="min-w-0 pr-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs text-[#18332B]">
                        {msg.sender}
                      </span>
                      <span className="font-mono text-[10px] text-[#65736D] bg-[#DCEBDD] px-1.5 py-0.5 rounded">
                        {msg.caseId}
                      </span>
                    </div>
                    <p className="text-xs text-[#65736D] truncate max-w-lg font-medium">
                      "{msg.text}"
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-[10px] text-[#8B9690] font-semibold">{msg.timeAgo}</span>
                    <span className="text-[11px] font-extrabold text-[#1F5948] hover:underline flex items-center gap-1">
                      Open Chat <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;