import type { Metadata } from 'next'
import { AboutExperience } from '@/components/landing/about-experience'

const ABOUT_PAGE_TITLE = 'About — Studio Studio'
const ABOUT_PAGE_DESCRIPTION =
  'Studio Studio is the Brooklyn creative practice of Pablo Gnecco — experiential direction, creative technology, and lighting design for brands, agencies, and institutions. Trusted by HBO, Intel, Dolby, Michigan Central Station, and more.'

export const metadata: Metadata = {
  title: { absolute: ABOUT_PAGE_TITLE },
  description: ABOUT_PAGE_DESCRIPTION,
  alternates: { canonical: '/about' },
  openGraph: {
    title: ABOUT_PAGE_TITLE,
    description: ABOUT_PAGE_DESCRIPTION,
    url: '/about',
  },
  twitter: {
    title: ABOUT_PAGE_TITLE,
    description: ABOUT_PAGE_DESCRIPTION,
  },
}

export default function AboutPage() {
  return <AboutExperience />
}
