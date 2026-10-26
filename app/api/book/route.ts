import { NextRequest, NextResponse } from "next/server";
import { createBookingEvent } from "@/lib/googleCalendar";
import { CALENDAR_SERVICE_LABELS } from "@/lib/bookingRules";
import {
  BASE_PRICES as BASE_PRICE_DOLLARS,
  SIZE_SURCHARGE,
  detectNoteUpcharges,
  isMember,
  MEMBERSHIP_LABELS,
  type Membership,
} from "@/lib/pricing";

// ── Route handler — records a pay-in-person booking and notifies the owner ────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      service, vehicleSize, vehicleMake, vehicleColor,
      date, time, address, city, notes,
      name, email, phone, promoCode, membership,
    } = body;

    if (!service || !vehicleSize || !date || !time || !address || !name || !email || !phone) {
      return NextResponse.json(
        { error: "Missing required booking fields" },
        { status: 400 }
      );
    }

    const baseDollars = BASE_PRICE_DOLLARS[service];
    if (baseDollars === undefined) {
      return NextResponse.json({ error: "Invalid service" }, { status: 400 });
    }

    // Shared rules are in dollars; this route works in cents.
    const basePrice = baseDollars * 100;
    const sizeSurcharge = (SIZE_SURCHARGE[vehicleSize] ?? 0) * 100;
    const upcharges = detectNoteUpcharges(notes ?? "", vehicleSize, membership);
    // Add-ons are ranges now; record the low end — the owner confirms the rest.
    const upchargeCents = upcharges.min * 100;
    // No promo code discounts automatically; codes are honored manually.
    const amount = basePrice + sizeSurcharge + upchargeCents;

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
      `Address:  ${address}${city ? `, ${city}` : ""}`,
      notes ? `Notes:    ${notes}` : "",
      promoCode ? `Promo:    ${promoCode}` : "",
      isMember(membership)
        ? `Member:   ${MEMBERSHIP_LABELS[membership as Membership]} (self-reported — verify)`
        : "",
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
