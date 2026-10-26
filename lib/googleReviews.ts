// Real Google reviews, fetched SERVER-SIDE and cached for a day.
//
// SECURITY: GOOGLE_PLACES_API_KEY deliberately has no NEXT_PUBLIC_ prefix, so
// Next.js will never inline it into a client bundle. This module must only
// ever be imported from a Server Component or a route handler — never from a
// "use client" file. The homepage calls getGoogleReviews() during its server
// render and passes plain data to components/GoogleReviews.tsx.
//
// HONESTY: only reviews that actually come from Google are ever shown. There
// is no hand-written fallback. If the key is missing or Google can't be
// reached, the section says so politely and links to the Google profile
// instead of inventing quotes.
//
// Reviews are never filtered by star rating or edited. They are shown newest
// first, at most MAX_REVIEWS of them (Google returns at most 5).

export interface Review {
  quote: string;
  name: string;
  initials: string;
  /** "2 weeks ago", as Google words it. */
  when: string;
  rating: number | null;
  profilePhotoUrl: string | null;
  /** The reviewer's Google profile. */
  authorUrl: string | null;
}

export interface ReviewsData {
  /** "live": real reviews from Google. "unavailable": not configured or failed. */
  status: "live" | "unavailable";
  reviews: Review[];
  /** Overall business rating, e.g. 4.9 — null when unknown. */
  rating: number | null;
  /** How many ratings that average is built from. */
  totalRatings: number | null;
  /** Opens the reviews panel on the Google Business Profile ("See more"). */
  reviewsUrl: string;
}

// The public listing — used whenever Google doesn't hand back a reviews link.
export const GOOGLE_LISTING_URL =
  "https://maps.app.goo.gl/dqWzddQBFShN4KqB8?g_st=ic";

// Google's documented link that opens a place's reviews directly.
function reviewsUrlFor(placeId: string | undefined): string {
  return placeId
    ? `https://search.google.com/local/reviews?placeid=${encodeURIComponent(placeId)}`
    : GOOGLE_LISTING_URL;
}

// ── Google Places API (New) response shapes ───────────────────────────────────

interface PlacesReview {
  rating?: number;
  /** RFC 3339 timestamp, e.g. "2026-10-02T14:03:11Z". */
  publishTime?: string;
  text?: { text?: string };
  originalText?: { text?: string };
  relativePublishTimeDescription?: string;
  authorAttribution?: {
    displayName?: string;
    uri?: string;
    photoUri?: string;
  };
}

interface PlacesResponse {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  googleMapsLinks?: { reviewsUri?: string };
  reviews?: PlacesReview[];
}

// Two letters from a display name: "John Travis" → "JT", "Mike" → "MI".
function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "G";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function toReview(r: PlacesReview): Review | null {
  // The reviewer's own words first; Google's translation if that's missing.
  const quote = (r.originalText?.text ?? r.text?.text ?? "").trim();
  if (!quote) return null; // a star-only rating with no words to show

  const name = (r.authorAttribution?.displayName ?? "Google reviewer").trim();

  return {
    quote,
    name,
    initials: initialsFor(name),
    when: r.relativePublishTimeDescription ?? "",
    rating: typeof r.rating === "number" ? r.rating : null,
    profilePhotoUrl: r.authorAttribution?.photoUri ?? null,
    authorUrl: r.authorAttribution?.uri ?? null,
  };
}

// Newest first. Google picks which reviews it returns (up to 5) and has no
// "sort by newest" option in this API, so this orders what it sends; reviews
// without a date keep their place at the end.
function newestFirst(a: PlacesReview, b: PlacesReview): number {
  const ta = a.publishTime ? Date.parse(a.publishTime) : NaN;
  const tb = b.publishTime ? Date.parse(b.publishTime) : NaN;
  if (Number.isNaN(ta) && Number.isNaN(tb)) return 0;
  if (Number.isNaN(ta)) return 1;
  if (Number.isNaN(tb)) return -1;
  return tb - ta;
}

// ── Fetch ─────────────────────────────────────────────────────────────────────

const PLACES_ENDPOINT = "https://places.googleapis.com/v1/places";

// Only the fields we actually render.
const FIELD_MASK =
  "rating,userRatingCount,googleMapsUri,googleMapsLinks,reviews";

/** How many reviews the homepage shows. Google returns at most 5 anyway. */
const MAX_REVIEWS = 5;

/** Roughly once a day, per the caching requirement. */
export const REVIEWS_REVALIDATE_SECONDS = 60 * 60 * 24;

export async function getGoogleReviews(): Promise<ReviewsData> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  const unavailable: ReviewsData = {
    status: "unavailable",
    reviews: [],
    rating: null,
    totalRatings: null,
    reviewsUrl: reviewsUrlFor(placeId),
  };

  if (!apiKey || !placeId) {
    console.log(
      "[reviews] GOOGLE_PLACES_API_KEY / GOOGLE_PLACE_ID not set — showing the link to Google only."
    );
    return unavailable;
  }

  try {
    const res = await fetch(
      `${PLACES_ENDPOINT}/${encodeURIComponent(placeId)}`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": FIELD_MASK,
        },
        // Next caches the response and re-fetches about once a day. Every
        // visitor in between is served from cache, so this costs roughly one
        // Places call per day rather than one per page view.
        next: { revalidate: REVIEWS_REVALIDATE_SECONDS },
      }
    );

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(
        `[reviews] Places API ${res.status} ${res.statusText}. ${body.slice(0, 300)}`
      );
      return unavailable;
    }

    const data = (await res.json()) as PlacesResponse;

    const reviews = [...(data.reviews ?? [])]
      .sort(newestFirst)
      .map(toReview)
      .filter((r): r is Review => r !== null)
      .slice(0, MAX_REVIEWS);

    return {
      status: "live",
      reviews,
      rating: typeof data.rating === "number" ? data.rating : null,
      totalRatings:
        typeof data.userRatingCount === "number" ? data.userRatingCount : null,
      reviewsUrl: data.googleMapsLinks?.reviewsUri ?? reviewsUrlFor(placeId),
    };
  } catch (err) {
    console.error("[reviews] Places API request failed.", err);
    return unavailable;
  }
}
