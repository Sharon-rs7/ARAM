import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import AuthLayout from "@/components/common/auth/AuthLayout";
import { Button } from "@/components/common/ui/button";
import { KeyRound, Lock, Info, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";

const ActivateAccount = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;
  const isStrong = password.length >= 8 && passwordRegex.test(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Activation token is missing or invalid. Please check your email link.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!isStrong) {
      setError("Password does not meet the complexity requirements.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/activate-account", {
        token: token.trim(),
        password: password.trim()
      });
      
      setSuccess(res.data?.message || "Account activated successfully!");
      toast.success("Account activated! You can now log in.");
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Account activation error:", err);
      setError(err.response?.data?.message || "Failed to activate account. The token may be expired.");
      toast.error("Activation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-[430px] rounded-2xl bg-white p-7 lg:p-10 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        
        {/* Back to Login Link */}
        <Link 
          to="/login" 
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 transition mb-6 cursor-pointer select-none font-semibold w-fit"
        >
          <ArrowLeft size={14} />
          Back to Login
        </Link>

        {/* Pill Badge */}
        <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 tracking-wider mb-4 border border-indigo-100/50">
          • ACCOUNT ACTIVATION
        </span>

        {/* Heading */}
        <h2 className="text-3.5xl font-medium text-slate-800 tracking-tight leading-none">
          Activate <span className="font-serif italic font-medium text-indigo-600" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Account</span>
        </h2>
        <p className="mt-2 text-xs text-slate-500">Set a secure password to activate your ARAM account.</p>

        {/* Status Alerts */}
        {error && (
          <div className="mt-5 p-3.5 bg-red-55/10 text-red-700 rounded-xl text-xs border border-red-100 flex items-start gap-2.5 animate-in fade-in duration-150 font-medium">
            <Info size={16} className="mt-0.5 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mt-5 p-3.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs border border-emerald-100 flex items-start gap-2.5 animate-in fade-in duration-150 font-medium">
            <Info size={16} className="mt-0.5 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* New Password */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              New Password
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center justify-center">
                <Lock size={16} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="New password"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 text-xs font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>
            <small style={{ color: isStrong ? '#10b981' : '#64748b', fontSize: 10, display: 'block', marginTop: 4, fontWeight: "500" }}>
              Must be 8+ characters and contain uppercase, lowercase, digit, and special symbol.
            </small>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Confirm Password
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center justify-center">
                <Lock size={16} />
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm password"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 text-xs font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-6 text-sm hover:bg-indigo-700 text-white font-semibold transition"
          >
            {loading ? "Activating..." : "Activate Account"}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default ActivateAccount;
