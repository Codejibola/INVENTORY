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

      <div className="max-w-4xl mx-auto px-6 py-12 text-gray-300">
        <h1 className="text-3xl font-bold text-white mb-6">
          Privacy Policy
        </h1>

        <p className="mb-4">
          Quantora respects your privacy. This policy explains how we collect,
          use, and protect your information.
        </p>

        <section className="space-y-4">
          <p>
            We collect information you provide such as your name, email address,
            and business records entered into the platform.
          </p>

          <p>
            Your data is used solely to operate and improve the Quantora
            platform. We do not sell your personal data.
          </p>

          <p>
            We implement security measures to protect your data, but no system
            is completely secure.
          </p>

          <p>
            You may request access to or deletion of your data by contacting us
            at bellohabeebullah838@gmail.com.
          </p>
        </section>

        <p className="mt-8 text-sm text-gray-400">
          Last updated: 18 December 2025
        </p>
      </div>
    </>
  );
}
