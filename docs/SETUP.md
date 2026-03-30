# SETUP.md — Getting Started

## Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Sanity account (sanity.io)
- Vercel account
- Git

---

## 1. Initialize Project

```bash
# Create Next.js app
pnpm create next-app@latest studiostudio-site --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

cd studiostudio-site
```

## 2. Install Dependencies

```bash
# Core
pnpm add sanity next-sanity @sanity/image-url @sanity/vision

# Animation & Scroll
pnpm add framer-motion lenis

# 3D (optional — install when needed)
pnpm add @react-three/fiber @react-three/drei three
pnpm add -D @types/three

# Dev
pnpm add -D @sanity/cli
```

## 3. Initialize Sanity

```bash
# From project root
pnpm sanity init --env

# Select:
# - Create new project: "Studio Studio"
# - Dataset: production
# - Project output path: ./sanity (or embed in src/)
```

## 4. Project Structure

```bash
# Create the directory structure
mkdir -p src/app/work/\[slug\]
mkdir -p src/app/about
mkdir -p src/app/services
mkdir -p src/app/experiments
mkdir -p src/app/contact
mkdir -p src/app/studio/\[\[...tool\]\]
mkdir -p src/components/{layout,ui,sections,project,three}
mkdir -p src/lib/{sanity,utils}
mkdir -p src/sanity/schemas
mkdir -p src/styles
mkdir -p public/fonts
mkdir -p docs
```

## 5. Copy Documentation

Place these files in the project:

```
/CLAUDE.md                    → Project root (for Claude Code context)
/docs/DESIGN_SYSTEM.md        → Design reference
/docs/SANITY_SCHEMA.md        → CMS schema reference
/docs/ARCHITECTURE.md         → Site architecture reference
```

## 6. Font Setup

Download and place font files in `public/fonts/`:

```
public/fonts/
├── NHGDisplay-Light.woff2
├── NHGDisplay-Regular.woff2
├── NHGDisplay-Medium.woff2
├── NHGDisplay-Bold.woff2
├── JetBrainsMono-Regular.woff2
└── JetBrainsMono-Medium.woff2
```

Create `src/styles/fonts.css` with `@font-face` declarations.

If licensing Neue Haas Grotesk isn't immediate, start with Geist (free, ships with Next.js) as a placeholder. The design system works with any clean grotesque.

## 7. Tailwind Config

Extend Tailwind with design system tokens. Tailwind v4 uses CSS-based config:

```css
/* src/styles/globals.css */
@import "tailwindcss";
@import "./fonts.css";

@theme {
  --color-bg-primary: #0A0A0A;
  --color-bg-surface: #141414;
  --color-text-primary: #E8E4DF;
  --color-text-secondary: #8A8580;
  --color-accent: #C4704B;
  --color-border: #222222;

  --font-display: 'Neue Haas Grotesk Display', 'Helvetica Neue', sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', monospace;
}
```

## 8. Key Files to Create First

In this order:

1. `src/styles/globals.css` — CSS custom properties + Tailwind
2. `src/app/layout.tsx` — Root layout with Lenis, fonts, nav
3. `src/components/layout/navigation.tsx` — Fixed nav
4. `src/components/layout/footer.tsx` — Minimal footer
5. `src/lib/sanity/client.ts` — Sanity client config
6. `src/lib/sanity/image.ts` — Image URL builder
7. `src/sanity/schemas/project.ts` — First schema
8. `src/app/page.tsx` — Homepage with hardcoded content initially

## 9. Development

```bash
# Run Next.js dev server
pnpm dev

# Run Sanity Studio (if separate)
pnpm sanity dev

# Or access embedded studio at localhost:3000/studio
```

## 10. Deploy

```bash
# Connect to Vercel
pnpm vercel

# Set environment variables in Vercel dashboard
# Push to main branch → auto-deploys
```

---

## Development Workflow

1. **Content-first:** Populate Sanity with 3-4 projects before polishing UI
2. **Mobile-first:** Build responsive from small screens up
3. **Animation-last:** Get layout and content right, then add Lenis + Framer Motion polish
4. **Performance-check:** Run Lighthouse after each major section is complete
