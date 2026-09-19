import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, KeyRound, AlertCircle, ArrowRight, Loader2, Sparkles, Sun, Moon } from "lucide-react";
import { authService } from "@/services/authService";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "sonner";

const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const { resolvedTheme, setMode } = useTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isNotFound, setIsNotFound] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsNotFound(false);

    const trimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(?:\+91|0)?[6-9]\d{9}$/;

    if (!emailRegex.test(trimmed) && !phoneRegex.test(trimmed)) {
      setError("Please enter a valid email address or 10-digit mobile number.");
      return;
    }

    setLoading(true);

    try {
      await authService.forgotPassword({ email: trimmed.toLowerCase() });
      toast.success("Verification OTP dispatched via SMS, WhatsApp & Email.");
      navigate(`/otp-verification?email=${encodeURIComponent(trimmed.toLowerCase())}`);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to trigger recovery. Please check your details.";
      setError(msg);
      const notFound = msg.toLowerCase().includes("no account found") || 
                       msg.toLowerCase().includes("create a new account") ||
                       err?.response?.status === 404 ||
                       (err?.response?.status === 400 && msg.toLowerCase().includes("no account"));
      setIsNotFound(notFound);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[460px] mx-auto rounded-2xl sm:rounded-3xl bg-white dark:bg-[#11201B] p-5 sm:p-9 border border-slate-200 dark:border-emerald-500/25 shadow-[0_15px_45px_rgba(16,45,37,0.08)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.55)] transition-all">
      <div className="flex items-center justify-between pb-3.5 sm:pb-4 border-b border-slate-100 dark:border-emerald-900/40 mb-5 sm:mb-6">
        <Link 
          to="/login" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-emerald-200/70 hover:text-[#163D32] dark:hover:text-emerald-300 transition cursor-pointer select-none active:opacity-70"
        >
          <ArrowLeft size={14} />
          <span>Back to Sign In</span>
        </Link>
        <button
          type="button"
          onClick={() => setMode(resolvedTheme === "dark" ? "LIGHT" : "DARK")}
          className="rounded-xl bg-slate-100 dark:bg-[#182C26] p-2.5 text-slate-600 dark:text-emerald-300 hover:text-[#163D32] dark:hover:text-emerald-200 transition cursor-pointer flex items-center justify-center border border-slate-200 dark:border-emerald-700/40 active:scale-95"
          title="Toggle theme"
        >
          {resolvedTheme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>

      <div className="text-left mb-5 sm:mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCEBDD] dark:bg-emerald-950/70 border border-[#B9D8BD] dark:border-emerald-700/50 text-[10px] sm:text-[11px] font-bold text-[#163D32] dark:text-emerald-300 uppercase tracking-wider mb-2">
          <KeyRound size={12} className="text-[#1F5948] dark:text-emerald-400" />
          <span>Account Security Recovery</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Reset Password
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-emerald-200/60 mt-1">
          Enter your registered email address or 10-digit mobile number to receive a secure 6-digit OTP code.
        </p>
      </div>

      {error && (
        <div className="mb-5 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-200 text-xs transition-all animate-in fade-in duration-200">
          <div className="flex items-start gap-2.5">
            <AlertCircle size={17} className="shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <div className="flex-1 text-left">
              <p className="font-bold text-[13px] text-rose-800 dark:text-rose-100">
                {isNotFound ? "Account Not Found" : "Verification Error"}
              </p>
              <p className="mt-1 font-medium leading-relaxed">
                {error}
              </p>
              {isNotFound && (
                <div className="mt-3 pt-3 border-t border-rose-200/70 dark:border-rose-800/50 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Link
                    to={`/register?email=${encodeURIComponent(email.trim().toLowerCase())}`}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#163D32] hover:bg-[#1F5948] text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <span>Create New Account</span>
                    <ArrowRight size={13} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("");
                      setError("");
                      setIsNotFound(false);
                      document.getElementById("email")?.focus();
                    }}
                    className="inline-flex items-center justify-center px-3 py-2 rounded-xl border border-rose-300 dark:border-rose-700 hover:bg-rose-100/50 dark:hover:bg-rose-900/30 text-rose-800 dark:text-rose-200 font-semibold text-xs transition cursor-pointer"
                  >
                    Try Another Account
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[11px] font-bold text-slate-700 dark:text-emerald-200/90 uppercase tracking-wider text-left">
              Registered Email or Mobile Number
            </label>
            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
              SMS • WhatsApp • Email
            </span>
          </div>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-emerald-400/60 pointer-events-none" />
            <input
              id="email"
              type="text"
              inputMode="text"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) {
                  setError("");
                  setIsNotFound(false);
                }
              }}
              placeholder="name@example.com or 9876543210"
              required
              className="h-12 w-full rounded-2xl border border-slate-300 dark:border-emerald-800/60 bg-[#F8FAFC] dark:bg-[#182C26] pl-10 pr-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-emerald-200/30 focus:border-[#163D32] dark:focus:border-emerald-400 focus:bg-white dark:focus:bg-[#1C352E] focus:ring-4 focus:ring-emerald-500/15 outline-none transition shadow-2xs"
            />
          </div>
          <p className="text-[11px] text-slate-400 dark:text-emerald-200/40 text-left mt-1.5 pl-1">
            We will verify your account and dispatch the 6-digit OTP code to your registered mobile and email.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 sm:h-13 rounded-2xl bg-gradient-to-r from-[#163D32] via-[#1B4B3D] to-[#163D32] hover:from-[#1F5948] hover:to-[#163D32] text-white text-sm font-bold shadow-md shadow-emerald-950/20 dark:shadow-emerald-950/50 border border-emerald-600/30 active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <span>Send Verification OTP</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-emerald-900/40 text-center">
        <p className="text-xs text-slate-500 dark:text-emerald-200/70">
          Remember your credentials?{" "}
          <Link to="/login" className="font-bold text-[#163D32] dark:text-emerald-400 hover:underline cursor-pointer">
            Sign In here →
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;