import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BellRing, X, UserCheck } from "lucide-react";

export default function LoginPopup() {
  const [activeNotification, setActiveNotification] = useState(null);

  useEffect(() => {
    const handleStorageChange = (e) => {
      // Check if the change happened to our specific "ping" key
      if (e.key === "quantora_new_login_ping" && e.newValue) {
        const data = JSON.parse(e.newValue);
        
        // Trigger the popup
        setActiveNotification(data);

        // Auto-dismiss after 8 seconds
        setTimeout(() => {
          setActiveNotification(null);
        }, 8000);
      }
    };

    // Listen for changes from other tabs (the worker terminal)
    window.addEventListener("storage", handleStorageChange);
    
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <AnimatePresence>
      {activeNotification && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
          className="fixed top-6 right-6 z-[9999] w-80 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
        >
          <div className="bg-slate-900 border border-blue-500/30 backdrop-blur-xl p-4 rounded-3xl flex items-start gap-4">
            <div className="bg-blue-500/20 p-3 rounded-2xl text-blue-400">
              <BellRing size={20} className="animate-bounce" />
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">
                  Security Alert
                </span>
                <button 
                  onClick={() => setActiveNotification(null)}
                  className="text-slate-500 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
              
              <h4 className="text-white font-bold text-sm mt-1">
                New Worker Session
              </h4>
              <p className="text-slate-400 text-xs mt-1">
                <span className="text-white font-semibold">{activeNotification.name}</span> has just accessed the terminal.
              </p>
              <p className="text-[10px] text-slate-600 mt-2 font-mono italic">
                {new Date(activeNotification.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}