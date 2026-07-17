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

          <div className="relative rounded-[32px] border border-slate-200 bg-white p-8 shadow-2xl w-[320px]">
            <div className="mb-8 flex items-center justify-between">
              <h3 className="text-xl font-bold">
                AI Analysis
              </h3>
              <ShieldCheck className="text-blue-600" />
            </div>

            <div className="space-y-6">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">
                  Category
                </p>
                <h4 className="font-semibold text-slate-800">
                  Labour Issue
                </h4>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">
                  Suggested Authority
                </p>
                <h4 className="flex items-center gap-2 font-semibold text-slate-800">
                  <Scale size={18} />
                  Labour Department
                </h4>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">
                  Priority
                </p>
                <h4 className="font-semibold text-red-500">
                  High
                </h4>
              </div>

              <div>
                <div className="mb-2 flex justify-between text-sm text-slate-650">
                  <span>Confidence</span>
                  <span>92%</span>
                </div>
                <div className="h-3 rounded-full bg-slate-250">
                  <div className="h-3 w-[92%] rounded-full bg-green-500"></div>
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