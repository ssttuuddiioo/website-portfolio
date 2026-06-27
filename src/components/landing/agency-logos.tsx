'use client'

import { motion, type MotionValue } from 'framer-motion'
import { INK } from './landing-theme'

/**
 * Credibility row pinned to the bottom of the landing/about frame on the
 * /agency page. Entries with an `src` render a monochrome brand SVG (sourced
 * from simple-icons); the rest fall back to a styled wordmark so the strip is
 * always complete. Opacity is scroll-driven (shares the about moment's fade),
 * so the row appears as the studio splits and reverses out on scroll-up.
 */
const LOGOS: Array<{ name: string; src?: string; svgHeight?: number }> = [
  { name: 'New Museum' },
  { name: 'Hypebeast' },
  { name: 'Hope Hydration' },
  { name: 'Civic' },
  { name: 'Intel', src: '/logos/agency/intel.svg' },
  { name: 'Dolby', src: '/logos/agency/dolby.svg' },
  { name: 'HBO', src: '/logos/agency/hbo.svg' },
  { name: 'Netflix', src: '/logos/agency/netflix.svg' },
  { name: 'Invisible North' },
  { name: 'Giant Spoon' },
]

export function AgencyLogos({ opacity }: { opacity: MotionValue<number> }) {
  return (
    <motion.div
      aria-hidden
      style={{
        opacity,
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 'max(4.5rem, 8vh)',
        zIndex: 72,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.1rem',
        padding: '0 var(--gutter, 1.5rem)',
      }}
    >
      <span
        className="font-mono"
        style={{
          fontSize: '0.62rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(10,10,10,0.45)',
        }}
      >
        Trusted by
      </span>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          columnGap: 'clamp(1.5rem, 4vw, 3rem)',
          rowGap: '1.1rem',
          maxWidth: '760px',
        }}
      >
        {LOGOS.map((logo) =>
          logo.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={logo.name}
              src={logo.src}
              alt={logo.name}
              style={{
                height: logo.svgHeight ?? 20,
                width: 'auto',
                opacity: 0.55,
                filter: 'grayscale(1)',
              }}
            />
          ) : (
            <span
              key={logo.name}
              className="font-display"
              style={{
                fontWeight: 700,
                fontSize: 'clamp(0.8rem, 1.4vw, 1rem)',
                letterSpacing: '0.02em',
                color: INK,
                opacity: 0.5,
                whiteSpace: 'nowrap',
              }}
            >
              {logo.name}
            </span>
          ),
        )}
      </div>
    </motion.div>
  )
}
