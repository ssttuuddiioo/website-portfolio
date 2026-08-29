# CLAUDE.md — Studio Studio Website

## Project Overview

Studio Studio (studiostudio.nyc) is the creative practice of Pablo Gnecco — a Colombian-born experiential director, creative technologist, and lighting designer based in Brooklyn. This is a custom-built portfolio and studio website that serves as both agency presence and personal creative showcase.

The site is NOT a generic portfolio template. It is an artifact of the practice itself — the design, interactions, and technical execution should demonstrate the same craft that goes into the installations and experiences Studio Studio creates.

### What Studio Studio Does

Pablo works across commercial experiential production, personal artwork, and creative technology consulting. The studio has produced work for HBO, Google, Intel, Sony, Dolby, Michigan Central Station, Cox Communications, Mercedes-Benz Stadium, and others. Pablo is an inaugural member of The New Museum's NEW INC, a resident artist at Mana Contemporary, a mentor at NYU ITP and Steve Jobs Archive, and founder of the 9to5.tv festival in Atlanta.

Services include:
- Experiential direction and production
- Creative technology consulting
- Lighting design (LED systems, pixel mapping, DMX/sACN)
- Custom software development (interactive installations, kiosks, real-time media)
- Motion design
- Brand and product design
- Mentoring and education

### The Hybrid Model

This site must communicate to THREE audiences simultaneously:
1. **Brands and agencies** → commercial credibility, client roster, production capabilities, "hire us" energy
2. **Art institutions, galleries, festivals** → artistic depth, conceptual framing, personal voice
3. **Designer/developer community** → technical chops, experiments, open tools, mentorship credibility

The tone is confident and sparse. Not "we're a full-service agency" — more "this is the work, this is who made it, here's how to work together." Story over spectacle.

---

## Tech Stack

```
├── Next.js 14+ (App Router, TypeScript)
├── Sanity v3 (CMS, embedded Studio at /studio)
├── Tailwind CSS v4
├── Framer Motion (page transitions, scroll animations, micro-interactions)
├── Lenis (smooth scrolling)
├── React Three Fiber + Drei (optional — for experimental 3D elements)
├── Vercel (hosting, ISR for content updates)
└── TypeScript throughout
```

### Why This Stack
- Same architecture Pablo used on Coffee Five (proven, familiar)
- Sanity gives full content control without touching code
- Next.js App Router for clean routing, server components, and ISR
- Lenis + Framer Motion for the ultra-smooth, elegant scrolling and transitions Pablo wants
- R3F is available but not required — only use for specific experimental moments, not decoration

### Key Dependencies
```json
{
  "next": "^14.x",
  "react": "^18.x",
  "sanity": "^3.x",
  "next-sanity": "^9.x",
  "@sanity/image-url": "^1.x",
  "framer-motion": "^11.x",
  "lenis": "^1.x",
  "@react-three/fiber": "^8.x",
  "@react-three/drei": "^9.x",
  "tailwindcss": "^4.x",
  "typescript": "^5.x"
}
```

---

## Site Architecture

### Pages

```
/                    → Homepage (hero + featured work + services strip + about teaser + contact)
/work                → Full project index (filterable grid, all projects)
/work/[slug]         → Individual project page (case study / gallery)
/about               → Full bio, experience, press, philosophy
/services            → What Studio Studio offers (consulting, production, etc.)
/experiments         → Lab / side projects / tools / open source
/contact             → Contact form + booking
/studio              → Sanity Studio (CMS admin, protected)
```

### Homepage Flow (single scroll)

Informed by: Iregular (video-first cards, minimal metadata), Magicstreet (dark UI, project structure), Shore (dense index), Republik (smooth scroll, client logos), Cul de Sac (confident voice, organic image flow).

1. **Hero** — Full-viewport. Looping video reel (30-60s, muted) OR generative visual (R3F canvas). "Studio Studio" centered, large display type. One-line descriptor: "Creative Technology · Experiential Direction · Brooklyn, NY". Scroll indicator at bottom.

2. **Featured Projects** — 3-5 hero projects as stacked full-bleed sections (à la Iregular). Each section ~60-70vh. Large autoplay video loop or image fills most of the viewport. Project title + client + year overlaid or adjacent — minimal metadata, no descriptions. Scroll-triggered reveal with Framer Motion. Click anywhere → navigate to /work/[slug].

