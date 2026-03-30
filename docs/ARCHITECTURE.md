# ARCHITECTURE.md — Site Map, Routes, and Content Plan

## Route Map

```
/                           Homepage
├── /work                   Project index (filterable grid)
│   └── /work/[slug]        Individual project page
├── /about                  Bio, experience, press, philosophy
├── /services               Capabilities and offerings
├── /experiments            Lab projects, tools, side work
├── /contact                Contact form + info
└── /studio                 Sanity Studio (CMS admin, auth-gated)
```

---

## Page Specifications

### Homepage `/`

**Purpose:** First impression. Communicate range, quality, and identity in one scroll.

**Sections (scroll order):**

1. **Hero**
   - Full-viewport height
   - Background: looping video reel (30-60s, muted) OR generative visual (R3F canvas)
   - Center: "Studio Studio" wordmark, large
   - Below wordmark: tagline — e.g., "Experiential Direction · Creative Technology · Brooklyn, NY"
   - Scroll indicator (subtle animated chevron or "Scroll" in mono type)
   - On scroll: hero content fades/parallaxes up, first section reveals

2. **Featured Work**
   - 3-5 projects, manually ordered via Sanity `featuredProjects` in siteSettings
   - Layout: stacked full-width sections, each gets ~60vh
   - Each section: large image/video left or right (alternating), project title + client + one-line on the opposite side
   - Click anywhere on the section → navigate to /work/[slug]
   - Scroll-triggered reveal animation per section

3. **Services Strip**
   - Single-line horizontal text on desktop (wraps naturally on mobile)
   - "Experiential Direction · Lighting Design · Custom Software · Creative Technology · Motion · Consulting · Mentoring"
   - Subtle left-to-right reveal on scroll
   - Optional: light horizontal rule above and below

4. **Index Teaser**
   - Heading: "All Work" or "Index"
   - 3x3 or 4x3 grid of project thumbnails (pulling from full project list, non-featured)
   - Each card: thumbnail + title + year on hover
   - "View all →" link to /work
   - Dense, efficient, shows breadth

5. **About Teaser**
   - Split layout: photo left, short bio text right
   - Bio from `siteSettings.aboutTeaser`
   - "More about Pablo →" link to /about
   - Keep it to 3-4 sentences max

6. **Contact / Footer**
   - Email link (large, prominent)
   - Social icons row (IG, Vimeo, GitHub, LinkedIn)
   - © 2026 Studio Studio · Brooklyn, NY
   - Optional: small form (name + email + message)

---

### Project Index `/work`

**Purpose:** Show everything. Let visitors filter and browse efficiently.

**Layout:**

```
┌─────────────────────────────────────────────────────┐
│  WORK                                               │
│                                                     │
│  [All] [Commercial] [Art] [Lighting] [Software]     │  ← filter tabs
│  [Experiments]                                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─── Featured ──────────────────────────────────┐  │
│  │  [Hero Project 1]      [Hero Project 2]       │  │  ← 2-col, large
│  │  [Hero Project 3]                             │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ┌─── All Projects ─────────────────────────────┐  │
│  │  [thumb] [thumb] [thumb] [thumb]              │  │  ← 3-4 col, compact
│  │  [thumb] [thumb] [thumb] [thumb]              │  │
│  │  [thumb] [thumb] [thumb] [thumb]              │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**Behavior:**
- Filter tabs use URL params (`/work?category=commercial`) for shareability
- Filtering animates cards with Framer Motion layout animations (reorder/fade)
- Featured projects section collapses when a filter other than "All" is active
- Cards reveal on scroll with staggered animation

---

### Project Detail `/work/[slug]`

**Purpose:** Deep dive into a single piece of work. Let the media speak.

**Structure:**
1. Hero media (full-bleed image or video)
2. Title + subtitle
3. Metadata bar (client, role, year, tech — horizontal, mono type)
4. Body content (Portable Text rendered with custom components)
5. Collaborators section (if any)
6. "Next Project" card at bottom (persistent at-a-glance navigation)

**Technical:**
- Generated statically via `generateStaticParams` at build time
- ISR with 60s revalidation for content updates
- Dynamic OG image from `ogImage` or `heroImage`

---

### About `/about`

**Sections:**
1. **Header** — "About" or Pablo's name
2. **Bio** — Full-length version (3-4 paragraphs)
3. **Experience** — Selective timeline, not a full resume
   - Studio Studio (2015–Present) — Founder
   - Chemistry Creative (2022–2025) — Experiential Director
   - Giant Spoon (2017–2018) — Creative Technologist
   - Invisible North (2018–2019) — Creative Technologist
   - NEW INC (inaugural member)
   - Mana Contemporary (resident artist)
   - Steve Jobs Archive (mentor)
   - NYU ITP (mentor)
4. **Press** — Table format: publication, headline, date, link
5. **Philosophy** — Short section on approach (story over spectacle)

---

### Services `/services`

**Structure:**
Not a typical "services page" with icons and bullet points. More like a clear statement of capability.

```
WHAT WE DO

