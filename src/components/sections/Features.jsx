import {
  BrainCircuit,
  Landmark,
  ShieldCheck,
  FileCheck2,
  Mic,
  Clock3,
  Lock,
  Users,
} from "lucide-react";

const features = [
  {
    icon: BrainCircuit,
    title: "AI Complaint Analysis",
    description:
      "Automatically understands complaints using advanced AI and NLP.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Landmark,
    title: "Right Authority",
    description:
      "Suggests the correct government department instantly.",
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    icon: ShieldCheck,
    title: "Priority Detection",
    description:
      "Detects urgent cases and assigns high priority.",
    color: "bg-red-100 text-red-500",
  },
  {
    icon: FileCheck2,
    title: "OCR Verification",
    description:
      "Reads uploaded documents and extracts important details.",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: Mic,
    title: "Voice Complaint",
    description:
      "Citizens can record complaints in their own language.",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: Clock3,
    title: "Track Status",
    description:
      "Monitor complaint progress in real time.",
    color: "bg-orange-100 text-orange-600",
  },
  {
    icon: Lock,
    title: "Privacy Protection",
    description:
      "Secure complaint storage with encrypted data.",
    color: "bg-cyan-100 text-cyan-600",
  },
  {
    icon: Users,
    title: "Verified Volunteers",
    description:
      "Connect with trained legal volunteers for assistance.",
    color: "bg-emerald-100 text-emerald-600",
  },
];

const Features = () => {
  return (
    <section
      id="features"
      className="bg-white py-28"
    >
      <div className="mx-auto max-w-[1400px] px-6">

        <div className="mb-16 text-center">

          <h2 className="text-5xl font-bold text-slate-900">
            Powerful Features
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-500">
            Everything you need to analyse complaints, identify authorities,
            protect citizen data and monitor case progress.
          </p>

        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">

          {features.map((item, index) => {

            const Icon = item.icon;

            return (

              <div
                key={index}
                className="group rounded-3xl border border-slate-200 bg-white p-8 transition-all duration-300 hover:-translate-y-2 hover:border-blue-300 hover:shadow-xl"
              >

                <div
                  className={`mb-8 flex h-16 w-16 items-center justify-center rounded-2xl ${item.color}`}
                >
                  <Icon size={30} />
                </div>

                <h3 className="mb-4 text-xl font-bold text-slate-900">
                  {item.title}
                </h3>

                <p className="leading-7 text-slate-500">
                  {item.description}
                </p>

              </div>

            );
          })}

        </div>

      </div>
    </section>
  );
};

export default Features;