import { cache } from 'react'
import {
  PLACEHOLDER_PROJECTS,
  type PlaceholderProject,
} from './placeholder-projects'
import { LANDING_PROJECTS, type LandingProject } from './landing-projects'
import { client, isSanityConfigured } from './sanity/client'
import { PROJECT_PAGE_QUERY, PROJECT_PAGE_SLUGS_QUERY } from './sanity/queries'
import type { SanityProjectPage } from './sanity/types'

/**
 * A project's copy comes from Sanity when it has a document there — seeded from
 * content/projects by `npm run seed:projects`. Sanity holds no media yet, so
 * those pages borrow their frames from the matching landing entry (same slug)
 * until a hero image is uploaded in Studio.
 *
 * Every entry in the landing index is reachable at /work/[slug]. Three of them
 * — dolby-moment, the-light-around-us, scatter-and-rise — are hand-authored
 * case studies in PLACEHOLDER_PROJECTS. The rest are generated here from what
 * the landing index already holds: the hero frame, the description the
 * homepage work list shows, the services line, and the live site where there
 * is one. Nothing is invented to fill the shape — the page simply renders
 * fewer sections (no concept/production columns, no detail images) and
 * ProjectExperience drops each of those when it is absent. Credits come
 * through where the index entry names collaborators.
 */

/** Initials, for the `shortCode` slot. "Living Walls + AT&T" → "LW". */
function initials(title: string) {
  const words = title.replace(/[^\p{L}\p{N} ]/gu, ' ').split(/\s+/).filter(Boolean)
  return (words.map((w) => w[0]).join('') || title.slice(0, 2))
    .slice(0, 2)
    .toUpperCase()
}

/**
 * Two other projects to move on to, taken as the entries following this one in
 * the index (wrapping at the end) so every page offers a different pair and
 * none points at itself.
 */
function neighbours(index: number) {
  return [1, 2]
    .map((step) => LANDING_PROJECTS[(index + step) % LANDING_PROJECTS.length])
    .filter((p): p is LandingProject & { slug: string } => Boolean(p?.slug))
    .map((p) => ({ title: p.title, slug: p.slug, image: p.image }))
}

function fromLanding(
  project: LandingProject,
  index: number,
): PlaceholderProject {
  return {
    slug: project.slug!,
    client: project.client,
    title: project.title,
    shortCode: initials(project.title),
    year: project.year,
    category: project.category,
    discipline: project.category,
    // What the studio actually did — the same list the homepage work entry
    // carries, which is exactly what the page's "Role" cell wants.
    role: project.services ?? [],
    collaborators: project.collaborators ?? [],
    heroImage: project.image,
    about: project.description ?? '',
    // The hero is the entry's own frame; anything further the entry lists
    // becomes the rest of the media grid. Most projects have only the one, and
    // the page shows it full-width rather than padding the grid out.
    mainMedia: '',
    supportingImages: project.images ?? [],
    sections: [],
    similarProjects: neighbours(index),
    website: project.website,
  }
}

/**
 * The Sanity document as a page. Anything the document leaves empty falls back
 * to the landing entry, so a project that is in both never loses its frames,
 * its live-site link or its place in the similar-projects rotation. One that is
 * only in Sanity starts the rotation from the top of the index.
 */
function fromSanity(doc: SanityProjectPage): PlaceholderProject {
  const index = LANDING_PROJECTS.findIndex((p) => p.slug === doc.slug)
  const landing = index === -1 ? undefined : LANDING_PROJECTS[index]
  const disciplines = doc.disciplines?.join(' · ')
  return {
    slug: doc.slug,
    client: doc.client ?? landing?.client ?? '',
    title: doc.title,
    shortCode: initials(doc.title),
    year: doc.year,
    yearDisplay: doc.yearDisplay,
    category: disciplines || landing?.category || '',
    discipline: disciplines || landing?.category || '',
    role: doc.scope ?? landing?.services ?? [],
    // The organization rides on the role line — "Interiors lead · JGN
    // Architecture" — since the register already pairs name with one line.
    collaborators: (doc.collaborators ?? []).map((c) => ({
      name: c.name,
      role: [c.role, c.organization].filter(Boolean).join(' · '),
    })),
    heroImage: doc.heroImage ?? landing?.image ?? '',
    about: doc.subtitle ?? landing?.description ?? '',
    mainMedia: '',
    supportingImages: landing?.images ?? [],
    sections: [],
    similarProjects: neighbours(index),
    website: doc.projectUrl ?? landing?.website,
    location: doc.location,
    body: doc.body,
    outcome: doc.outcome,
    stack: doc.stack,
    materials: doc.materials,
    credit: doc.credit,
    thanks: doc.thanks,
  }
}

async function fetchSanity<T>(query: string, params: Record<string, string> = {}) {
  if (!isSanityConfigured) return null
  try {
    return await client.fetch<T>(query, params)
  } catch {
    // Sanity unreachable — the hardcoded pages still render.
    return null
  }
}

/**
 * The project page for a slug: Sanity first, then the hand-authored case study,
 * then the page generated from the landing index. Cached per request, since
 * generateMetadata and the page both ask.
 */
export const getProjectPage = cache(
  async (slug: string): Promise<PlaceholderProject | null> => {
    const doc = await fetchSanity<SanityProjectPage | null>(PROJECT_PAGE_QUERY, { slug })
    if (doc) return fromSanity(doc)
    const authored = PLACEHOLDER_PROJECTS[slug]
    if (authored) return authored
    const index = LANDING_PROJECTS.findIndex((p) => p.slug === slug)
    if (index === -1) return null
    return fromLanding(LANDING_PROJECTS[index], index)
  },
)

/** Every slug that resolves to a page — drives generateStaticParams. */
export async function getProjectSlugs(): Promise<string[]> {
  const sanity = (await fetchSanity<string[]>(PROJECT_PAGE_SLUGS_QUERY)) ?? []
  return Array.from(
    new Set([
      ...Object.keys(PLACEHOLDER_PROJECTS),
      ...LANDING_PROJECTS.map((p) => p.slug).filter(
        (s): s is string => Boolean(s),
      ),
      ...sanity,
    ]),
  )
}
