import React, { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
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
        toast.success(res.data.message || "Message sent successfully!");
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
      className="bg-[#FFFDF8] py-24 transition-colors duration-300 border-t border-[#E6E1D8]"
    >
      <div className="mx-auto grid max-w-[1400px] gap-12 px-6 lg:grid-cols-2">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-[#1F5948] bg-[#DCEBDD] px-3.5 py-1.5 rounded-full inline-block mb-3">
            Contact Support
          </span>

          <h2 className="text-3xl sm:text-5xl font-black text-[#163D32] tracking-tight">
            Let's Talk
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#65736D] leading-relaxed">
            Have questions about legal aid, institutional onboarding, or technical assistance? Our team is here to assist.
          </p>

          <div className="mt-10 space-y-6">
            <div className="flex gap-4 items-start">
              <div className="rounded-2xl bg-[#DCEBDD] p-3.5 text-[#163D32]">
                <Mail size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#18332B]">Official Email Gateway</h4>
                <p className="text-xs text-[#65736D] font-mono mt-0.5">ouraramsupport@gmail.com</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="rounded-2xl bg-[#F6D8C8] p-3.5 text-[#18332B]">
                <Phone size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#18332B]">Phone Inquiries</h4>
                <p className="text-xs text-[#65736D] mt-0.5 leading-relaxed">
                  +91 63812 76381 (Mr. Noyal Ashwin J) • +91 82203 55021 (Mr. Sharon R)
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="rounded-2xl bg-[#DCEBDD] p-3.5 text-[#163D32]">
                <MapPin size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#18332B]">Regional Jurisdiction</h4>
                <p className="text-xs text-[#65736D] mt-0.5">Tamil Nadu, India</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSend} className="rounded-3xl border border-[#E6E1D8] bg-[#F7F1E6]/50 p-8 sm:p-10 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#18332B] uppercase tracking-wider mb-1.5">
                Your Name *
              </label>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-2xl border border-[#E6E1D8] bg-[#FFFDF8] p-3.5 text-xs sm:text-sm text-[#18332B] outline-none focus:border-[#1F5948] transition"
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
                className="w-full rounded-2xl border border-[#E6E1D8] bg-[#FFFDF8] p-3.5 text-xs sm:text-sm text-[#18332B] outline-none focus:border-[#1F5948] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#18332B] uppercase tracking-wider mb-1.5">
                Subject
              </label>
              <input
                type="text"
                placeholder="Topic or Grievance Inquiry"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-2xl border border-[#E6E1D8] bg-[#FFFDF8] p-3.5 text-xs sm:text-sm text-[#18332B] outline-none focus:border-[#1F5948] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#18332B] uppercase tracking-wider mb-1.5">
                Message *
              </label>
              <textarea
                rows={4}
                placeholder="How can ARAM support you?..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="w-full rounded-2xl border border-[#E6E1D8] bg-[#FFFDF8] p-3.5 text-xs sm:text-sm text-[#18332B] outline-none focus:border-[#1F5948] transition"
              />
            </div>

            <Button 
              type="submit"
              disabled={loading}
              variant="primary"
              className="w-full rounded-full py-3.5 text-xs sm:text-sm font-bold shadow-md"
            >
              {loading ? "Sending..." : "Send Message"}
              <Send size={15} />
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Contact;
