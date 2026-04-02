/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Image Imports
import registration from "../assets/registration.webp";
import dashboard from "../assets/dashboard.webp";
import inventory from "../assets/inventory.webp";
import receipts from "../assets/receipts.png";
import lowstock_notification from "../assets/Quan2.webp"; 
import recordsales from "../assets/recordsales.webp";
import reportsImg from "../assets/invoices.webp"; 
import oversight from "../assets/oversight.webp";

const featureList = [
  { 
    image: dashboard, 
    title: "Everything at a Glance", 
    description: "See your total sales, current stock, best selleres, and low-item alerts on one simple screen. Stay in control without the headache." 
  },
  { 
    image: inventory, 
    title: "Smart Inventory Tracking", 
    description: "List your items, set prices, and track stock levels. Quantora makes managing inventory faster than writing it in a book." 
  },
  { 
    image: lowstock_notification, 
    title: "Never Run Out of Stock", 
    description: "Get instant alerts when your products are running low. Quantora makes sure you restock on time so you never miss a sale." 
  },
  { 
    image: recordsales, 
    title: "Instant Profit Calculations", 
    description: "Every time you sell, Quantora calculates your profit automatically. You’ll always know exactly how much money you’ve made today." 
  },
  { 
    image: reportsImg, 
    title: "Automated Shop Reports", 
    description: "Stop calculating manually. Quantora tracks your daily sales and profit per item to keep your business records clean and compliant." 
  },
  { 
    image: oversight, 
    title: "Secure Staff Oversight", 
    description: "Let your workers record sales while you keep the profit details private. Monitor your shop remotely with total peace of mind." 
  },
  { 
    image: receipts, 
    title: "Professional Receipts", 
    description: "Create and send professional receipts to your customers with one click. Build trust and keep your records tax-ready." 
  },
  { 
    image: registration, 
    title: "Cloud-Native Setup", 
    description: "Start your business account in seconds. No complex paperwork—your shop data is securely backed up and ready when you are." 
  },
];

export default function Features() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Background Preload
  useEffect(() => {
    featureList.forEach((feature) => {
      const img = new Image();
      img.src = feature.image;
    });
  }, []);

  // Auto-slide Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featureList.length);
    }, 8000); 
    return () => clearInterval(interval);
  }, []);

  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + featureList.length) % featureList.length);
  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % featureList.length);

  const activeFeature = featureList[currentIndex];

  return (
    <section id="features" className="py-12 bg-zinc-950 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Updated Feature-Centered Header */}
        <header className="text-center mb-10">
          <h2 className="text-sm font-black text-blue-500 uppercase tracking-[0.3em] mb-2">Core Features</h2>
          <h3 className="text-4xl md:text-5xl font-black tracking-tight">
            Engineered for <br /> 
            <span className="italic text-blue-400">modern commerce.</span>
          </h3>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-5 space-y-6 order-2 lg:order-1">
            <div className="inline-block px-4 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest">
              Feature {currentIndex + 1} of {featureList.length}
            </div>
            
            <div className="space-y-3">
              <h4 className="text-3xl font-bold tracking-tight text-white italic">
                {activeFeature.title}
              </h4>
              <p className="text-zinc-400 text-lg leading-relaxed max-w-md">
                {activeFeature.description}
              </p>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button 
                onClick={prevSlide}
                className="p-3.5 rounded-full border border-zinc-800 hover:bg-zinc-900 transition-colors"
                aria-label="Previous feature"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
              </button>
              <button 
                onClick={nextSlide}
                className="p-3.5 rounded-full bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
                aria-label="Next feature"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
            </div>
          </div>

          {/* Image Showcase */}
          <div className="lg:col-span-7 relative order-1 lg:order-2 group">
            <div className="absolute -inset-4 bg-blue-600/5 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative aspect-video bg-zinc-900 rounded-3xl border border-white/5 p-2 shadow-2xl overflow-hidden cursor-zoom-in">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  className="w-full h-full"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.4 }}
                >
                  <motion.img
                    src={activeFeature.image}
                    alt={activeFeature.title}
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="w-full h-full object-contain rounded-2xl"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Pagination Dots */}
            <div className="flex gap-3 justify-center mt-5">
              {featureList.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    idx === currentIndex ? "w-10 bg-blue-500" : "w-3 bg-zinc-800 hover:bg-zinc-700"
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