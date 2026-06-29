import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { IDEAS, IDEAS_BY_SLUG, nextIdea } from '@/lib/ideas'
import { IdeaExperience } from '@/components/landing/idea-experience'
import { smartTruncate } from '@/lib/seo/metadata'

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
  return <IdeaExperience idea={idea} next={nextIdea(slug)} />
}
