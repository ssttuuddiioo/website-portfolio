'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

export function HeroSection() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const y = useTransform(scrollYProgress, [0, 0.7], [0, -120])

  const line1 = {
    hidden: { y: '110%', rotateZ: 2 },
    visible: { y: '0%', rotateZ: 0 },
  }

  return (
    <section
      ref={ref}
      className="relative flex flex-col justify-end overflow-hidden"
      style={{
        minHeight: '100svh',
        maxWidth: 'var(--max-width)',
        margin: '0 auto',
        padding: '0 var(--gutter) var(--spacing-3xl)',
      }}
    >
      <motion.div style={{ opacity, y }}>
        <div className="grid grid-cols-4 md:grid-cols-12 gap-6">
          {/* Title — cols 1-8 */}
          <div className="col-span-4 md:col-span-8">
            <div className="overflow-hidden">
              <motion.h1
                className="font-display font-light text-text-primary"
                style={{
                  fontSize: 'clamp(3.5rem, 14vw, 10rem)',
                  lineHeight: 0.9,
                  letterSpacing: '-0.04em',
                }}
                variants={line1}
                initial="hidden"
                animate="visible"
                transition={{
                  duration: 1,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.2,
                }}
              >
                Studio
              </motion.h1>
            </div>
            <div className="overflow-hidden">
              <motion.h1
                className="font-display font-light text-text-primary"
                style={{
                  fontSize: 'clamp(3.5rem, 14vw, 10rem)',
                  lineHeight: 0.9,
                  letterSpacing: '-0.04em',
                }}
                variants={line1}
                initial="hidden"
                animate="visible"
                transition={{
                  duration: 1,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.35,
                }}
              >
                Studio<span className="text-accent">.</span>
              </motion.h1>
            </div>

            {/* Tagline */}
            <motion.p
              className="font-display text-text-secondary mt-8"
              style={{
                fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
                lineHeight: 'var(--leading-snug)',
                maxWidth: '32ch',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.8,
              }}
            >
              Experiential direction, creative technology,
              and lighting design from Brooklyn.
            </motion.p>
          </div>

          {/* Metadata — cols 9-12 */}
          <motion.div
            className="col-span-4 md:col-span-4 flex flex-row md:flex-col justify-between md:justify-end gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <span
              className="font-mono text-text-tertiary"
              style={{
                fontSize: 'var(--text-xs)',
                letterSpacing: 'var(--tracking-wider)',
                textTransform: 'uppercase',
              }}
            >
              Pablo Gnecco
            </span>
            <span
              className="font-mono text-text-tertiary"
              style={{
                fontSize: 'var(--text-xs)',
                letterSpacing: 'var(--tracking-wider)',
                textTransform: 'uppercase',
              }}
            >
              Brooklyn, NY
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 right-8 flex items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.5 }}
      >
        <span
          className="font-mono text-text-tertiary"
          style={{
            fontSize: 'var(--text-xs)',
            letterSpacing: 'var(--tracking-wider)',
            textTransform: 'uppercase',
          }}
        >
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: [0.22, 1, 0.36, 1] }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-text-tertiary">
            <path d="M7 1v12M2 7l5 6 5-6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  )
}
