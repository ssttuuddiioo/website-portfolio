import type { Metadata } from 'next'
import { AgencyExperience } from '@/components/landing/agency-experience'

const AGENCY_TITLE =
  'Studio Studio — Experiential Design & Creative Technology Agency, NYC'
const AGENCY_DESCRIPTION =
  'A New York creative studio building installations, brand activations, and interactive environments for ambitious teams. Trusted by The New Museum, Intel, Dolby, HBO, Netflix, and more.'

export const metadata: Metadata = {
  title: { absolute: AGENCY_TITLE },
  description: AGENCY_DESCRIPTION,
  alternates: { canonical: '/agency' },
  openGraph: {
    title: AGENCY_TITLE,
    description: AGENCY_DESCRIPTION,
    url: '/agency',
  },
  twitter: {
    title: AGENCY_TITLE,
    description: AGENCY_DESCRIPTION,
  },
}

export default function AgencyPage() {
  return <AgencyExperience />
}
