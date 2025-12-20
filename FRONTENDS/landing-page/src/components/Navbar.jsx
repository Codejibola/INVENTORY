//eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
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
    <header className="fixed top-0 left-0 w-full z-50 bg-zinc-950/80 backdrop-blur border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logotype */}
        <a href="#hero" className="text-xl font-semibold tracking-tight">
          <span className="text-blue-500 font-bold">Q</span>
          <span className="text-zinc-100">uantora</span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-300">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-white transition"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#cta"
            className="bg-blue-600 hover:bg-blue-500 transition px-5 py-2 rounded-md font-semibold text-white"
          >
            Get Started
          </a>
        </nav>

        {/* Mobile Button */}
        <button
          ref={openButtonRef}
          onClick={() => setOpen(true)}
          className="md:hidden text-zinc-200"
          aria-label="Open menu"
        >
          <Menu size={26} />
        </button>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
          {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            ref={menuRef}
            className="absolute top-16 right-4 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl p-6 md:hidden"
          >
            {/* Close */}
            <div className="flex justify-end mb-6">
              <button
                onClick={() => setOpen(false)}
                className="text-zinc-400 hover:text-white"
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
                href="#cta"
                onClick={() => setOpen(false)}
                className="mt-4 bg-blue-600 hover:bg-blue-500 transition px-5 py-2 rounded-md font-semibold text-white text-center"
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
