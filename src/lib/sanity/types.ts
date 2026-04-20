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
  clientUrl?: string
  year?: number
  location?: string
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

export interface SanitySeo {
  title?: string
  description?: string
  ogImage?: SanityImage
}

export interface SanityProjectDetail extends SanityProject {
  body?: unknown[]
  collaborators?: SanityCollaborator[]
  projectUrl?: string
  caseStudyUrl?: string
  seo?: SanitySeo
  seoDescription?: string
  ogImage?: SanityImage
  relatedProjects?: Array<{
    _id: string
    title: string
    slug: { current: string }
    thumbnail?: SanityImage
  }>
  nextProject?: {
    title: string
    slug: { current: string }
    thumbnail?: SanityImage
  }
}

export interface SanityPerson {
  _id: string
  name: string
  jobTitle?: string
  url?: string
  bio?: string
  socials?: string[]
}

export interface SanityMembership {
  name: string
  url?: string
}

export interface SanityAddress {
  locality?: string
  region?: string
  country?: string
}

export interface SiteSettingsForOrg {
  orgName?: string
  orgAlternateName?: string
  orgDescription?: string
  logo?: SanityImage
  founder?: SanityPerson
  address?: SanityAddress
  memberOf?: SanityMembership[]
  knowsAbout?: string[]
  sameAs?: string[]
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
