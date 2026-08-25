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

  // Gestures and the GIF-booth lineage it grew out of. These pointed at
  // /ideas/gestures before the project had a work page; /work/gestures is now
  // where the site's own links go, so the legacy traffic follows them.
  '/gesture': '/work/gestures',
  '/gesture-gesture': '/work/gestures',
  '/gifbooth': '/work/gestures',
  '/gifbooth2': '/work/gestures',
  '/volvox-gifs': '/work/gestures',

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
const LIVE_ANCHORS = new Set([
  'home',
  'about',
  'work',
  'services',
  'ideas',
  'contact',
])

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
 * `#contact4` and `#about111` reach their targets instead of being mistaken for
 * the live `#contact` / `#about` anchors once their digits are stripped. The
 * live-anchor guard then runs before the normalised lookup, so a real section
 * link is never redirected away from the page it belongs to.
 */
export function resolveLegacyHash(hash: string): string | null {
  const raw = hash.replace(/^#/, '').replace(/\/+$/, '').toLowerCase()
  if (!raw) return null

  const exact = LEGACY_REDIRECTS[`/${raw}`]
  if (exact) return exact

  // A live section anchor, in either its exact or numbered form.
  if (LIVE_ANCHORS.has(raw) || LIVE_ANCHORS.has(normalise(raw))) return null

  const stripped = normalise(raw)
  if (!stripped) return null
  return LEGACY_REDIRECTS[`/${stripped}`] ?? null
}
