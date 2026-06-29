'use client'

import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { LandingSidebar, SocialRow } from './landing-sidebar'
import { SubscribeForm } from './subscribe-form'
import { INK, BG, BLUE } from './landing-theme'
import type { Idea } from '@/lib/ideas'

const EASE = [0.22, 1, 0.36, 1] as const
const GUTTER = 'var(--gutter, 1.5rem)'
/** Reading column — narrow enough to keep the body a comfortable measure. */
const COLUMN = '760px'

/* ---- small shared pieces (mirrors about-experience) --------------------- */

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span
      className="font-mono"
      style={{
        display: 'block',
        fontSize: '0.7rem',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: 'rgba(10,10,10,0.5)',
      }}
    >
      {children}
    </span>
  )
}

function Reveal({
  children,
  delay = 0,
  style,
}: {
  children: ReactNode
  delay?: number
  style?: React.CSSProperties
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: reduce ? 0 : 0.7,
        ease: EASE,
        delay: reduce ? 0 : delay,
      }}
      style={style}
    >
      {children}
    </motion.div>
  )
}

/* ---- page --------------------------------------------------------------- */

/**
 * /ideas/[slug] detail template. A single long reading column: category
 * eyebrow, title, subtitle, ~1,000 characters of body, then the hero image —
 * followed by a link onward to the next idea and the shared footer.
 */
