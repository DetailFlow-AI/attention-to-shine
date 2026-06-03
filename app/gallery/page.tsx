"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

type Category = "all" | "exterior" | "interior" | "before-after";

interface GalleryItem {
  id: number;
  category: "exterior" | "interior";
  src: string;
  alt: string;
}

interface BeforeAfterPair {
  id: number;
  label: string;
  vehicle: string;
  before: { src: string; alt: string };
  after: { src: string; alt: string };
}

// ── Exterior — all after/completed shots ─────────────────────────────────────
const exteriorPhotos: GalleryItem[] = [
  { id: 1,  category: "exterior", src: "/images/exterior/IMG_1941.PNG",  alt: "Black Chevy Silverado ZR2 — front grille shine after full exterior detail" },
  { id: 2,  category: "exterior", src: "/images/exterior/IMG_1963.PNG",  alt: "White Camaro SS — front end gleaming after exterior detail" },
  { id: 3,  category: "exterior", src: "/images/exterior/IMG_1956.PNG",  alt: "White Lincoln Navigator — front detail completed" },
  { id: 4,  category: "exterior", src: "/images/exterior/IMG_1954.PNG",  alt: "Red BMW X1 — front view after exterior detail" },
  { id: 5,  category: "exterior", src: "/images/exterior/IMG_1959.PNG",  alt: "Gray BMW iX — front end detailed and protected" },
  { id: 6,  category: "exterior", src: "/images/exterior/IMG_1942.PNG",  alt: "Black Silverado ZR2 — side profile, deep gloss finish" },
  { id: 7,  category: "exterior", src: "/images/exterior/IMG_1943.PNG",  alt: "Black Silverado ZR2 — rear view, clean and protected" },
  { id: 8,  category: "exterior", src: "/images/exterior/IMG_1932.PNG",  alt: "Silver Toyota Highlander — front detail completed" },
  { id: 9,  category: "exterior", src: "/images/exterior/IMG_1933.PNG",  alt: "Silver Toyota Highlander — side and rear, clean finish" },
  { id: 10, category: "exterior", src: "/images/exterior/IMG_1955.PNG",  alt: "Red BMW — rear view after exterior detail" },
  { id: 11, category: "exterior", src: "/images/exterior/IMG_1946.PNG",  alt: "White GMC Sierra — front detail, fresh sealant applied" },
  { id: 12, category: "exterior", src: "/images/exterior/IMG_1947.PNG",  alt: "White GMC Sierra — front angle after exterior detail" },
  { id: 13, category: "exterior", src: "/images/exterior/IMG_1940.PNG",  alt: "Black Ford F-150 — front end detailed on location" },
  { id: 14, category: "exterior", src: "/images/exterior/IMG_2525.jpeg", alt: "Vehicle exterior — clean protected finish" },
  { id: 15, category: "exterior", src: "/images/exterior/IMG_2542.jpeg", alt: "Full exterior detail completed on the driveway" },
  { id: 16, category: "exterior", src: "/images/exterior/IMG_2841.jpeg", alt: "Exterior detail — paint sealant applied" },
  { id: 17, category: "exterior", src: "/images/exterior/IMG_3235.jpeg", alt: "Exterior wash completed — clean body panels" },
  { id: 18, category: "exterior", src: "/images/exterior/IMG_3584.jpeg", alt: "Blue Ford truck — foam pre-wash in progress" },
  { id: 19, category: "exterior", src: "/images/exterior/IMG_3667.jpeg", alt: "Truck exterior — foam and hand wash on location" },
  { id: 20, category: "exterior", src: "/images/exterior/IMG_3777.jpeg", alt: "Exterior detail finished — clean and ready" },
  { id: 21, category: "exterior", src: "/images/exterior/IMG_4585.jpeg", alt: "White Lincoln Navigator — foam wash on the driveway" },
  { id: 22, category: "exterior", src: "/images/exterior/IMG_4671.jpeg", alt: "Exterior after hand wash and protective sealant" },
  { id: 23, category: "exterior", src: "/images/exterior/IMG_6035.jpeg", alt: "Blue Ford truck — clean front grille after full exterior detail" },
  { id: 24, category: "exterior", src: "/images/exterior/IMG_6057.jpeg", alt: "Truck exterior — side panels washed and protected" },
];

