import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import Button from "@/components/common/Button";
import { toast } from "sonner";
import api from "@/services/api";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all required fields (Name, Email, Message).");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/support/contact", {
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim() || "General Inquiry",
        message: message.trim()
      });
      if (res.data?.success) {
        toast.success(res.data.message || "Message sent successfully! Our team will respond shortly.");
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        toast.error(res.data?.message || "Failed to send message.");
      }
    } catch (err) {
      console.error("Support form submission error:", err);
      toast.error(err.response?.data?.message || "Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact"
      className="bg-[#FFFDF8] py-16 sm:py-24 border-t border-[#E6E1D8]"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#1F5948] bg-[#DCEBDD] px-3.5 py-1.5 rounded-full inline-block shadow-2xs mb-3">
                Contact Support
              </span>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#163D32] tracking-tight">
                Let's Talk
              </h2>

              <p className="mt-3 text-xs sm:text-sm text-[#65736D] leading-relaxed">
                Have questions about legal aid, institutional onboarding, or technical assistance? Our support team is here to assist.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex gap-3.5 items-start p-4 rounded-2xl bg-[#F7F1E6]/50 border border-[#E6E1D8]">
                <div className="rounded-xl bg-[#DCEBDD] p-2.5 text-[#163D32] shrink-0">
                  <Mail size={18} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-[#18332B]">Official Email Gateway</h4>
                  <p className="text-xs text-[#163D32] font-mono mt-0.5 break-all font-semibold">ouraramsupport@gmail.com</p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start p-4 rounded-2xl bg-[#F7F1E6]/50 border border-[#E6E1D8]">
                <div className="rounded-xl bg-[#F6D8C8] p-2.5 text-[#8C3B1E] shrink-0">
                  <Phone size={18} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-[#18332B]">Phone Inquiries</h4>
                  <p className="text-xs text-[#65736D] mt-0.5 leading-relaxed">
                    +91 63812 76381 (Mr. Noyal Ashwin J)<br />
                    +91 82203 55021 (Mr. Sharon R)
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start p-4 rounded-2xl bg-[#F7F1E6]/50 border border-[#E6E1D8]">
                <div className="rounded-xl bg-[#DCEBDD] p-2.5 text-[#163D32] shrink-0">
                  <MapPin size={18} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-[#18332B]">Regional Jurisdiction</h4>
                  <p className="text-xs text-[#65736D] mt-0.5">Tamil Nadu, India (All 38 Districts)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSend} className="rounded-3xl border border-[#E6E1D8] bg-[#F7F1E6]/50 p-6 sm:p-8 lg:p-10 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#18332B] uppercase tracking-wider mb-1.5">
                  Your Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Anbarasan M"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-[#E6E1D8] bg-[#FFFDF8] px-4 py-3 text-xs sm:text-sm text-[#18332B] outline-none focus:border-[#163D32] focus:ring-2 focus:ring-[#DCEBDD] transition min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#18332B] uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-[#E6E1D8] bg-[#FFFDF8] px-4 py-3 text-xs sm:text-sm text-[#18332B] outline-none focus:border-[#163D32] focus:ring-2 focus:ring-[#DCEBDD] transition min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#18332B] uppercase tracking-wider mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g. Inquiry regarding DLSA Legal Aid"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-2xl border border-[#E6E1D8] bg-[#FFFDF8] px-4 py-3 text-xs sm:text-sm text-[#18332B] outline-none focus:border-[#163D32] focus:ring-2 focus:ring-[#DCEBDD] transition min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#18332B] uppercase tracking-wider mb-1.5">
                  Message *
                </label>
                <textarea
                  rows={4}
                  placeholder="How can ARAM support you? Describe your issue or inquiry..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-[#E6E1D8] bg-[#FFFDF8] p-4 text-xs sm:text-sm text-[#18332B] outline-none focus:border-[#163D32] focus:ring-2 focus:ring-[#DCEBDD] transition resize-none"
                />
              </div>

              <Button 
                type="submit"
                disabled={loading}
                variant="primary"
                className="w-full rounded-2xl py-3.5 text-xs sm:text-sm font-bold shadow-sm flex items-center justify-center gap-2 min-h-[46px] cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Sending Message...</span>
                  </>
                ) : (
                  <>
                    <span>Send Message</span>
                    <Send size={15} />
                  </>
                )}
              </Button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Contact;
