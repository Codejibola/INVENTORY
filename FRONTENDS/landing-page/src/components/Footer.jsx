import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 py-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 text-sm text-zinc-400">

        {/* Brand */}
        <div>
          <div className="text-xl font-semibold mb-4">
            <span className="text-blue-500 font-bold">Q</span>
            <span className="text-zinc-100">uantora</span>
          </div>
          <p>
            Quantora is a modern inventory management system built to help
            businesses track, manage, and optimize stock with confidence.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="text-zinc-200 font-semibold mb-4">Navigate</h4>
          <ul className="space-y-3">
            <li><a href="#features" className="hover:text-white">Features</a></li>
            <li><a href="#audience" className="hover:text-white">Who It’s For</a></li>
            <li><a href="#faq" className="hover:text-white">FAQ</a></li>
            <li><a href="#cta" className="hover:text-white">Get Started</a></li>
          </ul>
        </div>

        {/* Legal */}
        <div className="flex gap-6 text-sm text-zinc-400">
  <Link to="/privacy" className="hover:text-white">
    Privacy Policy
  </Link>
  <Link to="/terms" className="hover:text-white">
    Terms of Service
  </Link>
</div>
      </div>

      <div className="text-center text-zinc-500 text-xs mt-12">
        © {new Date().getFullYear()} Quantora. All rights reserved.
      </div>
    </footer>
  );
}
