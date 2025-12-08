import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import apiFetch from "../utils/apiFetch";

export default function Notification() {
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Helper to convert string to title case
  const toTitleCase = (str = "") =>
    str
      .toLowerCase()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  useEffect(() => {
    fetchLowStock();
  }, []);

  async function fetchLowStock() {
    setLoading(true);
    setError("");

    try {
      if (!token) {
        setError("You must be logged in to view notifications.");
        setLowStock([]);
        setLoading(false);
        return;
      }

      const res = await apiFetch("http://localhost:5000/api/products", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API error: ${res.status} ${text}`);
      }

      const data = await res.json();
      const products = Array.isArray(data) ? data : data.products || [];

      const normalized = products.map((p) => ({
        ...p,
        units: p.units ?? p.stock ?? 0,
      }));

      const low = normalized.filter((p) => Number(p.units) < 3);
      setLowStock(low);
    } catch (err) {
      console.error(err);
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      {/* Back Arrow */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
      >
        <ArrowLeft size={20} />
        <span className="text-sm font-medium">Back</span>
      </button>

      <h1 className="text-3xl font-bold mb-6">Notifications</h1>

      {loading && <p className="text-gray-400">Loading...</p>}

      {error && <p className="text-red-400 mb-4">{error}</p>}

      {!loading && !error && lowStock.length === 0 && (
        <p className="text-gray-500">No low-stock alerts.</p>
      )}

      {!loading && !error && lowStock.length > 0 && (
        <div className="space-y-4">
          {lowStock.map((product) => (
            <div
              key={product.id}
              className="flex items-start gap-4 p-4 rounded-xl 
              bg-white/5 border border-white/10 backdrop-blur-md 
              hover:bg-white/10 transition-all duration-200"
            >
              <div className="p-2 rounded-full bg-red-500/20 text-red-400">
                <AlertTriangle size={22} />
              </div>

              <div className="flex-1">
                <p className="text-lg font-semibold">{toTitleCase(product.name)}</p>
                <p className="text-sm text-gray-400">
                  Low stock alert — only{" "}
                  <span className="text-red-400 font-bold">{product.units}</span> units left.
                </p>
              </div>

              {/* Accent bar */}
              <div className="w-2 h-full bg-gradient-to-b from-red-600 to-red-400 rounded-lg"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
