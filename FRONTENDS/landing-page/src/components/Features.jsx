/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

// Image Imports
import sc1 from "../assets/Quan1.png";
import sc2 from "../assets/Quan3.png";
import sc3 from "../assets/Quan2.png";
import sc4 from "../assets/quan4.png";

const FEATURES = [
  {
    title: "Inventory Dashboard",
    description: "Get a real-time overview of your stock levels, total products, and low-stock items in one centralized dashboard.",
    image: sc1,
    alt: "Quantora inventory management dashboard",
  },
  {
    title: "Product Management",
    description: "Organize products by category, track quantities, and manage SKUs efficiently with a clean product table.",
    image: sc2,
    alt: "Product inventory management table",
  },
  {
    title: "Low Stock Alerts",
    description: "Automatically receive alerts when stock levels fall below thresholds to prevent shortages and lost sales.",
    image: sc3,
    alt: "Low stock alerts in inventory software",
  },
  {
    title: "Analytics & Reports",
    description: "Analyze inventory trends and stock movement with visual reports that support smarter business decisions.",
    image: sc4,
    alt: "Inventory analytics and reporting dashboard",
  },
];

export default function Features() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % FEATURES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const active = FEATURES[activeIndex];

  return (
    <section id="features" className="bg-zinc-950 text-zinc-100 py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <header className="max-w-3xl mx-auto text-center mb-20">
          <h2 className="text-4xl font-bold mb-5 tracking-tight text-white">
            Powerful Inventory Management Features
          </h2>
          <p className="text-zinc-400 text-lg">
            Experience how Quantora simplifies inventory control through a modern, intuitive interface.
          </p>
        </header>

        {/* Tabs */}
        <nav className="flex flex-wrap justify-center gap-4 mb-16">
          {FEATURES.map((feature, index) => (
            <button
              key={feature.title}
              onClick={() => setActiveIndex(index)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                index === activeIndex
                  ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                  : "bg-zinc-900 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
              }`}
            >
              {feature.title}
            </button>
          ))}
        </nav>

        {/* Display Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[500px]">
          
          {/* Image Side - Fixed glitch with popLayout */}
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="relative h-full flex flex-col justify-center"
          >
            <div className="relative aspect-video lg:aspect-auto">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={active.image}
                  initial={{ opacity: 0, scale: 0.95, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: -20 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  className="w-full h-full"
                >
                  <img
                    src={active.image}
                    alt={active.alt}
                    className="w-full h-auto rounded-2xl border border-white/5 shadow-2xl"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-3 mt-8">
              {FEATURES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    index === activeIndex ? "w-10 bg-blue-500" : "w-1.5 bg-zinc-800"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Text Side */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.article
                key={active.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-3xl font-bold mb-4 text-white uppercase tracking-tight italic">
                  {active.title}
                </h3>
                <p className="text-zinc-400 text-lg leading-relaxed max-w-md">
                  {active.description}
                </p>
              </motion.article>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}