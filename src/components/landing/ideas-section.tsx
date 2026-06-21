'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { INK, BLUE } from './landing-theme'

interface Idea {
  title: string
  category: string
  excerpt: string
  href: string
  image: string
  dark?: boolean
}

const CATEGORIES = ['All', 'Experiments', 'Stories', 'Random']

const IDEAS: Idea[] = [
  {
    title: 'What do you want to let go of?',
    category: 'Experiments',
    excerpt:
      'An interactive installation that invites people to name — and release — what they are carrying.',
    href: '/ideas/let-go',
    image: '/landing/opt/orbitals.avif',
    dark: true,
  },
  {
    title: 'Choosing Sucks',
    category: 'Random',
    excerpt:
      'A decision tool for the chronically indecisive. Fewer options, better choices.',
    href: '/ideas/choosing-sucks',
    image: '/landing/opt/render3.avif',
  },
  {
    title: 'Stage Controller',
    category: 'Experiments',
    excerpt:
      'Run lighting cues live from an iPad, built on ENTTEC ELM.',
    href: '/ideas/stage-controller',
    image: '/landing/opt/installation-33.avif',
    dark: true,
  },
  {
    title: 'Pour Perfect',
    category: 'Random',
    excerpt:
      'A guided pour-over timer that teaches ratio and rhythm as you brew.',
    href: '/ideas/pour-perfect',
    image: '/landing/opt/gg.avif',
  },
  {
    title: 'Gestures',
    category: 'Stories',
    excerpt:
      'A camera-driven piece that turns hand movement into living typography.',
    href: '/ideas/gestures',
    image: '/landing/opt/gestures.avif',
    dark: true,
  },
  {
    title: '9to5.tv',
    category: 'Stories',
    excerpt:
      'A festival and public livestream out of The Goat Farm, with custom robots.',
    href: '/ideas/9to5-tv',
    image: '/landing/opt/agent3.avif',
  },
]

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
        href={idea.href}
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
            background: idea.dark ? '#0a0a0a' : 'rgba(10,10,10,0.04)',
          }}
        >
          <Image
            src={idea.image}
            alt={idea.title}
            fill
            sizes="(min-width: 768px) 33vw, 90vw"
            className="object-cover"
            style={{ transition: 'transform 800ms cubic-bezier(0.22, 1, 0.36, 1)' }}
          />
        </div>

        <h3
          className="font-display"
          style={{
            margin: '1rem 0 0.5rem',
            fontWeight: 700,
            fontSize: '1.15rem',
            letterSpacing: '-0.01em',
            lineHeight: 1.2,
          }}
        >
          {idea.title}
        </h3>

        <p
          className="font-display"
          style={{
            margin: 0,
            color: 'rgba(10,10,10,0.6)',
            fontSize: '0.92rem',
            lineHeight: 1.45,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {idea.excerpt}
        </p>

        <span
          className="font-mono group-hover:opacity-70"
          style={{
            marginTop: '0.9rem',
            color: BLUE,
            fontWeight: 500,
            fontSize: '0.78rem',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            transition: 'opacity 200ms',
          }}
        >
          Read more
        </span>
      </Link>
    </motion.div>
  )
}

export function IdeasSection() {
  const [active, setActive] = useState('All')
  const filtered =
    active === 'All' ? IDEAS : IDEAS.filter((i) => i.category === active)

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
        {filtered.map((idea) => (
          <IdeaCard key={idea.title} idea={idea} />
        ))}
      </motion.div>
    </div>
  )
}
