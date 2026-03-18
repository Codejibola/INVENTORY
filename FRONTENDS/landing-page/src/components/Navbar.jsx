/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.webp";
import { useState, useRef, useEffect } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Features", href: "#features" },
  { label: "Who It’s For", href: "#audience" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const openButtonRef = useRef(null);

  // Close menu when clicking/tapping outside the menu or the open button
  useEffect(() => {
    if (!open) return;
    const handleOutside = (e) => {
      const target = e.target;
      if (menuRef.current && menuRef.current.contains(target)) return;
      if (openButtonRef.current && openButtonRef.current.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [open]);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-800">
      {/* Increased height to h-20 for a more modern, airy feel */}
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo and Nav Group */}
        <div className="flex items-center gap-10">
          <a href="#hero" className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <img src={logo} alt="Quantora Logo" className="h-8 w-auto" />
            <span className="text-white">
              <span className="text-blue-500 font-bold">Q</span>uantora
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-300">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="relative py-2 group hover:text-white transition"
              >
                {link.label}
                {/* Subtle hover underline */}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </nav>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center">
            <a
                href="https://quantora-app.vercel.app"
                className="bg-white hover:bg-zinc-200 transition px-5 py-2.5 rounded-full font-semibold text-zinc-950 text-sm"
            >
                Get Started
            </a>
        </div>

        {/* Mobile Button */}
        <button
          ref={openButtonRef}
          onClick={() => setOpen(true)}
          className="md:hidden text-zinc-200 p-2 rounded-lg hover:bg-zinc-900"
          aria-label="Open menu"
        >
          <Menu size={26} />
        </button>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            ref={menuRef}
            className="absolute top-20 right-4 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-6 md:hidden"
          >
            {/* Close */}
            <div className="flex justify-end mb-6">
              <button
                onClick={() => setOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            {/* Links */}
            <nav className="flex flex-col gap-5 text-sm">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-zinc-300 hover:text-white transition"
                >
                  {link.label}
                </a>
              ))}

              <a
                href="https://quantora-app.vercel.app"
                onClick={() => setOpen(false)}
                className="mt-4 bg-blue-600 hover:bg-blue-500 transition px-5 py-3 rounded-full font-semibold text-white text-center"
              >
                Get Started
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
