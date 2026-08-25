/* ============================================
   Placeholder project data for development
   Replace with Sanity content once populated
   ============================================ */

export interface PlaceholderProject {
  slug: string
  client: string
  title: string
  shortCode: string
  year: number
  category: string
  /** Studio discipline shown in the top line (e.g. "Experiential"). */
  discipline: string
  role: string[]
  collaborators: { name: string; role: string }[]
  heroImage: string
  about: string
  /** Large lead media beneath the text blocks. Image or video URL. */
  mainMedia: string
  /** Exactly three supporting images shown in a row below the main media. */
  supportingImages: string[]
  sections: Array<{
    type: 'two-column' | 'full-bleed-image' | 'image-grid' | 'tech-credits'
    label?: string
    leftLabel?: string
    leftText?: string
    rightLabel?: string
    rightText?: string
    image?: string
    images?: string[]
    items?: string[]
  }>
  similarProjects: {
    title: string
    slug: string
    image: string
  }[]
  /**
   * The project's own live site, when it has one. Surfaced as a link under the
   * About lede — for entries whose page is generated from the landing index
   * (see project-page.ts) it is often the only place with more to read.
   */
  website?: string
}

export const PLACEHOLDER_PROJECTS: Record<string, PlaceholderProject> = {
  'dolby-moment': {
    slug: 'dolby-moment',
    client: 'Dolby',
    title: 'Moment',
    shortCode: 'DM',
    year: 2016,
    category: 'Immersive Installation',
    discipline: 'Experiential',
    role: ['Concept', 'Design', 'Development', 'Installation'],
    collaborators: [
      { name: 'Kevin Byrd', role: 'Curator' },
      { name: 'Allie Bashuk', role: 'Curator' },
      { name: 'Brannon Dorsey', role: 'Collaborator' },
      { name: 'Jason Van Cleave', role: 'Collaborator' },
      { name: 'OoooShiny Community', role: 'Collaborator' },
    ],
    heroImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=2400&q=80',
    about:
      'An immersive, interactive LED installation at Dolby headquarters in San Francisco. 500 individually addressable RGB cubes respond to presence and gesture, creating a living wall of light and color that transforms the lobby into an ever-changing canvas of ambient data visualization.',
    mainMedia: 'https://images.unsplash.com/photo-1506399558188-acca6f8cbf41?w=2400&q=80',
    supportingImages: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&q=80',
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&q=80',
      'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1200&q=80',
    ],
    sections: [
      {
        type: 'two-column',
        leftLabel: 'Concept',
        leftText:
          'The installation was conceived as a bridge between physical and digital space — a wall that breathes, responds, and communicates. Each cube contains an individually addressable LED, controlled by custom software that interprets real-time sensor data into flowing patterns of color and motion.',
        rightLabel: 'Production',
        rightText:
          'Built with openFrameworks and a custom DMX pipeline driving 500 RGB nodes over sACN. The physical structure uses 3D-printed diffusion housings mounted on an aluminum armature. Capacitive proximity sensors along the base detect visitor presence and gesture.',
      },
      {
        type: 'image-grid',
        images: [
          'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&q=80',
          'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&q=80',
        ],
      },
      {
        type: 'tech-credits',
        items: [
          'openFrameworks',
          'DMX / sACN',
          'Capacitive Sensing',
          '3D Printing',
          'Custom PCB',
          'Aluminum Fabrication',
        ],
      },
      {
        type: 'full-bleed-image',
        image: 'https://images.unsplash.com/photo-1506399558188-acca6f8cbf41?w=2400&q=80',
      },
    ],
    similarProjects: [
      {
        title: 'Scatter and Rise',
        slug: 'scatter-and-rise',
        image: 'https://images.unsplash.com/photo-1504297050568-910d24c426d3?w=800&q=80',
      },
      {
        title: 'The Light Around Us',
        slug: 'the-light-around-us',
        image: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=800&q=80',
      },
    ],
  },
  'the-light-around-us': {
    slug: 'the-light-around-us',
    client: 'tvsdesign / Spacelab',
    title: 'The Light Around Us',
    shortCode: 'LA',
    year: 2020,
    category: 'Installation',
    discipline: 'Experiential',
    role: ['Creative Direction', 'Software Development', 'Lighting Design'],
    collaborators: [
      { name: 'Spacelab', role: 'Commission' },
      { name: 'tvsdesign', role: 'Architecture' },
    ],
    heroImage: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=2400&q=80',
    about:
      'A data-driven LED sculpture commissioned for a corporate lobby. Real-time environmental data — weather, air quality, and time of day — drives an evolving generative light composition across a suspended array of custom LED modules.',
    mainMedia: 'https://images.unsplash.com/photo-1504297050568-910d24c426d3?w=2400&q=80',
    supportingImages: [
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&q=80',
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&q=80',
    ],
    sections: [
      {
        type: 'two-column',
        leftLabel: 'Concept',
        leftText:
          'The sculpture translates invisible environmental forces into visible light. Weather patterns become color palettes. Air quality shifts opacity and movement speed. The time of day governs the overall rhythm — calm mornings, energetic afternoons, warm evenings.',
        rightLabel: 'Production',
        rightText:
          'Custom node.js backend ingests weather and air quality APIs, translating data into DMX values pushed to ENTTEC controllers over sACN. The LED array uses pixel-mapped RGBW fixtures mounted in a custom aluminum housing designed in collaboration with tvsdesign.',
      },
      {
        type: 'full-bleed-image',
        image: 'https://images.unsplash.com/photo-1504297050568-910d24c426d3?w=2400&q=80',
      },
    ],
    similarProjects: [
      {
        title: 'Dolby Moment',
        slug: 'dolby-moment',
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
      },
      {
        title: 'Scatter and Rise',
        slug: 'scatter-and-rise',
        image: 'https://images.unsplash.com/photo-1504297050568-910d24c426d3?w=800&q=80',
      },
    ],
  },
  'scatter-and-rise': {
    slug: 'scatter-and-rise',
    client: 'Goat Farm Arts Center',
    title: 'Scatter and Rise',
    shortCode: 'SR',
    year: 2023,
    category: 'Public Art',
    discipline: 'Experiential',
    role: ['Artist', 'Creative Direction', 'Technical Direction'],
    collaborators: [],
    heroImage: 'https://images.unsplash.com/photo-1504297050568-910d24c426d3?w=2400&q=80',
    about:
      'A site-specific interactive LED installation commissioned by the Goat Farm Arts Center in Atlanta. Responding to audience movement, the piece generates cascading patterns of light across a suspended grid of custom diffusion elements.',
    mainMedia: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=2400&q=80',
    supportingImages: [
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80',
      'https://images.unsplash.com/photo-1506399558188-acca6f8cbf41?w=1200&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&q=80',
    ],
    sections: [
      {
        type: 'full-bleed-image',
        image: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=2400&q=80',
      },
    ],
    similarProjects: [
      {
        title: 'Dolby Moment',
        slug: 'dolby-moment',
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
      },
      {
        title: 'The Light Around Us',
        slug: 'the-light-around-us',
        image: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=800&q=80',
      },
    ],
  },
}
