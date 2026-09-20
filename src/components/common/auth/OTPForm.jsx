import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "@/services/authService";
import { toast } from "sonner";
import { AlertCircle, Lock, Eye, EyeOff, KeyRound, ShieldCheck, ArrowLeft } from "lucide-react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { useLanguage } from "@/context/LanguageContext";

const OTPForm = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isNotFound, setIsNotFound] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  
  // Password Reset Fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Resend Timer
  const [timer, setTimer] = useState(30);
  const [resendDisabled, setResendDisabled] = useState(true);

  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    } else {
      setResendDisabled(false);
    }
  }, [timer]);

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== "" && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    const otpValue = otp.join("");
    
    if (otpValue.length !== 6) {
      setError("Please enter the 6-digit OTP code.");
      return;
    }

    setLoading(true);

    try {
      await authService.verifyOtp({ email, otp: otpValue });
      toast.success("OTP verified. Please create your new secure password.");
      setIsVerified(true);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Invalid OTP code. Try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError("Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const otpValue = otp.join("");
      await authService.resetPassword({
        email,
        otp: otpValue,
        newPassword,
        confirmPassword
      });
      toast.success("Password reset successfully! You can now log in.");
      navigate("/login");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err.message;
      setError(msg || "Failed to reset password. Please try again.");
      toast.error(msg || "Password reset failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setIsNotFound(false);
    setTimer(30);
    setResendDisabled(true);

    try {
      await authService.forgotPassword({ email });
      toast.success("A new verification OTP has been dispatched.");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to resend OTP.";
      setError(msg);
      const notFound = msg.toLowerCase().includes("no account found") || 
                       msg.toLowerCase().includes("create a new account") ||
                       err?.response?.status === 404 ||
                       (err?.response?.status === 400 && msg.toLowerCase().includes("no account"));
      setIsNotFound(notFound);
      toast.error(msg);
    }
  };

  const getPasswordStrength = () => {
    if (!newPassword) return { text: "None", percent: 0, color: "bg-[#E6E1D8]" };
    let score = 0;
    if (newPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(newPassword)) score += 1;
    if (/[a-z]/.test(newPassword)) score += 1;
    if (/\d/.test(newPassword)) score += 1;
    if (/[^A-Za-z\d]/.test(newPassword)) score += 1;

    if (score <= 2) return { text: "Weak", percent: 30, color: "bg-rose-500" };
    if (score <= 4) return { text: "Medium", percent: 65, color: "bg-amber-500" };
    return { text: "Strong", percent: 100, color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength();

  if (isVerified) {
    return (
      <div className="w-full max-w-md mx-auto p-8 rounded-3xl bg-[#FFFDF8] border border-[#E6E1D8] shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D8] mb-6">
          <Link 
            to="/login" 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#65736D] hover:text-[#163D32] transition cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>{t("auth.google.cancel", "Cancel")}</span>
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F5948] bg-[#DCEBDD] px-2.5 py-0.5 rounded-full">
            Step 2 of 2
          </span>
        </div>

        <div className="mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#DCEBDD] text-[#163D32] flex items-center justify-center mb-3">
            <ShieldCheck size={20} />
          </div>
          <h2 className="text-2xl font-extrabold text-[#18332B] tracking-tight">{t("auth.forgotPassword.title", "Create New Password")}</h2>
          <p className="text-xs text-[#65736D] mt-1">{t("auth.forgotPassword.subtitle", "Set a secure password for your account.")}</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-1">
            <Input
              label={t("auth.register.password", "New Password")}
              id="newPassword"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              icon={Lock}
              required
            />
            {newPassword && (
              <div className="space-y-1 pt-1">
                <div className="flex justify-between items-center text-[10px] font-semibold text-[#65736D]">
                  <span>Strength: <strong className="text-[#18332B]">{strength.text}</strong></span>
                  <span>{strength.percent}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#E6E1D8] rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${strength.percent}%` }} />
                </div>
              </div>
            )}
          </div>

          <Input
            label={t("auth.register.confirmPassword", "Confirm New Password")}
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            placeholder="••••••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon={Lock}
            required
          />

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="w-full mt-2"
          >
            {t("auth.login.signInBtn", "Save New Password & Sign In")}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-3xl bg-[#FFFDF8] border border-[#E6E1D8] shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D8] mb-6">
        <Link 
          to="/forgot-password" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#65736D] hover:text-[#163D32] transition cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>{t("auth.forgotPassword.backSignIn", "Change Account")}</span>
        </Link>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F5948] bg-[#DCEBDD] px-2.5 py-0.5 rounded-full">
          Step 1 of 2
        </span>
      </div>

      <div className="mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#DCEBDD] text-[#163D32] flex items-center justify-center mb-3">
          <KeyRound size={20} />
        </div>
        <h2 className="text-2xl font-extrabold text-[#18332B] tracking-tight">{t("auth.otp.title", "Enter Verification OTP")}</h2>
        <p className="text-xs text-[#65736D] mt-1">
          {t("auth.otp.subtitle", "Enter the 6-digit OTP code sent for your account.")}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="leading-relaxed">{error}</span>
              {isNotFound && (
                <div className="mt-2.5 pt-2 border-t border-red-200">
                  <Link
                    to={`/register?email=${encodeURIComponent(email)}`}
                    className="inline-flex items-center gap-1 font-bold text-emerald-800 hover:underline"
                  >
                    {t("auth.forgotPassword.createNewAccount", "Create a new account now →")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-5">
        <div className="flex justify-between gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="h-12 w-11 rounded-xl border border-[#E6E1D8] bg-[#F7F1E6]/40 text-center text-lg font-bold text-[#18332B] outline-none focus:border-[#163D32] focus:bg-[#FFFDF8] focus:ring-4 focus:ring-emerald-500/10 transition"
            />
          ))}
        </div>

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          className="w-full mt-2"
        >
          {t("auth.otp.verifyBtn", "Verify OTP Code")}
        </Button>

        <div className="flex items-center justify-between text-xs text-[#65736D] pt-2">
          <span>{t("auth.otp.resend", "Didn't receive code?")}</span>
          {resendDisabled ? (
            <span className="text-[#8B9690] font-semibold">{t("auth.otp.resendIn", `Resend in ${timer}s`).replace("{seconds}", timer)}</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="font-bold text-[#163D32] hover:underline cursor-pointer"
            >
              {t("auth.otp.resendBtn", "Resend OTP")}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default OTPForm;