import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo/metadata'
import { JsonLd } from '@/lib/seo/json-ld'
import { breadcrumbSchema } from '@/lib/seo/jsonld'

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
      <section
        style={{
          maxWidth: 'var(--max-width)',
          margin: '0 auto',
          padding: 'var(--spacing-3xl) var(--gutter) var(--spacing-section)',
        }}
      >
        <h1
          className="font-display font-light text-text-primary"
          style={{
            fontSize: 'var(--text-4xl)',
            lineHeight: 'var(--leading-snug)',
            letterSpacing: 'var(--tracking-tight)',
          }}
        >
          Contact
        </h1>
        <p
          className="font-display text-text-secondary mt-6"
          style={{
            fontSize: 'var(--text-lg)',
            lineHeight: 'var(--leading-relaxed)',
            maxWidth: '60ch',
          }}
        >
          {CONTACT_DESCRIPTION}
        </p>
        <p className="mt-6">
          <a
            href="mailto:pablo@studiostudio.nyc"
            className="font-display text-accent"
            style={{ fontSize: 'var(--text-xl)' }}
          >
            pablo@studiostudio.nyc
          </a>
        </p>
      </section>
    </>
  )
}
