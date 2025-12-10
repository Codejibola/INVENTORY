// Dashboard.jsx
// eslint-disable-next-line no-unused-vars
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

// Dummy chart data (you can replace with real)
const data = [
  { month: "Jan", sales: 250 },
  { month: "Feb", sales: 220 },
  { month: "Mar", sales: 260 },
  { month: "Apr", sales: 290 },
  { month: "May", sales: 830 },
  { month: "Jun", sales: 450 },
  { month: "July", sales: 689 },
  { month: "Aug", sales: 839 },
  { month: "Sept", sales: 689 },
  { month: "Oct", sales: 689 },
  { month: "Nov", sales: 689 },
  { month: "Dec", sales: 689 },
];

export default function Dashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [monthlySales, setMonthlySales] = useState(0);
  const [displayedSales, setDisplayedSales] = useState(0);

  const [latestProduct, setLatestProduct] = useState(null);
  const [latestSale, setLatestSale] = useState(null);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Title case helper
  const toTitle = (str = "") =>
    String(str || "")
      .toLowerCase()
      .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setCurrentUser(JSON.parse(savedUser));

    fetchMonthlySales();
    fetchLatestItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Smooth animation for monthly sales
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

  // Monthly sales calculation (uses created_at on sales)
  const fetchMonthlySales = async () => {
    try {
      const res = await apiFetch("http://localhost:5000/api/sales", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch sales");
      const salesData = await res.json();

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const total = (Array.isArray(salesData) ? salesData : [])
        .filter((s) => {
          if (!s.created_at) return false;
          const saleDate = new Date(s.created_at);
          return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
        })
        .reduce((sum, s) => sum + Number(s.price || 0) * Number(s.quantity || 0), 0);

      setMonthlySales(total);
    } catch (err) {
      console.error("fetchMonthlySales:", err);
      setMonthlySales(0);
    }
  };

  // Latest sale (by created_at) and latest product (by max id)
  const fetchLatestItems = async () => {
    try {
      // SALES - fetch and choose newest by created_at if present, fallback to last element
      const salesRes = await apiFetch("http://localhost:5000/api/sales", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (salesRes.ok) {
        const salesData = await salesRes.json();
        if (Array.isArray(salesData) && salesData.length > 0) {
          const hasDates = salesData.some((s) => s.created_at);
          const latest =
            hasDates
              ? [...salesData].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
              : salesData[salesData.length - 1];
          setLatestSale(latest);
        } else {
          setLatestSale(null);
        }
      } else {
        console.error("Failed fetching sales for recent items:", salesRes.status);
      }

      // PRODUCTS - pick product with highest id (reliable even if API re-sorts)
      const prodRes = await apiFetch("http://localhost:5000/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        if (Array.isArray(prodData) && prodData.length > 0) {
          // Find max id item
          let max = prodData[0];
          for (let i = 1; i < prodData.length; i++) {
            const item = prodData[i];
            // ensure id is numeric
            const idA = Number(item.id ?? item.product_id ?? item._id ?? NaN);
            const idMax = Number(max.id ?? max.product_id ?? max._id ?? NaN);
            if (!isNaN(idA) && idA > (isNaN(idMax) ? -Infinity : idMax)) max = item;
          }
          setLatestProduct(max);
        } else {
          setLatestProduct(null);
        }
      } else {
        console.error("Failed fetching products for recent items:", prodRes.status);
      }
    } catch (err) {
      console.error("fetchLatestItems:", err);
      setLatestSale(null);
      setLatestProduct(null);
    }
  };

  return (
    <div className="min-h-screen bg-black flex relative">
      <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />

      <div className="flex-1 flex flex-col">
        <Topbar onMenuClick={() => setMenuOpen(true)} userName={currentUser?.name} />

        <main className="flex-1 p-8 space-y-8 text-white">
          {/* MAIN CARDS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            <Card title="Monthly Sales" icon="₦" desc={`₦${displayedSales.toLocaleString()}`} isHighlight />
            <Card
              title="Manage your Products"
              icon="inventory_2"
              to="/Manage_Products"
              desc=""
            />
            <Card
              title="Record your Sales"
              icon="trending_up"
              to="/recordSales"
               desc= "Take records of sales made "
            />
            <Card title="Invoices" icon="receipt_long" desc="View & manage invoices" to="/invoices"/>
          </motion.div>

          {/* CHART + RECENT ACTIVITIES */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="bg-gray-900 rounded-xl shadow p-6 lg:col-span-2 text-white"
            >
              <h2 className="text-lg font-semibold mb-4">Sales Overview</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data}>
                  <XAxis dataKey="month" stroke="white" />
                  <YAxis stroke="white" />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Recent Activities Cards (Sleek) */}
            <div className="flex flex-col gap-4">
              {/* Latest Sale Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-green-600 to-green-800 rounded-xl shadow p-4 cursor-default"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-white font-semibold">Latest Sale</h4>
                    {latestSale ? (
                      <>
                        <p className="text-white font-bold text-lg mt-1">{toTitle(latestSale.product_name)}</p>
                        <div className="mt-2 text-gray-100 text-sm">
                          <span className="inline-block mr-3">Qty: {latestSale.quantity}</span>
                          <span className="inline-block">Unit: ₦{Number(latestSale.price || 0).toLocaleString()}</span>
                        </div>
                        <p className="mt-2 text-gray-200 font-semibold">
                          Total: ₦{(Number(latestSale.price || 0) * Number(latestSale.quantity || 0)).toLocaleString()}
                        </p>
                      </>
                    ) : (
                      <p className="text-gray-200 mt-1">No sales recorded yet.</p>
                    )}
                  </div>
                  <div className="text-right">
                    <button
                      onClick={() => navigate("/recordSales")}
                      className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded"
                    >
                      View
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Latest Product Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl shadow p-4 cursor-default"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-white font-semibold">Latest Product</h4>
                    {latestProduct ? (
                      <>
                        <p className="text-white font-bold text-lg mt-1">{toTitle(latestProduct.name)}</p>
                        <div className="mt-2 text-gray-100 text-sm">
                          <span className="inline-block mr-3">Stock: {latestProduct.units}</span>
                          <span className="inline-block">Price: ₦{Number(latestProduct.price || 0).toLocaleString()}</span>
                        </div>
                        <p className="mt-2 text-gray-200 text-sm">{latestProduct.category ? toTitle(latestProduct.category) : ""}</p>
                      </>
                    ) : (
                      <p className="text-gray-200 mt-1">No products added yet.</p>
                    )}
                  </div>
                  <div className="text-right">
                    <button
                      onClick={() => navigate("/Manage_Products")}
                      className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Recent activities card
function Card({ title, desc, icon, isHighlight, to }) {
  const navigate = useNavigate();
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      onClick={() => to && navigate(to)}
      className={`rounded-xl shadow p-6 flex flex-col items-center text-center cursor-pointer hover:shadow-md transition ${
        isHighlight ? "bg-yellow-600 text-white" : "bg-gray-900 text-white"
      }`}
    >
      <span className="material-icons text-4xl mb-2">{icon}</span>
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      <p className={`text-sm ${isHighlight ? "text-white text-xl font-bold mt-1" : "text-gray-300 font-medium"}`}>
        {desc}
      </p>
    </motion.div>
  );
}
