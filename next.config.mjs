/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow HEIC files to be skipped gracefully and all JPEG/JPG/PNG to load
    remotePatterns: [],
    // Local images in /public are served automatically — no extra config needed
  },
};

export default nextConfig;
