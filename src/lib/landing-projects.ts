/* ============================================
   Landing index data
   Art-directed composition on a 12-column grid.
   Each image gets an explicit column AND row placement
   (colStart/colSpan + rowStart/rowSpan) so the layout
   reads as a composed scatter with intentional negative
   space and size variety — not a packed masonry.
   Images are AVIF-optimized in /public/landing/opt.

   `description` / `website` feed the homepage selected-work
   list (agency-featured-projects). Copy is draft-grade —
   replace with Pablo's voice before launch.
   ============================================ */

import type { Affinity } from './project-tags'

export interface LandingProject {
  title: string
  client: string
  /**
   * The client as one name, for the work index — where a full legal name
   * ("NY/NJ Super Bowl Host Committee") is more than the grid needs. Falls
   * back to `client` wherever the full name is already short.
   */
  clientShort?: string
  category: string
  year: number
  image: string
  /** Links to /work/[slug] when a detail page exists. */
  slug?: string
  /**
   * How strongly the project reads as each of the four poles — web,
   * installation, lighting, design. Weights are read as fractions of the whole
   * (see lib/project-tags), so a project's closest tag, its farthest, and its
   * point on the field all fall out of these four numbers. Nothing consumes
   * them yet; they exist so a proximity-driven field can be built on top.
   */
  affinity: Affinity
  /**
   * Further frames for the project's page, beyond `image` (which is always the
   * first tile). Only a handful of projects have more than one shot in
   * /public/landing/opt today — the page's media grid simply runs shorter for
   * the rest, and a project with a single frame shows it full-width.
   */
  images?: string[]
  /** 1–2 sentences for the selected-work list on the homepage. */
  description?: string
  /**
   * Phrases inside `description` to render as external links. Each `text` must
   * appear verbatim in the description; the first match is linked.
   */
  descriptionLinks?: { text: string; href: string }[]
  /** What the studio actually did, listed under the description. */
  services?: string[]
  /**
   * Everyone else who made it, shown as the "Credits" register on the
   * project page. Only entries with people to name carry this.
   */
  collaborators?: { name: string; role: string }[]
  /** External project/live site, shown as a secondary pill. */
  website?: string
  /**
   * Placement on the old 12-column scatter index. Nothing reads these now that
   * the index renders as an editorial list; kept on existing entries so the
   * layout can be rebuilt from them if it ever comes back.
   */
  colStart?: number
  colSpan?: number
  rowStart?: number
  rowSpan?: number
}

