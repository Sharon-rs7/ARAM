import { ShieldCheck, Target, Eye, HeartHandshake } from "lucide-react";

const cards = [
  {
    icon: Target,
    title: "Our Mission",
    desc: "Empower every citizen with accessible AI-powered legal guidance and transparent complaint resolution.",
  },
  {
    icon: Eye,
    title: "Our Vision",
    desc: "Create a future where justice is simple, transparent and available for everyone.",
  },
  {
    icon: HeartHandshake,
    title: "Our Values",
    desc: "Trust, Privacy, Accessibility, Transparency and Responsible AI.",
  },
];

const About = () => {
  return (
    <section
      id="about"
      className="bg-white py-28"
    >
      <div className="mx-auto grid max-w-[1400px] items-center gap-20 px-6 lg:grid-cols-2">

        <div>

          <span className="rounded-full bg-blue-100 px-5 py-2 font-medium text-blue-600">
            About ARAM
          </span>

          <h2 className="mt-8 text-5xl font-bold text-slate-900">
            AI Powered Legal Assistance
          </h2>

          <p className="mt-8 leading-8 text-lg text-slate-600">
            ARAM is an intelligent legal assistance platform that helps
            citizens identify the right authority, analyse complaints,
            understand legal procedures and monitor complaint progress using AI.
          </p>

          <p className="mt-6 leading-8 text-lg text-slate-600">
            Our platform combines Natural Language Processing, OCR,
            multilingual support and AI recommendations to simplify legal
            assistance for everyone.
          </p>

        </div>

        <div className="grid gap-6">

          {cards.map((item, index) => {

            const Icon = item.icon;

            return (

              <div
                key={index}
                className="rounded-3xl border border-slate-200 p-8 transition hover:-translate-y-2 hover:shadow-xl"
              >

                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                  <Icon size={30} />
                </div>

                <h3 className="mb-3 text-2xl font-bold">
                  {item.title}
                </h3>

                <p className="leading-7 text-slate-500">
                  {item.desc}
                </p>

              </div>

            );

          })}

        </div>

      </div>
    </section>
  );
};

export default About;