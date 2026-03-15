/* eslint-disable */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Briefcase, Eye, EyeOff, AlertCircle, CreditCard } from "lucide-react";
import logo from "../assets/logo.png";
import LOCAL_ENV from "../../ENV.js"; 
import { useAuth } from "../context/AuthContext";

export default function SelectMode() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  
  const [showModal, setShowModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user && !localStorage.getItem("user")) {
      navigate("/login"); 
    }
  }, [user, navigate]);

  const roles = [
    {
      id: "admin",
      title: "Admin Mode",
      description: "Full access to inventory, reports, and settings",
      icon: ShieldCheck,
      accent: "from-blue-500 to-indigo-600",
    },
    {
      id: "worker",
      title: "Worker Mode",
      description: "Sales recording and limited shop operations",
      icon: Briefcase,
      accent: "from-emerald-500 to-teal-600",
    },
  ];

  const handleSelect = (role) => {
    setSelectedRole(role);
    setPassword("");
    setShowPassword(false);
    setError("");
    setShowModal(true);
  };

  const handleVerify = async () => {
    if (!password) {
      setError("Password is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${LOCAL_ENV.API_URL}/api/auth/verify-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          role: selectedRole.id,
          password,
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        setError(data.error || "Invalid password");
        return;
      }

      if (res.status === 403 || (data.valid && data.subscribed === false)) {
        setShowModal(false);
        setShowSubModal(true);
        return;
      }

      if (res.ok && data.valid && data.subscribed) {
        const updatedUser = { ...user, activeRole: selectedRole.id };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser); 
        
        setShowModal(false);
        selectedRole.id === "admin" ? navigate("/dashboard") : navigate("/worker");
      } else {
        setError(data.error || "Verification failed");
      }

    } catch (err) {
      setError("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[70%] md:w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[70%] md:w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-4xl z-10">
        {/* Header - Scaled for Mobile */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center mb-8 md:mb-12">
          <img src={logo} alt="Quantora Logo" className="w-12 h-12 md:w-16 md:h-16 mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-wide">
            <span className="text-blue-500">Q</span>uantora
          </h1>
          <p className="mt-3 text-sm md:text-base text-slate-400">
            Shop: <span className="text-white font-medium">{user.shopName || user.shop_name}</span>
          </p>
          <p className="mt-1 text-xs md:text-sm text-slate-500 max-w-[250px] md:max-w-none">Choose how you want to operate the store</p>
        </motion.div>

        {/* Roles Grid - Mobile Optimization */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {roles.map((role, i) => {
            const Icon = role.icon;
            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSelect(role)}
                className="relative cursor-pointer rounded-2xl p-[1px] bg-white/10"
              >
                <div className="rounded-2xl bg-slate-900/80 backdrop-blur-sm p-6 md:p-8 h-full border border-white/5 flex flex-col items-center md:items-start text-center md:text-left transition-all hover:bg-slate-900">
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${role.accent} flex items-center justify-center mb-4 md:mb-6 shadow-lg`}>
                    <Icon size={24} className="md:w-7 md:h-7" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold mb-2">{role.title}</h2>
                  <p className="text-sm text-slate-400 leading-relaxed">{role.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {/* MODAL 1: Mobile-Friendly Padding */}
        {showModal && (
          <motion.div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm px-4 pb-10 md:pb-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0.95, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 50 }} className="w-full max-w-sm rounded-3xl bg-slate-900 border border-white/10 p-6 md:p-8 shadow-2xl">
              <h3 className="text-xl font-bold mb-4 text-center md:text-left">Enter {selectedRole?.title} Password</h3>
              <div className="relative mb-4">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Secret Key"
                  className="w-full rounded-xl px-4 py-4 pr-12 bg-slate-950 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-slate-600"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 p-2">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {error && <p className="text-red-400 text-xs mb-4 font-medium text-center">{error}</p>}
              <div className="flex flex-col-reverse md:flex-row gap-3">
                <button onClick={() => setShowModal(false)} className="w-full md:flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-medium">Cancel</button>
                <button onClick={handleVerify} disabled={loading} className={`w-full md:flex-1 py-3 rounded-xl font-bold transition ${loading ? "bg-blue-600/50" : "bg-blue-600"}`}>
                  {loading ? "Verifying..." : "Enter Mode"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* MODAL 2: Subscription Alert - Optimized for readability */}
        {showSubModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl px-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full max-w-md rounded-[2.5rem] bg-slate-900 border border-yellow-500/20 p-8 shadow-2xl text-center">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="text-yellow-500" size={32} />
              </div>
              <h3 className="text-2xl font-black mb-3">Service Paused</h3>
              <p className="text-sm text-slate-400 mb-8 leading-relaxed">
                Your shop subscription is expired. 
                {selectedRole?.id === "admin" 
                  ? " Head to the billing portal to get Quantora back online." 
                  : " Tell your shop boss to renew the plan so you can keep selling!"}
              </p>
              
              <div className="space-y-3">
                {selectedRole?.id === "admin" && (
                  <button 
                    onClick={() => navigate("/subscription")}
                    className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-600/20"
                  >
                    Renew Subscription
                  </button>
                )}
                <button 
                  onClick={() => setShowSubModal(false)} 
                  className="w-full py-4 rounded-2xl bg-slate-800 text-slate-400 font-bold text-xs uppercase"
                >
                  Go Back
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}