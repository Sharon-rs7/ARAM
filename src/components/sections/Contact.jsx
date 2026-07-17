import {
  Mail,
  Phone,
  MapPin,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Contact = () => {
  return (
    <section
      id="contact"
      className="bg-white py-28"
    >
      <div className="mx-auto grid max-w-[1400px] gap-16 px-6 lg:grid-cols-2">

        <div>

          <span className="rounded-full bg-blue-100 px-5 py-2 font-medium text-blue-600">
            Contact Us
          </span>

          <h2 className="mt-8 text-5xl font-bold text-slate-900">
            Let's Talk
          </h2>

          <p className="mt-6 text-lg leading-8 text-slate-500">
            Have questions? Our team is always ready to help.
          </p>

          <div className="mt-12 space-y-8">

            <div className="flex gap-5">

              <div className="rounded-2xl bg-blue-100 p-4 text-blue-600">
                <Mail />
              </div>

              <div>

                <h4 className="font-bold">
                  Email
                </h4>

                <p className="text-slate-500">
                  support@aram.ai
                </p>

              </div>

            </div>

            <div className="flex gap-5">

              <div className="rounded-2xl bg-blue-100 p-4 text-blue-600">
                <Phone />
              </div>

              <div>

                <h4 className="font-bold">
                  Phone
                </h4>

                <p className="text-slate-500">
                  +91 9876543210
                </p>

              </div>

            </div>

            <div className="flex gap-5">

              <div className="rounded-2xl bg-blue-100 p-4 text-blue-600">
                <MapPin />
              </div>

              <div>

                <h4 className="font-bold">
                  Office
                </h4>

                <p className="text-slate-500">
                  Coimbatore, Tamil Nadu, India
                </p>

              </div>

            </div>

          </div>

        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-lg">

          <div className="space-y-6">

            <input
              placeholder="Full Name"
              className="w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-blue-500"
            />

            <input
              placeholder="Email Address"
              className="w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-blue-500"
            />

            <input
              placeholder="Subject"
              className="w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-blue-500"
            />

            <textarea
              rows="6"
              placeholder="Message..."
              className="w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-blue-500"
            />

            <Button className="w-full rounded-xl bg-blue-600 py-7 text-lg hover:bg-blue-700">
              Send Message

              <Send className="ml-2 h-5 w-5" />
            </Button>

          </div>

        </div>

      </div>
    </section>
  );
};

export default Contact;