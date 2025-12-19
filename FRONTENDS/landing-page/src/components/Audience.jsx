// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Store, Boxes, ShoppingCart, Users } from "lucide-react";

const AUDIENCES = [
  {
    icon: Store,
    title: "Retail Stores",
    desc: "Track in-store inventory, prevent stockouts, and manage products across shelves with ease.",
  },
  {
    icon: ShoppingCart,
    title: "E-commerce Sellers",
    desc: "Monitor online inventory in real time and avoid overselling across platforms.",
  },
  {
    icon: Boxes,
    title: "Wholesalers & Distributors",
    desc: "Manage bulk inventory, product categories, and stock movement efficiently.",
  },
  {
    icon: Users,
    title: "Growing Teams",
    desc: "Collaborate with role-based access and keep everyone aligned on inventory data.",
  },
];

export default function Audience() {
  return (
    <section id="audience" className="bg-zinc-950 py-28 text-zinc-100">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <h2 className="text-4xl font-bold mb-4">
            Who Quantora Is Built For
          </h2>
          <p className="text-zinc-400 text-lg">
            Quantora is designed for businesses that need clarity, control,
            and confidence in their inventory management process.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {AUDIENCES.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 hover:border-blue-500/40 hover:shadow-blue-500/10 transition"
              >
                <Icon className="text-blue-500 mb-5" size={32} />
                <h3 className="text-xl font-semibold mb-3">
                  {item.title}
                </h3>
                <p className="text-zinc-400 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
