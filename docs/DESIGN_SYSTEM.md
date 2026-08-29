# DESIGN_SYSTEM.md — Studio Studio Visual Language

## Philosophy

Rams' functionalism meets gmunk's cinematic depth. Every pixel earns its place. The system is built for restraint — it should feel impossible to make something ugly with these tokens, but easy to make something striking.

This is not a component library. It's a set of constraints that make good design the path of least resistance.

---

## Color

### Dark Mode (Default)

```css
:root {
  /* Backgrounds */
  --color-bg-primary: #0A0A0A;          /* page background */
  --color-bg-surface: #141414;          /* cards, elevated panels */
  --color-bg-surface-hover: #1A1A1A;   /* card hover state */
  --color-bg-overlay: rgba(10, 10, 10, 0.85); /* modals, overlays */

  /* Text */
  --color-text-primary: #E8E4DF;       /* headings, body */
  --color-text-secondary: #8A8580;     /* metadata, captions, muted */
  --color-text-tertiary: #555250;      /* disabled, placeholder */

  /* Accent */
  --color-accent: #C4704B;             /* oxidized copper — links, active states */
  --color-accent-hover: #D4815C;       /* accent hover */
  --color-accent-muted: rgba(196, 112, 75, 0.15); /* accent backgrounds */

  /* Borders */
  --color-border: #222222;             /* subtle dividers */
  --color-border-hover: #333333;       /* interactive borders */

  /* System */
  --color-success: #4A9B6E;
  --color-error: #C45B4B;
}
```

### Light Mode

```css
[data-theme="light"] {
  --color-bg-primary: #F5F2EE;
  --color-bg-surface: #FFFFFF;
  --color-bg-surface-hover: #FAF8F5;
  --color-bg-overlay: rgba(245, 242, 238, 0.9);

  --color-text-primary: #1A1816;
  --color-text-secondary: #6B6560;
  --color-text-tertiary: #A39E98;

  --color-accent: #B5603A;
  --color-accent-hover: #9A5030;
  --color-accent-muted: rgba(181, 96, 58, 0.1);

  --color-border: #E0DCD6;
  --color-border-hover: #CCC7C0;
}
```

### Usage Rules

- Accent color is used ONLY for: interactive text links, active nav states, focus rings, and the occasional rule/line as a design element. Never for large background areas.
- Body text is always `--color-text-primary`. Never pure white (`#FFF`) or pure black (`#000`).
- Borders are barely visible — they organize, they don't decorate.
- Project media (images, video) provides all the color. The UI stays neutral.

---

## Typography

### Font Stack

```css
:root {
  /* Display — used for headings, hero text, nav */
  --font-display: 'Neue Haas Grotesk Display', 'Helvetica Neue', Helvetica, Arial, sans-serif;

  /* Mono — used for metadata, tags, dates, technical info, captions */
  --font-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', 'Consolas', monospace;
}
```

**Neue Haas Grotesk Display** is the primary recommendation. It's the original Helvetica redesigned with proper optical sizes — familiar enough to not distract, refined enough to feel intentional. Self-host from font files (OTF/WOFF2).

If licensing is an issue, alternatives in order of preference:
1. **Söhne** (Klim Type Foundry) — the spiritual successor to Helvetica, designed for screens
2. **Untitled Sans** (Klim) — more personality, slightly warmer
3. **GT America** (Grilli Type) — good weight range, modern grotesque
4. **Geist** (Vercel) — free, well-made, but increasingly common in dev portfolios

### Type Scale

Based on a 1.25 ratio (Major Third), with pixel values for reference:

