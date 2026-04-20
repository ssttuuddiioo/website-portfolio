# MIGRATION.md

Replatforming studiostudio.nyc from Squarespace to Next.js 16 + Sanity v5 on Vercel. This document is the source of truth for URL mapping, SEO preservation, and content-model requirements during the migration.

**Principle: preservation-first.** The domain stays the same. Existing URLs stay the same unless explicitly listed for change. The less we alter, the more SEO equity and AI-answer-engine visibility carries over.

---

## Pre-migration baseline (captured April 2026)

- **Total URLs crawled:** 22
- **Indexable pages:** 14
- **Broken URLs:** 1 internal 404 (`/the-light-around-us`), 3 broken external links
- **Soft redirects to clean up:** 6 Squarespace gallery-hash URLs currently returning 302 (should be 301)
- **Structured data:** none (no JSON-LD anywhere on current site)
- **Meta descriptions:** only 2 of 15 indexable pages have one
- **Homepage title tag:** `HOME` (4 chars — critical fix)
- **H1 on every page:** `studio studio` (should be the page topic)

The small URL count means the scope is tractable. The weak on-page signals mean this migration is an opportunity to *improve* rankings, not just preserve them.

---

## URL routing decision

The old site has projects at root (`/storybooth`, `/moment`, `/snowblind`, etc.). The current scaffold has them at `/work/[slug]`. This must be resolved before any redirect work.

### Option A — Keep root-level project URLs (recommended)

Move project routes from `/work/[slug]` to `/[slug]` (catchall or explicit). `/work` becomes an index-only page.

- **Redirects needed:** 4 cleanup cases only (see below)
- **Link equity loss:** near-zero
- **IA tradeoff:** mildly flatter URL structure, but matches current site

### Option B — Move everything under `/work/[slug]`

Current scaffold wins, 11 additional 301s required.

- **Redirects needed:** 4 cleanup cases + 11 project slug redirects
- **Link equity loss:** small but measurable per redirect
- **IA tradeoff:** cleaner hierarchy, but every existing inbound link (internal and external) passes through a 301

**Recommendation: Option A.** The preservation case is stronger for a portfolio of this scale. URLs aren't broken, they're just at root.

---

## Redirect map

All redirects are **301 (permanent)**. Never use 302 for migration redirects. Never redirect anything to the homepage — Google treats mass homepage redirects as soft-404s.

### Cleanup redirects (required regardless of routing option)

| Old URL | New URL | Reason |
|---|---|---|
| `/the-light-around-us-1` | `/the-light-around-us` | Drop Squarespace `-1` suffix |
| `/orbitalsv1` | `/orbitals` | Drop legacy `v1` suffix |
| `/light-around-us` | `/the-light-around-us` | Duplicate parent |
| `/light-around-us/` | `/the-light-around-us` | Trailing-slash duplicate |
| `/light-around-us/:hash*` | `/the-light-around-us` | Wildcard for 6 Squarespace gallery-hash URLs currently 302'ing |

### Option B only — project slug relocations

Skip this section if Option A is chosen.

| Old URL | New URL |
|---|---|
| `/storybooth` | `/work/storybooth` |
| `/moment` | `/work/moment` |
| `/sound-journeys` | `/work/sound-journeys` |
| `/snowblind` | `/work/snowblind` |
| `/between` | `/work/between` |
| `/gesture` | `/work/gesture` |
| `/gifbooth` | `/work/gifbooth` |
| `/the-light-around-us` | `/work/the-light-around-us` |
| `/orbitals` (post-cleanup) | `/work/orbitals` |
| `/rent` | `/work/rent` (or retire — only 3 inlinks, 48 words) |
| *(existing)* `/about` | `/about` (stays) |
| *(existing)* `/contact` | `/contact` (stays) |

### Next.js redirects config (Option A)

```ts
// next.config.ts
async redirects() {
  return [
    { source: '/the-light-around-us-1', destination: '/the-light-around-us', permanent: true },
    { source: '/orbitalsv1', destination: '/orbitals', permanent: true },
    { source: '/light-around-us', destination: '/the-light-around-us', permanent: true },
    { source: '/light-around-us/', destination: '/the-light-around-us', permanent: true },
    { source: '/light-around-us/:hash*', destination: '/the-light-around-us', permanent: true },
  ]
}
```

