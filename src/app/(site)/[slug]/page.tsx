import type { Metadata } from 'next'
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
import { buildProjectMetadata } from '@/lib/seo/metadata'
import { JsonLd } from '@/lib/seo/json-ld'
import { breadcrumbSchema, creativeWorkSchema, type JsonLdObject } from '@/lib/seo/jsonld'

const SITE_URL = 'https://studiostudio.nyc'

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
}): Promise<Metadata> {
  const { slug } = await params

  const placeholder = PLACEHOLDER_PROJECTS[slug]
  if (placeholder) {
    return buildProjectMetadata({
      title: `${placeholder.title} — ${placeholder.client}`,
      slug,
      description: placeholder.about,
      ogImageUrl: placeholder.heroImage,
    })
  }

  if (!isSanityConfigured) return {}
  try {
    const project = await client.fetch<SanityProjectDetail>(PROJECT_DETAIL_QUERY, { slug })
    if (!project) return {}

    const ogSource = project.seo?.ogImage || project.ogImage || project.heroImage
    return buildProjectMetadata({
      title: project.title,
      seoTitle: project.seo?.title,
      slug,
      seoDescription: project.seo?.description || project.seoDescription,
      subtitle: project.subtitle,
      ogImageUrl: ogSource ? urlFor(ogSource).width(1200).height(630).url() : undefined,
    })
  } catch {
    return {}
  }
}

function buildProjectJsonLd(opts: {
  slug: string
  title: string
  description?: string
  client?: string
  clientUrl?: string
  year?: number | string
  category?: string
  keywords?: string[]
  heroImageUrl?: string
  location?: string
}): JsonLdObject[] {
  return [
    creativeWorkSchema({
      title: opts.title,
      slug: opts.slug,
      description: opts.description,
      client: opts.client,
      clientUrl: opts.clientUrl,
      year: opts.year,
      category: opts.category,
      keywords: opts.keywords,
      heroImageUrl: opts.heroImageUrl,
      location: opts.location,
    }),
    breadcrumbSchema({
      items: [
        { name: 'Home', url: SITE_URL },
        { name: 'Work', url: `${SITE_URL}/work` },
        { name: opts.title, url: `${SITE_URL}/${opts.slug}` },
      ],
    }),
  ]
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
      const jsonLd = buildProjectJsonLd({
        slug,
        title: placeholder.title,
        description: placeholder.about,
        client: placeholder.client,
        year: placeholder.year,
        category: placeholder.category,
        keywords: placeholder.role,
        heroImageUrl: placeholder.heroImage,
      })
      return (
        <>
          <JsonLd data={jsonLd} />
          <PlaceholderProjectPage project={placeholder} />
        </>
      )
    }
    notFound()
  }

  const heroImageUrl = project.heroImage
    ? urlFor(project.heroImage).width(1200).height(630).url()
    : undefined
  const projectJsonLd = buildProjectJsonLd({
    slug,
    title: project.title,
    description: project.seo?.description || project.seoDescription || project.subtitle,
    client: project.client,
    clientUrl: project.clientUrl,
    year: project.year,
    category: project.category?.title,
    keywords: project.tags,
    heroImageUrl,
    location: project.location,
  })

  return (
    <article>
      <JsonLd data={projectJsonLd} />
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
