"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface Review {
  quote: string;
  name: string;
  initials: string;
  detail: string;
}

export default function ReviewsCarousel({ reviews }: { reviews: Review[] }) {
  const [index, setIndex] = useState(0);

  const prev = () => setIndex((i) => (i - 1 + reviews.length) % reviews.length);
  const next = () => setIndex((i) => (i + 1) % reviews.length);

  const review = reviews[index];

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
          <blockquote className="text-2xl md:text-3xl font-semibold text-apple-text-primary tracking-tight leading-snug mb-8">
            "{review.quote}"
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center text-white font-bold text-sm shrink-0">
              {review.initials}
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm text-apple-text-primary">
                {review.name}
              </p>
              <p className="text-xs text-apple-text-tertiary">{review.detail}</p>
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
            key={r.name}
            onClick={() => setIndex(i)}
            aria-label={`Go to review ${i + 1}`}
            className={`h-2 rounded-full transition-all ${
              i === index ? "w-6 bg-gold" : "w-2 bg-apple-gray-2"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
