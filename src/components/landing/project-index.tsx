'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { LANDING_PROJECTS, type LandingProject } from '@/lib/landing-projects'

/** Vary shape a little so the two columns don't read as a rigid table. */
function aspectFor(p: LandingProject): number {
  if (p.rowSpan >= p.colSpan * 2.2) return 3 / 4
  if (p.colSpan >= p.rowSpan) return 4 / 3
  return 1
}

// Frames scaled down 30% vertically (width fixed): height = 70% → wider ratio.
const VERTICAL_SCALE = 0.7

function ProjectCard({ project }: { project: LandingProject }) {
  const inner = (
    <div
      className="group relative"
      style={{ cursor: project.slug ? 'pointer' : 'default' }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: aspectFor(project) / VERTICAL_SCALE,
          overflow: 'hidden',
          background: 'rgba(10,10,10,0.04)',
        }}
      >
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes="(min-width: 768px) 45vw, 90vw"
          className="object-cover"
          style={{
            transition: 'transform 800ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
        {/* Hover caption */}
        <div
          className="absolute inset-x-0 bottom-0 opacity-0 group-hover:opacity-100"
          style={{
            padding: '14px',
            background:
              'linear-gradient(to top, rgba(10,10,10,0.55) 0%, transparent 100%)',
            transition: 'opacity 300ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <p
            className="font-display"
            style={{ color: '#F4F2EE', fontSize: '0.9rem', fontWeight: 500 }}
          >
            {project.title}
          </p>
          <div
            className="flex justify-between font-mono"
            style={{
              color: 'rgba(244,242,238,0.75)',
              fontSize: '0.7rem',
              letterSpacing: '0.02em',
              marginTop: 2,
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
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{ breakInside: 'avoid', marginBottom: '3rem' }}
    >
      {project.slug ? (
        <Link href={`/work/${project.slug}`}>{inner}</Link>
      ) : (
        inner
      )}
    </motion.div>
  )
}

export function ProjectIndex() {
  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const update = () => setMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return (
    <section
      style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '9rem var(--gutter, 1.5rem) 14rem',
      }}
    >
      <div style={{ columnCount: mobile ? 1 : 2, columnGap: '3rem' }}>
        {LANDING_PROJECTS.map((p) => (
          <ProjectCard key={p.title} project={p} />
        ))}
      </div>
    </section>
  )
}
