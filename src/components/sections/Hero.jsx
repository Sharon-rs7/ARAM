import { ArrowRight, Sparkles, Scale, ShieldCheck, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300"
    >
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-pink-500/5 blur-[120px] pointer-events-none" />

      <div className="mx-auto flex min-h-[92vh] max-w-[1200px] flex-col items-center justify-center text-center gap-10 px-6 py-24 relative z-10">
        
        {/* CENTERED CONTENT */}
        <div className="flex flex-col items-center justify-center text-center max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 dark:border-indigo-950/50 bg-indigo-50/80 dark:bg-indigo-950/40 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 backdrop-blur-md shadow-sm pulse-subtle">
            <Sparkles size={14} />
            ARAM Legal Aid Platform V2
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-slate-900 dark:text-white tracking-tight">
            Justice For All,
            <br />
            <span className="text-gradient dark:text-gradient-dark">
              Empowered By AI
            </span>
          </h1>

          <p className="mt-8 max-w-2xl text-base md:text-lg leading-relaxed text-slate-550 dark:text-slate-400 font-medium">
            Explain your legal problems naturally. ARAM V2 uses intelligent multilingual AI to transcribe voice, categorize grievances, recommend authorities, and seamlessly connect you with expert legal guides.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-5">
            <Link to="/register">
              <Button
                size="lg"
                className="rounded-full bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-650 px-8 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:-translate-y-0.5 transition btn-premium"
              >
                File Your Complaint
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            <Link to="/login">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full border-slate-200 dark:border-slate-800 px-8 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
              >
                Login Portal
              </Button>
            </Link>
          </div>
          
          <p className="mt-10 text-[11px] text-slate-400 dark:text-slate-500 max-w-lg leading-relaxed bg-slate-100/50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 backdrop-blur-sm">
            🛡️ <strong>Emergency Disclaimer:</strong> ARAM provides preliminary complaint guidance only. It does not replace police, court, lawyer, or official authority.
          </p>
        </div>

        {/* Floating Stat Feature Preview cards */}
        <div className="grid gap-6 sm:grid-cols-3 w-full max-w-3xl mt-6">
          <div className="glass-panel p-5 text-left flex items-start gap-4 hover-glow">
            <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-600 dark:text-indigo-400 shrink-0">
              <Scale size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">Simple Voice Intake</h3>
              <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed">Speak or type in Tamil, English, or Hindi. AI transcribes and summarizes.</p>
            </div>
          </div>

          <div className="glass-panel p-5 text-left flex items-start gap-4 hover-glow">
            <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-600 dark:text-indigo-400 shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">Smart AI Analysis</h3>
              <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed">Auto-detect priority, severity, category, and legal department.</p>
            </div>
          </div>

          <div className="glass-panel p-5 text-left flex items-start gap-4 hover-glow">
            <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-600 dark:text-indigo-400 shrink-0">
              <HeartHandshake size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">Expert Guide Matching</h3>
              <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed">Workloads, languages, and case skills matched for quick resolution.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;