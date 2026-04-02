import { motion } from "framer-motion";
import { 
  Zap, 
  Layout, 
  Eye, 
  ShoppingBag, 
  BarChart3, 
  Moon, 
  ReceiptText, 
  FileText 
} from "lucide-react";

const REASONS = [
  {
    title: "Kill the Queue",
    description: "Stop losing money to frustration. Finalize sales in seconds and eliminate 'walk-aways' during rush hours.",
    icon: Zap,
    gradient: "from-orange-600 to-red-600",
  },
  {
    title: "Sell Like a Boss",
    description: "Move beyond the 'side-hustle' look. Quantora builds customer trust with organized records and professional branding.",
    icon: Layout,
    gradient: "from-blue-600 to-indigo-600",
  },
  {
    title: "Instant Digital Receipts",
    description: "Ditch handwritten notes. Send branded receipts via WhatsApp or Email instantly, building trust with every customer.",
    icon: FileText,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Daily Performance Reports",
    description: "Track every Naira with precision. Get automated breakdowns of daily sales, profit margins per product, and total revenue to keep your business compliant.",
    icon: ReceiptText, 
    gradient: "from-zinc-600 to-zinc-800",
  },
  {
    title: "Be There, Everywhere",
    description: "Get total control of your shop from anywhere. Monitor exactly what your staff is selling without being physically present.",
    icon: Eye,
    gradient: "from-purple-600 to-fuchsia-600",
  },
  {
    title: "Master Your Inventory",
    description: "Track variations like colors and sizes instantly. Know exactly what's low so you never turn a customer away.",
    icon: ShoppingBag,
    gradient: "from-emerald-600 to-teal-600",
  },
  {
    title: "Stop Guessing",
    description: "Identify your winners and losers. Quantora shows you exactly where to spend your money based on real sales data.",
    icon: BarChart3,
    gradient: "from-amber-500 to-orange-500",
  },
  {
    title: "Sleep Without Anxiety",
    description: "End the calculation headaches that keep you up at night. Go to sleep knowing your numbers are 100% accurate.",
    icon: Moon,
    gradient: "from-indigo-600 to-blue-900",
  },
];

export default function WhyQuantora() {
  return (
    <section className="bg-zinc-950 py-28 text-zinc-100">
      <div className="max-w-7xl mx-auto px-6">
        <header className="max-w-3xl mx-auto text-center mb-20">
          <h2 className="text-4xl font-bold mb-5 tracking-tight">
            Built for Traders Who Mean Business
          </h2>
          <p className="text-zinc-400 text-lg">
            Stop the manual math and guesswork. Quantora gives you the tools to 
            dominate the rush hour and manage your growth with confidence.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {REASONS.map((item, index) => {
            const IconComponent = item.icon; // Safety check
            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group relative rounded-2xl p-6 bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-all"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-5 shadow-lg shadow-black/20`}>
                  <IconComponent className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-white transition-colors">
                  {item.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {item.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
