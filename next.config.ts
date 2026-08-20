import type { NextConfig } from "next";

// Every URL the Squarespace site had indexed, mapped to its closest home here.
// Sourced from the old sitemap.xml (46 entries) — anything whose subject still
// has a page gets a real target; the rest land on the homepage, which is the
// work showcase. All permanent: none of these paths come back.
const LEGACY_REDIRECTS: Record<string, string> = {
  // Project pages with a detail page on the new site
  '/moment': '/work/dolby-moment',
  '/light-around-us': '/work/the-light-around-us',
  '/light-around-us-1': '/work/the-light-around-us',
  '/the-light-around-us-1': '/work/the-light-around-us',
  '/scatter': '/work/scatter-and-rise',

  // Gestures and the GIF-booth lineage it grew out of
  '/gesture': '/ideas/gestures',
  '/gesture-gesture': '/ideas/gestures',
  '/gifbooth': '/ideas/gestures',
  '/gifbooth2': '/ideas/gestures',
  '/volvox-gifs': '/ideas/gestures',

  // 9to5.tv, which had four URLs on the old site
  '/9to5': '/ideas/9to5-tv',
  '/9to5-1': '/ideas/9to5-tv',
  '/9to5wip': '/ideas/9to5-tv',
  '/9to5-workinprogress': '/ideas/9to5-tv',

  // Writing and contact
  '/news': '/ideas',
  '/contact-1': '/contact',
  '/contact4': '/contact',
  // Studio rental has no page yet; contact is the working equivalent.
  '/rent': '/contact',

  // Work that lives on as a card on the homepage but has no detail page yet:
  // Snowblind, Sound Journeys, StoryBooth, Orbitals, Between The Two of These,
  // Deconstructed Anthems.
  '/experiential': '/',
  '/snowblind': '/',
  '/sound-journeys': '/',
  '/sound-journeys-2': '/',
  '/journey': '/',
  '/storybooth': '/',
  '/orbitalsv1': '/',
  '/between': '/',
  '/arcs': '/',
  '/christopher-tignor': '/',
  '/tignor': '/',
  '/deconstructed-anthems': '/',

  // Squarespace scaffolding and abandoned drafts
  '/media': '/',
  '/gallery': '/',
  '/random-image': '/',
  '/enter': '/',
  '/enter-1': '/',
  '/enter-2': '/',
  '/new-cover-page': '/',
  '/new-page': '/',
  '/new-page-2': '/',
  '/new-page-4': '/',
  '/new-page-5': '/',
  '/contenthome': '/',
  '/about111': '/',
  '/fshawr': '/',
  '/read-me-adversary': '/',
};

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
      // Squarespace hung deep paths off the project URL; catch those too.
      { source: '/light-around-us/:hash*', destination: '/work/the-light-around-us', permanent: true },
    ]
  },
};

export default nextConfig;
