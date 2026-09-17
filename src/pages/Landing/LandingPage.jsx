import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

import Hero from "@/components/common/landing/Hero";
import HowItWorks from "@/components/common/landing/HowItWorks";
import Features from "@/components/common/landing/Features";
import About from "@/components/common/landing/About";
import WhoCanUse from "@/components/common/landing/WhoCanUse";
import FAQ from "@/components/common/landing/FAQ";
import CTA from "@/components/common/landing/CTA";
import Contact from "@/components/common/landing/Contact";

const LandingPage = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <About />
      <WhoCanUse />
      <FAQ />
      <CTA />
      <Contact />
      <Footer />
    </>
  );
};

export default LandingPage;