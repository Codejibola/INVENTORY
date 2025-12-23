// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section
      id="cta"
      aria-labelledby="cta-heading"
      className="relative bg-zinc-950 py-24 overflow-hidden"
    >
      <div className="absolute inset-0 bg-zinc-950" />

      <motion.div
        className="relative max-w-3xl mx-auto px-6 text-center text-zinc-100"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <header>
          <h2
            id="cta-heading"
            className="text-4xl font-bold mb-6"
          >
            Take Control of Your Inventory Today
          </h2>

          <p className="text-zinc-400 mb-10 text-lg">
            Start using Quantora to manage products, track stock levels,
            and make smarter inventory decisions — all from one platform.
          </p>
        </header>

        <button
          type="button"
          aria-label="Start free trial of Quantora inventory management software"
          className="bg-blue-600 hover:bg-blue-500 transition px-10 py-4 rounded-md font-semibold text-lg"
        >
          Start Free Trial
        </button>
      </motion.div>
    </section>
  );
}
