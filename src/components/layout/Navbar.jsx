import { useState, useEffect } from "react";
import { Link as ScrollLink } from "react-scroll";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/common/Logo";

const navItems = [
  { name: "Home", to: "hero" },
  { name: "How It Works", to: "how-it-works" },
  { name: "Features", to: "features" },
  { name: "About", to: "about" },
  { name: "Contact", to: "contact" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 w-full ${
        scrolled 
          ? "py-3 bg-white/70 dark:bg-slate-950/70 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm" 
          : "py-5 bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6">
        <Logo />

        <ul className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <li key={item.name}>
              <ScrollLink
                to={item.to}
                smooth
                duration={500}
                offset={-80}
                className="cursor-pointer text-sm font-semibold text-slate-600 dark:text-slate-300 transition hover:text-indigo-600 dark:hover:text-indigo-400 relative py-2 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-indigo-600 dark:after:bg-indigo-400 after:transition-all hover:after:w-full"
              >
                {item.name}
              </ScrollLink>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-4 lg:flex">
          <Link to="/login">
            <Button variant="ghost" className="rounded-full px-6 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              Login
            </Button>
          </Link>

          <Link to="/register">
            <Button className="rounded-full bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-650 px-6 text-sm font-bold text-white shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 btn-premium">
              Get Started
            </Button>
          </Link>
        </div>

        <button
          className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-slate-200/50 dark:border-slate-800/50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg px-6 py-6 lg:hidden animate-in fade-in slide-in-from-top-5 duration-200">
          <div className="flex flex-col gap-5">
            {navItems.map((item) => (
              <ScrollLink
                key={item.name}
                to={item.to}
                smooth
                duration={500}
                offset={-80}
                onClick={() => setMobileOpen(false)}
                className="cursor-pointer text-base font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                {item.name}
              </ScrollLink>
            ))}

            <hr className="border-slate-200/60 dark:border-slate-800/60" />

            <div className="flex gap-4">
              <Link to="/login" className="flex-1">
                <Button variant="outline" className="w-full rounded-full border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200">
                  Login
                </Button>
              </Link>

              <Link to="/register" className="flex-1">
                <Button className="w-full rounded-full bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-650">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;