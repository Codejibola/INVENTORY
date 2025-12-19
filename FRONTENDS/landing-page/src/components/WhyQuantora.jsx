// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { TrendingUp, ShieldCheck, Clock, Layers } from "lucide-react";

const REASONS = [
  {
    title: "Designed for Growing Businesses",
    description:
      "Quantora is built specifically for small and growing businesses that need clarity, not complexity, when managing inventory and sales.",
    icon: TrendingUp,
    gradient: "from-blue-600 to-indigo-600",
  },
  {
    title: "Real-Time Accuracy",
    description:
      "Every sale, restock, and adjustment is reflected instantly, helping you avoid stock shortages, overstocking, and costly mistakes.",
    icon: Clock,
    gradient: "from-emerald-600 to-teal-600",
  },
  {
    title: "Secure & Reliable",
    description:
      "Your business data is protected with modern security practices, giving you peace of mind while you focus on growth.",
    icon: ShieldCheck,
    gradient: "from-purple-600 to-fuchsia-600",
  },
  {
    title: "All-in-One Platform",
    description:
      "Track products, manage sales, analyze performance, and monitor stock — all from one clean and intuitive dashboard.",
    icon: Layers,
    gradient: "from-orange-600 to-red-600",
  },
];

export default function WhyQuantora() {
  return (
    <section className="bg-zinc-950 py-28 text-zinc-100">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <h2 className="text-4xl font-bold mb-5">
            Why Choose Quantora?
          </h2>
          <p className="text-zinc-400 text-lg">
            Quantora helps businesses move from guesswork to confidence by
            simplifying inventory and sales management.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {REASONS.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative rounded-xl p-6 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition"
            >
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4`}
              >
                <item.icon className="text-white" size={22} />
              </div>

              <h3 className="text-lg font-semibold mb-2">
                {item.title}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
