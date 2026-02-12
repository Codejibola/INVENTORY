import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Store, ShieldCheck, UserCog, Eye, EyeOff } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import apiFetch from "../utils/apiFetch.js";

export default function Settings() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showPass, setShowPass] = useState({ shop: false, admin: false, worker: false });

  const [formData, setFormData] = useState({
    shopName: "",
    shopPassword: "",
    adminPassword: "",
    workerPassword: "",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) setFormData((prev) => ({ ...prev, shopName: user.shopName || user.shop_name }));
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const toggleVisibility = (field) => setShowPass(prev => ({ ...prev, [field]: !prev[field] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await apiFetch("http://localhost:5000/api/auth/settings", {
        method: "PUT",
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update");

      // Update local storage if shop name changed
      const user = JSON.parse(localStorage.getItem("user"));
      localStorage.setItem("user", JSON.stringify({ ...user, shopName: data.shopName }));
      
      setMessage({ type: "success", text: "Settings updated successfully!" });
      // Clear password fields after success
      setFormData(prev => ({ ...prev, shopPassword: "", adminPassword: "", workerPassword: "" }));
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-gray-300">
      <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />
      <div className="flex-1 flex flex-col">
        <Topbar onMenuClick={() => setMenuOpen(true)} userName={formData.shopName} />
        
        <main className="p-6 lg:p-10 max-w-4xl mx-auto w-full">
          <header className="mb-8">
            <h1 className="text-3xl font-black text-white">Shop Settings</h1>
            <p className="text-gray-500 text-sm">Update your credentials and store configuration.</p>
          </header>

          {message.text && (
            <div className={`mb-6 p-4 rounded-xl text-sm font-bold ${message.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Store Identity */}
            <div className="bg-[#111] border border-white/5 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-600/10 text-blue-500 rounded-lg"><Store size={20}/></div>
                <h2 className="font-bold text-white">Store Identity</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest block mb-2">Shop Name</label>
                  <input
                    name="shopName"
                    value={formData.shopName}
                    onChange={handleChange}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all text-white"
                  />
                </div>
              </div>
            </div>

            {/* Passwords Section */}
            <div className="bg-[#111] border border-white/5 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-600/10 text-purple-500 rounded-lg"><ShieldCheck size={20}/></div>
                <h2 className="font-bold text-white">Security & Access</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PasswordField 
                  label="New Shop Password" 
                  name="shopPassword" 
                  value={formData.shopPassword} 
                  onChange={handleChange}
                  isVisible={showPass.shop}
                  toggle={() => toggleVisibility('shop')}
                />
                <PasswordField 
                  label="New Admin PIN" 
                  name="adminPassword" 
                  value={formData.adminPassword} 
                  onChange={handleChange}
                  isVisible={showPass.admin}
                  toggle={() => toggleVisibility('admin')}
                />
                <PasswordField 
                  label="New Worker PIN" 
                  name="workerPassword" 
                  value={formData.workerPassword} 
                  onChange={handleChange}
                  isVisible={showPass.worker}
                  toggle={() => toggleVisibility('worker')}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                disabled={loading}
                className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all disabled:opacity-50"
              >
                {loading ? "Saving..." : <><Save size={18}/> Save Changes</>}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

// Reusable Password Input Component
function PasswordField({ label, name, value, onChange, isVisible, toggle }) {
  return (
    <div>
      <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest block mb-2">{label}</label>
      <div className="relative">
        <input
          type={isVisible ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder="Leave blank to keep current"
          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all text-white placeholder:text-gray-700"
        />
        <button 
          type="button"
          onClick={toggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
        >
          {isVisible ? <EyeOff size={18}/> : <Eye size={18}/>}
        </button>
      </div>
    </div>
  );
}