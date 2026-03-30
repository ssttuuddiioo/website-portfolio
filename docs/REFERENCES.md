# REFERENCES.md — Design References & Patterns to Steal

## Overview

These five sites collectively define the Studio Studio aesthetic direction. Each contributes different qualities. The goal is not to copy any one of them — it's to synthesize the best of each into something that's unmistakably Pablo's practice.

---

## 1. Iregular (iregular.io) — "The Peer"

**What it is:** Montreal-based digital art studio. Public art, immersive spaces, scenographies, museums. The closest analog to Studio Studio in terms of work type.

**What to steal:**

- **Video-first project cards.** Each project on the homepage has an autoplay video loop behind the thumbnail. On hover/scroll, the video comes alive. This is critical for experiential work — still images don't communicate installations well. Studio Studio should adopt this: every project card should support a short video loop as the primary thumbnail.

- **Minimal metadata per card.** Iregular shows only: project title, year, and one category tag. No descriptions on the index. Let the visual do the talking. Copy this restraint.

- **Full-bleed hero video per project.** Each project page opens with a full-viewport video. No title overlay competing with the media. The title and metadata appear below after the hero. This "media first, text second" hierarchy is exactly right for Studio Studio.

- **Flat, clean project list structure.** No masonry, no fancy grid. Just a clean vertical stack of large cards. Each card is generous — roughly 60-70% viewport height. This gives the work room to breathe.

- **Single page descriptor.** "Digital Art Studio" — three words at the top. Studio Studio needs a similar anchor: "Creative Technology Studio" or "Experiential Direction & Creative Technology."

**What to leave behind:**
- The site is a little flat in terms of scroll animation. No smooth scroll library visible. Studio Studio should add the Lenis smoothness layer.
- Navigation is basic. Studio Studio can do more with nav interaction.

---

## 2. Cul de Sac (culdesac.work) — "The Single-Scroll Case Study"

**What it is:** Solo graphic design studio (Colin Smight). Apparel, branding, identity work. Built on Cargo.

**What to steal:**

- **Single-scroll project presentation.** Each project is a self-contained section on one long page separated by horizontal rules. Title, brief description, project type, then a stack of images. No clicking through to separate pages for small projects. This is worth considering for the experiments section — lightweight projects that don't warrant their own URL could live as expandable sections on /experiments.

- **Confident copy tone.** "Open for business, from the desk of Colin Smight." Direct, personal, no corporate speak. Studio Studio should match this energy: "Built by Pablo Gnecco in Brooklyn."

- **Mixed media stacks.** Images of different aspect ratios stacked vertically within a project section — some full-width, some paired side by side. No rigid grid. This organic image flow feels more editorial and less template-y.

- **Minimal navigation.** Almost none — just scroll. For a site that's primarily a portfolio showcase, reducing nav friction to zero is powerful. Studio Studio's homepage should have this quality even if sub-pages have traditional nav.

**What to leave behind:**
- The Cargo platform constraints (limited interactivity, basic responsiveness).
- The lack of video — inappropriate for experiential/installation work.

---

## 3. Magicstreet (magicstreet.be) — "The Light Art Sibling"

**What it is:** Belgian new media & light art studio. Interactive scenography, architecture, installations. Very close to Studio Studio's world.

**What to steal:**

- **Project detail page structure.** The Enlightenment 250 page is a masterclass:
  1. Full-bleed hero video
  2. Project title (large, clean)
  3. Metadata in a consistent format: "Created for / Presented at / Created in" — a simple three-column layout
  4. Description text (2-3 paragraphs, no fluff)
  5. Image gallery (large, stacked)
  6. Credits section (collaborators with links)
  7. "Next projects" section at the bottom with 3 thumbnail cards
  
  This exact structure should be the template for Studio Studio's `/work/[slug]` pages.

- **Services as prose, not icons.** Magicstreet describes three sectors (Art & Culture, Public Space, Private & Corporate) with a short paragraph each. No bullet points, no icon grids. Studio Studio should do the same on /services — short prose paragraphs, not a feature matrix.

