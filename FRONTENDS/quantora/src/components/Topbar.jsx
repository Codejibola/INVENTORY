/* eslint-disable */
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import apiFetch from "../utils/apiFetch";
import { useEffect, useRef, useState } from "react";
import logo from "../assets/Logo.png";
import { Menu, Bell, User, Zap } from "lucide-react";
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
                   bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-slate-800/50 px-6 lg:px-10 py-3"
      >
        {/* Left: Mobile Menu & Branding */}
        <div className="flex items-center gap-6">
          <button 
            onClick={onMenuClick} 
            className="md:hidden text-slate-400 hover:text-white transition-all p-2 bg-slate-900 rounded-xl border border-slate-800"
          >
            <Menu size={22} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={logo} alt="Logo" className="w-9 h-9 object-contain" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-[#0A0A0B] shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
            </div>
            <h2 className="hidden sm:block text-xl font-black text-white tracking-tighter italic">
              Q<span className="text-blue-500 font-bold not-italic">UANTORA</span>
            </h2>
          </div>
        </div>

        {/* Center: Welcome Badge */}
        <div className="hidden lg:flex flex-1 justify-center">
           <div className="bg-slate-900/40 border border-slate-800 px-5 py-1.5 rounded-full flex items-center gap-2 shadow-inner">
             <Zap size={14} className="text-blue-400" />
             <p className="text-xs text-slate-400 font-semibold tracking-wide uppercase">
               Terminal Active: <span className="text-white">{userName || "Staff"}</span>
             </p>
           </div>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Link
            to="/notifications"
            className="relative p-2.5 rounded-2xl bg-slate-900/50 text-slate-400 hover:text-blue-400 border border-slate-800 hover:border-blue-500/30 transition-all group"
          >
            <Bell size={20} className="group-hover:rotate-12 transition-transform" />
            
            {lowStockProducts.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 items-center justify-center text-[8px] font-black text-white">
                  {lowStockProducts.length}
                </span>
              </span>
            )}
          </Link>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-4 border-l border-slate-800/60">
            <div className="hidden sm:block text-right">
              <p className="text-[11px] font-black text-white leading-none mb-1">
                {userName || "USER"}
              </p>
              <div className="flex items-center justify-end gap-1.5">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">
                  Live Terminal
                </p>
              </div>
            </div>
            
            <div className="relative group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-[0_0_20px_rgba(37,99,235,0.25)] border-2 border-white/5 cursor-pointer group-hover:scale-105 transition-all">
                {userName ? userName.charAt(0).toUpperCase() : <User size={18}/>}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0A0A0B] rounded-full"></div>
            </div>
          </div>
        </div>
      </motion.header>
    </>
  );
}