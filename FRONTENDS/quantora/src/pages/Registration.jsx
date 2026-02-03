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
    shopName: "",
    email: "",
    password: "",
    confirmPassword: "",
    adminPassword: "",
    workerPassword: "",
  });

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!acceptedTerms) {
      setError("You must agree to the Terms and Privacy Policy.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed.");

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
        <title>Setup your store</title>
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
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-6 pt-12 pb-20 text-white text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-4">
              <span className="text-3xl font-extrabold text-white">Q</span>
            </div>
            <h1 className="text-2xl font-semibold mb-1">
              Setup Your Store
            </h1>
            <p className="text-sm text-white/80">
              Welcome to Quantora. Let’s get your workspace ready.
            </p>
          </div>

          {/* FORM CARD */}
          <div className="-mt-14 px-4 pb-10">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <FormContent
                formData={formData}
                handleChange={handleChange}
                acceptedTerms={acceptedTerms}
                setAcceptedTerms={setAcceptedTerms}
                handleSubmit={handleSubmit}
                loading={loading}
                error={error}
                navigate={navigate}
              />
            </div>
          </div>
        </div>

        {/* ================= DESKTOP LAYOUT ================= */}
        <div className="hidden lg:flex min-h-screen items-center justify-center relative z-10 p-6">
          <div className="w-full max-w-6xl grid grid-cols-2 rounded-xl overflow-hidden shadow-2xl">
            {/* LEFT */}
            <aside className="hidden lg:flex flex-col justify-center p-12 bg-black/40 text-white">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center">
                  <span className="text-blue-500 text-3xl font-extrabold">Q</span>
                </div>
                <span className="text-2xl font-semibold">Quantora</span>
              </div>

              <h2 className="text-3xl font-semibold mb-4">
                Build your shop workspace
              </h2>
              <p className="text-white/75 mb-6">
                Configure inventory, administrators and workers securely.
              </p>

              <ul className="space-y-3 text-white/70 text-sm">
                <li>• Shop-based inventory control</li>
                <li>• Admin & worker roles</li>
                <li>• Secure access management</li>
              </ul>
            </aside>

            {/* RIGHT */}
            <section className="bg-white p-12">
              <FormContent
                formData={formData}
                handleChange={handleChange}
                acceptedTerms={acceptedTerms}
                setAcceptedTerms={setAcceptedTerms}
                handleSubmit={handleSubmit}
                loading={loading}
                error={error}
                navigate={navigate}
              />
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

/* ================= FORM CONTENT (REUSED) ================= */

function FormContent({
  formData,
  handleChange,
  acceptedTerms,
  setAcceptedTerms,
  handleSubmit,
  loading,
  error,
  navigate,
}) {
  return (
    <>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">
        Create your account
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Set up your shop and credentials.
      </p>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full name" name="name" value={formData.name} onChange={handleChange} />
        <Input label="Shop name" name="shopName" value={formData.shopName} onChange={handleChange} />
        <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} />

        <div className="grid grid-cols-2 gap-3">
          <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} />
          <Input label="Confirm" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Admin PIN" type="password" name="adminPassword" value={formData.adminPassword} onChange={handleChange} />
          <Input label="Worker PIN" type="password" name="workerPassword" value={formData.workerPassword} onChange={handleChange} />
        </div>

        <div className="flex items-start gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1 accent-blue-600"
          />
          <span>
            I agree to the{" "}
            <a href="/terms" className="text-blue-600 hover:underline">
              Terms
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </span>
        </div>

        <button
          disabled={loading || !acceptedTerms}
          className={`w-full rounded-xl py-3 text-sm font-medium text-white
            ${loading || !acceptedTerms
              ? "bg-blue-400"
              : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {loading ? "Creating…" : "Create Store Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <button
          onClick={() => navigate("/admin")}
          className="text-blue-600 hover:underline font-medium"
        >
          Log in
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



