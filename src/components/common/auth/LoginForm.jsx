import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, LogIn, Loader2, AlertCircle, ArrowRight, Eye, EyeOff, Shield, ArrowLeft, Sun, Moon, Sparkles, UserCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { authService } from "@/services/authService";
import { toast } from "sonner";
import Checkbox from "@/components/common/Checkbox";

import GoogleAuthModal from "@/components/common/auth/GoogleAuthModal";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { resolvedTheme, setMode } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [showDemoBox, setShowDemoBox] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter both your email and password.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await authService.login({
        email: email.trim(),
        username: email.trim(),
        password: password
      });
      login(res);
      toast.success("Welcome back to ARAM AI Legal Aid!");

      const role = String(res?.user?.role || res?.role || "").toUpperCase();
      if (role === "SUPER_ADMIN") {
        navigate("/superadmin/dashboard");
      } else if (role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (role === "VOLUNTEER" || role === "GUIDE" || role === "HELPER") {
        navigate("/guide/dashboard");
      } else {
        navigate("/citizen/dashboard");
      }
    } catch (err) {
      console.error("Login failed:", err);
      const validationErrs = err?.response?.data?.validationErrors;
      let errorMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message;
      if (validationErrs && typeof validationErrs === "object") {
        errorMsg = Object.values(validationErrs).join(", ");
      }
      setError(errorMsg || "Invalid email or password. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setError("");
    setGoogleModalOpen(true);
  };

  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");
  };

  return (
    <div className="w-full max-w-[460px] mx-auto rounded-2xl sm:rounded-3xl bg-white dark:bg-[#11201B] p-5 sm:p-9 border border-slate-200 dark:border-emerald-500/25 shadow-[0_15px_45px_rgba(16,45,37,0.08)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.55)] transition-all">
      
      {/* Top Controls: Back link & Theme toggle */}
      <div className="flex items-center justify-between pb-3.5 sm:pb-4 border-b border-slate-100 dark:border-emerald-900/40 mb-5 sm:mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-emerald-200/70 hover:text-[#163D32] dark:hover:text-emerald-300 transition cursor-pointer select-none active:opacity-70"
        >
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </Link>

        <button
          type="button"
          onClick={() => setMode(resolvedTheme === "dark" ? "LIGHT" : "DARK")}
          className="rounded-xl bg-slate-100 dark:bg-[#182C26] p-2.5 text-slate-600 dark:text-emerald-300 hover:text-[#163D32] dark:hover:text-emerald-200 transition cursor-pointer flex items-center justify-center border border-slate-200 dark:border-emerald-700/40 active:scale-95"
          title="Toggle theme"
          aria-label="Toggle theme"
        >
          {resolvedTheme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>

      {/* Main Title & Role Pill */}
      <div className="text-left mb-5 sm:mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCEBDD] dark:bg-emerald-950/70 border border-[#B9D8BD] dark:border-emerald-700/50 text-[10px] sm:text-[11px] font-bold text-[#163D32] dark:text-emerald-300 uppercase tracking-wider mb-2">
          <Sparkles size={12} className="text-[#1F5948] dark:text-emerald-400 shrink-0" />
          <span>Unified Civic Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Sign In
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-emerald-200/60 mt-1">
          Access your legal assistance records, grievances, and guidance cases.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-200 text-xs flex items-start gap-2.5">
          <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
          <span className="font-medium leading-relaxed">{error}</span>
        </div>
      )}

      {/* 1. Login Credentials Form (Primary First) */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Email Field */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 dark:text-emerald-200/90 uppercase tracking-wider mb-1.5 text-left">
            Email Address
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-emerald-400/60 pointer-events-none" />
            <input
              id="email"
              type="email"
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              autoComplete="email"
              className="h-12 w-full rounded-2xl border border-slate-300 dark:border-emerald-800/60 bg-[#F8FAFC] dark:bg-[#182C26] pl-10 pr-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-emerald-200/30 focus:border-[#163D32] dark:focus:border-emerald-400 focus:bg-white dark:focus:bg-[#1C352E] focus:ring-4 focus:ring-emerald-500/15 outline-none transition shadow-2xs"
            />
          </div>
        </div>

        {/* Password Field with Eye Toggle */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[11px] font-bold text-slate-700 dark:text-emerald-200/90 uppercase tracking-wider text-left">
              Password
            </label>
            <Link 
              to="/forgot-password" 
              className="text-[11px] font-bold text-[#1F5948] dark:text-emerald-400 hover:text-[#163D32] dark:hover:text-emerald-300 hover:underline cursor-pointer"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-emerald-400/60 pointer-events-none" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              autoComplete="current-password"
              className="h-12 w-full rounded-2xl border border-slate-300 dark:border-emerald-800/60 bg-[#F8FAFC] dark:bg-[#182C26] pl-10 pr-11 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-emerald-200/30 focus:border-[#163D32] dark:focus:border-emerald-400 focus:bg-white dark:focus:bg-[#1C352E] focus:ring-4 focus:ring-emerald-500/15 outline-none transition shadow-2xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-emerald-300/70 hover:text-slate-700 dark:hover:text-white p-2 cursor-pointer transition active:scale-90"
              title={showPassword ? "Hide password" : "Show password"}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="pt-1">
          <Checkbox
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            label={
              <span className="text-xs text-slate-600 dark:text-emerald-200/70 select-none">
                Remember this device for 30 days
              </span>
            }
          />
        </div>

        {/* Primary Sign In Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 sm:h-13 rounded-2xl bg-gradient-to-r from-[#163D32] via-[#1B4B3D] to-[#163D32] hover:from-[#1F5948] hover:to-[#163D32] text-white text-sm font-bold shadow-md shadow-emerald-950/20 dark:shadow-emerald-950/50 border border-emerald-600/30 active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <span>Sign In to Account</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      {/* 2. Divider (Placed below primary form) */}
      <div className="relative flex items-center justify-center my-5">
        <div className="w-full border-t border-slate-200 dark:border-emerald-900/50"></div>
        <span className="bg-white dark:bg-[#11201B] px-3 text-[10px] font-bold text-slate-400 dark:text-emerald-300/60 uppercase tracking-widest absolute">
          or continue with
        </span>
      </div>

      {/* 3. Google SSO Button (Moved to Bottom) */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full h-12 rounded-2xl border border-slate-300 dark:border-emerald-700/50 hover:border-[#163D32] dark:hover:border-emerald-400 bg-white dark:bg-[#182C26] hover:bg-slate-50 dark:hover:bg-[#1E3830] text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-3 shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] group"
      >
        <svg className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:scale-110 duration-200 shrink-0" viewBox="0 0 24 24">
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
        <span>Sign in with Google</span>
      </button>

      {/* 4. Quick Demo Helper */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-emerald-900/40">
        <button
          type="button"
          onClick={() => setShowDemoBox(!showDemoBox)}
          className="w-full text-center text-[11px] font-semibold text-slate-500 dark:text-emerald-300/70 hover:text-[#163D32] dark:hover:text-emerald-200 flex items-center justify-center gap-1.5 cursor-pointer py-1"
        >
          <UserCheck size={13} />
          <span>{showDemoBox ? "Hide Demo Accounts" : "Quick Demo Credentials"}</span>
        </button>

        {showDemoBox && (
          <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-[#162923] border border-slate-200 dark:border-emerald-800/50 grid grid-cols-3 gap-1.5 text-center">
            <button
              type="button"
              onClick={() => fillDemo("citizen@aram.tn.gov.in", "Aram@12345")}
              className="py-2 px-1 rounded-xl bg-white dark:bg-[#1C352E] hover:bg-[#DCEBDD] dark:hover:bg-emerald-900/60 border border-slate-200 dark:border-emerald-700/50 text-[10px] font-bold text-slate-800 dark:text-emerald-100 transition cursor-pointer active:scale-95"
            >
              Citizen
            </button>
            <button
              type="button"
              onClick={() => fillDemo("guide@aram.tn.gov.in", "Aram@12345")}
              className="py-2 px-1 rounded-xl bg-white dark:bg-[#1C352E] hover:bg-[#DCEBDD] dark:hover:bg-emerald-900/60 border border-slate-200 dark:border-emerald-700/50 text-[10px] font-bold text-slate-800 dark:text-emerald-100 transition cursor-pointer active:scale-95"
            >
              Legal Guide
            </button>
            <button
              type="button"
              onClick={() => fillDemo("admin@aram.tn.gov.in", "Aram@12345")}
              className="py-2 px-1 rounded-xl bg-white dark:bg-[#1C352E] hover:bg-[#DCEBDD] dark:hover:bg-emerald-900/60 border border-slate-200 dark:border-emerald-700/50 text-[10px] font-bold text-slate-800 dark:text-emerald-100 transition cursor-pointer active:scale-95"
            >
              Admin
            </button>
          </div>
        )}
      </div>

      {/* 5. Create Account Link */}
      <div className="mt-4 text-center">
        <p className="text-xs text-slate-500 dark:text-emerald-200/70">
          Don't have an account yet?{" "}
          <Link to="/register" className="font-bold text-[#163D32] dark:text-emerald-400 hover:underline cursor-pointer">
            Create Free Citizen Profile →
          </Link>
        </p>
      </div>

      {/* Google Auth Modal */}
      <GoogleAuthModal 
        isOpen={googleModalOpen} 
        onClose={() => setGoogleModalOpen(false)} 
      />
    </div>
  );
};

export default LoginForm;

