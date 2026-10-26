import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  BASE_PRICES as BASE_PRICE_DOLLARS,
  COATING_NAME,
  SIZE_SURCHARGE,
  detectNoteUpcharges as detectDollars,
} from "@/lib/pricing";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
});
interface NoteUpcharges {
  petHair: number; // cents
  stains:  number;
  coating: number;
}

// Shared detection works in dollars; convert to cents for Stripe. Add-ons are
// ranges now — charge the low end, which is what most jobs actually cost. The
// owner adjusts afterwards if the vehicle turns out to be worse than described.
function detectNoteUpcharges(
  notes: string,
  vehicleSize: string,
  membership?: string,
): NoteUpcharges {
  const d = detectDollars(notes, vehicleSize, membership);
  return {
    petHair: d.petHair.min * 100,
    stains:  d.stains.min  * 100,
    coating: d.coating.min * 100,
  };
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      service,
      vehicleSize,
      promoCode,
      membership,
      notes,
      customerName,
      customerEmail,
      customerPhone,
      date,
      time,
      address,
      city,
      vehicleMake,
      vehicleColor,
    } = body;

    if (!service || !vehicleSize) {
      return NextResponse.json(
        { error: "Missing required fields: service and vehicleSize" },
        { status: 400 }
      );
    }

    const baseDollars = BASE_PRICE_DOLLARS[service];
    if (baseDollars === undefined) {
      return NextResponse.json({ error: "Invalid service" }, { status: 400 });
    }
    const basePrice = baseDollars * 100;

    const sizeSurcharge = (SIZE_SURCHARGE[vehicleSize] ?? 0) * 100;

    // Server-side upcharge detection — never trust client-sent totals
    const noteUpcharges = detectNoteUpcharges(notes ?? "", vehicleSize, membership);
    const upchargeTotal = noteUpcharges.petHair + noteUpcharges.stains + noteUpcharges.coating;

    // No promo code discounts automatically. Any code the customer submits is
    // carried in metadata below and honored manually by the owner.
    const amount = basePrice + sizeSurcharge + upchargeTotal;

    // Build a readable description for the Stripe receipt
    const lineItems: string[] = [service];
    if (noteUpcharges.petHair)  lineItems.push("pet hair removal");
    if (noteUpcharges.stains)   lineItems.push("stain treatment");
    if (noteUpcharges.coating)  lineItems.push(`${COATING_NAME} (${vehicleSize})`);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      description: `Attention to Shine — ${lineItems.join(", ")}`,
      metadata: {
        service,
        vehicleSize,
        promoCode:         promoCode    ?? "",
        membership:        membership   ?? "none",
        customerName:      customerName ?? "",
        customerEmail:     customerEmail ?? "",
        customerPhone:     customerPhone ?? "",
        date:              date         ?? "",
        time:              time         ?? "",
        address:           (address ?? "").slice(0, 200),
        city:              city         ?? "",
        vehicleMake:       vehicleMake  ?? "",
        vehicleColor:      vehicleColor ?? "",
        notes:             (notes ?? "").slice(0, 500), // truncate for metadata limit
        upcharge_petHair:  String(noteUpcharges.petHair / 100),
        upcharge_stains:   String(noteUpcharges.stains  / 100),
        upcharge_coating:  String(noteUpcharges.coating / 100),
      },
      receipt_email: customerEmail ?? undefined,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount,
      // Return the breakdown so the client can confirm nothing changed
      breakdown: {
        base:          basePrice      / 100,
        sizeSurcharge: sizeSurcharge  / 100,
        petHair:       noteUpcharges.petHair / 100,
        stains:        noteUpcharges.stains  / 100,
        coating:       noteUpcharges.coating / 100,
        upchargeTotal: upchargeTotal  / 100,
        discount:      amount !== (basePrice + sizeSurcharge + upchargeTotal)
                         ? ((basePrice + sizeSurcharge + upchargeTotal) - amount) / 100
                         : 0,
        total:         amount / 100,
      },
    });

  } catch (error) {
    console.error("Stripe error:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