```css
:root {
  --text-xs: 0.64rem;      /* 10px — legal, fine print */
  --text-sm: 0.8rem;       /* 13px — metadata, tags */
  --text-base: 1rem;       /* 16px — body text */
  --text-lg: 1.25rem;      /* 20px — intro paragraphs, large body */
  --text-xl: 1.563rem;     /* 25px — section subtitles */
  --text-2xl: 1.953rem;    /* 31px — section headings */
  --text-3xl: 2.441rem;    /* 39px — page titles */
  --text-4xl: 3.052rem;    /* 49px — hero subheads */
  --text-5xl: 3.815rem;    /* 61px — hero headlines */
  --text-6xl: 4.768rem;    /* 76px — display, statement text */

  /* Line heights */
  --leading-tight: 1.1;    /* display/hero text */
  --leading-snug: 1.25;    /* headings */
  --leading-normal: 1.5;   /* body text */
  --leading-relaxed: 1.7;  /* long-form reading */

  /* Letter spacing */
  --tracking-tight: -0.02em;   /* large display text */
  --tracking-normal: 0em;      /* body */
  --tracking-wide: 0.05em;     /* mono metadata, uppercase labels */
  --tracking-wider: 0.1em;     /* all-caps section labels */
}
```

### Type Styles (Semantic)

```
Hero Headline:      --text-6xl / --font-display / Light (300) / --leading-tight / --tracking-tight
Page Title:         --text-4xl / --font-display / Regular (400) / --leading-snug / --tracking-tight
Section Heading:    --text-2xl / --font-display / Medium (500) / --leading-snug / --tracking-normal
Project Title:      --text-xl / --font-display / Medium (500) / --leading-snug / --tracking-normal
Body:               --text-base / --font-display / Regular (400) / --leading-normal / --tracking-normal
Body Large:         --text-lg / --font-display / Regular (400) / --leading-normal / --tracking-normal
Caption:            --text-sm / --font-mono / Regular (400) / --leading-normal / --tracking-wide
Tag:                --text-xs / --font-mono / Medium (500) / --leading-normal / --tracking-wider / uppercase
Nav Link:           --text-sm / --font-mono / Regular (400) / --leading-normal / --tracking-wide
```

---

## Spacing

8px base unit. Use Tailwind's default scale but think in terms of these semantic values:

```css
:root {
  --space-xs: 0.25rem;     /* 4px */
  --space-sm: 0.5rem;      /* 8px */
  --space-md: 1rem;        /* 16px */
  --space-lg: 1.5rem;      /* 24px */
  --space-xl: 2rem;        /* 32px */
  --space-2xl: 3rem;       /* 48px */
  --space-3xl: 4rem;       /* 64px */
  --space-4xl: 6rem;       /* 96px */
  --space-5xl: 8rem;       /* 128px */
  --space-section: 10rem;  /* 160px — between major homepage sections */
}
```

### The Edge

One inset, every breakpoint, every page — set as `--edge` in `globals.css`.

```
--edge:    40px   distance from any viewport edge to anything pinned to it:
                  the STUDIO lockup, the nav dock, the statement at the fold,
                  the index toggle, the project sheet's frame
--gutter:  var(--edge)   content padding, so the grid starts on the same line
Max-width: 1440px (content), full-bleed available for hero sections
```

Gutters used to step 24 / 48 / 64 by breakpoint, which put the frame elements
and the content on different lines at every size. One number is the whole
system now: change `--edge` and the site's margin changes with it.

---

## Animation

### Easing Curves