// ── Interior — clean/after shots only ────────────────────────────────────────
const interiorPhotos: GalleryItem[] = [
  { id: 101, category: "interior", src: "/images/interior/IMG_1961.PNG",  alt: "Ford F-150 — tan cognac leather rear seats cleaned and conditioned" },
  { id: 102, category: "interior", src: "/images/interior/IMG_3980.PNG",  alt: "BMW iX — gray diamond-stitch leather interior fully detailed" },
  { id: 103, category: "interior", src: "/images/interior/IMG_3675.jpeg", alt: "Camaro SS — steering wheel and red sport leather seats detailed" },
  { id: 104, category: "interior", src: "/images/interior/IMG_2748.jpeg", alt: "BMW — white leather seats, door panel, and console detailed" },
  { id: 105, category: "interior", src: "/images/interior/IMG_2749.jpeg", alt: "BMW — clean white leather cabin after interior detail" },
  { id: 106, category: "interior", src: "/images/interior/IMG_0368.jpeg", alt: "Lincoln — tan leather seats and spotless carpet after interior detail" },
  { id: 107, category: "interior", src: "/images/interior/IMG_0370.jpeg", alt: "Lincoln — full cabin view, leather conditioned and surfaces cleaned" },
  { id: 108, category: "interior", src: "/images/interior/IMG_0373.jpeg", alt: "Lincoln — rear seat area and center console detailed" },
  { id: 109, category: "interior", src: "/images/interior/IMG_2374.jpeg", alt: "Gray quilted leather seats and center console after interior detail" },
  { id: 110, category: "interior", src: "/images/interior/IMG_2526.jpeg", alt: "Land Rover Defender — gray leather seats and console cleaned" },
  { id: 111, category: "interior", src: "/images/interior/IMG_3983.jpeg", alt: "Land Rover Defender — dashboard, vents, and carpet cleaned" },
  { id: 112, category: "interior", src: "/images/interior/IMG_3986.jpeg", alt: "Large SUV — full cargo area vacuumed and cleaned" },
  { id: 113, category: "interior", src: "/images/interior/IMG_6750.jpeg", alt: "GMC truck — black and orange leather interior detailed" },
  { id: 114, category: "interior", src: "/images/interior/IMG_5561.jpeg", alt: "Black convertible — interior seats and door panels cleaned" },
  { id: 115, category: "interior", src: "/images/interior/IMG_5567.jpeg", alt: "Dodge Charger — door sill and floor cleaned and treated" },
  { id: 116, category: "interior", src: "/images/interior/IMG_1930.PNG",  alt: "Ford Fusion — interior cleaned, surfaces treated and fresh" },
  { id: 117, category: "interior", src: "/images/interior/IMG_1949.PNG",  alt: "Dodge Charger — interior detailed and ready" },
];

// ── Before & After pairs ──────────────────────────────────────────────────────
const beforeAfterPairs: BeforeAfterPair[] = [
  {
    id: 1,
    label: "Interior Transformation",
    vehicle: "Ford Fusion",
    before: {
      src: "/images/interior/IMG_1929.PNG",
      alt: "Ford Fusion interior before — dirty floor mats, debris on carpet",
    },
    after: {
      src: "/images/interior/IMG_1930.PNG",
      alt: "Ford Fusion interior after — clean carpet, surfaces wiped and treated",
    },
  },
  {
    id: 2,
    label: "Interior Transformation",
    vehicle: "Dodge Charger",
    before: {
      src: "/images/interior/IMG_4666.jpeg",
      alt: "Dodge Charger interior before — debris on seats and floor",
    },
    after: {
      src: "/images/interior/IMG_1949.PNG",
      alt: "Dodge Charger interior after — clean, fresh, and fully detailed",
    },
  },
  {
    id: 3,
    label: "Interior Transformation",
    vehicle: "Sports Coupe",
    before: {
      src: "/images/interior/IMG_5529.jpeg",
      alt: "Sports coupe interior before — dusty seats and dirty surfaces",
    },
    after: {
      src: "/images/interior/IMG_5561.jpeg",
      alt: "Sports coupe interior after — seats cleaned and surfaces treated",
    },
  },
];

// ── Lightbox pool (exterior + interior, excludes before/after) ─────────────
const allGridPhotos = [...exteriorPhotos, ...interiorPhotos];

const tabs: { key: Category; label: string }[] = [
  { key: "all",          label: "All Work" },
  { key: "exterior",     label: "Exterior" },
  { key: "interior",     label: "Interior" },
  { key: "before-after", label: "Before & After" },
];

