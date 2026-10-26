/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Keep every /public image out of the serverless functions. An earlier
    // lib/photos.ts read /public with fs, so Next's tracer copied all of it into
    // the function — past Vercel's 250MB limit, failing the deploy. Vercel
    // serves /public as static assets separately, so the functions never need
    // it. That also means server code must never read /public at runtime:
    // photo discovery now goes through lib/photo-manifest.json, generated at
    // build time by scripts/generate-photo-manifest.mjs.
    outputFileTracingExcludes: {
      "*": ["public/**"],
    },
  },
};

export default nextConfig;
