'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import type { PlaceholderProject } from '@/lib/placeholder-projects'
import { HeroImageTrail } from './hero-image-trail'

function getTrailImages(project: PlaceholderProject): string[] {
  const images: string[] = [project.heroImage]
  for (const section of project.sections) {
    if (section.image) images.push(section.image)
    if (section.images) images.push(...section.images)
  }
  for (const sp of project.similarProjects) {
    images.push(sp.image)
  }
  return images
}

interface Props {
  project: PlaceholderProject
}

const container = {
  maxWidth: 'var(--max-width)',
  margin: '0 auto',
  padding: '0 var(--gutter)',
} as const

const ease = [0.16, 1, 0.3, 1] as const

export function PlaceholderProjectPage({ project }: Props) {
  const trailImages = getTrailImages(project)

  const collabsByRole = project.collaborators.reduce<Record<string, string[]>>(
    (acc, c) => {
      const key = c.role + 's'
      if (!acc[key]) acc[key] = []
      acc[key].push(c.name)
      return acc
    },
    {}
  )

  // Extract sections by type for the staggered layout
  const twoCol = project.sections.find((s) => s.type === 'two-column')
  const imageGrid = project.sections.find((s) => s.type === 'image-grid')
  const techCredits = project.sections.find((s) => s.type === 'tech-credits')
  const fullBleed = project.sections.find((s) => s.type === 'full-bleed-image')

  return (
    <article>
      {/* ============================================
          HERO
          ============================================ */}
      <section
        className="relative overflow-hidden"
        style={{
          minHeight: '100svh',
          padding: '0 var(--gutter)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <HeroImageTrail images={trailImages} />

        {/* Title row */}
        <div
          className="relative z-10 flex items-end justify-between"
          style={{
            paddingTop: 'calc(60px + var(--spacing-4xl))',
            maxWidth: 'var(--max-width)',
            margin: '0 auto',
            width: '100%',
          }}
        >
          <motion.h1
            className="font-display font-medium select-none"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.1 }}
          >
            <span
              className="block text-text-secondary"
              style={{
                fontSize: 'clamp(0.875rem, 2.5vw, 2rem)',
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
                marginBottom: 'var(--spacing-sm)',
              }}
            >
              {project.client}
            </span>
            <span
              className="block text-text-primary"
              style={{
                fontSize: 'clamp(3rem, 10vw, 8rem)',
                lineHeight: 0.9,
                letterSpacing: '-0.03em',
              }}
            >
              {project.title}
            </span>
          </motion.h1>

          <motion.span
            className="font-display font-medium text-text-primary select-none"
            style={{
              fontSize: 'clamp(3rem, 10vw, 8rem)',
              lineHeight: 0.9,
              letterSpacing: '-0.03em',
            }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.2 }}
          >
            {project.year}
          </motion.span>
        </div>

        {/* Spacer to push metadata to bottom */}
        <div style={{ flex: 1, minHeight: 'var(--spacing-4xl)' }} />

        {/* Scroll indicator */}
        <motion.div
          className="relative z-10 flex justify-center pb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <motion.svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className="text-text-tertiary"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: [0.22, 1, 0.36, 1] }}
          >
            <path
              d="M7 1v12M2 7l5 6 5-6"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        </motion.div>
      </section>

      {/* ============================================
          BODY — Staggered editorial grid
          Left col: Concept text → Image 1
          Right col: Metadata → About → Production → Image 2
          ============================================ */}
      <section style={{ ...container, paddingTop: 'var(--spacing-section)', paddingBottom: 'var(--spacing-4xl)' }}>
        <motion.div
          className="grid grid-cols-4 md:grid-cols-12 gap-6"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.9, ease }}
        >
          {/* --- LEFT COLUMN --- */}

          {/* Concept text */}
          {twoCol && (
            <div className="col-span-4 md:col-span-5 md:row-span-2">
              <p
                className="font-mono text-text-tertiary mb-4"
                style={{
                  fontSize: 'var(--text-xs)',
                  letterSpacing: 'var(--tracking-wider)',
                  textTransform: 'uppercase',
                }}
              >
                {twoCol.leftLabel}
              </p>
              <p
                className="font-display text-text-primary"
                style={{
                  fontSize: 'var(--text-base)',
                  lineHeight: 'var(--leading-relaxed)',
                }}
              >
                {twoCol.leftText}
              </p>
            </div>
          )}

          {/* --- RIGHT COLUMN --- */}

          {/* Category + Client (side by side) */}
          <div className="col-span-2 md:col-span-3 md:col-start-7">
            <p
              className="font-mono text-text-tertiary"
              style={{
                fontSize: 'var(--text-xs)',
                letterSpacing: 'var(--tracking-wider)',
                textTransform: 'uppercase',
                marginBottom: 'var(--spacing-xs)',
              }}
            >
              Category
            </p>
            <p className="font-display text-text-primary" style={{ fontSize: 'var(--text-sm)' }}>
              {project.category}
            </p>
          </div>

          <div className="col-span-2 md:col-span-3 md:col-start-10">
            <p
              className="font-mono text-text-tertiary"
              style={{
                fontSize: 'var(--text-xs)',
                letterSpacing: 'var(--tracking-wider)',
                textTransform: 'uppercase',
                marginBottom: 'var(--spacing-xs)',
              }}
            >
              Client
            </p>
            <p className="font-display text-text-primary" style={{ fontSize: 'var(--text-sm)' }}>
              {project.client}
            </p>
          </div>

          {/* About + Service */}
          <div className="col-span-4 md:col-span-4 md:col-start-7">
            <p
              className="font-mono text-text-tertiary"
              style={{
                fontSize: 'var(--text-xs)',
                letterSpacing: 'var(--tracking-wider)',
                textTransform: 'uppercase',
                marginBottom: 'var(--spacing-xs)',
              }}
            >
              {project.title}
            </p>
            <p
              className="font-display text-text-secondary"
              style={{
                fontSize: 'var(--text-sm)',
                lineHeight: 'var(--leading-relaxed)',
              }}
            >
              {project.about}
            </p>
          </div>

          <div className="col-span-4 md:col-span-2 md:col-start-11">
            <p
              className="font-mono text-text-tertiary"
              style={{
                fontSize: 'var(--text-xs)',
                letterSpacing: 'var(--tracking-wider)',
                textTransform: 'uppercase',
                marginBottom: 'var(--spacing-sm)',
              }}
            >
              Service
            </p>
            <div className="flex flex-col gap-0.5">
              {project.role.map((r) => (
                <p key={r} className="font-display text-text-primary" style={{ fontSize: 'var(--text-sm)' }}>
                  {r}
                </p>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ============================================
          STAGGERED IMAGES + PRODUCTION TEXT
          Image 1 (left) | Production text (right)
          then Image 2 (right) below
          ============================================ */}
      <section style={{ ...container, paddingBottom: 'var(--spacing-4xl)' }}>
        <div className="grid grid-cols-4 md:grid-cols-12 gap-6">
          {/* Image 1 — left */}
          {imageGrid?.images?.[0] && (
            <motion.div
              className="col-span-4 md:col-span-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.8, ease }}
            >
              <div className="relative overflow-hidden" style={{ aspectRatio: '4 / 5' }}>
                <Image
                  src={imageGrid.images[0]}
                  alt={`${project.title} detail 1`}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              </div>
            </motion.div>
          )}

          {/* Production text — right, vertically centered */}
          {twoCol && (
            <motion.div
              className="col-span-4 md:col-span-5 md:col-start-8 flex flex-col justify-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, ease }}
            >
              <p
                className="font-mono text-text-tertiary mb-4"
                style={{
                  fontSize: 'var(--text-xs)',
                  letterSpacing: 'var(--tracking-wider)',
                  textTransform: 'uppercase',
                }}
              >
                {twoCol.rightLabel}
              </p>
              <p
                className="font-display text-text-primary"
                style={{
                  fontSize: 'var(--text-base)',
                  lineHeight: 'var(--leading-relaxed)',
                }}
              >
                {twoCol.rightText}
              </p>
            </motion.div>
          )}

          {/* Image 2 — right, offset */}
          {imageGrid?.images?.[1] && (
            <motion.div
              className="col-span-4 md:col-span-6 md:col-start-7"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.8, ease }}
            >
              <div className="relative overflow-hidden" style={{ aspectRatio: '16 / 10' }}>
                <Image
                  src={imageGrid.images[1]}
                  alt={`${project.title} detail 2`}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* ============================================
          TECH PILLS
          ============================================ */}
      {techCredits?.items && (
        <section style={{ ...container, paddingBottom: 'var(--spacing-4xl)' }}>
          <motion.div
            className="grid grid-cols-4 md:grid-cols-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease }}
          >
            <div className="col-span-4 md:col-span-8 md:col-start-3 flex flex-wrap gap-3">
              {techCredits.items.map((item) => (
                <span
                  key={item}
                  className="font-display text-text-primary border border-border hover:border-accent hover:text-accent transition-colors cursor-default"
                  style={{
                    fontSize: 'clamp(1rem, 2vw, var(--text-xl))',
                    padding: '0.6em 1.4em',
                    borderRadius: '999px',
                    transitionDuration: 'var(--duration-fast)',
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* ============================================
          FULL BLEED IMAGE
          ============================================ */}
      {fullBleed?.image && (
        <motion.section
          style={{ ...container, paddingBottom: 'var(--spacing-4xl)' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative" style={{ aspectRatio: '16 / 9' }}>
            <Image
              src={fullBleed.image}
              alt={`${project.title} — wide shot`}
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
        </motion.section>
      )}

      {/* ============================================
          COLLABORATORS
          ============================================ */}
      {Object.keys(collabsByRole).length > 0 && (
        <section style={{ ...container, paddingBottom: 'var(--spacing-4xl)' }}>
          <motion.div
            className="grid grid-cols-4 md:grid-cols-12 gap-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease }}
          >
            {Object.entries(collabsByRole).map(([role, names]) => (
              <div key={role} className="col-span-2 md:col-span-3">
                <p
                  className="font-mono text-text-tertiary"
                  style={{
                    fontSize: 'var(--text-xs)',
                    letterSpacing: 'var(--tracking-wider)',
                    textTransform: 'uppercase',
                    marginBottom: 'var(--spacing-sm)',
                  }}
                >
                  {role}
                </p>
                <div className="flex flex-col gap-0.5">
                  {names.map((name) => (
                    <p key={name} className="font-display text-text-primary" style={{ fontSize: 'var(--text-sm)' }}>
                      {name}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </section>
      )}

      {/* ============================================
          SIMILAR PROJECTS
          ============================================ */}
      {project.similarProjects.length > 0 && (
        <section style={{ ...container, paddingBottom: 'var(--spacing-section)' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease }}
          >
            <p
              className="font-mono text-text-tertiary mb-8"
              style={{
                fontSize: 'var(--text-xs)',
                letterSpacing: 'var(--tracking-wider)',
                textTransform: 'uppercase',
              }}
            >
              Similar projects
            </p>

            <div className="grid grid-cols-4 md:grid-cols-12 gap-4">
              {project.similarProjects.map((sp) => (
                <Link
                  key={sp.slug}
                  href={`/${sp.slug}`}
                  className="col-span-4 md:col-span-6 group block"
                >
                  <div className="relative overflow-hidden" style={{ aspectRatio: '16 / 10' }}>
                    <Image
                      src={sp.image}
                      alt={sp.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-[1.03]"
                      style={{
                        transitionDuration: 'var(--duration-slow)',
                        transitionTimingFunction: 'var(--ease-smooth)',
                      }}
                      sizes="(min-width: 768px) 50vw, 100vw"
                    />
                  </div>
                  <p
                    className="font-display text-text-primary mt-3 group-hover:text-accent transition-colors"
                    style={{ fontSize: 'var(--text-base)', transitionDuration: 'var(--duration-fast)' }}
                  >
                    {sp.title}
                  </p>
                </Link>
              ))}
            </div>
          </motion.div>
        </section>
      )}
    </article>
  )
}
