import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { IDEAS, IDEAS_BY_SLUG, nextIdea } from '@/lib/ideas'
import { IdeaExperience } from '@/components/landing/idea-experience'
import { smartTruncate } from '@/lib/seo/metadata'
import { JsonLd } from '@/lib/seo/json-ld'
import { articleSchema, breadcrumbSchema, type JsonLdObject } from '@/lib/seo/jsonld'

const SITE_URL = 'https://studiostudio.nyc'

export function generateStaticParams() {
  return IDEAS.map((idea) => ({ slug: idea.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const idea = IDEAS_BY_SLUG[slug]
  if (!idea) return {}

  const title = `${idea.title} — Studio Studio`
  const description = smartTruncate(idea.subtitle)
  const path = `/ideas/${slug}`
  const ogImages = [{ url: idea.image, width: 1200, height: 630, alt: idea.title }]

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'article',
      url: path,
      title,
      description,
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [idea.image],
    },
  }
}

export default async function IdeaPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const idea = IDEAS_BY_SLUG[slug]
  if (!idea) notFound()

  const jsonLd: JsonLdObject[] = [
    articleSchema({
      title: idea.title,
      path: `/ideas/${slug}`,
      description: idea.subtitle,
      imageUrl: idea.image,
      section: idea.category,
      // No datePublished — the Idea type carries no date. Adding one to
      // src/lib/ideas.ts would strengthen this schema.
    }),
    breadcrumbSchema({
      items: [
        { name: 'Home', url: SITE_URL },
        { name: 'Notes', url: `${SITE_URL}/ideas` },
        { name: idea.title, url: `${SITE_URL}/ideas/${slug}` },
      ],
    }),
  ]

  return (
    <>
      <JsonLd data={jsonLd} />
      <IdeaExperience idea={idea} next={nextIdea(slug)} />
    </>
  )
}
