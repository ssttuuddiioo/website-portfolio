import type { Metadata } from 'next'
import { AgencyExperience } from '@/components/landing/agency-experience'
import { LegacyHashRedirect } from '@/components/legacy-hash-redirect'
import { DEFAULT_OG_IMAGE, HOMEPAGE_DESCRIPTION } from '@/lib/seo/metadata'

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
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    title: HOMEPAGE_TITLE,
    description: HOMEPAGE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
}

export default function HomePage() {
  return (
    <>
      {/* Old Squarespace links arrive as #fragments, which never reach the
          server — this catches them on the client. See legacy-redirects.ts. */}
      <LegacyHashRedirect />
      <AgencyExperience />
    </>
  )
}
