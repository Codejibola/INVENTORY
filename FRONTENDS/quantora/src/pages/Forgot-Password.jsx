import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      setMessage("Check your email for the reset link!");
    } catch (err) {
      setMessage("Error sending email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-zinc-900 p-8 rounded-3xl border border-white/5 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-2 italic uppercase">Reset Request</h2>
        <p className="text-zinc-400 text-sm mb-6">Enter your email to receive a secure reset link.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" 
            placeholder="your@email.com"
            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-600"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-500 transition-all"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        {message && <p className="mt-4 text-center text-blue-400 text-sm font-medium">{message}</p>}
        <button onClick={() => navigate("/login")} className="mt-6 text-zinc-500 text-xs w-full text-center hover:text-white">
          Back to Login
        </button>
      </div>
    </div>
  );
}