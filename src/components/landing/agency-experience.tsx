'use client'

import { useRef, useState, useEffect, useLayoutEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'

const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect
import { LandingSidebar } from './landing-sidebar'
import { SiteFooter } from './site-footer'
import { AgencyAbout } from './agency-about'
import { AgencyFeaturedGrid } from './agency-featured-grid'
import { AgencyFeaturedProjects } from './agency-featured-projects'
import { ContactForm } from './contact-form'
import { SubscribeStrip } from './subscribe-form'
import { ServicesAccordion } from './services-accordion'
// import { IdeasSection } from './ideas-section' // notes section hidden for now
import { wordStyle, INK, BG, BLUE } from './landing-theme'
import {
  HeroImageTrail,
  type TrailItem,
} from '@/components/project/hero-image-trail'
import { LANDING_PROJECTS } from '@/lib/landing-projects'
import { useLenis } from '@/lib/lenis-provider'
import { centerOffset } from './use-scroll-to-section'

// The hero trail flips through the same work the page lists below, naming the
// frame that comes to rest and inviting a click through to it. Three
// destinations, so three prompts: a case study on this site, the project's own
// site, or nothing linked yet, which drops you at its entry in the work list.
// Module-level so the array identity is stable across renders (the trail
// preloads on it).
/* Gap between the header lockup and the statement. The about block
   subtracts this to bottom-align itself against the fold. */
const HERO_SPACER = 'clamp(3rem, 9vh, 7rem)'

const HERO_TRAIL = LANDING_PROJECTS.map((p) => ({
  src: p.image,
  title: p.title,
  meta: p.category,
  cta: p.slug
    ? 'Click to view'
    : p.website
      ? 'Click to go'
      : 'Click to learn more',
}))

const SPY_IDS = ['home', 'work', 'services', 'contact']

// The second (mirrored) wordmark swaps to the active section's name (staying
// rotated 180°); home/about fall back to STUDIO.
const SECTION_WORDS: Record<string, string> = {
  work: 'WORK',
  services: 'SERVICES',
  contact: 'CONTACT',
}

// Size the wordmark settles at once posted to the header — 20% larger on mobile.
const WORD_SCALE_DESKTOP = 0.2125
const WORD_SCALE_MOBILE = 0.255
// Clearance from the page edges (px) for the stacked mark, plus the air left
// under it before the header band hands off to the hero.
const MARGIN_X = 40
const MARGIN_TOP_DESKTOP = 20
const MARGIN_TOP_MOBILE = 28
const HEADER_PAD_BOT_DESKTOP = 28
const HEADER_PAD_BOT_MOBILE = 20
// Both marks ride together in the top-left corner: the second word sits
// directly under the first (still mirrored, so it reads as a reflection) with
// this much air between them.
const STACK_GAP = 6
// Smooth ease-in-out (gentle acceleration + deceleration).
const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const

/**
 * Thin hairline section divider — constrained to the content width and inset by
 * the page gutter so it never reaches the viewport edges. Quiet + low-contrast;
 * the surrounding section padding supplies the breathing room above/below it.
 */
function SectionDivider() {
  return (
    <div
      aria-hidden
      style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '0 var(--gutter, 1.5rem)',
      }}
    >
      <div style={{ height: 1, background: 'rgba(232, 228, 223, 0.14)' }} />
    </div>
  )
}

/**
 * Agency variant of the landing experience. The page opens on a header band —
 * a strip of page background that the stacked STUDIO lockup sits in. The reveal
 * plays on load (no scroll-jacking): both marks start off-canvas at final size
 * past the left edge and glide in horizontally, fading up as they land stacked
 * in the top-left corner. They stay fixed there as a persistent signature; the rest of
 * the page (work, services, ideas, contact) scrolls normally beneath them.
 */
