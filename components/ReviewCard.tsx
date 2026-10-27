"use client";

import { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";
import type { Review } from "@/lib/googleReviews";

// One review card. Client-side only because of "Read more": a long review is
// clamped to a few lines and expands in place, so the words are never cut off
// or shortened — the reader just chooses when to see the rest.

/** The Google "G", for labelling where a review came from. */
function GoogleGlyph({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18A13.2 13.2 0 0 1 11 24c0-1.45.25-2.86.69-4.18v-5.7H4.34A21.99 21.99 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  );
}

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  const filled = Math.round(rating);
  return (
    <span
      className="inline-flex items-center gap-0.5"
      role="img"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          aria-hidden="true"
          className={
            i <= filled ? "fill-gold text-gold" : "fill-apple-gray-2 text-apple-gray-2"
          }
        />
      ))}
    </span>
  );
}

// How many lines a review shows before "Read more" appears. Written out in
// full because Tailwind only generates classes it can see as plain text —
// a built-up name like `line-clamp-${n}` would produce no CSS at all.
const CLAMP_CLASS = "line-clamp-6";

export default function ReviewCard({
  review,
  index,
}: {
  review: Review;
  index: number;
}) {
  const quoteRef = useRef<HTMLQuoteElement>(null);
  const [expanded, setExpanded] = useState(false);
  // Only offer "Read more" when the text really is longer than the clamp —
  // measured after render, so a short review never shows a pointless button.
  const [clamped, setClamped] = useState(false);

  useEffect(() => {
    const el = quoteRef.current;
    if (!el) return;
    const check = () =>
      setClamped(el.scrollHeight > el.clientHeight + 1 || expanded);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <figure
      data-reveal
      style={{ "--reveal-delay": `${(index % 3) * 110}ms` } as React.CSSProperties}
      className="card-lift flex flex-col bg-white border border-apple-gray-2 rounded-3xl p-7 w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        {review.rating !== null && <Stars rating={review.rating} />}
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-apple-text-secondary shrink-0">
          <GoogleGlyph />
          Google review
        </span>
      </div>

      <blockquote
        ref={quoteRef}
        className={`flex-1 text-apple-text-primary leading-relaxed whitespace-pre-line ${
          expanded ? "" : CLAMP_CLASS
        }`}
      >
        “{review.quote}”
      </blockquote>

      {clamped && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="self-start mt-2 text-sm font-semibold text-gold-deep hover:underline"
          aria-expanded={expanded}
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}

      <figcaption className="flex items-center gap-3 mt-6">
        {review.profilePhotoUrl ? (
          // Google-hosted avatar; a plain <img> so no image config is needed.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={review.profilePhotoUrl}
            alt=""
            width={40}
            height={40}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <span className="w-10 h-10 rounded-full bg-navy text-gold text-sm font-semibold flex items-center justify-center shrink-0">
            {review.initials}
          </span>
        )}
        <span className="min-w-0">
          {review.authorUrl ? (
            <a
              href={review.authorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block font-semibold text-apple-text-primary truncate hover:text-gold-deep"
            >
              {review.name}
            </a>
          ) : (
            <span className="block font-semibold text-apple-text-primary truncate">
              {review.name}
            </span>
          )}
          {review.when && (
            <span className="block text-xs text-apple-text-secondary">
              {review.when}
            </span>
          )}
        </span>
      </figcaption>
    </figure>
  );
}
