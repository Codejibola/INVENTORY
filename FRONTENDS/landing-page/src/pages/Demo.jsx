/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import demo1 from "../assets/Demo01.png";
import demo2 from "../assets/demo2.png";
import demo3 from "../assets/Demo3.png";
import demo4 from "../assets/Demo4.png";
import demo5 from "../assets/demo5.png";
import demo6 from "../assets/demo6.png";
import demo7 from "../assets/demo7.png";
import demo8 from "../assets/demo8.png";
import demo9 from "../assets/demo9.png";
import { Helmet } from "react-helmet-async";

// Updated array to include explanatory text
const demoSteps = [
  { image: demo1, title: "Secure Onboarding", description: "Create your business account in seconds. Set up your profile and get ready to master your data." },
  { image: demo2, title: "Dashboard Overview", description: "Your central hub for real-time inventory levels, recent sales activity, and critical stock alerts." },
  { image: demo3, title: "Adding Products", description: "Easily input new stock, set SKU variants, assign categories, and define pricing structures." },
  { image: demo4, title: "Inventory Management", description: "View your entire product catalog. Filter by stock level to identify items that need reordering." },
  { image: demo5, title: "Staff & Role Control", description: "Manage workers by assigning roles. Admin monitors activity, while staff focus on sales without seeing full profit margins." },
  { image: demo6, title: "Creating Invoices", description: "Generate professional, tax-compliant invoices in one click for your clients directly from the dashboard." },
  { image: demo7, title: "Sales Tracking", description: "Track every transaction. View sales history, payment status, and customer details effortlessly." },
  { image: demo8, title: "Fiscal Reporting", description: "Generate automated P&L statements and tax-ready reports to understand your business profitability." },
  { image: demo9, title: "System Settings", description: "Customize your business profile, manage subscription details, and configure security settings." },
];

export default function DemoPage() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide every 6 seconds (longer for reading time)
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

      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-white pt-24">
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