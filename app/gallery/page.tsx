import type { Metadata } from "next";
import GalleryGrid, { type GallerySlot } from "@/components/GalleryGrid";
import { GALLERY_DIR, GALLERY_PHOTOS } from "@/data/gallery";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Recent detailing work by Attention to Shine — real vehicles detailed in Lakeland, Florida and the surrounding Polk County area.",
};

/**
 * The photos listed in data/gallery.ts, in that order. Add or remove a photo
 * by editing that one file — the grid, the lightbox and the alt text all
 * follow from it.
 */
function buildSlots(): GallerySlot[] {
  return GALLERY_PHOTOS.map((photo, i) => ({
    id: i + 1,
    src: `${GALLERY_DIR}/${photo.file}`,
    caption: photo.caption,
    alt: photo.alt,
  }));
}

export default function GalleryPage() {
  const slots = buildSlots();

  return (
    <>
      {/* Scroll-linked: content drifts up and fades, light sweeps across. */}
      <section data-scroll="exit" className="fx-scrub-shine hero-stage pt-36 pb-24 px-6 text-center">
        <div className="fx-hero-out relative">
          <span className="label-tag">Gallery</span>
          <h1 className="text-[2.75rem] leading-[1.05] sm:text-6xl font-bold text-white tracking-tight mb-4">
            The results speak for themselves.
          </h1>
          <p className="text-xl text-white/60 max-w-xl mx-auto">
            Real vehicles. Real transformations. Every photo is a job completed
            right here in the Lakeland area.
          </p>
        </div>
      </section>

      <section className="bg-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <GalleryGrid slots={slots} />
        </div>
      </section>
    </>
  );
}
