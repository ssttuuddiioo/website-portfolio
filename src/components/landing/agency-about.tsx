'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { INK, BLUE } from './landing-theme'

const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const

/** Where the studio works from, with each city's live local time. */
const CLOCKS = [
  { city: 'NYC', tz: 'America/New_York' },
  { city: 'London', tz: 'Europe/London' },
  { city: 'Bogotá', tz: 'America/Bogota' },
]

/**
 * Live local time per city, 12-hour with AM/PM. Starts as placeholders so
 * server and
 * client render the same markup, then ticks on the client every 15s — the
 * state only changes when a displayed minute actually rolls over.
 */
function useCityTimes() {
  const [times, setTimes] = useState(() => CLOCKS.map(() => '--:-- --'))

  useEffect(() => {
    const read = () =>
      CLOCKS.map((c) =>
        new Intl.DateTimeFormat('en-US', {
          timeZone: c.tz,
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }).format(new Date()),
      )
    const tick = () =>
      setTimes((prev) => {
        const next = read()
        return prev.join() === next.join() ? prev : next
      })
    tick()
    const id = window.setInterval(tick, 15000)
    return () => window.clearInterval(id)
  }, [])

  return times
}

/**
 * About block, under the hero fold. Three text columns on the same grid the
 * selected-work rows use (0.95fr / 1fr / 0.34fr, matching gutters and 900px
 * breakpoint), so the column edges run straight through the page. Scale does
 * the work: the value prop set large on the left, the ask in the middle, the
 * studio's cities and their live local time on the right. One call to action
 * per column — /about on the left, /contact in the middle, none on the right —
 * and each sits last in its column. Stacks on mobile.
 */
export function AgencyAbout() {
  const reduce = useReducedMotion()
  const times = useCityTimes()

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
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
    >
      <style>{`
        .about-grid {
          width: 100%;
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 var(--gutter, 1.5rem);
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: clamp(2.25rem, 6vw, 3rem);
          align-items: start;
        }
        .about-col { min-width: 0; }
        .about-link {
          color: ${INK};
          text-decoration: underline;
          text-underline-offset: 0.16em;
          text-decoration-thickness: 1.5px;
          transition: color 200ms;
        }
        .about-link:hover { color: ${BLUE}; }
        .about-pill {
          display: inline-flex;
          align-items: center;
          padding: 0.65rem 1.35rem;
          border: 1px solid rgba(10,10,10,0.25);
          border-radius: 999px;
          color: ${INK};
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          white-space: nowrap;
          transition: border-color 200ms, color 200ms;
        }
        .about-pill:hover { border-color: ${BLUE}; color: ${BLUE}; }
        .about-clock {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.6rem 0;
          font-size: 0.72rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(10,10,10,0.45);
        }
        .about-clock:first-child { padding-top: 0; }
        .about-clock + .about-clock {
          border-top: 1px dashed rgba(10,10,10,0.18);
        }
        @media (min-width: 900px) {
          .about-grid {
            grid-template-columns: minmax(0, 0.95fr) minmax(0, 1fr) minmax(0, 0.34fr);
            gap: clamp(2rem, 4vw, 4rem);
          }
        }
      `}</style>

      {/* Left — the value prop and one way in. */}
      <div
        className="about-col"
        style={{ display: 'flex', flexDirection: 'column', gap: '1.9rem' }}
      >
        <motion.h2
          variants={item}
          className="font-display"
          style={{
            fontWeight: 700,
            fontSize: 'clamp(2rem, 4.6vw, 3.9rem)',
            lineHeight: 0.98,
            letterSpacing: '-0.04em',
            color: INK,
            margin: 0,
          }}
        >
          We make interactive work for rooms, screens, and stages.
        </motion.h2>

        <motion.div variants={item}>
          <Link href="/about" className="about-pill font-mono">
            About the studio
          </Link>
        </motion.div>
      </div>

      {/* Center — the ask, how it gets made, one way in. */}
      <div
        className="about-col"
        style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
      >
        <motion.p
          variants={item}
          className="font-display"
          style={{
            fontWeight: 500,
            fontSize: 'clamp(1.25rem, 1.95vw, 1.6rem)',
            lineHeight: 1.22,
            letterSpacing: '-0.02em',
            color: INK,
            margin: 0,
            maxWidth: '20ch',
          }}
        >
          You have the idea. We take it from concept to execution.
        </motion.p>

        <motion.p
          variants={item}
          className="font-display"
          style={{
            fontWeight: 500,
            fontSize: 'clamp(0.95rem, 1.15vw, 1.05rem)',
            lineHeight: 1.5,
            color: 'rgba(10,10,10,0.7)',
            margin: 0,
            maxWidth: '38ch',
          }}
        >
          Direction, design, and code in one studio. We build it, install it,
          and run it live.
        </motion.p>

        <motion.p
          variants={item}
          className="font-display"
          style={{
            fontWeight: 500,
            fontSize: 'clamp(1.25rem, 1.95vw, 1.6rem)',
            lineHeight: 1.22,
            letterSpacing: '-0.02em',
            color: INK,
            margin: '0.3rem 0 0',
          }}
        >
          <Link href="/contact" className="about-link">
            Let&apos;s talk
          </Link>
          .
        </motion.p>
      </div>

      {/* Right — the studio's three cities and their local time. */}
      <div className="about-col">
        {CLOCKS.map((c, i) => (
          <motion.div key={c.city} variants={item} className="about-clock font-mono">
            <span>{c.city}</span>
            <span
              suppressHydrationWarning
              style={{ color: INK, fontVariantNumeric: 'tabular-nums' }}
            >
              {times[i]}
            </span>
          </motion.div>
        ))}
      </div>

    </motion.div>
  )
}
