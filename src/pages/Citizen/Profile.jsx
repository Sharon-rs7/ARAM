import DashboardLayout from "@/components/layout/DashboardLayout";
import { User, Mail, Phone, MapPin, ShieldCheck, Camera, Edit, Save, X, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../services/userService";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const { user: authUser, saveAuth } = useAuth();
  
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    mobile: "",
    district: "",
    address: "",
    preferredLanguage: "English",
    bio: "",
    avatarUrl: ""
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userService.getMe();
        setProfile({
          name: data.name || "",
          email: data.email || "",
          mobile: data.mobile || "",
          district: data.district || "",
          address: data.address || "",
          preferredLanguage: data.preferredLanguage || "English",
          bio: data.bio || "",
          avatarUrl: data.avatarUrl || ""
        });
      } catch (err) {
        console.error("Failed to load profile:", err);
        // Fallback to authUser context
        if (authUser) {
          setProfile({
            name: authUser.name || "",
            email: authUser.email || "",
            mobile: authUser.mobile || "",
            district: authUser.district || "",
            address: authUser.address || "",
            preferredLanguage: authUser.preferredLanguage || "English",
            bio: authUser.bio || "",
            avatarUrl: authUser.avatarUrl || ""
          });
        }
      }
    };
    fetchProfile();
  }, [authUser]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // File constraints check
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG and WEBP images are supported.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Avatar image size must be less than 2MB.");
      return;
    }

    // Set preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Call service upload
    const formData = new FormData();
    formData.append("file", file);

    try {
      toast.loading("Uploading avatar...");
      const res = await userService.uploadAvatar(formData);
      setProfile(prev => ({ ...prev, avatarUrl: res.avatarUrl }));
      toast.dismiss();
      toast.success("Profile picture updated.");
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to upload profile photo.");
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await userService.updateMe({ avatarUrl: "" });
      setProfile(prev => ({ ...prev, avatarUrl: "" }));
      setAvatarPreview("");
      toast.success("Profile picture removed.");
    } catch (err) {
      toast.error("Failed to remove profile photo.");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    // Validate fields
    if (profile.name.trim().length < 2 || profile.name.trim().length > 60) {
      setError("Full Name must be between 2 and 60 characters.");
      return;
    }

    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(profile.mobile)) {
      setError("Mobile number must be a valid 10-digit number.");
      return;
    }

    if (!profile.district) {
      setError("District/Location is required.");
      return;
    }

    if (profile.address && (profile.address.length < 5 || profile.address.length > 250)) {
      setError("Address must be between 5 and 250 characters.");
      return;
    }

    if (profile.bio && profile.bio.length > 300) {
      setError("Bio cannot exceed 300 characters.");
      return;
    }

    setLoading(true);

    try {
      const updated = await userService.updateMe({
        name: profile.name,
        mobile: profile.mobile,
        district: profile.district,
        address: profile.address,
        preferredLanguage: profile.preferredLanguage,
        bio: profile.bio
      });

      // Update local storage context
      saveAuth({
        accessToken: localStorage.getItem("accessToken"),
        refreshToken: localStorage.getItem("refreshToken"),
        user: updated,
        role: localStorage.getItem("role")
      });

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      setError(err.message || "Failed to save profile changes.");
      toast.error("Profile save failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">My Profile</h1>
            <p className="mt-2 text-slate-500">Manage your personal information.</p>
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition font-medium w-full sm:w-auto cursor-pointer"
            >
              <Edit size={18} />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={() => { setIsEditing(false); setError(""); }}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-350 px-5 py-3 text-slate-600 hover:bg-slate-50 transition font-medium flex-1 sm:flex-none cursor-pointer"
              >
                <X size={18} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700 transition font-medium flex-1 sm:flex-none cursor-pointer"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Save
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-start gap-2">
            <Info size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Top Card */}
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center gap-8 lg:flex-row">
            <div className="relative">
              {avatarPreview || profile.avatarUrl ? (
                <img
                  src={avatarPreview || profile.avatarUrl}
                  alt="Profile"
                  className="h-36 w-36 rounded-full object-cover border-4 border-slate-100 shadow-sm"
                />
              ) : (
                <div className="flex h-36 w-36 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold text-4xl border border-slate-200">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : <User size={60} />}
                </div>
              )}

              {isEditing && (
                <div className="absolute -bottom-1 -right-1 flex gap-1">
                  <label className="rounded-full bg-blue-600 p-2.5 text-white cursor-pointer hover:bg-blue-700 shadow transition flex items-center justify-center">
                    <Camera size={16} />
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                  {(profile.avatarUrl || avatarPreview) && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="rounded-full bg-red-500 p-2.5 text-white hover:bg-red-600 shadow transition flex items-center justify-center cursor-pointer"
                      title="Remove picture"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-slate-900">{profile.name || "Aram User"}</h2>
              <p className="mt-2 text-slate-500">Citizen Account</p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5 text-green-700 text-sm font-medium border border-green-100">
                <ShieldCheck size={18} />
                Verified Citizen
              </div>
            </div>
          </div>
        </div>

        {/* Details & Information Form */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Form / Personal Info */}
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-2xl font-bold text-slate-900">Personal Information</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-550 mb-1.5 uppercase">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full h-12 rounded-xl border border-slate-200 px-4 outline-none disabled:bg-slate-50 disabled:text-slate-550 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-550 mb-1.5 uppercase">Email Address (Readonly)</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full h-12 rounded-xl border border-slate-200 pl-12 pr-4 outline-none bg-slate-50 text-slate-450"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-550 mb-1.5 uppercase">Phone Number</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-3.5 text-slate-400" />
                  <input
                    type="tel"
                    value={profile.mobile}
                    onChange={(e) => setProfile(prev => ({ ...prev, mobile: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full h-12 rounded-xl border border-slate-200 pl-12 pr-4 outline-none disabled:bg-slate-50 disabled:text-slate-550 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-550 mb-1.5 uppercase">District / Location</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-4 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={profile.district}
                    onChange={(e) => setProfile(prev => ({ ...prev, district: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full h-12 rounded-xl border border-slate-200 pl-12 pr-4 outline-none disabled:bg-slate-50 disabled:text-slate-550 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-550 mb-1.5 uppercase">Address (5 to 250 chars)</label>
                <textarea
                  value={profile.address}
                  onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                  disabled={!isEditing}
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none disabled:bg-slate-50 disabled:text-slate-550 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-550 mb-1.5 uppercase">Preferred Language</label>
                <select
                  value={profile.preferredLanguage}
                  onChange={(e) => setProfile(prev => ({ ...prev, preferredLanguage: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full h-12 rounded-xl border border-slate-200 px-3 outline-none disabled:bg-slate-50 disabled:text-slate-550 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="English">English</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Tanglish">Tanglish</option>
                  <option value="Hinglish">Hinglish</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-550 mb-1.5 uppercase">Bio (Max 300 chars)</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  disabled={!isEditing}
                  maxLength={300}
                  rows={3}
                  placeholder="Tell us about yourself..."
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none disabled:bg-slate-50 disabled:text-slate-550 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
                {isEditing && (
                  <span className="text-[10px] text-slate-400 block text-right mt-1">
                    {profile.bio.length} / 300 characters
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Activity/Stats */}
          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-2xl font-bold text-slate-900">Account Statistics</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <span className="text-slate-600 font-medium">Total Complaints Filed</span>
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <span className="text-slate-600 font-medium">Cases Resolved</span>
                  <span className="text-2xl font-bold text-green-600">0</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <span className="text-slate-600 font-medium">Pending Assistance</span>
                  <span className="text-2xl font-bold text-red-600">2</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-2xl font-bold text-slate-900">Privacy Preference</h2>
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-sm text-slate-650 leading-relaxed space-y-2">
                <p>
                  Your account is protected by ARAM's visual PII masks. Any uploaded document will automatically mask sensitive Aadhaar numbers or personal contact metrics.
                </p>
                <p className="text-xs text-slate-500 font-semibold">
                  Update visibility controls in settings menu to adjust helper privileges.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer save/cancel buttons */}
        {isEditing && (
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
            <button
              onClick={() => { setIsEditing(false); setError(""); }}
              className="px-8 py-4 border border-slate-350 rounded-xl hover:bg-slate-50 font-semibold text-slate-600 transition w-full sm:w-auto cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-8 py-4 bg-blue-600 text-white hover:bg-blue-700 font-semibold rounded-xl transition w-full sm:w-auto cursor-pointer text-center"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Profile;