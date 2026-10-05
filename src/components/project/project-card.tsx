'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { SanityProject } from '@/lib/sanity/types'
import { urlFor } from '@/lib/sanity/image'

interface ProjectCardProps {
  project: SanityProject
}

export function ProjectCard({ project }: ProjectCardProps) {
  const thumbnailUrl = project.thumbnail?.asset?.url || project.heroImage?.asset?.url
  const lqip = project.thumbnail?.asset?.metadata?.lqip || project.heroImage?.asset?.metadata?.lqip

  return (
    <Link
      href={`/work/${project.slug.current}`}
      className="group block"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-bg-surface">
        {thumbnailUrl ? (
          <Image
            src={urlFor(project.thumbnail || project.heroImage).width(800).height(600).url()}
            alt={project.thumbnail?.alt || project.heroImage?.alt || project.title}
            fill
            className="object-cover transition-transform"
            style={{
              transitionDuration: 'var(--duration-normal)',
              transitionTimingFunction: 'var(--ease-smooth)',
            }}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            placeholder={lqip ? 'blur' : undefined}
            blurDataURL={lqip || undefined}
          />
        ) : (
          <div className="absolute inset-0 bg-bg-surface" />
        )}

        {/* Hover scale */}
        <div
          className="absolute inset-0 group-hover:scale-103 transition-transform"
          style={{
            transitionDuration: 'var(--duration-normal)',
            transitionTimingFunction: 'var(--ease-smooth)',
          }}
        />
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-4">
        <h3
          className="font-display font-medium text-text-primary truncate"
          style={{ fontSize: 'var(--text-base)' }}
        >
          {project.title}
        </h3>
        {project.year && (
          <span
            className="font-mono text-text-tertiary flex-shrink-0"
            style={{
              fontSize: 'var(--text-xs)',
              letterSpacing: 'var(--tracking-wide)',
            }}
          >
            {project.year}
          </span>
        )}
      </div>

      {(project.client || project.category) && (
        <p
          className="font-mono text-text-secondary mt-1"
          style={{
            fontSize: 'var(--text-xs)',
            letterSpacing: 'var(--tracking-wide)',
          }}
        >
          {[project.client, project.category?.title].filter(Boolean).join(' · ')}
        </p>
      )}
    </Link>
  )
}
