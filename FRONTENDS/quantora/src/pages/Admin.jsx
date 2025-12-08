/* eslint-disable */
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bg from "../assets/admin0.jpeg";

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
    <div
      className="flex items-center justify-center min-h-screen bg-black p-4 relative bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* dark overlay */}
      <div className="absolute inset-0 bg-black/70" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-8 rounded-xl shadow-2xl bg-white/20 backdrop-blur-sm border border-white/20"
      >
        <motion.h2
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-3xl font-bold text-center text-blue-400 mb-6"
        >
          Quantora Login
        </motion.h2>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 text-sm text-red-400 text-center"
          >
            {error}
          </motion.p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* EMAIL */}
          <motion.input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-blue-400 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          />

          {/* PASSWORD WITH EYE ICON */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-blue-400 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
            />

            {/* Eye toggle */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600"
            >
              {showPassword ? (
                // Eye Off
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10
                      0-1.42.294-2.77.825-4M6.29 6.29A9.956 9.956 0 0112 5c5.523 0 10 4.477 10 10
                      0 1.61-.38 3.13-1.06 4.47M3 3l18 18"
                  />
                </svg>
              ) : (
                // Eye On
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1.5 12s4.5-7.5 10.5-7.5S22.5 12 22.5 12
                      18 19.5 12 19.5 1.5 12 1.5 12z"
                  />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </motion.div>

          {/* LOGIN BUTTON */}
          <motion.button
            whileHover={loading ? {} : { scale: 1.03 }}
            whileTap={loading ? {} : { scale: 0.97 }}
            type="submit"
            disabled={loading}
            className={`w-full py-2 mt-4 font-semibold text-white rounded-lg relative overflow-hidden
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
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-4 text-center text-gray-200 text-sm"
        >
          Don’t have an account?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-blue-400 hover:underline"
          >
            Register
          </button>
        </motion.p>
      </motion.div>
    </div>
  );
}
