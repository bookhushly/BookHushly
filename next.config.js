const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
  },
  fallbacks: {
    document: "/offline",
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Cloudinary CDN
      { protocol: "https", hostname: "res.cloudinary.com" },
      // Supabase storage
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
      // Common stock photo / placeholder sources used in dev
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      // Paystack avatar / receipt images
      { protocol: "https", hostname: "*.paystack.com" },
    ],
    // Serve modern formats automatically
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    serverActions: {
      // 10MB is more reasonable — 500MB was dangerously large
      bodySizeLimit: "10mb",
    },
  },
  // Silence the webpack-config-with-Turbopack error (next-pwa adds webpack config)
  turbopack: {},
};

module.exports = withPWA(nextConfig);
