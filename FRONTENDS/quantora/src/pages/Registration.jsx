/* eslint-disable-next-line */
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

  const [acceptedTerms, setAcceptedTerms] = useState(false);
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

    if (!acceptedTerms) {
      setError("You must agree to the Terms and Privacy Policy to continue.");
      return;
    }

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
        <div className="absolute inset-0 bg-black/70" aria-hidden="true" />

        <section className="relative z-10 w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="p-8 rounded-xl shadow-2xl bg-white/20 backdrop-blur-sm border border-white/20"
          >
            <motion.h1
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
                className="w-full px-4 py-2 rounded-lg border border-blue-400 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-4 py-2 rounded-lg border border-blue-400 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-4 py-2 rounded-lg border border-blue-400 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600"
                >
                  {showPassword ? "Hide" : "Show"}
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
                  className="w-full px-4 py-2 rounded-lg border border-blue-400 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </motion.div>

              {/* Terms Checkbox */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="flex items-start gap-2 text-sm text-gray-200"
              >
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 accent-blue-500"
                />
                <span>
                  I agree to Quantora’s{" "}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Terms & Conditions
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Privacy Policy
                  </a>
                  .
                </span>
              </motion.div>

              {/* Submit */}
              <motion.button
                whileHover={{
                  scale: loading || !acceptedTerms ? 1 : 1.05,
                }}
                whileTap={{
                  scale: loading || !acceptedTerms ? 1 : 0.95,
                }}
                type="submit"
                disabled={loading || !acceptedTerms}
                className={`w-full py-2 mt-4 font-semibold text-white rounded-lg transition ${
                  loading || !acceptedTerms
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
