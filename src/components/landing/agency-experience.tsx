'use client'

import { useRef, useState, useEffect, useLayoutEffect } from 'react'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'

const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect
import { LandingSidebar, SocialRow } from './landing-sidebar'
import { AgencyAbout } from './agency-about'
import { AgencyFeaturedProjects } from './agency-featured-projects'
import { HeroBackdrop } from './hero-backdrop'
import { ContactForm } from './contact-form'
import { SubscribeStrip } from './subscribe-form'
import { ServicesAccordion } from './services-accordion'
// import { IdeasSection } from './ideas-section' // notes section hidden for now
import { wordStyle, INK, BG, BLUE } from './landing-theme'
import { useLenis } from '@/lib/lenis-provider'
import { centerOffset } from './use-scroll-to-section'

const SPY_IDS = ['home', 'work', 'services', 'contact']

// The bottom corner wordmark swaps to the active section's name (staying
// rotated 180°); home/about fall back to STUDIO.
const SECTION_WORDS: Record<string, string> = {
  work: 'WORK',
  services: 'SERVICES',
  contact: 'CONTACT',
}

// Size the wordmark settles at once posted to the corners — 20% larger on mobile.
const WORD_SCALE_DESKTOP = 0.425
const WORD_SCALE_MOBILE = 0.51
// Clearance from the page edges (px). Desktop: the top word tucks into the
// header band (tight top, looser bottom). Mobile: both words ride together at
// the top of the page, so the pair hugs the top edge and MARGIN_BOT_MOBILE
// only matters if the corner layout ever comes back.
const MARGIN_X = 40
const MARGIN_TOP_DESKTOP = 10
const MARGIN_BOT_DESKTOP = 56
const MARGIN_TOP_MOBILE = 28
const MARGIN_BOT_MOBILE = 112
// Mobile stacks both marks at the top of the page instead of pinning one to
// each corner: the second word sits directly under the first (still mirrored,
// so it reads as a reflection) with this much air between them.
const MOBILE_STACK_GAP = 6
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
      <div style={{ height: 1, background: 'rgba(10,10,10,0.14)' }} />
    </div>
  )
}

/**
 * Agency variant of the landing experience. The hero plays as an ON-LOAD
 * reveal (no scroll-jacking): the two STUDIO marks start off-canvas at final
 * size and glide in horizontally from their own edge — the top word in from the
 * left to the top-left corner, the bottom word in from the right to the
 * bottom-right. The corner marks stay posted as a persistent signature; the
 * rest of the page (work, services, ideas, contact) scrolls normally beneath
 * them.
 */
