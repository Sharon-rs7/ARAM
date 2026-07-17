import DashboardLayout from "@/components/layout/DashboardLayout";
import { Settings as SettingsIcon, Bell, Shield, Database, Globe, Save } from "lucide-react";
import { useState } from "react";
import { userService } from "../../services/userService";
import { toast } from "sonner";

const AdminSettings = () => {
  const [systemName, setSystemName] = useState("ARAM Complaint Management");
  const [defaultLanguage, setDefaultLanguage] = useState("English");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiThreshold, setAiThreshold] = useState(90);
  const [autoBackup, setAutoBackup] = useState(true);
  const [auditLogs, setAuditLogs] = useState(true);
  const [publicTracking, setPublicTracking] = useState(true);
  const [autoAssign, setAutoAssign] = useState(true);
  const [websiteTitle, setWebsiteTitle] = useState("ARAM - AI Complaint Management System");
  const [contactEmail, setContactEmail] = useState("support@aram.gov.in");
  const [supportPhone, setSupportPhone] = useState("+91 1800-123-4567");
  const [loading, setLoading] = useState(false);

  const handleSaveSettings = async () => {
    // Validations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      toast.error("Please enter a valid support contact email address.");
      return;
    }

    setLoading(true);
    try {
      await userService.updateSettings({
        systemName,
        defaultLanguage,
        emailNotifications,
        maintenanceMode,
        aiEnabled,
        aiThreshold,
        autoBackup,
        auditLogs,
        publicTracking,
        autoAssign,
        websiteTitle,
        contactEmail,
        supportPhone
      });
      toast.success("Administrator settings saved successfully!");
    } catch (err) {
      toast.error("Failed to update system configuration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Admin Settings</h1>
          <p className="mt-2 text-slate-555">Configure ARAM system preferences and platform settings.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* General Settings */}
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
            <div className="mb-6 flex items-center gap-3">
              <SettingsIcon className="text-blue-600" size={28} />
              <h2 className="text-2xl font-bold text-slate-900">General Settings</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block font-medium text-slate-800 text-sm">System Name</label>
                <input
                  value={systemName}
                  onChange={(e) => setSystemName(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-350 px-4 outline-none focus:border-blue-500 text-slate-800"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-slate-800 text-sm">Default Language</label>
                <select 
                  value={defaultLanguage}
                  onChange={(e) => setDefaultLanguage(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-350 px-4 text-slate-800 bg-white"
                >
                  <option value="English">English</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
            <div className="mb-6 flex items-center gap-3">
              <Bell className="text-amber-500" size={28} />
              <h2 className="text-2xl font-bold text-slate-905">System Mode Options</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3 bg-slate-50">
                <span className="text-slate-700 font-medium">Email Alerts for Volunteers</span>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={() => setEmailNotifications(!emailNotifications)}
                  className="rounded text-blue-600"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3 bg-slate-50">
                <span className="text-slate-700 font-medium">Maintenance Mode</span>
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={() => setMaintenanceMode(!maintenanceMode)}
                  className="rounded text-blue-600"
                />
              </div>
            </div>
          </div>

          {/* AI Configuration */}
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
            <div className="mb-6 flex items-center gap-3">
              <Shield className="text-green-600" size={28} />
              <h2 className="text-2xl font-bold text-slate-905">AI Configuration</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3 bg-slate-50">
                <span className="text-slate-700 font-medium">Enable AI Classification</span>
                <input
                  type="checkbox"
                  checked={aiEnabled}
                  onChange={() => setAiEnabled(!aiEnabled)}
                  className="rounded text-blue-600"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-slate-800 text-sm">AI Confidence Threshold ({aiThreshold}%)</label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={aiThreshold}
                  onChange={(e) => setAiThreshold(Number(e.target.value))}
                  className="w-full accent-blue-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                />
                <div className="mt-2 flex justify-between text-xs text-slate-400">
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
            <div className="mb-6 flex items-center gap-3">
              <Database className="text-violet-600" size={28} />
              <h2 className="text-2xl font-bold text-slate-905">Database & Audit Policies</h2>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3 bg-slate-50">
                <span className="text-slate-700 font-medium">Automatic Database Backup</span>
                <input
                  type="checkbox"
                  checked={autoBackup}
                  onChange={() => setAutoBackup(!autoBackup)}
                  className="rounded text-blue-600"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3 bg-slate-50">
                <span className="text-slate-700 font-medium">Enable Audit Logs</span>
                <input
                  type="checkbox"
                  checked={auditLogs}
                  onChange={() => setAuditLogs(!auditLogs)}
                  className="rounded text-blue-600"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3 bg-slate-50">
                <span className="text-slate-700 font-medium">Public Complaint Tracking (anonymous lookups)</span>
                <input
                  type="checkbox"
                  checked={publicTracking}
                  onChange={() => setPublicTracking(!publicTracking)}
                  className="rounded text-blue-600"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3 bg-slate-50">
                <span className="text-slate-700 font-medium">Auto Assign Volunteers by Department</span>
                <input
                  type="checkbox"
                  checked={autoAssign}
                  onChange={() => setAutoAssign(!autoAssign)}
                  className="rounded text-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Website Settings */}
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100 lg:col-span-2">
            <div className="mb-6 flex items-center gap-3">
              <Globe className="text-blue-600" size={28} />
              <h2 className="text-2xl font-bold text-slate-905">Website Settings</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-medium text-slate-800 text-sm">Website Title</label>
                <input
                  value={websiteTitle}
                  onChange={(e) => setWebsiteTitle(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-350 px-4 outline-none focus:border-blue-500 text-slate-800"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-slate-800 text-sm">Contact Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-350 px-4 outline-none focus:border-blue-500 text-slate-800"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block font-medium text-slate-800 text-sm">Support Phone</label>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-350 px-4 outline-none focus:border-blue-500 text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white transition hover:bg-blue-700 cursor-pointer"
          >
            <Save size={20} />
            {loading ? "Saving System Settings..." : "Save Settings"}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;