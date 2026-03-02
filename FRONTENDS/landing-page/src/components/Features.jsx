/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

// Image Imports - Keep your existing assets
import sc1 from "../assets/Quan1.png";
import sc2 from "../assets/Quan3.png";
import sc3 from "../assets/Quan2.png";
import sc4 from "../assets/quan4.png";

const FEATURES = [
  {
    title: "Command Center",
    subtitle: "Centralized Operations",
    description: "Stop juggling spreadsheets. Our high-fidelity dashboard provides an instant 360-degree view of your global stock levels, revenue health, and operational bottlenecks.",
    impact: "Reduces weekly administrative time by 12 hours.",
    image: sc1,
  },
  {
    title: "Precision Control",
    subtitle: "Stock Management",
    description: "Manage high-volume inventories with granular precision. Categorize, tag, and track SKU movements across multiple channels with zero latency and absolute data integrity.",
    impact: "Eliminates 99% of manual entry errors.",
    image: sc2,
  },
  {
    title: "Zero-Loss Alerts",
    subtitle: "Proactive Logistics",
    description: "Convert reactive crisis into proactive strategy. Our predictive engine identifies diminishing stock before it hits critical levels, ensuring your supply chain never stops.",
    impact: "Reduces stockouts by up to 45%.",
    image: sc3,
  },
  {
    title: "Fiscal Intelligence",
    subtitle: "Analytics & Invoicing",
    description: "Data without insight is noise. Generate audit-ready profit reports and automated invoices that make tax compliance a non-event and reveal hidden growth opportunities.",
    impact: "Audit-ready financial exports in one click.",
    image: sc4,
  },
];

export default function Features() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % FEATURES.length);
    }, 5000); // Increased time for better readability
    return () => clearInterval(interval);
  }, [isPaused]);

  const active = FEATURES[activeIndex];

  return (
    <section id="features" className="bg-zinc-950 text-zinc-100 py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Professional Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-blue-500 font-bold tracking-[0.25em] text-xs mb-4 uppercase">System Capabilities</h2>
            <h3 className="text-4xl md:text-5xl font-black text-white leading-tight">
              Enterprise Control. <br />
              <span className="italic text-zinc-500 font-light">Startup Simplicity.</span>
            </h3>
          </div>
          <p className="text-zinc-400 text-lg max-w-sm border-l border-zinc-800 pl-6 hidden md:block">
            Quantora replaces outdated workflows with a streamlined engine designed for modern retail and distribution.
          </p>
        </div>

        {/* Feature Navigation with Timer Progress */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {FEATURES.map((feature, index) => (
            <button
              key={feature.title}
              onClick={() => {
                setActiveIndex(index);
                setIsPaused(true);
              }}
              className={`relative p-6 rounded-2xl text-left transition-all duration-300 group ${
                index === activeIndex 
                ? "bg-zinc-900 border-zinc-700 shadow-2xl" 
                : "hover:bg-zinc-900/50 border-transparent"
              } border`}
            >
              <div className={`text-xs font-bold mb-2 transition-colors ${index === activeIndex ? "text-blue-500" : "text-zinc-700"}`}>
                0{index + 1}
              </div>
              <div className={`font-bold text-sm uppercase tracking-wider ${index === activeIndex ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"}`}>
                {feature.title}
              </div>
              
              {/* Progress Bar for Active Tab */}
              {index === activeIndex && (
                <motion.div 
                  layoutId="activeTabProgress"
                  className="absolute bottom-0 left-0 h-[2px] bg-blue-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 5, ease: "linear" }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Dynamic Showcase Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Detailed Content Side */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="inline-block px-3 py-1 rounded-md bg-blue-600/10 text-blue-400 text-[10px] font-black tracking-widest uppercase mb-6">
                   {active.subtitle}
                </div>
                <h4 className="text-4xl font-black mb-6 text-white leading-tight italic uppercase tracking-tighter">
                  {active.title}
                </h4>
                <p className="text-zinc-400 text-lg leading-relaxed mb-10">
                  {active.description}
                </p>
                
                {/* Metric / Impact Badge */}
                <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-5 shadow-xl">
                  <div className="h-12 w-12 rounded-xl bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  </div>
                  <div>
                    <div className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Projected Impact</div>
                    <div className="text-sm font-bold text-zinc-100 italic">{active.impact}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Visual Showcase Side */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div 
              className="relative group" 
              onMouseEnter={() => setIsPaused(true)} 
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* High-End Glow Effect */}
              <div className="absolute -inset-10 bg-blue-600/10 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              
              <div className="relative rounded-3xl border border-zinc-800 bg-zinc-900 p-2 shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden">
                <AnimatePresence mode="popLayout">
                  <motion.img
                    key={active.image}
                    src={active.image}
                    alt={active.title}
                    initial={{ opacity: 0, scale: 1.05, filter: "brightness(0.5)" }}
                    animate={{ opacity: 1, scale: 1, filter: "brightness(1)" }}
                    exit={{ opacity: 0, filter: "blur(20px)" }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="w-full h-auto rounded-2xl grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                  />
                </AnimatePresence>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}