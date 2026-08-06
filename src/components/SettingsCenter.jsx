import React, { useState, useEffect } from "react";
import { 
  User, Bell, Shield, Lock, Paintbrush, Languages, Info, FileText, 
  Trash2, Smartphone, Check, AlertCircle, ShieldCheck, Eye, EyeOff, 
  RefreshCw, Award, Sliders, Cpu, Save, X, AlertTriangle 
} from "lucide-react";
import { toast } from "sonner";
import { userService } from "../services/userService";
import { useTheme } from "../context/ThemeContext";

export default function SettingsCenter({ role = "citizen" }) {
  const { mode, setMode } = useTheme();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("account");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [expandedAccordions, setExpandedAccordions] = useState({ account: true });

  // Profile forms
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");
  const [locality, setLocality] = useState("");
  const [preferredLang, setPreferredLang] = useState("English");
  const [avatarUrl, setAvatarUrl] = useState("");
  
  // Volunteer Professional Info
  const [languagesKnown, setLanguagesKnown] = useState("");
  const [specializations, setSpecializations] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Junior");
  const [yearsOfExp, setYearsOfExp] = useState(1);
  const [maxActiveCases, setMaxActiveCases] = useState(5);
  const [availability, setAvailability] = useState("AVAILABLE");
  
  // Case preferences
  const [canHandleSensitive, setCanHandleSensitive] = useState(false);
  const [womenTrained, setWomenTrained] = useState(false);
  const [priorityAvailable, setPriorityAvailable] = useState(false);
  const [contactHours, setContactHours] = useState("Anytime");

  // Communication preferences
  const [commPreferences, setCommPreferences] = useState({
    inApp: true,
    email: false,
    sms: false,
    whatsapp: false,
    safeMethod: "In-App Only",
    safeTime: "Anytime"
  });

  // Privacy preference
  const [defaultVisibility, setDefaultVisibility] = useState("VISIBLE");
  const [sensitiveShielding, setSensitiveShielding] = useState(true);
  const [preferWomanGuide, setPreferWomanGuide] = useState(false);
  const [hideContactFromGuide, setHideContactFromGuide] = useState(true);
  const [readAloudWarning, setReadAloudWarning] = useState(true);

  // Security
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [devices, setDevices] = useState([]);

  // Admin preferences
  const [autoRecommend, setAutoRecommend] = useState(true);
  const [womenPreferenceRule, setWomenPreferenceRule] = useState(true);
  const [workloadThreshold, setWorkloadThreshold] = useState(5);
  const [slaAlertThreshold, setSlaAlertThreshold] = useState(24);
  const [dashboardDensity, setDashboardDensity] = useState("Comfortable");

  // Accessibility/Theme
  const [fontSize, setFontSize] = useState("default");
  const [simpleMode, setSimpleMode] = useState(false);
  const [speechSpeed, setSpeechSpeed] = useState(1.0);
  const [readAloudEnabled, setReadAloudEnabled] = useState(false);

  // Modals / Reports
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const user = await userService.getMe();
      setCurrentUser(user);
      
      // Map basic info
      setName(user.name || "");
      setPhone(user.mobile || "");
      setDistrict(user.district || "");
      setLocality(user.address || "");
      setPreferredLang(user.preferredLanguage || "English");
      setAvatarUrl(user.avatarUrl || "");
      setTwoFactorEnabled(user.twoFactorEnabled || false);

      // Map volunteer specifics
      setLanguagesKnown(user.languagesKnown || "English");
      setSpecializations(user.specialization || "General Legal Aid");
      setExperienceLevel(user.experienceLevel || "Junior");
      setMaxActiveCases(user.maxActiveCases || 5);
      setAvailability(user.availabilityStatus || "AVAILABLE");
      setWomenTrained(user.womenSupportTrained || false);
      setCanHandleSensitive(user.canHandleSensitiveCases || false);
      
      // Load local settings
      const local = JSON.parse(localStorage.getItem("local_settings") || "{}");
      setFontSize(local.fontSize || "default");
      setSimpleMode(local.simpleMode || false);
      setSpeechSpeed(local.speechSpeed || 1.0);

      // Load devices
      const devList = await userService.getDevices();
      setDevices(devList || []);
    } catch (err) {
      toast.error("Failed to load settings profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, [role]);

  const handleSaveChanges = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name,
        mobile: phone,
        district,
        address: locality,
        preferredLanguage: preferredLang,
        languagesKnown,
        specialization: specializations,
        experienceLevel,
        maxActiveCases,
        availabilityStatus: availability,
        womenSupportTrained: womenTrained,
        canHandleSensitiveCases: canHandleSensitive
      };

      await userService.updateMe(payload);
      
      // Save local preferences
      localStorage.setItem("local_settings", JSON.stringify({
        fontSize,
        simpleMode,
        speechSpeed
      }));

      toast.success("Settings saved successfully!");
      loadUserProfile();
    } catch (err) {
      toast.error("Failed to update profile settings.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    try {
      await userService.changePassword(oldPassword, newPassword);
      toast.success("Password changed successfully.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password.");
    }
  };

  const handleToggle2fa = async () => {
    try {
      if (twoFactorEnabled) {
        await userService.disable2fa();
        setTwoFactorEnabled(false);
        toast.success("Two-Factor Authentication disabled.");
      } else {
        await userService.enable2fa();
        setTwoFactorEnabled(true);
        toast.success("Two-Factor Authentication enabled.");
      }
    } catch (err) {
      toast.error("Failed to update 2FA configuration.");
    }
  };

  const handleLogoutAll = async () => {
    try {
      await userService.logoutAllDevices();
      toast.success("Logged out from all other active sessions.");
      const updatedDevices = devices.filter(d => d.deviceName.includes("Current"));
      setDevices(updatedDevices);
    } catch (err) {
      toast.error("Failed to logout other sessions.");
    }
  };

  const handleDownloadReport = async () => {
    try {
      const data = await userService.downloadDataReport();
      setReportData(data);
      setShowReportModal(true);
      toast.success("Personal data report compiled!");
    } catch (err) {
      toast.error("Failed to download data report.");
    }
  };

  const handleDeleteRequest = async () => {
    try {
      const res = await userService.deleteAccountRequest();
      toast.success(res.message || "Account deletion request submitted.");
      setShowDeleteModal(false);
    } catch (err) {
      toast.error("Failed to submit deletion request.");
    }
  };

  // Get active tabs based on user role
  const getTabs = () => {
    if (role === "admin") {
      return [
        { id: "account", label: "Account", icon: User },
        { id: "security", label: "Security & 2FA", icon: Lock },
        { id: "system", label: "System Preferences", icon: Sliders },
        { id: "rules", label: "Case Assignment Rules", icon: Cpu },
        { id: "devices", label: "Connected Devices", icon: Smartphone },
        { id: "danger", label: "Danger Zone", icon: Trash2 }
      ];
    }
    if (role === "helper" || role === "volunteer") {
      return [
        { id: "account", label: "Profile", icon: User },
        { id: "professional", label: "Professional Info", icon: Award },
        { id: "preferences", label: "Case Preferences", icon: Sliders },
        { id: "communication", label: "Communication Alerts", icon: Bell },
        { id: "security", label: "Security & 2FA", icon: Lock },
        { id: "devices", label: "Connected Devices", icon: Smartphone },
        { id: "analytics", label: "Reports & Data", icon: FileText },
        { id: "danger", label: "Delete Account", icon: Trash2 }
      ];
    }
    // Default Public User (citizen)
    return [
      { id: "account", label: "Account", icon: User },
      { id: "communication", label: "Communication Preferences", icon: Bell },
      { id: "privacy", label: "Privacy & Safety", icon: Shield },
      { id: "security", label: "Security & 2FA", icon: Lock },
      { id: "devices", label: "Connected Devices", icon: Smartphone },
      { id: "appearance", label: "Appearance & Accessibility", icon: Paintbrush },
      { id: "data", label: "Data Report & Export", icon: FileText },
      { id: "danger", label: "Delete Account", icon: Trash2 }
    ];
  };

  const currentTabs = getTabs();

  const toggleAccordion = (tabId) => {
    setExpandedAccordions(prev => ({
      ...prev,
      [tabId]: !prev[tabId]
    }));
  };

  // Render components for each tab
  const renderTabContent = (tabId) => {
    switch (tabId) {
      case "account":
        return (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 px-4 text-xs font-medium focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Email (Read-only)</label>
                <input
                  type="email"
                  value={currentUser?.email || ""}
                  readOnly
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 px-4 text-xs font-medium bg-slate-100 text-slate-400 outline-none cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 px-4 text-xs font-medium focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">District / Area</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 px-4 text-xs font-medium focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Area / Locality Address</label>
              <input
                type="text"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-slate-200 px-4 text-xs font-medium focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Preferred Language</label>
              <select
                value={preferredLang}
                onChange={(e) => setPreferredLang(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3 text-xs font-semibold focus:border-indigo-500 outline-none bg-white cursor-pointer"
              >
                <option value="English">English</option>
                <option value="Tamil">Tamil</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>
          </div>
        );

      case "communication":
        return (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Configure Channels</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  checked={commPreferences.inApp}
                  onChange={(e) => setCommPreferences({ ...commPreferences, inApp: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold text-slate-600">In-App Notifications</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  checked={commPreferences.email}
                  onChange={(e) => setCommPreferences({ ...commPreferences, email: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold text-slate-600">Email Notifications</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  checked={commPreferences.sms}
                  onChange={(e) => setCommPreferences({ ...commPreferences, sms: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold text-slate-600">SMS Notifications</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  checked={commPreferences.whatsapp}
                  onChange={(e) => setCommPreferences({ ...commPreferences, whatsapp: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold text-slate-600">WhatsApp Updates</span>
              </label>
            </div>
            {role === "citizen" && (
              <div className="pt-4 border-t space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Safe Contact Channel</label>
                  <select
                    value={commPreferences.safeMethod}
                    onChange={(e) => setCommPreferences({ ...commPreferences, safeMethod: e.target.value })}
                    className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3 text-xs font-semibold focus:border-indigo-500 outline-none bg-white"
                  >
                    <option value="In-App Only">In-App Only (Recommended)</option>
                    <option value="Phone">Phone</option>
                    <option value="Email">Email</option>
                    <option value="WhatsApp">WhatsApp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Preferred Contact Hours</label>
                  <select
                    value={commPreferences.safeTime}
                    onChange={(e) => setCommPreferences({ ...commPreferences, safeTime: e.target.value })}
                    className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3 text-xs font-semibold focus:border-indigo-500 outline-none bg-white"
                  >
                    <option value="Anytime">Anytime</option>
                    <option value="Morning">Morning (9 AM - 12 PM)</option>
                    <option value="Afternoon">Afternoon (12 PM - 4 PM)</option>
                    <option value="Evening">Evening (4 PM - 8 PM)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        );

      case "privacy":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Default Identity Visibility Shield</label>
              <select
                value={defaultVisibility}
                onChange={(e) => setDefaultVisibility(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3 text-xs font-semibold focus:border-indigo-500 outline-none bg-white"
              >
                <option value="VISIBLE">VISIBLE (Reveal my name details)</option>
                <option value="PARTIAL">PARTIAL (Mask name, reveal location only)</option>
                <option value="HIDDEN">HIDDEN (Fully anonymous status)</option>
              </select>
            </div>
            <div className="space-y-3 pt-3 border-t">
              <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  checked={sensitiveShielding}
                  onChange={(e) => setSensitiveShielding(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold text-slate-600">Enforce sensitive case shielding rules</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  checked={preferWomanGuide}
                  onChange={(e) => setPreferWomanGuide(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold text-slate-600">Prefer female Legal Guides for sensitive complaints</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  checked={hideContactFromGuide}
                  onChange={(e) => setHideContactFromGuide(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold text-slate-600">Mask phone & email from Legal Guides by default</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  checked={readAloudWarning}
                  onChange={(e) => setReadAloudWarning(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold text-slate-600">Warn before reading sensitive complaints aloud</span>
              </label>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            {/* Change password */}
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide border-b pb-1.5">Change Password</h4>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Current Password</label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full min-h-[44px] rounded-xl border border-slate-200 px-4 text-xs font-medium focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">New Password</label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full min-h-[44px] rounded-xl border border-slate-200 px-4 text-xs font-medium focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Confirm New Password</label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full min-h-[44px] rounded-xl border border-slate-200 px-4 text-xs font-medium focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-500">
                  <input
                    type="checkbox"
                    checked={showPasswords}
                    onChange={(e) => setShowPasswords(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  Show Passwords
                </label>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-xl bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold transition cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>

            {/* 2FA Toggle */}
            <div className="pt-6 border-t space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Two-Factor Authentication (2FA)</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Add an extra layer of security to your account. When enabled, signing in will require your credentials and a secondary OTP code.
              </p>
              <button
                type="button"
                onClick={handleToggle2fa}
                className={`min-h-[44px] px-6 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                  twoFactorEnabled 
                    ? "bg-red-50 hover:bg-red-100 text-red-700 border border-red-100" 
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
              >
                {twoFactorEnabled ? "Disable Two-Factor Auth" : "Enable Two-Factor Auth"}
              </button>
            </div>
          </div>
        );

      case "professional":
        return (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Languages Handled</label>
                <input
                  type="text"
                  value={languagesKnown}
                  onChange={(e) => setLanguagesKnown(e.target.value)}
                  placeholder="e.g. English, Tamil, Hindi"
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 px-4 text-xs font-medium focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Specialization Areas</label>
                <input
                  type="text"
                  value={specializations}
                  onChange={(e) => setSpecializations(e.target.value)}
                  placeholder="e.g. Labour Dispute, Cyber Crime"
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 px-4 text-xs font-medium focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3 text-xs font-semibold focus:border-indigo-500 outline-none bg-white cursor-pointer"
                >
                  <option value="Junior">Junior Guide (1-3 Years)</option>
                  <option value="Intermediate">Intermediate Guide (3-6 Years)</option>
                  <option value="Senior">Senior Guide (6+ Years)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Maximum Active Case Capacity</label>
                <input
                  type="number"
                  value={maxActiveCases}
                  onChange={(e) => setMaxActiveCases(Number(e.target.value))}
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 px-4 text-xs font-medium focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Current Availability Status</label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3 text-xs font-semibold focus:border-indigo-500 outline-none bg-white cursor-pointer"
              >
                <option value="AVAILABLE">🟢 AVAILABLE (Accepting new case assignments)</option>
                <option value="BUSY">🟡 BUSY (Mediation ongoing / Hide recommendations)</option>
                <option value="AWAY">🔵 AWAY (Away / Pause new cases)</option>
                <option value="PAUSED">⏸️ PAUSED (Paused case intake)</option>
                <option value="OFFLINE">🔴 OFFLINE (Not taking cases)</option>
              </select>
            </div>
          </div>
        );

      case "preferences":
        return (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide border-b pb-1.5">Case Triage Capabilities</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  checked={canHandleSensitive}
                  onChange={(e) => setCanHandleSensitive(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold text-slate-600">Capable of handling sensitive/harassment cases</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  checked={womenTrained}
                  onChange={(e) => setWomenTrained(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold text-slate-600">Women Support Trained Certification active</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  checked={priorityAvailable}
                  onChange={(e) => setPriorityAvailable(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold text-slate-600">Available for urgent/critical triage review</span>
              </label>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 mt-3">Preferred Consultation Hours</label>
              <select
                value={contactHours}
                onChange={(e) => setContactHours(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3 text-xs font-semibold focus:border-indigo-500 outline-none bg-white cursor-pointer"
              >
                <option value="Anytime">Anytime during working hours</option>
                <option value="Morning">Morning Only (9 AM - 1 PM)</option>
                <option value="Afternoon">Afternoon Only (1 PM - 5 PM)</option>
              </select>
            </div>
          </div>
        );

      case "system":
        return (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide border-b pb-1.5">System Wide Settings</h4>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">System Language</label>
              <select
                value={preferredLang}
                onChange={(e) => setPreferredLang(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3 text-xs font-semibold focus:border-indigo-500 outline-none bg-white"
              >
                <option value="English">English</option>
                <option value="Tamil">Tamil</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Dashboard Render Density</label>
              <select
                value={dashboardDensity}
                onChange={(e) => setDashboardDensity(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3 text-xs font-semibold focus:border-indigo-500 outline-none bg-white"
              >
                <option value="Comfortable">Comfortable (Standard spacings)</option>
                <option value="Compact">Compact (High density grids)</option>
              </select>
            </div>
          </div>
        );

      case "rules":
        return (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide border-b pb-1.5">Triage & Assignment Configuration</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  checked={autoRecommend}
                  onChange={(e) => setAutoRecommend(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold text-slate-600">Enable Auto AI Recommendations</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  checked={womenPreferenceRule}
                  onChange={(e) => setWomenPreferenceRule(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold text-slate-600">Enforce women-sensitive certified assignment preferences</span>
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Max Guide Workload Threshold</label>
                <input
                  type="number"
                  value={workloadThreshold}
                  onChange={(e) => setWorkloadThreshold(Number(e.target.value))}
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 px-4 text-xs font-medium focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">SLA Alert Threshold (Hours)</label>
                <input
                  type="number"
                  value={slaAlertThreshold}
                  onChange={(e) => setSlaAlertThreshold(Number(e.target.value))}
                  className="w-full min-h-[44px] rounded-xl border border-slate-200 px-4 text-xs font-medium focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>
        );

      case "devices":
        return (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Connected Devices</h4>
            <div className="space-y-3">
              {devices.map((d, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 border border-slate-200 bg-slate-50/50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Smartphone className="text-slate-400 shrink-0" size={18} />
                    <div>
                      <h5 className="font-bold text-xs text-slate-800">{d.deviceName}</h5>
                      <p className="text-[10px] text-slate-400 font-medium">Browser: {d.browser} • Last login: {new Date(d.lastLogin).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">{d.ipAddress}</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleLogoutAll}
              className="mt-2 min-h-[44px] w-full border border-slate-300 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Logout From All Other Devices
            </button>
          </div>
        );

      case "appearance":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Interface Color Scheme</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3 text-xs font-semibold focus:border-indigo-500 outline-none bg-white cursor-pointer"
              >
                <option value="LIGHT">Light Scheme</option>
                <option value="DARK">Dark Scheme</option>
                <option value="SYSTEM">System Default</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Accessibility Font Scaling</label>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-slate-200 px-3 text-xs font-semibold focus:border-indigo-500 outline-none bg-white cursor-pointer"
              >
                <option value="default">Default sizing</option>
                <option value="large">Large text (120%)</option>
                <option value="xlarge">Extra Large (150%)</option>
              </select>
            </div>
            <div className="space-y-3 pt-3 border-t">
              <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  checked={simpleMode}
                  onChange={(e) => setSimpleMode(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold text-slate-600">Simple Mode (Removes high-contrast headers)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  checked={readAloudEnabled}
                  onChange={(e) => setReadAloudEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold text-slate-600">Enable Voice Read-Aloud for timelines</span>
              </label>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Speech Read-Aloud Velocity</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={speechSpeed}
                  onChange={(e) => setSpeechSpeed(Number(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <span className="text-xs font-bold text-slate-600 w-10 text-right">{speechSpeed.toFixed(1)}x</span>
              </div>
            </div>
          </div>
        );

      case "data":
      case "analytics":
        return (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide border-b pb-1.5">Personal Data Exports</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Export your profile preferences and triage log summaries. In accordance with platform privacy regulations, personal credentials can be requested for offline review.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleDownloadReport}
                className="min-h-[44px] bg-slate-905 hover:bg-slate-950 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
              >
                <FileText size={15} /> Download Profile Data Report
              </button>
              <button
                type="button"
                onClick={() => toast.success("Grievance log summary Excel file initiated.")}
                className="min-h-[44px] border border-slate-300 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
              >
                <FileText size={15} /> Export Complaint History Excel
              </button>
            </div>
          </div>
        );

      case "danger":
        return (
          <div className="p-5 border border-red-200 rounded-2xl bg-red-50/50 space-y-4">
            <h4 className="text-xs font-extrabold text-red-705 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle size={16} /> Danger Zone
            </h4>
            <p className="text-[11px] text-red-655 leading-relaxed font-semibold">
              Warning: Requesting account deletion will queue your profile details for deactivation. In compliance with case logs and audit trails, legal complaint documentation remains archived.
            </p>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="min-h-[44px] px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold transition cursor-pointer flex items-center gap-2"
            >
              <Trash2 size={15} /> Request Account Deletion
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center text-slate-400 text-xs font-semibold gap-2">
        <RefreshCw size={16} className="animate-spin" /> Loading Settings Center...
      </div>
    );
  }

  return (
    <div className="relative">
      {isMobile ? (
        /* Mobile Stacked Accordion Layout */
        <div className="space-y-3 pb-24">
          {currentTabs.map(tab => {
            const TabIcon = tab.icon;
            const expanded = !!expandedAccordions[tab.id];
            return (
              <div key={tab.id} className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => toggleAccordion(tab.id)}
                  className="w-full min-h-[44px] px-4 py-3 flex items-center justify-between text-left font-extrabold text-xs text-slate-800 bg-slate-50/50 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <TabIcon size={16} className="text-slate-500" />
                    {tab.label}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{expanded ? "Hide" : "Open"}</span>
                </button>
                {expanded && (
                  <div className="p-4 border-t border-slate-100 bg-white">
                    {renderTabContent(tab.id)}
                  </div>
                )}
              </div>
            );
          })}

          {/* Sticky bottom mobile Save changes bar */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-6 py-3.5 flex gap-3 shadow-2xl">
            <button
              onClick={handleSaveChanges}
              disabled={saving}
              className="flex-1 min-h-[44px] rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-2"
            >
              {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        /* Desktop Sidebar Tabs Layout */
        <div className="grid grid-cols-[240px_1fr] gap-8 items-start pb-12">
          {/* Side tabs */}
          <div className="flex flex-col gap-1.5 bg-slate-50 p-2 rounded-3xl border border-slate-200 shadow-sm">
            {currentTabs.map(tab => {
              const TabIcon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 h-10 px-4 rounded-xl text-xs font-extrabold cursor-pointer transition text-left ${
                    active 
                      ? "bg-white text-indigo-700 shadow-sm border border-slate-100" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <TabIcon size={15} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab content panel */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
            <h3 className="font-extrabold text-sm uppercase text-slate-800 tracking-wider">
              {currentTabs.find(t => t.id === activeTab)?.label} Settings
            </h3>
            
            {renderTabContent(activeTab)}

            {activeTab !== "security" && activeTab !== "devices" && activeTab !== "danger" && activeTab !== "data" && (
              <div className="pt-6 border-t flex justify-end">
                <button
                  onClick={handleSaveChanges}
                  disabled={saving}
                  className="min-h-[44px] px-8 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl transition cursor-pointer flex items-center gap-2 shadow-sm"
                >
                  {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete account confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm uppercase flex items-center gap-1.5 text-red-600">
              <AlertTriangle size={18} /> Request Account Deletion
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Are you sure you want to request account deletion? Your personal credentials and access will be removed. In compliance with legal audits, all complaint history and audit trails are archived.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="h-10 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteRequest} 
                className="h-10 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
              >
                Delete Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data report viewer modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase">Personal Data Report</h3>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            <textarea
              readOnly
              value={JSON.stringify(reportData, null, 2)}
              className="w-full h-60 border border-slate-200 rounded-xl p-4 text-xs font-mono outline-none bg-slate-50 select-text"
            />
            <div className="flex justify-end">
              <button 
                onClick={() => setShowReportModal(false)} 
                className="h-10 px-6 rounded-xl bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
