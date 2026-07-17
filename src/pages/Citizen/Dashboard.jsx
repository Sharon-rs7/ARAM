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
  Sparkles
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
            Welcome Back 👋
          </h2>
          <p className="mt-2 text-sm text-slate-500 max-w-xl">
            Manage your registered grievances, review AI classification mappings, and track active community resolutions.
          </p>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                      <span className="text-[10px] font-bold text-slate-450 tracking-wider">
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
                  className="w-full flex justify-between border-slate-200 hover:border-slate-350"
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