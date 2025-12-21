// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

import sc1 from "../assets/Quan1.png";
import sc2 from "../assets/Quan3.png";
import sc3 from "../assets/Quan2.png";
import sc4 from "../assets/quan4.png";

const FEATURES = [
  {
    title: "Inventory Dashboard",
    description:
      "Get a real-time overview of your stock levels, total products, and low-stock items in one centralized dashboard.",
    image: sc1,
    alt: "Quantora inventory management dashboard",
  },
  {
    title: "Product Management",
    description:
      "Organize products by category, track quantities, and manage SKUs efficiently with a clean product table.",
    image: sc2,
    alt: "Product inventory management table",
  },
  {
    title: "Low Stock Alerts",
    description:
      "Automatically receive alerts when stock levels fall below thresholds to prevent shortages and lost sales.",
    image: sc3,
    alt: "Low stock alerts in inventory software",
  },
  {
    title: "Analytics & Reports",
    description:
      "Analyze inventory trends and stock movement with visual reports that support smarter business decisions.",
    image: sc4,
    alt: "Inventory analytics and reporting dashboard",
  },
];

export default function Features() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  /* Auto slideshow */
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % FEATURES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const active = FEATURES[activeIndex];

  return (
    <section id="features" className="bg-zinc-950 text-zinc-100 py-28">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <h2 className="text-4xl font-bold mb-5">
            Powerful Inventory Management Features
          </h2>
          <p className="text-zinc-400 text-lg">
            Experience how Quantora simplifies inventory control through a
            modern, intuitive interface.
          </p>
        </div>

        {/* Feature Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {FEATURES.map((feature, index) => (
            <button
              key={feature.title}
              onClick={() => setActiveIndex(index)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition
                ${
                  index === activeIndex
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                }`}
            >
              {feature.title}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Screenshot Slideshow */}
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="relative"
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={active.image}
                src={active.image}
                alt={active.alt}
               className="w-full max-w-xl lg:max-w-3xl mx-auto rounded-xl border border-zinc-800 shadow-2xl"
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </AnimatePresence>

            {/* Progress Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {FEATURES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`h-2.5 rounded-full transition-all
                    ${
                      index === activeIndex
                        ? "w-8 bg-blue-500"
                        : "w-2.5 bg-zinc-700 hover:bg-zinc-500"
                    }`}
                />
              ))}
            </div>
          </div>

          {/* Text */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <h3 className="text-3xl font-semibold mb-4">
                {active.title}
              </h3>
              <p className="text-zinc-400 text-lg leading-relaxed">
                {active.description}
              </p>
            </motion.div>
          </AnimatePresence>

        </div>
      </div>
    </section>
  );
}
