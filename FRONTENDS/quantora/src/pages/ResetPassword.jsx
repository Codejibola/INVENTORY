import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [type, setType] = useState("password"); // Default to main account
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, {
        newPassword,
        type
      });
      setStatus({ type: "success", msg: "Password updated! Redirecting..." });
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setStatus({ type: "error", msg: err.response?.data?.message || "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center p-6 relative overflow-visible">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-[#0A0A0A] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl relative z-10"
      >
        <header className="mb-8">
          <span className="text-blue-500 font-black text-[10px] uppercase tracking-[0.3em] mb-2 block">Security Control</span>
          <h2 className="text-2xl font-bold text-white tracking-tighter italic uppercase">Update Access</h2>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-3 block">Target Account</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer relative z-50"
            >
              <option className="bg-black text-white" value="password">Main Login Password</option>
              <option className="bg-black text-white" value="admin_password">Admin Dashboard Password</option>
              <option className="bg-black text-white" value="worker_password">Shop Floor Password</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-3 block">New Secure Password</label>
            <input 
              type="password"
              required
              placeholder="••••••••"
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-blue-500 transition-all"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 py-4 rounded-2xl text-white font-black uppercase text-xs tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)]"
          >
            {loading ? "Syncing..." : "Restore Access"}
          </button>
        </form>

        {status.msg && (
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className={`mt-6 text-center text-sm font-bold ${status.type === "success" ? "text-green-400" : "text-red-400"}`}
          >
            {status.msg}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}