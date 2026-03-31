/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import hero from "../assets/hero.webp";
import { Link } from "react-router-dom";

export default function Hero() {
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  const words = ["BUSINESS", "PROFITS", "GROWTH"];

  useEffect(() => {
    const handleTyping = () => {
      const currentWord = words[wordIndex];
      
      if (!isDeleting) {
        setDisplayText(currentWord.substring(0, displayText.length + 1));
        setTypingSpeed(150);
      } else {
        setDisplayText(currentWord.substring(0, displayText.length - 1));
        setTypingSpeed(75);
      }

      if (!isDeleting && displayText === currentWord) {
        setTimeout(() => setIsDeleting(true), 2000);
      } 
      else if (isDeleting && displayText === "") {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % words.length);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, wordIndex]);

  const benefits = [
    "Never run out of stock again",
    "Track your daily profit automatically",
    "Send professional receipts to customers",
    "Manage your shop from anywhere"
  ];

  return (
    <section id="hero" role="banner" className="relative bg-zinc-950 text-zinc-100 pt-32 pb-24 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <header>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] mb-6 tracking-tight uppercase min-h-[3.3em]">
              Power your <br />
              <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-700 bg-clip-text text-transparent italic pr-1">
                {displayText}
              </span> 
              <br />
              with Quantora.
            </h1>

            <p className="text-lg md:text-xl text-zinc-400 mb-8 max-w-lg leading-relaxed font-medium">
              Run a smarter business with the simple app that tracks your sales, 
              manages your stock, and helps you stay in control of your money.
            </p>

            {/* Benefit List */}
            <ul className="space-y-4 mb-10">
              {benefits.map((benefit, index) => (
                <motion.li 
                  key={index} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + (index * 0.1) }}
                  className="flex items-center gap-3 text-zinc-300"
                >
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                    <svg className="h-3.5 w-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <span className="font-bold text-sm tracking-wide uppercase">{benefit}</span>
                </motion.li>
              ))}
            </ul>
          </header>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="https://quantora.online/"
              className="bg-blue-600 hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest text-center shadow-lg shadow-blue-600/20"
            >
              Get Started Free
            </Link>
          </div>
        </motion.div>

        {/* Updated Hero Image Section with Dynamic Stats */}
        <motion.div
          className="relative lg:ml-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Dashboard Image */}
          <div className="relative p-2 bg-zinc-900/50 backdrop-blur-sm border border-white/5 rounded-3xl shadow-2xl overflow-hidden">
             <img
              src={hero}
              alt="Quantora App Dashboard"
              className="rounded-2xl grayscale-[10%] hover:grayscale-0 transition-all duration-700"
            />
          </div>

          {/* Efficiency Stat Badge */}
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="absolute -bottom-6 -left-6 md:-left-12 bg-blue-600 p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(37,99,235,0.3)] z-20 border border-white/20"
          >
            <div className="text-white/80 text-[10px] uppercase font-black tracking-[0.2em] mb-1">Business Impact</div>
            <div className="text-white text-4xl font-black tracking-tighter italic">+65%</div>
            <div className="text-white/90 text-xs font-bold mt-1">Faster Daily Restocking</div>
          </motion.div>

          {/* Live Gain Badge */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="absolute -top-6 -right-4 bg-zinc-900/90 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl z-20"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <div className="text-zinc-400 text-[9px] uppercase font-black tracking-widest">Live Profit Margin</div>
            </div>
            <div className="text-white text-2xl font-black mt-1 text-right">Up 22%</div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}