export function AgencyExperience() {
  const reduce = useReducedMotion()
  const topWordRef = useRef<HTMLHeadingElement>(null)

  // Mobile gets a 20%-larger corner wordmark with roomier, symmetric top/bottom
  // padding; desktop keeps the tight header tuck. Drives both the corner
  // geometry (below) and the animation targets.
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
  const MARGIN_BOT = isMobile ? MARGIN_BOT_MOBILE : MARGIN_BOT_DESKTOP

  // Measured pixel offsets from each word's resting (centered) position to its
  // corner, plus the off-canvas start each word glides in from (top word from
  // the left edge, bottom word from the right). Recomputed on resize / font
  // load so the corners always land right.
  const [geo, setGeo] = useState({
    topX: 0,
    topY: 0,
    botX: 0,
    botY: 0,
    topXOff: 0,
    botXOff: 0,
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
      const halfW = (wW * WORD_SCALE) / 2
      const halfH = (wH * WORD_SCALE) / 2
      const topCx = W / 2
      const topCy = H / 2 - (wH + gap) / 2
      const botCx = W / 2
      const botCy = H / 2 + (wH + gap) / 2
      // Fully clear of the viewport edge, plus a little slack, so nothing
      // peeks in before the glide starts.
      const OFF_PAD = 24
      // Mobile: both words stacked top-left. Desktop: top-left + bottom-right.
      const botLeft = MARGIN_X + halfW - botCx
      const botStackedY =
        MARGIN_TOP + wH * WORD_SCALE + MOBILE_STACK_GAP + halfH - botCy
      setGeo({
        topX: MARGIN_X + halfW - topCx,
        topY: MARGIN_TOP + halfH - topCy,
        botX: isMobile ? botLeft : W - MARGIN_X - halfW - botCx,
        botY: isMobile ? botStackedY : H - MARGIN_BOT - halfH - botCy,
        topXOff: -halfW - OFF_PAD - topCx,
        botXOff: W + halfW + OFF_PAD - botCx,
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
  }, [isMobile, WORD_SCALE, MARGIN_TOP, MARGIN_BOT])

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
    const offset = centerOffset(el)
    if (lenis) lenis.scrollTo(el, { offset, force: true })
    else el.scrollIntoView({ behavior: 'smooth', block: offset < 0 ? 'center' : 'start' })
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

  // Bottom corner word: STUDIO until a section scrolls into view, then the
  // section name — uniform-scaled so every word spans the same width as the
  // top STUDIO mark (so WORK / SERVICES / CONTACT all line up edge-to-edge).
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
  // height — snapped there (duration 0) so measurement never reads as motion.
  // The reveal is then a pure horizontal glide into the corner.
  const wordTransition =
    reduce || !revealed
      ? { duration: 0 }
      : { duration: 1.3, ease: EASE_IN_OUT }
  const topTarget = {
    x: revealed ? geo.topX : geo.topXOff,
    y: geo.topY,
    scale: WORD_SCALE,
    opacity: geo.measured ? 1 : 0,
  }
  const botTarget = {
    x: revealed ? geo.botX : geo.botXOff,
    y: geo.botY,
    scale: WORD_SCALE,
    rotate: 180,
    opacity: geo.measured ? 1 : 0,
  }

  return (
    <>
      <LandingSidebar active={active} inPage onNavigate={scrollToSection} />

      {/* Page content. */}
      <div style={{ position: 'relative', zIndex: 3 }}>
        {/* Hero — full screen, on-load reveal. Photo + scrim behind, centered
            copy in front; both scroll away to reveal the work. */}
        <section
          id="home"
          style={{
            position: 'relative',
            minHeight: '100svh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            padding: '0 var(--gutter, 1.5rem)',
          }}
        >
          {/* The page's <h1>. The hero is deliberately image-only, so the
              heading is visually hidden — it exists for screen readers and for
              anything parsing the page (search, LLM crawlers), which otherwise
              find no statement of what this site is outside the <title> tag. */}
          <h1 className="sr-only">
            Studio Studio — experiential design and creative technology in
            Brooklyn, New York
          </h1>

          {/* Background photo + legibility scrim. The animating corner
              wordmarks (pinned, below) are the only foreground now. */}
          <div aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <HeroBackdrop />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(240,240,249,0.3)',
              }}
            />
          </div>
        </section>

        {/* About — three-column value prop, under the hero fold. The block owns
            its own max-width + gutter so its columns sit on the same grid as the
            selected-work rows below. */}
        <section
          id="about"
          style={{
            padding: 'clamp(3rem, 7vw, 6rem) 0',
          }}
        >
          <AgencyAbout />
        </section>

        <SectionDivider />

        {/* Work — featured projects + CTAs. */}
        <div id="work">
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
            padding: 'clamp(2rem, 5vh, 4rem) var(--gutter, 1.5rem) 12vh',
          }}
        >
          {/* Header — eyebrow + title + lede + image. */}
          <div
            style={{
              width: '100%',
              maxWidth: '1100px',
              margin: '0 auto',
              marginBottom: 'clamp(2.5rem, 6vw, 4.5rem)',
            }}
          >
            <span
              className="font-mono"
              style={{
                display: 'block',
                fontSize: '0.7rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'rgba(10,10,10,0.5)',
              }}
            >
              Contact
            </span>
            <h2
              className="font-display"
              style={{
                fontWeight: 700,
                fontSize: 'clamp(2.2rem, 6.5vw, 4.5rem)',
                lineHeight: 1.02,
                letterSpacing: '-0.03em',
                color: INK,
                margin: '1.25rem 0 0',
                maxWidth: '15ch',
              }}
            >
              Let&apos;s make something together.
            </h2>
            <p
              className="font-display"
              style={{
                fontWeight: 500,
                fontSize: 'clamp(1.05rem, 1.9vw, 1.45rem)',
                lineHeight: 1.5,
                color: 'rgba(10,10,10,0.7)',
                margin: '1.75rem 0 0',
                maxWidth: '52ch',
              }}
            >
              An installation, an activation, a tool, a stage — tell us what you
              have in mind. We partner with brands, agencies, and institutions to
              turn ambitious ideas into rooms, screens, and stages people
              remember.
            </p>
          </div>

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
                  color: 'rgba(10,10,10,0.5)',
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
                  color: 'rgba(10,10,10,0.7)',
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
              background: 'rgba(10,10,10,0.04)',
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

          {/* Footer band — social icons over the copyright, centered. */}
          <div
            className="flex flex-col items-center"
            style={{
              width: '100%',
              maxWidth: '1100px',
              margin: '0 auto',
              marginTop: 'clamp(3rem, 7vw, 5rem)',
              gap: '1.5rem',
            }}
          >
            <SocialRow size={24} gap="1.75rem" horizontal />
            <span
              className="font-mono"
              style={{
                color: INK,
                opacity: 0.55,
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              © 2026 Studio Studio · Brooklyn, NY
            </span>
          </div>
        </footer>
      </div>

      {/* Pinned wordmark — difference blend inverts imagery beneath. The two
          words glide in from opposite side edges on load and stay posted in
          their corners.
          Above the nav/social bars (z80) so the top-left mark reads in the
          header band; pointer-events:none keeps the nav clickable. */}
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
