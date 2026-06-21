'use client'

import { motion, type MotionValue } from 'framer-motion'
import { INK } from './landing-theme'

const ABOUT_PARAGRAPHS = [
  "Studio Studio is a creative practice working somewhere between art, tech, and design. Our favorite work comes from mixing things that don't usually meet, where the boundaries between fields start to blur.",
  "Clients come to us with a sense of what they want their guests to feel, and we build something creative around it, collaboratively. Most of this lives in activations and exhibitions, using projection mapping, immersive theater, spatialized audio, or interactive installations. But it doesn't always stay in that lane: The constant is the approach, not the canvas.",
  "We got our start in the inaugural cohort at NEW INC, the New Museum's art and technology incubator, in 2015, and have since taken part in several residencies and mentorship programs. We're always looking for projects that expand our horizons.",
]

/**
 * About copy as a fixed, page-centered overlay. Its opacity / blur / drift
 * are scroll-driven (see LandingExperience): it fades in and un-blurs as the
 * wordmark separates and blurs, holds, then fades and drifts out while the
 * work scrolls up over it. Sits below the page content (z-index) so the work
 * images come in on top of it — a parallax hand-off.
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
  return (
    <motion.div
      style={{
        opacity,
        filter,
        y,
        position: 'fixed',
        inset: 0,
        zIndex: 2,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 var(--gutter, 1.5rem)',
      }}
    >
      <div
        style={{
          maxWidth: 'min(52ch, 90vw)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2.5rem',
          textAlign: 'left',
        }}
      >
        {ABOUT_PARAGRAPHS.map((text, i) => (
          <p
            key={i}
            className="font-display"
            style={{
              fontWeight: 600,
              fontSize: 'clamp(0.74rem, 1.4vw, 1.08rem)',
              lineHeight: 1.5,
              color: INK,
              margin: 0,
            }}
          >
            {text}
          </p>
        ))}
      </div>
    </motion.div>
  )
}
