# CONTENT_CHECKLIST.md

Operational reference for populating projects in Sanity Studio. Consult before each publish and again once the preview builds. For URL mapping and the broader migration strategy, see [MIGRATION.md](./MIGRATION.md) — that's the authoritative source. This doc is the shortlist of things easy to forget.

---

## Per-project publish checklist

Complete every row before hitting **Publish** on a `project` document.

- [ ] **Slug** matches the redirect map in [MIGRATION.md § Redirect map](./MIGRATION.md#redirect-map) — or is a brand-new slug that isn't a reserved route (`about`, `contact`, `services`, `experiments`, `work`, `studio`, `api`). The schema enforces this, but double-check against the live site's existing slugs.
- [ ] **Title** set. Used for the `<title>` tag via the `%s — Studio Studio` template and for JSON-LD `CreativeWork.name`.
- [ ] **SEO → Description** written, 120–160 characters. Leave blank to fall back to `subtitle`; leave that blank and it falls back to truncated `about` copy. Write it properly at least once.
  - ✅ Good: `A data-driven LED sculpture commissioned for a corporate lobby. Real-time environmental data drives an evolving generative light composition across a suspended array of custom LED modules.` (190 chars — pick the best 155)
  - ❌ Too short / generic: `Interactive installation by Studio Studio.` (under 60 chars, no useful keywords)
- [ ] **Hero image** uploaded with descriptive **alt text**.
  - ✅ Good alt: `Suspended array of custom LED modules hung in a corporate atrium, glowing amber against a concrete ceiling.`
  - ❌ Bad alt: `Hero image` · `IMG_4982.jpg` · `Installation photo`
- [ ] **Year** set (required by schema — needed for JSON-LD `dateCreated`).
- [ ] **Client** + optional **Client URL** set. Feeds JSON-LD `commissionedBy`. Client URL only resolves if typed correctly; re-copy-paste to avoid typos that produce dead schema links.
- [ ] **Location** set when relevant — `"Brooklyn, NY"`, `"Goat Farm Arts Center, Atlanta"`, etc. Feeds `locationCreated`. Omit entirely if unknown rather than guessing (schema omits the key cleanly).
- [ ] **Body — inline images**: every image in Portable Text has alt text. There is no schema validation for this; it's on you.
- [ ] **Collaborators**: every credit has a working URL. See [Known broken external links](#known-broken-external-links) below before typing from memory.
- [ ] **Optional — SEO overrides**: only fill `seo.title` or `seo.ogImage` if you want values *different* from the defaults (page title, hero image). Empty is fine.
- [ ] **Optional — relatedProjects**: 1–3 editorial cross-links. Improves crawlability (current site has exactly 18 inlinks per project, which is nav-only — editorial links break that uniformity).

---

## Priority tier — populate in this order

Based on current inlink counts from the April 2026 baseline crawl.

| Tier | Projects | Inlinks | Why first |
|---|---|---|---|
| 1 | Storybooth, Moment (Dolby), Sound Journeys, Snowblind, Between, Orbitals, Gesture | 18 each | Highest link equity. Any gap in metadata here has the biggest SEO cost. |
| 2 | Gifbooth, The Light Around Us | 16 / 4+24 | Gifbooth has highest word count; Light Around Us is the canonical destination for 6 gallery redirects + duplicate consolidations. |
| 3 | Rent | 3 | **Decision pending — retire or keep?** Only 48 words, 3 inlinks. Currently omitted from sitemap. Settle before launch (see [MIGRATION.md § Pages to preserve](./MIGRATION.md#pages-to-preserve)). |

Project inventory not yet in the CMS:

- Commercial: The Light Around Us, Storybooth, Dolby Moment, Cox Pillars, Cox Conserves, Living Walls, Hope Hydration HydroStation, Suffolk Building Lobby
- Art: Scatter and Rise, Orbitals, Sound Journeys, Snowblind, Between the Two of These, Gestures

---

## Known broken external links

Found in the April 2026 crawl of the old Squarespace site. Fix during credit entry — don't let these propagate to the new site.

| URL | Status | Replacement |
|---|---|---|
| `https://www.bradleylbowers.com/` | 404 | Check for current site or omit |
| `http://www.newinc.org/` | 404 | Use `https://www.newinc.org` or `https://newmuseum.org/new-inc` |
| NYT "36 Hours in Montgomery" article | 403 | Find current URL or omit |
| `https://tvsdesign.com/` | 526 (SSL error) | Consider `rel="nofollow"` if link must stay |
| Various `http://` links returning status 0 | — | Upgrade to `https://` or remove |

---

## Per-page pre-publish verification

After publishing a project, view the preview URL and confirm:

- [ ] `view-source:` on the project page shows a `<title>` that is **not** `Studio Studio` (the inherited default) — it should be the project title templated to `… — Studio Studio`.
- [ ] `<meta name="description" content="...">` is present and matches your SEO description (or the fallback).
- [ ] At least one `<script type="application/ld+json">` block contains a `CreativeWork` schema. Copy the block body and paste into [validator.schema.org](https://validator.schema.org/) — should report **0 errors, 0 warnings**.
- [ ] Hero image renders (no broken image icon). Open the img `src` in a new tab to confirm the Sanity CDN URL resolves.
- [ ] Breadcrumb JSON-LD lists `Home → Work → {Project}` (3 items, not 2).

---

## Validators and tools

- [Schema.org Markup Validator](https://validator.schema.org/) — paste a JSON-LD block, reports errors/warnings. Use this during CMS population.
- [Google Rich Results Test](https://search.google.com/test/rich-results) — same idea, plus renders a preview of what Google may surface. Use before launch.
- [Google Search Console — URL inspection](https://search.google.com/search-console) — post-launch, force reindex of critical pages on launch day.
- [PageSpeed Insights](https://pagespeed.web.dev/) — Core Web Vitals check before launch (LCP < 2.5s, INP < 200ms, CLS < 0.1 targets per MIGRATION.md).
