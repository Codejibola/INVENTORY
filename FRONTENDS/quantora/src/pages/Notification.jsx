import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import apiFetch from "../utils/apiFetch";
import { Helmet } from "react-helmet-async";

export default function Notification() {
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

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
    <>
      <Helmet>
        <title>Notifications</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Notification list (no sound here - sound is handled by Topbar.jsx) */}
      <main className="p-6 bg-black min-h-screen text-white">
        <nav aria-label="Back navigation" className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back</span>
          </button>
        </nav>

        {/* Page title */}
        <header>
          <h1 className="text-3xl font-bold mb-6">Notifications</h1>
        </header>

        {/* Status messages */}
        <section aria-live="polite">
          {loading && <p className="text-gray-400">Loading...</p>}

          {error && <p className="text-red-400 mb-4">{error}</p>}

          {!loading && !error && lowStock.length === 0 && (
            <p className="text-gray-500">No low-stock alerts.</p>
          )}
        </section>

        {/* Notifications list */}
        {!loading && !error && lowStock.length > 0 && (
          <section
            aria-label="Low stock alerts"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4"
          >
            {lowStock.map((product) => (
              <article
                key={product.id}
                className="flex flex-col p-4 rounded-xl
                bg-white/5 border border-white/10 backdrop-blur-md
                hover:bg-white/10 transition-all duration-200 h-full"
              >
                <div
                  className="p-2 rounded-full bg-red-500/20 text-red-400 mb-2 self-start"
                  aria-hidden="true"
                >
                  <AlertTriangle size={22} />
                </div>

                <div className="flex-1">
                  <p className="text-lg font-semibold">
                    {toTitleCase(product.name)}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Low stock alert — only{" "}
                    <span className="text-red-400 font-bold">
                      {product.units}
                    </span>{" "}
                    units left.
                  </p>
                </div>

                <div
                  className="w-full h-1 mt-2 bg-gradient-to-r from-red-600 to-red-400 rounded-lg"
                  aria-hidden="true"
                />
              </article>
            ))}
          </section>
        )}
      </main>
    </>
  );
}
