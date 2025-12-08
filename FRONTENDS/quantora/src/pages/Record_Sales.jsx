/* eslint-disable */
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import apiFetch from "../utils/apiFetch.js";

export default function RecordSales() {
  const token = localStorage.getItem("token");

  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState("");
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  /* ---------------- Fetch Products ---------------- */
  const fetchProducts = () => {
    apiFetch("http://localhost:5000/api/products", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.products || [];
        setProducts(list);
      })
      .catch(() => setError("Failed to load products"));
  };

  /* ---------------- Fetch Today's Sales ---------------- */
  const fetchSales = () => {
    apiFetch("http://localhost:5000/api/sales", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const all = Array.isArray(data) ? data : data.sales || data || [];

        const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

        const todaysSales = all.filter((s) =>
          s.created_at?.startsWith(today)
        );

        setSales(todaysSales);
      })
      .catch(() => setError("Failed to load sales"));
  };

  useEffect(() => {
    fetchProducts();
    fetchSales();
  }, [token]);

  /* ---------------- Submit Sale ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selected) return setError("Please select a product.");
    if (!quantity || quantity < 1) return setError("Quantity must be at least 1.");
    if (!price || price <= 0) return setError("Price must be greater than 0.");

    const product = products.find((p) => p.id === Number(selected));
    if (!product) return setError("Invalid product selected.");

    if (quantity > product.units) {
      return setError(`Only ${product.units} units left. You cannot sell ${quantity}.`);
    }

    setLoading(true);

    try {
      await apiFetch("http://localhost:5000/api/updateStock", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: Number(selected),
          quantity: Number(quantity),
        }),
      });

      await apiFetch("http://localhost:5000/api/sales", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: Number(selected),
          quantity: Number(quantity),
          price: Number(price),
        }),
      });

      fetchProducts();
      fetchSales();

      setSelected("");
      setQuantity(1);
      setPrice("");
    } catch (err) {
      setError("Error recording sale.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Calculate Total ---------------- */
  const totalToday = sales.reduce((acc, s) => acc + s.price * s.quantity, 0);

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-gray-200">
      {/* Sidebar fixed props */}
      <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />

      <div className="flex-1 flex flex-col">
        {/* Topbar toggles sidebar */}
        <Topbar onMenuClick={() => setMenuOpen(true)} userName={currentUser?.name} />

        <main className="p-4 sm:p-6 space-y-6">
          {error && <p className="text-red-400 text-center font-medium">{error}</p>}

          {/* -------- Sales Entry Form -------- */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="bg-[#1e293b] border border-gray-700 rounded-xl shadow p-4 sm:p-6 max-w-xl w-full mx-auto space-y-4"
          >
            <h2 className="text-lg font-semibold text-white">Record Sale</h2>

            <label className="block">
              <span className="text-sm text-gray-300">Product</span>
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="mt-1 w-full border border-gray-600 bg-[#0f172a] text-gray-200 rounded px-3 py-2"
              >
                <option value="">-- Select Product --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name.charAt(0).toUpperCase() + p.name.slice(1)} (Stock: {p.units})
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm text-gray-300">Quantity</span>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="mt-1 w-full border border-gray-600 bg-[#0f172a] text-gray-200 rounded px-3 py-2"
                />
              </label>

              <label className="block">
                <span className="text-sm text-gray-300">Unit Price (₦)</span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="mt-1 w-full border border-gray-600 bg-[#0f172a] text-gray-200 rounded px-3 py-2"
                />
              </label>
            </div>

            <button
              disabled={loading}
              className={`w-full py-2 rounded font-semibold mt-2 transition-colors ${
                loading
                  ? "bg-gray-600 text-gray-400"
                  : "bg-blue-600 text-white hover:bg-blue-500"
              }`}
            >
              {loading ? "Saving…" : "Add Sale"}
            </button>
          </motion.form>

          {/* -------- Total Today Display -------- */}
          <div className="flex justify-end mb-2">
            <div className="bg-[#1e293b] border border-gray-700 rounded-xl px-4 py-2 shadow text-gray-200 font-semibold">
              Today's Total Sales: ₦{totalToday.toLocaleString()}
            </div>
          </div>

          {/* -------- Sales Table -------- */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-x-auto bg-[#1e293b] border border-gray-700 rounded-xl shadow"
          >
            <table className="min-w-full table-auto text-sm text-gray-200 border-collapse">
              <thead className="bg-[#0f172a] border-b border-gray-700">
                <tr>
                  <th className="py-2 px-4 text-left">S/N</th>
                  <th className="py-2 px-4 text-left">Product</th>
                  <th className="py-2 px-4 text-left">Qty</th>
                  <th className="py-2 px-4 text-right">Price</th>
                  <th className="py-2 px-4 text-right">Total</th>
                  <th className="py-2 px-4 text-left">Date</th>
                </tr>
              </thead>

              <tbody>
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-gray-400">
                      No sales recorded today.
                    </td>
                  </tr>
                ) : (
                  sales.map((s, i) => (
                    <tr
                      key={s.id}
                      className="border-b border-gray-700 hover:bg-[#0f172a]"
                    >
                      <td className="py-2 px-4 text-left">{i + 1}</td>
                      <td className="py-2 px-4 text-left">
                        {s.product_name.charAt(0).toUpperCase() + s.product_name.slice(1)}
                      </td>
                      <td className="py-2 px-4 text-left">{s.quantity}</td>
                      <td className="py-2 px-4 text-right">
                        ₦{Number(s.price).toLocaleString()}
                      </td>
                      <td className="py-2 px-4 text-right font-semibold">
                        ₦{(s.price * s.quantity).toLocaleString()}
                      </td>
                      <td className="py-2 px-4 text-left">
                        {new Date(s.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
