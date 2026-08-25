import type { MetadataRoute } from 'next'
import { client, isSanityConfigured } from '@/lib/sanity/client'
import { IDEAS } from '@/lib/ideas'
import { getProjectSlugs } from '@/lib/project-page'

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
    { url: `${SITE_URL}/ideas`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.7 },
  ]

  // Notes. No date on the Idea type yet, so these fall back to build time —
  // add a `date` field to src/lib/ideas.ts and use it here when there is one.
  const ideaRoutes: MetadataRoute.Sitemap = IDEAS.map((idea) => ({
    url: `${SITE_URL}/ideas/${idea.slug}`,
    lastModified: now,
    changeFrequency: 'yearly',
    priority: 0.7,
  }))

  // Projects are currently reachable at two routes: the landing's /work/[slug]
  // (placeholder data) and the legacy root-level /[slug] (Sanity). Each project
  // is listed exactly once, at the route the live site actually links to, so we
  // never submit two URLs for the same work. Collapse this once one of the two
  // routes is retired.
  // Every entry in the landing index has a /work/[slug] page, hand-authored or
  // generated from the index entry — getProjectSlugs is the same list the route
  // prerenders, so the two can't drift.
  const placeholderSlugs = new Set(getProjectSlugs())

  const placeholderRoutes: MetadataRoute.Sitemap = [...placeholderSlugs].map((slug) => ({
    url: `${SITE_URL}/work/${slug}`,
    lastModified: now,
    changeFrequency: 'yearly',
    priority: 0.9,
  }))

  const projects = await fetchProjects()
  const sanityRoutes: MetadataRoute.Sitemap = projects
    .filter((p) => p.slug && !placeholderSlugs.has(p.slug))
    .map((p) => ({
      url: `${SITE_URL}/${p.slug}`,
      lastModified: new Date(p._updatedAt),
      changeFrequency: 'yearly',
      priority: 0.9,
    }))

  // Deliberately omitted: /agency/work is a "Coming soon" stub and is noindex.
  // TODO: add experiment routes when /experiments is implemented.
  // TODO: reinstate /rent (priority 0.5) if the old page is kept, or
  // leave omitted if retired — decide before launch.
  return [...staticRoutes, ...ideaRoutes, ...placeholderRoutes, ...sanityRoutes]
}
