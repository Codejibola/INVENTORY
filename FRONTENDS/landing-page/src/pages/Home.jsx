import Hero from "../components/Hero";
import Features from "../components/Features";
import CTA from "../components/CTA";
import Footer from "../components/Footer";
import FAQ from "../components/FAQ";
import Audience from "../components/Audience";
import Navbar from "../components/Navbar";
import WhyQuantora from "../components/WhyQuantora";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <WhyQuantora/>
      <Features />
      <Audience />
      <FAQ />
      <CTA />
      <Footer />
    </>
  );
}
