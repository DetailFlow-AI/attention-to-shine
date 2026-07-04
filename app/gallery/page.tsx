"use client";

// TASK 1 (Gallery: before & after photos as labeled side-by-side pairs) — DONE 2026-07-04

import { useState } from "react";
import Image from "next/image";

type Category = "all" | "exterior" | "interior";

interface BeforeAfterPair {
  id: number;
  category: "exterior" | "interior";
  before: string;
  after: string;
  caption: string;
}

interface GalleryItem {
  id: number;
  category: "exterior" | "interior";
  src: string;
  alt: string;
}

// Each pair is the same vehicle shot from the same angle — before on the left, after on the right.
const beforeAfterPairs: BeforeAfterPair[] = [
  {
    id: 1,
    category: "interior",
    before: "/images/interior/IMG_1929.PNG",
    after: "/images/interior/IMG_1930.PNG",
    caption: "Ford Fusion driver side — carpet & floor deep clean",
  },
  {
    id: 2,
    category: "interior",
    before: "/images/interior/IMG_5529.jpeg",
    after: "/images/interior/IMG_5567.jpeg",
    caption: "Dodge Challenger driver seat & floor — debris removal and shampoo",
  },
  {
    id: 3,
    category: "interior",
    before: "/images/interior/IMG_5540.jpeg",
    after: "/images/interior/IMG_5561.jpeg",
    caption: "Dodge Challenger driver footwell — floor mat & carpet restoration",
  },
  {
    id: 4,
    category: "interior",
    before: "/images/interior/IMG_4666.jpeg",
    after: "/images/interior/IMG_1949.PNG",
    caption: "Dodge Charger cockpit — full interior detail",
  },
  {
    id: 5,
    category: "interior",
    before: "/images/interior/IMG_2374.jpeg",
    after: "/images/interior/IMG_3980.PNG",
    caption: "BMW iX front cabin — decluttered and detailed",
  },
  {
    id: 6,
    category: "exterior",
    before: "/images/exterior/IMG_3667.jpeg",
    after: "/images/exterior/IMG_1963.PNG",
    caption: "Chevrolet Camaro SS — wash, decontamination & shine",
  },
  {
    id: 7,
    category: "exterior",
    before: "/images/exterior/IMG_3584.jpeg",
    after: "/images/exterior/IMG_6035.jpeg",
    caption: "Ford pickup — foam wash to finished shine",
  },
];

// Finished-result shots that don't have a matching before photo.
const exteriorPhotos: GalleryItem[] = [
  { id: 1, category: "exterior", src: "/images/exterior/IMG_1941.PNG", alt: "Lifted Ford Raptor front view after exterior detail" },
  { id: 3, category: "exterior", src: "/images/exterior/IMG_1956.PNG", alt: "White Lincoln Navigator after exterior detail" },
  { id: 4, category: "exterior", src: "/images/exterior/IMG_1954.PNG", alt: "Red BMW X1 front after exterior detail" },
  { id: 5, category: "exterior", src: "/images/exterior/IMG_1959.PNG", alt: "Gray BMW iX hood after exterior detail" },
  { id: 6, category: "exterior", src: "/images/exterior/IMG_1942.PNG", alt: "Lifted Ford Raptor side view after exterior detail" },
  { id: 7, category: "exterior", src: "/images/exterior/IMG_1943.PNG", alt: "Lifted Ford Raptor rear view after exterior detail" },
  { id: 8, category: "exterior", src: "/images/exterior/IMG_1932.PNG", alt: "Silver Toyota Highlander front after exterior detail" },
  { id: 9, category: "exterior", src: "/images/exterior/IMG_1933.PNG", alt: "Silver Toyota Highlander rear after exterior detail" },
  { id: 10, category: "exterior", src: "/images/exterior/IMG_1955.PNG", alt: "Red BMW X1 rear after exterior detail" },
  { id: 11, category: "exterior", src: "/images/exterior/IMG_1946.PNG", alt: "White GMC Sierra AT4 after exterior detail" },
  { id: 12, category: "exterior", src: "/images/exterior/IMG_1947.PNG", alt: "White GMC Sierra AT4 front after exterior detail" },
  { id: 13, category: "exterior", src: "/images/exterior/IMG_1940.PNG", alt: "Black Ford F-150 front after exterior detail" },
  { id: 14, category: "exterior", src: "/images/exterior/IMG_2525.jpeg", alt: "Land Rover Defender side profile after exterior detail" },
  { id: 15, category: "exterior", src: "/images/exterior/IMG_2542.jpeg", alt: "Land Rover Defender front after exterior detail" },
  { id: 16, category: "exterior", src: "/images/exterior/IMG_2841.jpeg", alt: "Classic Chevrolet truck after exterior detail" },
  { id: 17, category: "exterior", src: "/images/exterior/IMG_3235.jpeg", alt: "Black Ford F-150 after exterior detail" },
  { id: 20, category: "exterior", src: "/images/exterior/IMG_3777.jpeg", alt: "Camaro SS mid foam wash" },
  { id: 21, category: "exterior", src: "/images/exterior/IMG_4585.jpeg", alt: "White Lincoln Navigator front after exterior detail" },
  { id: 22, category: "exterior", src: "/images/exterior/IMG_4671.jpeg", alt: "White Dodge Charger after exterior detail" },
];

