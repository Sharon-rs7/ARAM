import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Card from "@/components/common/Card";
import { Volume2, VolumeX, ChevronDown, ChevronUp, Search, Info } from "lucide-react";
import { toast } from "sonner";

const faqs = {
  English: [
    {
      q: "How to submit a complaint?",
      a: "Click 'Type Complaint' to write your issue in simple words, or 'Speak Complaint' to record your problem using voice."
    },
    {
      q: "How to use voice recording?",
      a: "Tap the red microphone button on the voice complaint screen, speak clearly, and tap stop. ARAM will transcribe your words."
    },
    {
      q: "How to upload proof?",
      a: "In step 5 of the submission wizard, click 'Upload Proof' to select photo files or PDF documents."
    },
    {
      q: "How to track my complaint?",
      a: "Go to 'Track My Complaint' on the dashboard and enter your ARAM complaint ID to view the order-like status timeline."
    },
    {
      q: "What is a Legal Guide?",
      a: "A Legal Guide is a verified legal assistant assigned by the administrator to help you solve your problem safely."
    },
    {
      q: "Is my personal information safe?",
      a: "Yes. For sensitive issues, you can toggle identity masking so your real name and contact are hidden from the Legal Guide."
    }
  ],
  Tamil: [
    {
      q: "புகார் சமர்ப்பிப்பது எப்படி?",
      a: "உங்கள் பிரச்சினையை எளிய சொற்களில் எழுத 'புகாரை தட்டச்சு செய்க' என்பதைக் கிளிக் செய்யவும், அல்லது குரல் மூலம் பதிவு செய்ய 'குரல் புகார்' என்பதைக் கிளிக் செய்யவும்."
    },
    {
      q: "குரல் பதிவை எவ்வாறு பயன்படுத்துவது?",
      a: "குரல் புகார் திரையில் உள்ள சிவப்பு மைக்ரோஃபோன் பொத்தானைத் தட்டவும், தெளிவாகப் பேசவும், பின்னர் நிறுத்தவும்."
    },
    {
      q: "ஆதாரங்களை எவ்வாறு பதிவேற்றுவது?",
      a: "படி 5 இல், புகைப்படங்கள் அல்லது PDF ஆவணங்களைத் தேர்ந்தெடுக்க 'பதிவேற்று' பொத்தானைக் கிளிக் செய்யவும்."
    }
  ],
  Hindi: [
    {
      q: "शिकायत कैसे दर्ज करें?",
      a: "अपनी समस्या को सरल शब्दों में लिखने के लिए 'शिकायत लिखें' पर क्लिक करें, या आवाज का उपयोग करने के लिए 'बोलकर शिकायत करें' पर क्लिक करें।"
    },
    {
      q: "आवाज रिकॉर्डिंग का उपयोग कैसे करें?",
      a: "लाल माइक्रोफोन बटन पर टैप करें, स्पष्ट रूप से बोलें, और फिर रुकें। अराम आपकी आवाज को पाठ में बदल देगा।"
    }
  ]
};

export default function HelpCenter() {
  const [lang, setLang] = useState("English");
  const [search, setSearch] = useState("");
  const [activeFaq, setActiveFaq] = useState(null);
  const [speaking, setSpeaking] = useState(false);

  const list = faqs[lang] || faqs.English;
  const filtered = list.filter(
    item =>
      item.q.toLowerCase().includes(search.toLowerCase()) ||
      item.a.toLowerCase().includes(search.toLowerCase())
  );

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  };

  const handleSpeak = (text, e) => {
    e.stopPropagation();
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (lang === "Tamil") {
      utterance.lang = "ta-IN";
    } else if (lang === "Hindi") {
      utterance.lang = "hi-IN";
    } else {
      utterance.lang = "en-US";
    }

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
    toast.info("Reading response aloud...");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl mx-auto pb-12">
        {/* Header */}
        <Card className="p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Help & Support</h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">Find answers or use voice assistance.</p>
          </div>
          {/* Language selector */}
          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            {["English", "Tamil", "Hindi"].map(l => (
              <button
                key={l}
                onClick={() => {
                  setLang(l);
                  setActiveFaq(null);
                  window.speechSynthesis.cancel();
                  setSpeaking(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  lang === l ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </Card>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder={lang === "Tamil" ? "தேடல்..." : lang === "Hindi" ? "खोजें..." : "Search help topics..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full min-h-[48px] pl-12 pr-4 rounded-2xl border border-slate-200 bg-white text-xs font-medium outline-none focus:border-indigo-500 transition shadow-sm"
          />
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {filtered.map((item, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm transition hover:border-slate-300"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full min-h-[52px] px-5 py-4 flex items-center justify-between text-left cursor-pointer"
                >
                  <span className="font-extrabold text-xs text-slate-800 pr-4">{item.q}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleSpeak(item.a, e)}
                      className="p-2 hover:bg-slate-100 rounded-lg text-indigo-600 transition"
                      title="Read aloud"
                    >
                      {speaking && isOpen ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed font-medium border-t border-slate-50 bg-slate-50/30">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400 font-semibold border border-dashed rounded-3xl">
              No support articles found. Try searching another keyword.
            </div>
          )}
        </div>

        {/* Emergency Card */}
        <Card className="p-5 border-l-4 border-rose-500 bg-rose-50/20 rounded-2xl flex items-start gap-3">
          <Info className="text-rose-500 shrink-0 mt-0.5" size={18} />
          <div>
            <h4 className="font-extrabold text-xs text-rose-800">Women & Safety Immediate Support</h4>
            <p className="text-[11px] text-rose-650 mt-1 font-semibold leading-relaxed">
              If you require emergency help, toggle the safety indicator on the complaint submission form or contact state support helplines directly.
            </p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
