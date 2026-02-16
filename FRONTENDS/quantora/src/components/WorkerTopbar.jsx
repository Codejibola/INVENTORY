/* eslint-disable */
import { useEffect, useState } from "react";
import { Menu, Store, Activity, UserCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function WorkerTopbar({ onMenuClick }) {
  const [shopName, setShopName] = useState("Quantora");
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) return;

        const data = await res.json();
        // Updated to use both local storage and state for reliability
        localStorage.setItem("user", JSON.stringify(data.user));
        setShopName(data.user?.shop_name || "Quantora Store");
      } catch {
        setIsOnline(false); // Visual feedback if connection drops
      }
    };

    fetchUser();
  }, []);

  return (
    <header className="w-full bg-[#0A0A0B]/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between border-b border-slate-800/50 sticky top-0 z-40">
      
      {/* Left Side: Brand & Navigation Trigger */}
      <div className="flex items-center gap-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onMenuClick}
          className="md:hidden p-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl hover:text-blue-500 transition-colors"
        >
          <Menu size={22} />
        </motion.button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/10 border border-white/10">
            <Store className="text-white" size={20} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-white tracking-tight uppercase">
              {shopName}
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOnline ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Terminal Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Quick Info Badges */}
      <div className="flex items-center gap-3">
        {/* Connection Status Badge (Desktop Only) */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-900/50 border border-slate-800 px-3 py-1.5 rounded-full">
          <Activity size={12} className="text-blue-500" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
            System Synced
          </p>
        </div>

        {/* Mode Label */}
        <div className="bg-blue-600/10 border border-blue-500/20 px-3 py-1.5 rounded-full">
           <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.15em]">
             Worker Mode
           </p>
        </div>

        {/* Small Profile Icon */}
        <div className="ml-2 w-8 h-8 rounded-full border border-slate-800 bg-slate-900 flex items-center justify-center text-slate-500">
            <UserCircle size={20} />
        </div>
      </div>
    </header>
  );
}