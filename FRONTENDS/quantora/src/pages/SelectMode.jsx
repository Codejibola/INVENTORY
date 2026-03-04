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
  const [showSubModal, setShowSubModal] = useState(false); // New state for Sub Alert
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

      // UX IMPROVEMENT: If subscription is inactive, show the SubModal
      if (res.status === 403 || (data.valid && data.subscribed === false)) {
        setShowModal(false); // Close password modal
        setShowSubModal(true); // Open subscription alert
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
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-5xl z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center mb-12">
          <img src={logo} alt="Quantora Logo" className="w-16 h-16 mb-4" />
          <h1 className="text-4xl font-bold text-white tracking-wide">
            <span className="text-blue-500">Q</span>uantora
          </h1>
          <p className="mt-4 text-slate-400">Signed in as <span className="text-white font-medium">{user.shopName || user.shop_name}</span></p>
          <p className="mt-2 text-slate-300">Choose how you want to operate the store</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {roles.map((role, i) => {
            const Icon = role.icon;
            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(role)}
                className="relative cursor-pointer rounded-2xl p-[1px] bg-gradient-to-br from-white/10 to-white/5"
              >
                <div className="rounded-2xl bg-slate-900 p-8 h-full border border-white/10">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${role.accent} flex items-center justify-center mb-6 shadow-lg`}><Icon size={28} /></div>
                  <h2 className="text-2xl font-semibold mb-2">{role.title}</h2>
                  <p className="text-slate-400 leading-relaxed">{role.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {/* MODAL 1: Password Verification */}
        {showModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full max-w-sm rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl">
              <h3 className="text-xl font-semibold mb-2">Enter {selectedRole?.title} Password</h3>
              <div className="relative mb-3 mt-4">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-xl px-4 py-3 pr-12 bg-slate-950 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {error && <p className="text-red-400 text-sm mb-3 font-medium">{error}</p>}
              <div className="flex justify-between gap-3 mt-4">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition">Cancel</button>
                <button onClick={handleVerify} disabled={loading} className={`flex-1 py-2 rounded-xl font-medium transition ${loading ? "bg-blue-600/50 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}>
                  {loading ? "Verifying…" : "Verify"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* MODAL 2: Subscription Alert (The UX Upgrade) */}
        {showSubModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full max-w-md rounded-3xl bg-slate-900 border border-yellow-500/30 p-8 shadow-2xl text-center">
              <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="text-yellow-500" size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Subscription Required</h3>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Your shop subscription is currently inactive or has expired. 
                {selectedRole?.id === "admin" 
                  ? " Please renew your plan to regain access to the Admin Dashboard." 
                  : " Please contact your shop administrator to renew the subscription."}
              </p>
              
              <div className="flex flex-col gap-3">
                {selectedRole?.id === "admin" && (
                  <button 
                    onClick={() => navigate("/subscription")}
                    className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                  >
                    <CreditCard size={20} />
                    Renew Subscription Now
                  </button>
                )}
                <button 
                  onClick={() => setShowSubModal(false)} 
                  className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}