"use client";

import Link from "next/link";
import BeforeAfterSlider, {
  BeforeAfterPlaceholder,
} from "@/components/BeforeAfterSlider";
import ReviewsCarousel from "@/components/ReviewsCarousel";
import {
  ArrowRight,
  Shield,
  Sparkles,
  Clock,
  MapPin,
  ChevronRight,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import {
  INSTANT_BOOKING_ENABLED,
  FLOW_CTA,
  FLOW_CTA_SHORT,
} from "@/lib/bookingMode";

const services = [
  {
    id: "exterior",
    title: "Exterior Detail",
    tagline: "A mirror finish, every time.",
    description:
      "Your paint comes back to life — deep gloss, no swirl marks, no road film. The kind of shine that turns heads in your own driveway.",
    price: "From $100",
    icon: "✦",
    href: "/services#exterior",
  },
  {
    id: "interior",
    title: "Interior Detail",
    tagline: "Clean from the inside out.",
    description:
      "Step in and it feels like a new car — no stains, no odors, no dust anywhere you'd notice. The cabin you actually want to sit in.",
    price: "From $140",
    icon: "◈",
    href: "/services#interior",
  },
  {
    id: "full",
    title: "Full Detail Package",
    tagline: "The complete transformation.",
    description:
      "Our most popular service, and our best rate. The result: a car that looks — and feels — brand new, inside and out.",
    price: "From $200",
    icon: "◉",
    href: "/services#full",
    popular: true,
  },
];

const features = [
  {
    icon: <MapPin size={20} />,
    title: "No Driving, No Waiting",
    description:
      "We come to your home or office. You get a spotless car back without losing an hour of your day.",
  },
  {
    icon: <Shield size={20} />,
    title: "Your Paint, Protected",
    description:
      "Professional-grade products keep your finish glossy and protected — never stripped or dulled, visit after visit.",
  },
  {
    icon: <Sparkles size={20} />,
    title: "Results That Hold Up",
    description:
      "Not just clean at a glance — clean up close, in the seams and corners most people never check.",
  },
  {
    icon: <Clock size={20} />,
    title: "Fits Your Week",
    description:
      "Monday through Saturday, 7 AM to 7 PM. Pick a time that works for you, not the other way around.",
  },
];

// ── Before/after slots ────────────────────────────────────────────────────────
// Photos for these are being supplied separately. Each slot renders an empty
// placeholder until `before` and `after` are filled in; adding the two paths
// (and the vehicle name in `title`) is the only change needed to go live.

interface PairSlot {
  label: string;
  title?: string;
  before?: string;
  after?: string;
}

// Hero: one exterior, one interior, both on specific vehicles to be confirmed.
const heroBeforeAfters: PairSlot[] = [
  { label: "Exterior" },
  { label: "Interior" },
];

// Lower section: four transformations.
const beforeAfters: PairSlot[] = [
  { label: "Transformation 1" },
  { label: "Transformation 2" },
  { label: "Transformation 3" },
  { label: "Transformation 4" },
];

const reviews = [
  {
    quote: "Wow! It looks like new again!",
    name: "John Travis",
    initials: "JT",
    detail: "Lakeland, FL — Full Detail Package",
  },
  {
    quote: "My car hasn't looked this good since the day I bought it!",
    name: "Mike L.",
    initials: "ML",
    detail: "Lakeland, FL — Full Detail Package",
  },
  {
    quote: "It looks like it should be in a showroom.",
    name: "Mr. David",
    initials: "MD",
    detail: "Lakeland, FL — Full Detail Package",
  },
  {
    quote:
      "I almost feel bad taking my car out of the driveway now — I don't want it to get dirty!",
    name: "Steve B.",
    initials: "SB",
    detail: "Lakeland, FL — Shine Standard Maintenance",
  },
  {
    quote: "I'll definitely be calling them out again. Highly recommend!",
    name: "Eric K.",
    initials: "EK",
    detail: "Lakeland, FL — Full Detail Package",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative flex flex-col justify-center overflow-hidden bg-navy">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/4 -right-1/4 w-[700px] h-[700px] rounded-full bg-gold/5 blur-3xl" />
          <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-gold/5 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-28 pb-16 md:pt-32 md:pb-20 flex flex-col items-center text-center">
          {/* Availability chip */}
          <div className="inline-flex items-center gap-2 bg-gold/15 border border-gold/30 text-gold text-xs font-semibold px-4 py-2 rounded-full mb-7 backdrop-blur-sm">
            <Sparkles size={12} />
            By Appointment Only. Book Yours Now.
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white tracking-tight leading-[1.05] mb-5 max-w-4xl">
            Your car deserves{" "}
            <span className="text-gold">to shine.</span>
          </h1>

          <p className="text-base md:text-lg text-white/60 max-w-2xl leading-relaxed mb-10">
            Specializing in Lakeland's finest vehicles — while giving every
            vehicle the same standard of care.
          </p>

          {/* Proof first: two draggable transformations, exterior and interior */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 w-full mb-10">
            {heroBeforeAfters.map((pair) => (
              <div key={pair.label}>
                {pair.before && pair.after ? (
                  <BeforeAfterSlider
                    beforeSrc={pair.before}
                    afterSrc={pair.after}
                    alt={pair.title ?? pair.label}
                    aspectClass="aspect-[4/3]"
                  />
                ) : (
                  <BeforeAfterPlaceholder
                    label={pair.label}
                    note="Vehicle and photos to be confirmed"
                    aspectClass="aspect-[4/3]"
                  />
                )}
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-white/50">
                  {pair.label}
                </p>
              </div>
            ))}
          </div>
          {heroBeforeAfters.some((p) => p.before && p.after) && (
            <p className="text-xs text-white/35 mb-10 -mt-6">
              Drag any slider to see the difference.
            </p>
          )}

          {/* Single call to action */}
          <Link href="/booking" className="btn-gold text-base px-8 py-4">
            {FLOW_CTA}
            <ArrowRight size={16} />
          </Link>

          {/* Trust line */}
          <p className="mt-5 text-sm text-white/50 max-w-xl leading-relaxed">
            Fully mobile — we come to you. Serving Lakeland, Plant City, Winter
            Haven, Bartow, Auburndale, and the surrounding Polk County area.
          </p>
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <section className="bg-navy border-t border-white/10 py-10 px-6">
        <div className="grid grid-cols-2 gap-8 md:gap-16 w-full max-w-2xl mx-auto">
          {[
            { value: "3 hrs", label: "Avg. Service Time" },
            { value: "100%", label: "Satisfaction Guaranteed" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-white/40 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="section-pad bg-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="label-tag">About Us</span>
              <h2 className="section-heading mb-6">
                Built on a passion for{" "}
                <span className="text-gradient">the details.</span>
              </h2>
              <p className="text-apple-text-secondary leading-relaxed mb-5">
                Attention to Shine started with a simple belief: every vehicle
                deserves to be treated with care and respect. Based in Lakeland,
                Florida, we're a mobile detailing business dedicated to bringing
                professional-quality results directly to your driveway.
              </p>
              <p className="text-apple-text-secondary leading-relaxed mb-5">
                We're not a car wash. We're a detail service — and there's a big
                difference. Where others rush, we slow down. Where others wipe
                surfaces, we clean them thoroughly. We pay attention to the
                things most people overlook, because those are exactly the things
                that make a vehicle look truly exceptional.
              </p>
              <p className="text-apple-text-secondary leading-relaxed mb-8">
                Whether your car is a daily driver that needs a reset or a
                prized vehicle you want kept in showroom condition, we show up
                with the same level of care and the same commitment to getting
                it right. From daily drivers to Range Rovers, Lincoln
                Navigators, and custom Raptors, we bring the same unhurried,
                professional approach to every vehicle we touch.
              </p>
              <Link href="/services" className="btn-primary">
                See Our Services
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-5">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-apple-gray rounded-2xl p-6 hover:bg-apple-gray-2 transition-colors"
                >
                  <div className="w-10 h-10 bg-navy/10 rounded-xl flex items-center justify-center text-navy mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-apple-text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-apple-text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="section-pad bg-apple-gray">
        <div className="container-wide">
          <div className="text-center mb-16">
            <span className="label-tag">Our Services</span>
            <h2 className="section-heading mb-4">
              Built for every vehicle.
            </h2>
            <p className="section-subheading max-w-2xl mx-auto">
              Whether your car needs a quick exterior refresh or a complete
              head-to-toe restoration, we have a package for it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className={`relative rounded-3xl p-8 flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                  service.popular
                    ? "bg-navy text-white"
                    : "bg-white border border-apple-gray-2"
                }`}
              >
                {service.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gold text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow">
                      Most Popular
                    </span>
                  </div>
                )}

                <div
                  className={`text-2xl mb-6 w-12 h-12 flex items-center justify-center rounded-2xl ${
                    service.popular ? "bg-white/10" : "bg-apple-gray"
                  }`}
                >
                  {service.icon}
                </div>

                <h3
                  className={`text-xl font-semibold mb-1 ${
                    service.popular ? "text-white" : "text-apple-text-primary"
                  }`}
                >
                  {service.title}
                </h3>
                <p className="text-sm font-medium mb-4 text-gold">
                  {service.tagline}
                </p>
                <p
                  className={`text-sm leading-relaxed flex-1 mb-8 ${
                    service.popular ? "text-white/70" : "text-apple-text-secondary"
                  }`}
                >
                  {service.description}
                </p>

                <div className="flex items-center justify-between">
                  <span
                    className={`text-lg font-bold ${
                      service.popular ? "text-white" : "text-apple-text-primary"
                    }`}
                  >
                    {service.price}
                  </span>
                  <Link
                    href={service.href}
                    className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                      service.popular
                        ? "text-gold hover:text-gold-light"
                        : "text-navy hover:text-gold"
                    }`}
                  >
                    Learn more <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/pricing" className="btn-outline">
              View All Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="section-pad bg-white">
        <div className="container-wide max-w-4xl mx-auto text-center">
          <span className="label-tag">Why Attention to Shine</span>
          <h2 className="section-heading mb-6">
            More than a car wash.{" "}
            <span className="text-gradient">It's a transformation.</span>
          </h2>
          <p className="section-subheading mb-12 max-w-2xl mx-auto">
            We treat every vehicle as if it were our own. That means using the
            right products, taking the time to do things properly, and never
            cutting corners — no matter the vehicle, no matter the job.
          </p>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto mb-12">
            {[
              "Paint stays glossy and protected, not stripped",
              "An interior that actually smells and feels clean",
              "No fading, cracking, or sun damage to plastics",
              "No swirl marks or scratches, ever",
              "Done at your home or office — no wasted time",
              "A time that fits your week, Monday through Saturday",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-gold shrink-0 mt-0.5" />
                <span className="text-apple-text-secondary text-sm">{item}</span>
              </li>
            ))}
          </ul>

          <Link href="/booking" className="btn-primary">
            {INSTANT_BOOKING_ENABLED ? "Schedule Your Detail" : FLOW_CTA}
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── CHECKUP PLAN ── */}
      <section className="section-pad bg-navy">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto text-center">
            <span className="label-tag">Premium Subscription</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">
              Shine Standard Maintenance
            </h2>
            <p className="text-lg text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed">
              A maintenance plan for already-clean vehicles. After your initial
              full detail, we keep it looking that way — exterior rinse, tire
              shine, window wipe down, interior vacuum, and dashboard wipe-down
              on a consistent schedule, so your car never slips back.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-10">
              {[
                {
                  plan: "Essential Plan",
                  price: "$100",
                  freq: "/ month",
                  details: "1 maintenance visit per month",
                },
                {
                  plan: "Premium Plan",
                  price: "$150",
                  freq: "/ month",
                  details: "2 maintenance visits per month",
                },
              ].map((tier) => (
                <div
                  key={tier.plan}
                  className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/8 transition-colors"
                >
                  <p className="text-xs uppercase tracking-widest text-gold font-semibold mb-3">
                    {tier.plan}
                  </p>
                  <div className="flex items-end gap-1 mb-2">
                    <span className="text-4xl font-bold text-white">
                      {tier.price}
                    </span>
                    <span className="text-white/40 text-sm mb-1">
                      {tier.freq}
                    </span>
                  </div>
                  <p className="text-sm text-white/50 mb-6">{tier.details}</p>
                  <ul className="space-y-2.5">
                    {[
                      "Your car looks freshly detailed, every visit",
                      "No streaks, no dust, no slipping back to dirty",
                      "A reserved slot, never a scramble to rebook",
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-sm text-white/70"
                      >
                        <CheckCircle2 size={14} className="text-gold shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <p className="text-xs text-white/30 mb-8">
              * Shine Standard Maintenance is available only after your vehicle's initial
              full detail with us.
            </p>
            <Link href="/shine-standard-maintenance" className="btn-gold">
              Get Started
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── BEFORE & AFTER ── */}
      <section className="section-pad bg-white">
        <div className="container-wide">
          <div className="text-center mb-14">
            <span className="label-tag">Before & After</span>
            <h2 className="section-heading mb-4">More Transformations</h2>
            <p className="section-subheading max-w-2xl mx-auto">
              Real vehicles, real results. Drag each slider to compare the
              vehicle before and after our detail.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {beforeAfters.map((pair) => (
              <div key={pair.label}>
                {pair.before && pair.after ? (
                  <BeforeAfterSlider
                    beforeSrc={pair.before}
                    afterSrc={pair.after}
                    alt={pair.title ?? pair.label}
                  />
                ) : (
                  <BeforeAfterPlaceholder label={pair.label} tone="light" />
                )}
                <p className="text-center text-sm font-medium text-apple-text-secondary mt-4">
                  {pair.title ?? pair.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className="section-pad bg-apple-gray">
        <div className="container-wide">
          <div className="text-center mb-14">
            <span className="label-tag">Reviews</span>
            <h2 className="section-heading mb-4">
              What our customers say.
            </h2>
          </div>

          <ReviewsCarousel reviews={reviews} />

          {/* Separate from the testimonials above — links out to the live
              Google listing so leads can read unfiltered reviews. */}
          <div className="text-center mt-12">
            <a
              href="https://maps.app.goo.gl/dqWzddQBFShN4KqB8?g_st=ic"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-navy border border-navy/20 px-6 py-3 rounded-full hover:bg-navy hover:text-white transition-colors duration-200"
            >
              See our Google Reviews
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* ── SERVICE AREA ── */}
      <section className="section-pad bg-white">
        <div className="container-wide text-center">
          <span className="label-tag">Service Area</span>
          <h2 className="section-heading mb-4">
            Stationed in Lakeland, Florida — We come to you.
          </h2>
          <p className="section-subheading max-w-xl mx-auto mb-8">
            We proudly serve Lakeland and the surrounding Polk County area. Not
            sure if we cover your location? Give us a call — we're happy to help.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Lakeland",
              "Plant City",
              "Winter Haven",
              "Bartow",
              "Haines City",
              "Auburndale",
            ].map((city) => (
              <span
                key={city}
                className="flex items-center gap-1.5 bg-apple-gray text-apple-text-secondary text-sm px-4 py-2 rounded-full border border-apple-gray-2"
              >
                <MapPin size={12} className="text-gold" />
                {city}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="bg-gold py-16 px-6">
        <div className="container-wide flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
              Ready to see the difference?
            </h2>
            <p className="text-white/80 text-lg">
              {INSTANT_BOOKING_ENABLED
                ? "Book online in under 2 minutes. We handle the rest."
                : "Send a request in under 2 minutes. We'll come back with a quote."}
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 bg-white text-gold px-7 py-3.5 rounded-full font-semibold text-sm hover:bg-white/90 transition-colors"
            >
              {FLOW_CTA_SHORT}
              <ArrowRight size={16} />
            </Link>
            <a
              href="tel:+18639349779"
              className="inline-flex items-center gap-2 border border-white/40 text-white px-7 py-3.5 rounded-full font-medium text-sm hover:border-white hover:bg-white/10 transition-colors"
            >
              Call Us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
