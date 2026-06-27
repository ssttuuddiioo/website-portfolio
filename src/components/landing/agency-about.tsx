'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { INK, BLUE } from './landing-theme'

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'
const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const

/**
 * About block, under the hero fold: a project image on the left and the studio
 * value-prop (title + subtitle + two CTAs) on the right. Reveals on scroll —
 * the image rises as one piece, the copy lines stagger in. Stacks on mobile
 * (image first, copy below).
 */
export function AgencyAbout() {
  const reduce = useReducedMotion()

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.1 } },
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
    <div
      className="grid grid-cols-1 md:grid-cols-2"
      style={{
        width: '100%',
        maxWidth: '1440px',
        margin: '0 auto',
        gap: 'clamp(2rem, 5vw, 4.5rem)',
        alignItems: 'center',
      }}
    >
      {/* Image — left on desktop, top on mobile. */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: reduce ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: 4 / 5,
          overflow: 'hidden',
          borderRadius: '20px',
          background: 'rgba(10,10,10,0.04)',
        }}
      >
        <Image
          src="/landing/opt/space-labs.avif"
          alt="Studio Studio installation work"
          fill
          sizes="(min-width: 768px) 45vw, 90vw"
          className="object-cover"
        />
      </motion.div>

      {/* Copy + CTAs. */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '1.6rem',
          textAlign: 'left',
        }}
      >
        <motion.h1
          variants={item}
          className="font-display"
          style={{
            fontWeight: 700,
            fontSize: 'clamp(1.6rem, 3vw, 2.7rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.035em',
            color: INK,
            margin: 0,
          }}
        >
          We make interactive work for rooms, screens, and stages.
        </motion.h1>

        <motion.p
          variants={item}
          className="font-display"
          style={{
            fontWeight: 500,
            fontSize: 'clamp(1.1rem, 1.8vw, 1.4rem)',
            lineHeight: 1.5,
            color: 'rgba(10,10,10,0.7)',
            margin: 0,
            maxWidth: '40ch',
          }}
        >
          Studio Studio partners with brands, agencies, and institutions on
          installations, custom software, and lighting design.
        </motion.p>

        <motion.div variants={item} style={{ marginTop: '0.4rem' }}>
          <Link
            href="/about"
            className="font-mono"
            style={{
              display: 'inline-block',
              padding: '0.9rem 2rem',
              background: BLUE,
              color: '#ffffff',
              border: '1px solid ' + BLUE,
              borderRadius: '999px',
              fontSize: '0.76rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: `opacity 200ms ${EASE}`,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Learn More
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
