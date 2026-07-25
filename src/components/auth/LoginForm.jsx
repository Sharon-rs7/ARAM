import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Info, ArrowRight, User, BookOpen, ShieldAlert } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import { toast } from "sonner";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError("");

    // Front-end email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    setLoading(true);

    try {
      const res = await authService.login({ email, password });
      login(res);
      toast.success(`Logged in successfully as ${res.user.name}`);

      const userRole = res.role ? res.role.toUpperCase() : "";
      if (userRole === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (userRole === "VOLUNTEER" || userRole === "HELPER") {
        navigate("/volunteer/dashboard");
      } else {
        navigate("/citizen/dashboard");
      }
    } catch (err) {
      console.error("Login failed:", err);
      if (err.message && err.message.includes("Network Error")) {
        setError("Backend server is not running. Please start Spring Boot API.");
        toast.error("Connection failed. Start the backend server.");
      } else {
        setError(err.message || "Invalid email or password. Please try again.");
        toast.error(err.message || "Login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadDemoCredentials = (demoEmail, demoPassword, roleName) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
    toast.info(`Prefilled demo credentials for ${roleName}`);
  };

  return (
    <div className="w-full max-w-[430px] rounded-2xl bg-white p-7 lg:p-10 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
      
      {/* Pill Badge */}
      <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 tracking-wider mb-4 border border-indigo-100/50">
        • SECURE SIGN-IN
      </span>

      {/* Heading */}
      <h2 className="text-3.5xl font-medium text-slate-800 tracking-tight leading-none">
        Welcome <span className="font-serif italic font-medium text-indigo-600" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>back.</span>
      </h2>
      <p className="mt-2 text-xs text-slate-500">Sign in to continue your legal support journey.</p>

      {/* Backend / Val Error Alert */}
      {error && (
        <div className="mt-5 p-3.5 bg-red-50 text-red-650 rounded-xl text-xs border border-red-100 flex items-start gap-2.5 animate-in fade-in duration-150">
          <Info size={14} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="mt-6 space-y-5">
        
        {/* Email Address */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@example.com"
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-xs font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Password
            </label>
            <Link to="/forgot-password" className="text-[10px] font-bold text-indigo-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-4 pr-12 text-xs font-medium text-slate-750 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            />
            <button
              type="button"
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer transition"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Remember me for 30 days */}
        <div className="flex items-center text-xs pt-0.5">
          <label className="flex items-center gap-2.5 text-slate-500 cursor-pointer select-none font-medium">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 shrink-0 rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            Remember me for 30 days
          </label>
        </div>

        {/* Submit button with sliding arrow */}
        <button
          type="submit"
          disabled={loading}
          className="group relative flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-indigo-650 active:scale-[0.99] transition duration-150 cursor-pointer"
        >
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              Sign in 
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        {/* Register link */}
        <p className="text-center text-slate-500 text-xs pt-1 font-medium">
          New to ARAM?{" "}
          <Link to="/register" className="font-bold text-indigo-600 hover:underline">
            Create account
          </Link>
        </p>

        {/* Quick Demo Access Switcher */}
        <div className="pt-4 border-t border-slate-100 space-y-3.5">
          <div className="flex items-center justify-center gap-3">
            <div className="h-[1px] bg-slate-100 flex-1" />
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest shrink-0">
              Quick Demo Access
            </span>
            <div className="h-[1px] bg-slate-100 flex-1" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            
            {/* Citizen Card */}
            <button
              type="button"
              onClick={() => loadDemoCredentials("citizen@aram.ai", "Citizen@123", "Citizen")}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/10 cursor-pointer transition text-center group"
            >
              <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-650 flex items-center justify-center group-hover:scale-105 transition shrink-0">
                <User size={14} />
              </div>
              <span className="text-[10px] font-extrabold text-slate-650 mt-2">Citizen</span>
            </button>

            {/* Legal Guide Card */}
            <button
              type="button"
              onClick={() => loadDemoCredentials("volunteer@aram.ai", "Helper@123", "Legal Guide")}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/10 cursor-pointer transition text-center group"
            >
              <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-650 flex items-center justify-center group-hover:scale-105 transition shrink-0">
                <BookOpen size={14} />
              </div>
              <span className="text-[10px] font-extrabold text-slate-650 mt-2">Guide</span>
            </button>

            {/* Admin Card */}
            <button
              type="button"
              onClick={() => loadDemoCredentials("admin@aram.ai", "Admin@123", "Admin")}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/10 cursor-pointer transition text-center group"
            >
              <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-650 flex items-center justify-center group-hover:scale-105 transition shrink-0">
                <ShieldAlert size={14} />
              </div>
              <span className="text-[10px] font-extrabold text-slate-650 mt-2">Admin</span>
            </button>

          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[10px] text-slate-400 leading-normal pt-1.5">
          By continuing, you agree to ARAM's{" "}
          <Link to="/terms" className="hover:underline font-semibold text-slate-500">Terms of Service</Link> and{" "}
          <Link to="/privacy" className="hover:underline font-semibold text-slate-500">Privacy Policy</Link>.
        </div>

      </form>
    </div>
  );
};

export default LoginForm;