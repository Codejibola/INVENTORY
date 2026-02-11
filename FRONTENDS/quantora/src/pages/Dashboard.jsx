/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import apiFetch from "../utils/apiFetch";
import { TrendingUp, TrendingDown } from "lucide-react";
// SEO
import { Helmet, HelmetProvider } from "react-helmet-async";

export default function Dashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
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
    try {
      return new Intl.NumberFormat("en", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(num);
    } catch (e) {
      return num.toLocaleString();
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    fetchData();
  }, [token]);

  useEffect(() => {
    if (monthlySales > 0) {
      let start = 0;
      const duration = 800;
      const steps = Math.min(monthlySales, 60) || 1;
      const increment = monthlySales / steps;
      const intervalTime = duration / steps;

      const timer = setInterval(() => {
        start += increment;
        if (start >= monthlySales) {
          start = monthlySales;
          clearInterval(timer);
        }
        setDisplayedSales(Math.floor(start));
      }, intervalTime);

      return () => clearInterval(timer);
    } else {
      setDisplayedSales(0);
    }
  }, [monthlySales]);

  const fetchData = async () => {
    try {
      const authHeader = { headers: { Authorization: `Bearer ${token}` } };
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonthIdx = now.getMonth();

      // 1. Fetch Sales (Standard List for Latest Sale)
      const salesRes = await apiFetch("http://localhost:5000/api/sales", authHeader);
      const salesData = salesRes.ok ? await salesRes.json() : [];
      if (salesData.length > 0) setLatestSale(salesData[0]);

      // 2. Fetch Daily Sales for Chart & Monthly Stats
      const dailyRes = await apiFetch(`http://localhost:5000/api/sales/daily?year=${currentYear}`, authHeader);
      const dailyData = dailyRes.ok ? await dailyRes.json() : [];

      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthlyTotals = months.map((month, idx) => {
        const total = dailyData
          .filter(d => new Date(d.date).getMonth() === idx)
          .reduce((sum, d) => sum + Number(d.total_sales || 0), 0);
        return { month, sales: total };
      });

      setChartData(monthlyTotals);
      setMonthlySales(monthlyTotals[currentMonthIdx]?.sales || 0);

      const profitTotal = dailyData
        .filter(d => new Date(d.date).getMonth() === currentMonthIdx)
        .reduce((sum, d) => sum + Number(d.total_profit_loss || 0), 0);
      setMonthlyProfitLoss(profitTotal);

      // 3. Fetch Products (Worth & Latest Product)
      const prodRes = await apiFetch("http://localhost:5000/api/products", authHeader);
      const prodData = prodRes.ok ? await prodRes.json() : [];
      setShopWorth(prodData.reduce((sum, p) => sum + Number(p.selling_price || 0) * Number(p.units || 0), 0));
      
      // Find the latest product based on highest ID
      if (prodData.length > 0) {
        const sortedProds = [...prodData].sort((a, b) => (b.id || 0) - (a.id || 0));
        setLatestProduct(sortedProds[0]);
      }

      // 4. Fetch Best/Least Selling from specific endpoints
      const [bestRes, leastRes] = await Promise.all([
        apiFetch("http://localhost:5000/api/sales/best-selling", authHeader),
        apiFetch("http://localhost:5000/api/sales/least-selling", authHeader)
      ]);

      if (bestRes.ok) setBestSellingProduct(await bestRes.json());
      if (leastRes.ok) setLeastSellingProduct(await leastRes.json());

    } catch (err) {
      console.error("fetchData Error:", err);
    }
  };

  return (
    <HelmetProvider>
      <Helmet>
        <title>Dashboard | Quantora</title>
      </Helmet>

      <div className="min-h-screen bg-black flex relative">
        <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />

        <div className="flex-1 flex flex-col">
          <Topbar onMenuClick={() => setMenuOpen(true)} userName={currentUser?.name} />

          <main className="flex-1 p-8 space-y-8 text-white">
            {/* TOP ACTION CARDS */}
            <section>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-6"
              >
                <Card title="Monthly Sales" icon="₦" desc={`₦${formatShortNumber(displayedSales)}`} isHighlight />
                <Card title="Shop Worth" icon="store" desc={`₦${formatShortNumber(shopWorth)}`} />
                <Card title="Manage Products" icon="inventory_2" to="/Manage_Products" desc="Add/Edit Inventory" />
                <Card title="Record Sales" icon="trending_up" to="/recordSales" desc="Log New Sales" />
              </motion.div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart */}
              <article className="bg-gray-900 rounded-xl shadow p-6 lg:col-span-2">
                <h2 className="text-lg font-semibold mb-4">Sales Overview</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" tickFormatter={(v) => formatShortNumber(v)} />
                    <Tooltip contentStyle={{ backgroundColor: "#111827", border: "none" }} />
                    <Bar dataKey="sales" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </article>

              {/* Insights Sidebar */}
              <div className="flex flex-col gap-4">
                {/* Profit/Loss */}
                <article className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-400 text-sm">Monthly Profit/Loss</p>
                      <p className={`text-xl font-bold ${monthlyProfitLoss >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {monthlyProfitLoss >= 0 ? "+" : "-"}₦{Math.abs(monthlyProfitLoss).toLocaleString()}
                      </p>
                    </div>
                    {monthlyProfitLoss >= 0 ? <TrendingUp className="text-green-400" /> : <TrendingDown className="text-red-400" />}
                  </div>
                </article>

                {/* Latest Sale */}
                <article className="bg-gradient-to-r from-green-600 to-green-800 p-4 rounded-xl shadow">
                  <h3 className="text-sm font-semibold opacity-90 text-white">Latest Sale</h3>
                  {latestSale ? (
                    <div className="mt-1">
                      <p className="text-lg font-bold">{toTitle(latestSale.product_name)}</p>
                      <p className="text-xs opacity-80">Qty: {latestSale.quantity} | Total: ₦{Number(latestSale.price).toLocaleString()}</p>
                    </div>
                  ) : <p className="text-sm">No sales yet.</p>}
                </article>

                {/* Latest Product Added (THE MISSING CARD) */}
                <article className="bg-gradient-to-r from-purple-600 to-purple-800 p-4 rounded-xl shadow">
                  <h3 className="text-sm font-semibold opacity-90 text-white">Latest Product Added</h3>
                  {latestProduct ? (
                    <div className="mt-1">
                      <p className="text-lg font-bold">{toTitle(latestProduct.name)}</p>
                      <p className="text-xs opacity-80">Stock: {latestProduct.units} | Price: ₦{Number(latestProduct.price).toLocaleString()}</p>
                    </div>
                  ) : <p className="text-sm">No products found.</p>}
                </article>

                {/* Best Selling */}
                <article className="bg-gradient-to-r from-yellow-600 to-orange-700 p-4 rounded-xl shadow">
                  <h3 className="text-sm font-semibold opacity-90 text-white">Best Selling Product</h3>
                  {bestSellingProduct ? (
                    <div className="mt-1">
                      <p className="text-lg font-bold">{toTitle(bestSellingProduct.productName)}</p>
                      <p className="text-xs opacity-80">Sold: {bestSellingProduct.totalQuantitySold} units</p>
                    </div>
                  ) : <p className="text-sm">No data.</p>}
                </article>

                {/* Least Selling */}
                <article className="bg-gradient-to-r from-red-600 to-red-800 p-4 rounded-xl shadow">
                  <h3 className="text-sm font-semibold opacity-90 text-white">Least Selling Product</h3>
                  {leastSellingProduct ? (
                    <div className="mt-1">
                      <p className="text-lg font-bold">{toTitle(leastSellingProduct.productName)}</p>
                      <p className="text-xs opacity-80">Sold: {leastSellingProduct.totalQuantitySold} units</p>
                    </div>
                  ) : <p className="text-sm">No data.</p>}
                </article>
              </div>
            </section>
          </main>
        </div>
      </div>
    </HelmetProvider>
  );
}

function Card({ title, desc, icon, isHighlight, to }) {
  const navigate = useNavigate();
  return (
    <motion.article
      whileHover={{ scale: 1.03 }}
      onClick={() => to && navigate(to)}
      className={`p-6 rounded-xl cursor-pointer transition ${
        isHighlight ? "bg-blue-600 text-white shadow-lg" : "bg-gray-900 border border-gray-800"
      }`}
    >
      <div className="flex flex-col items-center">
        <span className="material-icons text-4xl mb-2">{icon}</span>
        <h3 className="text-sm font-medium opacity-70">{title}</h3>
        <p className="text-xl font-bold mt-1 text-center">{desc}</p>
      </div>
    </motion.article>
  );
}