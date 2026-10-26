// Helpers that let photos be added by dropping files into /public/images/...
// with no code changes. The file list comes from lib/photo-manifest.json,
// which scripts/generate-photo-manifest.mjs writes before every dev/build, so
// a new photo appears once the site is rebuilt (committing the image and
// pushing is enough — Vercel rebuilds on push).
//
// Don't go back to reading /public with fs here: the homepage revalidates in
// a serverless function that has no /public folder (next.config.mjs excludes
// it), so a runtime directory read finds nothing and every slider silently
// turns back into a placeholder.

import path from "path";
import manifest from "./photo-manifest.json";

const FOLDERS = manifest as Record<string, string[]>;

// Accepted image types, in the order we prefer them when several exist for the
// same name. Covers the common phone/camera outputs so a .jpeg or .png works
// just as well as a .jpg. (Keep in sync with the generator script.)
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

function filesIn(dirRelativeToPublic: string): string[] {
  return FOLDERS[dirRelativeToPublic.replace(/^\/+|\/+$/g, "")] ?? [];
}

/**
 * Looks for `baseName` with any supported extension inside a folder under
 * /public. Returns the web path (e.g. "/images/.../exterior-before.jpg") or
 * undefined when no such file has been added yet.
 */
export function findImage(
  dirRelativeToPublic: string,
  baseName: string
): string | undefined {
  const entries = filesIn(dirRelativeToPublic);
  for (const ext of IMAGE_EXTENSIONS) {
    const match = entries.find(
      (f) => f.toLowerCase() === `${baseName}${ext}`.toLowerCase()
    );
    if (match) return `/${dirRelativeToPublic}/${match}`;
  }
  return undefined;
}

/**
 * A before/after pair, but only when BOTH halves are present. A half-populated
 * pair would render a broken slider, so it stays a placeholder instead.
 */
export function findPair(
  dirRelativeToPublic: string,
  baseName: string
): { before: string; after: string } | undefined {
  const before = findImage(dirRelativeToPublic, `${baseName}-before`);
  const after = findImage(dirRelativeToPublic, `${baseName}-after`);
  return before && after ? { before, after } : undefined;
}

/**
 * Every image in a folder, sorted naturally so a "02-" prefix orders before
 * "10-". Returns web paths.
 */
export function listImages(dirRelativeToPublic: string): string[] {
  return [...filesIn(dirRelativeToPublic)]
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((f) => `/${dirRelativeToPublic}/${f}`);
}

// ── Caption generation ────────────────────────────────────────────────────────

// Known service phrases, longest first so "interior deep clean" wins over
// "interior". Each maps to how it should read in a caption.
const SERVICE_PHRASES: { tokens: string[]; label: string }[] = [
  { tokens: ["interior", "deep", "clean"], label: "Interior Deep Clean" },
  { tokens: ["clay", "bar"], label: "Ceramic Protection & Clay Bar" },
  { tokens: ["protection", "coating"], label: "Ceramic Protection" },
  { tokens: ["ceramic", "coating"], label: "Ceramic Protection" },
  { tokens: ["full", "detail"], label: "Full Detail" },
  { tokens: ["exterior", "detail"], label: "Exterior Detail" },
  { tokens: ["interior", "detail"], label: "Interior Detail" },
  { tokens: ["deep", "clean"], label: "Interior Deep Clean" },
  { tokens: ["maintenance"], label: "Shine Standard Maintenance" },
  { tokens: ["coating"], label: "Ceramic Protection" },
  { tokens: ["exterior"], label: "Exterior Detail" },
  { tokens: ["interior"], label: "Interior Detail" },
  { tokens: ["full"], label: "Full Detail" },
  { tokens: ["detail"], label: "Detail" },
];

// Tokens that carry no meaning in a caption. "before"/"after" are stripped
// deliberately — gallery photos are results, never comparison halves.
const NOISE_TOKENS = new Set([
  "before",
  "after",
  "img",
  "dsc",
  "dscf",
  "screenshot",
  "image",
  "photo",
  "pic",
  "final",
  "done",
  "copy",
  "edited",
  "new",
]);

