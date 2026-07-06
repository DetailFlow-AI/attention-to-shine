import { NextRequest, NextResponse } from "next/server";
import { createBookingEvent } from "@/lib/googleCalendar";
import { CALENDAR_SERVICE_LABELS } from "@/lib/bookingRules";

// ── Base prices (cents) — mirrors create-payment-intent exactly ───────────────

const BASE_PRICES: Record<string, number> = {
  exterior: 7999,
  interior: 11999,
  full:     15999,
};

const SIZE_SURCHARGES: Record<string, number> = {
  sedan: 0,
  suv:   2000,
  truck: 4000,
};

const COATING_PRICES: Record<string, number> = {
  sedan: 10000,
  suv:   15000,
  truck: 20000,
};

const PET_HAIR_KEYWORDS = [
  "pet hair", "dog hair", "cat hair", "animal hair",
  "pet fur", "dog fur", "cat fur", "fur",
];

const STAIN_KEYWORDS = [
  "heavy staining", "heavy stain", "staining",
  "stain", "stains",
];

const COATING_KEYWORDS = [
  "protection coating", "protective coating",
  "1 year coating", "one year coating",
  "add coating", "wax coating", "coating",
];

function detectNoteUpcharges(notes: string, vehicleSize: string) {
  const lower = (notes ?? "").toLowerCase();
  return {
    petHair: PET_HAIR_KEYWORDS.some((kw) => lower.includes(kw)) ? 2000 : 0,
    stains:  STAIN_KEYWORDS.some((kw) => lower.includes(kw))    ? 3000 : 0,
    coating: COATING_KEYWORDS.some((kw) => lower.includes(kw))
      ? (COATING_PRICES[vehicleSize] ?? 10000)
      : 0,
  };
}

// ── Route handler — records a pay-in-person booking and notifies the owner ────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      service, vehicleSize, vehicleMake, vehicleColor,
      date, time, address, city, zip, notes,
      name, email, phone, promoCode,
    } = body;

    if (!service || !vehicleSize || !date || !time || !address || !name || !email || !phone) {
      return NextResponse.json(
        { error: "Missing required booking fields" },
        { status: 400 }
      );
    }

    const basePrice = BASE_PRICES[service];
    if (basePrice === undefined) {
      return NextResponse.json({ error: "Invalid service" }, { status: 400 });
    }

    const sizeSurcharge = SIZE_SURCHARGES[vehicleSize] ?? 0;
    const upcharges = detectNoteUpcharges(notes ?? "", vehicleSize);
    let amount = basePrice + sizeSurcharge + upcharges.petHair + upcharges.stains + upcharges.coating;
    if ((promoCode ?? "").toUpperCase() === "SUMMER26" && amount >= 20000) {
      amount = Math.round(amount * 0.85);
    }

    const summaryLines = [
      `NEW BOOKING — PAY IN PERSON`,
      ``,
      `Customer: ${name}`,
      `Email:    ${email}`,
      `Phone:    ${phone}`,
      ``,
      `Service:  ${service}`,
      `Vehicle:  ${vehicleSize}${vehicleMake ? ` — ${vehicleMake}` : ""}${vehicleColor ? ` (${vehicleColor})` : ""}`,
      `Date:     ${date} at ${time}`,
      `Address:  ${address}, ${city ?? ""} ${zip ?? ""}`,
      notes ? `Notes:    ${notes}` : "",
      promoCode ? `Promo:    ${promoCode}` : "",
      ``,
      `Estimated total (collect on site): $${(amount / 100).toFixed(2)}`,
    ].filter(Boolean);

    // Put the appointment on the owner's Google Calendar. The title shows the
    // appointment time; the event itself spans prep hour + detail length.
    await createBookingEvent({
      summary: `${CALENDAR_SERVICE_LABELS[service] ?? service} at ${time} — ${name} (pay in person)`,
      description: summaryLines.join("\n"),
      date,
      time,
      service,
    });

    // Email the owner if Resend is configured — same pattern as the contact
    // route. An email failure must not fail the booking (the calendar event
    // already exists), so it's caught and logged.
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(apiKey);
        await resend.emails.send({
          from:    "Attention to Shine <onboarding@resend.dev>",
          to:      process.env.CONTACT_EMAIL ?? "lilliechris06@gmail.com",
          replyTo: email,
          subject: `[Booking — Pay in Person] ${name} — ${date} at ${time}`,
          text: summaryLines.join("\n"),
        });
      } catch (emailError) {
        console.error("Booking confirmation email failed:", emailError);
      }
    } else {
      console.log("📅 Pay-in-person booking (RESEND_API_KEY not set):", summaryLines.join("\n"));
    }

    return NextResponse.json({ success: true, amount: amount / 100 });
  } catch (error) {
    console.error("Booking route error:", error);
    return NextResponse.json(
      { error: "Failed to submit booking" },
      { status: 500 }
    );
  }
}
