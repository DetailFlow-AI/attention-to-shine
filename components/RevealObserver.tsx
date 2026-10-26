"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Scroll-triggered reveals for any element marked `data-reveal`, on any page.
// Server components just add the attribute; this one observer does the rest,
// so no animation library ships to the browser.
//
//   <div data-reveal>…</div>                       fade + slide up
//   <div data-reveal style={{"--reveal-delay": "120ms"}}>  staggered
//
// The hidden starting state only applies once <html> has `reveal-ready`, so
// content is never hidden without JS. With prefers-reduced-motion the class is
// never added and everything simply shows (see globals.css).
export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches || !("IntersectionObserver" in window)) return;

    const root = document.documentElement;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-revealed");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
    );

    const targets = document.querySelectorAll<HTMLElement>(
      "[data-reveal]:not(.is-revealed)"
    );
    // Anything already on screen shows immediately, so above-the-fold
    // content never blinks out and back in.
    const vh = window.innerHeight;
    targets.forEach((el) => {
      if (el.getBoundingClientRect().top < vh * 0.9) {
        el.classList.add("is-revealed");
      } else {
        io.observe(el);
      }
    });
    root.classList.add("reveal-ready");

    return () => io.disconnect();
  }, [pathname]);

  return null;
}
