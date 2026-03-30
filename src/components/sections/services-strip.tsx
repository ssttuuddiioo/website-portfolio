'use client'

import { motion } from 'framer-motion'

const SERVICES = [
  'Experiential Direction',
  'Lighting Design',
  'Custom Software',
  'Creative Technology',
  'Motion Design',
  'Consulting',
  'Mentoring',
]

export function ServicesStrip() {
  return (
    <section
      className="border-y border-border"
      style={{
        maxWidth: 'var(--max-width)',
        margin: '0 auto',
        padding: 'var(--spacing-4xl) var(--gutter)',
      }}
    >
      <div className="grid grid-cols-4 md:grid-cols-12 gap-6">
        <motion.p
          className="col-span-4 md:col-span-2 font-mono text-text-tertiary"
          style={{
            fontSize: 'var(--text-xs)',
            letterSpacing: 'var(--tracking-wider)',
            textTransform: 'uppercase',
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Capabilities
        </motion.p>

        <div className="col-span-4 md:col-span-10 flex flex-wrap gap-x-2 gap-y-1">
          {SERVICES.map((service, i) => (
            <motion.span
              key={service}
              className="font-display text-text-primary"
              style={{
                fontSize: 'clamp(1.5rem, 4vw, var(--text-4xl))',
                lineHeight: 'var(--leading-snug)',
                letterSpacing: 'var(--tracking-tight)',
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
                delay: i * 0.05,
              }}
            >
              {service}
              {i < SERVICES.length - 1 && (
                <span className="text-text-tertiary">,{' '}</span>
              )}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  )
}
