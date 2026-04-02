// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function CTA() {
  const stats = [
    { label: "Shops Onboarded", value: "20+" },
    { label: "Products Managed", value: "100+" },
    { label: "Sales Recorded", value: "500+" },
    { label: "Uptime", value: "99.9%" },
  ];

  return (
    <section
      id="cta"
      aria-labelledby="cta-heading"
      className="relative bg-zinc-950 py-24 overflow-hidden"
    >
      <div className="absolute inset-0 bg-zinc-950" />

      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />

      <motion.div
        className="relative max-w-5xl mx-auto px-6 text-center text-zinc-100"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <header>
          <h2
            id="cta-heading"
            className="text-4xl md:text-5xl font-bold mb-6 tracking-tight"
          >
            Take Control of Your Inventory Today
          </h2>

          <p className="text-zinc-400 mb-12 text-lg max-w-2xl mx-auto">
            Join the growing ecosystem of businesses scaling with Quantora. 
            Manage products, track stock levels, and make smarter decisions.
          </p>
        </header>

        {/* Growth Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 border-y border-zinc-800/50 py-10">
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="text-3xl md:text-4xl font-black text-blue-500 mb-1">
                {stat.value}
              </div>
              <div className="text-sm uppercase tracking-widest text-zinc-500 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
        >
          <a
            href="https://quantora.online"
            aria-label="Start free trial of Quantora inventory management software"
            className="inline-block bg-blue-600 hover:bg-blue-500 transition px-12 py-4 rounded-full font-bold text-lg text-white shadow-lg shadow-blue-600/20"
          >
            Start Free Trial
          </a>
        </motion.div>
        
        <p className="mt-6 text-zinc-500 text-sm">
          No credit card required • Cancel anytime
        </p>
      </motion.div>
    </section>
  );
}