/* ============================================
   Landing index data
   Art-directed composition on a 12-column grid.
   Each image gets an explicit column AND row placement
   (colStart/colSpan + rowStart/rowSpan) so the layout
   reads as a composed scatter with intentional negative
   space and size variety — not a packed masonry.
   Images are AVIF-optimized in /public/landing/opt.
   ============================================ */

export interface LandingProject {
  title: string
  client: string
  category: string
  year: number
  image: string
  /** Links to /work/[slug] when a detail page exists. */
  slug?: string
  /** Column placement on the 12-col grid. */
  colStart: number
  colSpan: number
  /** Row placement on the fine row grid. */
  rowStart: number
  rowSpan: number
}

export const LANDING_PROJECTS: LandingProject[] = [
  { title: 'Moment', client: 'Dolby', category: 'Immersive Installation', year: 2016, slug: 'dolby-moment', image: '/landing/opt/render3.avif', colStart: 2, colSpan: 3, rowStart: 1, rowSpan: 7 },
  { title: 'Scatter and Rise', client: 'Goat Farm Arts', category: 'Public Art', year: 2023, slug: 'scatter-and-rise', image: '/landing/opt/agent3.avif', colStart: 8, colSpan: 4, rowStart: 5, rowSpan: 9 },
  { title: 'Gestures', client: 'Personal', category: 'Tech Experiment', year: 2014, image: '/landing/opt/gestures.avif', colStart: 4, colSpan: 4, rowStart: 14, rowSpan: 10 },
  { title: 'Cox Pillars', client: 'Cox Communications', category: 'Experiential', year: 2024, image: '/landing/opt/storybooth-4.avif', colStart: 9, colSpan: 3, rowStart: 19, rowSpan: 7 },
  { title: 'The Light Around Us', client: 'tvsdesign / Spacelab', category: 'Installation', year: 2020, slug: 'the-light-around-us', image: '/landing/opt/space-labs.avif', colStart: 2, colSpan: 3, rowStart: 25, rowSpan: 6 },
  { title: 'Living Walls', client: 'Mercedes-Benz Stadium', category: 'Experiential', year: 2024, image: '/landing/opt/img-9821.avif', colStart: 6, colSpan: 5, rowStart: 28, rowSpan: 13 },
  { title: 'Orbitals', client: 'Personal', category: 'Tech Experiment', year: 2018, image: '/landing/opt/orbitals.avif', colStart: 3, colSpan: 3, rowStart: 41, rowSpan: 7 },
  { title: 'Suffolk Building', client: 'Chemistry Creative', category: 'Lighting', year: 2023, image: '/landing/opt/img-7745.avif', colStart: 9, colSpan: 3, rowStart: 39, rowSpan: 8 },
  { title: 'Snowblind', client: 'Personal', category: 'Public Art', year: 2016, image: '/landing/opt/snow.avif', colStart: 5, colSpan: 4, rowStart: 50, rowSpan: 9 },
  { title: 'HydroStation', client: 'Bould Design', category: 'Tech Experiment', year: 2024, image: '/landing/opt/gg.avif', colStart: 10, colSpan: 2, rowStart: 51, rowSpan: 5 },
  { title: 'StoryBooth', client: 'Michigan Central Station', category: 'Experiential', year: 2022, image: '/landing/opt/storybooth-1.avif', colStart: 2, colSpan: 4, rowStart: 61, rowSpan: 9 },
  { title: 'Cox Conserves', client: 'Cox Communications', category: 'Experiential', year: 2024, image: '/landing/opt/storybooth-3.avif', colStart: 8, colSpan: 4, rowStart: 65, rowSpan: 10 },
  { title: 'Sound Journeys II', client: 'Personal', category: 'Public Art', year: 2017, image: '/landing/opt/group-5753.avif', colStart: 4, colSpan: 3, rowStart: 74, rowSpan: 6 },
  { title: 'Between The Two', client: 'Personal', category: 'Public Art', year: 2016, image: '/landing/opt/installation-33.avif', colStart: 10, colSpan: 2, rowStart: 76, rowSpan: 5 },
  { title: '9to5.tv', client: 'Festival', category: 'Event', year: 2019, image: '/landing/opt/storybooth-2.avif', colStart: 2, colSpan: 3, rowStart: 85, rowSpan: 7 },
  { title: 'Pour Perfect', client: 'Personal', category: 'Tool', year: 2023, image: '/landing/opt/img-2808.avif', colStart: 6, colSpan: 5, rowStart: 87, rowSpan: 11 },
  { title: 'choosing.sucks', client: 'with Allister', category: 'Tool', year: 2022, image: '/landing/opt/render3.avif', colStart: 3, colSpan: 3, rowStart: 100, rowSpan: 6 },
  { title: 'Stage Controller', client: 'ENTTEC', category: 'Software', year: 2021, image: '/landing/opt/gg.avif', colStart: 9, colSpan: 3, rowStart: 98, rowSpan: 8 },
  { title: 'Orbitals II', client: 'Personal', category: 'Tech Experiment', year: 2019, image: '/landing/opt/orbitals.avif', colStart: 5, colSpan: 4, rowStart: 109, rowSpan: 9 },
  { title: 'Snow Field', client: 'Personal', category: 'Installation', year: 2018, image: '/landing/opt/snow.avif', colStart: 2, colSpan: 3, rowStart: 120, rowSpan: 6 },
]
