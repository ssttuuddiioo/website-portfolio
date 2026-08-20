import type { Metadata } from 'next'

const SITE_NAME = 'Studio Studio'
const SITE_URL = 'https://studiostudio.nyc'

// Fallback share card for every page that doesn't set its own (project and
// note pages override it with their own hero image). A static JPEG rather than
// a generated card — JPEG is the format every social platform reliably decodes,
// and it's cropped from the source AVIF by `node scripts/make-og-image.mjs`.
//
// Exported because Next.js *replaces* rather than deep-merges a page's
// `openGraph` object — any page that declares its own has to re-state the
// image or it ships with no share card at all.
export const DEFAULT_OG_IMAGE = {
  url: '/og-default.jpg',
  width: 1200,
  height: 630,
  // Described rather than named: the source file is light-around-us2.avif but
  // landing-projects.ts assigns it to Suffolk Building, so the project it
  // belongs to is ambiguous. Don't claim one in the alt text.
  alt: 'A figure silhouetted against curved blue light — Studio Studio',
}

// Verbatim from docs/MIGRATION.md — preserves existing homepage description.
// Do not paraphrase or edit for grammar.
export const HOMEPAGE_DESCRIPTION =
  "Studio Studio is an interactive installation company in New York City. Inaugural members of the New Museum's, NEWINC, we strive to create new immersive experiences through collaboration with artists, engineers, and designers. We like art, light, code, and coffee. Let's make things together."

export function smartTruncate(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text
  const truncated = text.slice(0, maxLength - 1)
  const lastSpace = truncated.lastIndexOf(' ')
  const cutPoint = lastSpace > maxLength - 20 ? lastSpace : truncated.length
  return truncated.slice(0, cutPoint).trimEnd() + '…'
}

export function buildRootMetadata(): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: SITE_NAME,
      template: `%s — ${SITE_NAME}`,
    },
    description: HOMEPAGE_DESCRIPTION,
    applicationName: SITE_NAME,
    openGraph: {
      siteName: SITE_NAME,
      type: 'website',
      locale: 'en_US',
      url: SITE_URL,
      title: SITE_NAME,
      description: HOMEPAGE_DESCRIPTION,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE_NAME,
      description: HOMEPAGE_DESCRIPTION,
      images: [DEFAULT_OG_IMAGE.url],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export interface ProjectMetaInput {
  title: string
  slug: string
  /**
   * The route this page actually lives at. Canonicals must point at the page's
   * own URL — defaults to the legacy root-level `/[slug]` route, so the newer
   * `/work/[slug]` route has to pass its own path explicitly.
   */
  path?: string
  seoTitle?: string
  seoDescription?: string
  subtitle?: string
  description?: string
  ogImageUrl?: string
}

export function buildProjectMetadata(input: ProjectMetaInput): Metadata {
  const title = input.seoTitle ?? input.title
  const rawDescription =
    input.seoDescription ?? input.subtitle ?? input.description ?? ''
  const description = rawDescription ? smartTruncate(rawDescription) : undefined

  const canonicalPath = input.path ?? `/${input.slug}`
  const ogImages = input.ogImageUrl
    ? [{ url: input.ogImageUrl, width: 1200, height: 630, alt: title }]
    : undefined

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: 'article',
      url: canonicalPath,
      title,
      description,
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: input.ogImageUrl ? [input.ogImageUrl] : undefined,
    },
  }
}

export interface PageMetaInput {
  title: string
  description: string
  path: string
}

export function buildPageMetadata({
  title,
  description,
  path,
}: PageMetaInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      url: path,
      title: `${title} — ${SITE_NAME}`,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — ${SITE_NAME}`,
      description,
      images: [DEFAULT_OG_IMAGE.url],
    },
  }
}
