import { ArrowRight, PlayCircle, ShieldCheck, Scale, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-gradient-to-b from-white via-blue-50 to-white"
    >
      <div className="mx-auto flex min-h-[92vh] max-w-[1000px] flex-col items-center justify-center text-center gap-8 px-6 py-20 lg:px-12">

        {/* CENTERED CONTENT */}
        <div className="flex flex-col items-center justify-center text-center max-w-3xl">
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

          <p className="mt-8 max-w-xl text-lg leading-8 text-slate-650">
            Get the right legal guidance, identify the correct authority,
            understand your issue and track every complaint with intelligent AI.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-5">
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
          
          <p className="mt-8 text-xs text-slate-400 max-w-md">
            * <strong>Emergency Disclaimer:</strong> ARAM provides preliminary complaint guidance only. It does not replace police, court, lawyer, or official authority.
          </p>
        </div>

      </div>
    </section>
  );
};

export default Hero;