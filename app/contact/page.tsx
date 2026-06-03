"use client";

import type { Metadata } from "next";
import { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";

const contactInfo = [
  {
    icon: <Phone size={18} />,
    label: "Phone",
    value: "(863) 934-9779",
    href: "tel:+18639349779",
  },
  {
    icon: <Mail size={18} />,
    label: "Email",
    value: "Clillie08@outlook.com",
    href: "mailto:Clillie08@outlook.com",
  },
  {
    icon: <MapPin size={18} />,
    label: "Location",
    value: "Lakeland, FL 33809",
    href: null,
  },
  {
    icon: <Clock size={18} />,
    label: "Hours",
    value: "Mon – Sat: 7:00 AM – 7:00 PM\nSunday: Closed",
    href: null,
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    // TODO: Wire up to your email service (e.g. Resend, SendGrid, or Formspree)
    // For now, simulate a short delay
    await new Promise((r) => setTimeout(r, 1200));
    setStatus("success");
  };

  const inputClass =
    "w-full px-4 py-3.5 border border-apple-gray-2 rounded-xl text-sm text-apple-text-primary placeholder:text-apple-text-tertiary bg-white focus:outline-none focus:ring-2 focus:ring-navy/10 focus:border-navy transition-all duration-200";

  return (
    <>
      {/* Hero */}
      <section className="bg-navy pt-36 pb-20 px-6 text-center">
        <span className="label-tag">Contact</span>
        <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-4">
          We'd love to hear from you.
        </h1>
        <p className="text-xl text-white/60 max-w-xl mx-auto">
          Questions about services, pricing, or your area? Reach out and we'll
          get back to you quickly.
        </p>
      </section>

      {/* Content */}
      <section className="section-pad bg-apple-gray">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Contact info */}
            <div className="lg:col-span-2 space-y-5">
              <div>
                <h2 className="text-2xl font-semibold text-apple-text-primary mb-2">
                  Get in touch
                </h2>
                <p className="text-apple-text-secondary text-sm leading-relaxed">
                  Prefer to talk? Give us a call during business hours. Or send
                  us a message and we'll reply within one business day.
                </p>
              </div>

              <div className="space-y-4">
                {contactInfo.map((item) => (
                  <div
                    key={item.label}
                    className="bg-white rounded-2xl p-5 border border-apple-gray-2 flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center text-navy shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-apple-text-tertiary uppercase tracking-wider mb-1">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-sm text-apple-text-primary hover:text-gold transition-colors font-medium"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-sm text-apple-text-primary font-medium whitespace-pre-line">
                          {item.value}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gold/10 border border-gold/20 rounded-2xl p-5">
                <p className="text-sm font-semibold text-apple-text-primary mb-1">
                  Looking to book a detail?
                </p>
                <p className="text-sm text-apple-text-secondary">
                  You can book and pay directly on our booking page — no need to
                  wait for a reply.
                </p>
                <a
                  href="/booking"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-gold mt-2 hover:underline"
                >
                  Go to booking →
                </a>
              </div>
            </div>

            {/* Contact form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl p-8 md:p-10 border border-apple-gray-2 shadow-sm">
                {status === "success" ? (
                  <div className="flex flex-col items-center text-center py-10">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 size={32} className="text-green-500" />
                    </div>
                    <h3 className="text-2xl font-semibold text-apple-text-primary mb-2">
                      Message sent!
                    </h3>
                    <p className="text-apple-text-secondary text-sm">
                      Thanks for reaching out. We'll get back to you within one
                      business day.
                    </p>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-semibold text-apple-text-primary mb-6">
                      Send us a message
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-apple-text-secondary mb-1.5">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            required
                            placeholder="John Smith"
                            value={form.name}
                            onChange={handleChange}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-apple-text-secondary mb-1.5">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            name="email"
                            required
                            placeholder="john@email.com"
                            value={form.email}
                            onChange={handleChange}
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-apple-text-secondary mb-1.5">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            placeholder="(863) 000-0000"
                            value={form.phone}
                            onChange={handleChange}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-apple-text-secondary mb-1.5">
                            Subject
                          </label>
                          <select
                            name="subject"
                            value={form.subject}
                            onChange={handleChange}
                            className={inputClass}
                          >
                            <option value="">Select a topic</option>
                            <option value="quote">Request a Quote</option>
                            <option value="booking">Booking Question</option>
                            <option value="checkup">Checkup Plan Inquiry</option>
                            <option value="service-area">Service Area Question</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-apple-text-secondary mb-1.5">
                          Message *
                        </label>
                        <textarea
                          name="message"
                          required
                          rows={5}
                          placeholder="Tell us about your vehicle and what you're looking for..."
                          value={form.message}
                          onChange={handleChange}
                          className={`${inputClass} resize-none`}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={status === "sending"}
                        className="btn-primary w-full justify-center"
                      >
                        {status === "sending" ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sending…
                          </>
                        ) : (
                          <>
                            Send Message
                            <Send size={14} />
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
