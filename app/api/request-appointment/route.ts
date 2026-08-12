import { NextRequest, NextResponse } from "next/server";
import { SIZE_SURCHARGE, detectNoteUpcharges } from "@/lib/pricing";

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

const BASE_PRICES: Record<string, number> = {
  exterior: 100,
  interior: 140,
  full:     200,
};

const SERVICE_LABELS: Record<string, string> = {
  exterior: "Exterior Detail",
  interior: "Interior Detail",
  full:     "Full Detail Package",
};

const SIZE_LABELS: Record<string, string> = {
  sedan:   "Sedan / Coupe",
  minivan: "Minivan",
  suv:     "SUV",
  truck:   "Large Truck / Van",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      service, vehicleSize, vehicleMake, vehicleColor,
      date, time, altDate, altTime,
      address, city, zip, condition,
      name, email, phone, promoCode,
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
    const sizeSurcharge = SIZE_SURCHARGE[vehicleSize] ?? 0;
    const upcharges = detectNoteUpcharges(condition ?? "", vehicleSize);
    const upchargeTotal = upcharges.petHair + upcharges.stains + upcharges.coating;
    const estimate = basePrice + sizeSurcharge + upchargeTotal;

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
      ``,
      `Vehicle condition (customer's words):`,
      condition ? condition : "(not provided)",
      ``,
      `Starting estimate for your quote: $${estimate.toFixed(2)}`,
      `  base ${SERVICE_LABELS[service] ?? service} $${basePrice.toFixed(2)}`,
      sizeSurcharge ? `  vehicle size +$${sizeSurcharge.toFixed(2)}` : undefined,
      upcharges.petHair ? `  pet hair +$${upcharges.petHair.toFixed(2)}` : undefined,
      upcharges.stains  ? `  staining +$${upcharges.stains.toFixed(2)}` : undefined,
      upcharges.coating ? `  coating +$${upcharges.coating.toFixed(2)}` : undefined,
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