```css
:root {
  /* Primary — smooth, confident deceleration. Used for most transitions. */
  --ease-smooth: cubic-bezier(0.22, 1, 0.36, 1);

  /* Enter — elements arriving on screen */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);

  /* Exit — elements leaving screen */
  --ease-in-expo: cubic-bezier(0.7, 0, 0.84, 0);

  /* Spring-like — for scale/rotation micro-interactions */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### Duration Tokens

```css
:root {
  --duration-instant: 100ms;    /* opacity toggles, color changes */
  --duration-fast: 200ms;       /* hover states, micro-interactions */
  --duration-normal: 400ms;     /* standard transitions */
  --duration-slow: 600ms;       /* page section reveals */
  --duration-hero: 800ms;       /* hero animations, page transitions */
  --duration-scroll: 1200ms;    /* scroll-linked parallax */
}
```

### Animation Patterns

**Page Enter:**
```
opacity: 0 → 1 (--duration-hero, --ease-out-expo)
y: 20px → 0 (--duration-hero, --ease-out-expo)
```

**Scroll Reveal (staggered):**
```
Each element: opacity 0 → 1, y: 30px → 0
Stagger: 80ms between elements
Easing: --ease-out-expo
Duration: --duration-slow
Trigger: when element enters viewport (threshold: 0.2)
```

**Hover — Project Card:**
```
Image: scale 1 → 1.03 (--duration-normal, --ease-smooth)
Overlay: opacity 0 → 1 (--duration-fast, --ease-smooth)
```

**Page Transition:**
```
Exit: opacity 1 → 0, y: 0 → -10px (--duration-normal, --ease-in-expo)
Enter: opacity 0 → 1, y: 10px → 0 (--duration-hero, --ease-out-expo)
```

**Nav Link Hover:**
```
Underline width: 0% → 100% (--duration-fast, --ease-smooth)
Color: secondary → accent (--duration-instant)
```

### Lenis Configuration

```typescript
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
  orientation: 'vertical',
  smoothWheel: true,
  touchMultiplier: 2,
})
```

### Rules

1. Never animate layout properties (width, height, top, left). Use `transform` and `opacity` only.
2. Every animation must have a clear trigger and purpose. No ambient floating or pulsing.
3. Stagger delays should feel musical — consistent intervals, not random.
4. Scroll-linked animations should be tied to Lenis progress, not vanilla scroll events.
5. Disable animations for users who prefer reduced motion (`prefers-reduced-motion: reduce`).
6. Video/media should autoplay muted on hover or on scroll-into-view, never on page load.

---

## Components

### Navigation

- **Position:** Fixed top, transparent on hero, solid bg on scroll (with backdrop-blur)
- **Left:** "Studio Studio" wordmark (text, not logo image)
- **Right:** Work · About · Services · Experiments · Contact
- **Style:** `--font-mono`, `--text-sm`, `--tracking-wide`
- **Mobile:** Hamburger → full-screen overlay menu with large type
- **Active state:** accent-colored underline or dot

### Project Card — Featured (Homepage)

Inspired by Iregular + Republik. Full-bleed stacked sections on homepage.

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│     [autoplay video loop / image]                   │  ← fills ~60-70vh
│     video plays when section enters viewport        │
│     on hover: subtle zoom (scale 1 → 1.02)          │
│                                                     │
│  Project Title                              2024    │  ← overlaid at bottom-left
│  Client · Category                                  │  ← --font-mono, muted
│                                                     │
└─────────────────────────────────────────────────────┘
```

Click anywhere → navigate to /work/[slug]. Entire section is the link.

### Project Card — Index Grid (/work)

Inspired by Shore. Dense, efficient, thumbnail-driven.

```
┌─────────────────────────────┐
│                             │
│  [thumbnail image/video]    │  ← 4:3 aspect ratio, consistent
│  hover: video plays OR      │    across grid
│  second image crossfades    │
│  (à la Republik dual-image) │
│                             │
├─────────────────────────────┤
│ Project Title          2024 │  ← --font-display, --text-base
│ Client · Category           │  ← --font-mono, --text-sm, muted
└─────────────────────────────┘
```

### Project Card — Index Teaser (Homepage)

Small, dense, Shore-like. Minimal info.

```
┌───────────────┐
│               │
│  [thumbnail]  │  ← small, ~250-300px wide
│               │  ← hover: title + year overlay
│               │
└───────────────┘
```

### Project Hero (Detail Page)

```
┌─────────────────────────────────────────────────┐
│                                                 │
│              [full-bleed hero media]             │  ← video or image
│                                                 │
│                                                 │
└─────────────────────────────────────────────────┘

  Project Title                                      ← --text-4xl
  One-line description of the project                ← --text-lg, muted

  ┌──────────┬──────────┬──────────┬──────────┐
  │ Client   │ Role     │ Year     │ Tech     │     ← metadata grid
  │ HBO      │ Director │ 2023     │ TD, LED  │     ← --font-mono
  └──────────┴──────────┴──────────┴──────────┘
```