export function IdeaExperience({
  idea,
  next,
}: {
  idea: Idea
  next: Idea | null
}) {
  const paragraphs = idea.body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)

  return (
    <>
      {/* inPage={false} → nav links route back to the homepage's /#sections. */}
      <LandingSidebar active="ideas" inPage={false} />

      <main style={{ position: 'relative', zIndex: 3 }}>
        {/* Top row — wordmark home + a way back to the index. */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: `clamp(1.5rem, 4vw, 2.5rem) ${GUTTER} 0`,
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{ width: '100%', maxWidth: COLUMN }}
          >
            <Link
              href="/"
              className="font-display"
              style={{
                fontWeight: 700,
                fontSize: '0.95rem',
                letterSpacing: '0.02em',
                color: INK,
                textDecoration: 'none',
              }}
            >
              Studio Studio
            </Link>
            <Link
              href="/#ideas"
              className="font-mono"
              style={{
                fontSize: '0.72rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'rgba(10,10,10,0.55)',
                textDecoration: 'none',
              }}
            >
              ← All ideas
            </Link>
          </div>
        </div>

        <article
          style={{
            padding: `clamp(3rem, 8vw, 6rem) ${GUTTER} clamp(2rem, 5vw, 4rem)`,
          }}
        >
          <div style={{ width: '100%', maxWidth: COLUMN, margin: '0 auto' }}>
            {/* Title block */}
            <Reveal>
              <Eyebrow>{idea.category}</Eyebrow>
            </Reveal>
            <Reveal delay={0.05}>
              <h1
                className="font-display"
                style={{
                  fontWeight: 700,
                  fontSize: 'clamp(2.1rem, 6vw, 3.8rem)',
                  lineHeight: 1.04,
                  letterSpacing: '-0.03em',
                  color: INK,
                  margin: '1.25rem 0 0',
                }}
              >
                {idea.title}
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p
                className="font-display"
                style={{
                  fontWeight: 500,
                  fontSize: 'clamp(1.1rem, 2vw, 1.5rem)',
                  lineHeight: 1.4,
                  color: 'rgba(10,10,10,0.7)',
                  margin: '1.5rem 0 0',
                }}
              >
                {idea.subtitle}
              </p>
            </Reveal>

            {/* Body — ~1,000 characters, split on blank lines. */}
            <Reveal delay={0.15} style={{ marginTop: 'clamp(2rem, 4vw, 3rem)' }}>
              <div
                className="font-display"
                style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}
              >
                {paragraphs.map((para, i) => (
                  <p
                    key={i}
                    style={{
                      margin: 0,
                      fontSize: 'clamp(1.05rem, 1.5vw, 1.2rem)',
                      lineHeight: 1.65,
                      color: 'rgba(10,10,10,0.82)',
                    }}
                  >
                    {para}
                  </p>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Hero image — fills the reading column. */}
          <Reveal delay={0.1} style={{ marginTop: 'clamp(2.5rem, 6vw, 4.5rem)' }}>
            <div style={{ width: '100%', maxWidth: COLUMN, margin: '0 auto' }}>
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: 3 / 2,
                  overflow: 'hidden',
                  borderRadius: '20px',
                  background: idea.dark ? '#0a0a0a' : 'rgba(10,10,10,0.04)',
                }}
              >
                <Image
                  src={idea.image}
                  alt={idea.title}
                  fill
                  sizes={`(min-width: 800px) ${COLUMN}, 92vw`}
                  priority
                  className="object-cover"
                />
              </div>
            </div>
          </Reveal>
        </article>

        {/* ---- Next idea + footer ------------------------------------------ */}
        <footer
          style={{
            padding: `clamp(3rem, 7vw, 6rem) ${GUTTER} clamp(8rem, 14vh, 11rem)`,
          }}
        >
          {next && (
            <Reveal>
              <div style={{ width: '100%', maxWidth: COLUMN, margin: '0 auto' }}>
                <Eyebrow>Next idea</Eyebrow>
                <Link
                  href={`/ideas/${next.slug}`}
                  className="font-display group"
                  style={{
                    display: 'block',
                    marginTop: '0.9rem',
                    fontWeight: 700,
                    fontSize: 'clamp(1.6rem, 4vw, 2.6rem)',
                    lineHeight: 1.08,
                    letterSpacing: '-0.03em',
                    color: INK,
                    textDecoration: 'none',
                  }}
                >
                  {next.title}
                  <span
                    className="group-hover:opacity-70"
                    style={{
                      display: 'inline-block',
                      marginLeft: '0.5rem',
                      color: BLUE,
                      transition: 'opacity 200ms',
                    }}
                  >
                    →
                  </span>
                </Link>
              </div>
            </Reveal>
          )}

          {/* Subscribe — a cobalt moment to keep people close. */}
          <Reveal style={{ marginTop: 'clamp(3.5rem, 9vw, 7rem)' }}>
            <div style={{ width: '100%', maxWidth: COLUMN, margin: '0 auto' }}>
              <div
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '24px',
                  background: BLUE,
                  color: BG,
                  padding: 'clamp(2rem, 5vw, 3.5rem)',
                }}
              >
                <div style={{ position: 'relative' }}>
                  <span
                    className="font-mono"
                    style={{
                      display: 'block',
                      fontSize: '0.7rem',
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.7)',
                    }}
                  >
                    The list
                  </span>
                  <h2
                    className="font-display"
                    style={{
                      margin: '1rem 0 0',
                      fontWeight: 700,
                      fontSize: 'clamp(1.7rem, 4.2vw, 2.9rem)',
                      lineHeight: 1.05,
                      letterSpacing: '-0.03em',
                      color: BG,
                      maxWidth: '16ch',
                    }}
                  >
                    Liked this? Get the next one in your inbox.
                  </h2>
                  <p
                    className="font-display"
                    style={{
                      margin: '1.1rem 0 1.9rem',
                      fontSize: 'clamp(1rem, 1.6vw, 1.15rem)',
                      lineHeight: 1.55,
                      color: 'rgba(255,255,255,0.82)',
                      maxWidth: '42ch',
                    }}
                  >
                    New projects, fresh experiments, and the occasional
                    half-finished thought — sent only when there&apos;s something
                    worth showing. No spam, unsubscribe anytime.
                  </p>
                  <SubscribeForm onDark />
                </div>
              </div>
            </div>
          </Reveal>

          {/* Footer band — social over copyright, centered. */}
          <div
            className="flex flex-col items-center"
            style={{
              width: '100%',
              maxWidth: COLUMN,
              margin: '0 auto',
              marginTop: 'clamp(4rem, 10vw, 8rem)',
              gap: '1.5rem',
            }}
          >
            <SocialRow size={24} gap="1.75rem" horizontal />
            <span
              className="font-mono"
              style={{
                color: INK,
                opacity: 0.55,
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              © 2026 Studio Studio · Brooklyn, NY
            </span>
          </div>
        </footer>
      </main>

      {/* Background tint behind everything (matches the home shell). */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          background: BG,
          pointerEvents: 'none',
        }}
      />
    </>
  )
}
