import { NextRequest, NextResponse } from "next/server";
import {
  BASE_PRICES,
  SERVICE_LABELS,
  SIZE_LABELS,
  SIZE_SURCHARGE,
  detectNoteUpcharges,
  formatRange,
  isMember,
  MEMBERSHIP_LABELS,
  type Membership,
} from "@/lib/pricing";

// ── Appointment REQUEST route ─────────────────────────────────────────────────
//
// Records nothing and confirms nothing: it emails the owner the details of a
// requested appointment so they can review it, quote it, and confirm manually.
//
// Deliberately does NOT call createBookingEvent — a request must never put a
// confirmed event on the owner's calendar. The instant-booking route
// (/api/book) still does that and is left intact for when BOOKING_MODE is
// switched back to "instant".
//
// The estimate below is FOR THE OWNER ONLY — a starting point for the quote
// they send. It is never presented to the customer as a price.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      service, vehicleSize, vehicleMake, vehicleColor,
      date, time, altDate, altTime,
      address, city, zip, condition,
      name, email, phone, promoCode, membership,
    } = body;

    if (!service || !vehicleSize || !date || !time || !name || !email || !phone) {
      return NextResponse.json(
        { error: "Missing required request fields" },
        { status: 400 }
      );
    }

    const basePrice = BASE_PRICES[service];
    if (basePrice === undefined) {
      return NextResponse.json({ error: "Invalid service" }, { status: 400 });
    }

    // Owner-facing estimate only — the quote is written by hand afterwards.
    // Add-ons are ranges, so the estimate is a range too: the low end is what
    // most jobs cost, the high end only if the vehicle is genuinely severe.
    const sizeSurcharge = SIZE_SURCHARGE[vehicleSize] ?? 0;
    const upcharges = detectNoteUpcharges(condition ?? "", vehicleSize, membership);
    const estimateLow  = basePrice + sizeSurcharge + upcharges.min;
    const estimateHigh = basePrice + sizeSurcharge + upcharges.max;
    const estimate = estimateLow === estimateHigh
      ? `$${estimateLow.toFixed(2)}`
      : `$${estimateLow.toFixed(2)}–$${estimateHigh.toFixed(2)}`;

    // Conditional lines are `undefined` (not "") so the blank spacer lines
    // between blocks survive the filter and the email stays scannable.
    const summaryLines: (string | undefined)[] = [
      `NEW APPOINTMENT REQUEST — NOT CONFIRMED`,
      `Review, quote, and confirm with the customer directly.`,
      ``,
      `Customer: ${name}`,
      `Email:    ${email}`,
      `Phone:    ${phone}`,
      ``,
      `Service:  ${SERVICE_LABELS[service] ?? service}`,
      `Vehicle:  ${SIZE_LABELS[vehicleSize] ?? vehicleSize}${vehicleMake ? ` — ${vehicleMake}` : ""}${vehicleColor ? ` (${vehicleColor})` : ""}`,
      ``,
      `Preferred: ${date} at ${time}`,
      altDate || altTime
        ? `Alternate: ${altDate || date}${altTime ? ` at ${altTime}` : ""}`
        : undefined,
      address ? `Address:   ${address}, ${city ?? ""} ${zip ?? ""}` : undefined,
      promoCode ? `Promo:     ${promoCode}` : undefined,
      isMember(membership)
        ? `Member:    ${MEMBERSHIP_LABELS[membership as Membership]} (self-reported — verify)`
        : undefined,
      ``,
      `Vehicle condition (customer's words):`,
      condition ? condition : "(not provided)",
      ``,
      `Starting estimate for your quote: ${estimate}`,
      `  base ${SERVICE_LABELS[service] ?? service} $${basePrice.toFixed(2)}`,
      sizeSurcharge ? `  truck / SUV +$${sizeSurcharge.toFixed(2)}` : undefined,
      upcharges.petHair.max ? `  pet hair +${formatRange(upcharges.petHair)}` : undefined,
      upcharges.stains.max  ? `  staining +${formatRange(upcharges.stains)}`  : undefined,
      upcharges.coating.max ? `  ceramic + clay bar +${formatRange(upcharges.coating)}` : undefined,
      `  (auto-detected from the condition text — confirm before quoting)`,
      ``,
      `No calendar event was created for this request.`,
    ];

    const summary = summaryLines
      .filter((line): line is string => line !== undefined)
      .join("\n");

    // Same notification path the rest of the site uses (Resend, falling back to
    // a server log when the key isn't configured).
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(apiKey);
        await resend.emails.send({
          from:    "Attention to Shine <onboarding@resend.dev>",
          to:      process.env.CONTACT_EMAIL ?? "lilliechris06@gmail.com",
          replyTo: email,
          subject: `[Appointment Request] ${name} — ${date} at ${time}`,
          text: summary,
        });
      } catch (emailError) {
        // An email failure is the whole delivery mechanism here, so unlike the
        // booking route (which still had a calendar event to fall back on),
        // report it rather than reporting a success the owner never sees.
        console.error("Appointment request email failed:", emailError);
        return NextResponse.json(
          { error: "We couldn't send your request. Please call (863) 934-9779." },
          { status: 502 }
        );
      }
    } else {
      console.log("📨 Appointment request (RESEND_API_KEY not set):", summary);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Appointment request route error:", error);
    return NextResponse.json(
      { error: "Failed to submit your request" },
      { status: 500 }
    );
  }
}
