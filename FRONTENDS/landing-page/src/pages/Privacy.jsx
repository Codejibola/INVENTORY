import { Helmet } from "react-helmet-async";

export default function Privacy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | Quantora</title>
        <meta
          name="description"
          content="Quantora Privacy Policy explaining how user data is collected and used."
        />
      </Helmet>

      {/* --- ADDED BACK BUTTON --- */}
      <div className="max-w-4xl mx-auto px-6 pt-10">
        <a href="https://inventory-5xr8.vercel.app/" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-blue transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Home
        </a>
      </div>
      {/* ------------------------- */}

      <div className="max-w-4xl mx-auto px-6 py-10 text-gray-800">
        <h1 className="text-4xl font-extrabold text-black mb-8 border-b border-gray-700 pb-4">
          Privacy Policy
        </h1>

        <p className="mb-6">
          Quantora respects your privacy. This policy explains how we collect,
          use, and protect your information.
        </p>

        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-black mb-2">Information We Collect</h2>
            <p>
              We collect information you provide such as your name, email address,
              and business records entered into the platform.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-2">How We Use Your Data</h2>
            <p>
              Your data is used solely to operate and improve the Quantora
              platform. We do not sell your personal data.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-2">Security</h2>
            <p>
              We implement security measures to protect your data, but no system
              is completely secure.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-2">Access & Deletion</h2>
            <p>
              You may request access to or deletion of your data by contacting us
              at <a href="mailto:quantora.nigeria@gmail.com" className="text-blue-600 hover:underline">quantora.nigeria@gmail.com</a>.
            </p>
          </div>
        </section>

        <p className="mt-12 text-sm text-gray-500">
          Last updated: 18 December 2025
        </p>
      </div>
    </>
  );
}