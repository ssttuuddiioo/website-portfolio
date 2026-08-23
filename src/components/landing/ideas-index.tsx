'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { LandingSidebar } from './landing-sidebar'
import { SiteFooter } from './site-footer'
import { SubscribeForm } from './subscribe-form'
import { INK, BG, BLUE, PAPER } from './landing-theme'
import { IDEAS, IDEA_CATEGORIES, readMinutes, type Idea } from '@/lib/ideas'

const EASE = [0.22, 1, 0.36, 1] as const
const GUTTER = 'var(--gutter, 1.5rem)'
/** Wider than the reading column — a list wants room for a thumbnail. */
const COLUMN = '1040px'

/* ---- one post in the list ---------------------------------------------- */

function IdeaRow({ idea, index }: { idea: Idea; index: number }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: reduce ? 0 : 0.6, ease: EASE, delay: reduce ? 0 : Math.min(index * 0.05, 0.3) }}
    >
      <Link
        href={`/ideas/${idea.slug}`}
        className="idea-row"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(1.5rem, 4vw, 3.5rem)',
          padding: 'clamp(1.75rem, 4vw, 2.75rem) 0',
          borderBottom: '1px solid rgba(232, 228, 223, 0.12)',
          color: INK,
          textDecoration: 'none',
        }}
      >
        {/* Text */}
        <div style={{ flex: '1 1 auto', minWidth: 0 }}>
          <div
            className="font-mono"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              marginBottom: '0.9rem',
              fontSize: '0.7rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            <span style={{ color: BLUE, fontWeight: 600 }}>{idea.category}</span>
            <span aria-hidden style={{ color: 'rgba(232, 228, 223, 0.25)' }}>
              ·
            </span>
            <span style={{ color: 'rgba(232, 228, 223, 0.45)' }}>
              {readMinutes(idea.body)} min read
            </span>
          </div>

          <h2
            className="idea-row-title font-display"
            style={{
              margin: 0,
              fontWeight: 700,
              fontSize: 'clamp(1.55rem, 3.5vw, 2.5rem)',
              lineHeight: 1.1,
              letterSpacing: '-0.025em',
              transition: 'color 200ms',
            }}
          >
            {idea.title}
            <span
              aria-hidden
              className="idea-row-arrow"
              style={{
                display: 'inline-block',
                marginLeft: '0.5rem',
                color: BLUE,
                opacity: 0,
                transition: 'opacity 200ms, transform 200ms',
              }}
            >
              →
            </span>
          </h2>

          <p
            className="font-display"
            style={{
              margin: '0.9rem 0 0',
              maxWidth: '52ch',
              color: 'rgba(232, 228, 223, 0.6)',
              fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)',
              lineHeight: 1.55,
            }}
          >
            {idea.excerpt}
          </p>
        </div>

        {/* Thumbnail */}
        <div className="idea-row-thumb">
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '4 / 3',
              overflow: 'hidden',
              borderRadius: '10px',
              background: idea.dark ? 'rgba(232, 228, 223, 0.11)' : 'rgba(232, 228, 223, 0.04)',
            }}
          >
            <Image
              src={idea.image}
              alt={idea.title}
              fill
              sizes="240px"
              className="object-cover idea-row-img"
              style={{ transition: 'transform 700ms cubic-bezier(0.22, 1, 0.36, 1)' }}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

/* ---- page --------------------------------------------------------------- */

/**
 * /ideas index — a traditional editorial list rather than the homepage's tile
 * grid. Big header, category filter, then a stack of posts with a thumbnail,
 * category/read-time kicker, headline, and dek. Shared footer below.
 */