// Words that should stay fully capitalised rather than title-cased.
const ACRONYMS = new Set([
  "gmc", "bmw", "gt", "gts", "ss", "rs", "rt", "srt", "amg", "trd", "suv",
  "ev", "xl", "xlt", "lt", "ltz", "tt", "m3", "m5", "x3", "x5", "q5", "q7",
  "cx5", "crv", "rav4", "wrx", "sti", "gti", "z71", "4x4", "usa",
]);

// Recognised makes and models. Used to decide whether a single leftover word
// is really a vehicle name ("porsche") or just an unhelpful filename
// ("randomfile"), which falls back to the generic caption instead.
const VEHICLE_WORDS = new Set([
  "acura", "aston", "audi", "bentley", "bmw", "buick", "cadillac", "chevy",
  "chevrolet", "chrysler", "dodge", "ferrari", "ford", "genesis", "gmc",
  "honda", "hyundai", "infiniti", "jaguar", "jeep", "kia", "lamborghini",
  "land", "lexus", "lincoln", "maserati", "mazda", "mercedes", "benz", "mini",
  "mitsubishi", "nissan", "porsche", "ram", "range", "rover", "subaru",
  "tesla", "toyota", "volkswagen", "vw", "volvo",
  "accord", "altima", "bronco", "camaro", "camry", "challenger", "charger",
  "civic", "corolla", "corvette", "defender", "escalade", "expedition",
  "explorer", "highlander", "maverick", "maxima", "mustang", "navigator",
  "raptor", "sierra", "silverado", "suburban", "tacoma", "tahoe", "tundra",
  "wrangler",
]);

function titleCaseToken(token: string): string {
  if (ACRONYMS.has(token)) return token.toUpperCase();
  // "f150" → "F-150". Restricted to the Ford F-series pattern so trims like
  // "m60" or "q50" keep their usual unhyphenated form.
  const fSeries = token.match(/^f(\d{3})$/);
  if (fSeries) return `F-${fSeries[1]}`;
  return token.charAt(0).toUpperCase() + token.slice(1);
}

/**
 * Turns a filename into a short, natural caption.
 *
 *   "toyota-camry-full-detail.jpg"  → "Full Detail — Toyota Camry"
 *   "gmc-sierra-exterior.jpg"       → "Exterior Detail — GMC Sierra"
 *   "03-range-rover-interior.jpeg"  → "Interior Detail — Range Rover"
 *   "IMG_4821.jpg"                  → "Recent Detail — Lakeland, FL"
 *
 * Never emits the words "before" or "after".
 */
export function captionFromFilename(filePathOrName: string): string {
  const base = path.basename(filePathOrName, path.extname(filePathOrName));

  let tokens = base
    .split(/[-_\s.]+/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .filter((t) => !NOISE_TOKENS.has(t));

  // Drop a leading ordering prefix ("01-...") but keep numbers elsewhere, so
  // model names like "porsche-911" survive intact.
  if (tokens.length > 1 && /^\d+$/.test(tokens[0])) tokens = tokens.slice(1);

  // Pull out the service phrase, leaving the vehicle behind.
  let service: string | undefined;
  for (const phrase of SERVICE_PHRASES) {
    for (let i = 0; i + phrase.tokens.length <= tokens.length; i++) {
      const window = tokens.slice(i, i + phrase.tokens.length);
      if (window.every((t, j) => t === phrase.tokens[j])) {
        service = phrase.label;
        tokens = [...tokens.slice(0, i), ...tokens.slice(i + phrase.tokens.length)];
        break;
      }
    }
    if (service) break;
  }

  // Treat the leftovers as a vehicle name only when they actually read like
  // one: either a recognised make/model appears, or it's two or more plain
  // words. That keeps camera filenames ("DSC_0032") out of captions.
  const hasKnownVehicle = tokens.some((t) => VEHICLE_WORDS.has(t));
  const allAlphabetic = tokens.every((t) => /^[a-z]+$/.test(t));
  const looksLikeVehicle =
    hasKnownVehicle || (allAlphabetic && tokens.length > 1);
  const vehicle = looksLikeVehicle
    ? tokens.map(titleCaseToken).join(" ").trim()
    : "";

  if (service && vehicle) return `${service} — ${vehicle}`;
  if (service) return `${service} — Lakeland, FL`;
  if (vehicle) return `Recent Detail — ${vehicle}`;
  return "Recent Detail — Lakeland, FL";
}
