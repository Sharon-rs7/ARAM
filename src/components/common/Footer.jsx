import { Link } from "react-router-dom";
import Logo from "@/components/common/Logo";
import { PhoneCall, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#163D32] text-white border-t border-[#1F5948]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          
          {/* Brand Info */}
          <div className="space-y-3.5 sm:col-span-2 lg:col-span-1">
            <Logo size="md" light={true} />
            <p className="text-xs text-[#DCEBDD]/80 leading-relaxed">
              Accessible Rights & Assistance Management System. Grounded AI legal triage and accredited human guide support for every citizen.
            </p>
            <div className="text-[11px] text-[#DCEBDD]/70 font-mono pt-1">
              Official Gateway: <span className="text-white font-semibold">ouraramsupport@gmail.com</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#DCEBDD]">Citizen Services</h4>
            <ul className="space-y-2 text-xs text-white/80">
              <li><Link to="/citizen/chatbot" className="hover:text-white transition block py-1">Ask ARAM AI Assistant</Link></li>
              <li><Link to="/citizen/submit-complaint" className="hover:text-white transition block py-1">File Legal Grievance</Link></li>
              <li><Link to="/track-complaint" className="hover:text-white transition block py-1">Track Case Milestone</Link></li>
              <li><Link to="/citizen/documents" className="hover:text-white transition block py-1">Document Readiness Vault</Link></li>
            </ul>
          </div>

          {/* Legal Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#DCEBDD]">Legal Frameworks</h4>
            <ul className="space-y-2 text-xs text-white/80">
              <li><Link to="/citizen/help" className="hover:text-white transition block py-1">DLSA & Free Legal Aid</Link></li>
              <li><Link to="/terms" className="hover:text-white transition block py-1">Terms & Legal Disclaimers</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition block py-1">Data Privacy & PII Masking</Link></li>
              <li><Link to="/about" className="hover:text-white transition block py-1">About ARAM Architecture</Link></li>
            </ul>
          </div>

          {/* Helplines */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#DCEBDD]">Statutory Helplines</h4>
            <div className="space-y-2 text-xs text-[#DCEBDD]/90">
              <a href="tel:15100" className="flex items-center gap-1.5 hover:text-white transition py-0.5" title="Call Legal Aid">
                <PhoneCall size={12} className="text-[#DCEBDD]" />
                <span>Legal Aid (NALSA): <strong className="text-white font-mono">15100</strong></span>
              </a>
              <a href="tel:181" className="flex items-center gap-1.5 hover:text-white transition py-0.5" title="Call Women Helpline">
                <PhoneCall size={12} className="text-[#DCEBDD]" />
                <span>Women Protection: <strong className="text-white font-mono">181</strong></span>
              </a>
              <a href="tel:112" className="flex items-center gap-1.5 hover:text-white transition py-0.5" title="Call Emergency Services">
                <PhoneCall size={12} className="text-[#DCEBDD]" />
                <span>Emergency Police/Med: <strong className="text-white font-mono">112</strong></span>
              </a>
              <a href="tel:1930" className="flex items-center gap-1.5 hover:text-white transition py-0.5" title="Call Cyber Crime Helpline">
                <PhoneCall size={12} className="text-[#DCEBDD]" />
                <span>Cyber Crime Portal: <strong className="text-white font-mono">1930</strong></span>
              </a>
            </div>
          </div>

        </div>

        <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] sm:text-xs text-[#DCEBDD]/60 gap-3 text-center sm:text-left">
          <p>© 2026 ARAM AI. Non-commercial civic legal assistance platform.</p>
          <p className="flex items-center justify-center gap-1">
            Built with <Heart size={12} className="text-[#B96845] fill-[#B96845]" /> for accessible justice
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
