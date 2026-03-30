'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

const PLACEHOLDER_PROJECTS = [
  {
    title: 'The Light Around Us',
    client: 'tvsdesign / Spacelab',
    year: 2020,
    slug: 'the-light-around-us',
    category: 'Installation',
    image: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1600&q=80',
    colStart: 1,
    colSpan: 7,
    aspect: '16 / 10',
  },
  {
    title: 'StoryBooth',
    client: 'Michigan Central Station',
    year: 2019,
    slug: 'storybooth',
    category: 'Interactive',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1400&q=80',
    colStart: 6,
    colSpan: 7,
    aspect: '4 / 3',
  },
  {
    title: 'Hope Hydration HydroStation',
    client: 'Hope Hydration / Bould Design',
    year: 2024,
    slug: 'hope-hydration',
    category: 'Product',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600&q=80',
    colStart: 1,
    colSpan: 8,
    aspect: '16 / 10',
  },
  {
    title: 'Scatter and Rise',
    client: 'Goat Farm Arts Center',
    year: 2023,
    slug: 'scatter-and-rise',
    category: 'Public Art',
    image: 'https://images.unsplash.com/photo-1504297050568-910d24c426d3?w=1200&q=80',
    colStart: 5,
    colSpan: 6,
    aspect: '4 / 3',
  },
  {
    title: 'Dolby Moment',
    client: 'Dolby',
    year: 2015,
    slug: 'dolby-moment',
    category: 'Immersive',
    image: 'https://images.unsplash.com/photo-1506399558188-acca6f8cbf41?w=1800&q=80',
    colStart: 2,
    colSpan: 10,
    aspect: '16 / 9',
  },
]

export function FeaturedProjects() {
  return (
    <section
      style={{
        maxWidth: 'var(--max-width)',
        margin: '0 auto',
        padding: 'var(--spacing-section) var(--gutter)',
      }}
    >
      {/* Section label */}
      <div className="grid grid-cols-4 md:grid-cols-12 gap-6 mb-16">
        <div className="col-span-4 md:col-span-12 flex items-center gap-4">
          <span
            className="font-mono text-text-tertiary"
            style={{
              fontSize: 'var(--text-xs)',
              letterSpacing: 'var(--tracking-wider)',
              textTransform: 'uppercase',
            }}
          >
            Selected Work
          </span>
          <span className="flex-1 h-px bg-border" />
        </div>
      </div>

      <div className="flex flex-col" style={{ gap: 'clamp(4rem, 10vw, 8rem)' }}>
        {PLACEHOLDER_PROJECTS.map((project) => (
          <motion.div
            key={project.slug}
            className="grid grid-cols-4 md:grid-cols-12 gap-6"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href={`/work/${project.slug}`}
              className="block group col-span-4"
              style={{
                gridColumn: `${project.colStart} / span ${project.colSpan}`,
              }}
            >
              {/* Image */}
              <div className="relative overflow-hidden" style={{ aspectRatio: project.aspect }}>
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-[1.03]"
                  style={{
                    transitionDuration: 'var(--duration-slow)',
                    transitionTimingFunction: 'var(--ease-smooth)',
                  }}
                  sizes="(min-width: 1024px) 60vw, 90vw"
                />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: 'linear-gradient(to top, rgba(10,10,10,0.5) 0%, transparent 40%)',
                    transitionDuration: 'var(--duration-normal)',
                  }}
                />
              </div>

              {/* Project info */}
              <div className="mt-4">
                <h3
                  className="font-display font-medium text-text-primary"
                  style={{
                    fontSize: 'clamp(1.1rem, 2vw, var(--text-xl))',
                    letterSpacing: 'var(--tracking-tight)',
                    textTransform: 'uppercase',
                  }}
                >
                  {project.title}
                </h3>
                <div className="flex items-center justify-between mt-1 pt-2 border-t border-border">
                  <span
                    className="font-mono text-text-secondary"
                    style={{ fontSize: 'var(--text-sm)', letterSpacing: 'var(--tracking-wide)' }}
                  >
                    {project.year}
                  </span>
                  <span
                    className="font-mono text-text-secondary"
                    style={{ fontSize: 'var(--text-sm)', letterSpacing: 'var(--tracking-wide)' }}
                  >
                    {project.category}
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
