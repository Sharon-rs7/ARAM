import { Link } from "react-router-dom";
import Logo from "@/components/common/Logo";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-white">
      <div className="mx-auto max-w-[1400px] px-6 py-20">
        <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo */}
          <div>
            <Logo />

            <p className="mt-6 leading-7 text-slate-400">
              ARAM is an AI-powered legal assistance platform helping
              citizens receive legal guidance, submit complaints,
              identify the right authority and track case progress
              intelligently.
            </p>

            <div className="mt-8 flex gap-4">
              <a
                href="#"
                className="rounded-xl bg-slate-800 p-3 transition hover:bg-blue-600"
              >
                <FaFacebookF size={18} />
              </a>

              <a
                href="#"
                className="rounded-xl bg-slate-800 p-3 transition hover:bg-pink-600"
              >
                <FaInstagram size={18} />
              </a>

              <a
                href="#"
                className="rounded-xl bg-slate-800 p-3 transition hover:bg-sky-600"
              >
                <FaLinkedinIn size={18} />
              </a>

              <a
                href="#"
                className="rounded-xl bg-slate-800 p-3 transition hover:bg-slate-700"
              >
                <FaGithub size={18} />
              </a>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-6 text-xl font-semibold">
              Company
            </h3>

            <ul className="space-y-4 text-slate-400">
              <li>
                <Link to="/" className="cursor-pointer hover:text-white transition">Home</Link>
              </li>

              <li className="cursor-pointer hover:text-white transition">
                How It Works
              </li>

              <li className="cursor-pointer hover:text-white transition">
                Features
              </li>

              <li className="cursor-pointer hover:text-white transition">
                About
              </li>

              <li className="cursor-pointer hover:text-white transition">
                Contact
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-6 text-xl font-semibold">
              Legal
            </h3>

            <ul className="space-y-4 text-slate-400">
              <li>
                <Link to="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link>
              </li>

              <li>
                <Link to="/terms-conditions" className="hover:text-white transition">Terms & Conditions</Link>
              </li>

              <li>
                <Link to="/cookie-policy" className="hover:text-white transition">Cookie Policy</Link>
              </li>

              <li>
                <Link to="/disclaimer" className="hover:text-white transition">Disclaimer</Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-6 text-xl font-semibold">
              Resources
            </h3>

            <ul className="space-y-4 text-slate-400">
              <li className="cursor-pointer hover:text-white transition">
                Help Center
              </li>

              <li className="cursor-pointer hover:text-white transition">
                Documentation
              </li>

              <li className="cursor-pointer hover:text-white transition">
                AI Support
              </li>

              <li className="cursor-pointer hover:text-white transition">
                FAQ
              </li>
            </ul>
          </div>
        </div>

        {/* Warning / Legal Disclaimer footnote */}
        <div className="mt-12 p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-400 leading-relaxed max-w-4xl">
          <strong>Important Disclaimer:</strong> ARAM provides preliminary complaint guidance only. It does not replace police, court, lawyer, or official authority. We do not provide formal legal counsel or represent governmental judicial bodies.
        </div>

        <div className="my-10 border-t border-slate-800"></div>

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-slate-400">
            © 2026 ARAM. All Rights Reserved.
          </p>

          <p className="text-slate-500">
            Built with ❤️ using React, Tailwind CSS & Spring Boot
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;