"use client";

// TASK 1 — GALLERY BEFORE & AFTER PAIRS: DONE 2026-07-02

import { useState } from "react";
import Image from "next/image";

type Category = "all" | "exterior" | "interior";

interface BeforeAfterPair {
  id: number;
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
// left image is before the detail, right image is after.
const beforeAfterPairs: BeforeAfterPair[] = [
  {
    id: 1,
    category: "exterior",
    title: "Chevrolet Camaro SS — Exterior Detail",
    before: "/images/exterior/IMG_3777.jpeg",
    after: "/images/exterior/IMG_1963.PNG",
  },
  {
    id: 2,
    category: "exterior",
    title: "Ford Maverick — Foam Wash & Exterior Detail",
    before: "/images/exterior/IMG_3584.jpeg",
    after: "/images/exterior/IMG_6035.jpeg",
  },
  {
    id: 3,
    category: "exterior",
    title: "Ford F-150 — Full Exterior Detail",
    before: "/images/exterior/IMG_1940.PNG",
    after: "/images/exterior/IMG_3235.jpeg",
  },
  {
    id: 4,
    category: "exterior",
    title: "GMC Sierra AT4 — Exterior Wash & Detail",
    before: "/images/exterior/IMG_1947.PNG",
    after: "/images/exterior/IMG_1946.PNG",
  },
  {
    id: 5,
    category: "interior",
    title: "Sedan — Interior Deep Clean",
    before: "/images/interior/IMG_1929.PNG",
    after: "/images/interior/IMG_1930.PNG",
  },
  {
    id: 6,
    category: "interior",
    title: "Dodge Challenger — Seat Shampoo & Interior Detail",
    before: "/images/interior/IMG_5529.jpeg",
    after: "/images/interior/IMG_5561.jpeg",
  },
  {
    id: 7,
    category: "interior",
    title: "Dodge Challenger — Door Jamb & Carpet Deep Clean",
    before: "/images/interior/IMG_5540.jpeg",
    after: "/images/interior/IMG_5567.jpeg",
  },
  {
    id: 8,
    category: "interior",
    title: "Dodge Charger — Interior Refresh",
    before: "/images/interior/IMG_1949.PNG",
    after: "/images/interior/IMG_4666.jpeg",
  },
];

// Finished-result shots that don't have a matching "before" photo.
const morePhotos: GalleryItem[] = [
  { id: 1, category: "exterior", src: "/images/exterior/IMG_1941.PNG", alt: "Black Ford truck after exterior detail" },
  { id: 2, category: "exterior", src: "/images/exterior/IMG_1932.PNG", alt: "Silver SUV front after exterior detail" },
  { id: 3, category: "exterior", src: "/images/exterior/IMG_1933.PNG", alt: "Silver SUV rear after exterior detail" },
  { id: 4, category: "exterior", src: "/images/exterior/IMG_1942.PNG", alt: "Lifted black truck side after detail" },
  { id: 5, category: "exterior", src: "/images/exterior/IMG_1943.PNG", alt: "Lifted black truck rear after detail" },
  { id: 6, category: "exterior", src: "/images/exterior/IMG_1954.PNG", alt: "Red BMW front after exterior detail" },
  { id: 7, category: "exterior", src: "/images/exterior/IMG_1955.PNG", alt: "Red BMW rear after exterior detail" },
  { id: 8, category: "exterior", src: "/images/exterior/IMG_1956.PNG", alt: "White Lincoln Navigator after detail" },
  { id: 9, category: "exterior", src: "/images/exterior/IMG_1959.PNG", alt: "White BMW front after exterior detail" },
  { id: 10, category: "exterior", src: "/images/exterior/IMG_2525.jpeg", alt: "Land Rover Defender side after detail" },
  { id: 11, category: "exterior", src: "/images/exterior/IMG_2542.jpeg", alt: "Land Rover Defender front after detail" },
  { id: 12, category: "exterior", src: "/images/exterior/IMG_2841.jpeg", alt: "Classic Chevrolet truck after detail" },
  { id: 13, category: "exterior", src: "/images/exterior/IMG_3667.jpeg", alt: "White Camaro SS front after wash" },
  { id: 14, category: "exterior", src: "/images/exterior/IMG_4585.jpeg", alt: "White Lincoln Navigator front after detail" },
  { id: 15, category: "exterior", src: "/images/exterior/IMG_4671.jpeg", alt: "Dodge Charger Daytona after exterior detail" },
  { id: 16, category: "exterior", src: "/images/exterior/IMG_6057.jpeg", alt: "Red Toyota Sienna after exterior detail" },
  { id: 101, category: "interior", src: "/images/interior/IMG_1961.PNG", alt: "Truck interior with leather seats after detail" },
  { id: 102, category: "interior", src: "/images/interior/IMG_3980.PNG", alt: "BMW interior after detail" },
  { id: 103, category: "interior", src: "/images/interior/IMG_3675.jpeg", alt: "Camaro interior with red leather after detail" },
  { id: 104, category: "interior", src: "/images/interior/IMG_2748.jpeg", alt: "BMW X1 interior after detail" },
  { id: 105, category: "interior", src: "/images/interior/IMG_2749.jpeg", alt: "BMW X1 dashboard after detail" },
  { id: 106, category: "interior", src: "/images/interior/IMG_0368.jpeg", alt: "Lincoln floor mats after interior detail" },
  { id: 107, category: "interior", src: "/images/interior/IMG_0370.jpeg", alt: "Lincoln front interior after detail" },
  { id: 108, category: "interior", src: "/images/interior/IMG_0373.jpeg", alt: "Lincoln leather seats after detail" },
  { id: 109, category: "interior", src: "/images/interior/IMG_2374.jpeg", alt: "BMW quilted seats after interior detail" },
  { id: 110, category: "interior", src: "/images/interior/IMG_2526.jpeg", alt: "BMW seat detail after interior clean" },
  { id: 111, category: "interior", src: "/images/interior/IMG_3983.jpeg", alt: "Land Rover Defender interior after detail" },
  { id: 112, category: "interior", src: "/images/interior/IMG_3986.jpeg", alt: "Cargo area after interior detail" },
  { id: 113, category: "interior", src: "/images/interior/IMG_6750.jpeg", alt: "GMC Sierra interior after detail" },
];

const tabs: { key: Category; label: string }[] = [
  { key: "all", label: "All Work" },
  { key: "exterior", label: "Exterior" },
  { key: "interior", label: "Interior" },
];

export default function GalleryPage() {
  const [active, setActive] = useState<Category>("all");

  const filteredPairs =
    active === "all"
      ? beforeAfterPairs
      : beforeAfterPairs.filter((pair) => pair.category === active);

  const filteredPhotos =
    active === "all"
      ? morePhotos
      : morePhotos.filter((photo) => photo.category === active);

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

          {/* ── BEFORE & AFTER PAIRS ── */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-navy tracking-tight mb-2">
              Before &amp; After
            </h2>
            <p className="text-navy/60">
              Same vehicle, same angle — before on the left, after on the right.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {filteredPairs.map((pair) => (
              <div key={pair.id}>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-navy/10">
                    <Image
                      src={pair.before}
                      alt={`${pair.title} — before`}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-navy/85 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
                      Before
                    </span>
                  </div>
                  <div className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-navy/10">
                    <Image
                      src={pair.after}
                      alt={`${pair.title} — after`}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover"
                    />
                    <span className="absolute top-3 right-3 bg-gold/90 text-navy text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
                      After
                    </span>
                  </div>
                </div>
                <p className="text-center text-sm font-medium text-navy/70 mt-3">
                  {pair.title}
                </p>
              </div>
            ))}
          </div>

          {/* ── MORE FINISHED WORK ── */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-navy tracking-tight mb-2">
              More From Our Work
            </h2>
            <p className="text-navy/60">
              Finished results from recent details around Lakeland.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPhotos.map((photo) => (
              <div
                key={`${photo.category}-${photo.id}`}
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