export function IdeasIndex() {
  const [active, setActive] = useState('All notes')
  const filtered =
    active === 'All notes' ? IDEAS : IDEAS.filter((i) => i.category === active)

  return (
    <>
      <LandingSidebar active="ideas" inPage={false} />

      <main style={{ position: 'relative', zIndex: 3 }}>
        {/* Top row — wordmark home + count. */}
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
                color: 'rgba(232, 228, 223, 0.55)',
                textDecoration: 'none',
              }}
            >
              ← Back home
            </Link>
          </div>
        </div>

        {/* Header */}
        <header
          style={{
            padding: `clamp(3rem, 9vw, 6.5rem) ${GUTTER} clamp(1.5rem, 4vw, 3rem)`,
          }}
        >
          <div style={{ width: '100%', maxWidth: COLUMN, margin: '0 auto' }}>
            <span
              className="font-mono"
              style={{
                display: 'block',
                fontSize: '0.72rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'rgba(232, 228, 223, 0.5)',
                marginBottom: '1.25rem',
              }}
            >
              Writing & experiments
            </span>
            <h1
              className="font-display"
              style={{
                margin: 0,
                fontWeight: 700,
                fontSize: 'clamp(3rem, 12vw, 7rem)',
                lineHeight: 0.95,
                letterSpacing: '-0.04em',
                color: INK,
              }}
            >
              Notes
            </h1>
            <p
              className="font-display"
              style={{
                margin: '1.5rem 0 0',
                maxWidth: '46ch',
                fontWeight: 500,
                fontSize: 'clamp(1.1rem, 2vw, 1.5rem)',
                lineHeight: 1.4,
                color: 'rgba(232, 228, 223, 0.65)',
              }}
            >
              Notes from the studio — experiments, stories, resources, and the
              occasional half-finished thought.
            </p>
          </div>
        </header>

        {/* Filter */}
        <div
          style={{ padding: `0 ${GUTTER}`, marginBottom: 'clamp(1rem, 3vw, 2rem)' }}
        >
          <div
            className="flex flex-wrap"
            style={{
              width: '100%',
              maxWidth: COLUMN,
              margin: '0 auto',
              gap: '1.25rem',
            }}
          >
            {IDEA_CATEGORIES.map((cat) => {
              const isActive = active === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActive(cat)}
                  className="font-mono"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: isActive ? BLUE : INK,
                    opacity: isActive ? 1 : 0.4,
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    transition: 'opacity 200ms, color 200ms',
                  }}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* List */}
        <section style={{ padding: `0 ${GUTTER}` }}>
          <motion.div
            layout
            style={{
              width: '100%',
              maxWidth: COLUMN,
              margin: '0 auto',
              borderTop: '1px solid rgba(232, 228, 223, 0.12)',
            }}
          >
            {filtered.map((idea, i) => (
              <IdeaRow key={idea.slug} idea={idea} index={i} />
            ))}
          </motion.div>
        </section>

        {/* ---- Subscribe + footer ----------------------------------------- */}
        <footer
          style={{
            padding: `clamp(4rem, 9vw, 7rem) ${GUTTER} clamp(8rem, 14vh, 11rem)`,
          }}
        >
          <div style={{ width: '100%', maxWidth: COLUMN, margin: '0 auto' }}>
            <div
              style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '24px',
                background: BLUE,
                color: PAPER,
                padding: 'clamp(2rem, 5vw, 3.5rem)',
              }}
            >
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
                  color: PAPER,
                  maxWidth: '16ch',
                }}
              >
                Get the next one in your inbox.
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
                New projects, fresh experiments, and the occasional half-finished
                thought — sent only when there&apos;s something worth showing. No
                spam, unsubscribe anytime.
              </p>
              <SubscribeForm onDark />
            </div>

          </div>
        </footer>

        <SiteFooter />
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

      <style>{`
        .idea-row-thumb {
          flex: 0 0 auto;
          width: clamp(140px, 22vw, 240px);
        }
        .idea-row:hover .idea-row-title { color: ${BLUE}; }
        .idea-row:hover .idea-row-arrow { opacity: 1; transform: translateX(4px); }
        .idea-row:hover .idea-row-img { transform: scale(1.05); }
        @media (max-width: 640px) {
          .idea-row-thumb { display: none; }
        }
      `}</style>
    </>
  )
}
