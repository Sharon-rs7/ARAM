import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "@/components/common/Logo";
import { 
  Menu, X, Shield, Globe, Award, Sparkles, LogIn, ChevronDown, Check,
  Sun, Moon
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { resolvedTheme, setMode } = useTheme();
  const { language, changeLanguage, availableLanguages, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: t("nav.home", "Home"), href: "/" },
    { name: t("nav.about", "About"), href: "/about" },
    { name: t("nav.services", "Services"), href: "/services" },
    { name: t("nav.trackGrievance", "Track Grievance"), href: "/track-complaint" },
    { name: t("nav.contact", "Contact"), href: "/contact" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? "bg-[#FFFDF8]/95 backdrop-blur-md shadow-sm border-b border-[#E6E1D8]" 
        : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          <Logo size="md" />

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`text-xs font-bold uppercase tracking-wider transition hover:text-[#1F5948] ${
                  location.pathname === link.href ? "text-[#163D32] border-b-2 border-[#163D32] pb-1" : "text-[#65736D]"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Language & Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-[#E6E1D8] bg-[#FFFDF8] text-xs font-bold text-[#18332B] hover:bg-[#DCEBDD]/40 transition shadow-2xs cursor-pointer min-h-[38px]"
                aria-label="Select platform language"
              >
                <Globe size={15} className="text-[#163D32]" />
                <span>{availableLanguages.find(l => l.code === language)?.nativeLabel || "English"}</span>
                <ChevronDown size={13} className={`transition-transform duration-200 ${langMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#FFFDF8] border border-[#E6E1D8] shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#65736D] border-b border-[#E6E1D8]/60">
                    Choose Language / மொழி
                  </div>
                  {availableLanguages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        changeLanguage(l.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-medium transition flex items-center justify-between cursor-pointer ${
                        language === l.code ? "bg-[#DCEBDD]/60 text-[#163D32] font-bold" : "text-[#18332B] hover:bg-[#DCEBDD]/30"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="font-semibold">{l.nativeLabel}</span>
                        <span className="text-[11px] text-[#65736D]">({l.label})</span>
                      </span>
                      {language === l.code && <Check size={14} className="text-[#163D32] shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Light / Dark Mode Toggle Button */}
            <button
              type="button"
              onClick={() => setMode(resolvedTheme === "dark" ? "LIGHT" : "DARK")}
              className="p-2.5 rounded-full border border-[#E6E1D8] bg-[#FFFDF8] text-[#163D32] hover:bg-[#DCEBDD]/40 transition cursor-pointer flex items-center justify-center shadow-2xs min-h-[38px] min-w-[38px]"
              title={resolvedTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle theme"
            >
              {resolvedTheme === "dark" ? (
                <Sun size={16} className="text-[#C58A25]" />
              ) : (
                <Moon size={16} className="text-[#163D32]" />
              )}
            </button>

            {user ? (
              <Link
                to={user.role === "ADMIN" ? "/admin/dashboard" : user.role === "VOLUNTEER" || user.role === "GUIDE" ? "/guide/dashboard" : "/citizen/dashboard"}
                className="btn-aram-primary text-xs py-2 px-4 shadow-sm"
              >
                {t("nav.dashboard", "Dashboard")}
              </Link>
            ) : (
              <Link to="/login" className="btn-aram-primary text-xs flex items-center gap-2 py-2 px-4 shadow-sm">
                <LogIn size={15} />
                <span>{t("nav.signIn", "Sign In")}</span>
              </Link>
            )}
          </div>

          {/* Mobile top actions & hamburger */}
          <div className="md:hidden flex items-center gap-2">
            {/* Quick Mobile Theme Button */}
            <button
              type="button"
              onClick={() => setMode(resolvedTheme === "dark" ? "LIGHT" : "DARK")}
              className="p-2 rounded-xl border border-[#E6E1D8] bg-[#FFFDF8] text-[#163D32] min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer shadow-2xs"
              aria-label="Toggle color theme"
            >
              {resolvedTheme === "dark" ? <Sun size={15} className="text-[#C58A25]" /> : <Moon size={15} className="text-[#163D32]" />}
            </button>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-[#E6E1D8] bg-[#FFFDF8] text-[#163D32] hover:bg-[#DCEBDD]/40 min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer shadow-2xs"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FFFDF8] border-b border-[#E6E1D8] px-5 pt-3 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top-3 duration-200">
          
          {/* Trilingual Mobile Selector Pill Bar */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-black uppercase tracking-wider text-[#65736D]">
              Platform Language / மொழி
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#F7F1E6] border border-[#E6E1D8]">
              {availableLanguages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => {
                    changeLanguage(l.code);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer text-center min-h-[36px] flex items-center justify-center gap-1 ${
                    language === l.code
                      ? "bg-[#163D32] text-white shadow-xs"
                      : "text-[#18332B] hover:bg-white/70"
                  }`}
                >
                  <span>{l.nativeLabel}</span>
                  {language === l.code && <Check size={11} className="text-[#DCEBDD]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1 pt-1 border-t border-[#E6E1D8]/60">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition min-h-[44px] flex items-center ${
                  location.pathname === link.href
                    ? "bg-[#DCEBDD]/50 text-[#163D32]"
                    : "text-[#18332B] hover:bg-[#F7F1E6] hover:text-[#1F5948]"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* User Sign In / Dashboard CTA */}
          <div className="pt-2 border-t border-[#E6E1D8]">
            <Link
              to={user ? (user.role === "ADMIN" ? "/admin/dashboard" : user.role === "VOLUNTEER" || user.role === "GUIDE" ? "/guide/dashboard" : "/citizen/dashboard") : "/login"}
              onClick={() => setMobileMenuOpen(false)}
              className="btn-aram-primary w-full text-center text-xs py-3 min-h-[44px] flex items-center justify-center gap-2 shadow-sm"
            >
              {user ? (
                <span>{t("nav.dashboard", "Open Dashboard")}</span>
              ) : (
                <>
                  <LogIn size={15} />
                  <span>{t("nav.signIn", "Sign In to ARAM")}</span>
                </>
              )}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
