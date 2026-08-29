'use client'

import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { INK } from './landing-theme'

const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const

/**
 * The studio statement, as three fixed lines. Sits at the bottom of the first
 * screen, so it reads as the line you land on rather than something to scroll
 * for.
 *
 * The copy is set line by line rather than as a paragraph that reflows: each
 * line is its own nowrap block, so the statement is always three lines and
 * "Brooklyn, NY" can never break across two of them. Because the lines can't
 * wrap, the type is capped against the container's width as well as the
 * viewport's (see the font-size below) — otherwise a narrow window would push
 * the longest line straight past the gutter instead of reflowing it.
 */
const STATEMENT = [
  'Studio Studio is a',
  'creative technology',
  'practice in Brooklyn, NY',
]

export function AgencyAbout() {
  const reduce = useReducedMotion()

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.08 } },
  }
  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.8, ease: EASE_IN_OUT },
    },
  }

  return (
    <motion.div
      className="about-grid"
      // The hero image trail turns the first screen into a click target; the
      // statement is real copy sitting inside it, so it opts out.
      data-trail-ignore
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
    >
      <style>{`
        /* Pinned to the site edge, not to the 1440 content grid: the statement
           starts on exactly the line the STUDIO lockup starts on, at every
           width. (It used to ride the centred grid and pull left by up to
           150px, which matched the lockup only up to ~1690px and drifted right
           of it on anything wider.) */
        .about-grid {
          width: 100%;
          padding-left: calc(var(--edge) + env(safe-area-inset-left));
          padding-right: calc(var(--edge) + env(safe-area-inset-right));
          /* Makes this block the statement's sizing basis: 100cqw below is the
             width the three lines have to fit inside. */
          container-type: inline-size;
        }
        /* One line, one block, and never a wrap. */
        .about-line {
          display: block;
          white-space: nowrap;
        }
      `}</style>

      <motion.h2
        variants={item}
        className="about-statement font-display"
        style={{
          fontWeight: 700,
          /* The viewport-scaled size the trail's caption also uses, held down
             by the container: the longest line runs 12.2em in Futura, so at
             7.8cqw it always lands inside the block with room to spare — and
             above ~900px of container the clamp wins and the statement matches
             the caption that stands in for it exactly. */
          fontSize: 'min(clamp(2.1rem, 5vw, 4.4rem), 7.8cqw)',
          lineHeight: 0.98,
          letterSpacing: '-0.04em',
          color: INK,
          margin: 0,
        }}
      >
        {STATEMENT.map((line, i) => (
          <span key={line} className="about-line">
            {line}
            {/* Keeps the read-aloud sentence from running its lines together. */}
            {i < STATEMENT.length - 1 ? ' ' : null}
          </span>
        ))}
      </motion.h2>
    </motion.div>
  )
}