### A note on status codes (301 vs 308)

This doc uses "301" throughout as shorthand for *permanent redirect*, but Next.js's `permanent: true` actually emits HTTP **308** (Permanent Redirect), the HTTP/1.1 successor to 301. Functionally identical for SEO: Google, Bing, and every modern crawler treat 308 and 301 the same for indexing and link-equity purposes. The practical difference is that 308 preserves the request method (GET stays GET, POST stays POST), whereas 301 technically permits clients to switch to GET — irrelevant for static marketing-site redirects but worth knowing.

Do not override this — leave `permanent: true` as-is. Only reach for a temporary redirect (`permanent: false` → 307) if the destination is genuinely transient, which is not the case for any row in the redirect map above.

---

## Pages to preserve (per-page content brief)

### Homepage `/`

- **Title (CRITICAL fix):** `Studio Studio — Experiential Design & Creative Technology, NYC`
- **Meta description (preserve VERBATIM — do not rewrite):**
  > Studio Studio is an interactive installation company in New York City. Inaugural members of the New Museum's, NEWINC, we strive to create new immersive experiences through collaboration with artists, engineers, and designers. We like art, light, code, and coffee. Let's make things together.
- **H1:** `Studio Studio` (brand as H1 is acceptable on homepage only)
- **Structured data:** `Organization` + `Person` (founder)
- **Inlinks:** 55 (highest on site)
- **Must include:** client logo strip (HBO, Google, Intel, Sony, Dolby, etc.)

### `/about`

- **Title:** `About — Studio Studio`
- **Meta description (new — write):** ~150 chars covering Pablo, practice, NEW INC, Mana Contemporary, client roster
- **H1:** `About`
- **Inlinks:** 31

### `/contact`

- **Title:** `Contact — Studio Studio`
- **Meta description (new):** ~140 chars, include NYC location and "experiential" / "creative technology"
- **H1:** `Contact`
- **Structured data:** include `ContactPoint` in Organization schema
- **Inlinks:** 31

### Project pages — shared requirements

Every project page needs: unique title, unique meta description (120–160 chars), descriptive H1 matching the project name (not "studio studio"), at least one H2 for section breaks, `CreativeWork` JSON-LD, `BreadcrumbList` JSON-LD, alt text on every image, collaborator credits.

| Slug | Current title | Current words | Inlinks | Notes |
|---|---|---|---|---|
| `/the-light-around-us` | The Light | 68 | 4 + 24 (post-consolidation) | Canonical destination for 6 gallery redirects + duplicates. Debuted at Spacelab / tvsdesign, Atlanta. |
| `/storybooth` | Storybooth | 128 | 18 | |
| `/moment` | Moment | 110 | 18 | Dolby commission — consider `Dolby Moment` in title |
| `/sound-journeys` | Sound Journeys | 72 | 18 | |
| `/snowblind` | Snowblind | 197 | 18 | Strongest content body |
| `/between` | Between the Two of These | 74 | 18 | Slug is short; preserve for stability |
| `/orbitals` | Orbitals | 68 | 18 | Post-cleanup slug |
| `/gesture` | gesture-gesture | 108 | 18 | H1 alignment — use `Gesture Gesture` |
| `/gifbooth` | Gifbooth | 237 | 16 | Highest word count |
| `/rent` | rent | 48 | 3 | Lowest traffic — consider retiring |

---

## Known issues to fix during migration

1. **Broken external links** — audit collaborator credits during CMS population:
   - `https://www.bradleylbowers.com/` → 404
   - `http://www.newinc.org/` → 404 (use `https://www.newinc.org` or `https://newmuseum.org/new-inc`)
   - NYT 36-hours-Montgomery article → 403
2. **Unreliable external links** — consider `rel="nofollow"`:
   - `https://tvsdesign.com/` → 526 (SSL error)
   - Various `http://` links that return status 0
3. **No editorial cross-linking** — every project page has exactly 18 inlinks (nav only). Add `relatedProjects[]` references in Sanity to create editorial link paths.

---

