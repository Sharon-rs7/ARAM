import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { authService } from "../../services/authService";
import { toast } from "sonner";
import { Info, Loader2, Lock, Eye, EyeOff } from "lucide-react";

const OTPForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
    // Only accept numeric inputs
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== "" && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Focus previous on backspace
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs[index - 1].current.focus();
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
      toast.success("OTP verified. Please set your new password.");
      setIsVerified(true);
    } catch (err) {
      setError(err.message || "Invalid OTP code. Try again.");
      toast.error(err.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    // Validate password rules
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
      await authService.resetPassword({ email, password: newPassword });
      toast.success("Password reset successfully. Please login.");
      navigate("/login");
    } catch (err) {
      setError(err.message || "Failed to reset password. Please try again.");
      toast.error(err.message || "Password reset failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setTimer(30);
    setResendDisabled(true);

    try {
      await authService.forgotPassword({ email });
      toast.success("A new verification code has been sent.");
    } catch (err) {
      setError(err.message || "Failed to resend OTP.");
      toast.error(err.message || "OTP resend failed.");
    }
  };

  const getPasswordStrength = () => {
    if (!newPassword) return { text: "None", percent: 0, color: "bg-slate-200" };
    let score = 0;
    if (newPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(newPassword)) score += 1;
    if (/[a-z]/.test(newPassword)) score += 1;
    if (/\d/.test(newPassword)) score += 1;
    if (/[^A-Za-z\d]/.test(newPassword)) score += 1;

    if (score <= 2) return { text: "Weak", percent: 30, color: "bg-red-500" };
    if (score <= 4) return { text: "Medium", percent: 65, color: "bg-amber-500" };
    return { text: "Strong", percent: 100, color: "bg-green-500" };
  };

  const strength = getPasswordStrength();

  if (isVerified) {
    return (
      <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-xl border">
        <h2 className="text-4xl font-bold text-slate-900">New Password</h2>
        <p className="mt-2 text-slate-500">Create a secure password for your account.</p>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-start gap-2 animate-shake">
            <Info size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleResetPassword} className="mt-8 space-y-6">
          <div>
            <label className="mb-2 block font-medium text-slate-800 text-sm">New Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Enter new password"
                className="h-14 w-full rounded-xl border border-slate-300 pl-12 pr-12 outline-none focus:border-blue-600 text-slate-800"
              />
              <button
                type="button"
                className="absolute right-4 top-4 text-slate-500 hover:text-slate-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            {newPassword && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Strength: <strong>{strength.text}</strong></span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${strength.percent}%` }} />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block font-medium text-slate-800 text-sm">Confirm Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-4 text-slate-400" />
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm password"
                className="h-14 w-full rounded-xl border border-slate-300 pl-12 pr-12 outline-none focus:border-blue-600 text-slate-800"
              />
              <button
                type="button"
                className="absolute right-4 top-4 text-slate-500 hover:text-slate-700"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="h-14 w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Resetting Password...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-xl border">
      <h2 className="text-4xl font-bold text-slate-900">OTP Verification</h2>
      <p className="mt-2 text-slate-500">
        Enter the verification code sent to <strong className="text-slate-700">{email || "your email"}</strong>. (Demo OTP is <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">123456</code>)
      </p>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-start gap-2">
          <Info size={16} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleVerify} className="mt-8 space-y-6">
        <div className="flex justify-between gap-2.5">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              maxLength="1"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="h-14 w-12 rounded-xl border border-slate-350 text-center text-xl font-bold text-slate-800 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition"
            />
          ))}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="h-14 w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Verifying Code...
            </>
          ) : (
            "Verify OTP"
          )}
        </Button>

        <p className="mt-6 text-center text-slate-500 text-sm">
          Didn't receive OTP?
          {resendDisabled ? (
            <span className="ml-2 text-slate-400 font-semibold">Resend in {timer}s</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="ml-2 font-semibold text-blue-600 hover:underline"
            >
              Resend
            </button>
          )}
        </p>

        <p className="text-center text-sm text-slate-400">
          <Link to="/login" className="hover:underline">Cancel and Go back</Link>
        </p>
      </form>
    </div>
  );
};

export default OTPForm;