"use client";

// TASK 1 (Gallery: Before & After matched pairs) — DONE 2026-07-05

import { useState } from "react";
import Image from "next/image";

type Category = "all" | "exterior" | "interior";

interface BeforeAfterPair {
  id: string;
  category: "exterior" | "interior";
  title: string;
  before: string;
  after: string;
}

interface GalleryItem {
  id: number;
  category: "exterior" | "interior";
  src: string;
  alt: string;
}

// Each pair is the same vehicle photographed from the same angle —
// left image is the vehicle before detailing, right image is after.
const beforeAfterPairs: BeforeAfterPair[] = [
  {
    id: "fusion-interior",
    category: "interior",
    title: "Sedan Interior Deep Clean — Lakeland, FL",
    before: "/images/interior/IMG_1929.PNG",
    after: "/images/interior/IMG_1930.PNG",
  },
  {
    id: "challenger-seat",
    category: "interior",
    title: "Challenger Seats & Carpet Revival — Lakeland, FL",
    before: "/images/interior/IMG_5529.jpeg",
    after: "/images/interior/IMG_5561.jpeg",
  },
  {
    id: "challenger-floor",
    category: "interior",
    title: "Challenger Floor & Door Sill Detail — Lakeland, FL",
    before: "/images/interior/IMG_5540.jpeg",
    after: "/images/interior/IMG_5567.jpeg",
  },
  {
    id: "maverick-exterior",
    category: "exterior",
    title: "Ford Maverick Exterior Wash & Shine — Lakeland, FL",
    before: "/images/exterior/IMG_3584.jpeg",
    after: "/images/exterior/IMG_6035.jpeg",
  },
  {
    id: "camaro-exterior",
    category: "exterior",
    title: "Camaro SS Foam Wash & Finish — Lakeland, FL",
    before: "/images/exterior/IMG_3777.jpeg",
    after: "/images/exterior/IMG_3667.jpeg",
  },
  {
    id: "navigator-exterior",
    category: "exterior",
    title: "Lincoln Navigator Full Exterior Detail — Lakeland, FL",
    before: "/images/exterior/IMG_4585.jpeg",
    after: "/images/exterior/IMG_1956.PNG",
  },
];

// Finished-result photos that don't have a matching "before" shot.
const exteriorPhotos: GalleryItem[] = [
  { id: 1, category: "exterior", src: "/images/exterior/IMG_1941.PNG", alt: "Exterior detail 1" },
  { id: 2, category: "exterior", src: "/images/exterior/IMG_1963.PNG", alt: "Exterior detail 2" },
  { id: 4, category: "exterior", src: "/images/exterior/IMG_1954.PNG", alt: "Exterior detail 4" },
  { id: 5, category: "exterior", src: "/images/exterior/IMG_1959.PNG", alt: "Exterior detail 5" },
  { id: 6, category: "exterior", src: "/images/exterior/IMG_1942.PNG", alt: "Exterior detail 6" },
  { id: 7, category: "exterior", src: "/images/exterior/IMG_1943.PNG", alt: "Exterior detail 7" },
  { id: 8, category: "exterior", src: "/images/exterior/IMG_1932.PNG", alt: "Exterior detail 8" },
  { id: 9, category: "exterior", src: "/images/exterior/IMG_1933.PNG", alt: "Exterior detail 9" },
  { id: 10, category: "exterior", src: "/images/exterior/IMG_1955.PNG", alt: "Exterior detail 10" },
  { id: 11, category: "exterior", src: "/images/exterior/IMG_1946.PNG", alt: "Exterior detail 11" },
  { id: 12, category: "exterior", src: "/images/exterior/IMG_1947.PNG", alt: "Exterior detail 12" },
  { id: 13, category: "exterior", src: "/images/exterior/IMG_1940.PNG", alt: "Exterior detail 13" },
  { id: 14, category: "exterior", src: "/images/exterior/IMG_2525.jpeg", alt: "Exterior detail 14" },
  { id: 15, category: "exterior", src: "/images/exterior/IMG_2542.jpeg", alt: "Exterior detail 15" },
  { id: 16, category: "exterior", src: "/images/exterior/IMG_2841.jpeg", alt: "Exterior detail 16" },
  { id: 17, category: "exterior", src: "/images/exterior/IMG_3235.jpeg", alt: "Exterior detail 17" },
  { id: 22, category: "exterior", src: "/images/exterior/IMG_4671.jpeg", alt: "Exterior detail 22" },
  { id: 24, category: "exterior", src: "/images/exterior/IMG_6057.jpeg", alt: "Exterior detail 24" },
];