Experiential Direction
  From concept through production. Interactive installations, brand activations,
  public art commissions, festivals, and cultural events.

Lighting Design
  LED systems, pixel mapping, DMX/sACN control, architectural lighting,
  permanent and temporary installations.

Custom Software
  Bespoke applications for installations, kiosks, real-time media systems,
  control interfaces, and audience interaction.

Creative Technology Consulting
  Technical direction, feasibility studies, vendor coordination, prototyping,
  and production support for creative projects.

Motion Design
  Animation, real-time graphics, generative visuals, and motion systems
  for installations and digital experiences.

Brand & Product Design
  Visual identity, packaging, web design, and digital product development
  for creative and consumer brands.

Mentoring & Education
  NYU ITP mentorship, Steve Jobs Archive, workshops, and one-on-one
  creative technology guidance.
```

Each service: title (large) + 2-line description (body text). No icons. Clean vertical stack.

CTA at bottom: "Let's talk about your project →" linking to /contact

---

### Experiments `/experiments`

**Purpose:** Show the tinkering. This is what makes Pablo interesting to the dev/designer community.

**Layout:** Card grid, simpler than the project index.

```
┌──────────────────────────┐
│  [screenshot/visual]     │
│                          │
│  Stage Controller        │
│  Preact · TypeScript     │
│  ENTTEC ELM control      │
│  [Active]                │
│  [Live ↗] [GitHub ↗]     │
└──────────────────────────┘
```

**Projects to include:**
- Stage Controller v2 (lighting control app)
- Pour Perfect (guided pour-over timer)
- choosing.sucks (restaurant picker, with Allister)
- Framer Border Tool (lossless image borders)
- Toditox (business command center)
- 9to5.tv (festival archive)
- Interactive SVG illusions (tunnel perspective experiment)
- Cupping app concept (SCA CVA protocol)

---

## Project Inventory

### Priority 1 — Launch (populate first)

| Project | Category | Client | Year | Status |
|---------|----------|--------|------|--------|
| Hope Hydration HydroStation | Commercial | Hope Hydration / Bould Design | 2024-25 | TIME Best Inventions |
| The Light Around Us | Art/Commercial | tvsdesign / Spacelab | 2020 | Complete |
| StoryBooth | Commercial | Michigan Central Station | 2019 | Complete |
| Dolby Moment | Commercial | Dolby | 2015 | Complete |
| Scatter and Rise | Art | Goat Farm Arts Center | 2023 | Complete |
| Gestures | Art | Personal / Nelson Street Gallery | 2014 | VICE feature |
| Suffolk Building Lobby | Lighting | Chemistry Creative | 2023 | Complete |
| Cox Pillars | Commercial | Cox Communications | 2024 | Complete |

### Priority 2 — Post-Launch

| Project | Category | Client | Year |
|---------|----------|--------|------|
| Orbitals | Art | Personal | 2018 |
| Sound Journeys | Art | Personal | 2017 |
| Snowblind | Art | Personal | 2016 |
| Between The Two of These | Art | Personal | 2016 |
| Living Walls | Commercial | Mercedes-Benz Stadium | 2024 |
| Cox Conserves | Commercial | Cox Communications | 2024 |

### Experiments — Launch

| Experiment | Tech | Status |
|------------|------|--------|
| Stage Controller v2 | Preact, TypeScript, ENTTEC API | Active |
| choosing.sucks | React, Supabase, AI | Active |
| Pour Perfect | Expo Router, React Native | Concept |
| Framer Border Tool | Electron, React, Sharp | Complete |

---

## Technical Implementation Notes

### Data Fetching Strategy

- **Homepage:** `fetch` in server components with ISR (revalidate: 60)
- **Project Index:** Static generation with `revalidate: 60`
- **Project Detail:** `generateStaticParams` for all published projects, ISR fallback
- **About/Services:** Static, content from Sanity singleton or page documents
- **Experiments:** Static with ISR

### Image Pipeline

1. All images uploaded to Sanity
2. Sanity CDN serves responsive images via URL transforms (`?w=800&h=600&fit=crop`)
3. Next.js `Image` component with Sanity loader
4. LQIP (Low Quality Image Placeholder) from Sanity metadata for blur-up effect
5. WebP format auto-served by Sanity CDN

### Deployment

- Vercel (connected to GitHub repo)
- Sanity webhook → Vercel on-demand ISR revalidation
- Preview mode: Sanity Studio "Preview" button opens draft content on site
- Environment: production branch deploys to studiostudio.nyc

### DNS

- studiostudio.nyc → Vercel (A records + CNAME)
- Consider: yopablo.com redirects to studiostudio.nyc (or vice versa — Pablo's call)
- Sanity Studio accessible at studiostudio.nyc/studio
