// The reviews shown on the website.
//
// ── HOW TO CHANGE THESE ───────────────────────────────────────────────────────
// Add a review:    copy one { ... } block below, paste it, fill in the three
//                  fields. Put newest at the top if you like — they show in
//                  the order they appear here.
// Remove a review: delete its whole { ... } block.
// Nothing else on the site needs touching. Save, commit, and it is live.
//
// The words are copied EXACTLY as the customer wrote them on Google —
// never edited, shortened or spell-checked. Keep it that way.
// Backticks let a review span several lines, so paste long ones as they are.

export interface SiteReview {
  /** The reviewer's name, exactly as Google shows it. */
  name: string;
  /** Whole stars, 1 to 5. */
  rating: 1 | 2 | 3 | 4 | 5;
  /** The review, word for word. */
  text: string;
}

export const REVIEWS: SiteReview[] = [
  {
    name: "Roth Bartley",
    rating: 5,
    text: `Attention to Shine, provided the best detailing experience I’ve ever had. I take good care of my vehicles, but I must confess that Chis did a much more thorough interior cleaning and wash than I’m capable of. I look forward to his ongoing care of  my truck.`,
  },
  {
    name: "Elia. N Tabri",
    rating: 5,
    text: `This is the best alternative to waiting for four hours a car wash.  Shine Mobil will come to you with their expertise and get the job done while you’re relaxing at home.  I will not settle for an alternative.`,
  },
  {
    name: "Tammy baker",
    rating: 5,
    text: `Chris did a fantastic job on the exterior of my f250 and an inside and out detail of my wife’s Expedition. Both vehicles are black so I would be able to see any missed spots.  Chris arrived on time and ready to work and his prices are very reasonable.  I highly recommend for you car detailing needs.`,
  },
  {
    name: "LidiaGator",
    rating: 5,
    text: `Chris did a fabulous job. He was responsive during appt set up communications, he reconfirmed prior & showed up promptly.

My car looks like it did the day I bought it. I’d highly recommend him!!!`,
  },
  {
    name: "Brenda Keller",
    rating: 5,
    text: `I give Shine Mobile Car Detailing 5 + stars, my car looks like it just rolled out of a Lincoln show room..Chris did a superb job, he is very professional and takes a lot of pride in his work. Here are a few pictures, Thank you so much Chris for making my car have that show room shine again ❤️`,
  },
];

// Where the reviews on the page come from.
//   "manual" — the list above. Full control, nothing can change on its own.
//   "google" — pulled live from the Google Business Profile API instead
//              (lib/googleReviews.ts). Needs the Google keys set up in Vercel;
//              if they are missing the page quietly falls back to the list
//              above, so the site is never left with no reviews.
export const REVIEWS_SOURCE: "manual" | "google" = "manual";

// The "See all reviews on Google" button. This is the share link from the
// Google Business Profile.
export const GOOGLE_REVIEWS_URL =
  "https://maps.app.goo.gl/dqWzddQBFShN4KqB8?g_st=ic";
