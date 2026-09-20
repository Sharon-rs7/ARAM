import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, Phone, MapPin, Info, ArrowLeft, Sun, Moon, Check, Sparkles } from "lucide-react";
import { authService } from "@/services/authService";
import { toast } from "sonner";
import Checkbox from "@/components/common/Checkbox";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import GoogleAuthModal from "@/components/common/auth/GoogleAuthModal";

const TN_DISTRICTS = [
  "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", 
  "Tirunelveli", "Erode", "Vellore", "Thanjavur", "Dindigul", 
  "Kanchipuram", "Chengalpattu", "Tiruppur", "Cuddalore", "Dharmapuri",
  "Kallakurichi", "Kanyakumari", "Karur", "Krishnagiri", "Mayiladuthurai",
  "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
  "Ramanathapuram", "Ranipet", "Sivaganga", "Tenkasi", "Theni",
  "Thoothukudi", "Tirupathur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur",
  "Viluppuram", "Virudhunagar", "Ariyalur", "Other (Outside TN)"
];

const RegisterForm = () => {
  const navigate = useNavigate();
  const { resolvedTheme, setMode } = useTheme();
  const { t } = useLanguage();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [googleModalOpen, setGoogleModalOpen] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    role: "CITIZEN",
    district: "Chennai",
    preferredLanguage: "English",
    termsAccepted: false
  });

  const update = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    setError("");
  };

  const getPasswordStrength = () => {
    const pw = form.password;
    if (!pw) return { text: "None", percent: 0, color: "bg-slate-200 dark:bg-slate-700" };
    let score = 0;
    if (pw.length >= 8) score += 1;
    if (/[A-Z]/.test(pw)) score += 1;
    if (/[a-z]/.test(pw)) score += 1;
    if (/\d/.test(pw)) score += 1;
    if (/[^A-Za-z\d]/.test(pw)) score += 1;

    if (score <= 2) return { text: "Weak", percent: 30, color: "bg-rose-500" };
    if (score <= 4) return { text: "Medium", percent: 65, color: "bg-amber-500" };
    return { text: "Strong", percent: 100, color: "bg-emerald-500" };
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Input Validations
    if (form.fullName.trim().length < 2 || form.fullName.trim().length > 60) {
      setError("Full Name must be between 2 and 60 characters.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    let cleanMobile = form.mobile.trim().replace(/[\s-]/g, "");
    if (cleanMobile.startsWith("+91")) {
      cleanMobile = cleanMobile.substring(3);
    }
    if (cleanMobile.startsWith("0")) {
      cleanMobile = cleanMobile.substring(1);
    }

    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(cleanMobile)) {
      setError("Mobile number must be a valid 10-digit Indian mobile number.");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    if (!passwordRegex.test(form.password)) {
      setError("Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!form.district) {
      setError("Please select your district.");
      return;
    }

    if (!form.termsAccepted) {
      setError("You must accept the Terms & Conditions.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        mobile: cleanMobile,
        password: form.password,
        role: "CITIZEN",
        district: form.district,
        preferredLanguage: form.preferredLanguage
      };

      const res = await authService.register(payload);
      toast.success(res.message || "Registration successful! You can now log in.");
      navigate("/login");
    } catch (err) {
      console.error("Registration failed:", err);
      const serverMessage = err.response?.data?.message || err.message || "Registration failed. Please try again.";
      setError(serverMessage);
      toast.error(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength();

  return (
    <div className="w-full max-w-[620px] rounded-2xl sm:rounded-3xl bg-white dark:bg-[#14201C] p-5 sm:p-9 border border-[#E2E8F0] dark:border-[#223B33] shadow-[0_10px_35px_rgba(22,61,50,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] my-2 sm:my-6 transition-all">
      
      {/* Header Navigation & Theme Toggle */}
      <div className="flex items-center justify-between pb-3.5 sm:pb-4 border-b border-[#F1F5F9] dark:border-[#1E332C] mb-5 sm:mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#65736D] dark:text-slate-400 hover:text-[#163D32] dark:hover:text-emerald-400 transition cursor-pointer select-none active:opacity-70"
        >
          <ArrowLeft size={14} />
          <span>{t("auth.login.backHome", "Back to Home")}</span>
        </Link>

        <button
          type="button"
          onClick={() => setMode(resolvedTheme === "dark" ? "LIGHT" : "DARK")}
          className="rounded-xl bg-[#F4F6F4] dark:bg-[#1A2C26] p-2.5 text-[#65736D] dark:text-slate-300 hover:text-[#163D32] dark:hover:text-emerald-300 transition cursor-pointer flex items-center justify-center border border-[#E2E8F0] dark:border-[#264338] active:scale-95"
          title="Toggle color theme"
        >
          {resolvedTheme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>

      {/* Main Title */}
      <div className="space-y-1.5 mb-5 sm:mb-6 text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCEBDD] dark:bg-emerald-950/60 border border-[#C5DDC6] dark:border-emerald-800/40 text-[10px] sm:text-[11px] font-bold text-[#163D32] dark:text-emerald-300 uppercase tracking-wider">
          <Sparkles size={12} className="text-[#1F5948] dark:text-emerald-400" />
          <span>{t("auth.register.badge", "Official Civic Registration")}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#18332B] dark:text-white tracking-tight">
          {t("auth.register.title", "Create Citizen Profile")}
        </h2>
        <p className="text-xs sm:text-sm text-[#65736D] dark:text-slate-400">
          {t("auth.register.subtitle", "Join the Tamil Nadu Legal Aid network for AI triage, case tracking, and legal guide escalation.")}
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-200 rounded-2xl text-xs border border-rose-200 dark:border-rose-800/60 flex items-start gap-2.5">
          <Info size={16} className="mt-0.5 shrink-0 text-rose-600 dark:text-rose-400" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* 1. Registration Form (First) */}
      <form onSubmit={handleRegister} className="space-y-4">
        
        {/* Personal Details */}
        <div className="space-y-3.5">
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-emerald-200/90 uppercase tracking-wider mb-1.5 text-left">
                {t("auth.register.fullName", "Full Name")} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-emerald-400/60 pointer-events-none" />
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={update}
                  required
                  placeholder={t("auth.register.fullNamePlaceholder", "e.g., Anbarasan K")}
                  className="h-12 w-full rounded-2xl border border-slate-300 dark:border-emerald-800/60 bg-[#F8FAFC] dark:bg-[#182C26] pl-10 pr-3.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-emerald-200/30 focus:border-[#163D32] dark:focus:border-emerald-400 focus:bg-white dark:focus:bg-[#1C352E] focus:ring-4 focus:ring-emerald-500/15 outline-none transition shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-emerald-200/90 uppercase tracking-wider mb-1.5 text-left">
                {t("auth.register.email", "Email Address")} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-emerald-400/60 pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  inputMode="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={form.email}
                  onChange={update}
                  required
                  placeholder={t("auth.register.emailPlaceholder", "name@example.com")}
                  className="h-12 w-full rounded-2xl border border-slate-300 dark:border-emerald-800/60 bg-[#F8FAFC] dark:bg-[#182C26] pl-10 pr-3.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-emerald-200/30 focus:border-[#163D32] dark:focus:border-emerald-400 focus:bg-white dark:focus:bg-[#1C352E] focus:ring-4 focus:ring-emerald-500/15 outline-none transition shadow-2xs"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-emerald-200/90 uppercase tracking-wider mb-1.5 text-left">
                {t("auth.register.mobile", "Mobile Number")} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-emerald-400/60 pointer-events-none" />
                <input
                  type="tel"
                  name="mobile"
                  inputMode="tel"
                  value={form.mobile}
                  onChange={update}
                  required
                  placeholder={t("auth.register.mobilePlaceholder", "9876543210")}
                  className="h-12 w-full rounded-2xl border border-slate-300 dark:border-emerald-800/60 bg-[#F8FAFC] dark:bg-[#182C26] pl-10 pr-3.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-emerald-200/30 focus:border-[#163D32] dark:focus:border-emerald-400 focus:bg-white dark:focus:bg-[#1C352E] focus:ring-4 focus:ring-emerald-500/15 outline-none transition shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-emerald-200/90 uppercase tracking-wider mb-1.5 text-left">
                {t("auth.register.district", "District / மாவட்டம்")} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-emerald-400/60 pointer-events-none" />
                <select
                  name="district"
                  value={form.district}
                  onChange={update}
                  required
                  className="h-12 w-full rounded-2xl border border-slate-300 dark:border-emerald-800/60 bg-[#F8FAFC] dark:bg-[#182C26] pl-10 pr-3.5 text-sm text-slate-900 dark:text-slate-100 focus:border-[#163D32] dark:focus:border-emerald-400 focus:bg-white dark:focus:bg-[#1C352E] focus:ring-4 focus:ring-emerald-500/15 outline-none transition cursor-pointer appearance-none shadow-2xs"
                >
                  {TN_DISTRICTS.map((d) => (
                    <option key={d} value={d} className="dark:bg-[#182C26]">
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-emerald-200/90 uppercase tracking-wider mb-1.5 text-left">
              Preferred Language
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["English", "Tamil", "Hindi"].map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, preferredLanguage: lang }))}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-semibold border transition cursor-pointer text-center active:scale-95 ${
                    form.preferredLanguage === lang
                      ? "bg-[#DCEBDD] dark:bg-emerald-950/70 border-[#163D32] dark:border-emerald-400 text-[#163D32] dark:text-emerald-300 font-bold shadow-xs"
                      : "bg-[#F8FAFC] dark:bg-[#182C26] border-slate-300 dark:border-emerald-800/60 text-slate-600 dark:text-slate-300 hover:bg-white"
                  }`}
                >
                  {lang === "Tamil" ? "தமிழ் (Tamil)" : lang === "Hindi" ? "हिंदी (Hindi)" : "English"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Password Fields */}
        <div className="space-y-3.5 pt-1">
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-emerald-200/90 uppercase tracking-wider mb-1.5 text-left">
                {t("auth.register.password", "Create Password")} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-emerald-400/60 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={update}
                  required
                  placeholder="••••••••"
                  className="h-12 w-full rounded-2xl border border-slate-300 dark:border-emerald-800/60 bg-[#F8FAFC] dark:bg-[#182C26] pl-10 pr-11 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-emerald-200/30 focus:border-[#163D32] dark:focus:border-emerald-400 focus:bg-white dark:focus:bg-[#1C352E] focus:ring-4 focus:ring-emerald-500/15 outline-none transition shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-emerald-300/70 hover:text-slate-700 dark:hover:text-white p-2 cursor-pointer active:scale-90"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-emerald-200/90 uppercase tracking-wider mb-1.5 text-left">
                {t("auth.register.confirmPassword", "Confirm Password")} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-emerald-400/60 pointer-events-none" />
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={update}
                  required
                  placeholder="••••••••"
                  className="h-12 w-full rounded-2xl border border-slate-300 dark:border-emerald-800/60 bg-[#F8FAFC] dark:bg-[#182C26] pl-10 pr-11 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-emerald-200/30 focus:border-[#163D32] dark:focus:border-emerald-400 focus:bg-white dark:focus:bg-[#1C352E] focus:ring-4 focus:ring-emerald-500/15 outline-none transition shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-emerald-300/70 hover:text-slate-700 dark:hover:text-white p-2 cursor-pointer active:scale-90"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Password Strength Meter */}
          {form.password && (
            <div className="space-y-1 pt-1">
              <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500 dark:text-emerald-200/70">
                <span>Password Strength: <strong className="text-slate-800 dark:text-slate-100">{strength.text}</strong></span>
                <span>{strength.percent}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 dark:bg-emerald-950 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${strength.color} transition-all duration-300`} 
                  style={{ width: `${strength.percent}%` }} 
                />
              </div>
            </div>
          )}
        </div>

        {/* Terms & Conditions */}
        <div className="pt-2">
          <Checkbox
            id="termsAccepted"
            name="termsAccepted"
            checked={form.termsAccepted}
            onChange={update}
            label={
              <span className="text-xs text-slate-600 dark:text-emerald-200/70 select-none">
                {t("auth.register.terms", "I accept the Terms & Conditions and agree to the privacy policy.")}
              </span>
            }
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 sm:h-13 rounded-2xl bg-gradient-to-r from-[#163D32] via-[#1B4B3D] to-[#163D32] hover:from-[#1F5948] hover:to-[#163D32] text-white text-sm font-bold shadow-md shadow-emerald-950/20 dark:shadow-emerald-950/50 border border-emerald-600/30 active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <span>{t("auth.register.submitBtn", "Create Free Account")}</span>
              <Check size={16} />
            </>
          )}
        </button>
      </form>

      {/* 2. Divider */}
      <div className="relative flex items-center justify-center my-5">
        <div className="w-full border-t border-slate-200 dark:border-emerald-900/50"></div>
        <span className="bg-white dark:bg-[#11201B] px-3 text-[10px] font-bold text-slate-400 dark:text-emerald-300/60 uppercase tracking-widest absolute">
          {t("auth.login.orContinueWith", "or register with")}
        </span>
      </div>

      {/* 3. Google Sign-In Button (Moved to Bottom) */}
      <button
        type="button"
        onClick={() => {
          setError("");
          setGoogleModalOpen(true);
        }}
        className="w-full h-12 rounded-2xl border border-slate-300 dark:border-emerald-700/50 hover:border-[#163D32] dark:hover:border-emerald-400 bg-white dark:bg-[#182C26] hover:bg-slate-50 dark:hover:bg-[#1E3830] text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-3 shadow-xs cursor-pointer active:scale-[0.99]"
      >
        <svg className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>{t("auth.login.googleSignIn", "Sign Up with Google")}</span>
      </button>

      {/* 4. Login Redirect */}
      <p className="text-center text-xs text-slate-500 dark:text-emerald-200/70 pt-4">
        {t("auth.register.alreadyAccount", "Already registered?")}{" "}
        <Link to="/login" className="font-bold text-[#163D32] dark:text-emerald-400 hover:underline">
          {t("auth.register.signInLink", "Sign in here →")}
        </Link>
      </p>

      {/* Google Auth Modal */}
      <GoogleAuthModal 
        isOpen={googleModalOpen} 
        onClose={() => setGoogleModalOpen(false)}
        defaultRole={form.role === "GUIDE" || form.role === "VOLUNTEER" ? "HELPER" : form.role || "CITIZEN"}
        defaultDistrict={form.district || "Coimbatore"}
      />
    </div>
  );
};

export default RegisterForm;
