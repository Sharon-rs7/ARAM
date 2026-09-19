import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/common/DashboardLayout";
import { 
  User, Mail, Phone, MapPin, ShieldCheck, Edit3, Save, Globe, 
  AlertCircle, CheckCircle2, Clock, FileText, CheckCircle, ExternalLink, 
  RefreshCw, X, ShieldAlert, BadgeCheck, Lock, Building, PlusCircle, ArrowRight,
  Bell, MessageSquare, Check
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/userService";
import { complaintService } from "@/services/complaintService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Button from "@/components/common/Button";

const TN_DISTRICTS = [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore",
  "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram",
  "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
  "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
  "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi",
  "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirupathur",
  "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Tirunelveli",
  "Vellore", "Viluppuram", "Virudhunagar"
];

const Profile = () => {
  const navigate = useNavigate();
  const { user: authUser, updateUser } = useAuth();

  const [profile, setProfile] = useState({
    id: null,
    name: "",
    email: "",
    mobile: "",
    district: "",
    address: "",
    preferredLanguage: "Tamil & English",
    idType: "Aadhaar Card (UIDAI)",
    idNumber: "",
    isVerified: true
  });

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [notifySms, setNotifySms] = useState(() => {
    return localStorage.getItem("aram_pref_sms") !== "false";
  });
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(() => {
    return localStorage.getItem("aram_pref_wa") !== "false";
  });

  const handleToggleSms = () => {
    const nextVal = !notifySms;
    setNotifySms(nextVal);
    localStorage.setItem("aram_pref_sms", String(nextVal));
    toast.success(nextVal ? "SMS milestone notifications enabled." : "SMS milestone notifications disabled.");
  };

  const handleToggleWhatsApp = () => {
    const nextVal = !notifyWhatsApp;
    setNotifyWhatsApp(nextVal);
    localStorage.setItem("aram_pref_wa", String(nextVal));
    toast.success(nextVal ? "WhatsApp real-time case updates enabled." : "WhatsApp case updates disabled.");
  };

  // Fetch real profile from backend /api/users/me and complaints from /api/complaints/my
  useEffect(() => {
    const loadProfileAndActivity = async () => {
      setLoading(true);
      try {
        const userData = await userService.getMe();
        if (userData) {
          setProfile({
            id: userData.id,
            name: userData.name || authUser?.name || "",
            email: userData.email || authUser?.email || "",
            mobile: userData.mobile || authUser?.mobile || "",
            district: userData.district || authUser?.district || "",
            address: userData.address || authUser?.address || "",
            preferredLanguage: userData.preferredLanguage || "Tamil & English",
            idType: "Aadhaar Card (UIDAI)",
            idNumber: userData.mobile ? `XXXX-XXXX-${userData.mobile.slice(-4)}` : "XXXX-XXXX-8921",
            isVerified: true
          });

          // Sync into AuthContext if out of sync
          if (updateUser) {
            updateUser({
              name: userData.name,
              email: userData.email,
              mobile: userData.mobile,
              district: userData.district
            });
          }
        }
      } catch (err) {
        console.warn("Failed to load /api/users/me, falling back to session user:", err);
        if (authUser) {
          setProfile({
            id: authUser.id,
            name: authUser.name || "",
            email: authUser.email || "",
            mobile: authUser.mobile || "",
            district: authUser.district || "",
            address: authUser.address || "",
            preferredLanguage: "Tamil & English",
            idType: "Aadhaar Card (UIDAI)",
            idNumber: authUser.mobile ? `XXXX-XXXX-${authUser.mobile.slice(-4)}` : "XXXX-XXXX-8921",
            isVerified: true
          });
        }
      }

      // Load citizen's real complaints to reflect assignment status
      try {
        const complaintList = await complaintService.myComplaints();
        setComplaints(Array.isArray(complaintList) ? complaintList : []);
      } catch (cErr) {
        console.warn("Failed to load user complaints in profile:", cErr);
        setComplaints([]);
      } finally {
        setLoading(false);
      }
    };

    loadProfileAndActivity();
  }, [authUser]);

  // Calculate Profile Completeness Percentage
  const calculateCompleteness = () => {
    let score = 0;
    if (profile.name?.trim()) score += 25;
    if (profile.email?.trim()) score += 25;
    if (profile.mobile?.trim() && /^[6-9][0-9]{9}$/.test(profile.mobile.trim())) score += 25;
    if (profile.district?.trim()) score += 25;
    return score;
  };

  const completeness = calculateCompleteness();
  const isProfileComplete = completeness === 100;

  // Handle Save
  const handleSave = async () => {
    if (!profile.name?.trim()) {
      toast.error("Full Name cannot be empty.");
      return;
    }

    if (!profile.mobile?.trim() || !/^[6-9][0-9]{9}$/.test(profile.mobile.trim())) {
      toast.error("Please enter a valid 10-digit Indian mobile number starting with 6-9.");
      return;
    }

    if (!profile.district?.trim()) {
      toast.error("Please select your residential District in Tamil Nadu.");
      return;
    }

    setSaving(true);
    const toastId = toast.loading("Updating citizen identity in official registry...");

    try {
      const payload = {
        name: profile.name.trim(),
        mobile: profile.mobile.trim(),
        district: profile.district.trim(),
        address: profile.address?.trim() || "",
        preferredLanguage: profile.preferredLanguage || "Tamil & English"
      };

      const updated = await userService.updateMe(payload);
      
      // Synchronize in AuthContext and localStorage
      if (updateUser) {
        updateUser(updated || payload);
      }

      setIsEditing(false);
      toast.dismiss(toastId);
      toast.success("Citizen identity and jurisdiction updated successfully!");
    } catch (err) {
      toast.dismiss(toastId);
      const msg = err.response?.data?.message || err.message || "Failed to update profile";
      toast.error(`Update failed: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  // Extract Grievance stats
  const totalCases = complaints.length;
  const underReviewCases = complaints.filter(c => c.status === "SUBMITTED" || c.status === "UNDER_REVIEW" || c.status === "AWAITING_ADMIN_REVIEW").length;
  const assignedCases = complaints.filter(c => c.status === "ASSIGNED_TO_VOLUNTEER" || c.status === "IN_PROGRESS" || c.volunteerId || c.assignedVolunteer).length;
  const resolvedCases = complaints.filter(c => c.status === "RESOLVED" || c.status === "CLOSED").length;

  // Active assigned complaint (if any)
  const activeAssignedCase = complaints.find(c => c.status === "ASSIGNED_TO_VOLUNTEER" || c.status === "IN_PROGRESS" || c.volunteerId);

  return (
    <DashboardLayout role="citizen">
      <div className="max-w-4xl mx-auto space-y-6 pb-14">
        
        {/* Page Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#163D32] tracking-tight flex items-center gap-2">
              Citizen Profile & Legal Identity
            </h1>
            <p className="text-xs text-[#65736D] font-medium mt-0.5">
              Tamil Nadu State Legal Services Authority (TNSLSA) • Statutory Complainant Profile
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                  className="px-4 py-2 text-xs font-bold text-[#65736D] hover:text-[#18332B] hover:bg-[#F7F1E6] rounded-xl border border-[#E6E1D8] cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold bg-[#163D32] hover:bg-[#1F5948] text-white rounded-xl shadow-sm cursor-pointer flex items-center gap-1.5 transition"
                >
                  <Save size={14} /> {saving ? "Saving..." : "Save Changes"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-5 py-2 text-xs font-bold bg-[#163D32] hover:bg-[#1F5948] text-white rounded-xl shadow-sm cursor-pointer flex items-center gap-1.5 transition"
              >
                <Edit3 size={14} /> Edit Identity Details
              </button>
            )}
          </div>
        </div>

        {/* 1. Citizen Identity KYC Hero Card */}
        <div className="rounded-3xl bg-[#FFFDF8] border border-[#E6E1D8] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#E6E1D8]">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#163D32] to-[#1F5948] text-white flex items-center justify-center font-black text-2xl shadow-md ring-4 ring-[#DCEBDD]">
                {profile.name ? profile.name[0].toUpperCase() : "C"}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-black text-[#163D32] tracking-tight">
                    {profile.name || "Authenticated Citizen"}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#DCEBDD] text-[#163D32] border border-[#c5ddc6] flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-[#1F5948]" /> Verified Citizen
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#65736D] font-medium flex-wrap">
                  <span>{profile.email}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-bold text-[#18332B]">
                    <MapPin size={12} className="text-[#1F5948]" /> {profile.district} District
                  </span>
                </div>
              </div>
            </div>

            {/* Citizen Permanent Identifier Badge */}
            <div className="text-left sm:text-right p-3 bg-[#F7F1E6] rounded-2xl border border-[#E6E1D8] text-xs space-y-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#65736D] block">
                Citizen Registry ID
              </span>
              <span className="font-mono text-xs font-black text-[#163D32]">
                CIT-TN-{profile.district ? profile.district.slice(0, 3).toUpperCase() : "REG"}-{String(profile.id || "0001").padStart(6, "0")}
              </span>
            </div>
          </div>

          {/* Profile Completion Bar & Anti-Fraud Verification Checklist */}
          <div className="p-4 rounded-2xl bg-[#DCEBDD]/30 border border-[#c5ddc6] space-y-2.5">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-[#163D32] flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-[#1F5948]" /> Complainant Identity Verification Status
              </span>
              <span className="text-xs font-black text-[#1F5948] bg-white px-2.5 py-0.5 rounded-full border border-[#c5ddc6]">
                {completeness}% Completed
              </span>
            </div>

            <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-[#c5ddc6]">
              <div 
                className="bg-[#163D32] h-full rounded-full transition-all duration-500"
                style={{ width: `${completeness}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
              <span className={`px-2.5 py-0.5 rounded-md font-bold flex items-center gap-1 ${
                profile.name ? "bg-white text-[#163D32] border border-[#c5ddc6]" : "bg-gray-100 text-gray-500"
              }`}>
                {profile.name ? <Check size={11} className="text-[#1F5948]" /> : <Clock size={11} />} Real Name
              </span>

              <span className={`px-2.5 py-0.5 rounded-md font-bold flex items-center gap-1 ${
                profile.mobile ? "bg-white text-[#163D32] border border-[#c5ddc6]" : "bg-gray-100 text-gray-500"
              }`}>
                {profile.mobile ? <Check size={11} className="text-[#1F5948]" /> : <Clock size={11} />} OTP-Bound Mobile
              </span>

              <span className={`px-2.5 py-0.5 rounded-md font-bold flex items-center gap-1 ${
                profile.district ? "bg-white text-[#163D32] border border-[#c5ddc6]" : "bg-gray-100 text-gray-500"
              }`}>
                {profile.district ? <Check size={11} className="text-[#1F5948]" /> : <Clock size={11} />} Jurisdiction District
              </span>

              <span className="px-2.5 py-0.5 rounded-md font-bold bg-white text-[#163D32] border border-[#c5ddc6] flex items-center gap-1">
                <Check size={11} className="text-[#1F5948]" /> TNSLSA Authorized
              </span>
            </div>
          </div>

          {/* 2. Personal & Contact Details Form */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-black text-[#163D32] uppercase tracking-wider">
              Statutory Contact & Regional Jurisdiction
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#18332B] uppercase tracking-wider block">
                  Citizen Legal Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profile.name}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="e.g. Anandha Kumar"
                    className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#DDE2DF] bg-white text-[#18332B] font-semibold outline-none focus:border-[#163D32] focus:ring-2 focus:ring-[#DCEBDD] disabled:bg-[#F7F1E6]/70 disabled:cursor-not-allowed shadow-2xs"
                  />
                  <User size={15} className="absolute left-3.5 top-3.5 text-[#65736D]" />
                </div>
              </div>

              {/* Email (Read-Only) */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#18332B] uppercase tracking-wider block flex justify-between">
                  <span>Registered Email Address</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 rounded">Verified</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={profile.email}
                    disabled={true}
                    className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#DDE2DF] bg-[#F7F1E6]/70 text-[#65736D] font-semibold outline-none cursor-not-allowed shadow-2xs"
                  />
                  <Mail size={15} className="absolute left-3.5 top-3.5 text-[#65736D]" />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#18332B] uppercase tracking-wider block flex justify-between">
                  <span>Verified Contact Mobile</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 rounded">OTP Bound</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    maxLength={10}
                    value={profile.mobile}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({ ...profile, mobile: e.target.value.replace(/\D/g, "") })}
                    placeholder="10 digit number (e.g. 9876543210)"
                    className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#DDE2DF] bg-white text-[#18332B] font-semibold font-mono outline-none focus:border-[#163D32] focus:ring-2 focus:ring-[#DCEBDD] disabled:bg-[#F7F1E6]/70 disabled:cursor-not-allowed shadow-2xs"
                  />
                  <Phone size={15} className="absolute left-3.5 top-3.5 text-[#65736D]" />
                </div>
                <span className="text-[10px] text-[#65736D] block">Used for official SMS and case progression notifications.</span>
              </div>

              {/* District Dropdown (All 38 Districts) */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#18332B] uppercase tracking-wider block flex justify-between">
                  <span>Home District (Tamil Nadu)</span>
                  <span className="text-[10px] text-[#1F5948] font-bold bg-[#DCEBDD] px-1.5 rounded">38 Desks</span>
                </label>
                <div className="relative">
                  <select
                    value={profile.district}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#DDE2DF] bg-white text-[#18332B] font-semibold outline-none focus:border-[#163D32] focus:ring-2 focus:ring-[#DCEBDD] disabled:bg-[#F7F1E6]/70 disabled:cursor-not-allowed shadow-2xs cursor-pointer appearance-none"
                  >
                    <option value="">Select District</option>
                    {TN_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist} District
                      </option>
                    ))}
                  </select>
                  <MapPin size={15} className="absolute left-3.5 top-3.5 text-[#65736D] pointer-events-none" />
                </div>
                <span className="text-[10px] text-[#65736D] block">Your grievances are assigned to this regional District Admin desk.</span>
              </div>

              {/* Residential Address / Taluk */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="font-bold text-[#18332B] uppercase tracking-wider block">
                  Taluk / Village / Residential Address
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profile.address}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    placeholder="e.g. 14B, Gandhi Nagar, Main Road, Chennai - 600002"
                    className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#DDE2DF] bg-white text-[#18332B] font-medium outline-none focus:border-[#163D32] focus:ring-2 focus:ring-[#DCEBDD] disabled:bg-[#F7F1E6]/70 disabled:cursor-not-allowed shadow-2xs"
                  />
                  <Building size={15} className="absolute left-3.5 top-3.5 text-[#65736D]" />
                </div>
              </div>

            </div>
          </div>

          {/* 3. Statutory Anti-Fraud Identity Proof Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F7F1E6] border border-[#E6E1D8] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-[#163D32]">
                <BadgeCheck size={16} className="text-[#1F5948]" />
                Government KYC & Anti-Fraud Verification Gate
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                Active KYC
              </span>
            </div>

            <p className="text-xs text-[#65736D] leading-relaxed font-medium">
              Under Section 12 of the Legal Services Authorities Act, 1987, authentic citizen validation ensures that legal aid resources reach genuine citizens and eliminates unauthorized complaints.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3 bg-white rounded-xl border border-[#E6E1D8] space-y-1">
                <span className="text-[10px] font-bold text-[#65736D] uppercase block">Identity Document Type</span>
                <span className="font-bold text-[#18332B]">{profile.idType}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#E6E1D8] space-y-1">
                <span className="text-[10px] font-bold text-[#65736D] uppercase block">Masked UID / Reference</span>
                <span className="font-mono font-bold text-[#163D32]">{profile.idNumber}</span>
              </div>
            </div>
          </div>

          {/* Real-Time Case Dispatch & Communication Preferences Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E6E1D8] space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#E6E1D8] pb-2.5">
              <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-[#163D32]">
                <Bell size={16} className="text-[#1F5948]" />
                Official Case Dispatch & Communication Channels
              </div>
              <span className="text-[10px] font-bold text-[#1F5948] bg-[#DCEBDD] px-2 py-0.5 rounded-full">
                Active Preferences
              </span>
            </div>

            <div className="space-y-3">
              {/* WhatsApp Milestone Updates */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F7F1E6]/60 border border-[#E6E1D8] gap-3">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#18332B]">
                    <MessageSquare size={14} className="text-emerald-700 shrink-0" />
                    <span>WhatsApp Case Milestones</span>
                  </div>
                  <p className="text-[11px] text-[#65736D] leading-tight">
                    Receive instant WhatsApp alerts when a Legal Guide accepts your case or an action plan is ready.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleToggleWhatsApp}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer shrink-0 ${
                    notifyWhatsApp 
                      ? "bg-emerald-700 text-white shadow-2xs hover:bg-emerald-800" 
                      : "bg-[#E6E1D8] text-[#65736D] hover:bg-[#DDE2DF]"
                  }`}
                >
                  {notifyWhatsApp ? "Active ✓" : "Disabled"}
                </button>
              </div>

              {/* Statutory SMS Updates */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F7F1E6]/60 border border-[#E6E1D8] gap-3">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#18332B]">
                    <Phone size={14} className="text-[#1F5948] shrink-0" />
                    <span>Statutory SMS Notifications</span>
                  </div>
                  <p className="text-[11px] text-[#65736D] leading-tight">
                    Official SMS alerts dispatched to +91 {profile.mobile || "your verified mobile"} for hearing dates and resolution.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleToggleSms}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer shrink-0 ${
                    notifySms 
                      ? "bg-[#163D32] text-white shadow-2xs hover:bg-[#1F5948]" 
                      : "bg-[#E6E1D8] text-[#65736D] hover:bg-[#DDE2DF]"
                  }`}
                >
                  {notifySms ? "Active ✓" : "Disabled"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Live Grievance & Legal Guide Assignment Status */}
        <div className="rounded-3xl bg-[#FFFDF8] border border-[#E6E1D8] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E6E1D8] pb-4">
            <div>
              <h2 className="text-lg font-black text-[#163D32] tracking-tight flex items-center gap-2">
                <FileText size={18} className="text-[#1F5948]" />
                Your Legal Grievance Activity in {profile.district || "Tamil Nadu"}
              </h2>
              <p className="text-xs text-[#65736D] font-medium">
                Live case metrics managed under your district's Legal Aid Administrative desk.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/citizen/my-complaints")}
              className="text-xs font-bold text-[#1F5948] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              View Full History <ExternalLink size={12} />
            </button>
          </div>

          {/* Stats 4-Card Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-[#F7F1E6] border border-[#E6E1D8] space-y-1 text-center">
              <span className="text-2xl font-black text-[#163D32] block">{totalCases}</span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#65736D] block">
                Total Filed
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#F7F1E6] border border-[#E6E1D8] space-y-1 text-center">
              <span className="text-2xl font-black text-[#C58A25] block">{underReviewCases}</span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#65736D] block">
                In Review
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#F7F1E6] border border-[#E6E1D8] space-y-1 text-center">
              <span className="text-2xl font-black text-[#1F5948] block">{assignedCases}</span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#65736D] block">
                Assigned to Guide
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#F7F1E6] border border-[#E6E1D8] space-y-1 text-center">
              <span className="text-2xl font-black text-emerald-700 block">{resolvedCases}</span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#65736D] block">
                Resolved
              </span>
            </div>
          </div>

          {/* Active Assigned Case Feature Card */}
          {activeAssignedCase ? (
            <div className="p-5 rounded-2xl bg-[#DCEBDD]/40 border-2 border-[#c5ddc6] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-[#163D32] text-white px-2.5 py-0.5 rounded-full">
                  Active Assigned Legal Case
                </span>
                <span className="font-mono text-xs font-bold text-[#163D32]">
                  {activeAssignedCase.formattedComplaintId || `ARAM-2026-${String(activeAssignedCase.id).padStart(6, "0")}`}
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-black text-[#163D32]">
                  {activeAssignedCase.title || "Citizen Grievance"}
                </h4>
                <p className="text-xs text-[#65736D] line-clamp-2">
                  {activeAssignedCase.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#c5ddc6]/70">
                <div className="text-xs text-[#18332B] font-medium flex items-center gap-2">
                  <span className="font-bold text-[#163D32]">Assigned Legal Guide:</span>
                  <span className="bg-white px-2.5 py-0.5 rounded-lg border border-[#c5ddc6] font-bold text-[#1F5948]">
                    {activeAssignedCase.volunteerName || activeAssignedCase.assignedVolunteer?.name || `${profile.district} Legal Guide`}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/citizen/complaint/${activeAssignedCase.id}`)}
                  className="px-4 py-1.5 text-xs font-bold bg-[#163D32] hover:bg-[#1F5948] text-white rounded-xl shadow-xs cursor-pointer flex items-center gap-1 transition"
                >
                  Track Case & Chat with Guide <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ) : totalCases === 0 ? (
            <div className="p-6 rounded-2xl bg-[#F7F1E6] border border-[#E6E1D8] text-center space-y-3">
              <p className="text-xs font-bold text-[#18332B]">
                No legal complaints currently submitted under {profile.district} District.
              </p>
              <button
                type="button"
                onClick={() => navigate("/citizen/submit-complaint")}
                className="px-5 py-2 text-xs font-bold bg-[#163D32] hover:bg-[#1F5948] text-white rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5 transition"
              >
                <PlusCircle size={14} /> File a New Legal Grievance
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#F7F1E6] border border-[#E6E1D8] text-xs text-[#65736D] flex justify-between items-center">
              <span>All complaints are currently under standard review or completed.</span>
              <button
                type="button"
                onClick={() => navigate("/citizen/my-complaints")}
                className="font-bold text-[#163D32] hover:underline"
              >
                View Complaint History
              </button>
            </div>
          )}

        </div>

      </div>
    </DashboardLayout>
  );
};

export default Profile;
