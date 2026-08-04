import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, Phone, MapPin, Info, BookOpen, ShieldAlert } from "lucide-react";
import { authService } from "../../services/authService";
import { toast } from "sonner";
import Input from "../common/Input";
import Button from "../common/Button";

const RegisterForm = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    role: "CITIZEN",
    district: "",
    preferredLanguage: "English",
    termsAccepted: false,
    departmentPreference: "Labour Dispute",
    serviceArea: "",
    languagesKnown: "",
    reasonToVolunteer: ""
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
    if (!pw) return { text: "None", percent: 0, color: "bg-slate-200" };
    let score = 0;
    if (pw.length >= 8) score += 1;
    if (/[A-Z]/.test(pw)) score += 1;
    if (/[a-z]/.test(pw)) score += 1;
    if (/\d/.test(pw)) score += 1;
    if (/[^A-Za-z\d]/.test(pw)) score += 1;

    if (score <= 2) return { text: "Weak", percent: 30, color: "bg-red-500" };
    if (score <= 4) return { text: "Medium", percent: 65, color: "bg-amber-500" };
    return { text: "Strong", percent: 100, color: "bg-green-500" };
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

    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(form.mobile)) {
      setError("Mobile number must be a valid 10-digit number.");
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
      setError("Please enter your district/location.");
      return;
    }

    if (!form.termsAccepted) {
      setError("You must accept the Terms & Conditions.");
      return;
    }

    if (form.role === "VOLUNTEER") {
      if (form.reasonToVolunteer.trim().length < 20 || form.reasonToVolunteer.trim().length > 300) {
        setError("Reason to volunteer must be between 20 and 300 characters.");
        return;
      }
      if (!form.serviceArea) {
        setError("Please enter your service area.");
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        ...form,
        role: form.role === "ADMIN" ? "CITIZEN" : form.role // Prevent admin escalation
      };

      const res = await authService.register(payload);
      toast.success(res.message || "Registration successful.");
      navigate("/login");
    } catch (err) {
      console.error("Registration failed:", err);
      setError(err.message || "Registration failed. Please try again.");
      toast.error(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength();

  return (
    <div className="w-full max-w-[580px] rounded-2xl bg-white p-6 lg:p-8 border border-slate-200 shadow-lg overflow-y-auto max-h-[90vh]">
      <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Account</h2>
      <p className="mt-1.5 text-xs text-slate-500">Join ARAM and get AI-powered legal assistance.</p>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs border border-red-100 flex items-start gap-2">
          <Info size={14} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleRegister} className="mt-5 space-y-4">
        {/* Section 1: Account */}
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Account Info</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Full Name"
              name="fullName"
              value={form.fullName}
              onChange={update}
              required
              placeholder="John Doe"
            />
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={form.email}
              onChange={update}
              required
              placeholder="name@example.com"
            />
            <div className="sm:col-span-2">
              <Input
                label="Mobile Number"
                type="tel"
                name="mobile"
                value={form.mobile}
                onChange={update}
                required
                placeholder="9876543210"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Profile Settings */}
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Profile & Location</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block font-semibold text-slate-700 text-xs uppercase tracking-wider">Register As</label>
              <div className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs flex items-center text-slate-500 font-semibold select-none">
                Public User (Public Profile)
              </div>
            </div>
            <div className="sm:col-span-2">
              <Input
                label="District"
                name="district"
                value={form.district}
                onChange={update}
                required
                placeholder="e.g. Chennai"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="mb-1.5 block font-semibold text-slate-700 text-xs uppercase tracking-wider">Preferred Language</label>
              <select
                name="preferredLanguage"
                value={form.preferredLanguage}
                onChange={update}
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition text-slate-800 cursor-pointer"
              >
                <option value="English">English</option>
                <option value="Tamil">Tamil</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Volunteer Info (Only if Volunteer Role Selected) */}
        {form.role === "VOLUNTEER" && (
          <div className="border-b border-slate-100 pb-3 bg-teal-50/30 p-3 rounded-xl border border-teal-100">
            <h3 className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-2">Legal Guide Specific Details</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block font-semibold text-slate-700 text-xs uppercase tracking-wider">Department Preference</label>
                <select
                  name="departmentPreference"
                  value={form.departmentPreference}
                  onChange={update}
                  className="h-11 w-full rounded-xl bg-white border border-slate-200 px-3 text-xs focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition text-slate-800 cursor-pointer"
                >
                  <option value="Labour Dispute">Labour Dispute</option>
                  <option value="Consumer Complaint">Consumer Complaint</option>
                  <option value="Cyber Crime">Cyber Crime</option>
                  <option value="Property Dispute">Property Dispute</option>
                  <option value="Women Safety">Women Safety</option>
                  <option value="Criminal Complaint">Criminal Complaint</option>
                </select>
              </div>
              <Input
                label="Preferred Service Area"
                name="serviceArea"
                value={form.serviceArea}
                onChange={update}
                required
                placeholder="e.g. Mylapore Division"
              />
              <div className="sm:col-span-2">
                <Input
                  label="Languages Known (Comma separated)"
                  name="languagesKnown"
                  value={form.languagesKnown}
                  onChange={update}
                  placeholder="e.g. Tamil, English"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block font-semibold text-slate-700 text-xs uppercase tracking-wider">Reason to guide (Min 20 characters)</label>
                <textarea
                  name="reasonToVolunteer"
                  value={form.reasonToVolunteer}
                  onChange={update}
                  required
                  placeholder="Explain why you want to support legal aid assistance in your community..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition text-slate-800 h-20"
                />
              </div>
              <div className="sm:col-span-2 flex items-start gap-2 bg-white/70 p-2.5 rounded-lg border border-teal-200 text-[10px] text-teal-800 leading-normal">
                <ShieldAlert size={14} className="shrink-0 mt-0.5 text-teal-600" />
                <span><strong>Notice:</strong> Legal Guide profiles undergo administrative verification. You will be able to review cases once approved.</span>
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Security (Passwords) */}
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Password Setup</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={update}
              required
              placeholder="••••••••"
              rightElement={
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />
            <Input
              label="Confirm Password"
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={update}
              required
              placeholder="••••••••"
              rightElement={
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />
          </div>


          {/* Password Strength Indicator */}
          {form.password && (
            <div className="mt-2.5 space-y-1">
              <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500">
                <span>Strength: <span className="font-bold text-slate-700">{strength.text}</span></span>
                <span>{strength.percent}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${strength.percent}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Section 5: Terms checkbox & Submit */}
        <div className="space-y-4 pt-1">
          <Checkbox
            id="termsAccepted"
            name="termsAccepted"
            checked={form.termsAccepted}
            onChange={update}
            description={
              <span>
                I accept the <Link to="/terms" className="text-indigo-600 font-semibold hover:underline">Terms & Conditions</Link> and agree to privacy guidelines.
              </span>
            }
          />

          <Button
            type="submit"
            loading={loading}
            variant="primary"
            className="w-full"
          >
            Create Account
          </Button>


          <p className="text-center text-slate-500 text-xs">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-blue-600 hover:underline">
              Log in here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;