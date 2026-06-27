import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PLACEHOLDER_PROJECTS } from '@/lib/placeholder-projects'
import { ProjectExperience } from '@/components/landing/project-experience'
import { buildProjectMetadata } from '@/lib/seo/metadata'

export const revalidate = 60

export function generateStaticParams() {
  return Object.keys(PLACEHOLDER_PROJECTS).map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = PLACEHOLDER_PROJECTS[slug]
  if (!project) return {}
  return buildProjectMetadata({
    title: `${project.title} — ${project.client}`,
    slug,
    description: project.about,
    ogImageUrl: project.heroImage,
  })
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = PLACEHOLDER_PROJECTS[slug]
  if (!project) notFound()
  return <ProjectExperience project={project} />
}
