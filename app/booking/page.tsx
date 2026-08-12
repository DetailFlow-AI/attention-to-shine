import type { Metadata } from "next";
import { Suspense } from "react";
import BookingFormWrapper from "./BookingFormWrapper";
import { Shield, Clock, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Book a Detail",
  description:
    "Book your mobile car detail online. Select your service, pick a time, and pay in person after the job — we'll come to you.",
};

export default function BookingPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy pt-36 pb-16 px-6 text-center">
        <span className="label-tag">Online Booking</span>
        <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-4">
          Book your detail.
        </h1>
        <p className="text-xl text-white/60 max-w-lg mx-auto">
          Takes under 2 minutes. Pay in person after your detail — we'll handle
          the rest.
        </p>
      </section>

      {/* Main content */}
      <section className="bg-apple-gray min-h-screen py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Booking form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-8 md:p-10 border border-apple-gray-2 shadow-sm">
              <Suspense fallback={<div className="py-20 text-center text-apple-text-tertiary">Loading booking form…</div>}>
                <BookingFormWrapper />
              </Suspense>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-white rounded-3xl p-6 border border-apple-gray-2">
              <h3 className="font-semibold text-apple-text-primary mb-4">
                What to expect
              </h3>
              <ul className="space-y-3">
                {[
                  "Book in under 2 minutes",
                  "Receive an email confirmation",
                  "We text you 30 min before arrival",
                  "We bring all equipment — just leave your car accessible",
                  "Pay in person — cash or card after your detail",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-apple-text-secondary"
                  >
                    <span className="text-gold mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-apple-gray-2 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-navy/5 rounded-xl flex items-center justify-center text-navy shrink-0">
                  <Shield size={16} />
                </div>
                <div>
                  <p className="font-medium text-sm text-apple-text-primary">
                    Pay in person
                  </p>
                  <p className="text-xs text-apple-text-tertiary mt-0.5">
                    No payment is taken online. Pay by cash or card once your
                    detail is complete.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-navy/5 rounded-xl flex items-center justify-center text-navy shrink-0">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="font-medium text-sm text-apple-text-primary">
                    Business hours
                  </p>
                  <p className="text-xs text-apple-text-tertiary mt-0.5">
                    Mon – Sat: 7:00 AM – 7:00 PM
                    <br />
                    Sunday: Closed
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-navy/5 rounded-xl flex items-center justify-center text-navy shrink-0">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="font-medium text-sm text-apple-text-primary">
                    Questions?
                  </p>
                  <a
                    href="tel:+18639349779"
                    className="text-xs text-gold hover:underline"
                  >
                    Call (863) 934-9779
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-gold/10 border border-gold/20 rounded-3xl p-5">
              <p className="text-sm font-semibold text-apple-text-primary mb-1">
                🌞 Summer discount
              </p>
              <p className="text-sm text-apple-text-secondary">
                Use code{" "}
                <span className="font-mono font-bold bg-gold/20 px-1.5 py-0.5 rounded text-xs">
                  SUMMER26
                </span>{" "}
                to save 15% on any package over $200.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
