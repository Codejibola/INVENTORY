// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Zap, Layout, Eye, ShoppingBag, BarChart3, Moon } from "lucide-react";

const REASONS = [
  {
    title: "Kill the Queue",
    description:
      "Stop losing money to frustration. Issue professional receipts in seconds and eliminate 'walk-aways' during your busiest rush hours.",
    icon: Zap,
    gradient: "from-orange-600 to-red-600",
  },
  {
    title: "Sell Like a Boss",
    description:
      "Move beyond the 'side-hustle' look. Quantora builds customer trust with organized records and professional branding.",
    icon: Layout,
    gradient: "from-blue-600 to-indigo-600",
  },
  {
    title: "Be There, Even When You're Not",
    description:
      "Get total control of your shop from anywhere. Monitor exactly what your staff is selling without needing to be physically present.",
    icon: Eye,
    gradient: "from-purple-600 to-fuchsia-600",
  },
  {
    title: "Master Your Inventory",
    description:
      "Track specific variations like colors and sizes instantly. Know exactly what's low so you never turn a customer away by mistake.",
    icon: ShoppingBag,
    gradient: "from-emerald-600 to-teal-600",
  },
  {
    title: "Stop Guessing, Start Investing",
    description:
      "Identify your winners and losers. Quantora shows you exactly where to spend your money based on real sales data.",
    icon: BarChart3,
    gradient: "from-amber-500 to-orange-500",
  },
  {
    title: "Sleep Without Anxiety",
    description:
      "End the calculation headaches that keep you up at night. Go to sleep knowing your numbers are 100% accurate and organized.",
    icon: Moon,
    gradient: "from-indigo-600 to-blue-900",
  },
];

export default function WhyQuantora() {
  return (
    <section
      aria-labelledby="why-quantora-heading"
      className="bg-zinc-950 py-28 text-zinc-100"
    >
      <div className="max-w-7xl mx-auto px-6">

        {/* Section Header */}
        <header className="max-w-3xl mx-auto text-center mb-20">
          <h2
            id="why-quantora-heading"
            className="text-4xl font-bold mb-5 tracking-tight"
          >
            Built for Traders Who Mean Business
          </h2>
          <p className="text-zinc-400 text-lg">
            Stop the manual math and guesswork. Quantora gives you the tools to 
            dominate the rush hour and manage your growth with confidence.
          </p>
        </header>

        {/* Reason Articles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {REASONS.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group relative rounded-2xl p-8 bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-all"
            >
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-6 shadow-lg shadow-black/20`}
              >
                <item.icon className="text-white" size={28} />
              </div>

              <h3 className="text-xl font-bold mb-3 group-hover:text-white transition-colors">
                {item.title}
              </h3>
              <p className="text-zinc-400 text-base leading-relaxed">
                {item.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}