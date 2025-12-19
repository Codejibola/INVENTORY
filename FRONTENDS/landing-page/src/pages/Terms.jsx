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

      <div className="max-w-4xl mx-auto px-6 py-12 text-gray-300">
        <h1 className="text-3xl font-bold text-white mb-6">
          Terms and Conditions
        </h1>

        <p className="mb-4">
          Welcome to Quantora. By accessing or using this platform, you agree to
          be bound by these Terms and Conditions.
        </p>

        <section className="space-y-4">
          <p>
            Quantora provides tools for sales tracking, inventory management,
            invoicing, and business analytics. You are responsible for all data
            entered into the platform.
          </p>

          <p>
            You must not misuse the service, attempt unauthorized access, or
            engage in unlawful activities using Quantora.
          </p>

          <p>
            We reserve the right to suspend or terminate accounts that violate
            these terms.
          </p>

          <p>
            The service is provided on an “as is” basis without warranties of any
            kind.
          </p>
        </section>

        <p className="mt-8 text-sm text-gray-400">
          Last updated: 18 December 2025
        </p>
      </div>
    </>
  );
}
2