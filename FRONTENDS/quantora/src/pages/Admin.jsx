/* eslint-disable */
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import bg from "../assets/admin0.png";
import logo from "../assets/logo.png";

export default function Admin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid credentials");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/select-mode");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>Quantora – Admin Login</title>
      </Helmet>

      <main className="min-h-screen bg-slate-50 lg:bg-[#0A0A0B] relative overflow-x-hidden">
        {/* DESKTOP BACKGROUND IMAGE */}
        <div 
          className="hidden lg:block absolute inset-0 bg-cover bg-center opacity-40" 
          style={{ backgroundImage: `url(${bg})` }} 
        />

        {/* ================= MOBILE LAYOUT ================= */}
        <div className="lg:hidden flex flex-col min-h-screen">
          <div className="relative overflow-hidden bg-[#0A0A0B] pt-20 pb-24 px-8">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full" />
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-10 text-center"
            >
              <motion.img
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                src={logo}
                alt="Quantora Logo"
                className="h-16 w-auto mb-6 mx-auto"
              />
              <h1 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h1>
              <p className="text-slate-400 mt-2 text-sm">Quantora Administration Portal</p>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="-mt-12 px-5 pb-10 flex-1 relative z-20"
          >
            <div className="bg-white rounded-[32px] shadow-2xl p-8 border border-slate-100">
              <LoginForm
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                loading={loading}
                error={error}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                navigate={navigate}
              />
            </div>
          </motion.div>
        </div>

        {/* ================= DESKTOP LAYOUT ================= */}
        <div className="hidden lg:flex min-h-screen items-center justify-center relative z-10 p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-5xl grid grid-cols-2 rounded-xl overflow-hidden shadow-2xl"
          >
            {/* LEFT PANEL: DARK THEME WITH INFO */}
            <aside className="p-12 bg-black/40 text-white flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-8">
                <img 
                  src={logo}
                  alt="Quantora Logo"
                  className="h-12 w-auto"
                />
                <span className="text-2xl font-semibold text-white">Quantora</span>
              </div>

              <h2 className="text-3xl font-semibold mb-4 text-white">
                Secure admin access
              </h2>
              <p className="text-white/75 mb-6 leading-relaxed">
                Log in to control inventory, staff permissions, and real-time analytics for your business.
              </p>

              <ul className="space-y-4 text-white/70 text-sm">
                <li className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                   Inventory oversight
                </li>
                <li className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                   Staff management
                </li>
                <li className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                   Secure administration
                </li>
              </ul>
            </aside>

            {/* RIGHT PANEL: WHITE FORM */}
            <section className="bg-white p-12 flex flex-col justify-center">
              <LoginForm
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                loading={loading}
                error={error}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                navigate={navigate}
              />
            </section>
          </motion.div>
        </div>
      </main>
    </>
  );
}

/* ================= REUSABLE LOGIN FORM COMPONENT ================= */

function LoginForm({ formData, handleChange, handleSubmit, loading, error, showPassword, setShowPassword, navigate }) {
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">
          Sign in
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Enter your admin credentials.
        </p>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-4 p-3 rounded-lg bg-red-50 text-xs font-medium text-red-600 border border-red-100"
        >
          {error}
        </motion.div>
      )}

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Email address
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="admin@quantora.com"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-all focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-gray-700">
            Password
          </label>
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="text-[11px] text-blue-600 hover:text-blue-700 font-bold uppercase tracking-tight transition-colors"
          >
            Forgot password?
          </button>
        </div>
        
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-all focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-blue-600"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <button
        disabled={loading}
        className={`w-full rounded-xl py-3.5 text-sm font-bold text-white transition-all shadow-lg
          ${loading 
            ? "bg-blue-400 cursor-not-allowed shadow-none" 
            : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 active:scale-[0.98]"}`}
      >
        {loading ? (
           <div className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Signing in…
           </div>
        ) : "Login to Dashboard"}
      </button>

      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-500">
          New to the platform?{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="text-blue-600 hover:underline font-bold"
          >
            Create an account
          </button>
        </p>
      </div>
    </form>
  );
}