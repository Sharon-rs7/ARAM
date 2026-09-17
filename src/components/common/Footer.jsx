import { Link } from "react-router-dom";
import Logo from "@/components/common/Logo";
import { Scale, Mail, Phone, MapPin, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#163D32] text-white border-t border-[#1F5948]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Logo size="md" light={true} />
            <p className="text-xs text-[#DCEBDD]/80 leading-relaxed">
              Accessible Rights & Assistance Management System. Grounded AI legal triage and human guide support for every citizen.
            </p>
            <p className="text-[11px] text-[#DCEBDD]/60 font-mono">
              Official Sender: ouraramsupport@gmail.com
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#DCEBDD]">Citizen Services</h4>
            <ul className="space-y-2 text-xs text-white/80">
              <li><Link to="/citizen/chatbot" className="hover:text-white transition">Ask ARAM AI Legal Assistant</Link></li>
              <li><Link to="/citizen/submit-complaint" className="hover:text-white transition">File Legal Grievance</Link></li>
              <li><Link to="/track-complaint" className="hover:text-white transition">Track Case Milestone</Link></li>
              <li><Link to="/citizen/documents" className="hover:text-white transition">Document Readiness Vault</Link></li>
            </ul>
          </div>

          {/* Legal Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#DCEBDD]">Legal Frameworks</h4>
            <ul className="space-y-2 text-xs text-white/80">
              <li><Link to="/citizen/help" className="hover:text-white transition">DLSA & Free Legal Aid</Link></li>
              <li><Link to="/terms" className="hover:text-white transition">Terms & Legal Disclaimers</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition">Data Privacy & PII Masking</Link></li>
              <li><Link to="/about" className="hover:text-white transition">About ARAM AI Architecture</Link></li>
            </ul>
          </div>

          {/* Helplines */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#DCEBDD]">Statutory Helplines</h4>
            <div className="space-y-1.5 text-xs text-[#DCEBDD]/90">
              <p>📞 National Legal Aid: <strong>15100</strong></p>
              <p>📞 Women Protection: <strong>181</strong></p>
              <p>📞 Emergency Services: <strong>112</strong></p>
              <p>📞 Cyber Crime Portal: <strong>1930</strong></p>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#DCEBDD]/60 gap-4">
          <p>© 2026 ARAM AI. Non-commercial civic legal assistance platform.</p>
          <p className="flex items-center gap-1">
            Built with <Heart size={12} className="text-[#B96845] fill-[#B96845]" /> for accessible justice
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
