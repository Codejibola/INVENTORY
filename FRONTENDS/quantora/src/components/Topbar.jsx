import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import apiFetch from "../utils/apiFetch";
import { useEffect, useRef, useState } from "react";
import logo from "../assets/Logo.png";
import { Menu } from "lucide-react";
import notificationSound from "../sounds/notification.wav";

export default function Topbar({ onMenuClick, userName }) {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const prevLowStockCountRef = useRef(0); // ✅ Track count, not items
  const isFirstFetchRef = useRef(true); // ✅ Skip sound on first fetch
  const audioRef = useRef(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    const fetchLowStock = async () => {
      try {
        const res = await apiFetch("http://localhost:5000/api/products", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.warn(`API error: ${res.status}`);
          return;
        }

        const data = await res.json();
        // Normalize response: handle both array and { products: [...] }
        const products = Array.isArray(data) ? data : data?.products || [];
        const newLowStock = products.filter(
          (p) => Number(p.units) < 3
        );

        // ✅ Play sound only if:
        // 1. NOT the first fetch AND
        // 2. Badge count INCREASED (new items added to low-stock list)
        if (!isFirstFetchRef.current) {
          const currentCount = newLowStock.length;
          if (currentCount > prevLowStockCountRef.current) {
            // Badge count increased = new low-stock items appeared
            audioRef.current?.play().catch(() => {});
          }
          prevLowStockCountRef.current = currentCount;
        } else {
          // First fetch: set baseline and skip sound
          prevLowStockCountRef.current = newLowStock.length;
          isFirstFetchRef.current = false;
        }

        setLowStockProducts(newLowStock);
      } catch (err) {
        console.error(err);
      }
    };

    fetchLowStock();
    const interval = setInterval(fetchLowStock, 60000);
    return () => clearInterval(interval);
  }, [token]); // ✅ ONLY token

  return (
    <>
      <audio ref={audioRef} src={notificationSound} preload="auto" />

      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full flex items-center justify-between 
                   bg-gray-900 shadow-lg px-6 py-3"
      >
        <button onClick={onMenuClick} className="md:hidden text-white p-1">
          <Menu size={28} />
        </button>

        <div className="flex items-center gap-2 hidden md:flex">
          <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
          <h2 className="text-xl font-semibold text-white">
            Welcome back, {userName || "User"}!
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/notifications"
            className="relative text-gray-300 hover:text-teal-400 transition"
          >
            <span className="material-icons">notifications</span>

            {lowStockProducts.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1">
                {lowStockProducts.length}
              </span>
            )}
          </Link>

          <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold">
            {userName ? userName.charAt(0).toUpperCase() : "U"}
          </div>
        </div>
      </motion.header>
    </>
  );
}
