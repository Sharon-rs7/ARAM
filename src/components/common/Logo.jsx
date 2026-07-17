import { Scale } from "lucide-react";

const Logo = () => {
  return (
    <div className="flex items-center gap-3 cursor-pointer">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-lg">
        <Scale className="h-6 w-6 text-white" strokeWidth={2.5} />
      </div>

      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          ARAM
        </h1>

        <p className="text-xs text-slate-500">
          AI Legal Assistance Platform
        </p>
      </div>
    </div>
  );
};

export default Logo;