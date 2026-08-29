/**
 * Every URL the Squarespace site had, mapped to its home here.
 *
 * Two things consume this map:
 *
 *  1. `next.config.ts` turns each entry into a permanent (308) redirect, which
 *     covers old *paths* — studiostudio.nyc/storybooth.
 *  2. `<LegacyHashRedirect>` on the homepage covers old *hash fragments* —
 *     studiostudio.nyc/#storybooth3. A fragment is never sent to the server, so
 *     no server redirect can see one; only script running on the page can.
 *
 * The old site was a Squarespace Index, which anchors each section by its page
 * slug — so nearly every path below also existed as a `#hash` on the homepage,
 * often with a digit appended where a section had been duplicated. Both halves
 * therefore read the same map, and lookups are normalised (lowercased, trailing
 * digits and separators trimmed) so `#storybooth3`, `#storybooth-2` and
 * `/storybooth` all resolve to the one target without needing a row each.
 *
 * Keys are paths, without a trailing slash. All destinations are permanent:
 * none of these come back.
 */
export const LEGACY_REDIRECTS: Record<string, string> = {
  // ---- Projects, each now with a page of its own at /work/[slug] ----------
  '/moment': '/work/dolby-moment',
  '/light-around-us': '/work/the-light-around-us',
  '/light-around-us-1': '/work/the-light-around-us',
  '/the-light-around-us': '/work/the-light-around-us',
  '/the-light-around-us-1': '/work/the-light-around-us',
  '/scatter': '/work/scatter-and-rise',
  '/storybooth': '/work/storybooth',
  '/snowblind': '/work/snowblind',
  '/orbitals': '/work/orbitals',
  '/orbitalsv1': '/work/orbitals',

  // Gesture-Gesture and the GIF-booth lineage it grew out of. The old site
  // used both /gesture and /gesture-gesture; the project now carries its full
  // name here, so every one of them lands on /work/gesture-gesture.
  '/gesture': '/work/gesture-gesture',
  '/gesture-gesture': '/work/gesture-gesture',
  '/gifbooth': '/work/gesture-gesture',
  '/gifbooth2': '/work/gesture-gesture',
  '/volvox-gifs': '/work/gesture-gesture',

  // 9to5.tv, which had four URLs on the old site.
  '/9to5': '/work/9to5-tv',
  '/9to5-1': '/work/9to5-tv',
  '/9to5wip': '/work/9to5-tv',
  '/9to5-workinprogress': '/work/9to5-tv',

  // ---- Writing and contact ------------------------------------------------
  '/news': '/ideas',
  '/contact-1': '/contact',
  '/contact4': '/contact',
  // Studio rental has no page yet; contact is the working equivalent.
  '/rent': '/contact',

  // ---- Work with no page on the new site ---------------------------------
  // Sound Journeys, Between The Two of These, Deconstructed Anthems and the
  // Christopher Tignor collaborations are not in the current index, so they
  // land on the homepage — which is itself the work showcase. Give any of them
  // an entry in LANDING_PROJECTS and the row should point at its /work/ slug.
  '/experiential': '/',
  '/sound-journeys': '/',
  '/sound-journeys-2': '/',
  '/journey': '/',
  '/between': '/',
  '/arcs': '/',
  '/christopher-tignor': '/',
  '/tignor': '/',
  '/deconstructed-anthems': '/',

  // ---- Squarespace scaffolding and abandoned drafts ----------------------
  '/media': '/',
  '/gallery': '/',
  '/random-image': '/',
  '/enter': '/',
  '/enter-1': '/',
  '/enter-2': '/',
  '/new-cover-page': '/',
  '/new-page': '/',
  '/new-page-2': '/',
  '/new-page-4': '/',
  '/new-page-5': '/',
  '/contenthome': '/',
  '/about111': '/',
  '/fshawr': '/',
  '/read-me-adversary': '/',
}

/**
 * The homepage's own section anchors. These are live navigation, not legacy
 * URLs, and must never be redirected away from.
 */
const LIVE_ANCHORS = new Set(['home', 'about', 'work', 'ideas'])

/**
 * Sections that used to live on the homepage and have since moved to a page of
 * their own. Old `/#services` and `/#contact` links — ours as much as anyone
 * else's — land on the content rather than the top of the homepage.
 *
 * These are checked before the legacy map, which has no `/contact` row (that is
 * a real page and must not be redirected) and no `/services` row at all.
 */
const MOVED_ANCHORS: Record<string, string> = {
  services: '/about#services',
  contact: '/contact',
}

/**
 * Squarespace appended digits to a slug whenever a section or page was
 * duplicated — `storybooth3`, `contact4`, `enter-2`. Strip that tail (and any
 * separator left behind) so one row covers every numbered sibling.
 */
function normalise(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/^[#/]+/, '')
    .replace(/\/+$/, '')
    .replace(/[-_]?\d+$/, '')
}

/**
 * Where a legacy hash fragment should land, or null to leave it alone.
 *
 * Precedence matters in both directions. An exact row is checked first, so
 * `#about111` reaches its target instead of being mistaken for the live
 * `#about` anchor once its digits are stripped. The live-anchor guard then runs
 * before the moved-anchor and normalised lookups, so a section that is still on
 * the homepage is never redirected away from the page it belongs to.
 */
export function resolveLegacyHash(hash: string): string | null {
  const raw = hash.replace(/^#/, '').replace(/\/+$/, '').toLowerCase()
  if (!raw) return null

  const exact = LEGACY_REDIRECTS[`/${raw}`]
  if (exact) return exact

  // A live section anchor, in either its exact or numbered form.
  if (LIVE_ANCHORS.has(raw) || LIVE_ANCHORS.has(normalise(raw))) return null

  // A section that has moved off the homepage.
  const moved = MOVED_ANCHORS[raw] ?? MOVED_ANCHORS[normalise(raw)]
  if (moved) return moved

  const stripped = normalise(raw)
  if (!stripped) return null
  return LEGACY_REDIRECTS[`/${stripped}`] ?? null
}
