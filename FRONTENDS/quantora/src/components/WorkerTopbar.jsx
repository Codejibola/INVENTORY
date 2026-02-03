export default function WorkerTopbar() {
  // get shopName from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const shopName = user?.shop_name || "Shop";

  return (
    <header className="w-full bg-slate-800 p-4 flex justify-between items-center shadow-md">
      <h1 className="text-lg font-semibold">{shopName} – Worker Mode</h1>
    </header>
  );
}
