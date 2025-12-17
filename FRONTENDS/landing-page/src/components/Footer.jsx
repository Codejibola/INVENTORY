export default function Footer() {
  return (
    <footer className="bg-zinc-900 text-zinc-400 py-10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-6">

        <p>
          © {new Date().getFullYear()} Quantora. All rights reserved.
        </p>

        <div className="flex gap-6">
          <a href="#" className="hover:text-white">Privacy</a>
          <a href="#" className="hover:text-white">Terms</a>
          <a href="#" className="hover:text-white">Contact</a>
        </div>
      </div>
    </footer>
  );
}
