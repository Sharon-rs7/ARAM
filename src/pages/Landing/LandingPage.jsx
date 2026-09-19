import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

import Hero from "@/components/common/landing/Hero";
import WaysToGetHelp from "@/components/common/landing/WaysToGetHelp";
import TrustStrip from "@/components/common/landing/TrustStrip";
import HowItWorks from "@/components/common/landing/HowItWorks";
import Features from "@/components/common/landing/Features";
import AIHumanBridge from "@/components/common/landing/AIHumanBridge";
import TrustSafety from "@/components/common/landing/TrustSafety";
import WhoCanUse from "@/components/common/landing/WhoCanUse";
import About from "@/components/common/landing/About";
import ImmediateAssistance from "@/components/common/landing/ImmediateAssistance";
import FAQ from "@/components/common/landing/FAQ";
import CTA from "@/components/common/landing/CTA";
import Contact from "@/components/common/landing/Contact";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#F7F1E6] text-[#18332B] overflow-x-hidden font-sans selection:bg-[#DCEBDD] selection:text-[#163D32]">
      <Navbar />
      <main>
        <Hero />
        <WaysToGetHelp />
        <TrustStrip />
        <HowItWorks />
        <Features />
        <AIHumanBridge />
        <TrustSafety />
        <WhoCanUse />
        <About />
        <ImmediateAssistance />
        <FAQ />
        <CTA />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;