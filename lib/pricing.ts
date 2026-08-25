// Shared pricing rules for the booking form (client) and the API routes
// (server). Amounts here are in DOLLARS; the server routes multiply by 100 for
// Stripe cents. Centralizing keeps the displayed estimate and the charged /
// recorded totals from ever drifting apart.

// Vehicle-size surcharge added to every service. Sedan/coupe is the base;
// minivans add $20; SUVs and large trucks/vans add $40.
export const SIZE_SURCHARGE: Record<string, number> = {
  sedan:   0,
  minivan: 20,
  suv:     40,
  truck:   40,
};

// 1-Year Protection Coating add-on, priced by vehicle size. Starts at $50 and
// scales up with size ($50 / $100 / $150).
export const COATING_PRICE: Record<string, number> = {
  sedan:   50,
  minivan: 100,
  suv:     150,
  truck:   150,
};

// Note-detected add-on tiers (dollars). Pet hair and staining each have a
// starting rate and a higher "severe" rate.
export const PET_HAIR_BASE   = 20;
export const PET_HAIR_SEVERE = 40;
export const STAIN_BASE      = 30;
export const STAIN_SEVERE    = 50;

// Words that bump pet hair / staining to the higher "severe" rate when they
// appear right before the pet-hair or stain mention (e.g. "severe pet hair",
// "heavy staining", "covered in dog hair"). "light …" or an unqualified
// mention stays at the starting rate.
const SEVERE_QUALIFIERS = [
  "severe", "heavy", "excessive", "extreme", "really bad", "very bad",
  "lots of", "tons of", "a lot of", "full of", "covered in", "bad",
];

const PET_HAIR_KEYWORDS = [
  "pet hair", "dog hair", "cat hair", "animal hair",
  "pet fur", "dog fur", "cat fur", "fur",
];

const STAIN_KEYWORDS = ["staining", "stains", "stain"];

const COATING_KEYWORDS = [
  "protection coating", "protective coating",
  "1 year coating", "one year coating",
  "add coating", "wax coating", "coating",
];

function includesAny(text: string, kws: string[]): boolean {
  return kws.some((kw) => text.includes(kw));
}

// True when a severe qualifier immediately precedes one of the keywords,
// e.g. "severe pet hair", "heavy staining", "covered in dog hair".
function hasSevere(text: string, kws: string[]): boolean {
  return kws.some((kw) =>
    SEVERE_QUALIFIERS.some((q) => text.includes(`${q} ${kw}`))
  );
}

export interface NoteUpcharges {
  petHair: number; // dollars
  stains:  number; // dollars
  coating: number; // dollars
}

// Shine Standard Maintenance tier, as reported by the customer on the booking
// form. Self-reported and unverified — the owner confirms it when quoting.
export type Membership = "none" | "essential" | "premium";

export const MEMBERSHIP_LABELS: Record<Membership, string> = {
  none:      "Not a member",
  essential: "Essential Plan member",
  premium:   "Premium Plan member",
};

// Both paid tiers include pet hair removal at no charge — Essential lists it
// outright and Premium inherits everything in Essential.
export function isMember(membership?: string): boolean {
  return membership === "essential" || membership === "premium";
}

// Detects note-driven add-ons from free-text booking notes. Pet hair and
// staining are tiered: a "severe/heavy …" mention charges the higher rate,
// anything else (including "light …") charges the starting rate. Coating is
// priced by vehicle size.
//
// Members never pay the pet hair upcharge, so a claimed membership zeroes it
// out regardless of what the notes say. Staining and coating are unaffected —
// neither is included in a plan.
export function detectNoteUpcharges(
  notes: string,
  vehicleSize: string,
  membership?: string
): NoteUpcharges {
  const lower = (notes ?? "").toLowerCase();

  const petHairPresent = includesAny(lower, PET_HAIR_KEYWORDS) && !isMember(membership);
  const stainPresent   = includesAny(lower, STAIN_KEYWORDS);
  const coatingPresent = includesAny(lower, COATING_KEYWORDS);

  return {
    petHair: petHairPresent
      ? (hasSevere(lower, PET_HAIR_KEYWORDS) ? PET_HAIR_SEVERE : PET_HAIR_BASE)
      : 0,
    stains: stainPresent
      ? (hasSevere(lower, STAIN_KEYWORDS) ? STAIN_SEVERE : STAIN_BASE)
      : 0,
    coating: coatingPresent ? (COATING_PRICE[vehicleSize] ?? 50) : 0,
  };
}
