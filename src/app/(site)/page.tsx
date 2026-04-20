import type { Metadata } from 'next'
import { HeroSection } from '@/components/sections/hero'
import { FeaturedProjects } from '@/components/sections/featured-projects'
import { ClientLogos } from '@/components/sections/client-logos'
import { ServicesStrip } from '@/components/sections/services-strip'
import { IndexTeaser } from '@/components/sections/index-teaser'
import { AboutTeaser } from '@/components/sections/about-teaser'
import { ContactSection } from '@/components/sections/contact-section'
import { HOMEPAGE_DESCRIPTION } from '@/lib/seo/metadata'

const HOMEPAGE_TITLE = 'Studio Studio — Experiential Design & Creative Technology, NYC'

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
  return (
    <>
      <HeroSection />
      <FeaturedProjects />
      <ClientLogos />
      <ServicesStrip />
      <IndexTeaser />
      <AboutTeaser />
      <ContactSection />
    </>
  )
}
