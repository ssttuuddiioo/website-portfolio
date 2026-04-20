'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ProjectCard } from '@/components/project/project-card'
import { FeaturedCard } from '@/components/project/featured-card'
import type { SanityProject } from '@/lib/sanity/types'

const FILTER_TABS = [
  { label: 'All', value: 'all' },
  { label: 'Commercial', value: 'commercial' },
  { label: 'Art', value: 'art' },
  { label: 'Lighting', value: 'lighting' },
  { label: 'Software', value: 'software' },
  { label: 'Experiments', value: 'experiments' },
]

const PLACEHOLDER_PROJECTS = [
  { title: 'The Light Around Us', slug: 'the-light-around-us', client: 'tvsdesign / Spacelab', year: 2020, category: 'Commercial', image: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=800&q=75', featured: true },
  { title: 'Dolby Moment', slug: 'dolby-moment', client: 'Dolby', year: 2016, category: 'Commercial', image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=75', featured: true },
  { title: 'StoryBooth', slug: 'storybooth', client: 'Michigan Central', year: 2019, category: 'Commercial', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=75', featured: false },
  { title: 'Hope Hydration', slug: 'hope-hydration', client: 'Bould Design', year: 2024, category: 'Commercial', image: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=800&q=75', featured: false },
  { title: 'Scatter and Rise', slug: 'scatter-and-rise', client: 'Goat Farm Arts', year: 2023, category: 'Art', image: 'https://images.unsplash.com/photo-1504297050568-910d24c426d3?w=800&q=75', featured: false },
  { title: 'Gestures', slug: 'gestures', client: 'Personal', year: 2014, category: 'Art', image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=75', featured: false },
  { title: 'Suffolk Building', slug: 'suffolk-building', client: 'Chemistry Creative', year: 2023, category: 'Lighting', image: 'https://images.unsplash.com/photo-1545987796-200677ee1011?w=800&q=75', featured: false },
  { title: 'Living Walls', slug: 'living-walls', client: 'Mercedes-Benz Stadium', year: 2024, category: 'Lighting', image: 'https://images.unsplash.com/photo-1506399558188-acca6f8cbf41?w=800&q=75', featured: false },
  { title: 'Cox Pillars', slug: 'cox-pillars', client: 'Cox Communications', year: 2024, category: 'Commercial', image: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&q=75', featured: false },
  { title: 'Orbitals', slug: 'orbitals', client: 'Personal', year: 2018, category: 'Art', image: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&q=75', featured: false },
  { title: 'Sound Journeys', slug: 'sound-journeys', client: 'Personal', year: 2017, category: 'Art', image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=75', featured: false },
  { title: 'Snowblind', slug: 'snowblind', client: 'Personal', year: 2016, category: 'Art', image: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=800&q=75', featured: false },
  { title: 'Cox Conserves', slug: 'cox-conserves', client: 'Cox Communications', year: 2024, category: 'Commercial', image: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&q=75', featured: false },
  { title: 'HydroStation', slug: 'hydrostation', client: 'Hope Hydration', year: 2024, category: 'Software', image: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=800&q=75', featured: false },
  { title: 'Between The Two', slug: 'between-the-two', client: 'Personal', year: 2016, category: 'Art', image: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=800&q=75', featured: false },
  { title: 'Stage Controller', slug: 'stage-controller', client: 'ENTTEC', year: 2023, category: 'Software', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=75', featured: false },
]

interface WorkPageClientProps {
  projects: SanityProject[]
}

export function WorkPageClient({ projects }: WorkPageClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeFilter = searchParams.get('category') || 'all'
  const usePlaceholders = projects.length === 0

  // Sanity path
  if (!usePlaceholders) {
    const filteredProjects =
      activeFilter === 'all'
        ? projects
        : projects.filter(
            (p) =>
              p.category?.slug?.current?.toLowerCase() === activeFilter.toLowerCase()
          )

    const featuredProjects = projects.filter((p) => p.featured)
    const showFeatured = activeFilter === 'all' && featuredProjects.length > 0

    return (
      <>
        <FilterTabs activeFilter={activeFilter} onFilter={(v) => {
          router.push(v === 'all' ? '/work' : `/work?category=${v}`, { scroll: false })
        }} />

        {showFeatured && (
          <div className="grid grid-cols-4 md:grid-cols-12 gap-6" style={{ marginBottom: 'var(--spacing-3xl)' }}>
            {featuredProjects.map((project, i) => (
              <FeaturedCard key={project._id} project={project} index={i} />
            ))}
          </div>
        )}

        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-4 md:grid-cols-12 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project) => (
                <motion.div
                  key={project._id}
                  className="col-span-2 md:col-span-3"
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <p className="font-mono text-text-tertiary text-center" style={{ fontSize: 'var(--text-sm)', padding: 'var(--spacing-4xl) 0' }}>
            No projects in this category yet.
          </p>
        )}
      </>
    )
  }

  // Placeholder path
  const filteredPlaceholders =
    activeFilter === 'all'
      ? PLACEHOLDER_PROJECTS
      : PLACEHOLDER_PROJECTS.filter(
          (p) => p.category.toLowerCase() === activeFilter.toLowerCase()
        )

  const featuredPlaceholders = PLACEHOLDER_PROJECTS.filter((p) => p.featured)
  const showFeatured = activeFilter === 'all'

  return (
    <>
      <FilterTabs activeFilter={activeFilter} onFilter={(v) => {
        router.push(v === 'all' ? '/work' : `/work?category=${v}`, { scroll: false })
      }} />

      {/* Featured */}
      {showFeatured && (
        <div className="grid grid-cols-4 md:grid-cols-12 gap-6" style={{ marginBottom: 'var(--spacing-3xl)' }}>
          {featuredPlaceholders.map((project, i) => (
            <motion.div
              key={project.slug}
              className="col-span-4 md:col-span-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
            >
              <Link href={`/${project.slug}`} className="block relative group" style={{ minHeight: '50vh' }}>
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.8) 0%, transparent 50%)' }} />
                <div className="relative h-full flex flex-col justify-end" style={{ minHeight: '50vh', padding: 'var(--spacing-2xl)' }}>
                  <h2
                    className="font-display font-medium text-text-primary"
                    style={{ fontSize: 'var(--text-3xl)', lineHeight: 'var(--leading-snug)', letterSpacing: 'var(--tracking-tight)' }}
                  >
                    {project.title}
                  </h2>
                  <p className="font-mono text-text-secondary mt-2" style={{ fontSize: 'var(--text-sm)', letterSpacing: 'var(--tracking-wide)' }}>
                    {project.client} · {project.year}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-4 md:grid-cols-12 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredPlaceholders.map((project) => (
            <motion.div
              key={project.slug}
              className="col-span-2 md:col-span-3"
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link href={`/${project.slug}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-[1.05]"
                    style={{ transitionDuration: 'var(--duration-normal)', transitionTimingFunction: 'var(--ease-smooth)' }}
                    sizes="(min-width: 768px) 25vw, 50vw"
                  />
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-4">
                  <h3 className="font-display font-medium text-text-primary truncate" style={{ fontSize: 'var(--text-base)' }}>
                    {project.title}
                  </h3>
                  <span className="font-mono text-text-tertiary flex-shrink-0" style={{ fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)' }}>
                    {project.year}
                  </span>
                </div>
                <p className="font-mono text-text-secondary mt-1" style={{ fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)' }}>
                  {project.client} · {project.category}
                </p>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}

function FilterTabs({ activeFilter, onFilter }: { activeFilter: string; onFilter: (v: string) => void }) {
  return (
    <div
      className="flex flex-wrap gap-4 border-b border-border"
      style={{ paddingBottom: 'var(--spacing-lg)', marginBottom: 'var(--spacing-2xl)' }}
    >
      {FILTER_TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onFilter(tab.value)}
          className={`font-mono transition-colors ${
            activeFilter === tab.value ? 'text-accent' : 'text-text-secondary hover:text-accent'
          }`}
          style={{
            fontSize: 'var(--text-sm)',
            letterSpacing: 'var(--tracking-wide)',
            transitionDuration: 'var(--duration-fast)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
