"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Scroll-LINKED effects (they follow the scrollbar both ways, unlike the
// one-shot reveals in RevealObserver). Any element on any page can opt in:
//
//   <section data-scroll="exit">   --p: 0 at rest → 1 once scrolled past it
//   <div data-scroll="enter">      --p: 0 as it enters at the bottom of the
//                                  screen → 1 when its top is 35% from the top
//   <div data-scroll>              --p: 0 entering → 1 fully leaving ("through")
//
// This sets --p on the element; the fx-* classes in app/globals.css decide
// what it does. Only elements near the screen are measured, once per frame.
// With prefers-reduced-motion nothing runs and `fx-ready` is never added, so
// every effect stays in its finished, static state.
export default function ScrollFx() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-scroll]"));
    if (els.length === 0) return;

    const active = new Set<HTMLElement>();
    const last = new WeakMap<HTMLElement, number>();
    let frame = 0;

    const measure = (el: HTMLElement) => {
      const vh = window.innerHeight;
      const r = el.getBoundingClientRect();
      let p: number;
      switch (el.dataset.scroll) {
        case "exit":
          p = -r.top / Math.max(1, r.height);
          break;
        case "enter":
          p = (vh - r.top) / (vh * 0.65);
          break;
        default:
          p = (vh - r.top) / (vh + r.height);
      }
      p = Math.min(1, Math.max(0, p));
      if (Math.abs((last.get(el) ?? -1) - p) < 0.001) return;
      last.set(el, p);
      el.style.setProperty("--p", p.toFixed(4));
    };

    const update = () => {
      frame = 0;
      active.forEach(measure);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement;
          if (e.isIntersecting) {
            active.add(el);
            measure(el);
          } else {
            // Park it at whichever end it left from, so fast flings don't
            // strand an effect half-way.
            measure(el);
            active.delete(el);
          }
        }
      },
      { rootMargin: "15% 0px 15% 0px" }
    );

    els.forEach((el) => {
      measure(el);
      io.observe(el);
    });
    document.documentElement.classList.add("fx-ready");
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return null;
}
