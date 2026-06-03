import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
});
// ── Base prices (cents) ───────────────────────────────────────────────────────

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

// ── Coating prices by vehicle size (cents) ────────────────────────────────────

const COATING_PRICES: Record<string, number> = {
  sedan: 10000,
  suv:   15000,
  truck: 20000,
};

// ── Keyword detection — mirrors client-side logic exactly ────────────────────

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

interface NoteUpcharges {
  petHair: number; // cents
  stains:  number;
  coating: number;
}

function detectNoteUpcharges(notes: string, vehicleSize: string): NoteUpcharges {
  const lower = (notes ?? "").toLowerCase();

  const hasPetHair = PET_HAIR_KEYWORDS.some((kw) => lower.includes(kw));
  const hasStains  = STAIN_KEYWORDS.some((kw)    => lower.includes(kw));
  const hasCoating = COATING_KEYWORDS.some((kw)  => lower.includes(kw));

  return {
    petHair: hasPetHair ? 2000 : 0,
    stains:  hasStains  ? 3000 : 0,
    coating: hasCoating ? (COATING_PRICES[vehicleSize] ?? 10000) : 0,
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
      notes,
      customerName,
      customerEmail,
    } = body;

    if (!service || !vehicleSize) {
      return NextResponse.json(
        { error: "Missing required fields: service and vehicleSize" },
        { status: 400 }
      );
    }

    const basePrice = BASE_PRICES[service];
    if (basePrice === undefined) {
      return NextResponse.json({ error: "Invalid service" }, { status: 400 });
    }

    const sizeSurcharge = SIZE_SURCHARGES[vehicleSize] ?? 0;

    // Server-side upcharge detection — never trust client-sent totals
    const noteUpcharges = detectNoteUpcharges(notes ?? "", vehicleSize);
    const upchargeTotal = noteUpcharges.petHair + noteUpcharges.stains + noteUpcharges.coating;

    let amount = basePrice + sizeSurcharge + upchargeTotal;

    // Apply promo discount on the full total (15% off orders over $200)
    if (
      (promoCode ?? "").toUpperCase() === "SUMMER26" &&
      amount >= 20000
    ) {
      amount = Math.round(amount * 0.85);
    }

    // Build a readable description for the Stripe receipt
    const lineItems: string[] = [service];
    if (noteUpcharges.petHair)  lineItems.push("pet hair removal");
    if (noteUpcharges.stains)   lineItems.push("stain treatment");
    if (noteUpcharges.coating)  lineItems.push(`1-yr coating (${vehicleSize})`);
    if ((promoCode ?? "").toUpperCase() === "SUMMER26") lineItems.push("SUMMER26 discount");

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      description: `Attention to Shine — ${lineItems.join(", ")}`,
      metadata: {
        service,
        vehicleSize,
        promoCode:         promoCode    ?? "",
        customerName:      customerName ?? "",
        customerEmail:     customerEmail ?? "",
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
