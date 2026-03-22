import React from "react";
import { Link } from "react-router-dom";
import { 
  Mail, 
  Phone, 
  Instagram, 
  Twitter, 
  Facebook, 
  Linkedin 
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 py-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-sm text-zinc-400">

        {/* Brand & Mission */}
        <div>
          <div className="text-xl font-semibold mb-4 text-white">
            <span className="text-blue-500 font-bold">Q</span>uantora
          </div>
          <p className="leading-relaxed">
            The digital terminal for modern commerce. Engineered to help 
            Nigerian SMEs scale with data-driven precision.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-zinc-200 font-semibold mb-4 underline decoration-blue-500/50 underline-offset-8">Platform</h4>
          <ul className="space-y-3">
            <li><a href="#features" className="hover:text-white transition-colors">System Features</a></li>
            <li><a href="#audience" className="hover:text-white transition-colors">Target Sectors</a></li>
            <li><a href="#faq" className="hover:text-white transition-colors">Help Center</a></li>
            <li><a href="#cta" className="hover:text-white transition-colors">Initialize Terminal</a></li>
          </ul>
        </div>

        {/* Support & Contact */}
        <div>
          <h4 className="text-zinc-200 font-semibold mb-4 underline decoration-blue-500/50 underline-offset-8">Support</h4>
          <ul className="space-y-4">
            <li>
              <a href="tel:09117886797" className="flex items-center gap-3 hover:text-white transition-colors">
                <Phone size={16} className="text-blue-500" />
                09117886797
              </a>
            </li>
            <li>
              <a href="mailto:quantora.nigeria@gmail.com" className="flex items-center gap-3 hover:text-white transition-colors">
                <Mail size={16} className="text-blue-500" />
                quantora.nigeria@gmail.com
              </a>
            </li>
          </ul>
        </div>

        {/* Social Presence */}
        <div>
          <h4 className="text-zinc-200 font-semibold mb-4 underline decoration-blue-500/50 underline-offset-8">Connect</h4>
          <div className="grid grid-cols-2 gap-y-4 gap-x-2">
            <a href="https://instagram.com/quantora.nigeria" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
              <Instagram size={16} /> Instagram
            </a>
            <a href="https://x.com/QuantoraNigeria" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
              <Twitter size={16} /> X (Twitter)
            </a>
            <a href="https://facebook.com/quantoraNigeria" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
              <Facebook size={16} /> Facebook
            </a>
            <a href="https://www.linkedin.com/in/quantora-nigeria-79b7733b6" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
              <Linkedin size={16} /> LinkedIn
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-500">
        <p>© {new Date().getFullYear()} Quantora Operations. All rights reserved.</p>
        <div className="flex gap-8">
          <Link to="/privacy" className="hover:text-zinc-300">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-zinc-300">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}