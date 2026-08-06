import {
  FileText,
  BrainCircuit,
  UserCheck,
  ClipboardCheck,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const steps = [
  {
    icon: FileText,
    title: "1. Intake (Simple & Detailed)",
    description:
      "Explain your problem in English, Tamil, or Hindi. Speak naturally using voice mic inputs or type it out.",
  },
  {
    icon: BrainCircuit,
    title: "2. Deep AI Analysis",
    description:
      "AI detects multiple issues, translates/summarizes text, categorizes categories, and sets urgency scores.",
  },
  {
    icon: UserCheck,
    title: "3. Admin Triage Matching",
    description:
      "Admin reviews the AI recommendations and assigns the best-suited Legal Guide based on language, skills, and workload.",
  },
  {
    icon: ClipboardCheck,
    title: "4. Resolve & Progress",
    description:
      "Work together inside the Guide Workspace featuring real-time chats, voice translation, and interactive status timelines.",
  },
];

const HowItWorks = () => {
  return (
    <section
      id="how-it-works"
      className="bg-slate-50 dark:bg-slate-900/50 py-28 transition-colors duration-300 border-y border-slate-100 dark:border-slate-800/40"
    >
      <div className="mx-auto max-w-[1400px] px-6">

        <div className="mb-20 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            The ARAM V2 Workflow
          </h2>
          <p className="mt-5 text-base md:text-lg text-slate-500 dark:text-slate-400 font-medium">
            Bridging the legal gap through four clear, AI-accelerated steps.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="relative glass-panel p-8 hover-glow flex flex-col justify-between"
              >
                <div>
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                    <Icon size={26} />
                  </div>

                  <h3 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">
                    {step.title}
                  </h3>

                  <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-450 font-medium">
                    {step.description}
                  </p>
                </div>

                {index !== steps.length - 1 && (
                  <ArrowRight
                    className="absolute -right-5 top-16 hidden text-slate-300 dark:text-slate-700 lg:block"
                    size={20}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-20 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-8 md:p-12 text-white border border-indigo-950/40 shadow-xl shadow-indigo-950/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[30%] h-[100%] bg-indigo-500/5 blur-[80px] pointer-events-none" />
          
          <div className="flex flex-col items-center justify-between gap-8 lg:flex-row relative z-10">
            <div className="max-w-2xl text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold tracking-wide uppercase mb-3">
                <Sparkles size={12} />
                Smart Assist Platform
              </span>
              <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                AI makes legal aid faster, simpler, and highly accessible.
              </h3>
              <p className="mt-3 text-sm text-slate-400 font-medium leading-relaxed">
                Empowering Tamil Nadu citizens with same-language voice-chat support, automated document masking, and immediate triage.
              </p>
            </div>

            <Link to="/register" className="shrink-0">
              <Button
                className="rounded-full bg-white text-slate-950 hover:bg-slate-100 px-8 text-sm font-bold shadow-md shadow-white/5 transition hover:-translate-y-0.5 duration-200"
              >
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;