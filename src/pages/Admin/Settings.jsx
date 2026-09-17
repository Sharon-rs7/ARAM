import React from "react";
import DashboardLayout from "@/components/common/DashboardLayout";
import SettingsCenter from "@/components/common/SettingsCenter";

const AdminSettings = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Portal Settings
          </h1>
          <p className="mt-1 text-slate-500 text-sm">
            Configure system configurations, case recommendation rules, SLA thresholds, and active security sessions.
          </p>
        </div>

        <SettingsCenter role="admin" />
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;