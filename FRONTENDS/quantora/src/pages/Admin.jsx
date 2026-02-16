/* eslint-disable */
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import bg from "../assets/admin0.png";

export default function Admin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

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
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <main className="min-h-screen bg-gray-100 lg:bg-black relative">
        {/* DESKTOP BACKGROUND */}
        <div
          className="hidden lg:block absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bg})` }}
        />
        <div className="hidden lg:block absolute inset-0 bg-black/80" />

        {/* ================= MOBILE LAYOUT ================= */}
        <div className="lg:hidden">
          {/* HERO */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-6 pt-14 pb-20 text-white text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-4">
              <span className="text-3xl font-extrabold text-white">Q</span>
            </div>
            <h1 className="text-2xl font-semibold mb-1 text-white">
              Quantora Login
            </h1>
            <p className="text-sm text-white/80">
              Sign in to manage your store operations.
            </p>
          </div>

          {/* FORM CARD */}
          <div className="-mt-14 px-4 pb-10">
            <div className="bg-white rounded-2xl shadow-xl p-6">
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
          </div>
        </div>

        {/* ================= DESKTOP LAYOUT ================= */}
        <div className="hidden lg:flex min-h-screen items-center justify-center relative z-10 p-6">
          <div className="w-full max-w-5xl grid grid-cols-2 rounded-xl overflow-hidden shadow-2xl">
            {/* LEFT PANEL */}
            <aside className="p-12 bg-black/40 text-white flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                  <span className="text-white text-2xl font-extrabold">Q</span>
                </div>
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

            {/* RIGHT PANEL */}
            <section className="bg-white p-12">
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
          </div>
        </div>
      </main>
    </>
  );
}

/* ================= REUSABLE LOGIN FORM ================= */

function LoginForm({
  formData,
  handleChange,
  handleSubmit,
  loading,
  error,
  showPassword,
  setShowPassword,
  navigate,
}) {
  return (
    <>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">
        Sign in
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Enter your admin credentials.
      </p>

      {error && (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-4 p-3 rounded-lg bg-red-50 text-xs font-medium text-red-600 border border-red-100"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email address"
          type="email"
          name="email"
          placeholder="admin@quantora.com"
          value={formData.email}
          onChange={handleChange}
        />

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
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-500">
          New to the platform?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-blue-600 hover:underline font-bold"
          >
            Create an account
          </button>
        </p>
      </div>
    </>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
        {label}
      </label>
      <input
        {...props}
        required
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-all focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none"
      />
    </div>
  );
}