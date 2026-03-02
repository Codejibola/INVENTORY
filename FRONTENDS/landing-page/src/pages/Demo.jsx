/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";

// Image Imports
import registration from "../assets/registration.png";
import dashboard from "../assets/dashboard.png";
import inventory from "../assets/inventory.png";
import recordsales from "../assets/recordsales.png";
import invoices from "../assets/invoices.png";
import oversight from "../assets/oversight.png";

// Updated array to include explanatory text
const demoSteps = [
  { image: registration, title: "Secure Onboarding", description: "Create your business account in seconds. Set up your profile and get ready to master your data." },
  { image: dashboard, title: "Dashboard Overview", description: "Your central hub for real-time inventory levels, recent sales activity, and critical stock alerts." },
  { image: inventory, title: "Adding Products", description: "Easily input new stock, set SKU variants, assign categories, and define pricing structures." },
  { image: recordsales, title: "Inventory Management", description: "View your entire product catalog. Filter by stock level to identify items that need reordering." },
  { image: oversight, title: "Staff & Role Control", description: "Manage workers by assigning roles. Admin monitors activity, while staff focus on sales without seeing full profit margins." },
  { image: invoices, title: "Creating Invoices", description: "Generate professional, tax-compliant invoices in one click for your clients directly from the dashboard." },
];

export default function DemoPage() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % demoSteps.length);
    }, 6000); 
    return () => clearInterval(interval);
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + demoSteps.length) % demoSteps.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % demoSteps.length);
  };

  const activeStep = demoSteps[currentIndex];

  return (
    <>
      <Helmet>
        <title>How Quantora Works | Product Demo | Quantora</title>
        <meta
          name="description"
          content="Step-by-step guided tour of Quantora: From secure signup to managing inventory, staff, and generating financial reports."
        />
      </Helmet>

      {/* --- NEW NAVIGATION HEADER --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="https://inventory-5xr8.vercel.app/" className="text-xl font-bold text-white">
            Quantora<span className="text-blue-500">.</span>
          </a>
          <a
            href="https://quantora-app.vercel.app/"
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-md text-sm font-semibold transition duration-150"
          >
            Launch App
          </a>
        </div>
      </nav>
      {/* ----------------------------- */}

      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-white pt-28">
        <header className="text-center mb-16 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
            Master Your Business Data <br />
            <span className="text-blue-500 italic">In Minutes.</span>
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl">
            A guided walkthrough of Quantora's intuitive interface.
          </p>
        </header>

        {/* Main Showcase Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 w-full max-w-7xl items-center">
          
          {/* Explanatory Text Side */}
          <div className="xl:col-span-1 space-y-6 order-2 xl:order-1">
            <div className="text-sm font-bold text-blue-400 uppercase tracking-widest">
              Step {currentIndex + 1} of {demoSteps.length}
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-white">
              {activeStep.title}
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed">
              {activeStep.description}
            </p>
            {/* Added CTA below description for visibility */}
            <a href="https://quantora-app.vercel.app/" className="inline-block bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-md font-semibold transition">
                Try it Yourself
            </a>
          </div>

          {/* Image Showcase Side */}
          <div className="xl:col-span-2 relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden rounded-2xl shadow-2xl border border-zinc-800 order-1 xl:order-2 bg-zinc-900">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentIndex}
                src={activeStep.image}
                alt={activeStep.title}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full h-full object-contain p-4"
              />
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute top-1/2 left-4 -translate-y-1/2 bg-zinc-950/50 hover:bg-zinc-800 text-white p-4 rounded-full shadow-lg z-10 backdrop-blur-sm"
              aria-label="Previous step"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute top-1/2 right-4 -translate-y-1/2 bg-zinc-950/50 hover:bg-zinc-800 text-white p-4 rounded-full shadow-lg z-10 backdrop-blur-sm"
              aria-label="Next step"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>
        </div>

        {/* Dots Tracker */}
        <div className="flex gap-2 mt-12 mb-10">
          {demoSteps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex ? "w-10 bg-blue-500" : "w-2 bg-zinc-700 hover:bg-zinc-500"
              }`}
              aria-label={`Go to step ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </>
  );
}