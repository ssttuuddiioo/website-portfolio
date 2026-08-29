'use client'

import { useRef, useState, useEffect, useLayoutEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect
import { LandingSidebar } from './landing-sidebar'
import { SiteFooter } from './site-footer'
import { AgencyAbout } from './agency-about'
import { MobileProjectScroller } from './mobile-project-scroller'
import { ProjectIndexGrid } from './project-index'
// import { IdeasSection } from './ideas-section' // notes section hidden for now
import { wordStyle, BG } from './landing-theme'
import {
  HeroImageTrail,
  type TrailItem,
} from '@/components/project/hero-image-trail'
import { LANDING_PROJECTS } from '@/lib/landing-projects'
import { fieldPosition } from '@/lib/project-tags'
import { useLenis } from '@/lib/lenis-provider'
import { centerOffset } from './use-scroll-to-section'

// The hero trail flips through the same work the corner index lists, naming
// the frame that comes to rest and inviting a click through to it. Every entry
// in the index has a page at /work/[slug] — hand-authored where a case study
// exists, generated from the index entry otherwise (see lib/project-page) — so
// there is one prompt and one destination.
// Module-level so the array identity is stable across renders (the trail
// preloads on it).
const HERO_TRAIL = LANDING_PROJECTS.map((p) => ({
  src: p.image,
  title: p.title,
  meta: p.category,
  cta: 'Click to learn more',
  // Where the project sits between the four poles — see lib/project-tags. This
  // is what lets the field be steered: carry the pointer toward Web and the
  // web-leaning work is what comes up.
  pos: fieldPosition(p),
}))

// The landing is two screens now: the first, and the footer band that closes
// it. Work is no longer a section at all — it is the index grid standing in for
// the trail on the first screen — and services/contact live on their own pages.
const SPY_IDS = ['home', 'site-footer']

// The footer band IS the about destination (the dock's about item scrolls to
// it), so the spy reports it under that item's name rather than the element's.
const SPY_ITEM: Record<string, string> = {
  'site-footer': 'about',
}

// The second (mirrored) wordmark swaps to the active section's name (staying
// rotated 180°); home/about fall back to STUDIO.
const SECTION_WORDS: Record<string, string> = {
  work: 'WORK',
}

// Size the wordmark settles at once posted to the header — 20% larger on mobile.
const WORD_SCALE_DESKTOP = 0.2125
const WORD_SCALE_MOBILE = 0.255
// Clearance from the page edges (px) for the stacked mark, plus the air left
// under it before the header band hands off to the hero.
/* The site edge — the same 40px --edge carries in globals.css. The lockup is
   placed by measurement, so it needs the number in JS; keep the two in step. */
const EDGE = 40
const MARGIN_X = EDGE
const MARGIN_TOP_DESKTOP = EDGE
const MARGIN_TOP_MOBILE = EDGE
const HEADER_PAD_BOT_DESKTOP = 28
const HEADER_PAD_BOT_MOBILE = 20
// Both marks ride together in the top-left corner: the second word sits
// directly under the first (still mirrored, so it reads as a reflection) with
// this much air between them.
const STACK_GAP = 6
// Smooth ease-in-out (gentle acceleration + deceleration).
const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const

/**
 * Agency variant of the landing experience. The page opens on a header band —
 * a strip of page background that the stacked STUDIO lockup sits in. The reveal
 * plays on load (no scroll-jacking): both marks start off-canvas at final size
 * past the left edge and glide in horizontally, fading up as they land stacked
 * in the top-left corner. They stay fixed there as a persistent signature; the rest of
 * the page (about, work) scrolls normally beneath them.
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
  // True once the IKB footer band is up; drives the white page frame.
  const [atFooter, setAtFooter] = useState(false)
  // The first screen runs one of two things: the image trail, or the index grid
  // standing in its place. Nothing else about the page changes — the lockup and
  // dock stay put, and everything below the fold is untouched.
  const [showIndex, setShowIndex] = useState(false)
  // True once the trail has named its first frame. Until then the caption's slot
  // at the fold belongs to the studio statement.
  const [trailNamed, setTrailNamed] = useState(false)
  const lenis = useLenis()
  // While a nav-click scroll is in flight we lock the spy and drive the
  // highlight optimistically, so the pill snaps to the clicked section instead
  // of flickering through the short sections (about / about-to) flying past.
  const suppressSpy = useRef(false)

  /** The top of the page — the header band above the hero, not the hero
      centered in the viewport. */
  const scrollToTop = () => {
    if (lenis) lenis.scrollTo(0, { force: true })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Nav click: highlight the target immediately and lock the spy, then
  // smooth-scroll to it. The lock holds until the user's NEXT real scroll
  // gesture (see effect below) — not until the scroll finishes — so a trailing
  // settle can't re-read the pill back onto the section being passed through.
  const scrollToSection = (id: string) => {
    // Work isn't a section any more — it's the grid standing in for the trail on
    // the first screen — so the dock's work item flips it on instead of
    // scrolling anywhere.
    if (id === 'work') {
      setIndex(true)
      return
    }
    // About is the footer band. The statement it used to name now opens the page
    // at the fold, and the studio's detail (nav, capabilities, socials) is what
    // the footer carries.
    const el = document.getElementById(id === 'about' ? 'site-footer' : id)
    if (!el) return
    setActive(id)
    suppressSpy.current = true
    // Home is the trail: the dock shows it as the trail mark, so pressing it
    // with the index up puts the first screen back rather than scrolling to a
    // screen that isn't there.
    if (id === 'home') {
      setIndex(false)
      scrollToTop()
      return
    }
    const offset = centerOffset(el)
    if (lenis) lenis.scrollTo(el, { offset, force: true })
    else el.scrollIntoView({ behavior: 'smooth', block: offset < 0 ? 'center' : 'start' })
  }

  // Switching the first screen between the trail and the grid — from the corner
  // toggle or from the dock's work item. The index stands in for the first
  // screen, so it wants to be read from the top: anywhere below that, the page
  // rides back up as it flips rather than swapping something out of sight and
  // growing under the reader. Scrolls straight rather than through
  // scrollToSection, which reads 'home' as "put the trail back" and would close
  // the index in the same breath as opening it.
  const setIndex = (on: boolean) => {
    setShowIndex(on)
    // The trail unmounts with the index, so it comes back with an empty caption:
    // the statement is the fold's default line again until a frame names itself.
    setTrailNamed(false)
    if (on && window.scrollY > 0) {
      setActive('home')
      suppressSpy.current = true
      scrollToTop()
    }
  }
  const toggleIndex = () => setIndex(!showIndex)

  // Every other page links the dock's work item at /#work, since it can't reach
  // into this page's state. The landing has no work section to land on, so the
  // hash means "open with the index up".
  useEffect(() => {
    if (window.location.hash !== '#work') return
    setShowIndex(true)
    window.history.replaceState(
      null,
      '',
      window.location.pathname + window.location.search,
    )
  }, [])

  // Clicking the hero field opens the page for whichever frame is resting on
  // it. Every index entry has one, so this never has to fall back — a project
  // with a live site of its own links out from its page rather than instead of
  // it.
  const openTrailProject = (_item: TrailItem, index: number) => {
    const project = LANDING_PROJECTS[index]
    if (!project?.slug) return
    router.push(`/work/${project.slug}`)
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
      setActive(SPY_ITEM[current] ?? current)

      // The white frame is a footer treatment, so it keys off the footer band
      // itself rather than a section: on once the IKB block has come up past
      // the middle of the screen.
      const foot = document.getElementById('site-footer')
      setAtFooter(
        foot ? foot.getBoundingClientRect().top < window.innerHeight * 0.6 : false,
      )
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
  // The index isn't a section the spy can see, so while it's up the dock and the
  // mirrored wordmark both read it as the work item being on — but only while
  // the first screen is what's being read. The index replaces that screen, not
  // the page: scroll on to the footer band, or click about to be taken there,
  // and the dock follows you rather than staying pinned to work behind a
  // section you have left. `active` is only ever home or about, so this is the
  // whole of it.
  const navActive = showIndex && active === 'home' ? 'work' : active
  const sectionWord = SECTION_WORDS[navActive] ?? null
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

  // The header band's height, as one expression both it and the sections below
  // measure against (the clamp is the pre-measurement stand-in for the lockup).
  const headerH = geo.measured
    ? `${geo.headerH}px`
    : 'clamp(7rem, 16vw, 10.5rem)'

  return (
    <>
      {/* Desktop. Both trees are in the markup and the breakpoint is drawn
          in CSS, not in JS: the page is prerendered, so a JS switch would
          ship the desktop tree to every phone and only swap it after
          hydration. */}
      <div className="ss-desktop">
        {/* The dock also carries the index switch, one cell right of the trail
            mark: the two marks are the first screen's two views, so they sit
            together rather than at opposite corners of the page.

            Unpinned: it belongs to the first screen — the header band it sits
            in, the trail it switches — so it scrolls away with that screen
            rather than riding down over the fold and the footer band. */}
        <LandingSidebar
          active={navActive}
          inPage
          onNavigate={scrollToSection}
          indexOpen={showIndex}
          onToggleIndex={toggleIndex}
          pinned={false}
        />

        {/* Page content. */}
        <div style={{ position: 'relative', zIndex: 3 }}>
          {/* Everything the image trail plays across — the header band, the hero
              and the studio statement — inside one positioned box, so the field
              below can simply take `inset: 0` and reach exactly the bottom of the
              about section without anyone measuring anything. */}
          <div style={{ position: 'relative' }}>
          {/* Image trail — this whole run is a field: moving the pointer across
              it flips through the work, one frame every 35px of travel. Stop
              moving and the last frame stays, named large at the fold with a
              prompt to click through. The same work is one click away as a
              grid, from the grid mark beside the trail mark in the dock.
              z-index -1 keeps it behind the header lockup and the studio
              statement (the page background lives on an ancestor, so it still
              shows through), and overflow:hidden stops frames spilling into the
              sections below. Silent on touch + reduced motion, and aria-hidden
              throughout: it is a pointer-only shortcut to work the index links
              properly. */}
          <AnimatePresence>
            {!showIndex && (
              <motion.div
                key="trail"
                aria-hidden
                initial={false}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.25, ease: EASE_IN_OUT }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  overflow: 'hidden',
                  zIndex: -1,
                }}
              >
                <HeroImageTrail
                  images={HERO_TRAIL}
                  grid={false}
                  // Dropped the moment the index takes over, so a click during
                  // the field's quarter-second fade-out can't still route.
                  onSelect={showIndex ? undefined : openTrailProject}
                  captionAnchor="statement"
                  onCaptionShown={() => setTrailNamed(true)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header band — a strip the page opens on, sized to the stacked STUDIO
              lockup that sits fixed in its top-left corner, so the marks own a
              header instead of crowding the statement below. Purely spatial and
              transparent: the type itself lives in the pinned blend layer near
              the bottom of this file (it inverts over any trail frame that lands
              under it), and the page's real <h1> is in the hero. */}
          <header
            aria-hidden
            style={{ height: headerH }}
          />

          {/* Hero — the first screen. Running the trail it is an open field with
              no copy of its own: it takes the rest of the screen and the trail's
              caption names the resting frame down at the fold. Running the index
              it holds the grid instead, which is taller than a screen, so the
              section grows and everything below simply moves down with it. */}
          <section
            id="home"
            style={{
              position: 'relative',
              minHeight: `calc(100svh - ${headerH})`,
              ...(showIndex
                ? null
                : {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    // Only the empty field clips; the grid has to run past it.
                    overflow: 'hidden',
                    padding: '0 var(--gutter, 1.5rem)',
                  }),
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

            {showIndex && <ProjectIndexGrid />}
          </section>

          {/* Studio statement — the fold's default line, standing in the exact
              slot the trail's caption takes: same bottom edge one inset above
              the fold, same left edge on the 1440 grid (.fold-statement below
              mirrors .trail-caption--statement in hero-image-trail). One place,
              two contents — the statement is what you land on, and the moment
              the trail names its first frame it hands the slot over to the
              titles for the rest of the visit. Coming back from the index hands
              it back, since the trail returns with an empty caption.
              It carries no layout: the grid runs down through this same space
              when the index is up, so the block is absolute and drops its
              pointer events the moment it goes quiet. */}
          <div
            className="fold-statement"
            style={{
              opacity: showIndex || trailNamed ? 0 : 1,
              pointerEvents: showIndex || trailNamed ? 'none' : 'auto',
            }}
          >
            <AgencyAbout />
          </div>
          </div>

          {/* Nothing stands between the first screen and the footer. The work
              is the index behind the dock's grid mark, and services and contact
              have pages of their own — so the scroll is the fold, then the
              band that closes it. */}

          {/* Notes — hidden for now. Restore by uncommenting this block, the
              IdeasSection import, the 'ideas' entries in SPY_IDS /
              SECTION_WORDS / the sidebar ITEMS list, and the SectionDivider
              helper (removed with the last live divider — see git history).

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

          <SiteFooter />
        </div>

        {/* The wordmark — difference blend inverts imagery beneath. The two
            words glide in from the left edge on load, fading up as they stack
            together in the top-left corner of the first screen, and they leave
            with it: the lockup belongs to the header band, the same as the dock
            in the opposite corner, so both scroll away rather than riding down
            over the fold.
            One viewport tall and parked at the top of the document, because the
            words are placed by centring them in this box and translating out to
            the corner (see the geometry above, which measures against
            window.innerHeight) — at any other height they would land somewhere
            else entirely.
            Above the nav/social bars (z80) so the lockup reads over the header
            band; pointer-events:none keeps the nav clickable. */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
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
            borderLeft: `var(--edge) solid ${BG}`,
            borderRight: `var(--edge) solid ${BG}`,
            borderBottom: `var(--edge) solid ${BG}`,
            opacity: atFooter ? 1 : 0,
            transition: 'opacity 500ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
        <style>{`
          @media (max-width: 640px) {
            .side-frame { border-left: 0 !important; border-right: 0 !important; }
          }
        `}</style>

      </div>

      {/* Mobile — its own experience, not this page reflowed. The trail is
          pointer-driven and silent on touch, so the work is browsed by
          scrolling a column of it over a frame of the selected row. */}
      <div className="ss-mobile">
        <MobileProjectScroller />
      </div>

      <style>{`
        /* The fold's shared slot. These two values are the whole agreement with
           the trail's caption (.trail-caption--statement): the bottom edge sits
           one site edge above the fold, measured DOWN from the top of the field
           so the field's own height never enters into it. The horizontal edge
           needs no expression here — both the statement and the caption pin
           themselves to --edge, the same line the lockup sits on. */
        .fold-statement {
          position: absolute;
          left: 0;
          right: 0;
          /* The block's bottom edge lands one site edge above the fold, so the
             statement clears the foot by exactly what the lockup clears the
             top and left by. */
          top: calc(100svh - var(--edge));
          transform: translateY(-100%);
          z-index: 2;
          /* Matches the caption's own fade in, so the handover is one crossfade
             rather than two things taking turns. */
          transition: opacity 450ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        @media (prefers-reduced-motion: reduce) {
          .fold-statement { transition-duration: 200ms; }
        }

        .ss-mobile { display: none; }
        @media (max-width: 899px) {
          .ss-desktop { display: none; }
          .ss-mobile { display: block; }
        }
      `}</style>

    </>
  )
}
