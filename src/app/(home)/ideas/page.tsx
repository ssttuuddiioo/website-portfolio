import type { Metadata } from 'next'
import { IDEAS } from '@/lib/ideas'
import { DEFAULT_OG_IMAGE } from '@/lib/seo/metadata'
import { IdeasIndex } from '@/components/landing/ideas-index'
import { JsonLd } from '@/lib/seo/json-ld'
import { breadcrumbSchema, itemListSchema, type JsonLdObject } from '@/lib/seo/jsonld'

const SITE_URL = 'https://studiostudio.nyc'

const IDEAS_PAGE_TITLE = 'Notes — Studio Studio'
const IDEAS_PAGE_DESCRIPTION =
  'Notes from the studio — experiments, stories, resources, and the occasional half-finished thought from Pablo Gnecco of Studio Studio.'

export const metadata: Metadata = {
  title: { absolute: IDEAS_PAGE_TITLE },
  description: IDEAS_PAGE_DESCRIPTION,
  alternates: { canonical: '/ideas' },
  openGraph: {
    title: IDEAS_PAGE_TITLE,
    description: IDEAS_PAGE_DESCRIPTION,
    url: '/ideas',
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    title: IDEAS_PAGE_TITLE,
    description: IDEAS_PAGE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
}

export default function IdeasPage() {
  const jsonLd: JsonLdObject[] = [
    itemListSchema({
      name: 'Notes from Studio Studio',
      items: IDEAS.map((idea) => ({
        name: idea.title,
        path: `/ideas/${idea.slug}`,
      })),
    }),
    breadcrumbSchema({
      items: [
        { name: 'Home', url: SITE_URL },
        { name: 'Notes', url: `${SITE_URL}/ideas` },
      ],
    }),
  ]

  return (
    <>
      <JsonLd data={jsonLd} />
      <IdeasIndex />
    </>
  )
}
