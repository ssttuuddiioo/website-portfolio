import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProjectPage, getProjectSlugs } from '@/lib/project-page'
import { ProjectExperience } from '@/components/landing/project-experience'
import { buildProjectMetadata } from '@/lib/seo/metadata'
import { JsonLd } from '@/lib/seo/json-ld'
import {
  breadcrumbSchema,
  creativeWorkSchema,
  type JsonLdObject,
} from '@/lib/seo/jsonld'

const SITE_URL = 'https://studiostudio.nyc'

export const revalidate = 60

export async function generateStaticParams() {
  return (await getProjectSlugs()).map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = await getProjectPage(slug)
  if (!project) return {}
  return buildProjectMetadata({
    title: `${project.title} — ${project.client}`,
    slug,
    // These pages live at /work/[slug], not the legacy root-level /[slug].
    // The canonical has to point at this page's own URL.
    path: `/work/${slug}`,
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
  const project = await getProjectPage(slug)
  if (!project) notFound()

  const jsonLd: JsonLdObject[] = [
    creativeWorkSchema({
      title: project.title,
      slug,
      path: `/work/${slug}`,
      description: project.about,
      client: project.client,
      year: project.year,
      location: project.location,
      category: project.category,
      // The category already leads the keywords, and a Sanity page's
      // discipline is the same string.
      keywords: [project.discipline, ...project.role].filter(
        (k) => k !== project.category,
      ),
      heroImageUrl: project.heroImage,
    }),
    breadcrumbSchema({
      items: [
        { name: 'Home', url: SITE_URL },
        { name: 'Work', url: `${SITE_URL}/work` },
        { name: project.title, url: `${SITE_URL}/work/${slug}` },
      ],
    }),
  ]

  return (
    <>
      <JsonLd data={jsonLd} />
      <ProjectExperience project={project} />
    </>
  )
}