export function AgencyExperience() {
  const reduce = useReducedMotion()
  const router = useRouter()
  const topWordRef = useRef<HTMLHeadingElement>(null)

  // Mobile gets a 20%-larger wordmark with a roomier top margin; desktop keeps
  // the tighter tuck. Drives both the corner geometry (below) and the animation
  // targets.
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const sync = () => setIsMobile(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  const WORD_SCALE = isMobile ? WORD_SCALE_MOBILE : WORD_SCALE_DESKTOP
  const MARGIN_TOP = isMobile ? MARGIN_TOP_MOBILE : MARGIN_TOP_DESKTOP
  const HEADER_PAD_BOT = isMobile
    ? HEADER_PAD_BOT_MOBILE
    : HEADER_PAD_BOT_DESKTOP

  // Measured pixel offsets from each word's resting (centered) position to its
  // slot in the top-left stack, the off-canvas start both words glide in from
  // (the left edge), and the header band height the stack implies. Recomputed
  // on resize / font load so the corner always lands right.
  const [geo, setGeo] = useState({
    topX: 0,
    topY: 0,
    botX: 0,
    botY: 0,
    topXOff: 0,
    botXOff: 0,
    headerH: 0,
    measured: false,
  })
  useIsoLayoutEffect(() => {
    function measure() {
      const el = topWordRef.current
      if (!el) return
      const W = window.innerWidth
      const H = window.innerHeight
      const wW = el.offsetWidth // layout size — unaffected by transforms
      const wH = el.offsetHeight
      if (!wW || !wH) return
      const gap = Math.min(0.013 * W, 16.8) // flex-col gap: min(1.3vw, 1.05rem)
      const wordH = wH * WORD_SCALE
      // wordStyle sets line-height below 1em, so the glyphs spill past the
      // layout box by half the difference. Unnoticeable on the top word, but it
      // pushes the mirrored word's caps out the bottom of the header band — so
      // the band has to cover it.
      const cs = window.getComputedStyle(el)
      const fontSize = parseFloat(cs.fontSize) || 0
      const lineHeight = parseFloat(cs.lineHeight) || fontSize
      const overshoot = (Math.max(0, fontSize - lineHeight) / 2) * WORD_SCALE
      const halfW = (wW * WORD_SCALE) / 2
      const halfH = wordH / 2
      const topCx = W / 2
      const topCy = H / 2 - (wH + gap) / 2
      const botCx = W / 2
      const botCy = H / 2 + (wH + gap) / 2
      // Fully clear of the viewport edge, plus a little slack, so nothing
      // peeks in before the glide starts.
      const OFF_PAD = 24
      // Both words stack in the top-left: same left edge, the second directly
      // under the first. The bottom word's own box is whatever its text
      // measures, but its inner span is scaled to the top word's width (see
      // botFit), so it shares the top word's halfW.
      setGeo({
        topX: MARGIN_X + halfW - topCx,
        topY: MARGIN_TOP + halfH - topCy,
        botX: MARGIN_X + halfW - botCx,
        botY: MARGIN_TOP + wordH + STACK_GAP + halfH - botCy,
        topXOff: -halfW - OFF_PAD - topCx,
        botXOff: -halfW - OFF_PAD - botCx,
        headerH:
          MARGIN_TOP + wordH * 2 + STACK_GAP + overshoot + HEADER_PAD_BOT,
        measured: true,
      })
    }
    measure()
    window.addEventListener('resize', measure)
    const t = window.setTimeout(measure, 250)
    if (document.fonts) document.fonts.ready.then(measure)
    return () => {
      window.removeEventListener('resize', measure)
      window.clearTimeout(t)
    }
  }, [isMobile, WORD_SCALE, MARGIN_TOP, HEADER_PAD_BOT])

  // Once the corners are measured, hold a beat off-canvas, then glide in.
  const [revealed, setRevealed] = useState(false)
  useEffect(() => {
    if (revealed) return
    if (!geo.measured) return
    const t = window.setTimeout(() => setRevealed(true), reduce ? 0 : 300)
    return () => window.clearTimeout(t)
  }, [geo, revealed, reduce])

  const [active, setActive] = useState('home')
  const lenis = useLenis()
  // While a nav-click scroll is in flight we lock the spy and drive the
  // highlight optimistically, so the pill snaps to the clicked section instead
  // of flickering through the short sections (about / about-to) flying past.
  const suppressSpy = useRef(false)

  // Nav click: highlight the target immediately and lock the spy, then
  // smooth-scroll to it. The lock holds until the user's NEXT real scroll
  // gesture (see effect below) — not until the scroll finishes — so a trailing
  // settle can't re-read the pill back onto the section being passed through.
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    setActive(id)
    suppressSpy.current = true
    // Home means the very top of the page — the header band above the hero,
    // not the hero centered in the viewport.
    if (id === 'home') {
      if (lenis) lenis.scrollTo(0, { force: true })
      else window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const offset = centerOffset(el)
    if (lenis) lenis.scrollTo(el, { offset, force: true })
    else el.scrollIntoView({ behavior: 'smooth', block: offset < 0 ? 'center' : 'start' })
  }

  // Clicking the hero field opens whichever frame is resting on it. Where it
  // goes matches the prompt the trail is showing: a case study here, the
  // project's own site in a new tab, or the work list for entries that have
  // neither yet.
  const openTrailProject = (_item: TrailItem, index: number) => {
    const project = LANDING_PROJECTS[index]
    if (!project) return
    if (project.slug) {
      router.push(`/work/${project.slug}`)
      return
    }
    if (project.website) {
      window.open(project.website, '_blank', 'noopener,noreferrer')
      return
    }
    scrollToSection('work')
  }

  // Release the spy lock on a genuine user scroll gesture. Lenis intercepts the
  // wheel for smooth scrolling, but the native wheel/touch events still reach
  // window listeners — so this fires on user intent, never during the
  // programmatic Lenis scroll a click kicks off.
  useEffect(() => {
    const release = () => {
      suppressSpy.current = false
    }
    window.addEventListener('wheel', release, { passive: true })
    window.addEventListener('touchstart', release, { passive: true })
    window.addEventListener('keydown', release)
    return () => {
      window.removeEventListener('wheel', release)
      window.removeEventListener('touchstart', release)
      window.removeEventListener('keydown', release)
    }
  }, [])

  // Scroll-spy with a direction-aware lead (drives the sidebar's active dot).
  useEffect(() => {
    let lastY = window.scrollY
    let dir = 1
    let ticking = false

    const update = () => {
      ticking = false
      if (suppressSpy.current) return
      const y = window.scrollY
      if (y > lastY) dir = 1
      else if (y < lastY) dir = -1
      lastY = y

      // Lead is a FRACTION of the viewport, not a fixed pixel count: a fixed
      // ~500px lead overshot the short about / about-to sections into "work".
      const lead = window.innerHeight * 0.18
      const probe = y + window.innerHeight / 2 + dir * lead

      let current = SPY_IDS[0]
      for (const id of SPY_IDS) {
        const el = document.getElementById(id)
        if (!el) continue
        const top = el.getBoundingClientRect().top + y
        if (top <= probe) current = id
      }
      setActive(current)
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  // Second (mirrored) word of the lockup: STUDIO until a section scrolls into
  // view, then the section name — uniform-scaled so every word spans the same
  // width as the top STUDIO mark (so WORK / SERVICES / CONTACT all line up
  // edge-to-edge under it).
  const sectionWord = SECTION_WORDS[active] ?? null
  const bottomText = sectionWord ?? 'STUDIO'
  const botSpanRef = useRef<HTMLSpanElement>(null)
  const [botFit, setBotFit] = useState(1)
  useIsoLayoutEffect(() => {
    function measure() {
      const top = topWordRef.current
      const span = botSpanRef.current
      if (!top || !span) return
      const topW = top.offsetWidth // layout width — ignores the scale transform
      const spanW = span.offsetWidth
      if (topW > 0 && spanW > 0) setBotFit(topW / spanW)
    }
    measure()
    window.addEventListener('resize', measure)
    const id = window.setTimeout(measure, 220)
    if (document.fonts) document.fonts.ready.then(measure)
    return () => {
      window.removeEventListener('resize', measure)
      window.clearTimeout(id)
    }
  }, [bottomText])

  // Pre-reveal the words are parked off-canvas at their final size and corner
  // height, fully transparent — snapped there (duration 0) so measurement never
  // reads as motion. The reveal is then a horizontal glide in from the left
  // edge, fading up as it travels.
  const wordTransition =
    reduce || !revealed
      ? { duration: 0 }
      : { duration: 1.3, ease: EASE_IN_OUT }
  const wordOpacity = geo.measured && revealed ? 1 : 0
  const topTarget = {
    x: revealed ? geo.topX : geo.topXOff,
    y: geo.topY,
    scale: WORD_SCALE,
    opacity: wordOpacity,
  }
  const botTarget = {
    x: revealed ? geo.botX : geo.botXOff,
    y: geo.botY,
    scale: WORD_SCALE,
    rotate: 180,
    opacity: wordOpacity,
  }

  return (
    <>
      <LandingSidebar active={active} inPage onNavigate={scrollToSection} />

      {/* Page content. */}
      <div style={{ position: 'relative', zIndex: 3 }}>
        {/* Image trail — the whole first screen is a field: moving the pointer
            across it flips through the work listed further down, one frame
            every 35px of travel. Stop moving and the last frame stays, named
            large in the top-right under the nav dock with a prompt to click
            through.
            z-index -1 keeps it behind the header lockup and the studio
            statement (the page background lives on an ancestor, so it still
            shows through), and overflow:hidden stops frames spilling into the
            work list below the fold. Silent on touch + reduced motion, and
            aria-hidden throughout: it is a pointer-only shortcut to work the
            list below already links properly. */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100svh',
            overflow: 'hidden',
            zIndex: -1,
          }}
        >
          <HeroImageTrail
            images={HERO_TRAIL}
            grid={false}
            onSelect={openTrailProject}
          />
        </div>

        {/* Header band — a strip the page opens on, sized to the stacked STUDIO
            lockup that sits fixed in its top-left corner, so the marks own a
            header instead of crowding the statement below. Purely spatial and
            transparent: the type itself lives in the pinned blend layer near
            the bottom of this file (it inverts over any trail frame that lands
            under it), and the page's real <h1> is in the hero. */}
        <header
          aria-hidden
          style={{
            height: geo.measured ? geo.headerH : 'clamp(7rem, 16vw, 10.5rem)',
          }}
        />

        {/* Hero — the open field the image trail plays across. Holds no copy
            of its own; the statement below is bottom-aligned into the rest of
            the first screen, so it sits right at the fold. */}
        <section
          id="home"
          style={{
            position: 'relative',
            minHeight: HERO_SPACER,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            padding: '0 var(--gutter, 1.5rem)',
          }}
        >
          {/* The page's <h1>. The hero carries no body copy, so the heading
              is visually hidden — it exists for screen readers and for anything
              parsing the page (search, LLM crawlers), which otherwise find no
              statement of what this site is outside the <title> tag. */}
          <h1 className="sr-only">
            Studio Studio — experiential design and creative technology in
            Brooklyn, New York
          </h1>
        </section>

        {/* About — the studio statement, bottom-aligned into whatever is left
            of the first screen so it lands on the fold rather than below it.
            The block owns its own max-width + gutter so it sits on the same
            grid as the selected-work rows below. */}
        <section
          id="about"
          style={{
            minHeight: geo.measured
              ? `calc(100svh - ${geo.headerH}px - ${HERO_SPACER})`
              : '62svh',
            display: 'flex',
            alignItems: 'flex-end',
            paddingBottom: 'clamp(1.25rem, 3.5vh, 2.25rem)',
          }}
        >
          <AgencyAbout />
        </section>

        <SectionDivider />

        {/* Work — the four-up featured grid opens the section right below the
            fold, then the fuller editorial list + CTAs. */}
        <div id="work">
          <AgencyFeaturedGrid />
          <AgencyFeaturedProjects />
        </div>

        <SectionDivider />

        {/* Services — accordion. Compact + top-aligned (no longer centered in a
            full screen) so it sits close under the work "View All Projects" CTA. */}
        <section
          id="services"
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: 'clamp(2rem, 4vh, 3rem) var(--gutter, 1.5rem)',
          }}
        >
          <ServicesAccordion />
        </section>

        {/* Notes — hidden for now. Restore by uncommenting this block, the
            IdeasSection import, and the 'ideas' entries in SPY_IDS /
            SECTION_WORDS / the sidebar ITEMS list.

        <SectionDivider />

        <section
          id="ideas"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            padding: 'clamp(2rem, 5vh, 4rem) var(--gutter, 1.5rem)',
          }}
        >
          <IdeasSection />
        </section>
        */}

        <SectionDivider />

        {/* Contact — header (image + title) over the pitch + form, mirroring /contact. */}
        <footer
          id="contact"
          style={{
            minHeight: '100svh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: 'clamp(2rem, 5vh, 4rem) var(--gutter, 1.5rem) clamp(3rem, 8vh, 6rem)',
          }}
        >
          {/* The section opens straight on the two-up: pitch + details left,
              form right. The old full-width header above it (eyebrow, "Let's
              make something together", and the partnership lede) is gone — the
              left column already carries its own eyebrow and heading. */}
          <div
            className="grid grid-cols-1 md:grid-cols-2"
            style={{
              width: '100%',
              maxWidth: '1100px',
              margin: '0 auto',
              gap: 'clamp(2.5rem, 5vw, 5rem)',
              alignItems: 'start',
            }}
          >
            {/* Left — pitch + details. */}
            <div
              className="flex flex-col font-display"
              style={{ gap: '1.25rem', color: INK }}
            >
              <span
                className="font-mono"
                style={{
                  display: 'block',
                  fontSize: '0.7rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'rgba(232, 228, 223, 0.5)',
                }}
              >
                Get in touch
              </span>
              <h2
                style={{
                  fontWeight: 700,
                  fontSize: 'clamp(1.8rem, 3.4vw, 2.8rem)',
                  lineHeight: 1.05,
                  letterSpacing: '-0.03em',
                  margin: 0,
                }}
              >
                Have a project in mind?
              </h2>
              <p
                style={{
                  margin: 0,
                  maxWidth: '38ch',
                  fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)',
                  lineHeight: 1.6,
                  color: 'rgba(232, 228, 223, 0.7)',
                }}
              >
                Tell us a little about it and we&apos;ll set up a call. Prefer
                email? Reach us directly —
              </p>
              <a
                href="mailto:hello@studiostudio.nyc"
                className="font-display"
                style={{
                  fontWeight: 600,
                  fontSize: 'clamp(1.15rem, 2.2vw, 1.6rem)',
                  letterSpacing: '-0.01em',
                  color: BLUE,
                  textDecoration: 'none',
                }}
              >
                hello@studiostudio.nyc
              </a>
            </div>

            {/* Right — the form. */}
            <div>
              <ContactForm />
            </div>
          </div>

          {/* Image — sits under the pitch + form, mirroring /contact. */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '1100px',
              margin: 'clamp(2.5rem, 6vw, 4.5rem) auto 0',
              aspectRatio: 16 / 9,
              overflow: 'hidden',
              borderRadius: '20px',
              background: 'rgba(232, 228, 223, 0.04)',
            }}
          >
            <Image
              src="/landing/opt/light-around-us2.avif"
              alt="Studio Studio installation work"
              fill
              sizes="(min-width: 1100px) 1100px, 92vw"
              className="object-cover"
            />
          </div>

          {/* Stay in the loop — compact newsletter strip. */}
          <SubscribeStrip style={{ marginTop: 'clamp(3.5rem, 8vw, 6rem)' }} />

        </footer>

        <SiteFooter />
      </div>

      {/* Pinned wordmark — difference blend inverts imagery beneath. The two
          words glide in from the left edge on load, fading up as they stack
          together in the top-left corner, fixed there for the rest of the
          scroll.
          Above the nav/social bars (z80) so the lockup reads over the header
          band; pointer-events:none keeps the nav clickable. */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 81,
          mixBlendMode: 'difference',
        }}
        aria-hidden
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="flex flex-col items-center"
            style={{ gap: 'min(1.3vw, 1.05rem)' }}
          >
            {/* Decorative pinned type, not document structure — the wrapper is
                aria-hidden and the bottom word's text swaps as you scroll, so
                these must not be headings. The page's real <h1> is in the hero.
                wordStyle sets every type property explicitly (margin included),
                so the tag is purely a semantics change. */}
            <motion.div
              ref={topWordRef}
              initial={false}
              animate={topTarget}
              transition={wordTransition}
              style={wordStyle}
            >
              STUDIO
            </motion.div>
            <motion.div
              initial={false}
              animate={botTarget}
              transition={wordTransition}
              style={wordStyle}
            >
              <span
                ref={botSpanRef}
                style={{
                  display: 'inline-block',
                  transform: `scale(${botFit})`,
                  transformOrigin: 'center center',
                }}
              >
                {bottomText}
              </span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* White frame — left/right + bottom edges. Only at the footer. */}
      <div
        aria-hidden
        className="side-frame"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 60,
          pointerEvents: 'none',
          borderLeft: `30px solid ${BG}`,
          borderRight: `30px solid ${BG}`,
          borderBottom: `30px solid ${BG}`,
          opacity: active === 'contact' ? 1 : 0,
          transition: 'opacity 500ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />
      <style>{`
        @media (max-width: 640px) {
          .side-frame { border-left: 0 !important; border-right: 0 !important; }
        }
      `}</style>

    </>
  )
}
