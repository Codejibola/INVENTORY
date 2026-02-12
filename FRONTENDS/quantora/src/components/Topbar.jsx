/* eslint-disable */
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import apiFetch from "../utils/apiFetch";
import { useEffect, useRef, useState } from "react";
import logo from "../assets/Logo.png";
import { Menu, Bell, User } from "lucide-react";
import notificationSound from "../sounds/notification.wav";

export default function Topbar({ onMenuClick, userName }) {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const prevLowStockCountRef = useRef(0);
  const isFirstFetchRef = useRef(true);
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

        if (!res.ok) return;

        const data = await res.json();
        const products = Array.isArray(data) ? data : data?.products || [];
        const newLowStock = products.filter((p) => Number(p.units) < 3);

        if (!isFirstFetchRef.current) {
          const currentCount = newLowStock.length;
          if (currentCount > prevLowStockCountRef.current) {
            audioRef.current?.play().catch(() => {});
          }
          prevLowStockCountRef.current = currentCount;
        } else {
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
  }, [token]);

  return (
    <>
      <audio ref={audioRef} src={notificationSound} preload="auto" />

      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full sticky top-0 z-30 flex items-center justify-between 
                   bg-black/20 backdrop-blur-md border-b border-white/5 px-6 lg:px-10 py-4"
      >
        {/* Left Side: Mobile Menu & Logo */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick} 
            className="md:hidden text-gray-400 hover:text-white transition p-1"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
            <h2 className="hidden sm:block text-lg font-bold text-white tracking-tight">
              Quantora <span className="text-blue-500 text-xs ml-1 uppercase opacity-60"></span>
            </h2>
          </div>
        </div>

        {/* Center: Welcome Greeting (Now the focal point) */}
        <div className="hidden md:flex flex-1 justify-center">
           <p className="text-sm text-gray-400 font-medium bg-white/5 px-4 py-2 rounded-full border border-white/5">
             Welcome back, <span className="text-white font-bold">{userName || "User"}</span>
           </p>
        </div>

        {/* Right Side: Notifications & Profile */}
        <div className="flex items-center gap-5">
          {/* Notifications Link */}
          <Link
            to="/notifications"
            className="relative p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all group"
          >
            <Bell size={20} className="group-hover:rotate-12 transition-transform" />
            
            {lowStockProducts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
              </span>
            )}
          </Link>

          {/* User Profile Section */}
          <div className="flex items-center gap-3 pl-4 border-l border-white/10">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-white leading-tight">
                {userName || "Staff"}
              </p>
              <div className="flex items-center justify-end gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                  Online
                </p>
              </div>
            </div>
            
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-teal-400 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20 border-2 border-white/10 cursor-pointer hover:scale-105 transition-transform">
              {userName ? userName.charAt(0).toUpperCase() : <User size={18}/>}
            </div>
          </div>
        </div>
      </motion.header>
    </>
  );
}