3. **Client Logo Strip** — Horizontal infinite-scroll row of client logos in monochrome/white (à la Republik). HBO · Google · Intel · Sony · Dolby · Michigan Central · Cox · Mercedes-Benz · Chemistry Creative. Pauses on hover. Subtle fade as logos enter/exit viewport center.

4. **Services Strip** — Single line of capabilities, clean typography. "Experiential Direction · Lighting Design · Custom Software · Creative Technology · Motion · Consulting · Mentoring". Centered dot or thin bar separators.

5. **Index Teaser** — Dense grid of small thumbnails showing breadth (à la Shore). 4x3 or 4x4 grid. Each card: thumbnail only, title + year on hover. "View all work →" link to /work.

6. **About Teaser** — Split layout: photo left, 3-4 sentences right. Confident personal voice: "Built by Pablo Gnecco in Brooklyn." Link to /about.

7. **Footer / Contact** — Email link (large, prominent). Social icons (IG, Vimeo, GitHub, LinkedIn). © 2026 Studio Studio · Brooklyn, NY.

### /work (Project Index)

Hybrid layout:
- Top: 3-5 featured/hero projects (large cards with video thumbnails)
- Below: Expandable full index grid (smaller cards, filterable)
- Filter categories: All, Commercial, Art, Experiments, Lighting, Software
- Each card: thumbnail, title, client/context, year, tags
- Hover: subtle scale + overlay with quick info
- Click: navigates to /work/[slug]

### /work/[slug] (Project Page)

Flexible template driven by Sanity schema:
- Hero media (video, image, or embedded iframe)
- Project metadata (client, role, year, collaborators, technologies)
- Body content (rich text blocks, full-bleed images, video embeds, image grids, pull quotes)
- "Next project" navigation at bottom
- No sidebar, no clutter — let the work breathe

### /about

- Full bio (longer version)
- Experience timeline (not a resume — selective, meaningful positions)
- Press mentions (TIME, VICE, Forbes, ADC, etc.)
- Recognition (NEW INC, Mana Contemporary, Steve Jobs Archive, etc.)
- Philosophy section (story over spectacle, the Colombian roots, the bridge between art and commerce)
- Photo of Pablo (Fujifilm quality, candid or environmental portrait)

### /services

- Clear list of offerings with brief descriptions
- Not a pricing page — a capabilities page
- Framed around outcomes, not deliverables
- CTA to contact/booking

### /experiments

- Lab projects, side projects, open-source tools
- Things like: Stage Controller, Pour Perfect, choosing.sucks, Framer border tool, interactive SVG illusions
- Each gets a card with description, tech stack, and link (live demo or GitHub)
- This page speaks to the developer/designer community audience

---

## Design Direction

### Philosophy

Rams meets gmunk. Functional minimalism with cinematic depth. Every element earns its place. The site should feel like walking into a well-designed studio — clean surfaces, intentional lighting, the work is the protagonist.

### Key Principles

1. **The work is the hero.** Design recedes. Big images, big video. No decorative UI competing with project visuals.
2. **Smooth and intentional motion.** Lenis smooth scroll. Framer Motion page transitions. Everything eases in and out with purpose — no jarring cuts, no bouncy animations.
3. **Typography does the heavy lifting.** Strong type hierarchy. Display font for impact, mono or sans for system/metadata. Let type choices communicate precision and craft.
4. **Dark-first with light option.** Default to dark mode (the work photographs and videos pop against dark). Light mode available but secondary.
5. **Density when needed, space when needed.** Hero sections breathe. The full index is dense and efficient. Know when to zoom in and when to zoom out.

### Color Tokens

See `docs/DESIGN_SYSTEM.md` for full token definitions.

Core palette:
- Background: near-black (`#0A0A0A`) in dark mode, warm white (`#F5F2EE`) in light
- Foreground/text: off-white (`#E8E4DF`) in dark, near-black in light
- Accent: a single warm accent — not brand orange, not neon. Something like oxidized copper or terracotta (`#C4704B`). Used sparingly for links, active states, hover.
- Muted: mid-gray for secondary text, metadata, borders (`#666` dark / `#999` light)
- Surface: slightly elevated panels (`#141414` dark / `#FFFFFF` light)

### Typography

Two fonts max:
- **Display / Headings**: A distinctive grotesque or geometric sans. Candidates: Neue Haas Grotesk Display, Söhne, Favorit, Untitled Sans, or GT America. Must have good weight range (Light through Bold).
- **Mono / System / Metadata**: A clean monospace for tags, dates, technical info. Candidates: JetBrains Mono, Berkeley Mono, or IBM Plex Mono.

