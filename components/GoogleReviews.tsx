import { Star, ExternalLink } from "lucide-react";
import type { ReviewsData, Review } from "@/lib/googleReviews";

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

function ReviewCard({ review, index }: { review: Review; index: number }) {
  return (
    <figure
      data-reveal
      style={{ "--reveal-delay": `${(index % 3) * 110}ms` } as React.CSSProperties}
      className="card-lift flex flex-col bg-white border border-apple-gray-2 rounded-3xl p-7 w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
    >
      <div className="flex items-center justify-between mb-4">
        {review.rating !== null && <Stars rating={review.rating} />}
        <span className="text-xs font-medium text-apple-text-secondary">
          Google
        </span>
      </div>

      <blockquote className="flex-1 text-apple-text-primary leading-relaxed line-clamp-6 mb-6">
        “{review.quote}”
      </blockquote>

      <figcaption className="flex items-center gap-3">
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
          <span className="w-10 h-10 rounded-full bg-navy text-gold text-sm font-semibold flex items-center justify-center">
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
            {live ? "See more reviews on Google" : "Read our reviews on Google"}
            <ExternalLink size={16} />
          </a>
          {live && (
            <p className="text-xs text-apple-text-secondary mt-4">
              Reviews from our Google Business Profile, newest first.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