export const LANDING_PROJECTS: LandingProject[] = [
  {
    title: 'LOOP',
    client: 'Goat Farm',
    category: 'Lighting Design',
    year: 2026,
    image: '/landing/opt/loop.avif',
    slug: 'loop',
    affinity: { web: 0.05, installation: 0.24, lighting: 0.61, design: 0.1 },
    description:
      "Lighting design and control system for LOOP, a new venue in Atlanta. Powered by Goat Farm, LOOP is a cultural hub in Georgia Tech's Creative Quarter that brings together art, research, technology, and community. Through exhibitions, performances, studios, and collaborative projects, LOOP creates space for experimentation, exchange, and new ideas.",
    services: ['Lighting design', 'Control system', 'Show programming'],
  },
  {
    title: 'The Coffee Five',
    client: 'Juan Medina',
    category: 'Brand and Software',
    year: 2025,
    image: '/landing/opt/coffeefive.avif',
    slug: 'the-coffee-five',
    affinity: { web: 0.4, installation: 0.1, lighting: 0.05, design: 0.45 },
    website: 'https://www.thecoffeefive.com/en',
    description:
      "Seed to cup coffee from Juan Medina, a consultant offering milling, sampling, and export services. Studio Studio worked alongside Juan on all of it: a new brand identity, packaging, and the software the company runs on.",
    services: ['Brand identity', 'Packaging design', 'Software development'],
  },
  {
    title: 'ELA + Synergy Tradeshow',
    client: 'ELA',
    category: 'Interactive Web',
    year: 2026,
    image: '/landing/opt/ela-rsvp.avif',
    slug: 'ela-synergy-tradeshow',
    affinity: { web: 0.7, installation: 0.09, lighting: 0.03, design: 0.18 },
    website: 'https://www.elasynergy-tradeshow.com/',
    description:
      'An RSVP experience for the ELA and Synergy trade show, built on an interactive WebGL particle field. Behind it runs the event itself: an admin for the guest list, custom email sends, and RSVP tracking wired to hi.events.',
    services: ['WebGL', 'Custom software', 'Email system', 'Event admin'],
  },
  {
    title: 'Hope Hydration',
    client: 'Hope Hydration',
    category: 'Design Consulting',
    year: 2026,
    image: '/landing/opt/hopehydration.avif',
    slug: 'hope-hydration',
    affinity: { web: 0.12, installation: 0.28, lighting: 0.05, design: 0.55 },
    website: 'https://www.hopehydration.com/',
    description:
      'Design consultants on Hope Hydration event stations, and on many projects since. Studio Studio comes in from the creative and design side, shaping how people find, use, and remember free access to water.',
    services: ['Creative direction', 'Experience design', 'Design consulting'],
  },
  {
    title: 'Cox Pillars',
    client: 'Cox Communications',
    clientShort: 'Cox',
    category: 'Experiential',
    year: 2024,
    image: '/landing/opt/cox.png',
    slug: 'cox-pillars',
    affinity: { web: 0.24, installation: 0.42, lighting: 0.24, design: 0.1 },
    description:
      'A kiosk installation built around a pledge system. Visitors make a commitment on screen and watch it join the room as light and motion across a set of freestanding pillars.',
    services: ['Experience design', 'Custom software', 'Lighting design', 'Fabrication'],
    colStart: 9, colSpan: 3, rowStart: 19, rowSpan: 7,
  },
  {
    title: 'Living Walls + AT&T',
    client: 'Mercedes-Benz Stadium',
    clientShort: 'Mercedes-Benz',
    category: 'Experiential',
    year: 2024,
    image: '/landing/opt/livingwalls.avif',
    slug: 'living-walls-att',
    affinity: { web: 0.3, installation: 0.38, lighting: 0.24, design: 0.08 },
    description:
      'An interactive art installation that maps how far people traveled to the stadium and where they came from, running a sorting algorithm to trace each path. We built the custom control system for the LEDs and the website behind it.',
    services: ['Custom software', 'Control system', 'Lighting design', 'Web design and development'],
    colStart: 6, colSpan: 5, rowStart: 28, rowSpan: 13,
  },
  {
    title: '65 Suffolk St, NY',
    client: 'Chemistry Creative',
    clientShort: 'Chemistry',
    category: 'Lighting',
    year: 2023,
    image: '/landing/opt/suffolk.avif',
    slug: '65-suffolk-st',
    affinity: { web: 0.03, installation: 0.3, lighting: 0.6, design: 0.07 },
    description:
      'An architectural LED lobby installation commissioned by JGN Architecture, fixture layout, pixel mapping, and content system.',
    services: ['Lighting design', 'Pixel mapping', 'Content system'],
    colStart: 9, colSpan: 3, rowStart: 39, rowSpan: 8,
  },
  {
    title: 'The Light Around Us',
    client: 'tvsdesign / Spacelab',
    clientShort: 'tvsdesign',
    category: 'Installation',
    year: 2020,
    slug: 'the-light-around-us',
    affinity: { web: 0.13, installation: 0.42, lighting: 0.38, design: 0.07 },
    image: '/landing/opt/light-around-us.avif',
    images: ['/landing/opt/light-around-us2.avif'],
    description:
      'A data-driven sculpture that translates live air quality readings into shifting pattern and color. Commissioned by tvsdesign for Spacelab, their experimental design lab and showroom in Atlanta, with Studio Studio leading design and creative direction, DASH on concept, and Arc Design on fabrication.',
    services: ['Custom software', 'Lighting design', 'Interactive'],
    colStart: 2, colSpan: 3, rowStart: 25, rowSpan: 6,
  },
  {
    title: 'StoryBooth',
    client: 'Dashboard U.S.',
    clientShort: 'Dashboard',
    category: 'Experiential',
    year: 2022,
    image: '/landing/opt/sb-pablo.avif',
    slug: 'storybooth',
    affinity: { web: 0.38, installation: 0.36, lighting: 0.06, design: 0.2 },
    images: [
      '/landing/opt/storybooth-1.avif',
      '/landing/opt/storybooth-2.avif',
      '/landing/opt/storybooth-4.avif',
    ],
    website: 'https://storybooth.us',
    description:
      "A public phone booth in Montgomery, Alabama that records residents' stories and publishes them at storybooth.us. Studio Studio led creative direction, experiential design, and UX/UI, in collaboration with Eric Rabinowitz and presented by Dashboard U.S. and Kress on Dexter. Featured in the New York Times' 36 Hours in Montgomery.",
    services: ['Custom software', 'Fabrication', 'Web design and development'],
    colStart: 2, colSpan: 4, rowStart: 61, rowSpan: 9,
  },
  {
    title: 'Bleed for the Throne',
    client: 'HBO',
    category: 'Experiential',
    year: 2019,
    image: '/landing/opt/bleed-for-the-throne.avif',
    slug: 'bleed-for-the-throne',
    affinity: { web: 0.06, installation: 0.56, lighting: 0.26, design: 0.12 },
    images: [
      '/landing/opt/bleed-for-the-throne1.webp',
      '/landing/opt/bleed-for-the-throne2.webp',
    ],
    description:
      'HBO and the American Red Cross took on a global blood shortage while launching the final season of Game of Thrones. At SXSW, donors moved through a projected world of bleeding characters to the Iron Throne, called up by name over RFID as a choir sang an original 27 minute piece in Valyrian. Donations rose 12 percent nationwide.',
    services: ['Projection mapping', 'Video content', 'Immersive design', 'Interactive audio app'],
    colStart: 2, colSpan: 5, rowStart: 8, rowSpan: 6,
  },
  {
    title: 'Super Bowl Video Park',
    client: 'NY/NJ Super Bowl Host Committee',
    clientShort: 'Super Bowl',
    category: 'Motion',
    year: 2014,
    image: '/landing/opt/superbowl.avif',
    slug: 'super-bowl-video-park',
    affinity: { web: 0.07, installation: 0.25, lighting: 0.18, design: 0.5 },
    description:
      'The 2014 NY/NJ Super Bowl Host Committee wanted arriving visitors to see what New York has to offer. Studio Studio shot screen-specific content, then edited, animated, and reformatted it for a bank of 15 foot LED screens, delivered in under three months.',
    services: ['Spatial design', 'Animation', 'Video content'],
    colStart: 2, colSpan: 4, rowStart: 32, rowSpan: 7,
  },
  {
    title: 'Moment',
    client: 'Dolby',
    category: 'Immersive Installation',
    year: 2016,
    slug: 'dolby-moment',
    affinity: { web: 0.1, installation: 0.46, lighting: 0.38, design: 0.06 },
    image: '/landing/opt/sugar.avif',
    description:
      "An immersive, interactive LED installation for Dolby's San Francisco headquarters. Hundreds of individually addressable RGB cubes respond to presence and gesture, turning the lobby into a living wall of light and color.",
    services: ['Lighting design', 'Custom software', 'Interactive', 'Fabrication'],
    colStart: 2, colSpan: 3, rowStart: 1, rowSpan: 7,
  },
  {
    title: '9to5.tv',
    client: 'Festival',
    clientShort: '9to5.tv',
    category: 'Event',
    year: 2019,
    image: '/landing/opt/9to5-color.webp',
    slug: '9to5-tv',
    affinity: { web: 0.45, installation: 0.27, lighting: 0.08, design: 0.2 },
    website: 'https://vimeo.com/293862977?fl=pl&fe=cm',
    description:
      'A month-long digital art exhibition in Atlanta, founded by Studio Studio, that dissolves the boundary between artist and audience by way of an experimental livestream and emerging interfaces. From September 8 to October 6, participants interacted with the projects, performances, and broadcasts through a custom built suite of tools, influencing the final artworks as they were made.',
    services: ['Festival programming', 'Production', 'Brand identity', 'Custom software'],
    colStart: 2, colSpan: 3, rowStart: 85, rowSpan: 7,
  },
  {
    title: 'Scatter and Rise',
    client: 'Goat Farm Arts',
    clientShort: 'Goat Farm',
    category: 'Public Art',
    year: 2023,
    image: '/landing/opt/scatter.avif',
    slug: 'scatter-and-rise',
    affinity: { web: 0.1, installation: 0.44, lighting: 0.4, design: 0.06 },
    website: 'https://scatterandrise.com/',
    description:
      'A site-specific interactive LED commission for the Goat Farm Arts Center in Atlanta. The piece reads audience movement and answers with cascading patterns of light across a suspended grid of custom diffusion elements.',
    services: ['Lighting design', 'Custom software', 'Interactive', 'Fabrication'],
    colStart: 8, colSpan: 4, rowStart: 5, rowSpan: 9,
  },
  {
    title: 'Gesture-Gesture',
    client: 'Gallery 72',
    category: 'Tech Experiment',
    year: 2014,
    image: '/landing/opt/gestures.webp',
    slug: 'gesture-gesture',
    affinity: { web: 0.4, installation: 0.38, lighting: 0.06, design: 0.16 },
    description:
      'An interactive archive of the visual language we make with our hands. Everyone who takes part wears the same sleeves, puts their hands in the box, and leaves a gesture. After a second of presence the software captures three seconds and writes a GIF, and every new one retires the oldest from the display. Built for FOREWARD, a group show at Gallery 72 in Atlanta.',
    services: ['Concept', 'Custom software', 'Installation design', 'Fabrication'],
    collaborators: [
      { name: 'Dan Moore', role: 'Software' },
      { name: 'Emily Dawn Long', role: 'Sleeves' },
      { name: 'Trek Matthews', role: 'Production' },
      { name: 'Danny Davis', role: 'Construction' },
      { name: 'Protect Awesome', role: 'Construction' },
    ],
    colStart: 4, colSpan: 4, rowStart: 14, rowSpan: 10,
  },
  {
    title: 'Orbitals',
    client: 'Personal',
    clientShort: 'Orbitals',
    category: 'Tech Experiment',
    year: 2018,
    image: '/landing/opt/orbitals.avif',
    slug: 'orbitals',
    affinity: { web: 0.24, installation: 0.36, lighting: 0.1, design: 0.3 },
    description:
      'A generative installation built on orbital motion, simple rules, compounding paths, no two moments the same. Made during the Artist in Residence program at Mana Contemporary, curated by Grace Franck.',
    descriptionLinks: [
      { text: 'Grace Franck', href: 'https://gracefranck.cargo.site/' },
    ],
    services: ['Generative design', 'Custom software', 'Lighting design'],
    colStart: 3, colSpan: 3, rowStart: 41, rowSpan: 7,
  },
  {
    title: 'Snowblind',
    client: 'Personal',
    clientShort: 'Snowblind',
    category: 'Public Art',
    year: 2016,
    image: '/landing/opt/snow.avif',
    slug: 'snowblind',
    affinity: { web: 0.03, installation: 0.35, lighting: 0.55, design: 0.07 },
    description:
      'Lighting design for The Principal, a Red Bull Studio installation shown at the end of year exhibition for NEW INC, the New Museum incubator. An installation about whiteout and disorientation, light used to take vision away rather than give it.',
    services: ['Lighting design', 'Show programming'],
    colStart: 5, colSpan: 4, rowStart: 50, rowSpan: 9,
  },
  {
    title: 'Pour Perfect',
    client: 'Personal',
    clientShort: 'Pour Perfect',
    category: 'Tool',
    year: 2023,
    image: '/landing/opt/pour.avif',
    slug: 'pour-perfect',
    affinity: { web: 0.6, installation: 0.07, lighting: 0.03, design: 0.3 },
    website: 'https://origen.nyc/timer',
    description:
      'A guided pour-over timer — brewing as a paced sequence rather than a stopwatch and a guess.',
    colStart: 6, colSpan: 5, rowStart: 87, rowSpan: 11,
  },
]
