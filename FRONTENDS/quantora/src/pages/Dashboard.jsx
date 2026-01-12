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
      // Fetch sales
      const salesRes = await apiFetch("http://localhost:5000/api/sales", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const salesData = salesRes.ok ? await salesRes.json() : [];

      if (Array.isArray(salesData) && salesData.length > 0) {
        const hasDates = salesData.some((s) => s.created_at);
        const latest = hasDates
          ? [...salesData].sort(
              (a, b) =>
                new Date(b.created_at) - new Date(a.created_at)
            )[0]
          : salesData[salesData.length - 1];
        setLatestSale(latest);
      } else {
        setLatestSale(null);
      }

      // Profit & Loss
      // Current date (used for monthly calculations)
      const now = new Date();
      const currentYear = now.getFullYear();

      // Profit & Loss for the current month
      const currentMonthIdx = now.getMonth();
      const profitLoss = (Array.isArray(salesData) ? salesData : [])
        .filter((s) => {
          if (!s.created_at) return false;
          const date = new Date(s.created_at);
          return (
            date.getMonth() === currentMonthIdx &&
            date.getFullYear() === currentYear
          );
        })
        .reduce(
          (acc, s) =>
            acc + Number(s.profit_loss ?? s.profit ?? 0),
          0
        );

      setMonthlyProfitLoss(profitLoss);

      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      const monthlyTotals = months.map((month, idx) => {
        const total = (Array.isArray(salesData) ? salesData : [])
          .filter((s) => {
            if (!s.created_at) return false;
            const date = new Date(s.created_at);
            return (
              date.getMonth() === idx &&
              date.getFullYear() === currentYear
            );
          })
          .reduce(
            (sum, s) =>
              sum +
              Number(s.price || 0) *
                Number(s.quantity || 0),
            0
          );

        return {
          month,
          sales: isNaN(total) ? 0 : Number(total),
        };
      });

      setChartData(monthlyTotals);
      setMonthlySales(
        monthlyTotals[now.getMonth()]?.sales || 0
      );

      // Fetch products
      const prodRes = await apiFetch(
        "http://localhost:5000/api/products",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const prodData = prodRes.ok ? await prodRes.json() : [];

      // Calculate shop worth (sum of selling price * quantity for all products)
      const worth = (Array.isArray(prodData) ? prodData : [])
        .reduce((sum, p) => sum + (Number(p.selling_price || 0) * Number(p.units || 0)), 0);
      setShopWorth(worth);

      if (Array.isArray(prodData) && prodData.length > 0) {
        let max = prodData[0];

        for (let i = 1; i < prodData.length; i++) {
          const item = prodData[i];
          const idA = Number(
            item.id ?? item.product_id ?? item._id ?? NaN
          );
          const idMax = Number(
            max.id ?? max.product_id ?? max._id ?? NaN
          );

          if (
            !isNaN(idA) &&
            idA > (isNaN(idMax) ? -Infinity : idMax)
          ) {
            max = item;
          }
        }

        setLatestProduct(max);
      } else {
        setLatestProduct(null);
      }
    } catch (err) {
      console.error("fetchData:", err);
      setLatestSale(null);
      setLatestProduct(null);
      setMonthlySales(0);
      setChartData([]);
      setMonthlyProfitLoss(0);
    }
  };

  return (
    <HelmetProvider>
      <Helmet>
        <title>Dashboard | Quantora</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-black flex relative">
        <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />

        <div className="flex-1 flex flex-col">
          <Topbar
            onMenuClick={() => setMenuOpen(true)}
            userName={currentUser?.name}
          />

          <main
            className="flex-1 p-8 space-y-8 text-white"
            aria-label="Dashboard Main Content"
          >
            {/* MAIN CARDS */}
            <section aria-label="Quick Action Cards">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-6"
              >
                <Card
                  title="Monthly Sales"
                  icon="₦"
                  desc={`₦${formatShortNumber(
                    displayedSales
                  )}`}
                  isHighlight
                />
                <Card
                  title="Shop Worth"
                  icon="store"
                  desc={`₦${formatShortNumber(
                    shopWorth
                  )}`}
                />
                <Card
                  title="Manage your Products"
                  icon="inventory_2"
                  to="/Manage_Products"
                  desc="View, add, edit, and delete products"
                />
                <Card
                  title="Record your Sales"
                  icon="trending_up"
                  to="/recordSales"
                  desc="Take records of sales made"
                />
              </motion.div>
            </section>

            {/* CHART + RECENT ACTIVITIES */}
            <section
              aria-label="Sales Overview and Recent Activities"
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Sales Chart */}
              <article
                aria-label="Monthly Sales Chart"
                className="bg-gray-900 rounded-xl shadow p-6 lg:col-span-2 text-white"
              >
                <h2 className="text-lg font-semibold mb-4">
                  Sales Overview
                </h2>
                <ResponsiveContainer width="100%" height={250}>
                  {chartData.length > 0 ? (
                    <BarChart data={chartData}>
                      <XAxis dataKey="month" stroke="white" />
                      <YAxis
                        stroke="white"
                        domain={[0, "dataMax"]}
                        tickFormatter={(v) =>
                          formatShortNumber(v)
                        }
                      />
                      <Tooltip
                        formatter={(value) =>
                          `₦${formatShortNumber(value)}`
                        }
                      />
                      <Bar
                        dataKey="sales"
                        fill="#3b82f6"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  ) : (
                    <p className="text-white text-center">
                      Loading chart...
                    </p>
                  )}
                </ResponsiveContainer>
              </article>

              {/* Recent Activities Cards */}
              <section
                aria-label="Recent Activities"
                className="flex flex-col gap-4"
              >
                {/* Profit & Loss Card */}
                <article
                  aria-label="Profit & Loss"
                  className="rounded-xl shadow p-4 cursor-default bg-gray-900 text-white"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold">
                        Profit & Loss
                      </h3>
                      <p
                        className={`font-bold text-lg mt-1 ${
                          monthlyProfitLoss > 0
                            ? "text-green-400"
                            : monthlyProfitLoss < 0
                            ? "text-red-400"
                            : "text-gray-300"
                        }`}
                      >
                        {monthlyProfitLoss < 0
                          ? `-₦${Math.abs(
                              monthlyProfitLoss
                            ).toLocaleString()}`
                          : `+₦${monthlyProfitLoss.toLocaleString()}`}
                      </p>
                    </div>

                    <div
                      className={`p-2 rounded-lg ${
                        monthlyProfitLoss > 0
                          ? "bg-green-500/10 text-green-400"
                          : monthlyProfitLoss < 0
                          ? "bg-red-500/10 text-red-400"
                          : "bg-gray-500/10 text-gray-300"
                      }`}
                    >
                      {monthlyProfitLoss > 0 ? (
                        <TrendingUp size={22} />
                      ) : monthlyProfitLoss < 0 ? (
                        <TrendingDown size={22} />
                      ) : null}
                    </div>
                  </div>
                </article>

                {/* Latest Sale Card */}
                <article
                  aria-label="Latest Sale"
                  className="bg-gradient-to-r from-green-600 to-green-800 rounded-xl shadow p-4 cursor-default"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-white font-semibold">
                        Latest Sale
                      </h3>
                      {latestSale ? (
                        <>
                          <p className="text-white font-bold text-lg mt-1">
                            {toTitle(
                              latestSale.product_name
                            )}
                          </p>
                          <div className="mt-2 text-gray-100 text-sm">
                            <span className="inline-block mr-3">
                              Qty: {latestSale.quantity}
                            </span>
                            <span className="inline-block">
                              Unit: ₦
                              {Number(
                                latestSale.price || 0
                              ).toLocaleString()}
                            </span>
                          </div>
                          <p className="mt-2 text-gray-200 font-semibold">
                            Total: ₦
                            {(
                              Number(
                                latestSale.price || 0
                              ) *
                              Number(
                                latestSale.quantity || 0
                              )
                            ).toLocaleString()}
                          </p>
                        </>
                      ) : (
                        <p className="text-gray-200 mt-1">
                          No sales recorded yet.
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <button
                        onClick={() =>
                          navigate("/recordSales")
                        }
                        className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </article>

                {/* Latest Product Card */}
                <article
                  aria-label="Latest Product"
                  className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl shadow p-4 cursor-default"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-white font-semibold">
                        Latest Product
                      </h3>
                      {latestProduct ? (
                        <>
                          <p className="text-white font-bold text-lg mt-1">
                            {toTitle(
                              latestProduct.name
                            )}
                          </p>
                          <div className="mt-2 text-gray-100 text-sm">
                            <span className="inline-block mr-3">
                              Stock: {latestProduct.units}
                            </span>
                            <span className="inline-block">
                              Price: ₦
                              {Number(
                                latestProduct.price || 0
                              ).toLocaleString()}
                            </span>
                          </div>
                          <p className="mt-2 text-gray-200 text-sm">
                            {latestProduct.category
                              ? toTitle(
                                  latestProduct.category
                                )
                              : ""}
                          </p>
                        </>
                      ) : (
                        <p className="text-gray-200 mt-1">
                          No products added yet.
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <button
                        onClick={() =>
                          navigate("/Manage_Products")
                        }
                        className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                </article>
              </section>
            </section>
          </main>
        </div>
      </div>
    </HelmetProvider>
  );
}

// Recent activities card
function Card({ title, desc, icon, isHighlight, to }) {
  const navigate = useNavigate();

  return (
    <motion.article
      whileHover={{ scale: 1.03 }}
      onClick={() => to && navigate(to)}
      className={`rounded-xl shadow p-6 flex flex-col items-center text-center cursor-pointer hover:shadow-md transition ${
        isHighlight
          ? "bg-yellow-600 text-white"
          : "bg-gray-900 text-white"
      }`}
      aria-label={title}
    >
      <span className="material-icons text-4xl mb-2">
        {icon}
      </span>
      <h3 className="font-semibold text-lg mb-1">
        {title}
      </h3>
      <p
        className={`text-sm ${
          isHighlight
            ? "text-white text-xl font-bold mt-1"
            : "text-gray-300 font-medium"
        }`}
      >
        {desc}
      </p>
    </motion.article>
  );
}
