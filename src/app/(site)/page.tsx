import { HeroSection } from '@/components/sections/hero'
import { FeaturedProjects } from '@/components/sections/featured-projects'
import { ClientLogos } from '@/components/sections/client-logos'
import { ServicesStrip } from '@/components/sections/services-strip'
import { IndexTeaser } from '@/components/sections/index-teaser'
import { AboutTeaser } from '@/components/sections/about-teaser'
import { ContactSection } from '@/components/sections/contact-section'

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
