'use client'

import { useRef, useState, useEffect, useLayoutEffect } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
} from 'framer-motion'

const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect
import { CursorTrail } from './cursor-trail'
import { LandingSidebar, SocialRow } from './landing-sidebar'
import { AboutSection } from './about-section'
import { ProjectIndex } from './project-index'
import { SeeAllWork } from './see-all-work'
import { HeroBackdrop } from './hero-backdrop'
import { ContactMap } from './contact-map'
import { ContactForm } from './contact-form'
import { ServicesAccordion } from './services-accordion'
import { IdeasSection } from './ideas-section'
import { wordStyle, INK, BG, BLUE } from './landing-theme'
import { useLenis } from '@/lib/lenis-provider'

const SPY_IDS = ['home', 'about', 'work', 'services', 'ideas', 'contact']

const SECTION_WORDS: Record<string, string> = {
  work: 'WORK',
  services: 'SERVICES',
  ideas: 'IDEAS',
  contact: 'CONTACT',
}

export function LandingExperience() {
  const trackRef = useRef<HTMLDivElement>(null)
  const aboutRef = useRef<HTMLDivElement>(null)
  const topWordRef = useRef<HTMLHeadingElement>(null)
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  })

  // Blur is tied to the about section being on screen: starts as the about
  // text appears from the bottom, fully blurred as it leaves the top, then
  // the wordmark un-blurs back to solid. Only blurs while about is defined.
  const { scrollYProgress: aboutProgress } = useScroll({
    target: aboutRef,
    offset: ['start end', 'end start'],
  })
  const dissolve = useTransform(aboutProgress, [0, 0.55, 0.8], [0, 1, 0])
  // ~90% big wide blur; the top blurs then reappears (reverses with dissolve).
  const wordBlur = useTransform(dissolve, [0, 1], [0, 54])
  const wordFilter = useMotionTemplate`blur(${wordBlur}px)`

  // Bottom (mirrored) word: blurs in sync with the top going down, then
  // desyncs — it stays blurred + faded out for the lower sections. Tied to
  // the about scroll position (not latched), so it reappears as you scroll
  // back to the top — the intro/outro of the page.
  const bottomBlur = useTransform(aboutProgress, [0, 0.55], [0, 54])
  const bottomFilter = useMotionTemplate`blur(${bottomBlur}px)`
  const bottomOpacity = useTransform(aboutProgress, [0.45, 0.6], [1, 0])

  // Hero background image fills behind the lockup, then — in lockstep with the
  // STUDIO separation/blur — scales up, blurs out, and fades to the warm-white
  // page color as the about section scrolls (all reversible).
  const heroImageOpacity = useTransform(aboutProgress, [0.05, 0.5], [1, 0])
  // Scale begins the moment you start scrolling (tied to the home track, like
  // the lockup), then holds while the about scroll blurs + fades it out.
  const heroImageScale = useTransform(scrollYProgress, [0, 1], [1, 1.18])
  const heroImageBlurPx = useTransform(aboutProgress, [0, 0.55], [0, 40])
  const heroImageFilter = useMotionTemplate`blur(${heroImageBlurPx}px)`

  // About copy: fades in + un-blurs as the wordmark separates and blurs,
  // holds, then fades + drifts out while the work scrolls up over it.
  const aboutTextOpacity = useTransform(
    aboutProgress,
    [0.15, 0.38, 0.72, 0.97],
    [0, 1, 1, 0],
  )
  const aboutTextBlur = useTransform(aboutProgress, [0.15, 0.38], [14, 0])
  const aboutTextFilter = useMotionTemplate`blur(${aboutTextBlur}px)`
  const aboutTextY = useTransform(aboutProgress, [0.72, 0.97], [0, -30])

  // Solid scrim that pops the about moment to a fully opaque page-color ground.
  // It tracks the about copy's fade exactly but sits ABOVE the wordmark, so the
  // blurred STUDIO (and everything behind) is fully hidden while about is held —
  // the section "clicks in" on clean ground, then dissolves to reveal the work.
  const aboutBgOpacity = useTransform(
    aboutProgress,
    [0.15, 0.38, 0.72, 0.97],
    [0, 1, 1, 0],
  )

  const [active, setActive] = useState('home')
  const lenis = useLenis()
  // While a nav-click scroll is in flight we lock the spy and drive the
  // highlight optimistically, so the pill snaps to the clicked section instead
  // of flickering through (or mis-reading) the sections flying past.
  const suppressSpy = useRef(false)

  // Nav click: highlight the target immediately and lock the spy, then
  // smooth-scroll to it. The lock is held until the user's NEXT real scroll
  // gesture (see effect below) — NOT until the scroll finishes — because the
  // landing point sits at the very edge of the section's spy band, so releasing
  // on completion lets a trailing settle re-read flip the pill back to the
  // previous section. Pinning until real input means the click highlight sticks.
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    setActive(id)
    suppressSpy.current = true
    if (lenis) lenis.scrollTo(el, { offset: 0, force: true })
    else el.scrollIntoView({ behavior: 'smooth' })
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

  // Scroll-spy with a direction-aware lead: instead of flipping when a section
  // boundary hits the exact viewport center, we probe a point LEAD *ahead* of
  // center in whatever direction we're scrolling, so the bottom word flips to
  // the next section a touch early. The lead is a FRACTION of the viewport, not
  // a fixed pixel count: a fixed ~500px lead while scrolling up cancelled the
  // half-viewport offset below, zeroing the landing margin and mis-reading a
  // section (e.g. "about") as the previous one ("home").
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

      // Probe point in document space: viewport center, pushed a fraction of a
      // viewport ahead in the scroll direction.
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

  // Lockup opens from a tight centered mark: grows, top rises to pin,
  // bottom mirrors down to the bottom edge of the frame.
  const wrapperScale = useTransform(scrollYProgress, [0, 0.55], [0.55, 1])
  const wrapperTransform = useMotionTemplate`scale(${wrapperScale})`

  // Pin progress: 0 = centered lockup, 1 = pinned to the edges.
  const pin = useTransform(scrollYProgress, [0, 0.5], [0, 1])
  // Top word pins so its TOP edge sits 4vh from the top — matching the bottom
  // word's 4vh bottom padding — regardless of viewport height. The offset
  // accounts for the word's own height (0.82 line-height) and half the gap.
  // Centered horizontally — no X nudge, so the lockup sits between both page
  // edges rather than reading as offset toward one side.
  const topTransform = useMotionTemplate`translateY(calc((-46vh + 0.82 * min(19vw, 15rem) + min(0.65vw, 0.525rem)) * ${pin}))`
  const bottomTransform = useMotionTemplate`translateY(calc((46vh - 0.82 * min(19vw, 15rem) - min(0.65vw, 0.525rem)) * ${pin})) rotate(180deg)`

  // Nav dock reveal: only once the STUDIO words have come fully to rest in the
  // corners (pin completes ~0.5) does the dock slide up and fade in — it stays
  // hidden while the wordmark is still travelling.
  const dockReveal = useTransform(scrollYProgress, [0.52, 0.66], [0, 1])
  const dockOpacity = dockReveal
  const dockY = useTransform(dockReveal, [0, 1], [72, 0])

  // Big bottom word naming the current section as you scroll.
  const sectionWord = SECTION_WORDS[active] ?? null

  return (
    <>
      <CursorTrail rgb="31,68,255" />
      {/* Hero background carousel — backmost layer; fades to the page color over about. */}
      <motion.div
        aria-hidden
        style={{
          position: 'fixed',
          zIndex: 0,
          opacity: heroImageOpacity,
          scale: heroImageScale,
          filter: heroImageFilter,
          // Bleed past the edges so the scale-up + blur never reveal a seam.
          inset: '-4%',
          pointerEvents: 'none',
        }}
      >
        <HeroBackdrop />
      </motion.div>
      {/* Opaque scrim for the about moment — above the wordmark (z70), below the
          about copy (z72). Ramps to 100% so the about reads on clean ground. */}
      <motion.div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 71,
          background: BG,
          opacity: aboutBgOpacity,
          pointerEvents: 'none',
        }}
      />
      {/* About copy — centered overlay above the scrim; both fade to reveal work. */}
      <AboutSection
        opacity={aboutTextOpacity}
        filter={aboutTextFilter}
        y={aboutTextY}
      />
      <LandingSidebar
        active={active}
        inPage
        dockOpacity={dockOpacity}
        dockY={dockY}
        onNavigate={scrollToSection}
      />

      {/* Page content sits above the particle field + about overlay. */}
      <div style={{ position: 'relative', zIndex: 3 }}>
        {/* Scroll track = the home section; drives the lockup opening. */}
        <div id="home" ref={trackRef} style={{ height: '260vh' }} />

      {/* About — scroll spacer driving the wordmark blur + about overlay.
          Taller than a single screen so the full-opacity hold reads as a
          deliberate beat before the copy dissolves into the work. */}
      <div ref={aboutRef} style={{ height: '310vh', position: 'relative' }}>
        {/* Nav + scroll-spy anchor, placed at the spacer's hold center (~40%)
            rather than its top. Clicking "about" lands on the fully-formed
            about moment (copy centered, hero faded), and the spy reads "about"
            only while the copy is actually on screen — not back when the hero
            is still up. */}
        <div
          id="about"
          aria-hidden
          style={{ position: 'absolute', top: '40%', left: 0, width: 1, height: 1 }}
        />
      </div>

      {/* Work — the composed image scatter. */}
      <div id="work">
        <ProjectIndex />
        {/* See-all bouncer → full work index */}
        <SeeAllWork />
      </div>

      {/* Services — accordion */}
      <section
        id="services"
        style={{
          minHeight: '100svh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          // Tight lead-in from the See-All pill — was 24vh of centered top
          // whitespace; now the accordion starts just below the pill.
          padding: '6vh var(--gutter, 1.5rem) 24vh',
        }}
      >
        <ServicesAccordion />
      </section>

      {/* Ideas — filterable Stories-style grid. */}
      <section
        id="ideas"
        style={{
          minHeight: '100svh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          padding: '26vh var(--gutter, 1.5rem) 24vh',
        }}
      >
        <IdeasSection />
      </section>

      {/* Contact — the footer. The big bottom word reads CONTACT here. */}
      <footer
        id="contact"
        style={{
          minHeight: '100svh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          // Clear the pinned STUDIO (top) and CONTACT word (bottom) so the
          // form sits centered in the band between them.
          padding: '24vh var(--gutter, 1.5rem)',
        }}
      >
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
          {/* Left — location + favorites */}
          <div
            className="flex flex-col font-display"
            style={{
              gap: '1.5rem',
              color: INK,
              fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)',
              lineHeight: 1.5,
            }}
          >
            <p style={{ margin: 0, maxWidth: '36ch' }}>
              You can find us at{' '}
              <a
                href="https://www.instagram.com/src__nyc/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: BLUE, textDecoration: 'underline' }}
              >
                SRC_NYC
              </a>
              , a shared studio and community space in Brooklyn, NY
            </p>
            <ContactMap />
          </div>

          {/* Right — heading + form */}
          <div>
            <p
              className="font-display"
              style={{
                margin: '0 0 2rem',
                color: INK,
                fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)',
                fontWeight: 500,
              }}
            >
              Have a project in mind? Drop us a line
            </p>
            <ContactForm />
          </div>
        </div>

        {/* Footer band — social icons over the copyright, centered. */}
        <div
          className="flex flex-col items-center"
          style={{
            width: '100%',
            maxWidth: '1100px',
            margin: '0 auto',
            marginTop: 'clamp(4rem, 10vw, 8rem)',
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

      {/* Pinned wordmark frame — difference blend inverts imagery beneath. */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 70,
          mixBlendMode: 'difference',
        }}
        aria-hidden
      >
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transform: wrapperTransform }}
        >
          {/* Mirror lockup: STUDIO over a flipped STUDIO, clear gap, centered */}
          <div
            className="flex flex-col items-center"
            style={{ gap: 'min(1.3vw, 1.05rem)' }}
          >
            <motion.h1
              ref={topWordRef}
              style={{
                ...wordStyle,
                transform: topTransform,
                filter: wordFilter,
              }}
            >
              STUDIO
            </motion.h1>
            <motion.h1
              style={{
                ...wordStyle,
                transform: bottomTransform,
                filter: bottomFilter,
                opacity: bottomOpacity,
              }}
            >
              STUDIO
            </motion.h1>
          </div>
        </motion.div>
      </div>

      {/* Side frame — 30px white margins down the left and right edges. Sits
          above the carousel + scrolling content, below the wordmark/nav. */}
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
        }}
      />
      <style>{`
        @media (max-width: 640px) {
          .side-frame { border-left: 0 !important; border-right: 0 !important; }
        }
      `}</style>

      {/* Big bottom word — names the current section, matched to STUDIO width. */}
      <BottomWord word={sectionWord} targetRef={topWordRef} />
    </>
  )
}

