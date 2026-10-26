"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";

export interface ScenePair {
  before: string;
  after: string;
  /** Shown under the card once it's polished, e.g. "Exterior detail". */
  label: string;
  /** Shown under the card before it's polished. */
  intro: string;
}

// The homepage's scroll-driven opening, in the spirit of a product page where
// the product turns as you scroll.
//
// The section is taller than the screen and its inner stage is pinned
// (position: sticky). Scrolling through it moves one number, p, from 0 to 1.
// From p this works out, per photo card:
//
//   --b  the card tilts up out of the dark, still showing BEFORE
//   --w  a band of light sweeps across it, polishing it to AFTER
//   --o  it tilts away upward to make room for the next card
//
// and --a for the headline lifting away at the start. CSS does the rest (see
// "Hero scene" in app/globals.css). Scrolling back up runs it all in reverse.
// Values are written straight to the DOM — React doesn't re-render while you
// scroll.
//
// Reduced motion / no JS: nothing pins, the cards are hidden, and the hero is
// a normal static section (the sliders right below still show the photos).

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

// Headline-only time at the top before the first card starts rising.
const LEAD_IN = 0.07;

// Where card i's three phases sit on the 0–1 scroll range.
function phases(p: number, i: number, count: number) {
  const span = (1 - LEAD_IN) / count;
  const t0 = LEAD_IN + i * span;
  // Later cards start rising while the previous one is still leaving, so the
  // hand-over never leaves an empty stage.
  const rise = i === 0 ? t0 : t0 - 0.14 * span;
  return {
    b: clamp01((p - rise) / (0.3 * span)),
    w: clamp01((p - (t0 + 0.38 * span)) / (0.4 * span)),
    // The last card stays put; the others hand over to the next one.
    o: i < count - 1 ? clamp01((p - (t0 + 0.8 * span)) / (0.2 * span)) : 0,
  };
}

export default function HeroScene({
  children,
  backdrop,
  pairs,
}: {
  children: ReactNode;
  /** Pinned behind everything; doesn't fade with the headline. */
  backdrop?: ReactNode;
  pairs: ScenePair[];
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [live, setLive] = useState(false);
  // The photos don't load until the visitor actually scrolls, so they never
  // compete with the headline on first paint.
  const [photos, setPhotos] = useState(false);
  const count = pairs.length;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || count === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    setLive(true);
    let frame = 0;
    let last = -1;
    const copyEnd = LEAD_IN + 0.25 * ((1 - LEAD_IN) / count);

    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const p = travel > 0 ? clamp01(-rect.top / travel) : 0;
      if (Math.abs(p - last) < 0.0005) return;
      last = p;

      section.style.setProperty("--a", clamp01(p / copyEnd).toFixed(4));
      slotRefs.current.forEach((slot, i) => {
        if (!slot) return;
        const { b, w, o } = phases(p, i, count);
        slot.style.setProperty("--b", b.toFixed(4));
        slot.style.setProperty("--w", w.toFixed(4));
        slot.style.setProperty("--o", o.toFixed(4));
      });
      // Hidden headline buttons shouldn't catch taps aimed at the cards.
      section.classList.toggle("scene-past-copy", p > copyEnd * 0.75);
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
  }, [count]);

  return (
    <section
      ref={sectionRef}
      className={`scene relative bg-navy-ink ${live ? "is-live" : ""}`}
      // One extra screen of scrolling per photo card (see .scene.is-live).
      style={{ "--cards": count } as React.CSSProperties}
    >
      <div className="scene-sticky">
        {backdrop}
        <div className="scene-copy">{children}</div>

        {count > 0 && (
          <div className="scene-stage" aria-hidden>
            {pairs.map((pair, i) => (
              <div
                key={pair.label}
                ref={(el) => {
                  slotRefs.current[i] = el;
                }}
                className="scene-slot"
              >
                {/* Desktop only: oversized words either side of the card. */}
                <span className="scene-word scene-word--before">Before</span>
                <span className="scene-word scene-word--after">After</span>
                <div className="scene-card">
                  {photos && (
                    <>
                      <Image
                        src={pair.before}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 80vw, 40vw"
                        className="object-cover"
                      />
                      <div className="scene-after">
                        <Image
                          src={pair.after}
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
                  <span className="scene-caption--before">
                    {pair.intro}
                  </span>
                  <span className="scene-caption--after">
                    {pair.label} ·{" "}
                    {i < count - 1 ? "Keep scrolling" : "Scroll back to compare"}
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
