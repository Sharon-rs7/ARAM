import { useState } from "react";
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

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

        <Logo />

        <ul className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <li key={item.name}>
              <ScrollLink
                to={item.to}
                smooth
                duration={500}
                offset={-80}
                className="cursor-pointer font-medium text-slate-700 transition hover:text-blue-600"
              >
                {item.name}
              </ScrollLink>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          <Link to="/login">
            <Button variant="outline" className="rounded-full px-6">
              Login
            </Button>
          </Link>

          <Link to="/register">
            <Button className="rounded-full bg-blue-600 px-6 hover:bg-blue-700">
              Get Started
            </Button>
          </Link>
        </div>

        <button
          className="lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={30} /> : <Menu size={30} />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-6 py-6 lg:hidden">
          <div className="flex flex-col gap-5">

            {navItems.map((item) => (
              <ScrollLink
                key={item.name}
                to={item.to}
                smooth
                duration={500}
                offset={-80}
                onClick={() => setMobileOpen(false)}
                className="cursor-pointer text-lg font-medium text-slate-700"
              >
                {item.name}
              </ScrollLink>
            ))}

            <Link to="/login">
              <Button variant="outline" className="w-full rounded-full">
                Login
              </Button>
            </Link>

            <Link to="/register">
              <Button className="w-full rounded-full bg-blue-600 hover:bg-blue-700">
                Get Started
              </Button>
            </Link>

          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;