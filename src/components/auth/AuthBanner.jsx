import { Scale, BrainCircuit, ShieldAlert, BadgeCheck } from "lucide-react";

const AuthBanner = () => {
  return (
    <div className="w-full lg:w-[42%] bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#4338CA] text-white flex flex-col justify-between p-6 lg:p-12 shrink-0">
      {/* Logo and Tagline */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md shrink-0">
          <Scale size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-wide leading-none">ARAM</h1>
          <p className="mt-1 text-xs text-blue-100">AI Legal Assistance Portal</p>
        </div>
      </div>

      {/* Benefits & Title - hidden on mobile, visible on desktop */}
      <div className="hidden lg:block my-auto space-y-8 py-8">
        <div>
          <h2 className="text-4xl font-extrabold leading-tight">Justice Made Smarter.</h2>
          <p className="mt-3 text-sm text-blue-100">
            Submit grievances and get intelligent legal classifications in real time.
          </p>
        </div>

        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <BrainCircuit className="text-blue-200 mt-1 shrink-0" size={20} />
            <div>
              <h4 className="font-bold text-sm">AI Complaint Triage</h4>
              <p className="text-xs text-blue-100/90">Auto classifies category and routes to correct departments.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <BadgeCheck className="text-blue-200 mt-1 shrink-0" size={20} />
            <div>
              <h4 className="font-bold text-sm">Safe Evidence Upload</h4>
              <p className="text-xs text-blue-100/90">Scans documents and redacts sensitive PII information.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldAlert className="text-blue-200 mt-1 shrink-0" size={20} />
            <div>
              <h4 className="font-bold text-sm">Track Complaint Status</h4>
              <p className="text-xs text-blue-100/90">Real-time status updates and direct volunteer feedback.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer - short and clean */}
      <div className="mt-4 lg:mt-0 p-4 rounded-xl bg-white/5 border border-white/10 text-[10px] text-blue-100 leading-relaxed">
        <strong>Emergency Disclaimer:</strong> ARAM provides preliminary guidance only. It does not replace police, court, or official authority.
      </div>
    </div>
  );
};

export default AuthBanner;