- **Credits/collaborators as first-class content.** Every project page shows who made it and links to their sites. This is generous and professional. Studio Studio should include a collaborators section in every project, especially for the commercial work where Pablo directed but didn't fabricate alone.

- **Dark background, light text, vivid project imagery.** The dark UI makes the installation photography pop. The images ARE the color palette. Studio Studio should follow this — the UI is achromatic, the work provides the color.

- **"See more projects" as a horizontal card row.** At the bottom of each project detail, 3 related/next project cards sit in a horizontal row. Not intrusive, but always there. Keeps people browsing.

**What to leave behind:**
- Font choice (Pangram Pangram fonts are overused in this space).
- The homepage hero carousel — Studio Studio's hero should be more intentional (single video or generative visual, not a slideshow).

---

## 4. Shore (madebyshore.com) — "The Gallery Index"

**What it is:** Seattle branding and design studio. The site is a single-page app where the homepage IS the portfolio grid, and clicking a project opens it inline (URL updates via query param `?project=slug`).

**What to steal:**

- **The index IS the site.** Shore's homepage is just a grid of project thumbnails. No hero section, no about teaser, no services strip. Just the work. Click a project → it expands inline or takes over the viewport. This is the model for Studio Studio's `/work` page specifically — the full index should feel this direct and dense.

- **Query-param routing for project detail.** `?project=hoedemaker-pfeiffer` means you can share a direct link to a project but the page doesn't fully navigate away from the grid. The project opens as an overlay or expanded view. This creates a feeling of speed — you're never waiting for a page load. Consider this for the `/work` page: filter and project preview happen client-side with URL params, while deep project pages (`/work/[slug]`) are full routes for SEO and sharing.

- **Thumbnail density.** Small, tightly packed thumbnails that reveal on hover. This communicates volume and range. Studio Studio's index teaser on the homepage should feel like this — many small thumbnails saying "there's a lot more."

- **Minimal chrome.** Almost no visible UI. No nav bar. Just the grid and the work. The studio name is minimal. This extreme restraint is a good calibration point even if Studio Studio's homepage needs more structure.

**What to leave behind:**
- The extreme minimalism of having zero information architecture — Studio Studio needs /about, /services, /experiments as distinct pages for SEO and the three different audiences.

---

## 5. Republik (republik.ca) — "The Polished Agency"

**What it is:** Montreal creative agency (sustainability/social capital focus). Full-service: branding, digital, content, strategy.

**What to steal:**

- **Smooth scroll + section transitions.** Built by MILL3 studio, this site has that buttery smooth scroll feel Studio Studio wants. Sections reveal with parallax and staggered entrance animations. The scroll experience is the differentiator — it makes a WordPress site feel custom-built.

- **Project card layout.** Each card has TWO images — a primary and a secondary that's slightly offset or revealed on hover. This double-image approach gives more visual information without clicking through. Studio Studio could use this: primary thumbnail + a secondary detail shot visible on hover.

- **Client logo strip.** A horizontal scrolling row of client logos. Simple, effective, communicates credibility without taking up space. Studio Studio should include this — HBO, Google, Intel, Sony, Dolby, Michigan Central Station, Cox, etc. Just logos, no text.

- **Newsletter/CTA integration.** Republik has a newsletter signup woven into the page naturally. Studio Studio could have a "Studio dispatch" or similar — updates on new work, experiments, thinking.

- **Bilingual toggle.** `fr/en` in the nav. Studio Studio could consider `en/es` given Pablo's Colombian identity and the Origen/Coffee Five Latin American connections. Not required for launch but the architecture should support it.

- **Full-screen menu overlay.** On mobile and as an option on desktop, the nav opens as a full-viewport overlay with large type. Clean, cinematic, gives room for sub-navigation. Studio Studio should implement this for mobile nav.

**What to leave behind:**
- The agency-speak ("creating social capital"). Studio Studio's copy should be direct and personal.
- The WordPress/PHP foundation — Studio Studio's Next.js stack is the right call.
- Blog/insights section — not needed at launch. If Pablo wants to write, it can be added later.

---

## Synthesis: The Studio Studio Formula

Taking the best of each:

