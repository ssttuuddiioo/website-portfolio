# CMS_SEED.md

One-time setup for the Sanity CMS after the Phase 3 schema changes land. Populates the `siteSettings` singleton and a single `person` document for the founder — the source documents for the Organization and Person JSON-LD that render on every page.

Content projects themselves are populated separately (not part of this seed).

---

## Option A — Seed script (recommended)

The script is idempotent (`createOrReplace`) — safe to re-run if the seed values in `docs/MIGRATION.md` change.

### Prerequisites

1. A Sanity API token with **Editor** or **Write** role. Create one at https://www.sanity.io/manage → your project → API → Tokens.
2. Set the token in `.env.local` (or export for the shell session):
   ```
   SANITY_API_TOKEN=sk...
   ```
   `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` should already be set from earlier phases.

### Run

```bash
npm run seed:site
```

(`tsx` is required — install with `npm i -D tsx` if the script errors on startup.)

Expected output:

```
Seeding → project=<id> dataset=production
  · creating founder person document…
  · creating siteSettings singleton…
✓ Seed complete.
  Next steps: upload an Organization logo in Studio (siteSettings.logo).
```

### What the script writes

| Document | _id | Purpose |
|---|---|---|
| `person` | `pabloGnecco` | Founder — referenced by `siteSettings.founder`. Drives Person JSON-LD and Organization.founder subgraph. IDs must not contain a `.` — Sanity treats dotted IDs as system-private on public datasets. |
| `siteSettings` | `siteSettings` | Singleton. Drives Organization JSON-LD. |

Exact field values live in [scripts/seed-site.ts](../scripts/seed-site.ts) — change there if MIGRATION.md changes.

---

## Option B — Manual setup via Studio UI

If you don't have a write token or prefer clicking through:

### 1. Create the Person document

In `/studio` → **Person** → **Create new**:

| Field | Value |
|---|---|
| Name | `Pablo Gnecco` |
| Job title | `Experiential Director & Creative Technologist` |
| URL | `https://yopablo.com` |
| Socials | `https://instagram.com/yopablo` |

Publish. Note the document ID (visible in the URL).

### 2. Open the Site Settings singleton

`/studio` → **Site Settings** (top of the sidebar).

Fill in the **Organization JSON-LD fields** section:

| Field | Value |
|---|---|
| Organization name | `Studio Studio` |
| Organization alternate name | `Studio Studio NYC` |
| Organization description | `Studio Studio is an interactive installation company in New York City. Inaugural members of the New Museum's NEW INC, we create immersive experiences through collaboration with artists, engineers, and designers.` |
| Founder | *(reference — select the Pablo Gnecco person you just created)* |
| Address → Locality | `Brooklyn` |
| Address → Region | `NY` |
| Address → Country | `US` |
| Memberships | `NEW INC` → `https://www.newinc.org` · `Mana Contemporary` → `https://www.manacontemporary.com` |
| Expertise topics | `Experiential design`, `Creative technology`, `Lighting design`, `Interactive installations`, `Immersive environments` |
| Canonical external URLs (sameAs) | `https://instagram.com/yopablo`, `https://yopablo.com` |

Publish.

### 3. Upload the logo (optional)

In Site Settings → **Organization logo**, upload a logo. Until this is set, JSON-LD falls back to `https://studiostudio.nyc/logo.png` — which 404s unless a file is dropped in `public/logo.png`.

---

## Verification after seed

1. Visit the site. View source on `/` — the Organization JSON-LD `description` should match what you set in Studio, not the hardcoded fallback.
2. Paste any `<script type="application/ld+json">` block into https://validator.schema.org/ — should report **0 errors, 0 warnings**.
3. If JSON-LD still shows the hardcoded fallback values after seeding, check:
   - Next.js's ISR cache — the layout revalidates when the underlying data changes. Force a rebuild in preview.
   - Sanity CDN lag — `useCdn: true` can take a minute to reflect fresh writes.

## Reseeding / changing values

- **Preferred:** edit `scripts/seed-site.ts`, re-run `npm run seed:site`. All downstream values sync.
- **One-off edit:** change directly in Studio. Next seed run will overwrite it (`createOrReplace`) unless you also update the script.
