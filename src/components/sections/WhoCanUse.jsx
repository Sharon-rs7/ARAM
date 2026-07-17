import {
  Users,
  UserRound,
  Landmark,
  Scale,
} from "lucide-react";

const users = [
  {
    icon: UserRound,
    title: "Citizens",
    desc: "Submit complaints and receive AI guidance.",
  },
  {
    icon: Scale,
    title: "Legal Volunteers",
    desc: "Assist citizens and provide legal support.",
  },
  {
    icon: Landmark,
    title: "Government Officials",
    desc: "Review and resolve assigned complaints.",
  },
  {
    icon: Users,
    title: "Administrators",
    desc: "Monitor platform activities and analytics.",
  },
];

const WhoCanUse = () => {
  return (
    <section className="bg-slate-50 py-28">
      <div className="mx-auto max-w-[1400px] px-6">

        <div className="text-center">

          <h2 className="text-5xl font-bold text-slate-900">
            Who Can Use ARAM
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-500">
            Built for every stakeholder involved in the legal assistance
            ecosystem.
          </p>

        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-2 xl:grid-cols-4">

          {users.map((user, index) => {

            const Icon = user.icon;

            return (

              <div
                key={index}
                className="rounded-3xl bg-white p-8 shadow-sm transition hover:-translate-y-2 hover:shadow-xl"
              >

                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                  <Icon size={30} />
                </div>

                <h3 className="mb-4 text-2xl font-bold">
                  {user.title}
                </h3>

                <p className="leading-7 text-slate-500">
                  {user.desc}
                </p>

              </div>

            );

          })}

        </div>

      </div>
    </section>
  );
};

export default WhoCanUse;