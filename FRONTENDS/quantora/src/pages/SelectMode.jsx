/* eslint-disable */

import { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { motion, AnimatePresence } from "framer-motion";

import { 

  ShieldCheck, 

  Briefcase, 

  Eye, 

  EyeOff, 

  AlertCircle, 

  User as UserIcon,

  Info,

  HelpCircle,

  X,
  CreditCard,
  Lock

} from "lucide-react";

import logo from "../assets/logo.webp";

import LOCAL_ENV from "../../ENV.js"; 

import { useAuth } from "../context/AuthContext";



export default function SelectMode() {

  const navigate = useNavigate();

  const { user, setUser } = useAuth();

  

  const [showModal, setShowModal] = useState(false);

  const [showSubModal, setShowSubModal] = useState(false);

  const [selectedRole, setSelectedRole] = useState(null);

  const [activeInfo, setActiveInfo] = useState(null); 

  

  const [workerName, setWorkerName] = useState(""); 

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);



  useEffect(() => {

    if (!user && !localStorage.getItem("user")) {

      navigate("/login"); 

    }

  }, [user, navigate]);



  const roles = [

    {

      id: "admin",

      title: "Shop Owner",

      description: "Full command over shop finances, staff, and inventory.",

      details: [

        "Full 'Boss' access — you control everything",

        "Monitor daily sales and total shop profits",

        "Add, edit, or delete products and prices",

        "View staff login activity & performance",

        "Manage billing and subscription plans"

      ],

      icon: ShieldCheck,

      accent: "from-blue-600 to-indigo-700",

    },

    {

      id: "worker",

      title: "Staff Member",

      description: "Basic terminal for recording sales and checking stock.",

      details: [

        "Simple interface for daily sales tasks",

        "Record sales and issue customer receipts",

        "Check which products are currently in stock",

        "Restricted: Cannot see total shop profits",

        "Restricted: Cannot change product prices"

      ],

      icon: Briefcase,

      accent: "from-emerald-500 to-teal-600",

    },

  ];



  const handleSelect = (role) => {

    setSelectedRole(role);

    setPassword("");

    setWorkerName(""); 

    setShowPassword(false);

    setError("");

    setShowModal(true);

  };



  const handleVerify = async () => {

    // Validation

    if (selectedRole.id === "worker" && !workerName.trim()) {

      setError("Worker name is required");

      return;

    }

    if (!password) {

      setError("Password is required");

      return;

    }



    setLoading(true);

    setError("");



    try {

      const res = await fetch(`${LOCAL_ENV.API_URL}/api/auth/verify-role`, {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({

          userId: user.id,

          role: selectedRole.id,

          password,

          // Sending workerName to backend for the notification table

          workerName: selectedRole.id === "worker" ? workerName.trim() : "Admin",

        }),

      });



      const data = await res.json();



      if (res.status === 401) {

        setError(data.error || "Invalid password");

        return;

      }



      if (res.status === 403 || (data.valid && data.subscribed === false)) {

        setShowModal(false);

        setShowSubModal(true);

        return;

      }



      if (res.ok && data.valid && data.subscribed) {

        const activeIdentity = selectedRole.id === "worker" ? workerName.trim() : "Admin";

        

        // Save identity for UI personalized greetings

        localStorage.setItem("quantora_active_user", activeIdentity);



        // Local activity log for history tab

        const existingLogs = JSON.parse(localStorage.getItem("quantora_activity_log") || "[]");

        const newLog = {

          id: Date.now(),

          type: "LOGIN",

          name: activeIdentity,

          role: selectedRole.id,

          timestamp: new Date().toISOString()

        };

        localStorage.setItem("quantora_activity_log", JSON.stringify([newLog, ...existingLogs].slice(0, 50)));



        // Update Global Auth State

        const updatedUser = { ...user, activeRole: selectedRole.id };

        localStorage.setItem("user", JSON.stringify(updatedUser));

        setUser(updatedUser); 

        

        setShowModal(false);

        selectedRole.id === "admin" ? navigate("/dashboard") : navigate("/worker");

      } else {

        setError(data.error || "Verification failed");

      }

    } catch (err) {

      setError("Server connection failed");

    } finally {

      setLoading(false);

    }

  };



  return (

    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6 py-12 relative overflow-hidden">

      {/* Background decoration */}

      <div className="absolute inset-0 overflow-hidden pointer-events-none">

        <div className="absolute -top-[10%] -left-[10%] w-[70%] md:w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>

        <div className="absolute -bottom-[10%] -right-[10%] w-[70%] md:w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>

      </div>



      <div className="w-full max-w-4xl z-10">

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center mb-8 md:mb-12">

          <img src={logo} alt="Quantora Logo" className="w-12 h-12 md:w-16 md:h-16 mb-4" />

          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-wide">

            <span className="text-blue-500">Q</span>uantora

          </h1>

          <p className="mt-3 text-sm md:text-base text-slate-400">

            Shop: <span className="text-white font-medium uppercase tracking-wider">{user.shopName || user.shop_name}</span>

          </p>

          <p className="mt-1 text-xs md:text-sm text-slate-500">Secure selection for business management</p>

          <div className="mt-4 rounded-3xl border border-slate-800 bg-slate-900/90 px-4 py-4 text-[11px] text-slate-300">

            <div className="flex items-start gap-3">

              <Info size={18} className="text-blue-400 flex-shrink-0" />

              <div>

                <p className="font-semibold text-slate-100">Install this app for faster access</p>

                <ol className="list-decimal list-inside space-y-1 text-slate-400">

                  <li>Open your browser menu (⋮ or ⋯).</li>

                  <li>Select “Install app”, “Add to Home screen”, or “Add to device”.</li>

                  <li>Confirm the install and add the app to your home screen or desktop.</li>

                  <li>Use the new icon to open your store directly next time.</li>

                </ol>

              </div>

            </div>

          </div>

        </motion.div>



        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">

          {roles.map((role, i) => {

            const Icon = role.icon;

            return (

              <motion.div

                key={role.id}

                initial={{ opacity: 0, y: 20 }}

                animate={{ opacity: 1, y: 0 }}

                transition={{ delay: i * 0.1 }}

                className="relative group rounded-2xl p-[1px] bg-white/10"

              >

                <button 

                  onClick={(e) => {

                    e.stopPropagation();

                    setActiveInfo(activeInfo === role.id ? null : role.id);

                  }}

                  className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"

                >

                  <Info size={18} />

                </button>



                <AnimatePresence>

                  {activeInfo === role.id && (

                    <motion.div 

                      initial={{ opacity: 0, scale: 0.95 }}

                      animate={{ opacity: 1, scale: 1 }}

                      exit={{ opacity: 0, scale: 0.95 }}

                      className="absolute inset-0 z-10 bg-slate-900/98 backdrop-blur-xl rounded-2xl p-6 flex flex-col justify-center border border-white/10 shadow-2xl"

                    >

                      <div className="flex justify-between items-center mb-4">

                        <h4 className={`font-black uppercase tracking-tighter text-sm flex items-center gap-2 ${role.id === 'admin' ? 'text-blue-400' : 'text-emerald-400'}`}>

                          <HelpCircle size={16} /> {role.id === 'admin' ? "Owner Privileges" : "Staff Permissions"}

                        </h4>

                        <button onClick={(e) => { e.stopPropagation(); setActiveInfo(null); }} className="text-slate-600 hover:text-white"><X size={14}/></button>

                      </div>

                      

                      <ul className="space-y-3">

                        {role.details.map((detail, idx) => (

                          <li key={idx} className="text-[13px] text-slate-200 flex items-start gap-2 leading-tight font-medium">

                            <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${role.id === 'admin' ? 'bg-blue-500' : 'bg-emerald-500'}`} />

                            {detail}

                          </li>

                        ))}

                      </ul>

                    </motion.div>

                  )}

                </AnimatePresence>



                <div 

                  onClick={() => handleSelect(role)}

                  className="rounded-2xl bg-slate-900/80 backdrop-blur-sm p-6 md:p-8 h-full border border-white/5 flex flex-col items-center md:items-start text-center md:text-left transition-all hover:bg-slate-900 cursor-pointer"

                >

                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${role.accent} flex items-center justify-center mb-4 md:mb-6 shadow-lg shadow-black/50`}>

                    <Icon size={24} className="md:w-7 md:h-7" />

                  </div>

                  <h2 className="text-xl md:text-2xl font-black mb-2">{role.title}</h2>

                  <p className="text-sm text-slate-400 leading-relaxed font-medium">{role.description}</p>

                </div>

              </motion.div>

            );

          })}

        </div>

      </div>



      <AnimatePresence>

        {showModal && (

          <motion.div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/90 backdrop-blur-md px-4 pb-10 md:pb-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

            <motion.div initial={{ scale: 0.95, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 50 }} className="w-full max-w-sm rounded-[2.5rem] bg-slate-900 border border-white/10 p-6 md:p-8 shadow-2xl">

              <h3 className="text-xl font-black uppercase tracking-tight mb-6">

                {selectedRole?.id === "worker" ? "Verify Staff" : "Owner Verification"}

              </h3>

              

              <div className="space-y-4">

                {selectedRole?.id === "worker" && (

                  <div className="relative">

                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">

                      <UserIcon size={18} />

                    </div>

                    <input

                      type="text"

                      value={workerName}

                      onChange={(e) => setWorkerName(e.target.value)}

                      placeholder="Enter Staff Name (e.g. jibs)"

                      className="w-full rounded-2xl pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder:text-slate-700 font-bold"

                    />

                  </div>

                )}



                <div className="relative">

                  <input

                    type={showPassword ? "text" : "password"}

                    value={password}

                    onChange={(e) => setPassword(e.target.value)}

                    placeholder="Enter Secret Key"

                    className="w-full rounded-2xl px-4 py-4 pr-12 bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-slate-700 font-bold"

                  />

                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 p-2">

                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}

                  </button>

                </div>

              </div>



              {error && <p className="text-red-500 text-xs mt-4 font-black text-center uppercase tracking-tighter">{error}</p>}

              

              <div className="flex flex-col gap-3 mt-8">

                <button onClick={handleVerify} disabled={loading} className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition shadow-lg ${loading ? "bg-blue-600/50" : "bg-blue-600 shadow-blue-600/20"}`}>

                  {loading ? "Verifying..." : "Access Mode"}

                </button>

                <button onClick={() => setShowModal(false)} className="w-full py-3 rounded-2xl bg-transparent text-slate-500 font-bold text-xs uppercase hover:text-white transition-colors">Cancel</button>

              </div>

            </motion.div>

          </motion.div>

        )}

        {showSubModal && (
          <motion.div 
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 backdrop-blur-xl px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCard size={40} />
              </div>
              
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Subscription Inactive</h3>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                Access to <span className="text-white">Quantora</span> services for this shop has expired. Please renew your subscription to resume business operations.
              </p>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => navigate("/subscription")}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                  <Lock size={14} /> Renew Subscription
                </button>
                <button 
                  onClick={() => setShowSubModal(false)}
                  className="w-full py-3 text-slate-500 hover:text-white font-bold text-xs uppercase transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>

  );

}