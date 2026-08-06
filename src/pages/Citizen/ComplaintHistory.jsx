import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Search, ChevronRight, Calendar, User, Clock, ArrowLeft } from "lucide-react";
import { complaintService } from "../../services/complaintService";
import { toast } from "sonner";

const ComplaintHistory = () => {
  const navigate = useNavigate();
  
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'active', 'resolved'
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const data = await complaintService.getMyComplaints();
        setComplaints(data || []);
      } catch (err) {
        toast.error("Failed to load your complaints list.");
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  // Filtering logic
  const filtered = complaints.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.id && item.id.toString().includes(searchQuery));
    
    if (activeTab === "active") {
      return matchesSearch && item.status !== "RESOLVED";
    }
    if (activeTab === "resolved") {
      return matchesSearch && item.status === "RESOLVED";
    }
    return matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 pb-6">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/citizen/dashboard")}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition text-slate-500"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              My Complaints
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Track status and message assigned Legal Guides.
            </p>
          </div>
        </div>

        {/* Tab Selector & Search Row */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200/50 dark:border-slate-850/40">
            {["all", "active", "resolved"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-bold rounded-lg capitalize transition cursor-pointer ${
                  activeTab === tab
                    ? "bg-white dark:bg-slate-900 text-indigo-650 dark:text-indigo-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 outline-none text-xs font-medium"
            />
            <Search className="absolute left-3 text-slate-400" size={14} />
          </div>
        </div>

        {/* List Section */}
        <div className="glass-panel p-6">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-450">Loading complaints list...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-450 font-medium">
              No complaints match the filters.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/citizen/complaints/${item.id}`)}
                  className="py-5 first:pt-0 last:pb-0 flex items-center justify-between hover:bg-slate-50/20 dark:hover:bg-slate-900/10 transition cursor-pointer"
                >
                  <div className="min-w-0 pr-4 space-y-1">
                    <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500 block">
                      ARAM-{item.id}
                    </span>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">
                      {item.title}
                    </h4>
                    
                    {/* Status marker */}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className={`h-2 w-2 rounded-full ${
                        item.status === "RESOLVED"
                          ? "bg-emerald-500"
                          : item.status === "PENDING"
                          ? "bg-amber-500"
                          : "bg-indigo-500"
                      }`} />
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                        {item.status === "PENDING" 
                          ? "Awaiting Admin Review" 
                          : item.status === "IN_PROGRESS"
                          ? "In Progress"
                          : "Resolved"}
                      </span>
                    </div>

                    {/* Guide Info (only if in progress / guide assigned) */}
                    {item.status === "IN_PROGRESS" && item.assignedHelperName && (
                      <div className="mt-2 text-[10px] text-slate-450 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/40 p-2 rounded-lg border border-slate-100/50 dark:border-slate-850/40 w-fit">
                        <User size={10} className="text-indigo-500" />
                        <span>Guide: <strong>{item.assignedHelperName}</strong> • {item.assignedHelperLevel || "Senior"}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-2">
                      <Calendar size={10} />
                      <span>
                        {item.status === "RESOLVED" 
                          ? `Completed ${new Date(item.updatedAt).toLocaleDateString()}` 
                          : `Submitted ${new Date(item.createdAt).toLocaleDateString()}`}
                      </span>
                    </div>
                  </div>

                  <ChevronRight size={16} className="text-slate-400 shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default ComplaintHistory;