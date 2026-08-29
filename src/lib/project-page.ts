import {
  PLACEHOLDER_PROJECTS,
  type PlaceholderProject,
} from './placeholder-projects'
import { LANDING_PROJECTS, type LandingProject } from './landing-projects'

/**
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

/** The project page for a slug, hand-authored where one exists. */
export function getProjectPage(slug: string): PlaceholderProject | null {
  const authored = PLACEHOLDER_PROJECTS[slug]
  if (authored) return authored
  const index = LANDING_PROJECTS.findIndex((p) => p.slug === slug)
  if (index === -1) return null
  return fromLanding(LANDING_PROJECTS[index], index)
}

/** Every slug that resolves to a page — drives generateStaticParams. */
export function getProjectSlugs(): string[] {
  return Array.from(
    new Set([
      ...Object.keys(PLACEHOLDER_PROJECTS),
      ...LANDING_PROJECTS.map((p) => p.slug).filter(
        (s): s is string => Boolean(s),
      ),
    ]),
  )
}
