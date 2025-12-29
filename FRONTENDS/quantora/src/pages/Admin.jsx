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
      if (!res.ok) throw new Error(data.message || "Invalid email or password");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");
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

      <main
        className="flex items-center justify-center min-h-screen bg-black p-4 relative bg-cover bg-center"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <div className="absolute inset-0 bg-black/70" />

        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 w-full max-w-lg p-10 rounded-2xl shadow-2xl bg-white/10 backdrop-md border border-white/20 flex flex-col"
          aria-label="Admin Login Form"
        >
          <motion.h1
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-3xl md:text-4xl font-bold text-center text-blue-400 mb-8"
          >
            Quantora Login
          </motion.h1>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 text-sm text-red-400 text-center"
            >
              {error}
            </motion.p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* EMAIL */}
            <motion.input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-5 py-3 rounded-xl border border-blue-400 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            />

            {/* PASSWORD */}
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
              aria-label="Password Input"
            >
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-5 py-3 rounded-xl border border-blue-400 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </motion.div>

            {/* LOGIN BUTTON */}
            <motion.button
              whileHover={loading ? {} : { scale: 1.03 }}
              whileTap={loading ? {} : { scale: 0.97 }}
              type="submit"
              disabled={loading}
              className={`w-full py-3 font-semibold text-white rounded-xl relative overflow-hidden
              transition-all duration-300 ${loading ? "cursor-not-allowed opacity-70" : ""}`}
              style={{
                background:
                  "linear-gradient(135deg, rgba(0,102,255,0.9), rgba(0,60,180,0.9))",
                boxShadow: "0 0 10px rgba(0,102,255,0.5), 0 0 25px rgba(0,102,255,0.2)",
              }}
            >
              {loading ? "Connecting…" : "Login"}
            </motion.button>
          </form>

          {/* REGISTER LINK */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-center text-gray-200 text-sm"
            aria-label="Register Link"
          >
            Don’t have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-blue-400 hover:underline"
            >
              Register
            </button>
          </motion.div>
        </motion.section>
      </main>
    </>
  );
}
