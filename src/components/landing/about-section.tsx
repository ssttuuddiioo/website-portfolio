'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useTransform, type MotionValue } from 'framer-motion'
import { INK, BLUE } from './landing-theme'

export const ABOUT_TITLE = 'We build experiences people remember.'
export const ABOUT_SUBTITLE =
  'Studio Studio works across art, tech, and design, partnering with brands, agencies, and institutions on pop-ups, exhibitions, and installations that mix disciplines to create unique moments.'
export const ABOUT_IMAGE = '/landing/opt/installation-33.avif'

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

/**
 * About copy as a fixed, page-centered overlay. Its opacity / blur / drift
 * are scroll-driven (see LandingExperience): it fades in and un-blurs as the
 * wordmark separates and blurs, holds, then fades and drifts out as the
 * opaque scrim beneath it dissolves to reveal the work. Sits at z-index 72 —
 * above the scrim (z71) and wordmark (z70) — so it reads on a fully solid,
 * page-color ground with no blurred wordmark bleeding through.
 */
export function AboutSection({
  opacity,
  filter,
  y,
}: {
  opacity: MotionValue<number>
  filter: MotionValue<string>
  y: MotionValue<number>
}) {
  // The overlay is pointer-events:none so it never blocks the scroll/work
  // beneath. Re-enable clicks on the CTA only while the copy is actually legible
  // (near full opacity) — otherwise the faded button would be an invisible
  // click-catcher over the work.
  const ctaPointer = useTransform(opacity, (o) => (o > 0.6 ? 'auto' : 'none'))
  return (
    <motion.div
      style={{
        opacity,
        filter,
        y,
        position: 'fixed',
        inset: 0,
        zIndex: 72,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 var(--gutter, 1.5rem)',
      }}
    >
      <style>{`
        @media (max-width: 1023px) {
          .about-copy--full { grid-template-columns: 1fr !important; gap: 1.75rem !important; max-width: min(46ch, 90vw) !important; }
          .about-copy--full .about-title { font-size: clamp(2rem, 7vw, 3rem) !important; }
          .about-copy--full .about-subtitle { font-size: clamp(1rem, 3.4vw, 1.4rem) !important; }
        }
      `}</style>
      <div
        className="about-copy--full"
        style={{
          maxWidth: 'min(960px, 92vw)',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '0.85fr 1fr',
          alignItems: 'center',
          gap: 'clamp(2rem, 4vw, 3.5rem)',
          textAlign: 'left',
        }}
      >
        {/* Image — left on desktop, top on mobile. */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: 4 / 5,
            overflow: 'hidden',
            borderRadius: '20px',
            background: 'rgba(232, 228, 223, 0.04)',
          }}
        >
          <Image
            src={ABOUT_IMAGE}
            alt="Studio Studio installation work"
            fill
            sizes="(min-width: 1024px) 360px, 90vw"
            className="object-cover"
          />
        </div>

        {/* Copy. */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          <h2
            className="font-display about-title"
            style={{
              fontWeight: 700,
              fontSize: 'clamp(1.6rem, 3.4vw, 3rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              color: INK,
              margin: 0,
            }}
          >
            {ABOUT_TITLE}
          </h2>
          <p
            className="font-display about-subtitle"
            style={{
              fontWeight: 500,
              fontSize: 'clamp(0.85rem, 1.5vw, 1.2rem)',
              lineHeight: 1.5,
              color: INK,
              opacity: 0.75,
              margin: 0,
            }}
          >
            {ABOUT_SUBTITLE}
          </p>

          {/* Learn More → the full /about page. pointer-events is gated to the
              copy's legible window so it's only clickable while on screen. */}
          <motion.div style={{ pointerEvents: ctaPointer, marginTop: '0.4rem' }}>
            <Link
              href="/about"
              className="font-mono"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                padding: '0.85rem 1.9rem',
                background: BLUE,
                color: '#ffffff',
                borderRadius: '999px',
                fontSize: '0.74rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                transition: `opacity 200ms ${EASE}`,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Learn More
              <span aria-hidden>→</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