const interiorPhotos: GalleryItem[] = [
  { id: 101, category: "interior", src: "/images/interior/IMG_1961.PNG", alt: "Ford F-150 rear leather seats after interior detail" },
  { id: 103, category: "interior", src: "/images/interior/IMG_3675.jpeg", alt: "Camaro SS red leather interior after detail" },
  { id: 104, category: "interior", src: "/images/interior/IMG_2748.jpeg", alt: "BMW white leather interior after detail" },
  { id: 105, category: "interior", src: "/images/interior/IMG_2749.jpeg", alt: "BMW white leather seats after interior detail" },
  { id: 106, category: "interior", src: "/images/interior/IMG_0368.jpeg", alt: "Lincoln tan leather interior after detail" },
  { id: 107, category: "interior", src: "/images/interior/IMG_0370.jpeg", alt: "Lincoln interior carpet after detail" },
  { id: 108, category: "interior", src: "/images/interior/IMG_0373.jpeg", alt: "Lincoln rear seats after interior detail" },
  { id: 110, category: "interior", src: "/images/interior/IMG_2526.jpeg", alt: "Truck rear cab after interior detail" },
  { id: 111, category: "interior", src: "/images/interior/IMG_3983.jpeg", alt: "Land Rover Defender front cabin after interior detail" },
  { id: 112, category: "interior", src: "/images/interior/IMG_3986.jpeg", alt: "BMW iX cargo area freshly vacuumed" },
  { id: 114, category: "interior", src: "/images/interior/IMG_6750.jpeg", alt: "GMC AT4 leather interior after detail" },
];

const allPhotos: GalleryItem[] = [...exteriorPhotos, ...interiorPhotos];

const tabs: { key: Category; label: string }[] = [
  { key: "all", label: "All Work" },
  { key: "exterior", label: "Exterior" },
  { key: "interior", label: "Interior" },
];

export default function GalleryPage() {
  const [active, setActive] = useState<Category>("all");

  const filteredPairs: BeforeAfterPair[] =
    active === "all"
      ? beforeAfterPairs
      : beforeAfterPairs.filter((pair) => pair.category === active);

  const filtered: GalleryItem[] =
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

          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Before &amp; After
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {filteredPairs.map((pair) => (
              <div
                key={pair.id}
                className="rounded-2xl overflow-hidden bg-navy/5 shadow-md"
              >
                <div className="grid grid-cols-2 gap-1">
                  <div className="relative aspect-[3/4] bg-navy/10">
                    <Image
                      src={pair.before}
                      alt={`${pair.caption} — before`}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-navy/80 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
                      Before
                    </span>
                  </div>
                  <div className="relative aspect-[3/4] bg-navy/10">
                    <Image
                      src={pair.after}
                      alt={`${pair.caption} — after`}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover"
                    />
                    <span className="absolute top-3 right-3 bg-gold/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
                      After
                    </span>
                  </div>
                </div>
                <p className="text-sm font-medium text-navy px-4 py-3 text-center">
                  {pair.caption}
                </p>
              </div>
            ))}
          </div>

          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            More of Our Work
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((photo) => (
              <div
                key={photo.id}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-navy/10"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
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