Body text uses the display font at regular weight. No separate body font needed — keep the family tight.

### Animation Tokens

```
--ease-smooth: cubic-bezier(0.22, 1, 0.36, 1)    // primary easing, Lenis-aligned
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)    // for elements entering
--ease-in-expo: cubic-bezier(0.7, 0, 0.84, 0)     // for elements exiting
--duration-fast: 200ms                              // micro-interactions
--duration-normal: 400ms                            // standard transitions
--duration-slow: 800ms                              // page transitions, hero reveals
--duration-scroll: 1200ms                           // scroll-linked animations
```

### Layout

- Max content width: `1440px`
- Edge: a single `--edge` (40px) at every breakpoint — the inset for anything pinned to a viewport edge, and `--gutter` reads from it so content sits on the same line
- Grid: 12-column on desktop, 6 on tablet, 4 on mobile
- Full-bleed sections break the max-width for hero moments
- Generous vertical spacing between sections (120px+ on desktop)

---

## Sanity Content Model

See `docs/SANITY_SCHEMA.md` for full schema definitions.

### Core Document Types

1. **project** — The main content type. Title, slug, client, year, category, tags, hero media, body (portable text with custom blocks), collaborators, technologies, featured flag, sort order.

2. **experiment** — Lab/side projects. Title, slug, description, tech stack, links (live, github), status (active/archived/concept), hero media.

3. **page** — Generic pages (About, Services, Contact). Title, slug, body (portable text).

4. **siteSettings** — Global config. Site title, description, social links, contact email, hero media for homepage, featured project refs.

5. **category** — Project categories (Commercial, Art, Experiment, Lighting, Software). Title, slug, description.

### Custom Portable Text Blocks

The body field in projects supports:
- Standard rich text (headings, paragraphs, links, lists)
- `imageBlock` — full-bleed or contained image with optional caption
- `imageGrid` — 2-4 images in a responsive grid
- `videoEmbed` — Vimeo/YouTube embed with aspect ratio
- `videoFile` — Self-hosted video (Sanity or external CDN)
- `pullQuote` — Styled quote block
- `codeBlock` — Syntax-highlighted code (for technical projects)
- `techStack` — Visual list of technologies used

---

## Content Strategy

### Project Data to Populate

From existing work and past conversations, these projects should be in the CMS at launch:

**Commercial / Client Work:**
- The Light Around Us (tvsdesign / Spacelab commission, data-driven LED sculpture)
- StoryBooth (Michigan Central Station interactive kiosk)
- Dolby Moment (Dolby HQ immersive experience)
- Cox Pillars (kiosk installation, pledge system)
- Cox Conserves (tree pledge interactive)
- Living Walls (Mercedes-Benz Stadium, TouchDesigner, projector control)
- Hope Hydration HydroStation (TIME Best Inventions 2025, Bould Design collab)
- Suffolk Building Lobby (LED installation, Chemistry Creative commission)

**Art / Personal:**
- Scatter and Rise (Goat Farm Arts Center commission, interactive LED)
- Orbitals (generative art installation)
- Sound Journeys (audio-visual experience)
- Snowblind (installation)
- Between The Two of These (installation)
- Gestures (interactive GIF installation, featured in VICE)

**Experiments / Tools:**
- Stage Controller (ENTTEC ELM lighting control app)
- Pour Perfect (guided pour-over timer concept)
- choosing.sucks (restaurant picker with Allister)
- Framer Border Tool (Electron/React/Sharp)
- 9to5.tv (festival, Atlanta)

### Voice and Copy Guidelines

- First person when writing as Pablo. Third person for formal/press contexts.
- Short sentences. No fluff. Every word earns its place.
- Technical when relevant — don't dumb down the stack or process.
- Colombian identity is present but not performative. It's woven in naturally.
- Project descriptions: what it is, who it's for, what Pablo's role was, what technology powered it. 2-3 sentences max for index cards. Full case studies can go deeper.

---

## Development Guidelines

### Code Style

- TypeScript strict mode
- Functional components only
- Named exports for components, default exports for pages
- CSS: Tailwind utility classes for layout and spacing, CSS modules or Tailwind for component-specific styles. No styled-components.
- File naming: `kebab-case` for files, `PascalCase` for components
- Colocate component files: `components/project-card/project-card.tsx` + `project-card.module.css` if needed

### Component Architecture

