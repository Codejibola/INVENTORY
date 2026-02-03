import { useEffect, useState } from "react";

export default function AvailableProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/products");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch products");
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <p>Loading products...</p>;
  if (error) return <p className="text-red-400">{error}</p>;

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Available Products</h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-600">
            <th className="py-2 px-4">Product Name</th>
            <th className="py-2 px-4">Selling Price</th>
          </tr>
        </thead>
        <tbody>
          {products.map((prod) => (
            <tr key={prod.id} className="border-b border-slate-700">
              <td className="py-2 px-4">{prod.name}</td>
              <td className="py-2 px-4">${prod.selling_price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
