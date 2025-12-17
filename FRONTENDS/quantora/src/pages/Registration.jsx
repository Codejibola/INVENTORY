// eslint-disable-next-line
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import bg from "../assets/inventory1.jpg";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          throw new Error("This email is already registered. Try another one.");
        }
        throw new Error(data.message || "Registration failed.");
      }

      navigate("/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>Create Account</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <main
        className="flex items-center justify-center min-h-screen bg-black p-4 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${bg})` }}
      >
        {/* Background overlay */}
        <div className="absolute inset-0 bg-black/70" aria-hidden="true" />

        <section
          aria-labelledby="register-heading"
          className="relative z-10 w-full max-w-md"
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="p-8 rounded-xl shadow-2xl bg-white/20 backdrop-blur-sm border border-white/20"
          >
            <motion.h1
              id="register-heading"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="text-3xl font-bold text-center text-blue-400 mb-6"
            >
              Create Account
            </motion.h1>

            {error && (
              <motion.p
                role="alert"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4 text-sm text-red-400 text-center"
              >
                {error}
              </motion.p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <motion.input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-blue-400 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              />

              {/* Email */}
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
                transition={{ delay: 0.2 }}
              />

              {/* Password */}
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
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

                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600"
                >
                  {/* icons unchanged */}
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M3 3l18 18M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10
                        0-1.42.294-2.77.825-4" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M1.5 12s4.5-7.5 10.5-7.5S22.5 12 22.5 12
                        18 19.5 12 19.5 1.5 12 1.5 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </motion.div>

              {/* Confirm Password */}
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="relative"
              >
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-blue-400 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
                />

                <button
                  type="button"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600"
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor">
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </motion.div>

              <motion.button
                whileHover={{ scale: loading ? 1 : 1.05 }}
                whileTap={{ scale: loading ? 1 : 0.95 }}
                type="submit"
                disabled={loading}
                className={`w-full py-2 mt-4 font-semibold text-white rounded-lg shadow-md transition ${
                  loading
                    ? "bg-blue-500/60 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Registering…" : "Register"}
              </motion.button>
            </form>

            <p className="mt-4 text-center text-gray-200 text-sm">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/admin")}
                className="text-blue-400 hover:underline"
              >
                Login
              </button>
            </p>
          </motion.div>
        </section>
      </main>
    </>
  );
}