export default function GalleryPage() {
  const [active, setActive]     = useState<Category>("all");
  const [lightbox, setLightbox] = useState<number | null>(null);

  // Only exterior+interior go into the lightbox grid
  const filtered: GalleryItem[] =
    active === "all"          ? allGridPhotos :
    active === "exterior"     ? exteriorPhotos :
    active === "interior"     ? interiorPhotos :
    []; // before-after handled separately

  const open  = (id: number) => setLightbox(filtered.findIndex((p) => p.id === id));
  const close = () => setLightbox(null);
  const prev  = () => setLightbox((i) => ((i ?? 0) - 1 + filtered.length) % filtered.length);
  const next  = () => setLightbox((i) => ((i ?? 0) + 1) % filtered.length);
  const current = lightbox !== null ? filtered[lightbox] : null;

  const showExterior    = active === "all" || active === "exterior";
  const showInterior    = active === "all" || active === "interior";
  const showBeforeAfter = active === "all" || active === "before-after";

  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-navy pt-36 pb-20 px-6 text-center">
        <span className="label-tag">Gallery</span>
        <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-4">
          The results speak for themselves.
        </h1>
        <p className="text-xl text-white/60 max-w-xl mx-auto">
          Real vehicles. Real transformations. Every photo is a job completed
          right here in the Lakeland area.
        </p>
      </section>

      {/* ── Filter bar ── */}
      <div className="bg-white border-b border-apple-gray-2 sticky top-[72px] z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                active === tab.key
                  ? "bg-navy text-white shadow-sm"
                  : "bg-apple-gray text-apple-text-secondary border border-apple-gray-2 hover:text-apple-text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid sections ── */}
      <section className="bg-apple-gray py-10 px-6 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-16">

          {/* Exterior */}
          {showExterior && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-apple-text-primary">Exterior Details</h2>
                <p className="text-apple-text-secondary text-sm mt-1">
                  The shine and protection we deliver on every vehicle's exterior.
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {exteriorPhotos.map((photo) => (
                  <button
                    key={photo.id}
                    onClick={() => { setActive(active === "before-after" ? "exterior" : active); open(photo.id); }}
                    className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-navy/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/25 transition-all duration-300" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Interior */}
          {showInterior && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-apple-text-primary">Interior Details</h2>
                <p className="text-apple-text-secondary text-sm mt-1">
                  What a proper deep clean looks like on the inside.
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {interiorPhotos.map((photo) => (
                  <button
                    key={photo.id}
                    onClick={() => open(photo.id)}
                    className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-navy/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/25 transition-all duration-300" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Before & After */}
          {showBeforeAfter && (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-apple-text-primary">Before &amp; After</h2>
                <p className="text-apple-text-secondary text-sm mt-1">
                  See the difference a proper detail makes — same vehicle, same angle.
                </p>
              </div>

              <div className="space-y-6">
                {beforeAfterPairs.map((pair) => (
                  <div
                    key={pair.id}
                    className="bg-white rounded-3xl overflow-hidden border border-apple-gray-2 shadow-sm"
                  >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-apple-gray-2 flex items-center gap-3">
                      <span className="text-xs font-semibold uppercase tracking-widest text-gold">
                        {pair.label}
                      </span>
                      <span className="text-apple-text-tertiary text-xs">·</span>
                      <span className="text-sm font-medium text-apple-text-secondary">
                        {pair.vehicle}
                      </span>
                    </div>

                    {/* Side-by-side photos */}
                    <div className="grid grid-cols-2">
                      {/* Before */}
                      <div className="relative">
                        <div className="relative aspect-[4/3]">
                          <Image
                            src={pair.before.src}
                            alt={pair.before.alt}
                            fill
                            sizes="(max-width: 768px) 50vw, 600px"
                            className="object-cover"
                          />
                        </div>
                        <div className="absolute top-3 left-3">
                          <span className="bg-black/70 text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full backdrop-blur-sm">
                            Before
                          </span>
                        </div>
                      </div>

                      {/* After */}
                      <div className="relative border-l border-white/20">
                        <div className="relative aspect-[4/3]">
                          <Image
                            src={pair.after.src}
                            alt={pair.after.alt}
                            fill
                            sizes="(max-width: 768px) 50vw, 600px"
                            className="object-cover"
                          />
                        </div>
                        <div className="absolute top-3 left-3">
                          <span className="bg-gold text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                            After
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Caption */}
                    <div className="px-6 py-3 bg-apple-gray border-t border-apple-gray-2 text-xs text-apple-text-tertiary text-center">
                      {pair.vehicle} — {pair.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 bg-navy text-center">
        <h2 className="text-4xl font-bold text-white tracking-tight mb-4">
          Want results like these?
        </h2>
        <p className="text-white/60 mb-8">
          Book your detail today and see the transformation firsthand.
        </p>
        <Link href="/booking" className="btn-gold">
          Book Your Detail <ArrowRight size={16} />
        </Link>
      </section>

      {/* ── Lightbox ── */}
      {current && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={close}
        >
          <button
            className="absolute top-5 right-5 text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            onClick={close}
            aria-label="Close"
          >
            <X size={24} />
          </button>

          <button
            className="absolute left-4 md:left-6 text-white/60 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Previous"
          >
            <ChevronLeft size={28} />
          </button>

          <div
            className="relative w-full max-w-5xl mx-16 aspect-[4/3] rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={current.src}
              alt={current.alt}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>

          <button
            className="absolute right-4 md:right-6 text-white/60 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors"
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Next"
          >
            <ChevronRight size={28} />
          </button>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-center pointer-events-none">
            <p className="text-white/50 text-sm">{current.alt}</p>
            <p className="text-white/30 text-xs mt-1">
              {(lightbox ?? 0) + 1} / {filtered.length}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
