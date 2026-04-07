// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Users, BarChart, ShieldAlert, Globe } from "lucide-react";

const SUPERPOWERS = [
  {
    icon: Users,
    title: "Worker Accounts",
    desc: "Scale your team without losing control. Assign staff access to the terminal while keeping your profit margins and sensitive data for your eyes only.",
  },
  {
    icon: BarChart,
    title: "Smart Analytics",
    desc: "Quantora tracks your growth trends automatically. Identify your peak sales hours and most loyal customers with a single tap.",
  },
  {
    icon: ShieldAlert,
    title: "Low Stock Intelligence",
    desc: "Never tell a customer 'we're out of stock' again. Get instant alerts when your winners are running low so you can restock before you lose a sale.",
  },
  {
    icon: Globe,
    title: "Cloud Command Center",
    desc: "Your business is in your pocket. Whether you're at home, traveling, or at the shop, access your full terminal from any device, anywhere.",
  },
];

export default function BusinessSuperpowers() {
  return (
    <section
      id="audience"
      aria-labelledby="superpowers-heading"
      className="bg-zinc-950 py-28 text-zinc-100"
    >
      <div className="max-w-7xl mx-auto px-6">

        {/* Section Header */}
        <header className="max-w-3xl mx-auto text-center mb-20">
          <h2 id="superpowers-heading" className="text-4xl font-bold mb-4 tracking-tight">
            Go Beyond Simple Tracking
          </h2>
          <p className="text-zinc-400 text-lg">
            Quantora provides the institutional-grade tools you need to transition 
            from a solo trader to a market leader.
          </p>
        </header>

        {/* Superpower Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {SUPERPOWERS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8 hover:border-indigo-500/50 hover:bg-zinc-900/80 transition-all duration-300"
              >
                {/* Accent Glow */}
                <div className="absolute inset-0 rounded-2xl bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="text-indigo-400" size={28} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">
                    {item.title}
                  </h3>
                  <p className="text-zinc-400 leading-relaxed text-sm">
                    {item.desc}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
