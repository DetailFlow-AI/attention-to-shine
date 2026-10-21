import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Info } from "lucide-react";
import {
  INSTANT_BOOKING_ENABLED,
  FLOW_CTA_SHORT,
} from "@/lib/bookingMode";
import {
  BASE_PRICES,
  TRUCK_SUV_UPCHARGE,
  TRUCK_SUV_PLAN_UPCHARGE,
  QUARTERLY_PLAN,
  MONTHLY_PLAN,
  QUARTERLY_ANNUAL_SAVINGS,
} from "@/lib/pricing";

// What the bundled Full Detail saves against booking the two halves
// separately. Derived so it can never contradict the prices themselves.
const BUNDLE_SAVINGS =
  BASE_PRICES.exterior + BASE_PRICES.interior - BASE_PRICES.full;

const bookVerb = INSTANT_BOOKING_ENABLED ? "Book" : "Request";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Starting prices for every Attention to Shine mobile detailing package and maintenance plan in Lakeland, FL. Request a quote — no hidden fees, no surprises.",
};

const packages = [
  {
    id: "exterior",
    name: "Exterior Detail",
    price: `Starting at $${BASE_PRICES.exterior}`,
    description:
      "Deep gloss, no swirl marks, no road film — paint that looks like it just left the showroom. Great for routine upkeep or before a special occasion.",
    features: [
      "Paint washed, dried, and sealed for lasting shine",
      "Wheels, wells, and tires cleaned and dressed",
      "Glass clear, inside and out",
      "Nothing overlooked — even the door jambs",
    ],
    cta: `${bookVerb} Exterior`,
    highlight: false,
  },
  {
    id: "full",
    name: "Full Detail Package",
    price: `Starting at $${BASE_PRICES.full}`,
    description:
      "A car that looks — and feels — brand new, inside and out, in one appointment. Our most requested service and our best value. Ideal for any vehicle that's due for a full reset.",
    features: [
      "Complete exterior detail",
      "Complete interior detail",
      "Best value — bundled rate",
    ],
    cta: `${bookVerb} Full Detail`,
    highlight: true,
    badge: "Most Popular",
  },
  {
    id: "interior",
    name: "Interior Detail",
    price: `Starting at $${BASE_PRICES.interior}`,
    description:
      "Step in and it feels like a different car — no stains, no odors, no dust anywhere you'd notice. Adjusted to your vehicle's specific condition.",
    features: [
      "No dust, crumbs, or grime anywhere you'd notice",
      "No odors — treated at the source, not masked",
      "Plastics and vinyl protected against fading",
      "Leather conditioned where applicable",
    ],
    cta: `${bookVerb} Interior`,
    highlight: false,
  },
];

const comparisonRows = [
  { feature: "Foam pre-wash & full hand wash", exterior: true, interior: false, full: true },
  { feature: "Wheel & rim cleaning", exterior: true, interior: false, full: true },
  { feature: "Window & glass cleaning", exterior: true, interior: false, full: true },
  { feature: "Tire dressing & shine", exterior: true, interior: false, full: true },
  { feature: "Protective paint sealant", exterior: true, interior: false, full: true },
  { feature: "Door jamb wipe-down", exterior: true, interior: false, full: true },
  { feature: "Steam treatment on surfaces & vents", exterior: false, interior: true, full: true },
  { feature: "Full vacuum — seats, carpet, trunk", exterior: false, interior: true, full: true },
  { feature: "Dashboard, console & door panels", exterior: false, interior: true, full: true },
  { feature: "UV-protective dressing on plastics", exterior: false, interior: true, full: true },
  { feature: "Leather conditioning (where applicable)", exterior: false, interior: true, full: true },
  { feature: "Odor treatment", exterior: false, interior: true, full: true },
];

