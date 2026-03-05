/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import LOCAL_ENV from "../../ENV.js"; 
import { useAuth } from "../context/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import apiFetch from "../utils/apiFetch";
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  ShoppingCart, 
  Award, 
  AlertCircle, 
  ArrowRight 
} from "lucide-react";
import { Helmet, HelmetProvider } from "react-helmet-async";

export default function Dashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user: currentUser, refreshUser } = useAuth();
  const [monthlySales, setMonthlySales] = useState(0);
  const [displayedSales, setDisplayedSales] = useState(0);
  const [latestProduct, setLatestProduct] = useState(null);
  const [latestSale, setLatestSale] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [monthlyProfitLoss, setMonthlyProfitLoss] = useState(0);
  const [shopWorth, setShopWorth] = useState(0);
  const [bestSellingProduct, setBestSellingProduct] = useState(null);
  const [leastSellingProduct, setLeastSellingProduct] = useState(null);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const toTitle = (str = "") =>
    String(str || "")
      .toLowerCase()
      .replace(/\w\S*/g, (txt) =>
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      );

  const formatShortNumber = (value) => {
    const num = Number(value) || 0;
    return new Intl.NumberFormat("en", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(num);
  };

useEffect(() => {
    const syncAndFetch = async () => {
      // 1. Check if returning from payment to clear URL
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('status') === 'success' || urlParams.get('trxref')) {
        window.history.replaceState({}, document.title, "/dashboard");
      }

      // 2. Await the refresh so local storage/context is updated BEFORE fetchData runs
      await refreshUser(); 
      
      // 3. Now fetch the dashboard data with the fresh subscription status
      fetchData();
    };

    if (token) {
      syncAndFetch();
    } else {
      navigate("/login");
    }
  }, [token, refreshUser, fetchData]); 

  const fetchData = async () => {
    try {
      const authHeader = { headers: { Authorization: `Bearer ${token}` } };
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonthIdx = now.getMonth();

      const secureFetch = async (url) => {
        const res = await apiFetch(url, authHeader);
        if (res.status === 403) {
          await refreshUser(); 
          return null;
        }
        return res.ok ? await res.json() : null;
      };

      // 1. Fetch Latest Sales
      const salesData = await secureFetch(`${LOCAL_ENV.API_URL}/api/sales`) || [];
      if (salesData.length > 0) setLatestSale(salesData[0]);

      // 2. Fetch Daily Aggregate
      const dailyData = await secureFetch(`${LOCAL_ENV.API_URL}/api/sales/daily?year=${currentYear}`) || [];

      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthlyTotals = months.map((monthName, idx) => {
        const monthSales = dailyData
          .filter(d => new Date(d.date).getUTCMonth() === idx)
          .reduce((sum, d) => sum + Number(d.total_sales || 0), 0);
        return { month: monthName, sales: monthSales };
      });

      setChartData(monthlyTotals);
      setMonthlySales(monthlyTotals[currentMonthIdx]?.sales || 0);

      const currentMonthProfit = dailyData
        .filter(d => new Date(d.date).getUTCMonth() === currentMonthIdx)
        .reduce((sum, d) => sum + Number(d.total_profit_loss || 0), 0);
      setMonthlyProfitLoss(currentMonthProfit);

      const prodData = await secureFetch(`${LOCAL_ENV.API_URL}/api/products`) || [];
      setShopWorth(prodData.reduce((sum, p) => sum + (Number(p.selling_price || 0) * Number(p.units || 0)), 0));
      
      if (prodData.length > 0) {
        const sortedProds = [...prodData].sort((a, b) => b.id - a.id);
        setLatestProduct(sortedProds[0]);
      }

      const bestData = await secureFetch(`${LOCAL_ENV.API_URL}/api/sales/best-selling`);
      const leastData = await secureFetch(`${LOCAL_ENV.API_URL}/api/sales/least-selling`);

      if (bestData) setBestSellingProduct(bestData);
      if (leastData) setLeastSellingProduct(leastData);

    } catch (err) {
      console.error("fetchData Error:", err);
    }
  };


  return (
    <HelmetProvider>
      <Helmet><title>Dashboard | Quantora</title></Helmet>
      {/* Rest of your JSX remains the same */}
      <div className="min-h-screen bg-[#050505] flex relative">
        <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />
        <div className="flex-1 flex flex-col">
          <Topbar onMenuClick={() => setMenuOpen(true)} userName={currentUser?.name} />
          <main className="flex-1 p-6 lg:p-10 space-y-10 text-white max-w-[1600px] mx-auto w-full">
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <ActionCard 
                title={`${new Date().toLocaleString('default', { month: 'long' })} Sales`} 
                icon="payments" 
                desc={`₦${displayedSales.toLocaleString()}`} 
                isHighlight 
              />
              <ActionCard title="Shop Worth" icon="inventory" desc={`₦${formatShortNumber(shopWorth)}`} />
              <ActionCard title="Manage Products" icon="edit_note" to="/Manage_Products" />
              <ActionCard title="Record Sales" icon="add_shopping_cart" to="/recordSales" />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <article className="bg-[#111] border border-white/5 rounded-2xl p-6 lg:col-span-2 shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold tracking-tight">Revenue Trends ({new Date().getFullYear()})</h2>
                  <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-3 py-1 rounded-full text-xs font-bold">
                    <TrendingUp size={14} /> Live Updates
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 12}} tickFormatter={(v) => formatShortNumber(v)} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: '8px' }} />
                    <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={35} />
                  </BarChart>
                </ResponsiveContainer>
              </article>

              <aside className="space-y-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">Quick Insights</h2>
                <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
                  <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${monthlyProfitLoss >= 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                        {monthlyProfitLoss >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Profit ({new Date().toLocaleString('default', { month: 'short' })})</p>
                        <p className={`text-lg font-bold ${monthlyProfitLoss >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {monthlyProfitLoss >= 0 ? "+" : "-"}₦{Math.abs(monthlyProfitLoss).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <InsightRow label="Latest Sale" title={latestSale ? toTitle(latestSale.product_name) : "No Sales"} sub={`Qty: ${latestSale?.quantity || 0}`} icon={<ShoppingCart size={18} className="text-blue-400" />} />
                  <InsightRow label="New Arrival" title={latestProduct ? toTitle(latestProduct.name) : "No Products"} sub={`Stock: ${latestProduct?.units || 0}`} icon={<Package size={18} className="text-purple-400" />} />
                  <InsightRow label="Top Performer" title={bestSellingProduct ? toTitle(bestSellingProduct.productName) : "N/A"} sub={`${bestSellingProduct?.totalQuantitySold || 0} sold`} icon={<Award size={18} className="text-yellow-400" />} isBest />
                  <InsightRow label="Low Performance" title={leastSellingProduct ? toTitle(leastSellingProduct.productName) : "N/A"} sub={`${leastSellingProduct?.totalQuantitySold || 0} sold`} icon={<AlertCircle size={18} className="text-red-400" />} />
                </div>
              </aside>
            </div>
          </main>
        </div>
      </div>
    </HelmetProvider>
  );
}


function ActionCard({ title, desc, icon, isHighlight, to }) {
    const navigate = useNavigate();
    return (
      <motion.div
        whileHover={{ y: -5 }}
        onClick={() => to && navigate(to)}
        className={`p-6 rounded-2xl cursor-pointer transition-all border ${
          isHighlight 
          ? "bg-blue-600 border-blue-500 shadow-lg shadow-blue-900/20" 
          : "bg-[#111] border-white/5 hover:border-white/20"
        }`}
      >
        <div className="flex justify-between items-start">
          <span className="material-icons text-white/50 text-3xl">{icon}</span>
          {to && <ArrowRight size={16} className="text-white/30" />}
        </div>
        <div className="mt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/60">{title}</h3>
          <p className="text-2xl font-black mt-1">{desc || "Manage"}</p>
        </div>
      </motion.div>
    );
}

function InsightRow({ label, title, sub, icon, isBest }) {
    return (
      <div className="p-5 flex items-center justify-between group hover:bg-white/[0.02] transition-colors">
        <div className="flex items-center gap-4">
          <div className="bg-white/5 p-2 rounded-lg">{icon}</div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-tighter text-gray-500">{label}</p>
            <p className={`text-sm font-bold truncate max-w-[140px] ${isBest ? "text-yellow-500" : "text-gray-200"}`}>{title}</p>
          </div>
        </div>
        <span className="text-[11px] font-bold bg-white/5 px-2 py-1 rounded text-gray-400">{sub}</span>
      </div>
    );
}