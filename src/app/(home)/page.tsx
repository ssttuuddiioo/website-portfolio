import type { Metadata } from 'next'
import { LandingExperience } from '@/components/landing/landing-experience'
import { HOMEPAGE_DESCRIPTION } from '@/lib/seo/metadata'

const HOMEPAGE_TITLE =
  'Studio Studio — Experiential Design & Creative Technology, NYC'

export const metadata: Metadata = {
  title: { absolute: HOMEPAGE_TITLE },
  description: HOMEPAGE_DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    title: HOMEPAGE_TITLE,
    description: HOMEPAGE_DESCRIPTION,
    url: '/',
  },
  twitter: {
    title: HOMEPAGE_TITLE,
    description: HOMEPAGE_DESCRIPTION,
  },
}

export default function HomePage() {
  return <LandingExperience />
}
