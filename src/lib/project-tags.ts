import type { LandingProject } from './landing-projects'

/**
 * The four poles the work is read against. Every index entry carries a weight
 * for each, which is what lets the hero trail reveal work by proximity: carry
 * the pointer toward the Web pole and the web-heavy projects are the ones that
 * come up.
 */
export const TAGS = ['web', 'installation', 'lighting', 'design'] as const
export type Tag = (typeof TAGS)[number]

/** How strongly a project reads as each of the four. Need not sum to 1. */
export type Affinity = Record<Tag, number>

/**
 * Where each pole sits on the first screen, in normalised 0–1 coordinates.
 *
 * Nothing draws these — they are pure geometry, felt only as which work the
 * trail offers up as the pointer crosses the screen. Not the four corners,
 * which would leave the middle of the field dead: they are scattered instead,
 * web and design to the left, installation and lighting to the right, each pair
 * staggered so no two share a line and every region of the first screen leans
 * somewhere.
 *
 * Move these and every project moves with them; positions are derived from the
 * anchors, never stored.
 */
export const TAG_ANCHORS: Record<Tag, { x: number; y: number }> = {
  web: { x: 0.13, y: 0.36 },
  design: { x: 0.34, y: 0.66 },
  installation: { x: 0.66, y: 0.34 },
  lighting: { x: 0.87, y: 0.64 },
}

/** The affinity as fractions of the whole, so projects are comparable. */
export function normalised(a: Affinity): Affinity {
  const total = TAGS.reduce((sum, t) => sum + Math.max(0, a[t]), 0)
  if (!total) return { web: 0.25, design: 0.25, installation: 0.25, lighting: 0.25 }
  return Object.fromEntries(
    TAGS.map((t) => [t, Math.max(0, a[t]) / total]),
  ) as Affinity
}

/** The pole a project reads as first — its closest tag. */
export function primaryTag(p: LandingProject): Tag {
  return TAGS.reduce((best, t) => (p.affinity[t] > p.affinity[best] ? t : best))
}

/** The pole it reads as least — its farthest tag. */
export function farthestTag(p: LandingProject): Tag {
  return TAGS.reduce((worst, t) => (p.affinity[t] < p.affinity[worst] ? t : worst))
}

/** Poles ordered nearest to farthest. */
export function tagsByAffinity(p: LandingProject): Tag[] {
  return [...TAGS].sort((a, b) => p.affinity[b] - p.affinity[a])
}

/**
 * How hard a project is pulled toward its dominant pole before it is placed.
 *
 * A straight weighted average of four corners is always dragged to the middle:
 * even a 70%-web project lands nearer the centre than the Web anchor, because
 * the other three still vote. Raising the weights to a power first concentrates
 * them on the dominant pole — the ordering is untouched, but the field actually
 * uses its corners. 1 is the flat average; higher separates harder. Paired with
 * the trail's own SIGMA: this decides how far apart the work is placed, that
 * decides how far the pointer's pull reaches.
 */
export const DEFAULT_SHARPNESS = 4

/**
 * The project's point on the field: the four anchors averaged by its weights,
 * sharpened so the poles are reachable. A project that is purely one thing
 * lands on that pole; a mixed one sits between the poles it draws from, which
 * is what lets a pointer moving toward Web pick up the web-leaning half of an
 * installation project on the way.
 */
export function fieldPosition(
  p: LandingProject,
  sharpness = DEFAULT_SHARPNESS,
): { x: number; y: number } {
  const flat = normalised(p.affinity)
  const pow = Object.fromEntries(
    TAGS.map((t) => [t, Math.pow(flat[t], sharpness)]),
  ) as Affinity
  const w = normalised(pow)
  return TAGS.reduce(
    (pos, t) => ({
      x: pos.x + TAG_ANCHORS[t].x * w[t],
      y: pos.y + TAG_ANCHORS[t].y * w[t],
    }),
    { x: 0, y: 0 },
  )
}
