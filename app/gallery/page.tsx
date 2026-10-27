import type { Metadata } from "next";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import GalleryGrid, { type GallerySlot } from "@/components/GalleryGrid";
import { GALLERY_DIR, GALLERY_PHOTOS } from "@/data/gallery";
import { TRANSFORMATION_PAIRS } from "@/data/beforeAfter";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Before and after sliders plus recent detailing work by Attention to Shine — real vehicles detailed in Lakeland, Florida and the surrounding Polk County area.",
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

      {/* ── TRANSFORMATIONS: the before/after sliders, from data/beforeAfter.ts ── */}
      <section className="section-pad bg-white">
        <div className="container-wide">
          <div className="text-center mb-14" data-reveal>
            <span className="label-tag">Before &amp; After</span>
            <h2 className="section-heading mb-4">Transformations</h2>
            <p className="section-subheading max-w-2xl mx-auto">
              Drag each slider to compare the vehicle before and after our
              detail.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
            {TRANSFORMATION_PAIRS.map((pair, i) => (
              <div
                key={pair.label}
                data-reveal
                style={{ "--reveal-delay": `${(i % 3) * 120}ms` } as React.CSSProperties}
                className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.34rem)] max-w-md"
              >
                <BeforeAfterSlider
                  beforeSrc={pair.before}
                  afterSrc={pair.after}
                  alt={pair.label}
                />
                <p className="text-center text-sm font-medium text-apple-text-secondary mt-4">
                  {pair.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OTHER FINISHED WORK: the photo grid, from data/gallery.ts ── */}
      <section className="section-pad bg-apple-gray">
        <div className="container-wide">
          <div className="text-center mb-14" data-reveal>
            <span className="label-tag">The Gallery</span>
            <h2 className="section-heading mb-4">Our Other Finished Work</h2>
            <p className="section-subheading max-w-2xl mx-auto">
              More vehicles we&apos;ve detailed, inside and out.
            </p>
          </div>

          <div className="max-w-7xl mx-auto">
            <GalleryGrid slots={slots} />
          </div>
        </div>
      </section>
    </>
  );
}
