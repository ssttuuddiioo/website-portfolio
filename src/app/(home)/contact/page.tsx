import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo/metadata'
import { JsonLd } from '@/lib/seo/json-ld'
import { breadcrumbSchema } from '@/lib/seo/jsonld'
import { ContactExperience } from '@/components/landing/contact-experience'

const CONTACT_DESCRIPTION =
  'Get in touch with Studio Studio — experiential design and creative technology practice in Brooklyn, NY. New projects, collaborations, and consulting.'

export const metadata: Metadata = buildPageMetadata({
  title: 'Contact',
  description: CONTACT_DESCRIPTION,
  path: '/contact',
})

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema({
          items: [
            { name: 'Home', url: 'https://studiostudio.nyc' },
            { name: 'Contact', url: 'https://studiostudio.nyc/contact' },
          ],
        })}
      />
      <ContactExperience />
    </>
  )
}
