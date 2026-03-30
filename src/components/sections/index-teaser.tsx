'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

const PLACEHOLDER_PROJECTS = [
  { title: 'Dolby Moment', year: 2015, image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=75' },
  { title: 'Scatter and Rise', year: 2023, image: 'https://images.unsplash.com/photo-1504297050568-910d24c426d3?w=600&q=75' },
  { title: 'Gestures', year: 2014, image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=75' },
  { title: 'Suffolk Building', year: 2023, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=75' },
  { title: 'Cox Pillars', year: 2024, image: 'https://images.unsplash.com/photo-1506399558188-acca6f8cbf41?w=600&q=75' },
  { title: 'Orbitals', year: 2018, image: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=600&q=75' },
  { title: 'Sound Journeys', year: 2017, image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&q=75' },
  { title: 'Snowblind', year: 2016, image: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&q=75' },
  { title: 'Living Walls', year: 2024, image: 'https://images.unsplash.com/photo-1545987796-200677ee1011?w=600&q=75' },
  { title: 'Cox Conserves', year: 2024, image: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=600&q=75' },
  { title: 'Between The Two', year: 2016, image: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=600&q=75' },
  { title: 'HydroStation', year: 2024, image: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=600&q=75' },
]

export function IndexTeaser() {
  return (
    <section
      style={{
        maxWidth: 'var(--max-width)',
        margin: '0 auto',
        padding: '0 var(--gutter) var(--spacing-section)',
      }}
    >
      <div className="grid grid-cols-4 md:grid-cols-12 gap-6 mb-10">
        <div className="col-span-4 md:col-span-12 flex items-center gap-4">
          <span
            className="font-mono text-text-tertiary"
            style={{
              fontSize: 'var(--text-xs)',
              letterSpacing: 'var(--tracking-wider)',
              textTransform: 'uppercase',
            }}
          >
            All Projects
          </span>
          <span className="flex-1 h-px bg-border" />
          <Link
            href="/work"
            className="font-mono text-text-secondary hover:text-accent transition-colors"
            style={{
              fontSize: 'var(--text-sm)',
              letterSpacing: 'var(--tracking-wide)',
              transitionDuration: 'var(--duration-fast)',
            }}
          >
            View all &rarr;
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-12 gap-6">
        {PLACEHOLDER_PROJECTS.map((project, i) => (
          <motion.div
            key={project.title}
            className="col-span-2 md:col-span-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1],
              delay: (i % 4) * 0.06,
            }}
          >
            <div className="group relative cursor-pointer">
              <div className="aspect-[4/3] relative overflow-hidden">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-[1.05]"
                  style={{
                    transitionDuration: 'var(--duration-normal)',
                    transitionTimingFunction: 'var(--ease-smooth)',
                  }}
                  sizes="(min-width: 768px) 25vw, 50vw"
                />
                <div
                  className="absolute inset-0 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: 'linear-gradient(to top, rgba(10, 10, 10, 0.8) 0%, transparent 60%)',
                    padding: 'var(--spacing-md)',
                    transitionDuration: 'var(--duration-fast)',
                  }}
                >
                  <p className="font-display font-medium text-text-primary" style={{ fontSize: 'var(--text-sm)' }}>
                    {project.title}
                  </p>
                  <p
                    className="font-mono text-text-secondary"
                    style={{ fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)' }}
                  >
                    {project.year}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
