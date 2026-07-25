import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="bg-slate-900 py-28">
      <div className="mx-auto max-w-[1400px] px-6">

        <div className="overflow-hidden rounded-[40px] bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 p-16 text-center text-white shadow-2xl border border-slate-800">

          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-5 py-2">
            <Sparkles size={18} />
            Start Your Legal Journey
          </div>

          <h2 className="mx-auto max-w-4xl text-5xl font-bold leading-tight tracking-tight">
            Justice should be simple,
            <br />
            accessible and powered by AI.
          </h2>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-slate-400">
            Submit complaints, receive AI recommendations, connect with the
            correct authority and track every case from one platform.
          </p>

          <div className="mt-12 flex flex-col justify-center gap-5 sm:flex-row">
            <Link to="/register">
              <Button
                size="lg"
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-10 cursor-pointer w-full sm:w-auto"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            <Link to="/login">
              <Button
                variant="outline"
                size="lg"
                className="rounded-xl border-slate-700 bg-transparent px-10 text-slate-350 hover:bg-slate-800 hover:text-white cursor-pointer w-full sm:w-auto"
              >
                Login Portal
              </Button>
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
};

export default CTA;