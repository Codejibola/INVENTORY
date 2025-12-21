import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section id="hero" className="bg-zinc-950 text-zinc-100 pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Quantora — Trade, Manage, and Track Inventory with Confidence
          </h1>

          <p className="text-lg text-zinc-400 mb-8">
            Quantora is a modern inventory management system that helps businesses
            monitor stock levels, prevent shortages, and make smarter decisions
            in real time.
          </p>

          <div className="flex gap-4">
            <Link
              to="/signup"
              className="bg-blue-600 hover:bg-blue-500 transition px-7 py-3 rounded-md font-semibold"
            >
              Start Free Trial
            </Link>
            <Link
              to="/demo"
              className="border border-zinc-700 hover:border-zinc-500 transition px-7 py-3 rounded-md text-zinc-300"
            >
              View Demo
            </Link>
          </div>
        </motion.div>

        <motion.img
          src="https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt="Quantora inventory management dashboard"
          className="rounded-xl border border-zinc-800 shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        />
      </div>
    </section>
  );
}
