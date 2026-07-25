import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import {
  FileText,
  Clock3,
  CheckCircle2,
  BrainCircuit,
  Plus,
  ArrowRight,
  Sparkles,
  PlusCircle,
  ClipboardList,
  Mic,
  ShieldAlert,
  CheckSquare,
  MessageSquare,
  Info
} from "lucide-react";

const statsConfig = [
  {
    title: "Total Complaints",
    value: "24",
    icon: FileText,
    variant: "primary",
    color: "text-blue-600 bg-blue-50"
  },
  {
    title: "Pending",
    value: "08",
    icon: Clock3,
    variant: "warning",
    color: "text-amber-600 bg-amber-50"
  },
  {
    title: "Resolved",
    value: "15",
    icon: CheckCircle2,
    variant: "success",
    color: "text-green-600 bg-green-50"
  },
  {
    title: "AI Analysed",
    value: "21",
    icon: BrainCircuit,
    variant: "ai",
    color: "text-teal-600 bg-teal-50"
  }
];

const complaints = [
  {
    id: "CMP1023",
    title: "Road Damage Complaint",
    status: "pending",
    priority: "High"
  },
  {
    id: "CMP1024",
    title: "Water Supply Issue",
    status: "info",
    priority: "Medium"
  },
  {
    id: "CMP1025",
    title: "Electricity Complaint",
    status: "success",
    priority: "Low"
  }
];

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <Card className="rounded-2xl border border-slate-200 p-8">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Public User Dashboard
          </h2>
          <p className="mt-2 text-sm text-slate-500 max-w-xl">
            Submit complaints, track status, and access legal guidance.
          </p>
        </Card>

        {/* Mobile Quick Action Cards Grid */}
        <div className="block md:hidden space-y-4">
          <div>
            <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2.5">Primary Services</h3>
            <div className="space-y-3">
              {/* Speak Complaint */}
              <button
                onClick={() => navigate("/citizen/submit-complaint?voice=true")}
                className="w-full min-h-[64px] bg-gradient-to-r from-red-500/10 to-transparent border border-red-200 rounded-2xl p-4 flex items-center gap-4 text-left transition hover:border-red-500 hover:shadow-sm active:scale-95 cursor-pointer"
              >
                <div className="h-10 w-10 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Mic size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-800">Speak Complaint</h4>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">Use voice if typing is difficult</p>
                </div>
              </button>

              {/* Type Complaint */}
              <button
                onClick={() => navigate("/citizen/submit-complaint")}
                className="w-full min-h-[64px] bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-200 rounded-2xl p-4 flex items-center gap-4 text-left transition hover:border-blue-500 hover:shadow-sm active:scale-95 cursor-pointer"
              >
                <div className="h-10 w-10 rounded-full bg-blue-650 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <PlusCircle size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-800">Type Complaint</h4>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">Write your problem in simple words</p>
                </div>
              </button>

              {/* Track My Complaint */}
              <button
                onClick={() => navigate("/citizen/my-complaints")}
                className="w-full min-h-[64px] bg-gradient-to-r from-indigo-500/10 to-transparent border border-indigo-200 rounded-2xl p-4 flex items-center gap-4 text-left transition hover:border-indigo-500 hover:shadow-sm active:scale-95 cursor-pointer"
              >
                <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <ClipboardList size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-800">Track My Complaint</h4>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">Check status using complaint ID</p>
                </div>
              </button>

              {/* Talk to Legal Guide */}
              <button
                onClick={() => navigate("/citizen/chatbot")}
                className="w-full min-h-[64px] bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-200 rounded-2xl p-4 flex items-center gap-4 text-left transition hover:border-amber-500 hover:shadow-sm active:scale-95 cursor-pointer"
              >
                <div className="h-10 w-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-800">Talk to Legal Guide</h4>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">Continue your assigned case chat</p>
                </div>
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2.5">Secondary Services</h3>
            <div className="grid grid-cols-2 gap-3">
              {/* Upload Proof */}
              <button
                onClick={() => navigate("/citizen/documents")}
                className="min-h-[56px] border border-slate-200 bg-white rounded-2xl p-3 flex flex-col justify-center items-start text-left transition hover:border-blue-500 active:scale-95 cursor-pointer"
              >
                <CheckSquare size={16} className="text-emerald-600 mb-1" />
                <span className="font-bold text-[11px] text-slate-800">Upload Proof</span>
              </button>

              {/* My Complaints */}
              <button
                onClick={() => navigate("/citizen/my-complaints")}
                className="min-h-[56px] border border-slate-200 bg-white rounded-2xl p-3 flex flex-col justify-center items-start text-left transition hover:border-blue-500 active:scale-95 cursor-pointer"
              >
                <FileText size={16} className="text-indigo-600 mb-1" />
                <span className="font-bold text-[11px] text-slate-800">My Complaints</span>
              </button>

              {/* Women Safety Help */}
              <button
                onClick={() => navigate("/citizen/submit-complaint?sensitive=true")}
                className="min-h-[56px] border border-rose-200 bg-rose-50/20 rounded-2xl p-3 flex flex-col justify-center items-start text-left transition hover:border-rose-500 active:scale-95 cursor-pointer"
              >
                <ShieldAlert size={16} className="text-rose-500 mb-1" />
                <span className="font-bold text-[11px] text-slate-800">Women Safety</span>
              </button>

              {/* Help Center */}
              <button
                onClick={() => navigate("/citizen/help")}
                className="min-h-[56px] border border-slate-200 bg-white rounded-2xl p-3 flex flex-col justify-center items-start text-left transition hover:border-blue-500 active:scale-95 cursor-pointer"
              >
                <Info size={16} className="text-slate-550 mb-1" />
                <span className="font-bold text-[11px] text-slate-800">Help Center</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="hidden md:grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsConfig.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {item.title}
                    </p>
                    <h3 className="mt-2.5 text-3xl font-black text-slate-900">
                      {item.value}
                    </h3>
                  </div>
                  <div className={`rounded-xl p-3.5 ${item.color}`}>
                    <Icon size={24} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Lower Grid split */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Complaints */}
          <Card className="lg:col-span-2 p-6 flex flex-col justify-between">
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">
                  Recent Complaints
                </h3>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/citizen/my-complaints")}
                >
                  View All
                </Button>
              </div>

              <div className="space-y-3">
                {complaints.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-slate-150 p-4 hover:bg-slate-50/50 transition cursor-pointer"
                    onClick={() => navigate(`/citizen/complaints/${item.id}`)}
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">
                        {item.title}
                      </h4>
                      <p className="text-xs font-mono text-slate-400 mt-1">
                        #{item.id}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <Badge
                        status={item.status}
                        label={item.status.toUpperCase()}
                      />
                      <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                        {item.priority} Priority
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Quick Actions & AI Highlight */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-base font-bold text-slate-900">
                Quick Actions
              </h3>
              <div className="mt-4 space-y-3">
                <Button
                  variant="primary"
                  className="w-full flex justify-between"
                  icon={Plus}
                  iconPosition="right"
                  onClick={() => navigate("/citizen/submit-complaint")}
                >
                  Submit Complaint
                </Button>
                <Button
                  variant="outline"
                  className="w-full flex justify-between border-slate-200 hover:border-slate-300"
                  icon={ArrowRight}
                  iconPosition="right"
                  onClick={() => navigate("/citizen/ai-analysis")}
                >
                  AI Diagnostic Tool
                </Button>
              </div>
            </Card>

            {/* AI Recommendation Highlight Card */}
            <Card className="p-6 border-l-4 border-teal-500 bg-teal-50/20">
              <div className="flex items-center gap-2 text-teal-700">
                <Sparkles size={20} className="shrink-0" />
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  AI Smart Recommendation
                </h3>
              </div>
              <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                Our model indicates 2 complaints are flagged as critical. Submit relevant files for automatic redact-masking verification.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;