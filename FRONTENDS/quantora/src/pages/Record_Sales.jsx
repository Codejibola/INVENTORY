/* eslint-disable */
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import apiFetch from "../utils/apiFetch.js";
import { Helmet } from "react-helmet-async";

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

  const fetchSales = () => {
    apiFetch("http://localhost:5000/api/sales", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const all = Array.isArray(data) ? data : data.sales || data || [];
        const today = new Date().toISOString().split("T")[0];
        setSales(all.filter((s) => s.created_at?.startsWith(today)));
      })
      .catch(() => setError("Failed to load sales"));
  };

  useEffect(() => {
    fetchProducts();
    fetchSales();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selected) return setError("Please select a product.");
    if (!quantity || quantity < 1) return setError("Quantity must be at least 1.");
    if (!price || price <= 0) return setError("Price must be greater than 0.");

    const product = products.find((p) => p.id === Number(selected));
    if (!product) return setError("Invalid product selected.");

    if (quantity > product.units) {
      return setError(`Only ${product.units} units left.`);
    }

    setLoading(true);

    try {
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
    } catch {
      setError("Error recording sale.");
    } finally {
      setLoading(false);
    }
  };

  const totalToday = sales.reduce(
    (acc, s) => acc + s.price * s.quantity,
    0
  );

  return (
    <>
      <Helmet>
        <title>Record Sales</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="flex min-h-screen bg-[#0f172a] text-gray-200 overflow-x-hidden">
        <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />

        <div className="flex-1 flex flex-col">
          <Topbar
            onMenuClick={() => setMenuOpen(true)}
            userName={currentUser?.name}
          />

          <main className="p-4 sm:p-6 space-y-6">
            {error && (
              <p className="text-red-400 text-center font-medium">{error}</p>
            )}

            {/* Record Sale */}
            <motion.form
              onSubmit={handleSubmit}
              className="bg-[#1e293b] border border-gray-700 rounded-xl p-6 max-w-xl mx-auto space-y-4"
            >
              <h2 className="text-lg font-semibold text-white">Record Sale</h2>

              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="w-full border border-gray-600 bg-[#0f172a] rounded px-3 py-2"
              >
                <option value="">-- Select Product --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Stock: {p.units})
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="border border-gray-600 bg-[#0f172a] rounded px-3 py-2"
                />
                <input
                  type="number"
                  min="1"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="border border-gray-600 bg-[#0f172a] rounded px-3 py-2"
                />
              </div>

              <button
                disabled={loading}
                className={`w-full py-2 rounded font-semibold ${
                  loading
                    ? "bg-gray-600 text-gray-400"
                    : "bg-blue-600 hover:bg-blue-500"
                }`}
              >
                {loading ? "Saving…" : "Add Sale"}
              </button>
            </motion.form>

            {/* Sales Table */}
            <div className="overflow-x-auto max-w-full bg-[#1e293b] border border-gray-700 rounded-xl">
              <table className="w-full text-sm">
                <thead className="bg-[#0f172a]">
                  <tr>
                    <th className="px-2 sm:px-4 py-2">#</th>
                    <th className="px-2 sm:px-4 py-2">Product</th>
                    <th className="px-2 sm:px-4 py-2">Qty</th>
                    <th className="px-2 sm:px-4 py-2 text-right">Price</th>
                    <th className="px-2 sm:px-4 py-2 text-right">Total</th>
                    <th className="px-2 sm:px-4 py-2 text-right">Profit / Loss</th>
                    <th className="px-2 sm:px-4 py-2">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {sales.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-6 text-center text-gray-400">
                        No sales today.
                      </td>
                    </tr>
                  ) : (
                    sales.map((s, i) => {
                      const profitLoss = Number(s.profit_loss || 0);

                      return (
                        <tr
                          key={s.id}
                          className="border-t border-gray-700"
                        >
                          <td className="px-2 sm:px-4 py-2">{i + 1}</td>
                          <td className="px-2 sm:px-4 py-2">{s.product_name}</td>
                          <td className="px-2 sm:px-4 py-2">{s.quantity}</td>
                          <td className="px-2 sm:px-4 py-2 text-right">
                            ₦{Number(s.price).toLocaleString()}
                          </td>
                          <td className="px-2 sm:px-4 py-2 text-right font-semibold">
                            ₦{(s.price * s.quantity).toLocaleString()}
                          </td>
                          <td
                            className={`px-2 sm:px-4 py-2 text-right font-semibold ${
                              profitLoss > 0
                                ? "text-green-400"
                                : profitLoss < 0
                                ? "text-red-400"
                                : "text-gray-300"
                            }`}
                          >
                            {profitLoss < 0
                              ? `-₦${Math.abs(profitLoss).toLocaleString()}`
                              : profitLoss > 0
                              ? `+₦${profitLoss.toLocaleString()}`
                              : `₦0`}
                          </td>
                          <td className="px-2 sm:px-4 py-2">
                            {new Date(s.created_at).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="text-right font-semibold">
              Today’s Total Sales: ₦{totalToday.toLocaleString()}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
