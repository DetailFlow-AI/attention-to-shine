"use client";

import { useState } from "react";
import Image from "next/image";
import PhotoLightbox, { type LightboxPhoto } from "@/components/PhotoLightbox";

interface GallerySlot {
  id: number;
  // Both are filled in together when a photo is ready. While `src` is empty the
  // slot renders as an empty placeholder and is not clickable.
  src?: string;
  caption?: string;
}

// Twenty slots, awaiting photos and captions. To fill one, add `src` (a path
// under /public/images/...) and `caption`; nothing else needs to change — the
// grid, the click-to-enlarge behaviour, and the lightbox pick it up
// automatically.
const gallerySlots: GallerySlot[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
}));

export default function GalleryPage() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Only slots with a photo are clickable and can appear in the lightbox, so
  // the lightbox indices are taken from this filtered list rather than the grid.
  const filledSlots = gallerySlots.filter((s) => s.src);
  const lightboxPhotos: LightboxPhoto[] = filledSlots.map((s) => ({
    src: s.src!,
    caption: s.caption,
  }));

  return (
    <>
      <section className="bg-navy pt-36 pb-20 px-6 text-center">
        <span className="label-tag">Gallery</span>
        <h1 className="text-6xl md:text-6xl font-bold text-white tracking-tight mb-4">
          The results speak for themselves.
        </h1>
        <p className="text-xl text-white/60 max-w-xl mx-auto">
          Real vehicles. Real transformations. Every photo is a job completed
          right here in the Lakeland area.
        </p>
      </section>

      <section className="bg-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {filledSlots.length > 0 && (
            <p className="text-center text-sm text-apple-text-tertiary mb-10">
              Tap any photo to view it full size.
            </p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {gallerySlots.map((slot) => {
              const photoIndex = filledSlots.findIndex((s) => s.id === slot.id);

              if (!slot.src) {
                return (
                  <div key={slot.id}>
                    <div className="relative aspect-[3/4] rounded-2xl border-2 border-dashed border-navy/15 bg-apple-gray flex flex-col items-center justify-center text-center px-3">
                      <div className="w-10 h-10 rounded-full border border-navy/20 flex items-center justify-center text-navy/40 text-lg mb-2">
                        ＋
                      </div>
                      <p className="text-xs font-medium text-apple-text-tertiary">
                        Photo {slot.id}
                      </p>
                    </div>
                    <p className="text-center text-sm text-apple-text-tertiary mt-3">
                      Caption to come
                    </p>
                  </div>
                );
              }

              return (
                <div key={slot.id}>
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(photoIndex)}
                    aria-label={`Enlarge photo: ${slot.caption ?? `photo ${slot.id}`}`}
                    className="group relative block w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-lg bg-navy/10 cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
                  >
                    <Image
                      src={slot.src}
                      alt={slot.caption ?? "Detailing work by Attention to Shine"}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </button>
                  {slot.caption && (
                    <p className="text-center text-sm font-medium text-apple-text-secondary mt-3">
                      {slot.caption}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <PhotoLightbox
        photos={lightboxPhotos}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onIndexChange={setLightboxIndex}
      />
    </>
  );
}
