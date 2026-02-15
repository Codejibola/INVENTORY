/* eslint-disable */
import { useState } from "react";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";
import { Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import LOCAL_ENV from "../../ENV";

export default function Feedback() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  
  const [formData, setFormData] = useState({
    user_name: "",
    user_email: "",
    message: ""
  });

  const sendFeedback = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    //emailjs env variables
    const SERVICE_ID = LOCAL_ENV.SERVICE_ID; 
    const TEMPLATE_ID = LOCAL_ENV.TEMPLATE_ID; 
    const PUBLIC_KEY = LOCAL_ENV.PUBLIC_KEY;

    try {
      // Single call: User gets the email, You get the BCC
      await emailjs.send(
        SERVICE_ID, 
        TEMPLATE_ID, 
        formData,
        PUBLIC_KEY
      );

      setStatus({ 
        type: "success", 
        message: "Message sent! Check your inbox for confirmation." 
      });
      setFormData({ user_name: "", user_email: "", message: "" });
    } catch (err) {
      console.error("EmailJS Error:", err);
      setStatus({ 
        type: "error", 
        message: "Failed to send message. Please check your internet or try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-gray-300 font-sans">
      <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />
      
      <div className="flex-1 flex flex-col">
        <Topbar onMenuClick={() => setMenuOpen(true)} userName="Support" />

        <main className="p-6 lg:p-10 max-w-2xl mx-auto w-full">
          <header className="mb-10">
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
              Feedback <span className="text-blue-600">&</span> Support
            </h1>
            <p className="text-gray-500 text-sm mt-1">Expected response time: 7 business days.</p>
          </header>

          {status.message && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-2xl flex items-center gap-3 border ${
                status.type === "success" 
                ? "bg-green-500/10 border-green-500/20 text-green-400" 
                : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}
            >
              {status.type === "success" ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
              <span className="text-sm font-bold">{status.message}</span>
            </motion.div>
          )}

          <form onSubmit={sendFeedback} className="bg-[#0A0A0A] border border-white/5 p-8 rounded-[2rem] shadow-2xl space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-black text-gray-600 tracking-[0.2em] block mb-2 px-1">Full Name</label>
                <input
                  required
                  className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-blue-500 focus:bg-white/[0.04] transition-all"
                  placeholder="Enter your name"
                  value={formData.user_name}
                  onChange={(e) => setFormData({...formData, user_name: e.target.value})}
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-black text-gray-600 tracking-[0.2em] block mb-2 px-1">Email Address</label>
                <input
                  required
                  type="email"
                  className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-blue-500 focus:bg-white/[0.04] transition-all"
                  placeholder="your@email.com"
                  value={formData.user_email}
                  onChange={(e) => setFormData({...formData, user_email: e.target.value})}
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-black text-gray-600 tracking-[0.2em] block mb-2 px-1">How can we help?</label>
                <textarea
                  required
                  rows="4"
                  className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-blue-500 focus:bg-white/[0.04] transition-all resize-none"
                  placeholder="Describe your issue or suggestion..."
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                ></textarea>
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl text-white font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Processing...
                </>
              ) : (
                <>
                  <Send size={18} /> 
                  Submit Message
                </>
              )}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}