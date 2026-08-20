import type {
  SanityPerson,
  SiteSettingsForOrg,
} from '@/lib/sanity/types'

const SITE_URL = 'https://studiostudio.nyc'

export type JsonLdObject = Record<string, unknown>

/* ============================================================
   Hardcoded fallbacks — used when Sanity is empty or unreachable.
   Keep in sync with docs/MIGRATION.md Organization schema template.
   ============================================================ */

const FALLBACK_ORG_DESCRIPTION =
  "Studio Studio is an interactive installation company in New York City. Inaugural members of the New Museum's NEW INC, we create immersive experiences through collaboration with artists, engineers, and designers."

const FALLBACK_ORG = {
  name: 'Studio Studio',
  alternateName: 'Studio Studio NYC',
  logo: `${SITE_URL}/logo.png`,
  description: FALLBACK_ORG_DESCRIPTION,
  address: {
    locality: 'Brooklyn',
    region: 'NY',
    country: 'US',
  },
  memberOf: [
    { name: 'NEW INC', url: 'https://www.newinc.org' },
    { name: 'Mana Contemporary', url: 'https://www.manacontemporary.com' },
  ],
  knowsAbout: [
    'Experiential design',
    'Creative technology',
    'Lighting design',
    'Interactive installations',
    'Immersive environments',
  ],
  sameAs: ['https://instagram.com/yopablo', 'https://yopablo.com'],
}

const FALLBACK_PERSON = {
  name: 'Pablo Gnecco',
  jobTitle: 'Experiential Director & Creative Technologist',
  url: 'https://yopablo.com',
  socials: ['https://instagram.com/yopablo'],
}

function nonEmpty<T>(value: T | undefined | null): value is T {
  if (value === undefined || value === null) return false
  if (typeof value === 'string' && value.trim() === '') return false
  if (Array.isArray(value) && value.length === 0) return false
  return true
}

/* ============================================================
   Organization schema
   ============================================================ */

export function organizationSchema(settings?: SiteSettingsForOrg | null): JsonLdObject {
  const s = settings ?? {}
  const founder = s.founder

  const address = s.address ?? FALLBACK_ORG.address
  const memberOf =
    nonEmpty(s.memberOf) ? s.memberOf! : FALLBACK_ORG.memberOf
  const knowsAbout =
    nonEmpty(s.knowsAbout) ? s.knowsAbout! : FALLBACK_ORG.knowsAbout
  const sameAs = nonEmpty(s.sameAs) ? s.sameAs! : FALLBACK_ORG.sameAs

  const logoUrl = s.logo?.asset?.url ?? FALLBACK_ORG.logo

  const schema: JsonLdObject = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: s.orgName ?? FALLBACK_ORG.name,
    alternateName: s.orgAlternateName ?? FALLBACK_ORG.alternateName,
    url: SITE_URL,
    logo: logoUrl,
    description: s.orgDescription ?? FALLBACK_ORG.description,
  }

  schema.founder = founder
    ? buildFounderSubgraph(founder)
    : {
        '@type': 'Person',
        name: FALLBACK_PERSON.name,
        jobTitle: FALLBACK_PERSON.jobTitle,
        url: FALLBACK_PERSON.url,
      }

  if (address.locality || address.region || address.country) {
    schema.address = {
      '@type': 'PostalAddress',
      ...(address.locality ? { addressLocality: address.locality } : {}),
      ...(address.region ? { addressRegion: address.region } : {}),
      ...(address.country ? { addressCountry: address.country } : {}),
    }
  }

  schema.memberOf = memberOf.map((m) => ({
    '@type': 'Organization',
    name: m.name,
    ...(m.url ? { url: m.url } : {}),
  }))

  schema.knowsAbout = knowsAbout
  schema.sameAs = sameAs

  return schema
}

function buildFounderSubgraph(p: SanityPerson) {
  const sub: JsonLdObject = {
    '@type': 'Person',
    name: p.name,
  }
  if (p.jobTitle) sub.jobTitle = p.jobTitle
  if (p.url) sub.url = p.url
  return sub
}

