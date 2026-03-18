import { Helmet } from "react-helmet-async";

export default function Terms() {
  return (
    <>
      <Helmet>
        <title>Terms & Conditions | Quantora</title>
        <meta
          name="description"
          content="Quantora Terms and Conditions governing the use of the platform."
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
          Terms and Conditions
        </h1>

        <p className="mb-6">
          Welcome to Quantora. By accessing or using this platform, you agree to
          be bound by these Terms and Conditions.
        </p>

        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-black mb-2">Use of Service</h2>
            <p>
              Quantora provides tools for sales tracking, inventory management,
              invoicing, and business analytics. You are responsible for all data
              entered into the platform.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-2">User Responsibilities</h2>
            <p>
              You must not misuse the service, attempt unauthorized access, or
              engage in unlawful activities using Quantora.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-2">Account Suspension</h2>
            <p>
              We reserve the right to suspend or terminate accounts that violate
              these terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-2">Disclaimer</h2>
            <p>
              The service is provided on an “as is” basis without warranties of any
              kind.
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
