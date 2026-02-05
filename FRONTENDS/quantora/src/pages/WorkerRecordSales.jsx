/* eslint-disable */
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import apiFetch from "../utils/apiFetch";
import { Helmet } from "react-helmet-async";

export default function WorkerRecordSales() {
  const token = localStorage.getItem("token");

  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [selected, setSelected] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ================= FETCH ================= */

  const fetchProducts = async () => {
    try {
      const res = await apiFetch("http://localhost:5000/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : data.products || []);
    } catch {
      setError("Failed to load products");
    }
  };

  const fetchSales = async () => {
    try {
      const res = await apiFetch("http://localhost:5000/api/sales", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const today = new Date().toISOString().split("T")[0];
      const all = Array.isArray(data) ? data : data.sales || [];
      setSales(all.filter((s) => s.created_at?.startsWith(today)));
    } catch {
      setError("Failed to load sales");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchSales();
  }, []);

  /* ================= HELPERS ================= */

  const suggestedPrice = (() => {
    const product = products.find((p) => p.id === Number(selected));
    return product ? product.selling_price * quantity : 0;
  })();

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selected) return setError("Select a product");
    if (quantity < 1) return setError("Quantity must be at least 1");
    if (!totalPrice || totalPrice <= 0)
      return setError("Enter a valid total price");

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
          price: Number(totalPrice),
        }),
      });

      fetchProducts();
      fetchSales();
      setSelected("");
      setQuantity(1);
      setTotalPrice("");
    } catch {
      setError("Failed to record sale");
    } finally {
      setLoading(false);
    }
  };

  const totalToday = sales.reduce((a, s) => a + Number(s.price), 0);

  /* ================= UI ================= */

  return (
    <>
      <Helmet>
        <title>Worker | Record Sales</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {error && (
        <p className="text-red-400 text-center font-medium mb-4">{error}</p>
      )}

      <motion.form
        onSubmit={handleSubmit}
        className="bg-[#1e293b] border border-gray-700 rounded-xl p-6 max-w-xl mx-auto space-y-4"
      >
        <h2 className="text-lg font-semibold">Record Sale</h2>

        <select
          value={selected}
          onChange={(e) => {
            setSelected(e.target.value);
            setTotalPrice("");
          }}
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
            onChange={(e) => {
              setQuantity(Number(e.target.value));
              setTotalPrice("");
            }}
            className="border border-gray-600 bg-[#0f172a] rounded px-3 py-2"
            placeholder="Quantity"
          />

          <input
            type="number"
            value={totalPrice}
            onChange={(e) => setTotalPrice(e.target.value)}
            className="border border-gray-600 bg-[#0f172a] rounded px-3 py-2"
            placeholder={`Suggested ₦${suggestedPrice.toLocaleString()}`}
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
<div className="mt-6 bg-[#1e293b] border border-gray-700 rounded-xl overflow-x-auto">
  <table className="w-full table-fixed text-sm">
    <thead className="bg-[#0f172a] border-b border-gray-700">
      <tr>
        <th className="w-12 px-3 py-2 text-left">#</th>
        <th className="px-3 py-2 text-left">Product</th>
        <th className="w-20 px-3 py-2 text-right">Qty</th>
        <th className="w-32 px-3 py-2 text-right">Total</th>
        <th className="w-48 px-3 py-2 text-left">Date</th>
      </tr>
    </thead>

    <tbody>
      {sales.length === 0 ? (
        <tr>
          <td
            colSpan="5"
            className="py-6 text-center text-gray-400"
          >
            No sales today
          </td>
        </tr>
      ) : (
        sales.map((s, i) => (
          <tr
            key={s.id}
            className="border-t border-gray-700 hover:bg-slate-800/40"
          >
            <td className="px-3 py-2 text-left">{i + 1}</td>

            <td className="px-3 py-2 truncate">
              {s.product_name.charAt(0).toUpperCase() + s.product_name.slice(1)}
            </td>

            <td className="px-3 py-2 text-right">
              {s.quantity}
            </td>

            <td className="px-3 py-2 text-right font-semibold">
              ₦{Number(s.price).toLocaleString()}
            </td>

            <td className="px-3 py-2 whitespace-nowrap">
              {new Date(s.created_at).toLocaleString()}
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>


      <div className="text-right font-semibold mt-4">
        Today’s Total: ₦{totalToday.toLocaleString()}
      </div>
    </>
  );
}
