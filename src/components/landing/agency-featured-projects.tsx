'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { LANDING_PROJECTS, type LandingProject } from '@/lib/landing-projects'
import { SeeAllWork } from './see-all-work'

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'
const FEATURED = LANDING_PROJECTS.slice(0, 9)

function FeaturedCard({ project }: { project: LandingProject }) {
  const inner = (
    <div className="group relative" style={{ cursor: 'pointer' }}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: 4 / 3,
          overflow: 'hidden',
          background: 'rgba(10,10,10,0.04)',
        }}
      >
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes="(min-width: 1250px) 30vw, (min-width: 768px) 45vw, 90vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div
          className="absolute inset-x-0 bottom-0 opacity-0 group-hover:opacity-100"
          style={{
            padding: '18px',
            background:
              'linear-gradient(to top, rgba(10,10,10,0.6) 0%, transparent 100%)',
            transition: `opacity 300ms ${EASE}`,
          }}
        >
          <p
            className="font-display"
            style={{ color: '#F4F2EE', fontSize: '1.1rem', fontWeight: 600 }}
          >
            {project.title}
          </p>
          <div
            className="flex justify-between font-mono"
            style={{
              color: 'rgba(244,242,238,0.78)',
              fontSize: '0.72rem',
              letterSpacing: '0.02em',
              marginTop: 3,
            }}
          >
            <span>{project.client}</span>
            <span style={{ textTransform: 'uppercase' }}>
              {project.category}
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {project.slug ? (
        <Link href={`/work/${project.slug}`}>{inner}</Link>
      ) : (
        <Link href="/agency/work">{inner}</Link>
      )}
    </motion.div>
  )
}

export function AgencyFeaturedProjects() {
  return (
    <section
      style={{
        maxWidth: '1800px',
        margin: '0 auto',
        padding: '3rem var(--gutter, 1.5rem) 2rem',
      }}
    >
      <style>{`
        .featured-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: clamp(0.75rem, 1.5vw, 1.25rem);
        }
        @media (min-width: 768px) {
          .featured-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1250px) {
          .featured-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>
      <div className="featured-grid">
        {FEATURED.map((p) => (
          <FeaturedCard key={p.title} project={p} />
        ))}
      </div>

      <SeeAllWork
        href="/agency/work"
        label="View All Projects"
        ballSize="clamp(300px, 36vw, 480px)"
        height="clamp(260px, 32vh, 420px)"
      />
    </section>
  )
}
