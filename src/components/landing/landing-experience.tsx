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
import { LandingSidebar } from './landing-sidebar'
import { AboutSection } from './about-section'
import { ProjectIndex } from './project-index'
import { StudioParticles } from './studio-particles'
import { ContactForm } from './contact-form'
import { wordStyle } from './landing-theme'

const SPY_IDS = [
  'home',
  'about',
  'work',
  'services',
  'ideas',
  'stories',
  'contact',
]

const SECTION_WORDS: Record<string, string> = {
  work: 'WORK',
  services: 'SERVICES',
  ideas: 'IDEAS',
  stories: 'STORIES',
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

  const [active, setActive] = useState('home')

  // Scroll-spy: the section crossing the viewport center is active.
  useEffect(() => {
    const els = SPY_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    )
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: '-49% 0px -49% 0px', threshold: 0 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  // Lockup opens from a tight centered mark: grows, top rises to pin,
  // bottom mirrors down to the bottom edge of the frame.
  const wrapperScale = useTransform(scrollYProgress, [0, 0.55], [0.55, 1])
  const wrapperTransform = useMotionTemplate`scale(${wrapperScale})`

  const topVh = useTransform(scrollYProgress, [0, 0.5], [0, -32])
  const topTransform = useMotionTemplate`translateY(${topVh}vh)`

  const bottomVh = useTransform(scrollYProgress, [0, 0.5], [0, 32])
  const bottomTransform = useMotionTemplate`translateY(${bottomVh}vh) rotate(180deg)`

  // Big bottom word naming the current section as you scroll.
  const sectionWord = SECTION_WORDS[active] ?? null

  return (
    <>
      <CursorTrail rgb="10,10,10" />
      {/* Ambient particle field — back layer; all content sits on top. */}
      <StudioParticles />
      <LandingSidebar active={active} inPage />

      {/* Page content sits above the particle field. */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Scroll track = the home section; drives the lockup opening. */}
        <div id="home" ref={trackRef} style={{ height: '260vh' }} />

      {/* About — copy in the band between the wordmarks. */}
      <div ref={aboutRef}>
        <AboutSection />
      </div>

      {/* Work — the composed image scatter. */}
      <div id="work">
        <ProjectIndex />
      </div>

      {/* Services — blank placeholder (1000px) for now. */}
      <section id="services" style={{ height: '1000px' }} />

      {/* Ideas — blank placeholder (1000px) for now. */}
      <section id="ideas" style={{ height: '1000px' }} />

      {/* Stories — blank placeholder (1000px) for now. */}
      <section id="stories" style={{ height: '1000px' }} />

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
        <div className="landing-indent">
          {/* Contact form (Formspree) */}
          <ContactForm />
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
          <div className="flex flex-col items-center">
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

      {/* Big bottom word — names the current section, matched to STUDIO width. */}
      <BottomWord word={sectionWord} targetRef={topWordRef} />

      {/* Pinned copyright, bottom-right — appears once the section words do. */}
      <span
        className="font-mono"
        style={{
          position: 'fixed',
          right: 'max(10px, calc(var(--gutter, 1.5rem) + env(safe-area-inset-right) - 50px))',
          bottom: 'max(10px, calc(var(--gutter, 1.5rem) + env(safe-area-inset-bottom) - 50px))',
          zIndex: 70,
          mixBlendMode: 'difference',
          pointerEvents: 'none',
          fontSize: '0.7rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#ffffff',
          textAlign: 'right',
          opacity: sectionWord ? 1 : 0,
          transition: 'opacity 400ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        © 2026 Studio Studio · Brooklyn, NY
      </span>
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
          fontSize: 'min(19vw, 15rem)',
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