## Sanity schema requirements

### `project` additions

```ts
// Existing project schema gains:
{
  name: 'seo',
  type: 'object',
  fields: [
    { name: 'title', type: 'string', description: 'Overrides default. Leave blank to use project name.' },
    { name: 'description', type: 'text', rows: 3, validation: Rule => Rule.max(160) },
    { name: 'ogImage', type: 'image' },
  ],
},
{
  name: 'relatedProjects',
  type: 'array',
  of: [{ type: 'reference', to: [{ type: 'project' }] }],
  validation: Rule => Rule.max(3),
},
```

### `site-settings` additions (for Organization JSON-LD)

```ts
{
  name: 'orgName', type: 'string', // 'Studio Studio'
},
{
  name: 'founder', type: 'reference', to: [{ type: 'person' }],
},
{
  name: 'clientList',
  type: 'array',
  of: [{ type: 'object', fields: [
    { name: 'name', type: 'string' },
    { name: 'url', type: 'url' },
    { name: 'logo', type: 'image' },
  ]}],
},
{
  name: 'sameAs',
  type: 'array',
  of: [{ type: 'url' }],
  description: 'Social profiles and canonical external references — Instagram, yopablo.com, etc.'
},
{
  name: 'address',
  type: 'object',
  fields: [
    { name: 'locality', type: 'string' }, // 'Brooklyn'
    { name: 'region', type: 'string' }, // 'NY'
    { name: 'country', type: 'string' }, // 'US'
  ],
},
{
  name: 'knowsAbout',
  type: 'array',
  of: [{ type: 'string' }],
  description: 'Topics/services for Organization schema. e.g. "Experiential design", "Creative technology", "Lighting design"'
},
```

---

## JSON-LD templates

### Homepage Organization schema

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Studio Studio",
  "alternateName": "Studio Studio NYC",
  "url": "https://studiostudio.nyc",
  "logo": "https://studiostudio.nyc/logo.png",
  "description": "Studio Studio is an interactive installation company in New York City. Inaugural members of the New Museum's NEW INC, we create immersive experiences through collaboration with artists, engineers, and designers.",
  "founder": {
    "@type": "Person",
    "name": "Pablo Gnecco",
    "jobTitle": "Experiential Director & Creative Technologist",
    "url": "https://yopablo.com"
  },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Brooklyn",
    "addressRegion": "NY",
    "addressCountry": "US"
  },
  "memberOf": [
    { "@type": "Organization", "name": "NEW INC", "url": "https://www.newinc.org" },
    { "@type": "Organization", "name": "Mana Contemporary", "url": "https://www.manacontemporary.com" }
  ],
  "knowsAbout": [
    "Experiential design",
    "Creative technology",
    "Lighting design",
    "Interactive installations",
    "Immersive environments"
  ],
  "sameAs": [
    "https://instagram.com/yopablo",
    "https://yopablo.com"
  ]
}
```

### Project page CreativeWork schema

```json
{
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "name": "{{project.title}}",
  "description": "{{project.seo.description || project.excerpt}}",
  "creator": {
    "@type": "Organization",
    "name": "Studio Studio",
    "url": "https://studiostudio.nyc"
  },
  "commissionedBy": {
    "@type": "Organization",
    "name": "{{project.client.name}}",
    "url": "{{project.client.url}}"
  },
  "dateCreated": "{{project.year}}",
  "locationCreated": {
    "@type": "Place",
    "name": "{{project.location}}"
  },
  "keywords": "{{project.categories.join(', ')}}",
  "image": "{{project.heroImage.url}}"
}
```

### BreadcrumbList (every non-homepage route)

Flat pages (`/about`, `/contact`, `/services`, `/experiments`) use a 2-item trail:

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://studiostudio.nyc" },
    { "@type": "ListItem", "position": 2, "name": "{{page.title}}", "item": "{{page.url}}" }
  ]
}
```

