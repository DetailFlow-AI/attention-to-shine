import Link from "next/link";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import GoogleReviews from "@/components/GoogleReviews";
import HeroBackdrop from "@/components/HeroBackdrop";
import HeroScene from "@/components/HeroScene";
import ScrollWords from "@/components/ScrollWords";
import { getGoogleReviews } from "@/lib/googleReviews";
import { findPair } from "@/lib/photos";
import {
  BASE_PRICES,
  QUARTERLY_PLAN,
  MONTHLY_PLAN,
  QUARTERLY_ANNUAL_SAVINGS,
} from "@/lib/pricing";
import {
  ArrowRight,
  Shield,
  Sparkles,
  Clock,
  MapPin,
  ChevronRight,
  CheckCircle2,
  Phone,
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
      "Your paint comes back to life — deep gloss, no road film, cleaned with careful, paint-safe methods. The kind of shine that turns heads in your own driveway.",
    price: `From $${BASE_PRICES.exterior}`,
    icon: "✦",
    href: "/services#exterior",
  },
  {
    id: "interior",
    title: "Interior Detail",
    tagline: "Clean from the inside out.",
    description:
      "Step in and it feels like a new car — no stains, no odors, no dust anywhere you'd notice. The cabin you actually want to sit in.",
    price: `From $${BASE_PRICES.interior}`,
    icon: "◈",
    href: "/services#interior",
  },
  {
    id: "full",
    title: "Full Detail Package",
    tagline: "The complete transformation.",
    description:
      "Our most popular service, and our best rate. The result: a car that looks — and feels — brand new, inside and out.",
    price: `From $${BASE_PRICES.full}`,
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
// Photos are picked up straight off the filesystem at build time, so adding a
// transformation means dropping two files into /public/images/before-after/
// and rebuilding — no code change. A slot only becomes a live slider once BOTH
// halves of its pair exist; until then it renders as a placeholder.

interface PairSlot {
  label: string;
  title?: string;
  before?: string;
  after?: string;
}

const HERO_DIR = "images/before-after/hero";
const TRANSFORMATIONS_DIR = "images/before-after/transformations";

// Hero: exterior-before/after.jpg and interior-before/after.jpg
const heroBeforeAfters: PairSlot[] = [
  { label: "Exterior", ...(findPair(HERO_DIR, "exterior") ?? {}) },
  { label: "Interior", ...(findPair(HERO_DIR, "interior") ?? {}) },
];

// The scroll scene at the top polishes the exterior, then the interior.
const SCENE_TEXT: Record<string, { label: string; intro: string }> = {
  Exterior: { label: "Exterior detail", intro: "Keep scrolling to detail it" },
  Interior: { label: "Interior detail", intro: "Now the inside" },
};
const scenePairs = heroBeforeAfters
  .filter((pair) => pair.before && pair.after)
  .map((pair) => ({
    before: pair.before!,
    after: pair.after!,
    ...SCENE_TEXT[pair.label],
  }));

// Lower section: transformation-1..4-before/after.jpg. Only pairs that exist
// are shown (no empty placeholders on the live site), numbered in order.
const beforeAfters: PairSlot[] = [1, 2, 3, 4]
  .map((n) => findPair(TRANSFORMATIONS_DIR, `transformation-${n}`))
  .filter((pair): pair is { before: string; after: string } => Boolean(pair))
  .map((pair, i) => ({ label: `Transformation ${i + 1}`, ...pair }));


// Re-render the homepage about once an hour so a new Google review shows up on
// its own, without a redeploy (see lib/googleReviews.ts). Must be a plain
// number for Next.js to read it.
export const revalidate = 3600;

// Server Component: the Places call happens here, during the server render,
// so the API key never reaches the browser. Next caches the result for a day.
export default async function HomePage() {
  const reviewsData = await getGoogleReviews();
  return (
    <>
      {/* ── HERO ── */}
      {/* Scroll-driven: the headline lifts away, then the exterior and the
          interior are each "polished" from before to after (HeroScene). */}
      <HeroScene backdrop={<HeroBackdrop />} pairs={scenePairs}>
        <div className="max-w-6xl mx-auto px-6 pt-24 pb-12 md:pt-32 md:pb-16 flex flex-col items-center justify-center text-center">
          {/* Availability chip */}
          <div className="inline-flex items-center gap-2 bg-white/[0.06] border border-gold/30 text-gold text-xs font-semibold tracking-wide px-4 py-2 rounded-full mb-8 backdrop-blur-sm">
            <Sparkles size={12} />
            By Appointment Only. Book Yours Now.
          </div>

          <h1 className="text-[2.75rem] leading-[1.02] sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold text-white tracking-tight mb-6 max-w-5xl">
            Your car deserves{" "}
            <span className="text-shine whitespace-nowrap">to shine.</span>
          </h1>

          <p className="text-base md:text-xl text-white/65 max-w-2xl leading-relaxed mb-10 [@media(max-height:720px)]:hidden">
            Specializing in Lakeland's finest vehicles — while giving every
            vehicle the same standard of care.
          </p>

          {/* Primary actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mb-10">
            <Link href="/booking" className="btn-gold shine-auto text-base px-8 py-4">
              {FLOW_CTA}
              <ArrowRight size={16} />
            </Link>
            <a href="tel:+18639349779" className="btn-ghost-light text-base px-8 py-4">
              <Phone size={16} />
              (863) 934-9779
            </a>
          </div>

          {/* Starting prices, right where people look first */}
          <Link
            href="/pricing"
            className="group grid grid-cols-3 w-full max-w-xl rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm divide-x divide-white/10 transition-colors hover:border-gold/40"
          >
            {[
              { name: "Exterior", price: BASE_PRICES.exterior },
              { name: "Interior", price: BASE_PRICES.interior },
              { name: "Full Detail", price: BASE_PRICES.full, best: true },
            ].map((p) => (
              <div key={p.name} className="px-3 py-4 sm:py-5">
                <p
                  className={`text-[11px] sm:text-xs uppercase tracking-[0.16em] mb-1.5 ${
                    p.best ? "text-gold" : "text-white/50"
                  }`}
                >
                  {p.name}
                </p>
                <p className="font-display text-xl sm:text-2xl font-bold text-white">
                  <span className="text-white/45 text-xs sm:text-sm font-medium mr-1">
                    from
                  </span>
                  ${p.price}
                </p>
              </div>
            ))}
          </Link>

          {/* Trust line */}
          <p className="hidden sm:block mt-8 text-sm text-white/55 max-w-xl leading-relaxed [@media(max-height:760px)]:hidden">
            Fully mobile — we come to you. Serving Lakeland, Plant City, Winter
            Haven, Bartow, Auburndale, and the surrounding Polk County area.
          </p>
        </div>
      </HeroScene>

      {/* ── TRUST STRIP ── (the hero scene above already shows the
          exterior and interior before/afters, so no sliders repeat here) */}
      <section className="relative bg-navy-ink px-6 py-14 md:py-20">
        <div className="grid grid-cols-2 gap-8 md:gap-16 w-full max-w-2xl mx-auto">
          {[
            { value: "3 hrs", label: "Avg. Service Time" },
            { value: "100%", label: "Satisfaction Guaranteed" },
          ].map((stat) => (
            <div key={stat.label} className="text-center" data-reveal>
              <div className="font-display text-4xl md:text-5xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-xs text-white/45 uppercase tracking-[0.16em]">
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
            <div data-reveal>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {features.map((feature, i) => (
                <div
                  key={feature.title}
                  data-reveal
                  style={{ "--reveal-delay": `${i * 90}ms` } as React.CSSProperties}
                  className="card-lift bg-apple-gray border border-transparent rounded-3xl p-6 md:p-7"
                >
                  <div className="w-11 h-11 bg-navy text-gold rounded-2xl flex items-center justify-center mb-5">
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
          <div className="text-center mb-16" data-reveal>
            <span className="label-tag">Our Services</span>
            <h2 className="section-heading mb-4">
              Built for every vehicle.
            </h2>
            <p className="section-subheading max-w-2xl mx-auto">
              Whether your car needs a quick exterior refresh or a complete
              head-to-toe restoration, we have a package for it.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-2xl lg:max-w-none mx-auto">
            {services.map((service, i) => (
              <div
                key={service.id}
                data-reveal
                style={{ "--reveal-delay": `${i * 110}ms` } as React.CSSProperties}
                className={`card-lift relative rounded-3xl p-8 md:p-9 flex flex-col border ${
                  service.popular
                    ? "bg-navy text-white border-gold/40 shadow-[0_30px_60px_-30px_rgba(217,176,74,0.45)]"
                    : "bg-white border-apple-gray-2"
                }`}
              >
                {service.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gold text-navy text-xs font-semibold px-4 py-1.5 rounded-full shadow">
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
                  className={`font-display text-2xl font-bold mb-1 ${
                    service.popular ? "text-white" : "text-apple-text-primary"
                  }`}
                >
                  {service.title}
                </h3>
                <p
                  className={`text-sm font-medium mb-4 ${
                    service.popular ? "text-gold" : "text-gold-deep"
                  }`}
                >
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
                    className={`font-display text-2xl font-bold ${
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
                        : "text-navy hover:text-gold-deep"
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
          <div data-reveal>
            <span className="label-tag">Why Attention to Shine</span>
            <h2 className="section-heading mb-10">
              More than a car wash.{" "}
              <span className="text-gradient">It's a transformation.</span>
            </h2>
          </div>
          {/* Lights up word by word as you scroll, dims again going back. */}
          <ScrollWords
            className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold leading-snug tracking-tight text-apple-text-primary mb-6 max-w-3xl mx-auto"
            text="We treat every vehicle as if it were our own. That means using the right products, taking the time to do things properly, and never cutting corners — no matter the vehicle, no matter the job."
          />
          <div data-scroll="enter" className="fx-draw w-40 mx-auto mb-14" />

          <ul data-reveal className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto mb-12">
            {[
              "Paint stays glossy and protected, not stripped",
              "An interior that actually smells and feels clean",
              "No fading, cracking, or sun damage to plastics",
              "Careful, paint-safe wash and dry methods",
              "Done at your home or office — no wasted time",
              "A time that fits your week, Monday through Saturday",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-gold-deep shrink-0 mt-0.5" />
                <span className="text-apple-text-secondary text-[15px]">{item}</span>
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
            <span className="label-tag" data-reveal>Premium Subscription</span>
            <h2 className="text-[2.5rem] leading-[1.05] md:text-6xl font-bold text-white tracking-tight mb-6" data-reveal>
              Shine Standard Maintenance
            </h2>
            <p className="text-lg text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed">
              A maintenance plan for already-clean vehicles. After your initial
              full detail, we keep it looking that way — exterior rinse, tire
              shine, window wipe down, interior vacuum, and dashboard wipe-down
              on a consistent schedule, so your car never slips back.
            </p>

            {/* The two plans slide in from either side as you scroll. */}
            <div data-scroll="enter" className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-10">
              {[
                {
                  plan: QUARTERLY_PLAN.name,
                  price: `$${QUARTERLY_PLAN.pricePerVisit}`,
                  freq: "/ visit",
                  details: `${QUARTERLY_PLAN.cadence} · ${QUARTERLY_PLAN.minVisits}-visit minimum · saves $${QUARTERLY_ANNUAL_SAVINGS} a year`,
                },
                {
                  plan: MONTHLY_PLAN.name,
                  price: `$${MONTHLY_PLAN.pricePerMonth}`,
                  freq: "/ month",
                  details: MONTHLY_PLAN.cadence,
                },
              ].map((tier, i) => (
                <div
                  key={tier.plan}
                  className={i === 0 ? "fx-from-left" : "fx-from-right"}
                >
                  <div className="card-lift h-full bg-white/[0.04] border border-white/10 rounded-3xl p-8 hover:bg-white/[0.07]">
                    <p className="text-xs uppercase tracking-widest text-gold font-semibold mb-3">
                      {tier.plan}
                    </p>
                    <div className="flex items-end gap-1 mb-2">
                      <span className="font-display text-5xl font-bold text-white">
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
                </div>
              ))}
            </div>

            <p className="text-xs text-white/60 mb-8">
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
          <div className="text-center mb-14" data-reveal>
            <span className="label-tag">Before & After</span>
            <h2 className="section-heading mb-4">More Transformations</h2>
            <p className="section-subheading max-w-2xl mx-auto">
              Real vehicles, real results. Drag each slider to compare the
              vehicle before and after our detail.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
            {beforeAfters.map((pair, i) => (
              <div
                key={pair.label}
                data-reveal
                style={{ "--reveal-delay": `${(i % 3) * 120}ms` } as React.CSSProperties}
                className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.34rem)] max-w-md"
              >
                <BeforeAfterSlider
                  beforeSrc={pair.before!}
                  afterSrc={pair.after!}
                  alt={pair.title ?? pair.label}
                />
                <p className="text-center text-sm font-medium text-apple-text-secondary mt-4">
                  {pair.title ?? pair.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS: live from the Google Business Profile ── */}
      <GoogleReviews data={reviewsData} />

      {/* ── SERVICE AREA ── */}
      <section className="section-pad bg-white">
        <div className="container-wide text-center" data-reveal>
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
                <MapPin size={12} className="text-gold-deep" />
                {city}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section data-scroll className="fx-scrub-shine hero-stage py-20 md:py-28 px-6">
        <div className="relative container-wide flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left" data-reveal>
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-3">
              Ready to see the <span className="text-shine">difference?</span>
            </h2>
            <p className="text-white/65 text-lg">
              {INSTANT_BOOKING_ENABLED
                ? "Book online in under 2 minutes. We handle the rest."
                : "Send a request in under 2 minutes. We'll come back with a quote."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
            <Link href="/booking" className="btn-gold text-base px-8 py-4">
              {FLOW_CTA_SHORT}
              <ArrowRight size={16} />
            </Link>
            <a href="tel:+18639349779" className="btn-ghost-light text-base px-8 py-4">
              <Phone size={16} />
              Call Us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
