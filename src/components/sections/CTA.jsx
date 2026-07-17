import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="bg-slate-900 py-28">
      <div className="mx-auto max-w-[1400px] px-6">

        <div className="overflow-hidden rounded-[40px] bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-16 text-center text-white shadow-2xl">

          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-2">
            <Sparkles size={18} />
            Start Your Legal Journey
          </div>

          <h2 className="mx-auto max-w-4xl text-5xl font-bold leading-tight">
            Justice should be simple,
            <br />
            accessible and powered by AI.
          </h2>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-blue-100">
            Submit complaints, receive AI recommendations, connect with the
            correct authority and track every case from one platform.
          </p>

          <div className="mt-12 flex flex-col justify-center gap-5 sm:flex-row">
            <Link to="/register">
              <Button
                size="lg"
                className="rounded-xl bg-white px-10 text-blue-700 hover:bg-slate-100 cursor-pointer w-full sm:w-auto"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            <Link to="/login">
              <Button
                variant="outline"
                size="lg"
                className="rounded-xl border-white bg-transparent px-10 text-white hover:bg-white hover:text-blue-700 cursor-pointer w-full sm:w-auto"
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