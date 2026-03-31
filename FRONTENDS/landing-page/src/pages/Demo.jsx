/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Image Imports (Keep your existing imports)
import registration from "../assets/registration.webp";
import dashboard from "../assets/dashboard.webp";
import inventory from "../assets/inventory.webp";
import recordsales from "../assets/recordsales.webp";
import invoices from "../assets/invoices.webp";
import oversight from "../assets/oversight.webp";

const demoSteps = [
  { 
    image: registration, 
    title: "Quick Setup", 
    description: "Start your business account in seconds. No complex paperwork—just enter your shop details and you're ready to go." 
  },
  { 
    image: dashboard, 
    title: "Everything at a Glance", 
    description: "See your total sales, current stock, and low-item alerts on one simple screen. Stay in control without the headache." 
  },
  { 
    image: inventory, 
    title: "Add Products Easily", 
    description: "List your items, set your prices, and track your stock levels. Quantora makes adding new inventory faster than writing it in a book." 
  },
  { 
    image: recordsales, 
    title: "Record Sales Instantly", 
    description: "Every time you sell, Quantora calculates your profit automatically. You’ll always know exactly how much money you’ve made today." 
  },
  { 
    image: oversight, 
    title: "Manage Your Staff", 
    description: "Let your workers record sales while you keep the profit details private. Monitor your shop remotely with total peace of mind." 
  },
  { 
    image: invoices, 
    title: "Professional Receipts", 
    description: "Create and send professional receipts to your customers with one click. Build trust and keep your records tax-ready." 
  },
];

export default function Demo() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Background Preload
  useEffect(() => {
    demoSteps.forEach((step) => {
      const img = new Image();
      img.src = step.image;
    });
  }, []);

  // Auto-slide Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % demoSteps.length);
    }, 8000); // Slightly slower to let users read the new simpler text
    return () => clearInterval(interval);
  }, []);

  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + demoSteps.length) % demoSteps.length);
  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % demoSteps.length);

  const activeStep = demoSteps[currentIndex];

  return (
    <section id="demo" className="py-24 bg-zinc-950 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        <header className="text-center mb-16">
          <h2 className="text-sm font-black text-blue-500 uppercase tracking-[0.3em] mb-4">How it works</h2>
          <h3 className="text-4xl md:text-5xl font-black tracking-tight">
            Manage your shop <br /> 
            <span className="italic text-blue-400">in a few simple steps.</span>
          </h3>
        </header>

        {/* Main Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Text Content - Spans 5 columns */}
          <div className="lg:col-span-5 space-y-8 order-2 lg:order-1">
            <div className="inline-block px-4 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest">
              Step {currentIndex + 1} of {demoSteps.length}
            </div>
            
            <div className="space-y-4">
              <h4 className="text-3xl font-bold tracking-tight text-white italic">
                {activeStep.title}
              </h4>
              <p className="text-zinc-400 text-lg leading-relaxed max-w-md">
                {activeStep.description}
              </p>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button 
                onClick={prevSlide}
                className="p-4 rounded-full border border-zinc-800 hover:bg-zinc-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
              </button>
              <button 
                onClick={nextSlide}
                className="p-4 rounded-full bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
            </div>
          </div>

          {/* Image Showcase Side - Spans 7 columns */}
          <div className="lg:col-span-7 relative order-1 lg:order-2 group">
            <div className="absolute -inset-4 bg-blue-600/5 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative aspect-video bg-zinc-900 rounded-3xl border border-white/5 p-2 shadow-2xl overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentIndex}
                  src={activeStep.image}
                  alt={activeStep.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  className="w-full h-full object-cover rounded-2xl"
                />
              </AnimatePresence>
            </div>

            {/* Pagination Dots */}
            <div className="flex gap-3 justify-center mt-8">
              {demoSteps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    idx === currentIndex ? "w-12 bg-blue-500" : "w-3 bg-zinc-800 hover:bg-zinc-700"
                  }`}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}