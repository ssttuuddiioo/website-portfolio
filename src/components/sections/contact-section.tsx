'use client'

import { motion } from 'framer-motion'

const SOCIAL_LINKS = [
  { href: 'https://instagram.com/studiostudio.nyc', label: 'Instagram' },
  { href: 'https://vimeo.com/studiostudio', label: 'Vimeo' },
  { href: 'https://github.com/studiostudio', label: 'GitHub' },
  { href: 'https://linkedin.com/in/pablognecco', label: 'LinkedIn' },
]

export function ContactSection() {
  return (
    <section
      style={{
        maxWidth: 'var(--max-width)',
        margin: '0 auto',
        padding: 'var(--spacing-section) var(--gutter)',
      }}
    >
      <div className="grid grid-cols-4 md:grid-cols-12 gap-6">
        <motion.div
          className="col-span-4 md:col-span-8"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <p
            className="font-mono text-text-tertiary mb-6"
            style={{
              fontSize: 'var(--text-xs)',
              letterSpacing: 'var(--tracking-wider)',
              textTransform: 'uppercase',
            }}
          >
            Let&apos;s work together
          </p>

          <a
            href="mailto:hello@studiostudio.nyc"
            className="font-display font-light text-text-primary hover:text-accent transition-colors block"
            style={{
              fontSize: 'clamp(2rem, 7vw, var(--text-5xl))',
              lineHeight: 'var(--leading-tight)',
              letterSpacing: 'var(--tracking-tight)',
              transitionDuration: 'var(--duration-fast)',
            }}
          >
            hello@studiostudio.nyc
          </a>
        </motion.div>

        <motion.div
          className="col-span-4 md:col-span-3 md:col-start-10 flex flex-row md:flex-col gap-6 md:justify-end"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-text-secondary hover:text-accent transition-colors"
              style={{
                fontSize: 'var(--text-sm)',
                letterSpacing: 'var(--tracking-wide)',
                transitionDuration: 'var(--duration-fast)',
              }}
            >
              {link.label}
            </a>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
