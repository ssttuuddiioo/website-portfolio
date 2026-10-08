import type { Metadata } from 'next'
import { AgencyExperience } from '@/components/landing/agency-experience'
import { LegacyHashRedirect } from '@/components/legacy-hash-redirect'
import { getLandingProjectPages } from '@/lib/project-page'
import { DEFAULT_OG_IMAGE, HOMEPAGE_DESCRIPTION } from '@/lib/seo/metadata'

// Same window as /work/[slug]: the fold shows those pages' content.
export const revalidate = 60

const HOMEPAGE_TITLE =
  'Studio Studio | Experiential Design & Creative Technology, NYC'

export const metadata: Metadata = {
  title: { absolute: HOMEPAGE_TITLE },
  description: HOMEPAGE_DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    title: HOMEPAGE_TITLE,
    description: HOMEPAGE_DESCRIPTION,
    url: '/',
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    title: HOMEPAGE_TITLE,
    description: HOMEPAGE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
}

export default async function HomePage() {
  // Every project's page, so whichever one the trail rests on can be shown
  // below the fold without a round trip.
  const projectPages = await getLandingProjectPages()
  return (
    <>
      {/* Old Squarespace links arrive as #fragments, which never reach the
          server — this catches them on the client. See legacy-redirects.ts. */}
      <LegacyHashRedirect />
      <AgencyExperience projectPages={projectPages} />
    </>
  )
}