### Services Strip (Homepage)

Horizontal single line on desktop, stacked on mobile:

```
Experiential Direction · Lighting Design · Custom Software · Creative Technology · Motion · Consulting · Mentoring
```

`--font-display`, `--text-xl`, `--tracking-tight`. Separator is a centered dot or thin vertical bar. The whole line can have a subtle scroll animation or be static — depends on content length.

### Footer

Minimal. Two columns max:

```
Left:  © 2026 Studio Studio · Brooklyn, NY
Right: Instagram · Vimeo · GitHub · LinkedIn
```

`--font-mono`, `--text-sm`, `--color-text-secondary`

### Client Logo Strip (Homepage)

Inspired by Republik. Horizontal infinite-scroll row.

```
──── [HBO] [Google] [Intel] [Sony] [Dolby] [Michigan Central] [Cox] [Mercedes-Benz] [Chemistry] ────
     ← infinite scroll, pauses on hover →
```

- Logos rendered in monochrome/white (CSS `filter: grayscale(1) brightness(2)` or white SVGs)
- Horizontal overflow with CSS animation (`translateX` loop)
- Pause animation on hover
- `--font-mono` label above: "Selected Clients" or just unlabeled
- Height: ~80px strip, logos ~40px tall
- Subtle top/bottom border lines

### Full-Screen Nav Overlay (Mobile + Optional Desktop)

Inspired by Republik. Replaces hamburger dropdown.

```
┌─────────────────────────────────────────────────────┐
│                                           [CLOSE ×] │
│                                                     │
│                                                     │
│              WORK                                   │  ← --text-4xl, --font-display
│              ABOUT                                  │
│              SERVICES                               │
│              EXPERIMENTS                            │
│              CONTACT                                │
│                                                     │
│                                                     │
│  IG · Vimeo · GitHub · LinkedIn                     │  ← bottom, --font-mono
│  hello@studiostudio.nyc                             │
└─────────────────────────────────────────────────────┘
```

- Background: `--color-bg-primary` at full opacity
- Links stagger in with 80ms delay each (Framer Motion)
- Click outside or close button → fade out
- Covers full viewport, no scroll

---

## Media Guidelines

### Image Specs

- Hero images: 2400px wide minimum, 16:9 or 4:3 crop
- Thumbnails: 1200px wide, consistent aspect ratio within the grid
- Format: WebP with JPEG fallback (Sanity handles this automatically via CDN transforms)
- Always include `alt` text — sourced from Sanity field
- Use Next.js `Image` component with `placeholder="blur"` and Sanity's LQIP

### Video

- Project hero videos: MP4 (H.264), max 1080p, autoplay muted on scroll-into-view
- Embedded reels: Vimeo preferred (cleaner embeds than YouTube)
- Never autoplay with sound
- Show poster frame / first frame before video loads

---

## Responsive Breakpoints

```css
/* Tailwind defaults, customized */
sm: 640px    /* large phones, landscape */
md: 768px    /* tablets */
lg: 1024px   /* small desktops, landscape tablets */
xl: 1280px   /* standard desktops */
2xl: 1536px  /* large desktops */
```

### Grid Behavior

```
Mobile:   1 column, full width cards
Tablet:   2 columns
Desktop:  3 columns (index grid), 2 columns (featured heroes)
Large:    4 columns (dense index grid)
```

---

## Accessibility

- Focus rings: 2px `--color-accent` outline with 2px offset
- All interactive elements must be keyboard-navigable
- ARIA labels on icon-only buttons
- Video controls accessible via keyboard
- Color contrast: minimum 4.5:1 for body text, 3:1 for large text
- `prefers-reduced-motion` respected — disable scroll animations, page transitions
- Skip-to-content link hidden until focused
