import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
      { source: '/the-light-around-us-1', destination: '/the-light-around-us', permanent: true },
      { source: '/orbitalsv1', destination: '/orbitals', permanent: true },
      { source: '/light-around-us', destination: '/the-light-around-us', permanent: true },
      { source: '/light-around-us/', destination: '/the-light-around-us', permanent: true },
      { source: '/light-around-us/:hash*', destination: '/the-light-around-us', permanent: true },
    ]
  },
};

export default nextConfig;