Project pages use a 3-item trail with `Work` as the intermediate step, even though projects live at root. The extra node reflects the site's IA — projects are part of the work index — and matches how the global nav presents them.

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://studiostudio.nyc" },
    { "@type": "ListItem", "position": 2, "name": "Work", "item": "https://studiostudio.nyc/work" },
    { "@type": "ListItem", "position": 3, "name": "{{project.title}}", "item": "{{project.url}}" }
  ]
}
```

---

## robots.txt

Must explicitly allow AI crawlers. Next.js App Router supports this via `src/app/robots.ts` as a file convention.

```ts
// src/app/robots.ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/studio', '/api'] },
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'Claude-Web', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'Googlebot', allow: '/' },
    ],
    sitemap: 'https://studiostudio.nyc/sitemap.xml',
  }
}
```

Do not add a blanket `Disallow: /` — the existing AI-discovery win depends on these crawlers having access.

---

## sitemap.xml

Next.js App Router `src/app/sitemap.ts` convention. Must pull from Sanity, not hardcode.

```ts
import type { MetadataRoute } from 'next'
import { client } from '@/lib/sanity/client'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await client.fetch(`*[_type == "project" && !(_id in path("drafts.**"))]{
    "slug": slug.current,
    _updatedAt
  }`)
  const base = 'https://studiostudio.nyc'
  const staticRoutes = [
    { url: base, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 1 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.7 },
  ]
  const projectRoutes = projects.map((p: { slug: string; _updatedAt: string }) => ({
    url: `${base}/${p.slug}`, // change to `${base}/work/${p.slug}` if Option B routing
    lastModified: new Date(p._updatedAt),
    changeFrequency: 'yearly' as const,
    priority: 0.9,
  }))
  return [...staticRoutes, ...projectRoutes]
}
```

---

## Pre-launch QA checklist

Before switching DNS from Squarespace to Vercel:

- [ ] Deploy to Vercel preview URL
- [ ] Re-crawl with Screaming Frog against the preview URL
- [ ] Verify every redirect in the map fires correctly (old URL → 301 → new URL)
- [ ] Verify every canonical tag points to the new URL (not preview, not old)
- [ ] Verify `robots.ts` allows AI crawlers on production (not just preview)
- [ ] Verify `sitemap.xml` generates and includes every published project
- [ ] Verify JSON-LD validates in Google's Rich Results Test
- [ ] Verify homepage title is NOT `HOME`
- [ ] Verify homepage meta description matches the preserved verbatim copy
- [ ] Verify no page has a missing meta description
- [ ] Verify `/studio` is `noindex` (via `robots.ts` Disallow + meta robots tag in Studio layout)
- [ ] Verify Core Web Vitals on preview (LCP < 2.5s, INP < 200ms, CLS < 0.1)
- [ ] Confirm all images have descriptive alt text (crawl showed blank alts on current site)

## Launch day

1. Update DNS A/CNAME records to Vercel
2. Submit new sitemap in Google Search Console (`https://studiostudio.nyc/sitemap.xml`)
3. Use the URL Inspection tool on 3–5 top pages to force reindex
4. Run live crawl to confirm redirects fire in production
5. Verify SSL cert is active (Vercel handles this automatically)

## Post-launch monitoring (30 days)

- Daily for first 2 weeks: Search Console Coverage report, fix any 404s that surface immediately
- Weekly: check indexed page count (should stabilize within 2–3 weeks for a site this size)
- Week 4: check ranking positions for key queries (brand queries first, then "experiential design NYC", "interactive installation studio", etc.)
- Expect a temporary dip. Full recovery typical within 30 days for a site under 25 URLs.

---

## Content-entry checklist (per project, during CMS population)

Before publishing any `project` document:

- [ ] `slug.current` matches the redirect map (or is intentionally new)
- [ ] `title` is set
- [ ] `seo.description` written (120–160 chars) — OR page falls back to a reliable auto-generated description
- [ ] `heroImage` has `alt` text (descriptive, not filename)
- [ ] All inline images in Portable Text blocks have `alt` text
- [ ] `collaborators` field populated with working URLs (re-check the broken external links list above)
- [ ] `relatedProjects` — add 1–3 editorial links to related work
- [ ] `year`, `client`, `location` set (needed for CreativeWork JSON-LD)
- [ ] `categories` set (feeds keywords)
- [ ] Preview the page and verify: title tag ≠ "HOME", H1 is project name, meta description is present, JSON-LD validates