const interiorPhotos: GalleryItem[] = [
  { id: 101, category: "interior", src: "/images/interior/IMG_1961.PNG", alt: "Interior detail 1" },
  { id: 102, category: "interior", src: "/images/interior/IMG_3980.PNG", alt: "Interior detail 2" },
  { id: 103, category: "interior", src: "/images/interior/IMG_3675.jpeg", alt: "Interior detail 3" },
  { id: 104, category: "interior", src: "/images/interior/IMG_2748.jpeg", alt: "Interior detail 4" },
  { id: 105, category: "interior", src: "/images/interior/IMG_2749.jpeg", alt: "Interior detail 5" },
  { id: 106, category: "interior", src: "/images/interior/IMG_0368.jpeg", alt: "Interior detail 6" },
  { id: 107, category: "interior", src: "/images/interior/IMG_0370.jpeg", alt: "Interior detail 7" },
  { id: 108, category: "interior", src: "/images/interior/IMG_0373.jpeg", alt: "Interior detail 8" },
  { id: 109, category: "interior", src: "/images/interior/IMG_2374.jpeg", alt: "Interior detail 9" },
  { id: 110, category: "interior", src: "/images/interior/IMG_2526.jpeg", alt: "Interior detail 10" },
  { id: 111, category: "interior", src: "/images/interior/IMG_3983.jpeg", alt: "Interior detail 11" },
  { id: 112, category: "interior", src: "/images/interior/IMG_3986.jpeg", alt: "Interior detail 12" },
  { id: 113, category: "interior", src: "/images/interior/IMG_4666.jpeg", alt: "Interior detail 13" },
  { id: 118, category: "interior", src: "/images/interior/IMG_1949.PNG", alt: "Interior detail 18" },
  { id: 119, category: "interior", src: "/images/interior/IMG_6750.jpeg", alt: "Interior detail 19" },
];

const allPhotos: GalleryItem[] = [...exteriorPhotos, ...interiorPhotos];

const tabs: { key: Category; label: string }[] = [
  { key: "all", label: "All Work" },
  { key: "exterior", label: "Exterior" },
  { key: "interior", label: "Interior" },
];

function PairImage({
  src,
  label,
  title,
}: {
  src: string;
  label: "Before" | "After";
  title: string;
}) {
  return (
    <div className="relative aspect-[3/4] overflow-hidden bg-navy/10">
      <Image
        src={src}
        alt={`${title} — ${label.toLowerCase()} detailing`}
        fill
        sizes="(max-width: 768px) 50vw, 33vw"
        className="object-cover"
      />
      <span
        className={`absolute top-3 left-3 text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none ${
          label === "Before" ? "bg-navy/80 text-white" : "bg-gold/90 text-navy"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

export default function GalleryPage() {
  const [active, setActive] = useState<Category>("all");

  const filteredPairs: BeforeAfterPair[] =
    active === "all"
      ? beforeAfterPairs
      : beforeAfterPairs.filter((p) => p.category === active);

  const filteredPhotos: GalleryItem[] =
    active === "all"
      ? allPhotos
      : active === "exterior"
      ? exteriorPhotos
      : interiorPhotos;

  return (
    <>
      <section className="bg-navy pt-36 pb-20 px-6 text-center">
        <span className="label-tag">Gallery</span>
        <h1 className="text-6xl md:text-6xl font-bold text-white tracking-tight mb-4">
          The results speak for themselves.
        </h1>
        <p className="text-xl text-white/60 max-w-xl mx-auto">
          Real vehicles. Real transformations. Every photo is a job completed right here in the Lakeland area.
        </p>
      </section>

      <section className="bg-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-3 mb-10 justify-center flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActive(tab.key)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
                  active === tab.key
                    ? "bg-gold text-navy"
                    : "bg-navy/10 text-navy hover:bg-navy/20"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Before & After — matched pairs, same vehicle and angle */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-navy tracking-tight">
              Before &amp; After
            </h2>
            <p className="text-navy/60 mt-2">
              Same vehicle, same angle — before on the left, after on the right.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {filteredPairs.map((pair) => (
              <div
                key={pair.id}
                className="rounded-2xl overflow-hidden shadow-lg bg-white border border-navy/10"
              >
                <div className="grid grid-cols-2 gap-1">
                  <PairImage src={pair.before} label="Before" title={pair.title} />
                  <PairImage src={pair.after} label="After" title={pair.title} />
                </div>
                <p className="text-sm font-semibold text-navy text-center py-3 px-4">
                  {pair.title}
                </p>
              </div>
            ))}
          </div>

          {/* Finished results without a matching before shot */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-navy tracking-tight">
              More Finished Results
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-navy/10"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
