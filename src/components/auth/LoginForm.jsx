import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Info, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import { toast } from "sonner";
import Input from "../common/Input";
import Button from "../common/Button";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [showDemoBox, setShowDemoBox] = useState(false);

  const isMockMode = import.meta.env.VITE_USE_MOCKS === "true";

  const handleLogin = async (e) => {
    e.preventDefault();
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

  const loadDemoCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
  };

  return (
    <div className="w-full max-w-[420px] rounded-2xl bg-white p-6 lg:p-8 border border-slate-200 shadow-lg">
      <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
      <p className="mt-1.5 text-xs text-slate-500">Login to continue to your ARAM dashboard.</p>

      {/* Backend / Val Error Alert */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-650 rounded-xl text-xs border border-red-100 flex items-start gap-2">
          <Info size={14} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Demo Credentials Soft Accordion in Mock Mode */}
      {isMockMode && (
        <div className="mt-4 border border-blue-100 rounded-xl overflow-hidden bg-blue-50/30">
          <button
            type="button"
            onClick={() => setShowDemoBox(!showDemoBox)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold text-blue-650 hover:bg-blue-50/55 transition cursor-pointer"
          >
            <span>DEMO LOGIN CREDENTIALS</span>
            {showDemoBox ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          
          {showDemoBox && (
            <div className="px-4 pb-3 space-y-1.5 text-[11px] text-slate-650 border-t border-blue-100/50 pt-2 animate-in slide-in-from-top-1 duration-150">
              <button
                type="button"
                onClick={() => loadDemoCredentials("citizen@aram.ai", "Citizen@123")}
                className="w-full text-left p-2 bg-white rounded-lg border border-slate-100 hover:border-blue-300 transition"
              >
                <strong>Citizen:</strong> citizen@aram.ai <span className="text-slate-400 font-mono">(Citizen@123)</span>
              </button>
              <button
                type="button"
                onClick={() => loadDemoCredentials("volunteer@aram.ai", "Helper@123")}
                className="w-full text-left p-2 bg-white rounded-lg border border-slate-100 hover:border-blue-300 transition"
              >
                <strong>Volunteer:</strong> volunteer@aram.ai <span className="text-slate-400 font-mono">(Helper@123)</span>
              </button>
              <button
                type="button"
                onClick={() => loadDemoCredentials("admin@aram.ai", "Admin@123")}
                className="w-full text-left p-2 bg-white rounded-lg border border-slate-100 hover:border-blue-300 transition"
              >
                <strong>Admin:</strong> admin@aram.ai <span className="text-slate-400 font-mono">(Admin@123)</span>
              </button>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleLogin} className="mt-5 space-y-4">
        {/* Email */}
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="name@example.com"
          icon={Mail}
        />

        {/* Password */}
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            icon={Lock}
          />
          <button
            type="button"
            className="absolute right-3.5 top-[33px] text-slate-400 hover:text-slate-650 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Remember me & Forgot Pass */}
        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 shrink-0 rounded border-slate-200 text-blue-650 focus:ring-blue-500 cursor-pointer"
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="font-semibold text-blue-600 hover:underline">
            Forgot Password?
          </Link>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          loading={loading}
          variant="primary"
          className="w-full"
        >
          Login
        </Button>

        {/* Redirect */}
        <p className="text-center text-slate-500 text-xs pt-1">
          New to ARAM?{" "}
          <Link to="/register" className="font-bold text-blue-650 hover:underline">
            Create account
          </Link>
        </p>

        {/* Legal Disclaimer Footer */}
        <div className="border-t border-slate-100 pt-3 text-center text-[10px] text-slate-400 leading-relaxed">
          By continuing, you agree to ARAM's{" "}
          <Link to="/terms" className="hover:underline font-medium text-slate-500">Terms of Service</Link> and{" "}
          <Link to="/privacy" className="hover:underline font-medium text-slate-500">Privacy Policy</Link>.
        </div>
      </form>
    </div>
  );
};

export default LoginForm;