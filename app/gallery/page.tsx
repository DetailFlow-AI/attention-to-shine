/* TASK 1 (Gallery: before & after photo pairs): DONE 2026-07-02 */
"use client";

import { useState } from "react";
import Image from "next/image";

type Category = "all" | "exterior" | "interior";

interface BeforeAfterPair {
  id: number;
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

// Each pair is the same vehicle, same area, shot before and after the detail.
const beforeAfterPairs: BeforeAfterPair[] = [
  {
    id: 1,
    title: "Sedan Interior — Driver's Side Deep Clean",
    before: "/images/interior/IMG_1929.PNG",
    after: "/images/interior/IMG_1930.PNG",
  },
  {
    id: 2,
    title: "Coupe Interior — Passenger Footwell Restoration",
    before: "/images/interior/IMG_5529.jpeg",
    after: "/images/interior/IMG_5561.jpeg",
  },
  {
    id: 3,
    title: "Coupe Interior — Driver's Footwell Restoration",
    before: "/images/interior/IMG_5540.jpeg",
    after: "/images/interior/IMG_5567.jpeg",
  },
  {
    id: 4,
    title: "Sedan Interior — Full Cabin Refresh",
    before: "/images/interior/IMG_4666.jpeg",
    after: "/images/interior/IMG_1949.PNG",
  },
];

const exteriorPhotos: GalleryItem[] = [
  { id: 1, category: "exterior", src: "/images/exterior/IMG_1941.PNG", alt: "Black lifted pickup truck, front view after detail" },
  { id: 2, category: "exterior", src: "/images/exterior/IMG_1963.PNG", alt: "White Camaro SS front three-quarter view after detail" },
  { id: 3, category: "exterior", src: "/images/exterior/IMG_1956.PNG", alt: "White luxury SUV front three-quarter view after detail" },
  { id: 4, category: "exterior", src: "/images/exterior/IMG_1954.PNG", alt: "Red compact SUV front view after detail" },
  { id: 5, category: "exterior", src: "/images/exterior/IMG_1959.PNG", alt: "Gray electric SUV front view after detail" },
  { id: 6, category: "exterior", src: "/images/exterior/IMG_1942.PNG", alt: "Black lifted pickup truck, side view after detail" },
  { id: 7, category: "exterior", src: "/images/exterior/IMG_1943.PNG", alt: "Black lifted pickup truck, rear three-quarter view after detail" },
  { id: 8, category: "exterior", src: "/images/exterior/IMG_1932.PNG", alt: "Silver SUV front view after detail" },
  { id: 9, category: "exterior", src: "/images/exterior/IMG_1933.PNG", alt: "Silver SUV rear three-quarter view after detail" },
  { id: 10, category: "exterior", src: "/images/exterior/IMG_1955.PNG", alt: "Red compact SUV rear view after detail" },
  { id: 11, category: "exterior", src: "/images/exterior/IMG_1946.PNG", alt: "White pickup truck front view after detail" },
  { id: 12, category: "exterior", src: "/images/exterior/IMG_1947.PNG", alt: "White pickup truck hood and grille after detail" },
  { id: 13, category: "exterior", src: "/images/exterior/IMG_1940.PNG", alt: "Black pickup truck front view after detail" },
  { id: 14, category: "exterior", src: "/images/exterior/IMG_2525.jpeg", alt: "Gray SUV side profile after detail" },
  { id: 15, category: "exterior", src: "/images/exterior/IMG_2542.jpeg", alt: "Gray SUV front view after detail" },
  { id: 16, category: "exterior", src: "/images/exterior/IMG_2841.jpeg", alt: "Classic white truck front view after detail" },
  { id: 17, category: "exterior", src: "/images/exterior/IMG_3235.jpeg", alt: "Black pickup truck grille close-up after detail" },
  { id: 18, category: "exterior", src: "/images/exterior/IMG_3584.jpeg", alt: "Blue pickup truck covered in foam during wash" },
  { id: 19, category: "exterior", src: "/images/exterior/IMG_3667.jpeg", alt: "White Camaro SS front view after detail" },
  { id: 20, category: "exterior", src: "/images/exterior/IMG_3777.jpeg", alt: "White Camaro covered in foam during wash" },
  { id: 21, category: "exterior", src: "/images/exterior/IMG_4585.jpeg", alt: "White luxury SUV front view after detail" },
  { id: 22, category: "exterior", src: "/images/exterior/IMG_4671.jpeg", alt: "White muscle car front view after detail" },
  { id: 23, category: "exterior", src: "/images/exterior/IMG_6035.jpeg", alt: "Blue pickup truck front view after detail" },
  { id: 24, category: "exterior", src: "/images/exterior/IMG_6057.jpeg", alt: "Red sedan front three-quarter view" },
];

const interiorPhotos: GalleryItem[] = [
  { id: 101, category: "interior", src: "/images/interior/IMG_1961.PNG", alt: "Truck rear seats and floor liner after interior detail" },
  { id: 102, category: "interior", src: "/images/interior/IMG_3980.PNG", alt: "Quilted leather seats after interior detail" },
  { id: 103, category: "interior", src: "/images/interior/IMG_3675.jpeg", alt: "Red and black sports car interior after detail" },
  { id: 104, category: "interior", src: "/images/interior/IMG_2748.jpeg", alt: "White leather interior, driver's side after detail" },
  { id: 105, category: "interior", src: "/images/interior/IMG_2749.jpeg", alt: "White leather interior, front cabin after detail" },
  { id: 106, category: "interior", src: "/images/interior/IMG_0368.jpeg", alt: "Luxury SUV driver's footwell after interior detail" },
  { id: 107, category: "interior", src: "/images/interior/IMG_0370.jpeg", alt: "Luxury SUV front cabin after interior detail" },
  { id: 108, category: "interior", src: "/images/interior/IMG_0373.jpeg", alt: "Luxury SUV rear seats after interior detail" },
  { id: 109, category: "interior", src: "/images/interior/IMG_2374.jpeg", alt: "Gray quilted leather front seats after detail" },
  { id: 110, category: "interior", src: "/images/interior/IMG_2526.jpeg", alt: "Truck rear cabin after interior detail" },
  { id: 111, category: "interior", src: "/images/interior/IMG_3983.jpeg", alt: "SUV dashboard and front cabin after detail" },
  { id: 112, category: "interior", src: "/images/interior/IMG_3986.jpeg", alt: "SUV cargo area freshly vacuumed" },
  { id: 113, category: "interior", src: "/images/interior/IMG_6750.jpeg", alt: "Truck interior with leather seats after detail" },
];

const allPhotos: GalleryItem[] = [...exteriorPhotos, ...interiorPhotos];

const tabs: { key: Category; label: string }[] = [
  { key: "all", label: "All Work" },
  { key: "exterior", label: "Exterior" },
  { key: "interior", label: "Interior" },
];

export default function GalleryPage() {
  const [active, setActive] = useState<Category>("all");

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

      {/* ── BEFORE & AFTER PAIRS ── */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="label-tag">Before &amp; After</span>
            <h2 className="text-4xl md:text-5xl font-bold text-navy tracking-tight mb-3">
              Same vehicle. Same angle. Different story.
            </h2>
            <p className="text-lg text-navy/60 max-w-2xl mx-auto">
              Each pair below shows the exact same vehicle before we started and
              after we finished. Before on the left, after on the right.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {beforeAfterPairs.map((pair) => (
              <div key={pair.id}>
                <div className="grid grid-cols-2 gap-2">
                  {/* Before — left */}
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-navy/10 shadow-lg">
                    <Image
                      src={pair.before}
                      alt={`${pair.title} — before detailing`}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-navy/85 text-white text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full backdrop-blur-sm">
                      Before
                    </span>
                  </div>
                  {/* After — right */}
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-navy/10 shadow-lg">
                    <Image
                      src={pair.after}
                      alt={`${pair.title} — after detailing`}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover"
                    />
                    <span className="absolute top-3 right-3 bg-gold text-navy text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full">
                      After
                    </span>
                  </div>
                </div>
                <p className="text-navy font-semibold text-center mt-4">
                  {pair.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FULL PORTFOLIO GRID ── */}
      <section className="bg-white pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-navy tracking-tight">
              More of our work
            </h2>
          </div>

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
