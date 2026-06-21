'use client'

import { motion } from 'framer-motion'
import { INK } from './landing-theme'

const ABOUT_PARAGRAPHS = [
  "Studio Studio is a creative practice working somewhere between art, tech, and design. Our favorite work comes from mixing things that don't usually meet, where the boundaries between fields start to blur.",
  "Clients come to us with a sense of what they want their guests to feel, and we build something creative around it, collaboratively. Most of this lives in activations and exhibitions, using projection mapping, immersive theater, spatialized audio, or interactive installations. But it doesn't always stay in that lane: The constant is the approach, not the canvas.",
  "We got our start in the inaugural cohort at NEW INC, the New Museum's art and technology incubator, in 2015, and have since taken part in several residencies and mentorship programs. We're always looking for projects that expand our horizons.",
]

/** About copy that sits in the band beneath the pinned wordmark. */
export function AboutSection() {
  return (
    <section
      id="about"
      style={{
        minHeight: '100vh',
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '30vh var(--gutter, 1.5rem) 0',
      }}
    >
      <div
        style={{
          marginLeft: 'clamp(7rem, 14%, 12rem)',
          maxWidth: '75ch',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.6rem',
        }}
      >
        {ABOUT_PARAGRAPHS.map((text, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
              delay: i * 0.1,
            }}
            className="font-display"
            style={{
              fontWeight: 600,
              fontSize: 'clamp(1.05rem, 2vw, 1.55rem)',
              lineHeight: 1.4,
              color: INK,
            }}
          >
            {text}
          </motion.p>
        ))}
      </div>
    </section>
  )
}
