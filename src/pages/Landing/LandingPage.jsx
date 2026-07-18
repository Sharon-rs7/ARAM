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
      
      {import.meta.env.DEV && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
          background: '#ef4444',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '8px',
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          fontSize: '12px',
          pointerEvents: 'none'
        }}>
          RESTORED FRIEND UI ACTIVE
        </div>
      )}
    </>
  );
};

export default LandingPage;