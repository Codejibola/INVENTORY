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
              <span className="text-3xl font-extrabold">Q</span>
            </div>
            <h1 className="text-2xl font-semibold mb-1">
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
            <aside className="p-12 bg-black/40 text-white">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center">
                  <span className="text-blue-500 text-3xl font-extrabold">Q</span>
                </div>
                <span className="text-2xl font-semibold">Quantora</span>
              </div>

              <h2 className="text-3xl font-semibold mb-4">
                Secure admin access
              </h2>
              <p className="text-white/75 mb-6">
                Log in to control inventory, staff permissions, and analytics.
              </p>

              <ul className="space-y-3 text-white/70 text-sm">
                <li>• Inventory oversight</li>
                <li>• Staff management</li>
                <li>• Secure administration</li>
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

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-600"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button
          disabled={loading}
          className={`w-full rounded-xl py-3 text-sm font-medium text-white transition
            ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {loading ? "Signing in…" : "Login"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Don’t have an account?{" "}
        <button
          onClick={() => navigate("/register")}
          className="text-blue-600 hover:underline font-medium"
        >
          Register
        </button>
      </p>
    </>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>
      <input
        {...props}
        required
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600"
      />
    </div>
  );
}