/* ============================================================
   Person schema
   ============================================================ */

export function personSchema(p?: SanityPerson | null): JsonLdObject {
  const name = p?.name ?? FALLBACK_PERSON.name
  const jobTitle = p?.jobTitle ?? FALLBACK_PERSON.jobTitle
  const url = p?.url ?? FALLBACK_PERSON.url
  const socials = nonEmpty(p?.socials) ? p!.socials! : FALLBACK_PERSON.socials

  const schema: JsonLdObject = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    jobTitle,
    url,
    worksFor: {
      '@type': 'Organization',
      name: 'Studio Studio',
      url: SITE_URL,
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Brooklyn',
      addressRegion: 'NY',
      addressCountry: 'US',
    },
    sameAs: socials,
  }
  return schema
}

/* ============================================================
   CreativeWork schema
   ============================================================ */

export interface CreativeWorkInput {
  title: string
  slug: string
  /** Route the work is published at. Defaults to the legacy `/[slug]`. */
  path?: string
  description?: string
  client?: string
  clientUrl?: string
  year?: number | string
  category?: string
  keywords?: string[]
  heroImageUrl?: string
  location?: string
}

export function creativeWorkSchema(input: CreativeWorkInput): JsonLdObject {
  const schema: JsonLdObject = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: input.title,
    url: `${SITE_URL}${input.path ?? `/${input.slug}`}`,
    creator: {
      '@type': 'Organization',
      name: 'Studio Studio',
      url: SITE_URL,
    },
  }

  if (input.description) schema.description = input.description
  if (input.client) {
    schema.commissionedBy = {
      '@type': 'Organization',
      name: input.client,
      ...(input.clientUrl ? { url: input.clientUrl } : {}),
    }
  }
  if (input.year) schema.dateCreated = String(input.year)
  if (input.location) {
    schema.locationCreated = { '@type': 'Place', name: input.location }
  }
  const keywords = [
    ...(input.category ? [input.category] : []),
    ...(input.keywords ?? []),
  ]
  if (keywords.length > 0) schema.keywords = keywords.join(', ')
  if (input.heroImageUrl) schema.image = input.heroImageUrl

  return schema
}

/* ============================================================
   BreadcrumbList schema
   ============================================================ */

export interface BreadcrumbItem {
  name: string
  url: string
}

export function breadcrumbSchema({ items }: { items: BreadcrumbItem[] }): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/* ============================================================
   Article schema — /ideas/[slug]
   ============================================================ */

export interface ArticleInput {
  title: string
  path: string
  description?: string
  imageUrl?: string
  /** Maps to schema.org articleSection (our "Experiments"/"Stories"/etc). */
  section?: string
  /** ISO date. Omitted entirely when the source data has no date. */
  datePublished?: string
}

export function articleSchema(input: ArticleInput): JsonLdObject {
  const schema: JsonLdObject = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    url: `${SITE_URL}${input.path}`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}${input.path}`,
    },
    author: {
      '@type': 'Person',
      name: FALLBACK_PERSON.name,
      url: FALLBACK_PERSON.url,
    },
    publisher: {
      '@type': 'Organization',
      name: FALLBACK_ORG.name,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: FALLBACK_ORG.logo,
      },
    },
  }

  if (input.description) schema.description = input.description
  if (input.section) schema.articleSection = input.section
  if (input.datePublished) schema.datePublished = input.datePublished
  if (input.imageUrl) {
    schema.image = input.imageUrl.startsWith('http')
      ? input.imageUrl
      : `${SITE_URL}${input.imageUrl}`
  }

  return schema
}

/* ============================================================
   FAQPage schema
   ============================================================ */

export interface FaqItem {
  q: string
  a: string
}

export function faqSchema(items: FaqItem[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }
}

/* ============================================================
   ItemList schema — index pages (/ideas)
   ============================================================ */

export interface ItemListEntry {
  name: string
  path: string
}

export function itemListSchema({
  name,
  items,
}: {
  name: string
  items: ItemListEntry[]
}): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: `${SITE_URL}${item.path}`,
    })),
  }
}
