const SITE_URL = 'https://studiostudio.nyc'

export type JsonLdObject = Record<string, unknown>

export function organizationSchema(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Studio Studio',
    alternateName: 'Studio Studio NYC',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description:
      "Studio Studio is an interactive installation company in New York City. Inaugural members of the New Museum's NEW INC, we create immersive experiences through collaboration with artists, engineers, and designers.",
    founder: {
      '@type': 'Person',
      name: 'Pablo Gnecco',
      jobTitle: 'Experiential Director & Creative Technologist',
      url: 'https://yopablo.com',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Brooklyn',
      addressRegion: 'NY',
      addressCountry: 'US',
    },
    memberOf: [
      { '@type': 'Organization', name: 'NEW INC', url: 'https://www.newinc.org' },
      {
        '@type': 'Organization',
        name: 'Mana Contemporary',
        url: 'https://www.manacontemporary.com',
      },
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
}

export function personSchema(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Pablo Gnecco',
    jobTitle: 'Experiential Director & Creative Technologist',
    url: 'https://yopablo.com',
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
    sameAs: ['https://instagram.com/yopablo'],
  }
}

export interface CreativeWorkInput {
  title: string
  slug: string
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
    url: `${SITE_URL}/${input.slug}`,
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
