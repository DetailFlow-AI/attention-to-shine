import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore Attention to Shine's mobile detailing services — exterior detail, interior deep clean, full detail packages, and monthly maintenance plans in Lakeland, FL.",
};

const services = [
  {
    id: "exterior",
    label: "Exterior Detail",
    tagline: "A deep, protective shine.",
    price: "From $79.99",
    intro:
      "Your car's exterior takes a beating every day. Road grime, tree sap, bird droppings, Florida sun — they all add up. Our exterior detail is a thorough, paint-safe process designed to remove that buildup and leave behind a clean, protected finish that actually lasts.",
    body:
      "We start with a foam pre-wash to loosen surface contamination before anything touches the paint. From there, we hand wash the entire vehicle using pH-balanced soap, clean every rim and wheel well, dress the tires, detail the windows inside and out, and apply a protective sealant over the paint. By the time we're done, your car doesn't just look clean — it looks sharp.",
    included: [
      "Foam pre-wash to safely lift surface dirt",
      "Full hand wash with pH-balanced soap",
      "Wheel and rim cleaning",
      "Wheel well rinse and cleaning",
      "Window and glass cleaning",
      "Tire dressing and shine",
      "Protective paint sealant",
      "Door jamb wipe-down",
    ],
    note: "Great for keeping your vehicle looking its best between full details or before a special occasion.",
    gradient: "from-blue-950 to-navy",
  },
  {
    id: "interior",
    label: "Interior Detail",
    tagline: "Clean, fresh, and well cared for.",
    price: "From $119.99",
    intro:
      "The inside of your car is where you actually spend your time — and it shows. Dust on the dash, crumbs in the seats, smells that have built up over time. Our interior detail is a real deep clean, not a quick wipe-down. We get into every corner so that when you open the door, it genuinely feels different.",
    body:
      "We use a steam cleaner to break down grime on hard surfaces, vents, and tight crevices. From there we thoroughly vacuum all seats, carpets, and the trunk. We wipe down every surface on the dash, doors, and console, apply UV-protective dressing to all plastics and vinyl to prevent cracking and fading, and treat the interior for odors. Every vehicle is a little different, so we adjust our approach based on what your car actually needs.",
    included: [
      "Steam treatment on hard surfaces and vents",
      "Full vacuum — seats, carpet, and trunk",
      "Dashboard, console, and door panel wipe-down",
      "UV-protective dressing on all plastics and vinyl",
      "Leather conditioning and care (where applicable)",
      "Window cleaning from inside",
      "Odor treatment",
    ],
    note: "Service is customized to your vehicle's condition. The more detailed the job, the more time we take — we don't rush.",
    gradient: "from-stone-900 to-stone-800",
  },
  {
    id: "full",
    label: "Full Detail Package",
    tagline: "Every inch, done right.",
    price: "From $159.99",
    intro:
      "The Full Detail Package is our most requested service for good reason. It combines everything in our exterior and interior details into a single appointment, and it's the most thorough way to refresh your vehicle from every angle. Whether your car hasn't been properly cleaned in months or you just want it in peak condition, this is the one.",
    body:
      "You get the complete exterior process — pre-wash, full hand wash, wheels, windows, tires, sealant — paired with the complete interior process — steam, vacuum, surfaces, UV protection, odor treatment, leather care. One appointment. Total transformation. It's bundled at a better rate than booking the two services separately, so it's also the best value we offer.",
    included: [
      "Complete exterior detail (all items listed above)",
      "Complete interior detail (all items listed above)",
      "Best value — discounted vs. booking separately",
    ],
    note: "This is the most popular service we offer and the one we recommend for any vehicle that hasn't had a professional detail in a while.",
    gradient: "from-navy to-navy-dark",
    popular: true,
  },
  {
    id: "checkup",
    label: "Checkup Detailing Plan",
    tagline: "Always clean. No effort required.",
    price: "$120 – $200 / month",
    intro:
      "The Checkup Plan is a monthly subscription for customers who want their vehicle maintained on a consistent basis. You book once, lock in your preferred time slot, and we show up on schedule — every time. It's built for people who value their vehicle and don't want to think about when it was last detailed.",
    body:
      "Each visit includes a full interior and exterior service. With the Essential Plan, we come out once a month. The Premium Plan gets you two visits. Both plans include priority scheduling, leather care, and a dedicated approach to keeping your vehicle in top shape year-round. Since we're seeing the same vehicle regularly, we know exactly what it needs each time.",
    included: [
      "1 or 2 full details per month (your choice of plan)",
      "Priority scheduling with a reserved weekly time slot",
      "Interior and exterior service every visit",
      "Complimentary leather care and conditioning",
      "Consistent care from the same detailer",
    ],
    note: "Available only after your vehicle's first full detail with Attention to Shine.",
    gradient: "from-gold-dark to-gold",
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy pt-36 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="label-tag">Services</span>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-6">
            Every service, done right.
          </h1>
          <p className="text-xl text-white/60 leading-relaxed">
            We don't rush. We don't cut corners. We show up, we do the work
            properly, and we don't leave until it looks exactly the way it
            should.
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 px-6 bg-apple-gray">
        <div className="max-w-5xl mx-auto space-y-8">
          {services.map((service, idx) => (
            <div
              key={service.id}
              id={service.id}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-apple-gray-2 hover:shadow-xl transition-all duration-300"
            >
              {/* Header */}
              <div className={`bg-gradient-to-r ${service.gradient} px-8 py-8 relative`}>
                {service.popular && (
                  <span className="absolute top-4 right-4 bg-gold text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <span className="text-xs uppercase tracking-widest font-semibold text-white/40 mb-2 block">
                  0{idx + 1}
                </span>
                <h2 className="text-3xl font-bold text-white tracking-tight mb-1">
                  {service.label}
                </h2>
                <p className="text-gold font-medium">{service.tagline}</p>
              </div>

              {/* Body */}
              <div className="p-8 md:p-10 grid md:grid-cols-2 gap-10">
                <div>
                  <p className="text-apple-text-primary font-medium leading-relaxed mb-4">
                    {service.intro}
                  </p>
                  <p className="text-apple-text-secondary leading-relaxed mb-5">
                    {service.body}
                  </p>
                  <p className="text-xs text-apple-text-tertiary italic border-l-2 border-gold pl-3 mb-8">
                    {service.note}
                  </p>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-apple-text-tertiary uppercase tracking-wider mb-1">
                        Starting at
                      </p>
                      <p className="text-3xl font-bold text-apple-text-primary">
                        {service.price}
                      </p>
                      <p className="text-xs text-apple-text-tertiary mt-1">
                        Price may vary for larger vehicles
                      </p>
                    </div>
                    <Link href="/booking" className="btn-primary text-sm">
                      Book Now
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-gold mb-4">
                    What's Included
                  </h3>
                  <ul className="space-y-2.5">
                    {service.included.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-sm text-apple-text-secondary"
                      >
                        <CheckCircle2
                          size={15}
                          className="text-gold shrink-0 mt-0.5"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Vehicle size note */}
      <section className="py-16 px-6 bg-white border-t border-apple-gray-2">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-apple-text-primary mb-3">
            Pricing by Vehicle Size
          </h2>
          <p className="text-apple-text-secondary mb-8">
            Larger vehicles take more time and product. All prices listed are
            base rates for standard sedans and coupes.
          </p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            {[
              { size: "Sedan / Coupe", adj: "Base price" },
              { size: "SUV / Minivan", adj: "+ $20" },
              { size: "Large Truck / Van", adj: "+ $40" },
            ].map((row) => (
              <div
                key={row.size}
                className="bg-apple-gray rounded-2xl p-5 border border-apple-gray-2"
              >
                <p className="font-medium text-apple-text-primary mb-1">
                  {row.size}
                </p>
                <p className="text-gold font-semibold">{row.adj}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-apple-text-tertiary mt-5">
            Have a question about your specific vehicle? Call us at (863)
            934-9779.
          </p>
        </div>
      </section>

      {/* ── Factors That Can Impact the Quote ── */}
      <section className="py-20 px-6 bg-white border-t border-apple-gray-2">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="label-tag">Pricing</span>
            <h2 className="text-4xl font-bold text-apple-text-primary tracking-tight mb-4">
              Factors that can impact your quote
            </h2>
            <p className="text-apple-text-secondary max-w-2xl mx-auto">
              Every vehicle is different. These factors can adjust the final
              price of your detail — we'll always confirm your total before any
              work begins.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            {[
              {
                factor: "Vehicle Size",
                adj: "+$20 – $40",
                note: "SUVs and minivans add $20, large trucks and vans add $40 to the base price.",
              },
              {
                factor: "Pet Hair",
                adj: "+$20",
                note: "Heavy pet hair removal takes extra time and specialized tools.",
              },
              {
                factor: "Heavy Staining",
                adj: "+$30",
                note: "Deep-set stains require additional treatment and extraction.",
              },
            ].map((row) => (
              <div
                key={row.factor}
                className="bg-apple-gray rounded-2xl p-6 border border-apple-gray-2 text-center"
              >
                <p className="font-semibold text-apple-text-primary mb-1">
                  {row.factor}
                </p>
                <p className="text-lg font-bold text-gold mb-2">{row.adj}</p>
                <p className="text-xs text-apple-text-secondary leading-relaxed">
                  {row.note}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Photo */}
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl">
              <Image
                src="/images/exterior/IMG_1946.PNG"
                alt="White GMC Sierra after exterior detail with protective coating applied"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5">
                <span className="bg-gold text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                  White GMC Sierra — Coating Applied
                </span>
              </div>
            </div>

            {/* Content */}
            <div>
              <div className="bg-apple-gray rounded-3xl p-8 border border-apple-gray-2">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-apple-text-primary mb-1">
                      1-Year Protection Coating
                    </h3>
                    <p className="text-gold font-semibold text-sm">
                      Starting at $100 upcharge
                    </p>
                  </div>
                  <span className="bg-navy text-white text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 ml-4">
                    Add-On
                  </span>
                </div>

                <p className="text-apple-text-secondary leading-relaxed mb-6">
                  This one-year protective wax coating works similarly to a
                  ceramic sealant — lasting far longer than a standard wax. It
                  creates a durable layer of protection over your paint that
                  repels water, helps pollen and debris glide off easily, and
                  shields your vehicle from sun damage and rain spots.
                </p>

                <ul className="space-y-2.5 mb-8">
                  {[
                    "Lasts up to one year — far longer than standard wax",
                    "Water-repellent surface — beads and rolls right off",
                    "Pollen, debris, and light dirt glide off with ease",
                    "Protects against sun damage and UV fading",
                    "Reduces rain spot buildup on paint",
                    "Works like a ceramic sealant at a fraction of the cost",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-apple-text-secondary">
                      <CheckCircle2 size={15} className="text-gold shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>

                <p className="text-xs text-apple-text-tertiary italic border-l-2 border-gold pl-3 mb-6">
                  Available as an add-on to any exterior or full detail service.
                  Pricing varies by vehicle size — contact us for a quote on
                  your specific vehicle.
                </p>

                <Link href="/booking" className="btn-primary w-full justify-center">
                  Add This to My Booking
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy py-20 px-6 text-center">
        <h2 className="text-4xl font-bold text-white tracking-tight mb-4">
          Ready to book?
        </h2>
        <p className="text-white/60 mb-8 text-lg">
          Select your service, pick a time, and we'll handle the rest.
        </p>
        <Link href="/booking" className="btn-gold">
          Book Your Detail
          <ArrowRight size={16} />
        </Link>
      </section>
    </>
  );
}
