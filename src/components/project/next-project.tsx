import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity/image'

interface NextProjectProps {
  project: {
    title: string
    slug: { current: string }
    thumbnail?: {
      asset: {
        url: string
        metadata?: { lqip?: string }
      }
    }
  }
}

export function NextProject({ project }: NextProjectProps) {
  return (
    <section
      className="border-t border-border"
      style={{
        padding: 'var(--spacing-3xl) 0',
        margin: 'var(--spacing-3xl) 0 0',
      }}
    >
      <p
        className="font-mono text-text-tertiary mb-6"
        style={{
          fontSize: 'var(--text-xs)',
          letterSpacing: 'var(--tracking-wider)',
          textTransform: 'uppercase',
        }}
      >
        Next Project
      </p>

      <Link
        href={`/work/${project.slug.current}`}
        className="group flex items-center gap-6"
      >
        {project.thumbnail?.asset?.url && (
          <div className="relative w-24 h-18 flex-shrink-0 overflow-hidden bg-bg-surface">
            <Image
              src={urlFor(project.thumbnail).width(200).height(150).url()}
              alt={project.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              style={{
                transitionDuration: 'var(--duration-normal)',
                transitionTimingFunction: 'var(--ease-smooth)',
              }}
              sizes="96px"
            />
          </div>
        )}
        <h3
          className="font-display font-medium text-text-primary group-hover:text-accent transition-colors"
          style={{
            fontSize: 'var(--text-xl)',
            transitionDuration: 'var(--duration-fast)',
          }}
        >
          {project.title} →
        </h3>
      </Link>
    </section>
  )
}
