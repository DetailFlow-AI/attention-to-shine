"use client";

import { useState } from "react";
import Image from "next/image";

type Category = "all" | "beforeafter" | "exterior" | "interior";

interface GalleryItem {
  id: number;
  category: "exterior" | "interior";
  src: string;
  alt: string;
}

// TASK 2 — DONE 2026-06-20: matched before/after pairs.
// Each entry is one vehicle shot from the same angle before and after our
// detail. Left = before, Right = after.
//
// NOTE FOR OWNER: only the two pairs below are confirmed matched before/after
// shots (the same ones used on the homepage). To add more, drop the matching
// "before" and "after" image paths here — every other photo in the gallery is a
// single completed result, not a verified before/after pair, so it would be
// misleading to auto-pair them.
interface BeforeAfterPair {
  id: number;
  title: string;
  before: string;
  after: string;
}

const beforeAfterPairs: BeforeAfterPair[] = [
  {
    id: 1,
    title: "Sedan Interior Detail — Lakeland, FL",
    before: "/images/interior/IMG_1929.PNG",
    after: "/images/interior/IMG_1930.PNG",
  },
  {
    id: 2,
    title: "Interior Deep Clean — Lakeland, FL",
    before: "/images/interior/IMG_5529.jpeg",
    after: "/images/interior/IMG_5567.jpeg",
  },
];

const exteriorPhotos: GalleryItem[] = [
  { id: 1, category: "exterior", src: "/images/exterior/IMG_1941.PNG", alt: "Exterior detail 1" },
  { id: 2, category: "exterior", src: "/images/exterior/IMG_1963.PNG", alt: "Exterior detail 2" },
  { id: 3, category: "exterior", src: "/images/exterior/IMG_1956.PNG", alt: "Exterior detail 3" },
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
  { id: 18, category: "exterior", src: "/images/exterior/IMG_3584.jpeg", alt: "Exterior detail 18" },
  { id: 19, category: "exterior", src: "/images/exterior/IMG_3667.jpeg", alt: "Exterior detail 19" },
  { id: 20, category: "exterior", src: "/images/exterior/IMG_3777.jpeg", alt: "Exterior detail 20" },
  { id: 21, category: "exterior", src: "/images/exterior/IMG_4585.jpeg", alt: "Exterior detail 21" },
  { id: 22, category: "exterior", src: "/images/exterior/IMG_4671.jpeg", alt: "Exterior detail 22" },
  { id: 23, category: "exterior", src: "/images/exterior/IMG_6035.jpeg", alt: "Exterior detail 23" },
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
  { id: 114, category: "interior", src: "/images/interior/IMG_5529.jpeg", alt: "Interior detail 14" },
  { id: 115, category: "interior", src: "/images/interior/IMG_5540.jpeg", alt: "Interior detail 15" },
  { id: 116, category: "interior", src: "/images/interior/IMG_5561.jpeg", alt: "Interior detail 16" },
  { id: 117, category: "interior", src: "/images/interior/IMG_1930.PNG", alt: "Interior detail 17" },
  { id: 118, category: "interior", src: "/images/interior/IMG_1949.PNG", alt: "Interior detail 18" },
];

const allPhotos: GalleryItem[] = [...exteriorPhotos, ...interiorPhotos];

const tabs: { key: Category; label: string }[] = [
  { key: "all", label: "All Work" },
  { key: "beforeafter", label: "Before & After" },
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
      : active === "interior"
      ? interiorPhotos
      : [];

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

          {/* TASK 2: Before & After matched pairs — side by side, labeled */}
          {active === "beforeafter" ? (
            <div className="space-y-12 max-w-5xl mx-auto">
              {beforeAfterPairs.map((pair) => (
                <div key={pair.id}>
                  <div className="grid grid-cols-2 gap-3 sm:gap-5">
                    {/* Before */}
                    <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-navy/10">
                      <Image
                        src={pair.before}
                        alt={`${pair.title} — before`}
                        fill
                        className="object-cover"
                      />
                      <span className="absolute top-3 left-3 bg-navy/85 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
                        Before
                      </span>
                    </div>
                    {/* After */}
                    <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-navy/10">
                      <Image
                        src={pair.after}
                        alt={`${pair.title} — after`}
                        fill
                        className="object-cover"
                      />
                      <span className="absolute top-3 left-3 bg-gold text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
                        After
                      </span>
                    </div>
                  </div>
                  <p className="text-center text-sm font-medium text-apple-text-secondary mt-4">
                    {pair.title}
                  </p>
                </div>
              ))}
            </div>
          ) : (
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
          )}
        </div>
      </section>
    </>
  );
}
