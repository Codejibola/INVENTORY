// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "What is Quantora?",
    a: "Quantora is a modern inventory management web app that helps businesses track stock levels, manage products, and make data-driven inventory decisions in real time.",
  },
  {
    q: "Is Quantora suitable for small businesses?",
    a: "Yes. Quantora is designed to scale from small businesses to growing teams, offering simple setup and powerful features without unnecessary complexity.",
  },
  {
    q: "Can I manage multiple products and categories?",
    a: "Absolutely. Quantora allows you to organize products by categories, manage Stock Keeping Units (SKUs), and monitor stock movement efficiently.",
  },
  {
    q: "Does Quantora provide low-stock alerts?",
    a: "Yes. You can set thresholds and receive alerts when inventory levels drop, helping you avoid shortages and lost sales.",
  },
  {
    q: "Is my inventory data secure?",
    a: "Quantora follows industry best practices to ensure your data is protected and accessible only to authorized users.",
  },
  {
    q: "Can I access Quantora on mobile?",
    a: "Yes. Quantora is fully web-based and works seamlessly across desktop, tablet, and mobile devices.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="bg-zinc-950 py-28 text-zinc-100"
    >
      <div className="max-w-4xl mx-auto px-6">

        {/* Header */}
        <header className="text-center mb-16">
          <h2
            id="faq-heading"
            className="text-4xl font-bold mb-4"
          >
            Frequently Asked Questions
          </h2>
          <p className="text-zinc-400 text-lg">
            Everything you need to know about using Quantora for inventory management.
          </p>
        </header>

        {/* FAQ Items */}
        <div className="space-y-4">
          {FAQS.map((item, i) => {
            const isOpen = openIndex === i;
            const answerId = `faq-answer-${i}`;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex justify-between items-center px-6 py-5 text-left"
                >
                  <span className="font-medium">{item.q}</span>
                  <ChevronDown
                    className={`transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div
                    id={answerId}
                    className="px-6 pb-5 text-zinc-400 leading-relaxed"
                  >
                    {item.a}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
