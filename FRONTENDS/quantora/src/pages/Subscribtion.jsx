import React, { useState } from 'react';
import axios from 'axios';
import { Check, Zap, Crown, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // Using our context
import LOCAL_ENV from '../../ENV.js';

const plans = [
  {
    id: "monthly",
    name: "Starter Monthly",
    price: 5000,
    displayPrice: "5,000",
    icon: <Zap className="text-blue-400" size={32} />,
    features: ["Full Inventory Management", "Daily Sales Analytics", "Worker Account Access", "Real-time Stock Alerts"],
    buttonText: "Start Monthly",
    popular: false
  },
  {
    id: "yearly",
    name: "Business Yearly",
    price: 50000,
    displayPrice: "50,000",
    icon: <Crown className="text-yellow-400" size={32} />,
    features: ["Everything in Monthly", "Save ₦10,000 Yearly", "Priority Tech Support", "Detailed Monthly Reports", "Unlimited Worker Accounts"],
    buttonText: "Claim 2 Months Free",
    popular: true
  }
];

const Subscription = () => {
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState(null);

  const handlePayment = async (plan) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to subscribe');
      return;
    }

    setLoadingPlan(plan.id);

    try {
      const response = await axios.post(`${LOCAL_ENV.API_URL}/api/paystack/pay`, {
        email: user?.email, // Pull email automatically from AuthContext
        amount: plan.price * 100, // Convert to kobo
        planType: plan.id // Pass the plan type to metadata
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.data?.authorization_url) {
        window.location.href = response.data.data.authorization_url;
      }
    } catch (error) {
      alert('Payment initialization failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-200 py-16 px-4">
      <div className="max-w-5xl mx-auto text-center mb-16">
        <h1 className="text-5xl font-black text-white tracking-tighter mb-4 italic">
          QUANTORA <span className="text-blue-600">PREMIUM</span>
        </h1>
        <p className="text-slate-500 uppercase text-[10px] tracking-[0.3em] font-bold">
          Upgrade your terminal to unlock full business capabilities
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`relative p-8 rounded-[2.5rem] border transition-all duration-300 bg-slate-900/40 ${
              plan.popular ? 'border-blue-500 shadow-[0_0_40px_rgba(37,99,235,0.1)]' : 'border-slate-800'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 right-8 bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                Best Value
              </div>
            )}

            <div className="mb-6 p-3 w-fit rounded-xl bg-slate-800/50">{plan.icon}</div>
            <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-black text-white">₦{plan.displayPrice}</span>
              <span className="text-slate-500 text-sm">/{plan.id === 'monthly' ? 'mo' : 'yr'}</span>
            </div>

            <div className="space-y-4 mb-10">
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Check size={16} className="text-blue-500" />
                  <span className="text-sm text-slate-400">{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handlePayment(plan)}
              disabled={loadingPlan !== null}
              className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                plan.popular 
                ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                : 'bg-white text-black hover:bg-slate-200'
              } disabled:opacity-50`}
            >
              {loadingPlan === plan.id ? <Loader2 className="animate-spin" size={18} /> : plan.buttonText}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-16 flex flex-col items-center gap-2 opacity-40">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} />
          <span className="text-[10px] uppercase font-bold tracking-widest">Secured by Paystack</span>
        </div>
      </div>
    </div>
  );
};

export default Subscription;