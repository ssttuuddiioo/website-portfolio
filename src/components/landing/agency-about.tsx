'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { INK } from './landing-theme'

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
 * The studio's cities and their live local time, as a single row under the
 * statement. Set tight — this is a footnote to the statement, not a column.
 */
export function CityClocks() {
  const times = useCityTimes()

  return (
    <div className="city-clocks font-mono">
      <style>{`
        .city-clocks {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          /* Column spacing comes from the separator's own margin/padding so the
             hairline sits centred between two cities; row-gap only matters once
             the row wraps on a narrow screen. */
          column-gap: 0;
          row-gap: 0.55rem;
        }
        .city-clock {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
          font-size: 0.66rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(232, 228, 223, 0.45);
        }
        /* Hairline between cities, standing in for the stacked rows' rules. */
        .city-clock + .city-clock {
          border-left: 1px dashed rgba(232, 228, 223, 0.18);
          margin-left: clamp(1rem, 2.6vw, 2rem);
          padding-left: clamp(1rem, 2.6vw, 2rem);
        }
      `}</style>
      {CLOCKS.map((c, i) => (
        <div key={c.city} className="city-clock">
          <span>{c.city}</span>
          <span
            suppressHydrationWarning
            style={{ color: INK, fontVariantNumeric: 'tabular-nums' }}
          >
            {times[i]}
          </span>
        </div>
      ))}
    </div>
  )
}

/**
 * The studio statement, with the city clocks as a row beneath it. Sits at the
 * bottom of the first screen, so it reads as the line you land on rather than
 * something to scroll for.
 */
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
        .about-grid {
          width: 100%;
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 var(--gutter, 1.5rem);
        }
        /* Pulled left of the shared 1440 grid the work rows sit on, toward the
           STUDIO lockup's edge, so the statement doesn't read as indented on a
           wide display. Nudged with position/left rather than a transform:
           this is a Framer motion element, and a CSS transform would fight the
           reveal. The shift is the asked-for 150px wherever the slack exists,
           clamped so the type never comes closer to the viewport edge than the
           lockup's own 40px margin — on a narrower desktop it simply lands
           short of the full 150px, and at/below 1440 it stays put.
           Measured in % (the containing block), not vw, so it shares a basis
           with the margin:auto centering above — and with the hero trail's
           caption, which reuses this same expression to land on the statement's
           edge when it stands in for it at the fold. */
        .about-grid {
          position: relative;
          left: calc(
            -1 *
              min(
                150px,
                max(0px, (100% - 1440px) / 2 + var(--gutter, 1.5rem) - 40px)
              )
          );
        }
        /* Full width while the statement is the only thing on the line;
           60% of the grid once there is room for it to sit as a column. */
        .about-statement { max-width: 100%; }
        @media (min-width: 900px) {
          .about-statement { max-width: 60%; }
        }
      `}</style>

      <motion.h2
        variants={item}
        className="about-statement font-display"
        style={{
          fontWeight: 700,
          fontSize: 'clamp(2.1rem, 5vw, 4.4rem)',
          lineHeight: 0.98,
          letterSpacing: '-0.04em',
          color: INK,
          margin: 0,
        }}
      >
        Studio Studio is a creative technology practice in Brooklyn, NY
      </motion.h2>

      <motion.div
        variants={item}
        style={{ marginTop: 'clamp(1.6rem, 4vh, 2.75rem)' }}
      >
        <CityClocks />
      </motion.div>
    </motion.div>
  )
}
