"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";

// The homepage's scroll-driven opening, in the spirit of a product page where
// the product turns as you scroll.
//
// The section is taller than the screen and its inner stage is pinned
// (position: sticky). Scrolling through it drives one number, --p, from 0 to 1,
// and everything else is CSS reading that number (see "Hero scene" in
// app/globals.css):
//
//   0.00–0.30  the headline block lifts away and fades
//   0.12–0.45  a photo card tilts up out of the dark, still showing BEFORE
//   0.50–0.88  a band of light sweeps across it, polishing it to AFTER
//
// Scrolling back up runs all of it in reverse. Transforms and clip-path only,
// written straight to the DOM — React doesn't re-render while you scroll.
//
// Reduced motion / no JS: nothing pins, the card is hidden, and the hero is a
// normal static section (the sliders right below still show the photos).
export default function HeroScene({
  children,
  backdrop,
  before,
  after,
  label,
}: {
  children: ReactNode;
  /** Pinned behind everything; doesn't fade with the headline. */
  backdrop?: ReactNode;
  before?: string;
  after?: string;
  label: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [live, setLive] = useState(false);
  // The photos don't load until the visitor actually scrolls, so they never
  // compete with the headline on first paint.
  const [photos, setPhotos] = useState(false);
  const hasPair = Boolean(before && after);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !hasPair) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    setLive(true);
    let frame = 0;
    let last = -1;

    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const p = travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0;
      if (Math.abs(p - last) < 0.0005) return;
      last = p;
      section.style.setProperty("--p", p.toFixed(4));
      // Hidden headline buttons shouldn't catch taps aimed at the card.
      section.classList.toggle("scene-past-copy", p > 0.22);
      if (p > 0) setPhotos(true);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // Warm the photos shortly after load even if nobody scrolls yet.
    const warm = window.setTimeout(() => setPhotos(true), 3500);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
      window.clearTimeout(warm);
    };
  }, [hasPair]);

  return (
    <section
      ref={sectionRef}
      className={`scene relative bg-navy-ink ${live ? "is-live" : ""}`}
    >
      <div className="scene-sticky">
        {backdrop}
        <div className="scene-copy">{children}</div>

        {hasPair && (
          <div className="scene-stage" aria-hidden>
            {/* Desktop only: oversized words either side of the card. */}
            <span className="scene-word scene-word--before">Before</span>
            <span className="scene-word scene-word--after">After</span>
            <div className="scene-card">
              {photos && (
                <>
                  <Image
                    src={before!}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 80vw, 40vw"
                    className="object-cover"
                  />
                  <div className="scene-after">
                    <Image
                      src={after!}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 80vw, 40vw"
                      className="object-cover"
                    />
                  </div>
                </>
              )}
              <div className="scene-polish" />
              <span className="scene-tag scene-tag--before">Before</span>
              <span className="scene-tag scene-tag--after">After</span>
            </div>
            <p className="scene-caption">
              <span className="scene-caption--before">Keep scrolling to detail it</span>
              <span className="scene-caption--after">{label} · Scroll back to compare</span>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
