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
    <section className="bg-slate-50 dark:bg-[#07090c] py-28 transition-colors duration-300">
      <div className="mx-auto max-w-[1400px] px-6">

        <div className="text-center">

          <h2 className="text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
            Who Can Use ARAM
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-500 dark:text-slate-400 font-medium">
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
                className="rounded-3xl bg-white dark:bg-[#101217] p-8 border border-slate-100 dark:border-slate-800 shadow-sm transition hover:-translate-y-2 hover:shadow-xl dark:hover:shadow-black/20"
              >

                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 dark:bg-indigo-950/40 text-blue-600 dark:text-indigo-400">
                  <Icon size={30} />
                </div>

                <h3 className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {user.title}
                </h3>

                <p className="leading-7 text-slate-500 dark:text-slate-400">
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