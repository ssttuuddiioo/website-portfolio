'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { SanityProject } from '@/lib/sanity/types'
import { urlFor } from '@/lib/sanity/image'

interface FeaturedCardProps {
  project: SanityProject
  index: number
}

export function FeaturedCard({ project, index }: FeaturedCardProps) {
  const imageUrl = project.heroImage?.asset?.url
  const lqip = project.heroImage?.asset?.metadata?.lqip

  return (
    <motion.div
      className="col-span-4 md:col-span-6"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
        delay: index === 0 ? 0 : 0.1,
      }}
    >
      <Link
        href={`/${project.slug.current}`}
        className="block relative group"
        style={{ minHeight: '65vh' }}
      >
        {/* Background image */}
        {imageUrl ? (
          <Image
            src={urlFor(project.heroImage).width(1920).height(1080).url()}
            alt={project.heroImage?.alt || project.title}
            fill
            className="object-cover"
            sizes="100vw"
            placeholder={lqip ? 'blur' : undefined}
            blurDataURL={lqip || undefined}
          />
        ) : (
          <div className="absolute inset-0 bg-bg-surface" />
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(10,10,10,0.8) 0%, transparent 50%)',
          }}
        />

        {/* Content */}
        <div
          className="relative h-full flex flex-col justify-end"
          style={{
            minHeight: '65vh',
            padding: 'var(--spacing-2xl) var(--gutter)',
          }}
        >
          <h2
            className="font-display font-medium text-text-primary"
            style={{
              fontSize: 'var(--text-3xl)',
              lineHeight: 'var(--leading-snug)',
              letterSpacing: 'var(--tracking-tight)',
            }}
          >
            {project.title}
          </h2>
          <p
            className="font-mono text-text-secondary mt-2"
            style={{
              fontSize: 'var(--text-sm)',
              letterSpacing: 'var(--tracking-wide)',
            }}
          >
            {[project.client, project.year].filter(Boolean).join(' · ')}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}
