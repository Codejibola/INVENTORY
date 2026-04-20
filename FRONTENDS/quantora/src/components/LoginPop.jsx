import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BellRing, X } from "lucide-react";
import LOCAL_ENV from "../../ENV.js";
import { useAuth } from "../context/AuthContext";

export default function LoginPopup() {
  const [activeNotification, setActiveNotification] = useState(null);
  const { user } = useAuth();

  // Function to mark notification as read in DB
  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${LOCAL_ENV.API_URL}/api/auth/notifications/${id}/read`, {
        method: "PATCH",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json" 
        },
      });
    } catch (err) {
      console.error("Failed to silence notification:", err);
    }
  };

  useEffect(() => {
    // Only poll if the user is logged in as the Admin (Owner)
    if (!user || user.activeRole !== "admin") return;

    const checkNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${LOCAL_ENV.API_URL}/api/auth/notifications/latest`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        const data = await res.json();

        // If we find an unread notification and it's different from the current one
        if (data && data.id !== activeNotification?.id) {
          setActiveNotification(data);

          // Auto-dismiss and mark as read after 10 seconds
          setTimeout(() => {
            handleDismiss(data.id);
          }, 10000);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    const handleDismiss = (id) => {
      setActiveNotification(null);
      markAsRead(id);
    };

    // Poll every 5 seconds
    const interval = setInterval(checkNotifications, 5000);
    
    // Check immediately on mount
    checkNotifications();

    return () => clearInterval(interval);
  }, [user, activeNotification]);

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
                  Terminal Alert
                </span>
                <button 
                  onClick={() => {
                    markAsRead(activeNotification.id);
                    setActiveNotification(null);
                  }}
                  className="text-slate-500 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
              
              <h4 className="text-white font-bold text-sm mt-1">
                Staff Login Detected
              </h4>
              <p className="text-slate-400 text-xs mt-1">
                <span className="text-blue-400 font-bold">
                  {activeNotification.worker_name || "Staff"}
                </span> has initialized a session.
              </p>
              <p className="text-[10px] text-slate-600 mt-2 font-mono italic">
                {new Date(activeNotification.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}