```
src/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout (Lenis, global styles, nav)
│   ├── page.tsx                  # Homepage
│   ├── work/
│   │   ├── page.tsx              # Project index
│   │   └── [slug]/page.tsx       # Project detail
│   ├── about/page.tsx
│   ├── services/page.tsx
│   ├── experiments/page.tsx
│   ├── contact/page.tsx
│   └── studio/[[...tool]]/page.tsx  # Sanity Studio
├── components/
│   ├── layout/                   # Nav, Footer, PageTransition
│   ├── ui/                       # Button, Tag, MediaBlock, etc.
│   ├── sections/                 # Homepage sections, reusable blocks
│   ├── project/                  # ProjectCard, ProjectGrid, ProjectHero
│   └── three/                    # R3F components (if used)
├── lib/
│   ├── sanity/                   # Client, queries, image helpers
│   └── utils/                    # General utilities
├── sanity/
│   ├── schemas/                  # All Sanity schema definitions
│   ├── sanity.config.ts
│   └── sanity.cli.ts
├── styles/
│   ├── globals.css               # Tailwind imports, CSS custom properties
│   └── fonts.css                 # Font-face declarations
└── public/
    └── fonts/                    # Self-hosted font files
```

### Performance Requirements

- Lighthouse score: 90+ on all metrics
- First Contentful Paint < 1.5s
- No layout shift on project images (use aspect-ratio or placeholder blur)
- Lazy load below-fold images and video
- Self-host fonts (no Google Fonts CDN flash)
- Code-split R3F components — never load Three.js on pages that don't use it
- Use Next.js Image component for all raster images
- Sanity CDN for media assets with responsive srcsets

### Scroll and Animation Implementation

- Initialize Lenis in root layout, pass instance via React context
- Use Framer Motion's `useScroll` + `useTransform` for scroll-linked animations
- Page transitions: exit animation completes before enter animation starts (AnimatePresence)
- Stagger reveals on scroll: use IntersectionObserver or Framer Motion's `whileInView`
- Keep animations subtle and purposeful — no gratuitous parallax or bouncing

### SEO

- Dynamic metadata per page via Next.js `generateMetadata`
- OpenGraph images generated or set per project in Sanity
- Structured data (JSON-LD) for Organization and CreativeWork schemas
- Sitemap generated at build time
- Canonical URLs on all pages

---

## Environment Variables

```env
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
SANITY_API_TOKEN=                    # Server-side only, for preview/mutations

# Site
NEXT_PUBLIC_SITE_URL=https://studiostudio.nyc

# Optional: Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=
```

---

## Reference Sites (Aesthetic Direction)

See `docs/REFERENCES.md` for detailed pattern analysis of each site.

**Primary references (Pablo's picks):**

- **iregular.io** — Video-first project cards, minimal metadata, full-bleed hero videos, stacked vertical project layout. The closest peer to Studio Studio in work type. Steal the video-first approach.
- **magicstreet.be** — Dark UI, vivid project imagery. The project detail page structure (hero → metadata grid → body → credits → next projects) is the template. Collaborator credits as first-class content.
- **madebyshore.com** — The index IS the site. Dense thumbnail grid, client-side filtering, query-param routing for inline project previews. The model for /work page density.
- **republik.ca** — Buttery smooth scroll (Lenis-like). Dual-image project cards (hover reveals second image). Client logo strip. Full-screen mobile nav overlay. The "polished agency" feel.
- **culdesac.work** — Single-scroll case study format. Organic mixed-media image stacks. Confident personal voice. Model for lightweight /experiments entries.

**Secondary references (for specific moments):**

- **lusion.co** — Dark, cinematic, R&D/Labs section as model for /experiments
- **gmunk.com** — The OG dark portfolio. Sparse navigation, visual work dominates.
- **aristidebenoist.com** — Personal + studio hybrid done elegantly

---

## Launch Checklist

- [ ] All priority projects populated in Sanity
- [ ] Homepage scroll experience polished (Lenis + Framer Motion)
- [ ] Page transitions smooth across all routes
- [ ] Mobile responsive (test on iPad — Pablo uses iPad for Stage Controller)
- [ ] Dark mode default, light mode toggle functional
- [ ] Contact form connected (Formspree, Resend, or similar)
- [ ] DNS pointed from studiostudio.nyc to Vercel
- [ ] Redirects from yopablo.com → studiostudio.nyc (or vice versa if desired)
- [ ] OpenGraph images set for all key pages
- [ ] Lighthouse audit passed (90+ all categories)
- [ ] Sanity Studio accessible at /studio with auth
- [ ] Analytics connected
