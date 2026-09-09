import { LANDING_PROJECTS } from './landing-projects'
import { PLACEHOLDER_PROJECTS } from './placeholder-projects'

/**
 * The site is still being built, so every project page sits behind a shared
 * password while the work is in progress. Browsing is untouched — the homepage,
 * the index, the picker wheel, every click-to-explore interaction still runs —
 * but following a link *into* a project lands on /wip until the visitor unlocks.
 *
 * This is a courtesy wall, not security: one shared password, held in one place
 * so it is easy to change or lift when the site goes public. Nothing secret
 * should be behind it that could not survive being shared.
 */
export const WIP_PASSWORD = 'passw0rd'

/** Cookie that marks a browser as unlocked. */
export const WIP_COOKIE = 'ss_wip'

/**
 * What the cookie holds. Deliberately not the password: this constant lives
 * only in server code (middleware + the unlock route), so it never ships to the
 * browser and a leaked cookie value gives away nothing about the password.
 */
export const WIP_TOKEN = 'unlocked-2026'

/** Thirty days — long enough that a reviewer types it once per project. */
export const WIP_MAX_AGE = 60 * 60 * 24 * 30

/**
 * Every slug reachable as a project page. Projects live at two routes: the
 * landing's /work/[slug] and the legacy root-level /[slug], and both are gated.
 * Root-level gating needs the slug list so that /about, /contact and friends
 * stay open and an unknown path still 404s instead of showing the wall.
 */
const PROJECT_SLUGS = new Set<string>([
  ...LANDING_PROJECTS.map((p) => p.slug).filter((s): s is string => Boolean(s)),
  ...Object.keys(PLACEHOLDER_PROJECTS),
])

/** Is this path a project page, and so behind the wall? */
export function isGatedPath(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, '') || '/'
  const segments = path.split('/').filter(Boolean)

  // /work/[slug] — the landing's project pages. /work itself stays open.
  if (segments[0] === 'work' && segments.length > 1) return true

  // /[slug] — the legacy root-level project pages.
  if (segments.length === 1 && PROJECT_SLUGS.has(segments[0])) return true

  return false
}

/** Does this request already carry a valid unlock cookie? */
export function isUnlocked(cookieValue: string | undefined): boolean {
  return cookieValue === WIP_TOKEN
}

/**
 * Constant-ish time compare, so the wall does not leak the password one
 * character at a time to anyone timing it.
 */
export function checkPassword(input: unknown): boolean {
  if (typeof input !== 'string') return false
  if (input.length !== WIP_PASSWORD.length) return false
  let diff = 0
  for (let i = 0; i < input.length; i++) {
    diff |= input.charCodeAt(i) ^ WIP_PASSWORD.charCodeAt(i)
  }
  return diff === 0
}