| Element | Source | Implementation |
|---------|--------|----------------|
| Video-first project cards | Iregular | Autoplay video loops on hover/scroll for index cards |
| Minimal card metadata | Iregular | Title + year + category only on grid |
| Media-first project pages | Iregular + Magicstreet | Full-bleed hero video/image, metadata below |
| Project page structure | Magicstreet | Hero → title → metadata grid → body → credits → next projects |
| Dense thumbnail index | Shore | Tight grid on /work, client-side filtering |
| Query-param previews | Shore | URL param filtering, maybe inline preview on /work |
| Smooth scroll + reveals | Republik | Lenis + Framer Motion staggered entrances |
| Dual-image project cards | Republik | Primary + secondary image on hover for featured cards |
| Client logo strip | Republik | Horizontal scroll of client logos on homepage |
| Single-scroll sections | Cul de Sac | Experiments page as expandable sections |
| Organic image stacks | Cul de Sac | Variable aspect ratios in project body content |
| Confident personal voice | Cul de Sac | "Built by Pablo Gnecco in Brooklyn" energy |
| Dark UI, vivid work | Magicstreet | Achromatic interface, project media provides color |
| Collaborator credits | Magicstreet | Every project credits the full team with links |
| Full-screen mobile nav | Republik | Overlay nav with large type and sub-navigation |

### Homepage Scroll Sequence (Revised)

Based on these references, the homepage should flow like this:

```
1. HERO
   Full-viewport. Looping video reel OR generative visual.
   "Studio Studio" centered, large.
   One-line descriptor below: "Creative Technology · Experiential Direction · Brooklyn"
   ↓ scroll indicator

2. FEATURED PROJECTS (3-5)
   Stacked full-bleed sections à la Iregular.
   Each: large video/image fills most of viewport.
   Title + client + year overlaid or adjacent (minimal).
   Scroll-triggered reveal (Framer Motion).

3. CLIENT LOGOS
   Horizontal scrolling strip à la Republik.
   HBO · Google · Intel · Sony · Dolby · Michigan Central · Cox · Mercedes-Benz
   Logos in monochrome/white. Subtle infinite scroll animation.

4. SERVICES STRIP
   Single line of capabilities, clean typography.
   "Experiential Direction · Lighting Design · Custom Software · Creative Technology · Motion · Consulting"

5. INDEX TEASER
   Dense grid of thumbnails à la Shore.
   4x3 or 4x4, small, showing breadth.
   "View all work →"

6. ABOUT TEASER
   Split layout. Photo + 3 sentences.
   "More about Pablo →"

7. FOOTER / CONTACT
   Email prominent. Social links. © 2026.
```

### Key Animation Moments

1. **Hero → Featured transition:** Hero content fades up and slightly scales as first project section scrolls into view. Cinematic overlap.

2. **Featured project reveals:** Each project section fades in with a subtle y-translate (30px → 0). Video begins playing when section hits ~40% viewport.

3. **Client logo strip:** Infinite horizontal scroll, pauses on hover. Logos fade from muted to full opacity as they enter center of viewport.

4. **Index grid stagger:** Thumbnails reveal in a wave pattern (top-left to bottom-right) as the section scrolls into view. 60ms stagger between cards.

5. **Page transitions:** Current page slides up and fades (200ms), new page slides in from below and fades in (400ms). AnimatePresence wrapper.

---

## Font Reconsideration

After reviewing these references:

- Magicstreet uses **Pangram Pangram** fonts (Editorial New, Neue Montreal) — overused in this space, avoid.
- Republik uses a clean grotesque (appears to be custom or licensed).
- Iregular uses a geometric sans with good weight contrast.
- Cul de Sac uses system/default Cargo fonts.

**Updated recommendation for Studio Studio:**

Primary display: **Söhne** (Klim Type Foundry) — it's the refined, screen-native Helvetica successor. Clean, professional, not yet overused in the creative tech space. Good weight range from Leicht to Dreiviertelfett.

If licensing cost is a concern: **Geist** (Vercel, free) or **Satoshi** (Fontshare, free) as starting points, with a plan to upgrade.

Mono stays: **JetBrains Mono** (free, excellent, matches the "technologist" identity).
