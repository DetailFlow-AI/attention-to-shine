// Single source of truth for every price on the site.
//
// Display text, the booking form, the API routes and the owner-facing order
// summaries all read from here, so a price can never be changed in one place
// and left stale in another. Amounts are in DOLLARS; routes that talk to
// Stripe multiply by 100 for cents.
//
// Everything here is a STARTING price. The customer is shown an estimate with
// ranges, never an exact quote — the owner confirms the real number after
// seeing the vehicle.

// ── Base service prices ───────────────────────────────────────────────────────
// All "starting at".

export const BASE_PRICES: Record<string, number> = {
  exterior: 75,
  interior: 125,
  full:     175,
};

export const SERVICE_LABELS: Record<string, string> = {
  exterior: "Exterior Detail",
  interior: "Interior Detail",
  full:     "Full Detail Package",
};

// ── Vehicle size ──────────────────────────────────────────────────────────────
// Only trucks and SUVs carry an upcharge. Every other vehicle is the base
// price. The form offers two choices ("sedan" and "truck"), but "minivan" and
// "suv" stay in these maps so older submissions still price correctly.

export const SIZE_SURCHARGE: Record<string, number> = {
  sedan:   0,
  minivan: 0,
  suv:     25,
  truck:   25,
};

// The same rule on the maintenance plans, at the plan rate.
export const PLAN_SIZE_SURCHARGE: Record<string, number> = {
  sedan:   0,
  minivan: 0,
  suv:     20,
  truck:   20,
};

export const TRUCK_SUV_UPCHARGE      = 25; // one-time details
export const TRUCK_SUV_PLAN_UPCHARGE = 20; // maintenance plans

export const SIZE_LABELS: Record<string, string> = {
  sedan:   "Car, sedan or coupe",
  minivan: "Minivan",
  suv:     "SUV",
  truck:   "Truck or SUV",
};

// The two choices actually offered on the booking form.
export const VEHICLE_SIZE_OPTIONS = [
  { id: "sedan", label: "Car, sedan or coupe", adj: 0 },
  { id: "truck", label: "Truck or SUV",        adj: TRUCK_SUV_UPCHARGE },
] as const;

// ── Add-ons detected from the customer's notes ────────────────────────────────
// Each is a RANGE, not a fixed fee. Most jobs land at the low end; the high end
// only applies to genuinely severe cases. We deliberately do NOT try to guess
// severity from wording — the owner decides after seeing the vehicle.

export interface PriceRange {
  min: number;
  max: number;
}

export const PET_HAIR_RANGE: PriceRange = { min: 25, max: 50 };
export const STAIN_RANGE:    PriceRange = { min: 30, max: 80 };

// 6 Month Ceramic Protection & Clay Bar Treatment — priced by vehicle size, so
// once the size is known the amount is exact rather than a range.
export const COATING_NAME = "6 Month Ceramic Protection & Clay Bar Treatment";

export const COATING_PRICE: Record<string, number> = {
  sedan:   100,
  minivan: 100,
  suv:     150,
  truck:   150,
};

export const COATING_RANGE: PriceRange = { min: 100, max: 150 };

const PET_HAIR_KEYWORDS = [
  "pet hair", "dog hair", "cat hair", "animal hair",
  "pet fur", "dog fur", "cat fur", "fur",
];

const STAIN_KEYWORDS = ["staining", "stains", "stain"];

const COATING_KEYWORDS = [
  "ceramic", "clay bar", "claybar",
  "protection coating", "protective coating",
  "6 month", "six month",
  "add coating", "wax coating", "coating",
];

function includesAny(text: string, kws: string[]): boolean {
  return kws.some((kw) => text.includes(kw));
}

const NO_CHARGE: PriceRange = { min: 0, max: 0 };

export interface NoteUpcharges {
  petHair: PriceRange;
  stains:  PriceRange;
  coating: PriceRange;
  /** Sum of the low ends — the "normally it's just this" figure. */
  min: number;
  /** Sum of the high ends — the worst case. */
  max: number;
}

// ── Maintenance plans ─────────────────────────────────────────────────────────

/** Quarterly plan: one visit every 3 months, 2-visit minimum commitment. */
export const QUARTERLY_PLAN = {
  id:            "maintenance" as const,
  name:          "Shine Standard Maintenance",
  pricePerVisit: 140,
  visitsPerYear: 4,
  minVisits:     2,
  cadence:       "One visit every 3 months",
};

/** Monthly plan: one visit a month. */
export const MONTHLY_PLAN = {
  id:              "premium" as const,
  name:            "Shine Standard Premium",
  pricePerMonth:   100,
  cadence:         "One visit every month",
};

// What the quarterly plan saves against paying for a full detail four times a
// year. Derived so it can never contradict the prices above.
export const QUARTERLY_ANNUAL_SAVINGS =
  (BASE_PRICES.full - QUARTERLY_PLAN.pricePerVisit) * QUARTERLY_PLAN.visitsPerYear;

// Plan tier as reported by the customer. Self-reported and unverified — the
// owner confirms it when quoting.
export type Membership = "none" | "maintenance" | "premium";

export const MEMBERSHIP_LABELS: Record<Membership, string> = {
  none:        "Not a member",
  maintenance: `${QUARTERLY_PLAN.name} member`,
  premium:     `${MONTHLY_PLAN.name} member`,
};

// Both paid plans include pet hair removal at no charge.
export function isMember(membership?: string): boolean {
  return membership === "maintenance" || membership === "premium";
}

// ── Detection ─────────────────────────────────────────────────────────────────

// Reads the customer's free-text notes and returns the add-ons that likely
// apply, as ranges. Members never pay the pet hair upcharge. Staining and the
// ceramic treatment are unaffected — neither is included in a plan.
export function detectNoteUpcharges(
  notes: string,
  vehicleSize: string,
  membership?: string
): NoteUpcharges {
  const lower = (notes ?? "").toLowerCase();

  const petHair = includesAny(lower, PET_HAIR_KEYWORDS) && !isMember(membership)
    ? PET_HAIR_RANGE
    : NO_CHARGE;

  const stains = includesAny(lower, STAIN_KEYWORDS) ? STAIN_RANGE : NO_CHARGE;

  // Size is already known here, so the coating is an exact amount.
  const coatingAmount = COATING_PRICE[vehicleSize] ?? COATING_RANGE.min;
  const coating = includesAny(lower, COATING_KEYWORDS)
    ? { min: coatingAmount, max: coatingAmount }
    : NO_CHARGE;

  return {
    petHair,
    stains,
    coating,
    min: petHair.min + stains.min + coating.min,
    max: petHair.max + stains.max + coating.max,
  };
}

// ── Formatting helpers ────────────────────────────────────────────────────────

/** "$25" when the range is a single amount, "$25–$50" when it spans. */
export function formatRange(r: PriceRange): string {
  return r.min === r.max ? `$${r.min}` : `$${r.min}–$${r.max}`;
}

/** The estimate shown to the customer: a floor, or a span when add-ons apply. */
export function formatEstimate(min: number, max: number): string {
  return min === max ? `Starting at $${min}` : `$${min}–$${max}`;
}
