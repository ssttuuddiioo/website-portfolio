import { notFound } from 'next/navigation'
import { client, isSanityConfigured } from '@/lib/sanity/client'
import { PROJECT_DETAIL_QUERY, PROJECT_SLUGS_QUERY } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
import type { SanityProjectDetail } from '@/lib/sanity/types'
import { PLACEHOLDER_PROJECTS } from '@/lib/placeholder-projects'
import { PlaceholderProjectPage } from '@/components/project/placeholder-project-page'
import { ProjectHero } from '@/components/project/project-hero'
import { ProjectMeta } from '@/components/project/project-meta'
import { ProjectBody } from '@/components/project/project-body'
import { Collaborators } from '@/components/project/collaborators'
import { NextProject } from '@/components/project/next-project'

export const revalidate = 60

export async function generateStaticParams() {
  const placeholderSlugs = Object.keys(PLACEHOLDER_PROJECTS).map((slug) => ({ slug }))

  if (!isSanityConfigured) return placeholderSlugs
  try {
    const slugs = await client.fetch<{ slug: string }[]>(PROJECT_SLUGS_QUERY)
    const sanitySlugs = slugs.map((s) => ({ slug: s.slug }))
    // Merge, dedupe
    const allSlugs = new Map<string, { slug: string }>()
    for (const s of [...placeholderSlugs, ...sanitySlugs]) {
      allSlugs.set(s.slug, s)
    }
    return Array.from(allSlugs.values())
  } catch {
    return placeholderSlugs
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // Check placeholder data
  const placeholder = PLACEHOLDER_PROJECTS[slug]
  if (placeholder) {
    return {
      title: `${placeholder.title} — ${placeholder.client} | Studio Studio`,
      description: placeholder.about.slice(0, 160),
    }
  }

  if (!isSanityConfigured) return {}
  try {
    const project = await client.fetch<SanityProjectDetail>(PROJECT_DETAIL_QUERY, { slug })
    if (!project) return {}

    return {
      title: project.title,
      description: project.seoDescription || project.subtitle,
      openGraph: {
        images: (project.ogImage || project.heroImage)
          ? [urlFor(project.ogImage || project.heroImage).width(1200).url()]
          : [],
      },
    }
  } catch {
    return {}
  }
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // Try Sanity first
  let project: SanityProjectDetail | null = null

  if (isSanityConfigured) {
    try {
      project = await client.fetch<SanityProjectDetail>(PROJECT_DETAIL_QUERY, { slug })
    } catch {
      // Sanity fetch failed
    }
  }

  // Fall back to placeholder data
  if (!project) {
    const placeholder = PLACEHOLDER_PROJECTS[slug]
    if (placeholder) {
      return <PlaceholderProjectPage project={placeholder} />
    }
    notFound()
  }

  return (
    <article>
      <ProjectHero project={project} />

      <div
        style={{
          maxWidth: 'var(--max-width)',
          margin: '0 auto',
          padding: 'var(--spacing-2xl) var(--gutter) var(--spacing-section)',
        }}
      >
        <h1
          className="font-display font-light text-text-primary"
          style={{
            fontSize: 'var(--text-4xl)',
            lineHeight: 'var(--leading-snug)',
            letterSpacing: 'var(--tracking-tight)',
          }}
        >
          {project.title}
        </h1>

        {project.subtitle && (
          <p
            className="font-display text-text-secondary mt-3"
            style={{
              fontSize: 'var(--text-lg)',
              lineHeight: 'var(--leading-normal)',
            }}
          >
            {project.subtitle}
          </p>
        )}

        <ProjectMeta project={project} />

        {project.body && <ProjectBody body={project.body} />}

        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2" style={{ margin: 'var(--spacing-2xl) 0' }}>
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-text-secondary bg-bg-surface px-3 py-1"
                style={{
                  fontSize: 'var(--text-xs)',
                  letterSpacing: 'var(--tracking-wider)',
                  textTransform: 'uppercase',
                  borderRadius: '2px',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {project.collaborators && project.collaborators.length > 0 && (
          <Collaborators list={project.collaborators} />
        )}

        {project.nextProject && <NextProject project={project.nextProject} />}
      </div>
    </article>
  )
}
