import type { Metadata } from 'next'
import { IdeasIndex } from '@/components/landing/ideas-index'

const IDEAS_PAGE_TITLE = 'Ideas — Studio Studio'
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
  },
  twitter: {
    title: IDEAS_PAGE_TITLE,
    description: IDEAS_PAGE_DESCRIPTION,
  },
}

export default function IdeasPage() {
  return <IdeasIndex />
}
