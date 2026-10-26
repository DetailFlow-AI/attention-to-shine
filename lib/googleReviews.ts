// Real Google reviews for the homepage, fetched SERVER-SIDE.
//
// Two sources, tried in this order:
//
// 1. Google Business Profile API (the one we want). Reads the business's
//    whole review list, so the homepage can show the 5 NEWEST reviews that
//    have written comments. Checked about once an hour, so a new review
//    shows up on its own within the hour. Needs the GBP_* variables below;
//    scripts/gbp-setup.mjs walks through getting them.
//
// 2. Google Places API (New), as a stop-gap while Business Profile API access
//    is being approved. Google returns at most 5 reviews of ITS choosing (not
//    necessarily the newest). Needs GOOGLE_PLACES_API_KEY + GOOGLE_PLACE_ID.
//
// If neither is configured, or Google can't be reached, no quotes are shown —
// only a link to the reviews on Google. Nothing on the page is ever made up,
// and reviews are never filtered by star rating or edited.
//
// SECURITY: none of these variables has a NEXT_PUBLIC_ prefix, so Next.js
// never puts them in a browser bundle. Import this module only from Server
// Components or route handlers — never from a "use client" file.

export interface Review {
  quote: string;
  name: string;
  initials: string;
  /** "2 weeks ago" (Places) or "Oct 12, 2026" (Business Profile). */
  when: string;
  rating: number | null;
  profilePhotoUrl: string | null;
  /** The reviewer's Google profile, when Google provides it. */
  authorUrl: string | null;
}

export interface ReviewsData {
  /** "live": real reviews from Google. "unavailable": not configured or failed. */
  status: "live" | "unavailable";
  /** Which API produced the reviews — handy when debugging a deploy. */
  source: "business-profile" | "places" | null;
  reviews: Review[];
  /** Overall business rating, e.g. 4.9 — null when unknown. */
  rating: number | null;
  /** How many reviews that average is built from. */
  totalRatings: number | null;
  /** Opens the reviews on the Google Business Profile ("See more"). */
  reviewsUrl: string;
}

/** How many reviews the homepage shows. */
const MAX_REVIEWS = 5;

/** Business Profile: re-check for new reviews about once an hour (free API). */
const GBP_REVALIDATE_SECONDS = 60 * 60;

/** Places fallback: once a day, to stay inside Google's free monthly usage. */
const PLACES_REVALIDATE_SECONDS = 60 * 60 * 24;

// The public listing — used whenever there's no place id to build a link from.
export const GOOGLE_LISTING_URL =
  "https://maps.app.goo.gl/dqWzddQBFShN4KqB8?g_st=ic";

// Google's documented link that opens a place's reviews directly.
function reviewsUrlFor(placeId: string | undefined): string {
  return placeId
    ? `https://search.google.com/local/reviews?placeid=${encodeURIComponent(placeId)}`
    : GOOGLE_LISTING_URL;
}

// Two letters from a display name: "John Travis" → "JT", "Mike" → "MI".
function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "G";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ── 1. Google Business Profile API ───────────────────────────────────────────

interface GbpReview {
  reviewId?: string;
  reviewer?: {
    displayName?: string;
    profilePhotoUrl?: string;
    isAnonymous?: boolean;
  };
  starRating?: "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE" | string;
  comment?: string;
  createTime?: string;
  updateTime?: string;
}

interface GbpReviewsResponse {
  reviews?: GbpReview[];
  averageRating?: number;
  totalReviewCount?: number;
}

const STARS: Record<string, number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
};

// Reviews Google auto-translated come back as
// "(Translated by Google) …\n\n(Original)\n…". Show the reviewer's own words.
function originalWords(comment: string): string {
  const marker = "(Original)";
  const i = comment.indexOf(marker);
  if (comment.startsWith("(Translated by Google)") && i !== -1) {
    return comment.slice(i + marker.length).trim();
  }
  return comment.trim();
}

function gbpToReview(r: GbpReview): Review | null {
  const quote = originalWords(r.comment ?? "");
  if (!quote) return null; // stars only, no words to quote

  const name = r.reviewer?.isAnonymous
    ? "A Google user"
    : (r.reviewer?.displayName ?? "Google reviewer").trim();
  const created = r.createTime ? new Date(r.createTime) : null;

  return {
    quote,
    name,
    initials: initialsFor(name),
    when:
      created && !Number.isNaN(created.getTime())
        ? created.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            timeZone: "America/New_York",
          })
        : "",
    rating: STARS[r.starRating ?? ""] ?? null,
    profilePhotoUrl: r.reviewer?.profilePhotoUrl ?? null,
    authorUrl: null,
  };
}

