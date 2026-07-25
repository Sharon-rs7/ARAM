import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SettingsCenter from "@/components/SettingsCenter";

const Settings = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Account Settings
          </h1>
          <p className="mt-1 text-slate-500 text-sm">
            Manage your personal profile, notification defaults, visibility shield preferences, and login security credentials.
          </p>
        </div>

        <SettingsCenter role="citizen" />
      </div>
    </DashboardLayout>
  );
};

export default Settings;