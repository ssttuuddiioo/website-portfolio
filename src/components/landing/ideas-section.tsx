'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { INK, BLUE } from './landing-theme'
import { SeeAllWork } from './see-all-work'
import { IDEAS, IDEA_CATEGORIES, readMinutes, type Idea } from '@/lib/ideas'

const CATEGORIES = IDEA_CATEGORIES

function IdeaCard({ idea }: { idea: Idea }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/ideas/${idea.slug}`}
        className="group"
        style={{
          display: 'flex',
          flexDirection: 'column',
          color: INK,
          textDecoration: 'none',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '3 / 2',
            overflow: 'hidden',
            borderRadius: '10px',
            background: idea.dark ? '#0a0a0a' : 'rgba(10,10,10,0.04)',
          }}
        >
          <Image
            src={idea.image}
            alt={idea.title}
            fill
            sizes="(min-width: 768px) 33vw, 90vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
          />
        </div>

        {/* Kicker — category tag + read time, the editorial metadata row. */}
        <div
          className="font-mono"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            margin: '1.15rem 0 0.55rem',
            fontSize: '0.7rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          <span style={{ color: BLUE, fontWeight: 600 }}>{idea.category}</span>
          <span aria-hidden style={{ color: 'rgba(10,10,10,0.25)' }}>
            ·
          </span>
          <span style={{ color: 'rgba(10,10,10,0.45)' }}>
            {readMinutes(idea.body)} min read
          </span>
        </div>

        <h3
          className="font-display"
          style={{
            margin: 0,
            fontWeight: 700,
            fontSize: '1.3rem',
            letterSpacing: '-0.015em',
            lineHeight: 1.18,
          }}
        >
          {idea.title}
        </h3>
      </Link>
    </motion.div>
  )
}

/** Homepage teaser caps the grid; the full archive lives at /ideas. */
const HOME_LIMIT = 6

export function IdeasSection() {
  const [active, setActive] = useState('All notes')
  const filtered =
    active === 'All notes' ? IDEAS : IDEAS.filter((i) => i.category === active)
  const visible = filtered.slice(0, HOME_LIMIT)

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Category filter */}
      <div
        className="flex flex-wrap items-center justify-center"
        style={{ gap: '1.75rem', marginBottom: 'clamp(2.5rem, 5vw, 4rem)' }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = active === cat
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActive(cat)}
              className="font-display"
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                color: INK,
                opacity: isActive ? 1 : 0.45,
                fontWeight: 700,
                fontSize: '1.6rem',
                letterSpacing: '-0.02em',
                textTransform: 'uppercase',
                transition: 'opacity 200ms',
              }}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-3"
        style={{ gap: 'clamp(2rem, 3vw, 3rem) clamp(1.5rem, 2.5vw, 2.5rem)' }}
      >
        {visible.map((idea) => (
          <IdeaCard key={idea.title} idea={idea} />
        ))}
      </motion.div>

      {/* See all posts → full archive. Same bouncing DVD-pill as "View All
          Projects" on the work teaser — bounded to this section, not roaming. */}
      <SeeAllWork
        href="/ideas"
        label="See All Notes"
        ballSize="clamp(300px, 36vw, 480px)"
        height="clamp(260px, 32vh, 420px)"
      />
    </div>
  )
}
