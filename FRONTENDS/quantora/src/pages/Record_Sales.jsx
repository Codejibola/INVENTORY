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
    } catch {
      setError("Error recording sale.");
    } finally {
      setLoading(false);
    }
  };

  const totalToday = sales.reduce((acc, s) => acc + s.price * s.quantity, 0);

  return (
    <>
      <Helmet>
        <title>Record Sales</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="flex min-h-screen bg-[#0f172a] text-gray-200">
        <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />

        <div className="flex-1 flex flex-col">
          <header>
            <Topbar
              onMenuClick={() => setMenuOpen(true)}
              userName={currentUser?.name}
            />
          </header>

          <main className="p-4 sm:p-6 space-y-6">
            <h1 className="sr-only">Record Sales</h1>

            {error && (
              <section aria-live="polite">
                <p className="text-red-400 text-center font-medium">{error}</p>
              </section>
            )}

            {/* Sales Entry */}
            <section aria-labelledby="record-sale-heading">
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="bg-[#1e293b] border border-gray-700 rounded-xl shadow p-4 sm:p-6 max-w-xl w-full mx-auto space-y-4"
              >
                <h2
                  id="record-sale-heading"
                  className="text-lg font-semibold text-white"
                >
                  Record Sale
                </h2>

                <label className="block">
                  <span className="text-sm text-gray-300">Product</span>
                  <select
                    value={selected}
                    onChange={(e) => setSelected(e.target.value)}
                    className="mt-1 w-full border border-gray-600 bg-[#0f172a] text-gray-200 rounded px-3 pr-12 py-2"
                  >

                    <option value="">-- Select Product --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name.charAt(0).toUpperCase() + p.name.slice(1)} (Stock:{" "}
                        {p.units})
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
            </section>

            {/* Daily Total */}
            <section aria-label="Today's total sales" className="flex justify-end">
              <div className="bg-[#1e293b] border border-gray-700 rounded-xl px-4 py-2 shadow font-semibold">
                Today's Total Sales: ₦{totalToday.toLocaleString()}
              </div>
            </section>

            {/* Sales Table */}
            <section aria-labelledby="sales-table-heading">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-x-auto bg-[#1e293b] border border-gray-700 rounded-xl shadow"
              >
                <h2 id="sales-table-heading" className="sr-only">
                  Today's Sales Table
                </h2>

                <table className="min-w-full table-auto text-sm border-collapse">
                  <thead className="bg-[#0f172a] border-b border-gray-700">
                    <tr>
                      <th scope="col" className="py-2 px-4 text-left">S/N</th>
                      <th scope="col" className="py-2 px-4 text-left">Product</th>
                      <th scope="col" className="py-2 px-4 text-left">Qty</th>
                      <th scope="col" className="py-2 px-4 text-right">Price</th>
                      <th scope="col" className="py-2 px-4 text-right">Total</th>
                      <th scope="col" className="py-2 px-4 text-left">Date</th>
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
                          <th scope="row" className="py-2 px-4">{i + 1}</th>
                          <td className="py-2 px-4">
                            {s.product_name.charAt(0).toUpperCase() +
                              s.product_name.slice(1)}
                          </td>
                          <td className="py-2 px-4">{s.quantity}</td>
                          <td className="py-2 px-4 text-right">
                            ₦{Number(s.price).toLocaleString()}
                          </td>
                          <td className="py-2 px-4 text-right font-semibold">
                            ₦{(s.price * s.quantity).toLocaleString()}
                          </td>
                          <td className="py-2 px-4">
                            {new Date(s.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </motion.div>
            </section>
          </main>
        </div>
      </div>
    </>
  );
}
