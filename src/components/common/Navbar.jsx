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
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E6E1D8] bg-[#FFFDF8] text-xs font-bold text-[#18332B] hover:bg-[#DCEBDD]/40 transition"
              >
                <Globe size={14} className="text-[#163D32]" />
                <span>{availableLanguages.find(l => l.code === language)?.label || "English"}</span>
                <ChevronDown size={12} />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-36 rounded-2xl bg-[#FFFDF8] border border-[#E6E1D8] shadow-lg py-2 z-50">
                  {availableLanguages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        changeLanguage(l.code);
                        setLangMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-[#18332B] hover:bg-[#DCEBDD]/40 flex items-center justify-between"
                    >
                      <span>{l.label}</span>
                      {language === l.code && <Check size={12} className="text-[#163D32]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Light / Dark Mode Toggle Button */}
            <button
              type="button"
              onClick={() => setMode(resolvedTheme === "dark" ? "LIGHT" : "DARK")}
              className="p-2 rounded-full border border-[#E6E1D8] bg-[#FFFDF8] text-[#163D32] hover:bg-[#DCEBDD]/40 transition cursor-pointer flex items-center justify-center shadow-2xs"
              title={resolvedTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle theme"
            >
              {resolvedTheme === "dark" ? (
                <Sun size={15} className="text-[#C58A25]" />
              ) : (
                <Moon size={15} className="text-[#163D32]" />
              )}
            </button>

            {user ? (
              <Link
                to={user.role === "ADMIN" ? "/admin/dashboard" : user.role === "VOLUNTEER" || user.role === "GUIDE" ? "/guide/dashboard" : "/citizen/dashboard"}
                className="btn-aram-primary text-xs"
              >
                {t("nav.dashboard", "Dashboard")}
              </Link>
            ) : (
              <Link to="/login" className="btn-aram-primary text-xs flex items-center gap-1.5">
                <LogIn size={14} />
                <span>{t("nav.signIn", "Sign In")}</span>
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#163D32] hover:bg-[#DCEBDD]/40"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FFFDF8] border-b border-[#E6E1D8] px-4 pt-2 pb-6 space-y-3 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-xs font-bold text-[#18332B] uppercase tracking-wider hover:text-[#1F5948]"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-[#E6E1D8] flex flex-col gap-3">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-aram-primary text-center text-xs"
            >
              {user ? t("nav.dashboard", "Open Dashboard") : t("nav.signIn", "Sign In to ARAM")}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
