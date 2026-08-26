/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // lib/photos.ts reads /public at BUILD time to discover vehicle photos.
    // Next's tracer sees that filesystem access and, left alone, copies every
    // image in /public into the serverless function — which pushed it past
    // Vercel's 250MB limit and failed the deploy.
    //
    // Excluding them is safe: every page that uses those helpers is statically
    // prerendered, so the reads have already happened by the time the function
    // exists, and Vercel serves /public as static assets separately.
    outputFileTracingExcludes: {
      "*": ["public/**"],
    },
  },
};

export default nextConfig;
