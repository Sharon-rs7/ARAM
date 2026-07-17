import DashboardLayout from "@/components/layout/DashboardLayout";
import { Settings as SettingsIcon, Bell, Moon, Globe, Shield, Lock, Info, Eye, Type } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../../services/userService";
import { authService } from "../../services/authService";
import { toast } from "sonner";

const Settings = () => {
  const navigate = useNavigate();

  // Appearance & Preferences
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [textSize, setTextSize] = useState("normal");
  
  // Privacy
  const [identityVisibility, setIdentityVisibility] = useState("VISIBLE");
  
  // Security Password Change
  const [showPass, setShowPass] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changePassLoading, setChangePassLoading] = useState(false);
  const [passError, setPassError] = useState("");

  useEffect(() => {
    // Sync dark mode from local class if already set
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
  }, []);

  const handleDarkModeToggle = () => {
    const nextVal = !darkMode;
    setDarkMode(nextVal);
    if (nextVal) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    toast.info(nextVal ? "Dark mode enabled." : "Light mode enabled.");
  };

  const handleTextSizeChange = (e) => {
    const size = e.target.value;
    setTextSize(size);
    // Remove old classes
    document.documentElement.classList.remove("text-scale-large", "text-scale-xlarge");
    if (size === "large") {
      document.documentElement.classList.add("text-scale-large");
    } else if (size === "xlarge") {
      document.documentElement.classList.add("text-scale-xlarge");
    }
    toast.success(`Text scaling adjusted to ${size}.`);
  };

  const handleSavePreferences = async () => {
    try {
      await userService.updateSettings({
        notifications,
        darkMode,
        textSize,
        identityVisibility
      });
      toast.success("Preferences saved successfully!");
    } catch (err) {
      toast.error("Failed to save preference settings.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPassError("All password fields are required.");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setPassError("New password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError("New passwords do not match.");
      return;
    }

    setChangePassLoading(true);

    try {
      // In mock mode, authService handles simulated reset or verification
      await authService.changePassword({ oldPassword, newPassword });
      toast.success("Password changed successfully.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPassError(err.message || "Failed to update password. Check old password.");
      toast.error("Password update failed.");
    } finally {
      setChangePassLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Settings</h1>
            <p className="mt-2 text-slate-500">Manage your application preferences and security.</p>
          </div>

          <button
            onClick={() => navigate("/citizen/dashboard")}
            className="rounded-xl border border-slate-350 px-6 py-3 hover:bg-slate-50 transition font-medium cursor-pointer"
          >
            Dashboard
          </button>
        </div>

        {/* Configuration grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* Left panel: Preferences & Appearance */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Preferences Card */}
            <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
              <div className="mb-6 flex items-center gap-3">
                <SettingsIcon className="text-blue-600" size={28} />
                <h2 className="text-2xl font-bold text-slate-905">General Preferences</h2>
              </div>

              <div className="space-y-5">
                {/* Notifications */}
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-center gap-4">
                    <Bell className="text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-slate-800">Notifications</h3>
                      <p className="text-sm text-slate-500">Receive complaint updates and reminders</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotifications(!notifications)}
                    className={`h-7 w-14 rounded-full transition flex items-center px-0.5 ${
                      notifications ? "bg-blue-600" : "bg-slate-300"
                    }`}
                  >
                    <div
                      className={`h-6 w-6 rounded-full bg-white transition-transform ${
                        notifications ? "translate-x-7" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Dark Mode */}
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-center gap-4">
                    <Moon className="text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-slate-800">Dark Mode</h3>
                      <p className="text-sm text-slate-500">Enable dark theme appearance</p>
                    </div>
                  </div>
                  <button
                    onClick={handleDarkModeToggle}
                    className={`h-7 w-14 rounded-full transition flex items-center px-0.5 ${
                      darkMode ? "bg-blue-600" : "bg-slate-300"
                    }`}
                  >
                    <div
                      className={`h-6 w-6 rounded-full bg-white transition-transform ${
                        darkMode ? "translate-x-7" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Text Scaling */}
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-center gap-4">
                    <Type className="text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-slate-800">Text Scaling</h3>
                      <p className="text-sm text-slate-500">Adjust content size for readability</p>
                    </div>
                  </div>
                  <select
                    value={textSize}
                    onChange={handleTextSizeChange}
                    className="rounded-xl border border-slate-300 px-4 py-2 outline-none text-slate-800 bg-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="large">Large</option>
                    <option value="xlarge">Extra Large</option>
                  </select>
                </div>

                {/* Identity Visibility Option */}
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-center gap-4">
                    <Eye className="text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-slate-800">Identity Visibility</h3>
                      <p className="text-sm text-slate-500">Control helper disclosure scope</p>
                    </div>
                  </div>
                  <select
                    value={identityVisibility}
                    onChange={(e) => setIdentityVisibility(e.target.value)}
                    className="rounded-xl border border-slate-300 px-4 py-2 outline-none text-slate-800 bg-white"
                  >
                    <option value="VISIBLE">Visible (Show Name/Phone)</option>
                    <option value="PARTIAL">Partial (District Only)</option>
                    <option value="HIDDEN">Hidden (Mask details & PII)</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t flex justify-end">
                <button
                  onClick={handleSavePreferences}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold cursor-pointer"
                >
                  Save Preferences
                </button>
              </div>
            </div>

            {/* Application Info */}
            <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
              <div className="mb-6 flex items-center gap-3">
                <Info className="text-blue-600" size={28} />
                <h2 className="text-2xl font-bold text-slate-900">App Information</h2>
              </div>
              <div className="space-y-4 text-sm text-slate-650 leading-relaxed">
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium text-slate-500">Software Version</span>
                  <span className="font-mono text-slate-800">1.0.4-RELEASE</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium text-slate-500">Security Standard</span>
                  <span className="text-slate-850">Aadhaar Masking Level 3</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium text-slate-500">Legal Standard Compliance</span>
                  <span className="text-slate-850">DLSA Integrated</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  <strong>Emergency Disclaimer:</strong> ARAM provides preliminary complaint guidance only. It does not replace police, court, lawyer, or official authority.
                </p>
              </div>
            </div>

          </div>

          {/* Right panel: Change Password & Security */}
          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
              <div className="mb-6 flex items-center gap-3">
                <Lock className="text-blue-600" size={26} />
                <h2 className="text-2xl font-bold text-slate-900">Change Password</h2>
              </div>

              {passError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs border border-red-100 flex items-start gap-2">
                  <Info size={14} className="mt-0.5 flex-shrink-0" />
                  <span>{passError}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Current Password</label>
                  <input
                    type={showPass ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    placeholder="Enter current password"
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">New Password</label>
                  <input
                    type={showPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Create new password"
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Confirm New Password</label>
                  <input
                    type={showPass ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Verify new password"
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showPassToggle"
                    checked={showPass}
                    onChange={(e) => setShowPass(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="showPassToggle" className="text-xs text-slate-500 cursor-pointer select-none">
                    Show passwords
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={changePassLoading}
                  className="w-full h-12 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition font-semibold text-sm cursor-pointer mt-4 flex items-center justify-center gap-2"
                >
                  {changePassLoading ? "Saving..." : "Change Password"}
                </button>
              </form>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default Settings;