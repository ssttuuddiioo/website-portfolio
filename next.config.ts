import type { NextConfig } from "next";

// The legacy URL map lives in src/lib so the homepage's hash handler can read
// the same source — see the file header for why old #fragments need their own
// path. Everything here is permanent (Next emits 308, which crawlers treat as
// 301): none of these URLs come back.
import { LEGACY_REDIRECTS } from './src/lib/legacy-redirects'

const nextConfig: NextConfig = {
  devIndicators: false,
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
  async redirects() {
    return [
      // The agency experience is now the homepage; keep the old /agency URL working.
      { source: '/agency', destination: '/', permanent: true },
      ...Object.entries(LEGACY_REDIRECTS).map(([source, destination]) => ({
        source,
        destination,
        permanent: true,
      })),
      // Squarespace hung deep gallery paths off the project URL; catch those
      // too (six of them were still 302'ing on the old site).
      { source: '/light-around-us/:hash*', destination: '/work/the-light-around-us', permanent: true },
      { source: '/the-light-around-us/:hash*', destination: '/work/the-light-around-us', permanent: true },
    ]
  },
};

export default nextConfig;
