// Writes lib/photo-manifest.json: every folder under /public/images and the
// image files inside it. Runs before `next dev` and `next build` (see the
// predev/prebuild scripts in package.json).
//
// Why this exists: lib/photos.ts used to read /public with fs at render time.
// That works during the build, but the homepage revalidates (ISR) to pick up
// new Google reviews, and the re-render runs inside the serverless function —
// which deliberately does NOT contain /public (see next.config.mjs). The
// directory read failed there, every pair looked "missing", and the site
// swapped the sliders for placeholders until the next deploy. Baking the file
// list into JSON makes it part of the bundle, so the re-render sees exactly
// what the build saw.

import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const IMAGES_DIR = path.join(ROOT, "public", "images");
const OUT = path.join(ROOT, "lib", "photo-manifest.json");
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

const manifest = {};

function walk(absDir) {
  const entries = fs.readdirSync(absDir, { withFileTypes: true });
  const rel = path.relative(path.join(ROOT, "public"), absDir).split(path.sep).join("/");
  const files = entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((f) => IMAGE_EXTENSIONS.includes(path.extname(f).toLowerCase()))
    .sort();
  if (files.length) manifest[rel] = files;
  for (const e of entries) if (e.isDirectory()) walk(path.join(absDir, e.name));
}

if (fs.existsSync(IMAGES_DIR)) walk(IMAGES_DIR);
fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2) + "\n");

const count = Object.values(manifest).reduce((n, f) => n + f.length, 0);
console.log(`photo manifest: ${count} images in ${Object.keys(manifest).length} folders`);
