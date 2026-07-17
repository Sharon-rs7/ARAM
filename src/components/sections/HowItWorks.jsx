import {
  FileText,
  BrainCircuit,
  Landmark,
  ClipboardCheck,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: FileText,
    title: "Submit Complaint",
    description:
      "Describe your issue by typing, uploading documents or using voice input.",
  },
  {
    icon: BrainCircuit,
    title: "AI Analysis",
    description:
      "Our AI identifies the complaint category, urgency and legal information.",
  },
  {
    icon: Landmark,
    title: "Right Authority",
    description:
      "The complaint is automatically routed to the correct government department.",
  },
  {
    icon: ClipboardCheck,
    title: "Track Progress",
    description:
      "Monitor complaint status and receive notifications until resolved.",
  },
];

const HowItWorks = () => {
  return (
    <section
      id="how-it-works"
      className="bg-slate-50 py-28"
    >
      <div className="mx-auto max-w-[1400px] px-6">

        <div className="mb-16 text-center">

          <h2 className="text-5xl font-bold text-slate-900">
            How ARAM Works
          </h2>

          <p className="mt-5 text-lg text-slate-500">
            Get legal guidance in four simple steps.
          </p>

        </div>

        <div className="grid gap-8 lg:grid-cols-4">

          {steps.map((step, index) => {

            const Icon = step.icon;

            return (

              <div
                key={index}
                className="relative rounded-3xl bg-white p-8 shadow-sm transition hover:-translate-y-2 hover:shadow-xl"
              >

                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                  <Icon size={30} />
                </div>

                <h3 className="mb-4 text-xl font-bold">
                  {step.title}
                </h3>

                <p className="leading-7 text-slate-500">
                  {step.description}
                </p>

                {index !== steps.length - 1 && (
                  <ArrowRight
                    className="absolute -right-6 top-16 hidden text-blue-500 xl:block"
                    size={30}
                  />
                )}

              </div>

            );
          })}

        </div>

        <div className="mt-20 rounded-3xl bg-gradient-to-r from-slate-900 to-blue-700 p-10 text-white">

          <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">

            <div>

              <h3 className="text-3xl font-bold">
                AI makes legal help faster and accessible.
              </h3>

              <p className="mt-3 text-blue-100">
                ARAM analyses complaints, identifies authorities and helps every
                citizen reach the right department.
              </p>

            </div>

            <Button
              className="rounded-xl bg-white px-8 text-slate-900 hover:bg-slate-100"
            >
              Get Started Now
            </Button>

          </div>

        </div>

      </div>
    </section>
  );
};

export default HowItWorks;