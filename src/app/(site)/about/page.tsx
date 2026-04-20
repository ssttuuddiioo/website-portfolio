import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo/metadata'
import { JsonLd } from '@/lib/seo/json-ld'
import { breadcrumbSchema } from '@/lib/seo/jsonld'

const ABOUT_DESCRIPTION =
  'Studio Studio is Pablo Gnecco — Colombian-born experiential director and creative technologist in Brooklyn. Work for HBO, Google, Intel, Dolby. NEW INC and Mana Contemporary.'

export const metadata: Metadata = buildPageMetadata({
  title: 'About',
  description: ABOUT_DESCRIPTION,
  path: '/about',
})

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema({
          items: [
            { name: 'Home', url: 'https://studiostudio.nyc' },
            { name: 'About', url: 'https://studiostudio.nyc/about' },
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
          About
        </h1>
        <p
          className="font-display text-text-secondary mt-6"
          style={{
            fontSize: 'var(--text-lg)',
            lineHeight: 'var(--leading-relaxed)',
            maxWidth: '60ch',
          }}
        >
          {ABOUT_DESCRIPTION}
        </p>
      </section>
    </>
  )
}
