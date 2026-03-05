import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AlertTriangle, Clock } from "lucide-react";

export default function SubscriptionGuard() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState("");
  const [isNearExpiry, setIsNearExpiry] = useState(false);

  useEffect(() => {
    if (!user?.subscription_expiry) return;

    const checkSubscription = () => {
      const expiry = new Date(user.subscription_expiry).getTime();
      const now = new Date().getTime();
      const diff = expiry - now;

      // 1. FORCED LOGOUT: If time is up, clear role and kick to select-mode
      if (diff <= 0) {
        const updatedUser = { ...user, activeRole: null }; // Strip role
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        navigate("/select-mode");
        return;
      }

      // 2. NEAR EXPIRY: Show warning if less than 3 days (259,200,000 ms)
      if (diff < 3 * 24 * 60 * 60 * 1000) {
        setIsNearExpiry(true);
        // Optional: Format time left for the banner
        const hours = Math.floor(diff / (1000 * 60 * 60));
        setTimeLeft(`${hours} hours left`);
      }
    };

    // Run check every 1 minute
    const interval = setInterval(checkSubscription, 60000);
    checkSubscription(); // Initial check

    return () => clearInterval(interval);
  }, [user, navigate, setUser]);

  if (!isNearExpiry) return null;

  return (
    <div className="w-full bg-amber-500 text-slate-950 px-4 py-2 flex items-center justify-between font-bold text-sm shadow-md border-b border-amber-600">
      <div className="flex items-center gap-2">
        <AlertTriangle size={18} />
        <span>Subscription ends soon: {timeLeft}</span>
      </div>
      <button 
        onClick={() => navigate("/subscription")}
        className="bg-slate-950 text-white px-3 py-1 rounded-md text-xs hover:bg-slate-800 transition"
      >
        RENEW
      </button>
    </div>
  );
}