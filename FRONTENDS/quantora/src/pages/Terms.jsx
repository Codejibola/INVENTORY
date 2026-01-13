import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Terms & Conditions | Quantora</title>
        <meta
          name="description"
          content="Quantora Terms and Conditions governing the use of the platform."
        />
      </Helmet>

      <div className="max-w-4xl mx-auto px-6 py-16 text-gray-800">
        {/* Back to Sign up */}
        <button
          onClick={() => navigate("/register")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
          aria-label="Back to login"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back to Sign up</span>
        </button>

        <h1 className="text-4xl font-extrabold text-black mb-8 border-b border-gray-700 pb-4">
          Terms and Conditions
        </h1>

        <p className="mb-6">
          Welcome to Quantora. By accessing or using this platform, you agree to
          be bound by these Terms and Conditions.
        </p>

        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-black mb-2">
              Use of Service
            </h2>
            <p>
              Quantora provides tools for sales tracking, inventory management,
              invoicing, and business analytics. You are responsible for all data
              entered into the platform.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-2">
              User Responsibilities
            </h2>
            <p>
              You must not misuse the service, attempt unauthorized access, or
              engage in unlawful activities using Quantora.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-2">
              Account Suspension
            </h2>
            <p>
              We reserve the right to suspend or terminate accounts that violate
              these terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-2">
              Disclaimer
            </h2>
            <p>
              The service is provided on an “as is” basis without warranties of
              any kind.
            </p>
          </div>
        </section>

        <p className="mt-12 text-sm text-blue-500">
          Last updated: 18 December 2025
        </p>
      </div>
    </>
  );
}
