import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import Features from "@/components/sections/Features";
import About from "@/components/sections/About";
import WhoCanUse from "@/components/sections/WhoCanUse";
import FAQ from "@/components/sections/FAQ";
import CTA from "@/components/sections/CTA";
import Contact from "@/components/sections/Contact";

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