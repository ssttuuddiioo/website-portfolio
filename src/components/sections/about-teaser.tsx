'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

export function AboutTeaser() {
  return (
    <section
      style={{
        maxWidth: 'var(--max-width)',
        margin: '0 auto',
        padding: 'var(--spacing-section) var(--gutter)',
      }}
    >
      <div className="grid grid-cols-4 md:grid-cols-12 gap-6">
        {/* Photo */}
        <motion.div
          className="col-span-4 md:col-span-5"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="aspect-[3/4] relative overflow-hidden" style={{ borderRadius: '2px' }}>
            <Image
              src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=800&q=80"
              alt="Pablo Gnecco"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 40vw, 100vw"
            />
          </div>
        </motion.div>

        {/* Bio */}
        <motion.div
          className="col-span-4 md:col-span-5 md:col-start-8 flex flex-col justify-center gap-8"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        >
          <p
            className="font-mono text-text-tertiary"
            style={{
              fontSize: 'var(--text-xs)',
              letterSpacing: 'var(--tracking-wider)',
              textTransform: 'uppercase',
            }}
          >
            About
          </p>

          <h2
            className="font-display font-light text-text-primary"
            style={{
              fontSize: 'clamp(1.5rem, 3.5vw, var(--text-3xl))',
              lineHeight: 'var(--leading-snug)',
              letterSpacing: 'var(--tracking-tight)',
            }}
          >
            Pablo Gnecco builds things that
            light up, respond, and tell stories.
          </h2>

          <p
            className="font-display text-text-secondary"
            style={{
              fontSize: 'var(--text-base)',
              lineHeight: 'var(--leading-relaxed)',
              maxWidth: '42ch',
            }}
          >
            Colombian-born, Brooklyn-based experiential director and creative
            technologist. Inaugural member of the New Museum&apos;s NEW INC,
            resident artist at Mana Contemporary, mentor at NYU ITP and
            Steve Jobs Archive.
          </p>

          <Link
            href="/about"
            className="font-mono text-accent hover:text-accent-hover transition-colors inline-flex items-center gap-3 group"
            style={{
              fontSize: 'var(--text-sm)',
              letterSpacing: 'var(--tracking-wide)',
              transitionDuration: 'var(--duration-fast)',
            }}
          >
            Full story
            <span className="inline-block transition-transform group-hover:translate-x-1" style={{ transitionDuration: 'var(--duration-fast)' }}>
              &rarr;
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
