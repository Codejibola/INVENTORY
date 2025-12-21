/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import demo1 from "../assets/Demo01.png";
import demo2 from "../assets/demo2.png";
import demo3 from "../assets/demo3.png";
import demo4 from "../assets/demo4.png";
import demo5 from "../assets/demo5.png";
import demo6 from "../assets/demo6.png";
import demo7 from "../assets/demo7.png";
import demo8 from "../assets/demo8.png";
import demo9 from "../assets/demo9.png";
import { Helmet } from "react-helmet-async";

const images = [demo1, demo2, demo3, demo4, demo5, demo6, demo7, demo8, demo9];

export default function DemoPage() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000); // 3s
    return () => clearInterval(interval);
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <>
      <Helmet>
        <title>App Demo | Quantora</title>
        <meta name="description" content="Demo showing how the app works from signup to usage." />
      </Helmet>

      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">How Quantora Works</h1>

        <div className="relative w-full max-w-3xl h-[500px] md:h-[600px] overflow-hidden rounded-xl shadow-lg">
          <AnimatePresence>
            <motion.img
              key={currentIndex}
              src={images[currentIndex]}
              alt={`Demo step ${currentIndex + 1}`}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.8 }}
              className="w-full h-full object-contain absolute top-0 left-0"
            />
          </AnimatePresence>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full"
          >
            ‹
          </button>
          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full"
          >
            ›
          </button>
        </div>

        {/* Dots */}
        <div className="flex gap-2 mt-4">
          {images.map((_, idx) => (
            <span
              key={idx}
              className={`w-3 h-3 rounded-full cursor-pointer ${
                idx === currentIndex ? "bg-white" : "bg-gray-500"
              }`}
              onClick={() => setCurrentIndex(idx)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
