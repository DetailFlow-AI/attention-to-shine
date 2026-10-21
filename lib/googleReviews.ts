// Real Google reviews, fetched SERVER-SIDE and cached for a day.
//
// SECURITY: GOOGLE_PLACES_API_KEY deliberately has no NEXT_PUBLIC_ prefix, so
// Next.js will never inline it into a client bundle. This module must only
// ever be imported from a Server Component or a route handler — never from a
// "use client" file. The homepage calls getGoogleReviews() during its server
// render and passes the finished, plain-data result down to the carousel.
//
// FAILURE BEHAVIOUR: this module never throws and never returns an empty list.
// A missing key, a bad place id, a quota error, a network blip or a malformed
// payload all fall back to the hand-written reviews below, so the section on
// the homepage can never render empty.
//
// Reviews are shown exactly as Google returns them — no filtering by star
// rating, no reordering, no truncation.

export interface Review {
  quote: string;
  name: string;
  initials: string;
  detail: string;
  rating?: number;
  profilePhotoUrl?: string | null;
  url?: string | null;
}

export interface ReviewsData {
  reviews: Review[];
  /** Overall business rating, e.g. 4.9 — null when unknown. */
  rating: number | null;
  /** How many ratings that average is built from. */
  totalRatings: number | null;
  /** Where "See all reviews on Google" points. */
  googleUrl: string;
  /** Which path produced this data — handy when debugging a deploy. */
  source: "google" | "fallback";
}

// The public listing. Used as the link target whenever Google doesn't hand
// back a googleMapsUri of its own.
export const GOOGLE_LISTING_URL =
  "https://maps.app.goo.gl/dqWzddQBFShN4KqB8?g_st=ic";

// ── Fallback ──────────────────────────────────────────────────────────────────
// The reviews the site showed before this was wired up. Kept verbatim so a
// Google outage is invisible to visitors.

export const FALLBACK_REVIEWS: Review[] = [
  {
    quote: "Wow! It looks like new again!",
    name: "John Travis",
    initials: "JT",
    detail: "Lakeland, FL — Full Detail Package",
  },
  {
    quote: "My car hasn't looked this good since the day I bought it!",
    name: "Mike L.",
    initials: "ML",
    detail: "Lakeland, FL — Full Detail Package",
  },
  {
    quote: "It looks like it should be in a showroom.",
    name: "Mr. David",
    initials: "MD",
    detail: "Lakeland, FL — Full Detail Package",
  },
  {
    quote:
      "I almost feel bad taking my car out of the driveway now — I don't want it to get dirty!",
    name: "Steve B.",
    initials: "SB",
    detail: "Lakeland, FL — Shine Standard Maintenance",
  },
  {
    quote: "I'll definitely be calling them out again. Highly recommend!",
    name: "Eric K.",
    initials: "EK",
    detail: "Lakeland, FL — Full Detail Package",
  },
];

const FALLBACK: ReviewsData = {
  reviews: FALLBACK_REVIEWS,
  rating: null,
  totalRatings: null,
  googleUrl: GOOGLE_LISTING_URL,
  source: "fallback",
};

// ── Google Places API (New) response shapes ───────────────────────────────────

interface PlacesReview {
  rating?: number;
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
  // Google's own translation first, then the reviewer's original wording.
  const quote = (r.text?.text ?? r.originalText?.text ?? "").trim();
  if (!quote) return null; // a star-only rating with no words to show

  const name = (r.authorAttribution?.displayName ?? "Google reviewer").trim();

  return {
    quote,
    name,
    initials: initialsFor(name),
    detail: r.relativePublishTimeDescription ?? "Google review",
    rating: typeof r.rating === "number" ? r.rating : undefined,
    profilePhotoUrl: r.authorAttribution?.photoUri ?? null,
    url: r.authorAttribution?.uri ?? null,
  };
}

// ── Fetch ─────────────────────────────────────────────────────────────────────

const PLACES_ENDPOINT = "https://places.googleapis.com/v1/places";

// Only the fields we actually render, so the call stays on the cheapest
// billing SKU that still includes reviews.
const FIELD_MASK = "rating,userRatingCount,googleMapsUri,reviews";

/** Roughly once a day, per the caching requirement. */
export const REVIEWS_REVALIDATE_SECONDS = 60 * 60 * 24;

export async function getGoogleReviews(): Promise<ReviewsData> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  // Not configured yet — this is the expected state until the env vars are set
  // in Vercel, so it's a log line rather than an error.
  if (!apiKey || !placeId) {
    console.log(
      "[reviews] GOOGLE_PLACES_API_KEY / GOOGLE_PLACE_ID not set — using fallback reviews."
    );
    return FALLBACK;
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
        `[reviews] Places API ${res.status} ${res.statusText} — falling back. ${body.slice(0, 300)}`
      );
      return FALLBACK;
    }

    const data = (await res.json()) as PlacesResponse;

    // Exactly what Google returned, in Google's order, unfiltered by rating.
    const reviews = (data.reviews ?? [])
      .map(toReview)
      .filter((r): r is Review => r !== null);

    if (reviews.length === 0) {
      console.warn("[reviews] Places API returned no usable reviews — falling back.");
      return FALLBACK;
    }

    return {
      reviews,
      rating: typeof data.rating === "number" ? data.rating : null,
      totalRatings:
        typeof data.userRatingCount === "number" ? data.userRatingCount : null,
      googleUrl: data.googleMapsUri ?? GOOGLE_LISTING_URL,
      source: "google",
    };
  } catch (err) {
    console.error("[reviews] Places API request failed — falling back.", err);
    return FALLBACK;
  }
}
