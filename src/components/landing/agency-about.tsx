'use client'

import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { INK, ink } from './landing-theme'

const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const

/**
 * The studio statement: who the studio is and what it does, side by side across
 * a hairline at the bottom of the first screen, so it reads as the line you land
 * on rather than something to scroll for.
 *
 * Both halves are set line by line rather than as paragraphs that reflow: each
 * line is its own nowrap block, so they always break where they were written to.
 * On a container too narrow to hold the pair, they stack and the second half is
 * allowed to wrap.
 */
const STATEMENT = ['Studio Studio is an art', 'and technology studio.']

const SUPPORT = [
  'Experiential direction, lighting design, and',
  'custom software, made in Brooklyn, New York.',
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

  const text = {
    fontWeight: 400,
    fontSize: '1em',
    lineHeight: 1.3,
    color: INK,
    margin: 0,
  } as const

  const lines = (copy: string[]) =>
    copy.map((line, i) => (
      <span key={line} className="about-line">
        {line}
        {/* Keeps the read-aloud sentence from running its lines together. */}
        {i < copy.length - 1 ? ' ' : null}
      </span>
    ))

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
          container-type: inline-size;
        }
        /* The pair runs about 36em wide side by side, so the size is held to
           what fits the container on one row; on a wide screen the clamp wins. */
        .about-row {
          display: flex;
          align-items: center;
          gap: 1.1em;
          font-size: min(clamp(2rem, 3vw, 3rem), 2.7cqw);
        }
        /* One line, one block, and never a wrap. */
        .about-line {
          display: block;
          white-space: nowrap;
        }
        /* The hairline runs a little past both halves, top and bottom. */
        .about-rule {
          align-self: stretch;
          flex: none;
          width: 1px;
          margin: -0.6em 0;
          background: ${ink(0.7)};
        }
        @container (max-width: 900px) {
          .about-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.9em;
            font-size: min(2rem, 7.5cqw);
          }
          .about-rule {
            align-self: auto;
            width: 3rem;
            height: 1px;
            margin: 0;
          }
          .about-support .about-line {
            display: inline;
            white-space: normal;
          }
        }
      `}</style>

      <div className="about-row font-display">
        <motion.h2 variants={item} style={text}>
          {lines(STATEMENT)}
        </motion.h2>
        <motion.span variants={item} className="about-rule" aria-hidden />
        <motion.p variants={item} className="about-support" style={text}>
          {lines(SUPPORT)}
        </motion.p>
      </div>
    </motion.div>
  )
}
