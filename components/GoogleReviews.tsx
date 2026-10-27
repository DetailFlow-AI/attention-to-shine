import { Star, ExternalLink } from "lucide-react";
import ReviewCard from "@/components/ReviewCard";
import type { ReviewsData } from "@/lib/googleReviews";

// Homepage reviews, straight from the Google Business Profile (see
// lib/googleReviews.ts). Server Component: no JavaScript ships for it.
//
// Live: overall rating, then each review's stars, words, name and date, and a
// "See more" button that opens the reviews on Google.
// Not live (key missing / Google down): no quotes at all — just the button,
// so nothing on the page is ever made up.

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
            i <= filled
              ? "fill-gold text-gold"
              : "fill-apple-gray-2 text-apple-gray-2"
          }
        />
      ))}
    </span>
  );
}

export default function GoogleReviews({ data }: { data: ReviewsData }) {
  const { status, reviews, rating, totalRatings, reviewsUrl } = data;
  const live = status === "live" && reviews.length > 0;

  return (
    <section id="reviews" className="section-pad bg-apple-gray">
      <div className="container-wide">
        <div className="text-center mb-12" data-reveal>
          <span className="label-tag">Google Reviews</span>
          <h2 className="section-heading mb-6">What our customers say.</h2>

          {status === "live" && rating !== null && (
            <div className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-5 bg-white border border-apple-gray-2 rounded-full px-7 py-4">
              <span className="font-display text-4xl font-bold text-apple-text-primary leading-none">
                {rating.toFixed(1)}
              </span>
              <Stars rating={rating} size={20} />
              {totalRatings !== null && (
                <span className="text-sm text-apple-text-secondary">
                  {totalRatings} review{totalRatings === 1 ? "" : "s"} on Google
                </span>
              )}
            </div>
          )}

          {!live && (
            <p className="section-subheading max-w-xl mx-auto">
              Read what Lakeland drivers say about us, in their own words, on
              our Google Business Profile.
            </p>
          )}
        </div>

        {live && (
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            {reviews.map((review, i) => (
              <ReviewCard key={`${review.name}-${i}`} review={review} index={i} />
            ))}
          </div>
        )}

        <div className="text-center" data-reveal>
          <a
            href={reviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-base px-8 py-4"
          >
            {live ? "See all reviews on Google" : "Read our reviews on Google"}
            <ExternalLink size={16} />
          </a>
          {live && (
            <p className="text-xs text-apple-text-secondary mt-4">
              Real reviews from our Google Business Profile, in our customers'
              own words.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
