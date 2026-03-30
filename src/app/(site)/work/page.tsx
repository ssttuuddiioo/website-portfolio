import { Suspense } from 'react'
import { client, isSanityConfigured } from '@/lib/sanity/client'
import { PROJECT_INDEX_QUERY } from '@/lib/sanity/queries'
import type { SanityProject } from '@/lib/sanity/types'
import { WorkPageClient } from './work-client'

export const revalidate = 60

export const metadata = {
  title: 'Work',
  description: 'Selected projects by Studio Studio — experiential installations, custom software, and lighting design.',
}

export default async function WorkPage() {
  let projects: SanityProject[] = []

  if (isSanityConfigured) {
    try {
      projects = await client.fetch(PROJECT_INDEX_QUERY)
    } catch {
      // Sanity fetch failed — use empty array
    }
  }

  return (
    <section
      style={{
        paddingTop: 'calc(80px + var(--spacing-3xl))',
        paddingBottom: 'var(--spacing-section)',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--max-width)',
          margin: '0 auto',
          padding: '0 var(--gutter)',
        }}
      >
        <h1
          className="font-display font-light text-text-primary"
          style={{
            fontSize: 'var(--text-4xl)',
            lineHeight: 'var(--leading-tight)',
            letterSpacing: 'var(--tracking-tight)',
            marginBottom: 'var(--spacing-3xl)',
          }}
        >
          Work
        </h1>

        <Suspense>
          <WorkPageClient projects={projects} />
        </Suspense>
      </div>
    </section>
  )
}