/**
 * Big bottom word, scaled to span exactly the width of the top STUDIO
 * wordmark (so WORK, SERVICES, CONTACT, etc. all line up edge-to-edge).
 * Difference-blended like the wordmark; fades in/out with the section.
 */
function BottomWord({
  word,
  targetRef,
}: {
  word: string | null
  targetRef: React.RefObject<HTMLHeadingElement | null>
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [scale, setScale] = useState(0)

  useIsoLayoutEffect(() => {
    function measure() {
      const el = ref.current
      const target = targetRef.current
      if (!el || !target) return
      const targetWidth = target.getBoundingClientRect().width
      const naturalWidth = el.offsetWidth
      if (naturalWidth > 0 && targetWidth > 0) {
        setScale(targetWidth / naturalWidth)
      }
    }
    measure()
    window.addEventListener('resize', measure)
    const id = window.setTimeout(measure, 200)
    if (document.fonts) document.fonts.ready.then(measure)
    return () => {
      window.removeEventListener('resize', measure)
      window.clearTimeout(id)
    }
  }, [word, targetRef])

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 'calc(4vh + env(safe-area-inset-bottom))',
        zIndex: 70,
        mixBlendMode: 'difference',
        pointerEvents: 'none',
        display: 'flex',
        justifyContent: 'center',
      }}
      aria-hidden
    >
      <span
        ref={ref}
        className="font-display"
        style={{
          fontWeight: 700,
          fontSize: 'min(14.25vw, 11.25rem)',
          letterSpacing: '-0.04em',
          lineHeight: 0.82,
          color: '#ffffff',
          whiteSpace: 'nowrap',
          transform: `scale(${scale || 1})`,
          transformOrigin: 'center bottom',
          opacity: word && scale ? 1 : 0,
          transition: 'opacity 400ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {word ?? ''}
      </span>
    </div>
  )
}
