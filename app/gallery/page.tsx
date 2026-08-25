"use client";

import { useState } from "react";
import Image from "next/image";

type Category = "all" | "exterior" | "interior";

interface AfterShot {
  id: number;
  category: "exterior" | "interior";
  label: string;
  src: string;
}

interface GalleryItem {
  id: number;
  category: "exterior" | "interior";
  src: string;
  alt: string;
}

// The finished result from each before/after pair we shoot. Only the "after"
// frame is shown here — the draggable before/after comparisons live on the
// homepage. Labels describe the service and the vehicle in the shot.
const afterShots: AfterShot[] = [
  {
    id: 1,
    category: "exterior",
    label: "After — Exterior Detail, Range Rover",
    src: "/images/before-after/Slider2-after.jpg",
  },
  {
    id: 2,
    category: "exterior",
    label: "After — Full Detail, Ford Raptor",
    src: "/images/before-after/Slider3-after.jpg",
  },
  {
    id: 3,
    category: "exterior",
    label: "After — Exterior Detail, Chevrolet Camaro SS",
    src: "/images/exterior/IMG_3667.jpeg",
  },
  {
    id: 4,
    category: "exterior",
    label: "After — Exterior Detail, Ford Maverick",
    src: "/images/exterior/IMG_6035.jpeg",
  },
  {
    id: 5,
    category: "interior",
    label: "After — Interior Deep Clean, Lincoln Navigator",
    src: "/images/before-after/Slider4-after.jpg",
  },
  {
    id: 6,
    category: "interior",
    label: "After — Interior Deep Clean, Dodge Challenger",
    src: "/images/before-after/Slider1-after.jpg",
  },
  {
    id: 7,
    category: "interior",
    label: "After — Interior Floor & Sill Detail, Dodge Challenger",
    src: "/images/interior/IMG_5567.jpeg",
  },
];

const morePhotos: GalleryItem[] = [
  { id: 1, category: "exterior", src: "/images/exterior/IMG_1941.PNG", alt: "Exterior detail 1" },
  { id: 2, category: "exterior", src: "/images/exterior/IMG_1963.PNG", alt: "Exterior detail 2" },
  { id: 3, category: "exterior", src: "/images/exterior/IMG_1956.PNG", alt: "Exterior detail 3" },
  { id: 4, category: "exterior", src: "/images/exterior/IMG_1954.PNG", alt: "Exterior detail 4" },
  { id: 5, category: "exterior", src: "/images/exterior/IMG_1959.PNG", alt: "Exterior detail 5" },
  { id: 7, category: "exterior", src: "/images/exterior/IMG_1943.PNG", alt: "Exterior detail 7" },
  { id: 11, category: "exterior", src: "/images/exterior/IMG_1946.PNG", alt: "Exterior detail 11" },
  { id: 14, category: "exterior", src: "/images/exterior/IMG_2841.jpeg", alt: "Exterior detail 14" },
  { id: 15, category: "exterior", src: "/images/exterior/IMG_3235.jpeg", alt: "Exterior detail 15" },
  { id: 16, category: "exterior", src: "/images/exterior/IMG_4585.jpeg", alt: "Exterior detail 16" },
  { id: 17, category: "exterior", src: "/images/exterior/IMG_4671.jpeg", alt: "Exterior detail 17" },
  { id: 18, category: "exterior", src: "/images/exterior/IMG_6057.jpeg", alt: "Exterior detail 18" },
  { id: 101, category: "interior", src: "/images/interior/IMG_1961.PNG", alt: "Interior detail 1" },
  { id: 102, category: "interior", src: "/images/interior/IMG_3675.jpeg", alt: "Interior detail 2" },
  { id: 104, category: "interior", src: "/images/interior/IMG_2749.jpeg", alt: "Interior detail 4" },
  { id: 107, category: "interior", src: "/images/interior/IMG_0373.jpeg", alt: "Interior detail 7" },
];

const tabs: { key: Category; label: string }[] = [
  { key: "all", label: "All Work" },
  { key: "exterior", label: "Exterior" },
  { key: "interior", label: "Interior" },
];

export default function GalleryPage() {
  const [active, setActive] = useState<Category>("all");

  const filteredShots =
    active === "all"
      ? afterShots
      : afterShots.filter((p) => p.category === active);

  const filteredPhotos =
    active === "all"
      ? morePhotos
      : morePhotos.filter((p) => p.category === active);

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

          {/* Finished results — the "after" frame from each transformation */}
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            The Finished Result
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {filteredShots.map((shot) => (
              <div key={shot.id}>
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg bg-navy/10">
                  <Image
                    src={shot.src}
                    alt={shot.label}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-gold/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none">
                    After
                  </span>
                </div>
                <p className="text-center text-sm font-medium text-navy/70 mt-3">
                  {shot.label}
                </p>
              </div>
            ))}
          </div>

          {/* Remaining single shots */}
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            More of Our Work
          </h2>
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
