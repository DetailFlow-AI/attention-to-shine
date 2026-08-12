// Customer-facing flow mode — the one switch that turns instant booking into
// request-and-quote and back.
//
//   "request" (current)
//     The customer submits an appointment REQUEST. It is emailed to the owner,
//     who reviews it, sends a quote, and confirms manually. Nothing is
//     presented as booked and NO calendar event is created on submit.
//
//   "instant"
//     The original flow: submitting confirms the appointment immediately and
//     creates the Google Calendar event via /api/book. That code is untouched
//     and still wired up — flipping BOOKING_MODE back to "instant" restores it.
//
// Either way the availability logic is live: the date picker and time slots
// still read the owner's calendar, so existing events keep blocking times.
// The typed alias (rather than a literal) keeps both branches type-checked
// while only one of them is switched on.

export type BookingMode = "request" | "instant";

export const BOOKING_MODE: BookingMode = "request";

// Compared through a widened alias so TypeScript keeps both branches of every
// `INSTANT_BOOKING_ENABLED ? … : …` type-checked, instead of narrowing the mode
// to its current literal and treating the other branch as dead code.
const activeMode: string = BOOKING_MODE;

export const INSTANT_BOOKING_ENABLED = activeMode === "instant";

// Labels for every entry point into the flow, so renaming it is a
// one-constant change rather than a hunt through the pages.
export const FLOW_TITLE = INSTANT_BOOKING_ENABLED
  ? "Book a Detail"
  : "Request an Appointment";

// Call-to-action used on buttons across the site.
export const FLOW_CTA = INSTANT_BOOKING_ENABLED
  ? "Book Your Detail"
  : "Request an Appointment";

// Tighter variant for the nav pill and other narrow buttons.
export const FLOW_CTA_SHORT = INSTANT_BOOKING_ENABLED
  ? "Book Now"
  : "Request Appointment";
