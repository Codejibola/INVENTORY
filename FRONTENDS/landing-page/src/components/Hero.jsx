//eslint-disable-next-line no-unused-vars 
import { motion } from "framer-motion";
import hero from "../assets/hero.png";
import { Link } from "react-router-dom";

export default function Hero() {
  const benefits = [
    "Eliminate stockouts and overstock",
    "Real-time Profit & Loss tracking",
    "Automated Invoicing & Tax-Ready reports",
    "Seamless Multi-store synchronization"
  ];

  return (
    <section id="hero" role="banner" className="relative bg-zinc-950 text-zinc-100 pt-32 pb-24 overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <header>
          

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] mb-6 tracking-tight">
              MASTER YOUR STOCK. <br />
              <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-700 bg-clip-text text-transparent italic">
                QUANTIFY
              </span> YOUR PROFIT.
            </h1>

            <p className="text-lg md:text-xl text-zinc-400 mb-8 max-w-lg leading-relaxed">
              Optimize inventory with Quantora, the precise system for smarter decisions, 
              automated reporting, and scaling your business effortlessly.
            </p>

            {/* Explanatory Benefit List */}
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
                    <svg className="h-3.5 w-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <span className="font-medium">{benefit}</span>
                </motion.li>
              ))}
            </ul>
          </header>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="https://quantora-app.vercel.app/"
              className="bg-blue-600 hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all px-8 py-4 rounded-xl font-bold text-lg text-center shadow-lg shadow-blue-600/20"
            >
              Get Started Free
            </Link>
            <Link
              to="/demo"
              className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 transition-all px-8 py-4 rounded-xl text-zinc-300 font-semibold text-lg text-center"
            >
              Request a Demo
            </Link>
          </div>
        </motion.div>

        {/* Hero Dashboard Preview */}
        <motion.div
          className="relative lg:ml-auto"
          initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Glassmorphism Background behind image */}
          <div className="absolute -inset-4 bg-blue-600/5 rounded-[2rem] blur-2xl transform rotate-3"></div>
          
          <div className="relative p-2 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
             <img
              src={hero}
              alt="Quantora inventory management dashboard preview"
              className="rounded-xl grayscale-[20%] hover:grayscale-0 transition-all duration-700"
            />
          </div>

          {/* Floating Performance Indicator */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="absolute -bottom-8 -right-4 bg-zinc-950/90 backdrop-blur-md border border-blue-500/30 p-5 rounded-2xl shadow-2xl z-20"
          >
            <div className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-black mb-1">Efficiency Boost</div>
            <div className="text-blue-400 text-3xl font-black tracking-tight">+42%</div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}