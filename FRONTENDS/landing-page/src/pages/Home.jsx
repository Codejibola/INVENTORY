import { Helmet } from "react-helmet-async";

import Hero from "../components/Hero";
import Features from "../components/Features";
import CTA from "../components/CTA";
import Footer from "../components/Footer";
import FAQ from "../components/FAQ";
import Audience from "../components/Audience";
import Navbar from "../components/Navbar";
import WhyQuantora from "../components/WhyQuantora";
import Review from "../components/Reviews";

export default function Home() {
  return (
    <>
      <Helmet>
        {/* FAQ Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is Quantora?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text":
                    "Quantora is a modern inventory management web app that helps businesses track stock levels, manage products, and make data-driven inventory decisions in real time."
                }
              },
              {
                "@type": "Question",
                "name": "Is Quantora suitable for small businesses?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text":
                    "Yes. Quantora is designed to scale from small businesses to growing teams, offering simple setup and powerful features without unnecessary complexity."
                }
              }
            ]
          })}
        </script>

        {/* Product + Reviews Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Quantora",
            "description":
              "Quantora is a modern inventory management software that helps businesses track stock levels, manage products, and make smarter decisions in real time.",
            "category": "Inventory Management Software",
            "brand": {
              "@type": "Brand",
              "name": "Quantora"
            },
            "image": "https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?auto=compress&cs=tinysrgb&w=1200",
            "url": "https://yourdomain.com",
            "offers": {
              "@type": "Offer",
              "url": "https://yourdomain.com/signup",
              "priceCurrency": "NGN",
              "price": "3000",
              "availability": "https://schema.org/InStock",
              "description":
                "Free for the first month, then NGN 3,000 per month."
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.7",
              "reviewCount": "3"
            },
            "review": [
              {
                "@type": "Review",
                "author": {
                  "@type": "Person",
                  "name": "Adebayo T."
                },
                "reviewRating": {
                  "@type": "Rating",
                  "ratingValue": "5",
                  "bestRating": "5"
                },
                "reviewBody":
                  "Quantora made it extremely easy to track inventory and avoid stock shortages."
              },
              {
                "@type": "Review",
                "author": {
                  "@type": "Person",
                  "name": "Sarah M."
                },
                "reviewRating": {
                  "@type": "Rating",
                  "ratingValue": "4",
                  "bestRating": "5"
                },
                "reviewBody":
                  "Real-time stock updates helped our business reduce inventory mistakes."
              },
              {
                "@type": "Review",
                "author": {
                  "@type": "Person",
                  "name": "Daniel K."
                },
                "reviewRating": {
                  "@type": "Rating",
                  "ratingValue": "5",
                  "bestRating": "5"
                },
                "reviewBody":
                  "Low-stock alerts give us confidence in daily inventory management."
              }
            ]
          })}
        </script>
      </Helmet>

      <Navbar />
      <Hero />
      <WhyQuantora />
      <Features />
      <Audience />
      <Review />
      <FAQ />
      <CTA />
      <Footer />
    </>
  );
}
