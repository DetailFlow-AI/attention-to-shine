import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Info } from "lucide-react";
import MaintenanceQuote from "@/components/MaintenanceQuote";

export const metadata: Metadata = {
  title: "Shine Standard Maintenance",
  description:
    "A standing monthly appointment that keeps your vehicle in the condition we left it in. Essential from $100/month, Premium from $150/month, in Lakeland, FL.",
};

const includedGroups = [
  {
    group: "Exterior",
    items: [
      "Paint-safe rinse & full hand dry",
      "Tire shine, all four",
      "Exterior glass, streak-free",
    ],
  },
  {
    group: "Interior",
    items: [
      "Full vacuum — seats, carpets, trunk",
      "Dashboard & center console detailed",
      "Interior glass, streak-free",
      "Free pet hair removal, always",
    ],
  },
  {
    group: "Your standing appointment",
    items: [
      "Same reserved slot every month",
      "Priority scheduling over one-time bookings",
    ],
  },
];

export default function ShineStandardMaintenancePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy pt-36 pb-20 px-6 text-center">
        <span className="label-tag">Membership</span>
        <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-5">
          Shine Standard Maintenance
        </h1>
        <p className="text-xl text-white/60 max-w-2xl mx-auto mb-8 leading-relaxed">
          A standing monthly appointment that keeps your vehicle in exactly the
          condition we left it in — so it never needs rescuing again.
        </p>
        <div className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-2 bg-gold/15 border border-gold/30 text-gold text-sm font-medium px-5 py-3 rounded-full">
          <span>Essential from $100/month</span>
          <span className="text-gold/40">·</span>
          <span>Premium from $150/month</span>
        </div>
      </section>

      {/* Result, then what's included */}
      <section className="section-pad bg-white">
        <div className="container-wide">
          <div className="text-center mb-10">
            <span className="label-tag">The Result</span>
            <h2 className="section-heading mb-4">
              A brand-new-looking car, every time we're there.
            </h2>
            <p className="section-subheading max-w-2xl mx-auto">
              Once a month — or twice, on the Premium plan — your vehicle gets
              reset back to showroom condition. Not "cleaned." Brand-new
              looking, protected, and cared for, for less than the cost of a
              single detail spread across the month.
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-apple-gray-2 pt-10">
            {includedGroups.map((group) => (
              <div key={group.group}>
                <h3 className="text-xs uppercase tracking-widest text-gold font-semibold mb-3">
                  {group.group}
                </h3>
                <ul className="space-y-2">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-apple-text-secondary"
                    >
                      <CheckCircle2 size={14} className="text-gold shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prerequisite */}
      <section className="py-14 px-6 bg-apple-gray border-y border-apple-gray-2">
        <div className="max-w-3xl mx-auto flex items-start gap-4">
          <Info size={20} className="text-gold shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-apple-text-primary mb-2">
              A full detail comes first
            </h3>
            <p className="text-sm text-apple-text-secondary leading-relaxed">
              Maintenance plans are available only after your vehicle has had
              its initial full detail with us. The plan is designed to hold a
              finished result, not to reach one — so we bring the vehicle up to
              standard once, then keep it there. Book a detail first, and we'll
              talk through the plan while we're with the car.
            </p>
          </div>
        </div>
      </section>

      {/* Estimate tool */}
      <section className="section-pad bg-navy">
        <div className="container-wide">
          <div className="text-center mb-12">
            <span className="label-tag">Estimate</span>
            <h2 className="text-4xl font-bold text-white tracking-tight mb-4">
              What would yours cost?
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Plans start at the base rate and adjust for what the vehicle
              actually asks of us. Answer three quick questions for a rough
              monthly figure.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <MaintenanceQuote />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gold py-16 px-6 text-center">
        <h2 className="text-4xl font-bold text-white tracking-tight mb-4">
          Start with a detail.
        </h2>
        <p className="text-white/80 max-w-xl mx-auto mb-8">
          Book your first full detail and we'll set up your standing
          maintenance slot from there.
        </p>
        <Link
          href="/booking"
          className="inline-flex items-center gap-2 bg-white text-navy px-8 py-4 rounded-full font-semibold hover:bg-white/90 transition-colors"
        >
          Request an Appointment
          <ArrowRight size={16} />
        </Link>
      </section>
    </>
  );
}
