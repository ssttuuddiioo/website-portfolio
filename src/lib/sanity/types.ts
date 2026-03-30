/* ============================================
   Sanity TypeScript Types — Studio Studio
   ============================================ */

export interface SanityImage {
  _type: 'image'
  asset: {
    url: string
    metadata?: {
      lqip?: string
      dimensions?: {
        width: number
        height: number
        aspectRatio: number
      }
    }
  }
  alt?: string
  hotspot?: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface SanityFile {
  asset: {
    url: string
  }
}

export interface SanityCategory {
  title: string
  slug: { current: string }
}

export interface SanityCollaborator {
  name: string
  role: string
  url?: string
}

export interface SanityProject {
  _id: string
  title: string
  slug: { current: string }
  subtitle?: string
  client?: string
  year?: number
  category?: SanityCategory
  tags?: string[]
  role?: string
  heroImage?: SanityImage
  heroVideo?: SanityFile
  heroVideoUrl?: string
  thumbnail?: SanityImage
  thumbnailVideo?: SanityFile
  thumbnailSecondary?: SanityImage
  featured?: boolean
  sortOrder?: number
}

export interface SanityProjectDetail extends SanityProject {
  body?: unknown[]
  collaborators?: SanityCollaborator[]
  projectUrl?: string
  caseStudyUrl?: string
  seoDescription?: string
  ogImage?: SanityImage
  nextProject?: {
    title: string
    slug: { current: string }
    thumbnail?: SanityImage
  }
}

export interface SanityExperiment {
  _id: string
  title: string
  slug: { current: string }
  description?: string
  techStack?: string[]
  status?: 'active' | 'archived' | 'concept' | 'in-progress'
  year?: number
  heroImage?: SanityImage
  liveUrl?: string
  githubUrl?: string
}

export interface SiteSettings {
  siteTitle: string
  siteDescription?: string
  heroTagline?: string
  contactEmail?: string
  heroMedia?: SanityFile
  aboutTeaser?: string
  aboutPhoto?: SanityImage
  services?: string[]
  social?: {
    instagram?: string
    vimeo?: string
    github?: string
    linkedin?: string
  }
  clientLogos?: Array<{
    name: string
    logo?: { asset: { url: string } }
    url?: string
  }>
  featuredProjects?: SanityProject[]
}