const monthlyPlans = [
  {
    name: QUARTERLY_PLAN.name,
    price: `Starting at $${QUARTERLY_PLAN.pricePerVisit}`,
    unit: "per visit",
    details: `${QUARTERLY_PLAN.cadence} · ${QUARTERLY_PLAN.minVisits}-visit minimum`,
    features: [
      `Saves $${QUARTERLY_ANNUAL_SAVINGS} a year versus a full detail ${QUARTERLY_PLAN.visitsPerYear}× a year`,
      "Your car reset every season, before it ever looks neglected",
      "A reserved slot — never a scramble to rebook",
      "Free pet hair removal, always — no upcharge",
    ],
  },
  {
    name: MONTHLY_PLAN.name,
    price: `Starting at $${MONTHLY_PLAN.pricePerMonth}`,
    unit: "per month",
    details: MONTHLY_PLAN.cadence,
    features: [
      `Everything in ${QUARTERLY_PLAN.name}`,
      "Looks freshly detailed all month, every month",
      "Paint stays protected with a complimentary refresh",
      "The same detailer, every time — knows your car",
    ],
  },
];

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy pt-36 pb-20 px-6 text-center">
        <span className="label-tag">Pricing</span>
        <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-4">
          Clear, honest pricing.
        </h1>
        <p className="text-xl text-white/60 max-w-xl mx-auto mb-8">
          No hidden fees. No surprises. Just quality work at fair prices.
        </p>
        <div className="inline-flex items-center gap-2 bg-gold/15 border border-gold/30 text-gold text-sm font-medium px-5 py-3 rounded-full">
          By Appointment Only. Book Yours Now.
        </div>
      </section>

      {/* Monthly plans */}
      <section className="section-pad bg-navy border-t border-white/10">
        <div className="container-wide">
          <div className="text-center mb-12">
            <span className="label-tag">Subscription</span>
            <h2 className="text-4xl font-bold text-white tracking-tight mb-4">
              Shine Standard Maintenance
            </h2>
            <p className="text-white/60 max-w-xl mx-auto">
              A monthly maintenance plan for already-clean vehicles. Each visit
              includes an exterior rinse, tire shine, window wipe down, full
              interior vacuum, and dashboard wipe-down — keeping your detail
              looking fresh between full services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {monthlyPlans.map((plan) => (
              <div
                key={plan.name}
                className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/8 transition-colors"
              >
                <h3 className="text-lg font-semibold text-white mb-1">
                  {plan.name}
                </h3>
                <p className="text-sm text-white/50 mb-4">{plan.details}</p>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-4xl font-bold text-white">
                    {plan.price}
                  </span>
                  <span className="text-white/40 text-sm mb-1">
                    {plan.unit}
                  </span>
                </div>
                <ul className="space-y-2.5 mb-8">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm text-white/70"
                    >
                      <CheckCircle2 size={14} className="text-gold shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/shine-standard-maintenance"
                  className="inline-flex items-center gap-2 w-full justify-center border border-gold/40 text-gold px-6 py-3 rounded-full text-sm font-medium hover:bg-gold hover:text-white hover:border-gold transition-all duration-200"
                >
                  See Plan Details
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-white/30 text-xs mt-8">
            * Both plans require an initial full detail, and trucks and SUVs add
            ${TRUCK_SUV_PLAN_UPCHARGE}. Contact us to get started.
          </p>

        </div>
      </section>

      {/* One-time packages */}
      <section className="section-pad bg-apple-gray">
        <div className="container-wide">
          <div className="text-center mb-12">
            <span className="label-tag">Single Visit</span>
            <h2 className="text-4xl font-bold text-apple-text-primary tracking-tight">
              One-time packages
            </h2>
            <p className="text-apple-text-secondary mt-3 text-sm">
              All prices are starting rates for standard sedans and coupes.
              Larger vehicles are adjusted — see below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`rounded-3xl flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                  pkg.highlight
                    ? "bg-navy text-white shadow-xl"
                    : "bg-white border border-apple-gray-2"
                }`}
              >
                {pkg.badge && (
                  <div className="bg-gold text-white text-xs font-semibold text-center py-2 tracking-wide">
                    {pkg.badge}
                  </div>
                )}

                <div className="p-8 flex-1 flex flex-col">
                  <h2
                    className={`text-xl font-semibold mb-1 ${
                      pkg.highlight ? "text-white" : "text-apple-text-primary"
                    }`}
                  >
                    {pkg.name}
                  </h2>

                  {/* Price shown once, clearly */}
                  <div className="my-5">
                    <span
                      className={`text-xs uppercase tracking-wider ${
                        pkg.highlight ? "text-white/40" : "text-apple-text-tertiary"
                      }`}
                    >
                      Starting at
                    </span>
                    <p
                      className={`text-5xl font-bold mt-1 ${
                        pkg.highlight ? "text-white" : "text-apple-text-primary"
                      }`}
                    >
                      {pkg.price}
                    </p>
                  </div>

                  <p
                    className={`text-sm mb-6 leading-relaxed flex-1 ${
                      pkg.highlight ? "text-white/60" : "text-apple-text-secondary"
                    }`}
                  >
                    {pkg.description}
                  </p>

                  <ul className="space-y-2.5 mb-8">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle2
                          size={15}
                          className="text-gold shrink-0 mt-0.5"
                        />
                        <span
                          className={
                            pkg.highlight ? "text-white/70" : "text-apple-text-secondary"
                          }
                        >
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/booking?service=${pkg.id}`}
                    className={
                      pkg.highlight
                        ? "btn-gold w-full justify-center"
                        : "btn-outline w-full justify-center"
                    }
                  >
                    {pkg.cta}
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Package comparison */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="label-tag">Compare</span>
            <h2 className="text-4xl font-bold text-apple-text-primary tracking-tight mb-3">
              What's included in each package
            </h2>
            <p className="text-apple-text-secondary text-sm max-w-xl mx-auto">
              Every service, side by side — so you know exactly what you're
              getting before you book.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-apple-gray-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-navy text-white">
                  <th className="text-left font-semibold px-5 py-4">
                    Service
                  </th>
                  <th className="font-semibold px-4 py-4 text-center">
                    Exterior
                    <span className="block text-xs font-normal text-white/50">
                      Starting at ${BASE_PRICES.exterior}
                    </span>
                  </th>
                  <th className="font-semibold px-4 py-4 text-center">
                    Interior
                    <span className="block text-xs font-normal text-white/50">
                      Starting at ${BASE_PRICES.interior}
                    </span>
                  </th>
                  <th className="font-semibold px-4 py-4 text-center bg-gold/90">
                    Full Detail
                    <span className="block text-xs font-normal text-white/80">
                      Starting at ${BASE_PRICES.full}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={i % 2 === 0 ? "bg-white" : "bg-apple-gray"}
                  >
                    <td className="px-5 py-3.5 text-apple-text-primary font-medium">
                      {row.feature}
                    </td>
                    {[row.exterior, row.interior, row.full].map(
                      (included, col) => (
                        <td
                          key={col}
                          className={`px-4 py-3.5 text-center ${
                            col === 2 ? "bg-gold/5" : ""
                          }`}
                        >
                          {included ? (
                            <CheckCircle2
                              size={17}
                              className="text-gold inline-block"
                            />
                          ) : (
                            <span className="text-apple-text-tertiary">—</span>
                          )}
                        </td>
                      )
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-apple-text-tertiary mt-4 text-center">
            The Full Detail Package bundles every exterior and interior service
            at our best rate — saving ${BUNDLE_SAVINGS} versus booking separately.
          </p>
        </div>
      </section>

      {/* Vehicle sizing */}
      <section className="py-14 px-6 bg-white border-y border-apple-gray-2">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-start gap-3 mb-6">
            <Info size={18} className="text-gold shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-apple-text-primary mb-1">
                Trucks and SUVs are the only size upcharge
              </h3>
              <p className="text-sm text-apple-text-secondary">
                Trucks and SUVs take more time and product, so they add $
                {TRUCK_SUV_UPCHARGE} to a one-time detail and $
                {TRUCK_SUV_PLAN_UPCHARGE} on a maintenance plan. Every other
                vehicle is the starting price — no size upcharge at all.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { size: "Car, sedan or coupe", adj: "No upcharge" },
              {
                size: "Truck or SUV",
                adj: `+$${TRUCK_SUV_UPCHARGE} one-time · +$${TRUCK_SUV_PLAN_UPCHARGE} on a plan`,
              },
            ].map((row) => (
              <div
                key={row.size}
                className="bg-apple-gray rounded-2xl p-5 text-center border border-apple-gray-2"
              >
                <p className="font-medium text-sm text-apple-text-primary mb-1">
                  {row.size}
                </p>
                <p className="text-lg font-bold text-gold">{row.adj}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-apple-text-tertiary mt-4 text-center">
            Have an oversized or specialty vehicle? Call{" "}
            <a href="tel:+18639349779" className="text-gold hover:underline">
              (863) 934-9779
            </a>{" "}
            for a custom quote.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-pad bg-apple-gray">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="label-tag">FAQ</span>
            <h2 className="text-4xl font-bold text-apple-text-primary tracking-tight">
              Common questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Do prices include all vehicle types?",
                a: `Trucks and SUVs are the only vehicles with a size upcharge — $${TRUCK_SUV_UPCHARGE} on a one-time detail and $${TRUCK_SUV_PLAN_UPCHARGE} on a maintenance plan. Every other vehicle starts at the listed price.`,
              },
              {
                q: "Is the price I see a firm quote?",
                a: "No — every price on this site is a starting estimate. Most vehicles come in right at the starting price, but how dirty a vehicle is and the condition it was left in can affect the final number. We confirm your quote with you before any work begins.",
              },
              {
                q: "What payment methods do you accept?",
                a: INSTANT_BOOKING_ENABLED
                  ? "Payment is made in person on the day of your appointment — cash or card, once your detail is finished. Booking online simply reserves your time slot; nothing is charged up front."
                  : "Payment is made in person once your detail is finished — cash or card. Sending a request costs nothing and charges nothing; we quote you first and confirm the appointment with you before any work happens.",
              },
              {
                q: "Do I need to be home during the detail?",
                a: "Not necessarily. As long as we can access your vehicle and reach you by phone, we can complete the service while you go about your day.",
              },
              {
                q: "How long does each service take?",
                a: "Exterior details typically take 45 minutes to an hour, interior details take 2–3 hours, and full details take 2–4 hours — depending on vehicle size and condition.",
              },
            ].map((item) => (
              <div
                key={item.q}
                className="bg-white rounded-2xl p-6 border border-apple-gray-2"
              >
                <h3 className="font-semibold text-apple-text-primary mb-2">
                  {item.q}
                </h3>
                <p className="text-sm text-apple-text-secondary leading-relaxed">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gold py-16 px-6 text-center">
        <h2 className="text-4xl font-bold text-white tracking-tight mb-4">
          {INSTANT_BOOKING_ENABLED ? "Ready to book?" : "Ready to get started?"}
        </h2>
        <p className="text-white/80 mb-8">
          {INSTANT_BOOKING_ENABLED
            ? "Online booking takes under 2 minutes. Select your service, pick a time, and pay in person once your detail is done."
            : "Sending a request takes under 2 minutes. Tell us your service and preferred times, and we'll reply with a quote."}
        </p>
        <Link
          href="/booking"
          className="inline-flex items-center gap-2 bg-white text-gold px-8 py-4 rounded-full font-semibold text-sm hover:bg-white/90 transition-colors"
        >
          {FLOW_CTA_SHORT}
          <ArrowRight size={16} />
        </Link>
      </section>
    </>
  );
}
