import type { MetadataRoute } from 'next'
import { client, isSanityConfigured } from '@/lib/sanity/client'

const SITE_URL = 'https://studiostudio.nyc'

interface ProjectEntry {
  slug: string
  _updatedAt: string
}

const PROJECTS_FOR_SITEMAP_QUERY = `
  *[_type == "project" && !(_id in path("drafts.**")) && !hidden]{
    "slug": slug.current,
    _updatedAt
  }
`

async function fetchProjects(): Promise<ProjectEntry[]> {
  if (!isSanityConfigured) return []
  try {
    const projects = await client.fetch<ProjectEntry[]>(PROJECTS_FOR_SITEMAP_QUERY)
    return projects ?? []
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'monthly', priority: 1.0 },
    { url: `${SITE_URL}/work`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.7 },
  ]

  const projects = await fetchProjects()
  const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${SITE_URL}/${p.slug}`,
    lastModified: new Date(p._updatedAt),
    changeFrequency: 'yearly',
    priority: 0.9,
  }))

  // TODO: add experiment routes when /experiments is implemented.
  // TODO: reinstate /rent (priority 0.5) if the old page is kept, or
  // leave omitted if retired — decide before launch.
  return [...staticRoutes, ...projectRoutes]
}
