import { ArrowRight, PlayCircle, ShieldCheck, Scale, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-gradient-to-b from-white via-blue-50 to-white"
    >
      <div className="mx-auto flex min-h-[92vh] max-w-[1400px] items-center justify-between gap-16 px-6 py-20 lg:px-12">

        {/* LEFT */}
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
            <Sparkles size={16} />
            AI Powered Legal Assistance
          </div>

          <h1 className="text-6xl font-extrabold leading-tight text-slate-900">
            ARAM Legal Aid
            <br />
            <span className="text-blue-600">
              Justice For All, Powered By AI
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-8 text-slate-600">
            Get the right legal guidance, identify the correct authority,
            understand your issue and track every complaint with intelligent AI.
          </p>

          <div className="mt-10 flex flex-wrap gap-5">
            <Link to="/register">
              <Button
                size="lg"
                className="rounded-xl bg-blue-600 px-8 hover:bg-blue-700 cursor-pointer"
              >
                File Complaint
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            <Link to="/login">
              <Button
                variant="outline"
                size="lg"
                className="rounded-xl px-8 cursor-pointer"
              >
                Login Portal
              </Button>
            </Link>
          </div>
          
          <p className="mt-6 text-xs text-slate-400 max-w-md">
            * <strong>Emergency Disclaimer:</strong> ARAM provides preliminary complaint guidance only. It does not replace police, court, lawyer, or official authority.
          </p>
        </div>

        {/* RIGHT */}
        <div className="relative hidden lg:flex">
          <div className="absolute -left-10 top-20 h-72 w-72 rounded-full bg-blue-200 blur-3xl opacity-40"></div>

          <div className="relative rounded-[32px] border border-slate-200 bg-white p-8 shadow-2xl w-[325px] space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-blue-600 shrink-0">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-800">AI Legal Assistant</h3>
                <p className="text-[10px] text-slate-400 font-semibold">Triage & Guide Support</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              ARAM uses AI to understand the complaint in plain language and guides you through the next steps.
            </p>

            {/* Complaint Journey Timelines */}
            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
              <div className="flex gap-3 items-start relative pl-1">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 border-2 border-blue-600 text-blue-600 text-[10px] font-bold z-10">
                  1
                </div>
                <div>
                  <h5 className="text-[11px] font-bold text-slate-800">Complaint Received</h5>
                  <p className="text-[9px] text-slate-450 mt-0.5 leading-normal">Describe your problem in plain words or voice.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start relative pl-1">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 border-2 border-blue-600 text-blue-600 text-[10px] font-bold z-10">
                  2
                </div>
                <div>
                  <h5 className="text-[11px] font-bold text-slate-800">AI Guidance Checklist</h5>
                  <p className="text-[9px] text-slate-450 mt-0.5 leading-normal">AI triages categories and required proof files.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start relative pl-1">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 border-2 border-blue-600 text-blue-600 text-[10px] font-bold z-10">
                  3
                </div>
                <div>
                  <h5 className="text-[11px] font-bold text-slate-800">Legal Guide Assigned</h5>
                  <p className="text-[9px] text-slate-450 mt-0.5 leading-normal">Secure chat access is initialized for mediation.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;