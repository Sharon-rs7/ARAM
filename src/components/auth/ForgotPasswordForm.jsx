import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "../../services/authService";
import { toast } from "sonner";

const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      await authService.forgotPassword({ email });
      toast.success("OTP sent to registered email address.");
      
      // Navigate to OTP page passing email in query param
      navigate(`/otp-verification?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err.message || "Failed to trigger recovery. Check email address.");
      toast.error(err.message || "Password recovery trigger failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-xl">
      <h2 className="text-4xl font-bold text-slate-900">Forgot Password</h2>
      <p className="mt-2 text-slate-500">Enter your email address to receive an OTP.</p>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-start gap-2">
          <Info size={16} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label className="mb-2 block font-medium text-slate-800 text-sm">Email Address</label>
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-4 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="h-14 w-full rounded-xl border border-slate-300 pl-12 outline-none focus:border-blue-600 text-slate-800"
            />
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
              Sending OTP...
            </>
          ) : (
            "Send OTP"
          )}
        </Button>

        <p className="text-center text-slate-500 text-sm">
          Remember your password?
          <Link to="/login" className="ml-2 font-semibold text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;