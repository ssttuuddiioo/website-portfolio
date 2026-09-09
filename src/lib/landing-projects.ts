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
      "Lighting design and control system for LOOP, a new Atlanta venue from Goat Farm in Georgia Tech's Creative Quarter.",
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
      'Seed to cup coffee from Juan Medina. Brand identity, packaging, and the software behind it.',
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
      'RSVP experience for the ELA and Synergy trade show. WebGL particle field, guest list admin, RSVP tracking.',
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
      "Design consultant on Hope Hydration's event stations — how people find and use free water.",
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
      'A kiosk pledge system — commitments made on screen become light across freestanding pillars.',
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
      'An interactive installation mapping how far people traveled to the stadium — custom LED control system and website.',
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
      'An architectural LED lobby installation for JGN Architecture.',
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
      'A data-driven sculpture that turns live air quality readings into shifting pattern and color. Commissioned by tvsdesign for Spacelab.',
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
      "A public phone booth in Montgomery, Alabama that records residents' stories and publishes them at storybooth.us. Creative direction, experiential design, UX/UI.",
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
      'HBO and the American Red Cross fought a blood shortage at SXSW. Donors reached the Iron Throne by name over RFID. Donations rose 12 percent.',
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
      'Content for the 2014 NY/NJ Super Bowl Host Committee — shot, edited, and animated for 15 foot LED screens in three months.',
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
      "Interactive LED for Dolby's San Francisco headquarters: hundreds of addressable RGB cubes answering presence and gesture.",
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
      'A month-long digital art exhibition in Atlanta, founded by Studio Studio — an experimental livestream where the audience shaped the work as it was made.',
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
      'Site-specific LED for the Goat Farm Arts Center: audience movement answered in cascading light.',
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
      'An interactive archive of the gestures we make with our hands — three seconds captured as a GIF, each new one retiring the oldest. Built for FOREWARD at Gallery 72.',
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
      'A generative installation on orbital motion — simple rules, compounding paths, no two moments alike. Made at Mana Contemporary, curated by Grace Franck.',
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
      'Lighting design for The Principal, a Red Bull Studio installation at NEW INC. Light that takes vision away.',
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
    description: 'A guided pour-over timer — brewing as a paced sequence.',
    colStart: 6, colSpan: 5, rowStart: 87, rowSpan: 11,
  },
]
