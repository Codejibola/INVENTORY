import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Briefcase } from "lucide-react";
import logo from "../assets/Logo.png";

export default function SelectMode() {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/admin");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

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
      const res = await fetch("http://localhost:5000/api/auth/verify-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          role: selectedRole.id,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.valid) {
        setError(data.error || "Invalid password");
      } else {
        setShowModal(false);
        selectedRole.id === "admin"
          ? navigate("/dashboard")
          : navigate("/worker/");
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
      <div className="w-full max-w-5xl">
        
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center mb-12"
        >
          {/* Logo at the top */}
          <img src={logo} alt="Quantora Logo" className="w-16 h-16 mb-4" />
          
          {/* Text with blue 'Q' */}
          <h1 className="text-4xl font-bold text-white tracking-wide">
            <span className="text-blue-500">Q</span>uantora
          </h1>

          <p className="mt-4 text-slate-400">
            Signed in as <span className="text-white font-medium">{user.shopName}</span>
          </p>
          <p className="mt-2 text-slate-300">
            Choose how you want to operate the store
          </p>
        </motion.div>

        {/* ROLE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {roles.map((role, i) => {
            const Icon = role.icon;
            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSelect(role)}
                className="relative cursor-pointer rounded-2xl p-[1px] bg-gradient-to-br from-white/10 to-white/5"
              >
                <div className="rounded-2xl bg-slate-900 p-8 h-full border border-white/10">
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${role.accent}
                                flex items-center justify-center mb-6 shadow-lg`}
                  >
                    <Icon size={28} />
                  </div>

                  <h2 className="text-2xl font-semibold mb-2">
                    {role.title}
                  </h2>
                  <p className="text-slate-400 leading-relaxed">
                    {role.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* FOOTER CONTEXT */}
        <p className="text-center text-slate-500 text-sm mt-12">
          Access is protected by role-specific credentials for security
        </p>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl"
            >
              <h3 className="text-xl font-semibold mb-2">
                Enter {selectedRole.title} Password
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                This action is restricted for security reasons
              </p>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-xl px-4 py-3 bg-slate-950 border border-slate-700
                           focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              />

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm mb-3"
                >
                  {error}
                </motion.p>
              )}

              <div className="flex justify-between gap-3 mt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerify}
                  disabled={loading}
                  className={`flex-1 py-2 rounded-xl font-medium transition
                    ${loading
                      ? "bg-blue-600/50 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  {loading ? "Verifying…" : "Verify"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}