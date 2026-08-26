import type { Metadata } from "next";
import GalleryGrid, { type GallerySlot } from "@/components/GalleryGrid";
import { listImages, captionFromFilename } from "@/lib/photos";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Recent detailing work by Attention to Shine — real vehicles detailed in Lakeland, Florida and the surrounding Polk County area.",
};

const GALLERY_DIR = "images/gallery";
const MAX_SLOTS = 20;

/**
 * Photos come straight from /public/images/gallery — every image in that
 * folder is picked up, in filename order, up to 20. Captions are derived from
 * the filenames, so adding a photo needs no code change at all. Any remaining
 * slots render as empty placeholders.
 */
function buildSlots(): GallerySlot[] {
  const photos = listImages(GALLERY_DIR).slice(0, MAX_SLOTS);

  return Array.from({ length: MAX_SLOTS }, (_, i) => {
    const src = photos[i];
    return src
      ? { id: i + 1, src, caption: captionFromFilename(src) }
      : { id: i + 1 };
  });
}

export default function GalleryPage() {
  const slots = buildSlots();

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
          <GalleryGrid slots={slots} />
        </div>
      </section>
    </>
  );
}
