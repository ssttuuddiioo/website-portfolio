'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import type { PlaceholderProject } from '@/lib/placeholder-projects'
import { HeroImageTrail } from './hero-image-trail'

function getTrailImages(project: PlaceholderProject): string[] {
  const images: string[] = [
    project.heroImage,
    project.mainMedia,
    ...project.supportingImages,
  ]
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

const metaLabel = {
  fontSize: 'var(--text-xs)',
  letterSpacing: 'var(--tracking-wider)',
  textTransform: 'uppercase',
  marginBottom: 'var(--spacing-xs)',
} as const

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

  // Concept + Production Notes copy comes from the two-column section.
  const twoCol = project.sections.find((s) => s.type === 'two-column')
  const techCredits = project.sections.find((s) => s.type === 'tech-credits')

  // Three stacked text blocks under the top line.
  const textBlocks = [
    { label: 'Description', body: project.about },
    twoCol?.leftText
      ? { label: twoCol.leftLabel ?? 'Concept', body: twoCol.leftText }
      : null,
    twoCol?.rightText
      ? { label: twoCol.rightLabel ?? 'Production Notes', body: twoCol.rightText }
      : null,
  ].filter(Boolean) as { label: string; body: string }[]

  return (
    <article>
      {/* ============================================
          HERO — full-bleed header image, title overlaid
          ============================================ */}
      <section className="relative">
        <motion.div
          className="relative overflow-hidden"
          style={{
            width: '100%',
            minHeight: 'clamp(22rem, 80svh, 45rem)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease }}
        >
          <Image
            src={project.heroImage}
            alt={project.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />

          {/* Legibility scrim */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, rgba(10,10,10,0.7) 0%, rgba(10,10,10,0.15) 40%, transparent 70%)',
            }}
          />

          {/* Overlaid title — bottom-left */}
          <motion.h1
            className="font-display font-medium select-none absolute z-10"
            style={{
              left: 'clamp(1rem, 4vw, 3rem)',
              right: 'clamp(1rem, 4vw, 3rem)',
              bottom: 'clamp(1.25rem, 4vw, 3rem)',
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.3 }}
          >
            <span
              className="block text-text-secondary"
              style={{
                fontSize: 'clamp(0.75rem, 1.4vw, 1rem)',
                lineHeight: 1.2,
                letterSpacing: '0.02em',
                marginBottom: 'var(--spacing-xs)',
              }}
            >
              {project.client} · {project.year}
            </span>
            <span
              className="block text-text-primary"
              style={{
                fontSize: 'clamp(2rem, 6vw, 4.5rem)',
                lineHeight: 0.95,
                letterSpacing: '-0.03em',
              }}
            >
              {project.title}
            </span>
          </motion.h1>
        </motion.div>
      </section>

      {/* ============================================
          INTRO — metadata (left 25%) + description (right 75%), one row
          ============================================ */}
      <section style={{ ...container, paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-2xl)' }}>
        <motion.div
          className="grid grid-cols-4 md:grid-cols-12 gap-6 items-start"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease }}
        >
          {/* Left column — Client / Studio / Services */}
          <div className="col-span-4 md:col-span-3 flex flex-col gap-6">
            <div>
              <p className="font-mono text-text-tertiary" style={metaLabel}>
                Client
              </p>
              <p className="font-display text-text-primary" style={{ fontSize: 'var(--text-base)' }}>
                {project.client}
              </p>
            </div>

            <div>
              <p className="font-mono text-text-tertiary" style={metaLabel}>
                Studio
              </p>
              <p className="font-display text-text-primary" style={{ fontSize: 'var(--text-base)' }}>
                {project.discipline}
              </p>
            </div>
          </div>

          {/* Right column — Description, full width of the 75% column */}
          <p
            className="col-span-4 md:col-span-9 font-display text-text-primary"
            style={{
              fontSize: 'calc(var(--text-base) * 2)',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
            }}
          >
            {project.about}
          </p>
        </motion.div>
      </section>

      {/* ============================================
          MAIN MEDIA — large lead pic / video
          ============================================ */}
      <motion.section
        style={{ ...container, paddingBottom: 'var(--spacing-2xl)' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative overflow-hidden" style={{ aspectRatio: '16 / 9' }}>
          <Image
            src={project.mainMedia}
            alt={`${project.title} — main`}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>
      </motion.section>

      {/* ============================================
          TEXT BLOCKS — Concept → Production Notes
          ============================================ */}
      {textBlocks.length > 1 && (
        <section style={{ ...container, paddingBottom: 'var(--spacing-4xl)' }}>
          <div className="grid grid-cols-4 md:grid-cols-12 gap-6 items-start">
            {/* Left — image beside the text */}
            <motion.div
              className="col-span-4 md:col-span-5"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.8, ease }}
            >
              <div
                className="relative overflow-hidden md:sticky md:top-24"
                style={{ aspectRatio: '4 / 5' }}
              >
                <Image
                  src={project.supportingImages[0]}
                  alt={`${project.title} — detail`}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 42vw, 100vw"
                />
              </div>
            </motion.div>

            {/* Right — Concept / Production Notes / Services */}
            <div className="col-span-4 md:col-span-6 md:col-start-7">
              {textBlocks.slice(1).map((block, i) => (
                <motion.div
                  key={block.label}
                  style={{ marginBottom: 'var(--spacing-2xl)' }}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.8, ease, delay: i * 0.08 }}
                >
                  <p className="font-mono text-text-tertiary mb-4" style={metaLabel}>
                    {block.label}
                  </p>
                  <p
                    className="font-display text-text-primary"
                    style={{ fontSize: 'var(--text-base)', lineHeight: 'var(--leading-relaxed)' }}
                  >
                    {block.body}
                  </p>
                </motion.div>
              ))}

              {/* Services — below Production */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8, ease }}
              >
                <p className="font-mono text-text-tertiary mb-4" style={metaLabel}>
                  Services
                </p>
                <div className="flex flex-col gap-0.5">
                  {project.role.map((r) => (
                    <p
                      key={r}
                      className="font-display text-text-primary"
                      style={{ fontSize: 'var(--text-base)', lineHeight: 'var(--leading-relaxed)' }}
                    >
                      {r}
                    </p>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* ============================================
          SUPPORTING IMAGES — three across
          ============================================ */}
      {project.supportingImages.length > 0 && (
        <section style={{ ...container, paddingBottom: 'var(--spacing-4xl)' }}>
          <div className="grid grid-cols-4 md:grid-cols-12 gap-6">
            {project.supportingImages.slice(0, 3).map((src, i) => (
              <motion.div
                key={src}
                className="col-span-4 md:col-span-4"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.8, ease, delay: i * 0.1 }}
              >
                <div className="relative overflow-hidden" style={{ aspectRatio: '4 / 5' }}>
                  <Image
                    src={src}
                    alt={`${project.title} — supporting ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 33vw, 100vw"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

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

      {/* ============================================
          INTERACTIVE IMAGE TRAIL (mouse effect)
          ============================================ */}
      <section
        className="relative overflow-hidden"
        style={{ minHeight: '80svh' }}
      >
        <HeroImageTrail images={trailImages} />
      </section>
    </article>
  )
}
