import type { Metadata } from 'next'
import { FAQS } from '@/lib/faqs'
import { DEFAULT_OG_IMAGE } from '@/lib/seo/metadata'
import { AboutExperience } from '@/components/landing/about-experience'
import { JsonLd } from '@/lib/seo/json-ld'
import { breadcrumbSchema, faqSchema, type JsonLdObject } from '@/lib/seo/jsonld'

const SITE_URL = 'https://studiostudio.nyc'

const ABOUT_PAGE_TITLE = 'About — Studio Studio'
const ABOUT_PAGE_DESCRIPTION =
  'Studio Studio is an art and technology studio in Brooklyn, founded by Pablo Gnecco. Artworks, commissions, installations, software, and light for galleries, festivals, institutions, agencies, and brands.'

export const metadata: Metadata = {
  title: { absolute: ABOUT_PAGE_TITLE },
  description: ABOUT_PAGE_DESCRIPTION,
  alternates: { canonical: '/about' },
  openGraph: {
    title: ABOUT_PAGE_TITLE,
    description: ABOUT_PAGE_DESCRIPTION,
    url: '/about',
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    title: ABOUT_PAGE_TITLE,
    description: ABOUT_PAGE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
}

export default function AboutPage() {
  const jsonLd: JsonLdObject[] = [
    // Built from the same FAQS array the accordion renders, so the structured
    // data can never drift from what's on the page.
    faqSchema(FAQS),
    breadcrumbSchema({
      items: [
        { name: 'Home', url: SITE_URL },
        { name: 'About', url: `${SITE_URL}/about` },
      ],
    }),
  ]

  return (
    <>
      <JsonLd data={jsonLd} />
      <AboutExperience />
    </>
  )
}