async function gbpAccessToken(): Promise<string> {
  // Exchange the long-lived refresh token for a short-lived access token.
  // Not cached by Next (POST), but it only runs when the review list itself
  // is being re-fetched, i.e. about once an hour.
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GBP_CLIENT_ID!,
      client_secret: process.env.GBP_CLIENT_SECRET!,
      refresh_token: process.env.GBP_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`token ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("token response had no access_token");
  return data.access_token;
}

async function fromBusinessProfile(): Promise<ReviewsData | null> {
  const { GBP_CLIENT_ID, GBP_CLIENT_SECRET, GBP_REFRESH_TOKEN } = process.env;
  const account = process.env.GBP_ACCOUNT_ID;
  const location = process.env.GBP_LOCATION_ID;
  if (
    !GBP_CLIENT_ID ||
    !GBP_CLIENT_SECRET ||
    !GBP_REFRESH_TOKEN ||
    !account ||
    !location
  ) {
    return null; // not set up yet
  }

  try {
    const token = await gbpAccessToken();
    // Most recently updated first; a page of 50 is plenty to find the 5
    // newest with written comments.
    const url =
      `https://mybusiness.googleapis.com/v4/accounts/${encodeURIComponent(account)}` +
      `/locations/${encodeURIComponent(location)}/reviews` +
      `?pageSize=50&orderBy=${encodeURIComponent("updateTime desc")}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: GBP_REVALIDATE_SECONDS },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(
        `[reviews] Business Profile API ${res.status}: ${body.slice(0, 300)}`
      );
      return null;
    }
    const data = (await res.json()) as GbpReviewsResponse;

    // "Newest" means when the review was written, not when it was last edited.
    const reviews = [...(data.reviews ?? [])]
      .sort(
        (a, b) =>
          Date.parse(b.createTime ?? "") - Date.parse(a.createTime ?? "") || 0
      )
      .map(gbpToReview)
      .filter((r): r is Review => r !== null)
      .slice(0, MAX_REVIEWS);

    return {
      status: "live",
      source: "business-profile",
      reviews,
      rating: typeof data.averageRating === "number" ? data.averageRating : null,
      totalRatings:
        typeof data.totalReviewCount === "number" ? data.totalReviewCount : null,
      reviewsUrl: reviewsUrlFor(process.env.GOOGLE_PLACE_ID),
    };
  } catch (err) {
    console.error("[reviews] Business Profile API request failed.", err);
    return null;
  }
}

// ── 2. Google Places API (New) — stop-gap ────────────────────────────────────

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
  googleMapsLinks?: { reviewsUri?: string };
  reviews?: PlacesReview[];
}

function placesToReview(r: PlacesReview): Review | null {
  // The reviewer's own words first; Google's translation if that's missing.
  const quote = (r.originalText?.text ?? r.text?.text ?? "").trim();
  if (!quote) return null;

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

async function fromPlaces(): Promise<ReviewsData | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!apiKey || !placeId) return null;

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "rating,userRatingCount,googleMapsLinks,reviews",
        },
        next: { revalidate: PLACES_REVALIDATE_SECONDS },
      }
    );
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[reviews] Places API ${res.status}: ${body.slice(0, 300)}`);
      return null;
    }
    const data = (await res.json()) as PlacesResponse;

    // Google picks these (up to 5); newest first is the best we can do here.
    const reviews = [...(data.reviews ?? [])]
      .sort(
        (a, b) =>
          (Date.parse(b.publishTime ?? "") || 0) -
          (Date.parse(a.publishTime ?? "") || 0)
      )
      .map(placesToReview)
      .filter((r): r is Review => r !== null)
      .slice(0, MAX_REVIEWS);

    return {
      status: "live",
      source: "places",
      reviews,
      rating: typeof data.rating === "number" ? data.rating : null,
      totalRatings:
        typeof data.userRatingCount === "number" ? data.userRatingCount : null,
      reviewsUrl: data.googleMapsLinks?.reviewsUri ?? reviewsUrlFor(placeId),
    };
  } catch (err) {
    console.error("[reviews] Places API request failed.", err);
    return null;
  }
}

// ── Entry point ──────────────────────────────────────────────────────────────

export async function getGoogleReviews(): Promise<ReviewsData> {
  const data = (await fromBusinessProfile()) ?? (await fromPlaces());
  if (data) return data;

  console.log(
    "[reviews] No Google reviews source configured or reachable — showing the link to Google only."
  );
  return {
    status: "unavailable",
    source: null,
    reviews: [],
    rating: null,
    totalRatings: null,
    reviewsUrl: reviewsUrlFor(process.env.GOOGLE_PLACE_ID),
  };
}
