/* eslint-disable */
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FiUser, FiShoppingBag, FiMail, FiLock, FiShield, FiBriefcase, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import bg from "../assets/inventory1.jpg";
import logo from "../assets/logo.png";

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

      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>Quantora – Setup your store</title>
      </Helmet>

      <main className="min-h-screen bg-slate-50 lg:bg-[#0A0A0B] relative overflow-x-hidden">
        {/* DESKTOP BACKGROUND */}
        <div 
          className="hidden lg:block absolute inset-0 bg-cover bg-center opacity-30" 
          style={{ backgroundImage: `url(${bg})` }} 
        />

        {/* ================= MOBILE LAYOUT ================= */}
        <div className="lg:hidden flex flex-col min-h-screen">
          <div className="relative overflow-hidden bg-[#0A0A0B] pt-16 pb-24 px-8">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full" />
            
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
                className="h-14 w-auto mb-6 mx-auto"
              />
              <h1 className="text-2xl font-bold text-white tracking-tight">Setup Your Store</h1>
              <p className="text-slate-400 mt-2 text-sm px-4">Create your workspace and secure your inventory.</p>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="-mt-12 px-4 pb-10 flex-1 relative z-20"
          >
            <div className="bg-white rounded-[32px] shadow-2xl p-6 border border-slate-100">
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
          </motion.div>
        </div>

        {/* ================= DESKTOP LAYOUT ================= */}
        <div className="hidden lg:flex min-h-screen items-center justify-center relative z-10 p-6">
          <div className="w-full max-w-6xl grid grid-cols-2 rounded-xl overflow-hidden shadow-2xl">
            {/* LEFT */}
            <aside className="hidden lg:flex flex-col justify-center p-12 bg-black/40 text-white relative overflow-hidden">
              {/* Decorative glow */}
              <div className="absolute top-20 -right-32 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full opacity-50" />
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-600/10 blur-[120px] rounded-full opacity-40" />
              
              <div className="relative z-10">
                {/* Logo & Brand */}
                <div className="flex items-center gap-3 mb-12">
                  <motion.img
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                    src={logo}
                    alt="Quantora Logo"
                    className="h-12 w-auto"
                  />
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-2xl font-bold tracking-tight"
                  >
                    Quantora
                  </motion.span>
                </div>

                {/* Main Heading */}
                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl font-bold mb-6 leading-tight"
                >
                  Build your shop <br />
                  <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">workspace today</span>
                </motion.h2>

                {/* Subtitle */}
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="text-white/70 mb-10 leading-relaxed"
                >
                  Configure inventory, administrators and workers securely. Start managing your business in minutes.
                </motion.p>

                {/* Features List */}
                <motion.ul 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, staggerChildren: 0.1 }}
                  className="space-y-4 mb-12"
                >
                  {[
                    { icon: '✓', text: 'Unlimited inventory SKUs', color: 'text-blue-400' },
                    { icon: '✓', text: 'Multi-level role management', color: 'text-indigo-400' },
                    { icon: '✓', text: 'Real-time stock tracking', color: 'text-cyan-400' },
                    { icon: '✓', text: 'Encrypted security & PINs', color: 'text-green-400' },
                  ].map((item, idx) => (
                    <motion.li 
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.05 }}
                      className="flex items-center gap-3 text-sm text-white/80 hover:text-white/100 transition-colors"
                    >
                      <span className={`text-lg font-bold ${item.color}`}>{item.icon}</span>
                      {item.text}
                    </motion.li>
                  ))}
                </motion.ul>

                {/* CTA Stats */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                  className="pt-8 border-t border-white/10"
                >
                  <p className="text-xs text-white/60 uppercase tracking-widest mb-4">Trusted by businesses worldwide</p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-400">50+</p>
                      <p className="text-xs text-white/50 mt-1">Active Shops</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-indigo-400">700+</p>
                      <p className="text-xs text-white/50 mt-1">Products Tracked</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-cyan-400">99.9%</p>
                      <p className="text-xs text-white/50 mt-1">Uptime SLA</p>
                    </div>
                  </div>
                </motion.div>
              </div>
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

/* ================= REUSABLE FORM CONTENT ================= */

function FormContent({ formData, handleChange, acceptedTerms, setAcceptedTerms, handleSubmit, loading, error, navigate }) {
  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Create Account</h2>
        <p className="text-sm text-slate-500 mt-1">Fill in the details to get started.</p>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-red-50 border-l-4 border-red-500 p-3 text-red-700 text-xs font-medium rounded-r-lg"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Full Name" name="name" icon={<FiUser/>} placeholder="John Doe" value={formData.name} onChange={handleChange} />
          <Input label="Shop Name" name="shopName" icon={<FiShoppingBag/>} placeholder="Quantora Store" value={formData.shopName} onChange={handleChange} />
        </div>

        <Input label="Email Address" type="email" name="email" icon={<FiMail/>} placeholder="admin@store.com" value={formData.email} onChange={handleChange} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Main Password" type="password" name="password" icon={<FiLock/>} placeholder="••••••••" value={formData.password} onChange={handleChange} />
          <Input label="Confirm Password" type="password" name="confirmPassword" icon={<FiLock/>} placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} />
        </div>

        <div className="pt-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Access Security (PINs)</p>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Admin PIN" type="password" name="adminPassword" icon={<FiShield/>} placeholder="1234" value={formData.adminPassword} onChange={handleChange} />
              <Input label="Worker PIN" type="password" name="workerPassword" icon={<FiBriefcase/>} placeholder="5678" value={formData.workerPassword} onChange={handleChange} />
            </div>
        </div>

        <div className="flex items-start gap-3 py-2">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 transition-all"
          />
          <span className="text-xs text-slate-500 leading-relaxed">
            I agree to the <a href="/terms" className="text-blue-600 font-bold">Terms</a> and <a href="/privacy" className="text-blue-600 font-bold">Privacy Policy</a>
          </span>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          disabled={loading || !acceptedTerms}
          className={`w-full py-4 rounded-2xl font-bold text-white shadow-xl flex items-center justify-center gap-2 transition-all
            ${(loading || !acceptedTerms) ? "bg-slate-300 cursor-not-allowed shadow-none" : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/30"}`}
        >
          {loading ? "Creating Store..." : <>Complete Setup <FiArrowRight/></>}
        </motion.button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Already registered? <button onClick={() => navigate("/login")} className="text-blue-600 font-bold hover:underline">Log in</button>
      </p>
    </>
  );
}

function Input({ label, icon, ...props }) {
  return (
    <div className="group">
      <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1 mb-2 block">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
            {icon}
        </div>
        <input
          {...props}
          required
          className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl text-sm focus:ring-0 focus:border-blue-600/20 focus:bg-white transition-all outline-none"
        />
      </div>
    </div>
  );
}