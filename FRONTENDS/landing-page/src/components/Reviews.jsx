// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const REVIEWS = [
  {
    name: "Balikis L.",
    role: "Retail Store Owner",
    rating: 5,
    text: "Quantora completely changed how I manage businees sales. The profit and loss feature has been of tremendous help to me. Now, i can keep track of the profit or loss i make on each sales, and also per month. It lets me know which products are more profitable, helping me make smarter decisions.",
  },
  {
    name: "Adewale K.",
    role: "E-commerce Seller",
    rating: 5,
    text: "The low-stock alerts alone are worth it. Quantora helps me stay ahead of demand without constant manual checks.",
  },
  {
    name: "Daniel O.",
    role: "Wholesale Distributor",
    rating: 4,
    text: "Simple, fast, and reliable. Quantora gives my team visibility into inventory across categories with zero confusion.",
  },
];

export default function Review() {
  return (
    <section
      id="reviews"
      aria-labelledby="reviews-heading"
      className="bg-zinc-950 py-28 text-zinc-100"
    >
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <header className="text-center mb-20">
          <h2
            id="reviews-heading"
            className="text-4xl font-bold mb-4"
          >
            Trusted by Growing Businesses
          </h2>
          <p className="text-zinc-400 text-lg">
            See how Quantora helps teams stay in control of their inventory.
          </p>
        </header>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {REVIEWS.map((review, index) => (
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -6 }}
              className="
                group relative bg-zinc-900/70 backdrop-blur
                border border-zinc-800 rounded-2xl p-7
                transition-all duration-300
                hover:border-blue-500/40
                hover:shadow-xl hover:shadow-blue-500/10
              "
            >
              {/* Quote Mark */}
              <div className="absolute top-5 right-6 text-6xl text-zinc-800 group-hover:text-blue-500/20 transition">
                “
              </div>

              {/* Review Text */}
              <p className="relative text-zinc-300 leading-relaxed mb-8">
                {review.text}
              </p>

              {/* Footer */}
              <footer className="mt-auto">
                <p className="font-semibold text-white">
                  {review.name}
                </p>
                <p className="text-sm text-zinc-400 mb-3">
                  {review.role}
                </p>

                {/* Rating */}
                <div
                  className="flex gap-1 text-yellow-400 text-sm"
                  aria-label={`Rating: ${review.rating} out of 5`}
                >
                  {"★".repeat(review.rating)}
                  <span className="text-zinc-600">
                    {"★".repeat(5 - review.rating)}
                  </span>
                </div>
              </footer>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
