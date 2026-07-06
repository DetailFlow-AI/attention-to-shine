import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createBookingEvent } from "@/lib/googleCalendar";
import { CALENDAR_SERVICE_LABELS } from "@/lib/bookingRules";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
});

const SERVICE_LABELS = CALENDAR_SERVICE_LABELS;

// Called by the booking form after an online payment succeeds. The payment
// status is verified directly with Stripe — the client only supplies the
// intent ID — and the appointment details come from the intent's metadata,
// so this can't be used to create events for unpaid bookings.

export async function POST(req: NextRequest) {
  try {
    const { paymentIntentId } = await req.json();
    if (!paymentIntentId || typeof paymentIntentId !== "string") {
      return NextResponse.json({ error: "paymentIntentId required" }, { status: 400 });
    }

    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (intent.status !== "succeeded") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }
    if (intent.metadata.calendarEventCreated === "true") {
      return NextResponse.json({ success: true, alreadyCreated: true });
    }

    const m = intent.metadata;
    if (!m.date || !m.time) {
      // Intent predates appointment metadata — nothing to schedule
      return NextResponse.json({ success: true, skipped: true });
    }

    const description = [
      `PAID ONLINE — $${(intent.amount / 100).toFixed(2)}`,
      ``,
      `Customer: ${m.customerName}`,
      `Email:    ${m.customerEmail}`,
      m.customerPhone ? `Phone:    ${m.customerPhone}` : "",
      ``,
      `Service:  ${SERVICE_LABELS[m.service] ?? m.service}`,
      `Vehicle:  ${m.vehicleSize}${m.vehicleMake ? ` — ${m.vehicleMake}` : ""}${m.vehicleColor ? ` (${m.vehicleColor})` : ""}`,
      `Address:  ${m.address}, ${m.city ?? ""} ${m.zip ?? ""}`,
      m.notes ? `Notes:    ${m.notes}` : "",
      m.promoCode ? `Promo:    ${m.promoCode}` : "",
    ].filter(Boolean).join("\n");

    const { ok: created } = await createBookingEvent({
      summary: `${SERVICE_LABELS[m.service] ?? m.service} at ${m.time} — ${m.customerName} (paid online)`,
      description,
      date: m.date,
      time: m.time,
      service: m.service,
    });

    // Email the owner — paid-online bookings previously created a calendar
    // event but never sent the confirmation email. Failures are logged, not
    // fatal: the payment already succeeded.
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(apiKey);
        await resend.emails.send({
          from:    "Attention to Shine <onboarding@resend.dev>",
          to:      process.env.CONTACT_EMAIL ?? "lilliechris06@gmail.com",
          replyTo: m.customerEmail || undefined,
          subject: `[Booking — Paid Online] ${m.customerName} — ${m.date} at ${m.time}`,
          text: description,
        });
      } catch (emailError) {
        console.error("Paid-online confirmation email failed:", emailError);
      }
    } else {
      console.log("📅 Paid-online booking (RESEND_API_KEY not set):", description);
    }

    if (created) {
      // Mark the intent so retries or page refreshes don't duplicate the event
      await stripe.paymentIntents.update(paymentIntentId, {
        metadata: { calendarEventCreated: "true" },
      });
    }

    return NextResponse.json({ success: true, calendarEventCreated: created });
  } catch (error) {
    console.error("Confirm booking error:", error);
    return NextResponse.json({ error: "Failed to confirm booking" }, { status: 500 });
  }
}
