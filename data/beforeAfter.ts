// The before/after sliders on the homepage.
//
// ── HOW TO CHANGE THESE ───────────────────────────────────────────────────────
// 1. Drop the two photos into  public/images/before-after/transformations/
//    (any name you like, e.g. accord-interior-before.jpg / -after.jpg)
// 2. Copy a { ... } block below, paste it, and point `before` and `after` at
//    your two files. Give it a short label.
// 3. To remove a pair, delete its block. To reorder them, move the blocks.
//
// Both photos of a pair should be the same shape and taken from the same spot,
// or the slider will look like it jumps when you drag it. Portrait (taller than
// wide) suits the layout best.

export interface BeforeAfterPair {
  /** Photo path, starting at /images/… */
  before: string;
  after: string;
  /** Shown under the slider, e.g. "Interior — Honda Accord". */
  label: string;
}

/**
 * The two big sliders in the scroll scene at the very top of the homepage.
 * Keep the labels "Exterior" and "Interior" — the scene's wording is tied to
 * them.
 *
 * Both sliders should show THE SAME VEHICLE (currently the black Ford Raptor),
 * outside then inside. A visitor seeing one car cleaned top to bottom pictures
 * their own car getting the same treatment; two different cars breaks that.
 */
export const HERO_PAIRS: BeforeAfterPair[] = [
  {
    label: "Exterior",
    before: "/images/before-after/hero/exterior-before.jpg",
    after: "/images/before-after/hero/exterior-after.jpg",
  },
  {
    label: "Interior",
    before: "/images/before-after/hero/interior-before.jpg",
    after: "/images/before-after/hero/interior-after.jpg",
  },
];

/** The "More Transformations" row further down the homepage. */
export const TRANSFORMATION_PAIRS: BeforeAfterPair[] = [
  {
    label: "Interior — Ford Explorer",
    before: "/images/before-after/transformations/ford-explorer-interior-before.jpg",
    after: "/images/before-after/transformations/ford-explorer-interior-after.jpg",
  },
  {
    label: "Cargo area — SUV",
    before: "/images/before-after/transformations/suv-cargo-before.jpg",
    after: "/images/before-after/transformations/suv-cargo-after.jpg",
  },
  {
    label: "Interior — Jeep console",
    before: "/images/before-after/transformations/jeep-console-interior-before.jpg",
    after: "/images/before-after/transformations/jeep-console-interior-after.jpg",
  },
  {
    label: "Interior — Ford Expedition",
    before: "/images/before-after/transformations/ford-expedition-interior-before.jpg",
    after: "/images/before-after/transformations/ford-expedition-interior-after.jpg",
  },
  {
    label: "Interior — Lincoln Navigator",
    before: "/images/before-after/transformations/lincoln-navigator-interior-before.jpg",
    after: "/images/before-after/transformations/lincoln-navigator-interior-after.jpg",
  },
  {
    label: "Wheels & tires — Ford truck",
    before: "/images/before-after/transformations/transformation-3-before.jpg",
    after: "/images/before-after/transformations/transformation-3-after.jpg",
  },
  {
    label: "Interior — Dodge Challenger",
    before: "/images/before-after/transformations/transformation-4-before.jpg",
    after: "/images/before-after/transformations/transformation-4-after.jpg",
  },
];
