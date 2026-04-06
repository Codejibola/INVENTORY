import React from "react";
import { Link } from "react-router-dom";
import { 
  Mail, 
  Phone, 
  Instagram, 
  Twitter, 
  Linkedin,
  ArrowUpRight,
  MessageCircle // Added for WhatsApp
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const phoneNumber = "09117886797";
  const whatsappLink = `https://wa.me/234${phoneNumber.substring(1)}`; // Formats to international standard

  return (
    <footer className="relative bg-zinc-950 border-t border-zinc-900 pt-20 pb-10 overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
        
        {/* Brand Section - Takes 4 columns */}
        <div className="lg:col-span-4 space-y-6">
          <div className="text-2xl font-bold text-white tracking-tighter">
            <span className="text-blue-500">Q</span>uantora
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
            The digital terminal for modern commerce. Engineered to help 
            Nigerian SMEs scale with data-driven precision and cloud-native reliability.
          </p>
          <div className="flex gap-4">
            <SocialIcon icon={<Instagram size={18} />} href="https://instagram.com/quantora.nigeria" />
            <SocialIcon icon={<Twitter size={18} />} href="https://x.com/QuantoraNigeria" />
            <SocialIcon icon={<Linkedin size={18} />} href="https://www.linkedin.com/in/quantora-nigeria-79b7733b6" />
            {/* Added WhatsApp to Social Row */}
            <SocialIcon icon={<MessageCircle size={18} />} href={whatsappLink} />
          </div>
        </div>

        {/* Quick Links - 2 columns */}
        <div className="lg:col-span-2">
          <FooterHeader>Platform</FooterHeader>
          <ul className="space-y-3">
            <FooterLink href="#features">Features</FooterLink>
            <FooterLink href="#audience">Sectors</FooterLink>
            <FooterLink href="#faq">Help Center</FooterLink>
            <FooterLink href="#cta">Terminal Login</FooterLink>
          </ul>
        </div>

        {/* Contact Info - 3 columns */}
        <div className="lg:col-span-3">
          <FooterHeader>Support</FooterHeader>
          <ul className="space-y-4">
            {/* WhatsApp Item */}
            <li>
              <a href={whatsappLink} target="_blank" rel="noreferrer" className="group flex items-center gap-3 text-zinc-400 hover:text-white transition-colors text-sm">
                <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-green-500/10 group-hover:text-green-500 transition-colors">
                  <MessageCircle size={16} />
                </div>
                WhatsApp Support
              </a>
            </li>
            <li>
              <a href={`tel:${phoneNumber}`} className="group flex items-center gap-3 text-zinc-400 hover:text-white transition-colors text-sm">
                <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-colors">
                  <Phone size={16} />
                </div>
                {phoneNumber}
              </a>
            </li>
            <li>
              <a href="mailto:quantora.nigeria@gmail.com" className="group flex items-center gap-3 text-zinc-400 hover:text-white transition-colors text-sm">
                <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-colors">
                  <Mail size={16} />
                </div>
                quantora.nigeria@gmail.com
              </a>
            </li>
          </ul>
        </div>

        {/* Newsletter / Status - 3 columns */}
        <div className="lg:col-span-3">
          <FooterHeader>System Status</FooterHeader>
          <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-zinc-200 uppercase tracking-widest">Systems Nominal</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-tight">
              Quantora is up and running smoothly for all shops at 99.9% efficiency.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-[11px] text-zinc-500 font-medium">
          © {currentYear} Quantora Operations. <span className="hidden md:inline">Built for the future of Nigerian Trade.</span>
        </p>
        <div className="flex gap-6 text-[11px] font-bold uppercase tracking-widest">
          <Link to="/privacy" className="text-zinc-500 hover:text-blue-500 transition-colors">Privacy</Link>
          <Link to="/terms" className="text-zinc-500 hover:text-blue-500 transition-colors">Terms</Link>
        </div>
      </div>
    </footer>
  );
}

// Sub-components stay the same...
function FooterHeader({ children }) {
  return <h4 className="text-white text-xs font-bold uppercase tracking-[0.2em] mb-6">{children}</h4>;
}

function FooterLink({ href, children }) {
  return (
    <li>
      <a href={href} className="group flex items-center gap-1 text-zinc-400 hover:text-blue-400 transition-all text-sm">
        {children}
        <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-all -translate-y-1" />
      </a>
    </li>
  );
}

function SocialIcon({ icon, href }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noreferrer" 
      className="p-2.5 bg-zinc-900 text-zinc-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
    >
      {icon}
    </a>
  );
}