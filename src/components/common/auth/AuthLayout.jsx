import AuthBanner from "@/components/common/auth/AuthBanner";
import Logo from "@/components/common/Logo";
import { Sparkles, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const AuthLayout = ({ children }) => {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F4F6F4] dark:bg-[#0C1412] text-[#18332B] dark:text-slate-100 transition-colors duration-300 font-sans selection:bg-[#163D32] selection:text-white">
      {/* Left Institutional Civic Brand Showcase (Desktop / Tablet Large) */}
      <AuthBanner />

      {/* Right Form & Mobile Experience Container */}
      <div className="flex-1 flex flex-col items-center justify-start lg:justify-center px-4 py-4 sm:px-8 sm:py-8 lg:p-12 xl:p-16 relative overflow-y-auto min-h-screen">
        
        {/* Subtle Ambient Radial Lighting for Mobile & Desktop */}
        <div className="absolute top-0 right-0 w-72 sm:w-[500px] h-72 sm:h-[500px] bg-gradient-to-bl from-[#DCEBDD]/40 via-transparent to-transparent dark:from-[#1F5948]/20 pointer-events-none blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 sm:w-[400px] h-64 sm:h-[400px] bg-gradient-to-tr from-[#163D32]/5 via-transparent to-transparent dark:from-[#163D32]/25 pointer-events-none blur-3xl" />

        {/* Mobile-Only Header (< lg) */}
        <header className="w-full max-w-md lg:hidden flex flex-col items-center text-center pt-2 pb-5 z-10">
          <div className="flex items-center justify-between w-full mb-3">
            <Logo size="md" />
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#DCEBDD] dark:bg-emerald-950/60 border border-[#C5DDC6] dark:border-emerald-800/40 text-[10px] font-bold text-[#163D32] dark:text-emerald-300 uppercase tracking-wider">
              <ShieldCheck size={12} className="text-[#1F5948] dark:text-emerald-400" />
              <span>{t("auth.layout.mobileBadge", "TN Legal Copilot")}</span>
            </div>
          </div>
          <p className="text-[11px] text-[#65736D] dark:text-slate-400 font-medium">
            {t("auth.layout.mobileSubtitle", "Accessible Rights & Assistance Management System")}
          </p>
        </header>

        {/* Main Interactive Form Card Container */}
        <div className="w-full max-w-md relative z-10 my-auto pb-8 sm:pb-6">
          {children}
        </div>

        {/* Mobile-Only Footer Note */}
        <footer className="w-full max-w-md lg:hidden text-center text-[10px] text-[#8B9690] dark:text-slate-500 pb-4 z-10">
          <span>{t("auth.layout.mobileFooter", "End-to-End Encrypted • Govt. of TN Civic Aid")}</span>
        </footer>
      </div>
    </main>
  );
};

export default AuthLayout;