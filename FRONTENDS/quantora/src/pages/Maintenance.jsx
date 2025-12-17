// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

export default function Maintenance() {
  return (
    <>
      <Helmet>
        <title>Maintenance</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white text-center p-6">
        <section aria-labelledby="maintenance-title">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6"
          >
            {/* Decorative icon */}
            <motion.div
              aria-hidden="true"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-6xl"
            >
              🚧
            </motion.div>

            <motion.h1
              id="maintenance-title"
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl font-bold"
            >
              Website Under Maintenance
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg text-gray-300"
            >
              We’re currently making some improvements.
              Please check back soon!
            </motion.p>

            {/* Loading indicator */}
            <motion.div
              role="progressbar"
              aria-label="Maintenance in progress"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              className="h-2 bg-blue-500 rounded-full"
            />
          </motion.div>
        </section>
      </main>
    </>
  );
}
