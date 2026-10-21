"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { Review } from "@/lib/googleReviews";

// Re-exported so existing imports of `Review` from this module keep working.
export type { Review };

// Five stars with the filled count matching the score. Decimal ratings round
// to the nearest whole star, which is what the number beside them is for.
function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  const filled = Math.round(rating);
  return (
    <span
      className="inline-flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={
            i <= filled
              ? "fill-gold text-gold"
              : "fill-apple-gray-2 text-apple-gray-2"
          }
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export default function ReviewsCarousel({ reviews }: { reviews: Review[] }) {
  const [index, setIndex] = useState(0);

  // Defensive: the server always sends at least the fallback list, but an
  // empty array must not crash the homepage.
  if (reviews.length === 0) return null;

  const safeIndex = Math.min(index, reviews.length - 1);
  const review = reviews[safeIndex];

  const prev = () => setIndex((i) => (i - 1 + reviews.length) % reviews.length);
  const next = () => setIndex((i) => (i + 1) % reviews.length);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 sm:gap-6">
        <button
          onClick={prev}
          aria-label="Previous review"
          className="shrink-0 w-11 h-11 rounded-full bg-white border border-apple-gray-2 flex items-center justify-center text-navy hover:bg-navy hover:text-white hover:border-navy transition-colors"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex-1 text-center px-2 min-h-[230px] flex flex-col justify-center">
          {review.rating !== undefined && (
            <div className="flex justify-center mb-4">
              <Stars rating={review.rating} size={16} />
            </div>
          )}

          <blockquote className="text-xl md:text-2xl font-semibold text-apple-text-primary tracking-tight leading-snug mb-8">
            "{review.quote}"
          </blockquote>

          <div className="flex items-center justify-center gap-3">
            {review.profilePhotoUrl ? (
              // Reviewer avatars are arbitrary Google-hosted URLs, so they go
              // through a plain <img>; next/image would need every possible
              // host allow-listed in next.config.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={review.profilePhotoUrl}
                alt=""
                width={40}
                height={40}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover shrink-0 bg-navy"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center text-white font-bold text-sm shrink-0">
                {review.initials}
              </div>
            )}
            <div className="text-left">
              <p className="font-semibold text-sm text-apple-text-primary">
                {review.name}
              </p>
              <p className="text-xs text-apple-text-tertiary">
                {review.detail}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={next}
          aria-label="Next review"
          className="shrink-0 w-11 h-11 rounded-full bg-white border border-apple-gray-2 flex items-center justify-center text-navy hover:bg-navy hover:text-white hover:border-navy transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="flex justify-center gap-2 mt-8">
        {reviews.map((r, i) => (
          <button
            // Two reviewers can share a display name, so the index keeps keys
            // unique.
            key={`${r.name}-${i}`}
            onClick={() => setIndex(i)}
            aria-label={`Go to review ${i + 1}`}
            className={`h-2 rounded-full transition-all ${
              i === safeIndex ? "w-6 bg-gold" : "w-2 bg-apple-gray-2"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export { Stars };
