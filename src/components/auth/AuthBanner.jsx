import React, { useState, useEffect } from "react";
import { Scale, ChevronLeft, ChevronRight, ShieldAlert, Cpu } from "lucide-react";

const TESTIMONIALS = [
  {
    quote: "The AI triage correctly routed my labour dispute to the Coimbatore department. Our assigned Legal Guide resolved the unpaid wage issue within days.",
    author: "Manoj Kumar",
    role: "Citizen, Coimbatore",
    tag: "01 / CITIZEN FEEDBACK"
  },
  {
    quote: "Handling sensitive safety cases is safer now. Automated PII redaction and secure document vault features protect citizen identities perfectly.",
    author: "Sharon Mary",
    role: "Senior Legal Guide",
    tag: "02 / VOLUNTEER REVIEW"
  },
  {
    quote: "Our administrative workflow is completely streamlined. The blockchain-backed audit logs guarantee 100% data integrity and trust.",
    author: "R. Venkatesan",
    role: "ARAM Admin Officer",
    tag: "03 / SYSTEM METRICS"
  }
];

const AuthBanner = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      changeSlide((activeIndex + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeIndex]);

  const changeSlide = (index) => {
    setFade(false);
    setTimeout(() => {
      setActiveIndex(index);
      setFade(true);
    }, 2000); // 200ms fade transition
  };

  const handlePrev = () => {
    const nextIdx = (activeIndex - 1 + TESTIMONIALS.length) % TESTIMONIALS.length;
    changeSlide(nextIdx);
  };

  const handleNext = () => {
    const nextIdx = (activeIndex + 1) % TESTIMONIALS.length;
    changeSlide(nextIdx);
  };

  return (
    <div 
      className="w-full lg:w-[42%] bg-[#060a13] text-white flex flex-col justify-between p-8 lg:p-14 shrink-0 relative overflow-hidden select-none border-b lg:border-b-0 lg:border-r border-slate-900"
      style={{
        backgroundImage: `
          radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.12) 0%, transparent 50%),
          radial-gradient(circle at 90% 80%, rgba(79, 70, 229, 0.08) 0%, transparent 50%),
          linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
        `,
        backgroundSize: "100% 100%, 100% 100%, 28px 28px, 28px 28px"
      }}
    >
      {/* Glow highlight bar at the top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

      {/* Brand Header */}
      <div className="flex items-center gap-3.5 z-10">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 border border-white/10 backdrop-blur-md shrink-0 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
          <Scale size={20} className="text-indigo-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-wider leading-none font-sans">ARAM</h1>
            <span className="text-[9px] uppercase tracking-widest font-extrabold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              v2.0
            </span>
          </div>
          <p className="mt-1 text-[10px] uppercase tracking-widest text-slate-400 font-semibold">AI Legal Assistance Portal</p>
        </div>
      </div>

      {/* Main Punchline Typography */}
      <div className="my-auto py-10 lg:py-16 space-y-10 z-10">
        <div className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-2">
            <Cpu size={12} className="animate-pulse" />
            Empowering Citizens
          </span>
          <h2 className="text-3xl lg:text-5.5xl font-normal leading-tight tracking-tight text-slate-100 font-sans">
            Where grievances <br />
            become <span className="font-serif italic font-medium text-indigo-300" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>resolutions.</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            A secured, AI-powered framework engineered to classify, route, and accelerate legal remedies for local grievances.
          </p>
        </div>

        {/* Stateful Carousel Slider */}
        <div className="border-t border-slate-900 pt-8 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              {TESTIMONIALS[activeIndex].tag}
            </span>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={handlePrev}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-950/40 hover:bg-slate-900/60 hover:text-indigo-300 transition duration-150 cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <button 
                onClick={handleNext}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-950/40 hover:bg-slate-900/60 hover:text-indigo-300 transition duration-150 cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className={`min-h-[90px] transition-opacity duration-300 ${fade ? "opacity-100" : "opacity-0"}`}>
            <p className="text-sm font-medium text-slate-300 leading-relaxed font-serif italic" style={{ fontFamily: "'Lora', Georgia, serif" }}>
              "{TESTIMONIALS[activeIndex].quote}"
            </p>
            <div className="mt-3.5 flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-[10px] font-bold text-indigo-300 uppercase">
                {TESTIMONIALS[activeIndex].author.charAt(0)}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">{TESTIMONIALS[activeIndex].author}</h4>
                <p className="text-[10px] text-slate-500 font-medium">{TESTIMONIALS[activeIndex].role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Status Line */}
      <div className="space-y-4 z-10">
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/30 border border-slate-900 text-[10px] text-slate-400">
          <ShieldAlert size={14} className="text-amber-500 shrink-0" />
          <span className="leading-normal">
            <strong>Guidance Notice:</strong> ARAM provides preliminary classification. It does not substitute official legal courts or police departments.
          </span>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Connected to ARAM Blockchain nodes</span>
          </div>
          <span>v2.0.4-prod</span>
        </div>
      </div>
    </div>
  );
};

export default AuthBanner;