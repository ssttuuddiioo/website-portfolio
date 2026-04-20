/* eslint-disable no-console */
/**
 * One-time seed for the site-settings singleton and the founder person doc.
 *
 * Run once after schema deploy, before content population:
 *   SANITY_API_TOKEN=xxxx npx tsx scripts/seed-site.ts
 *
 * Idempotent — uses createOrReplace so re-runs overwrite with fresh values.
 * Source of truth for all values is docs/MIGRATION.md / docs/CMS_SEED.md.
 */

import { createClient } from '@sanity/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_TOKEN

if (!projectId) {
  console.error('✗ Missing NEXT_PUBLIC_SANITY_PROJECT_ID in env')
  process.exit(1)
}
if (!token) {
  console.error('✗ Missing SANITY_API_TOKEN in env (needs write access)')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

const FOUNDER_ID = 'pabloGnecco'

const founderDoc = {
  _id: FOUNDER_ID,
  _type: 'person',
  name: 'Pablo Gnecco',
  jobTitle: 'Experiential Director & Creative Technologist',
  url: 'https://yopablo.com',
  socials: ['https://instagram.com/yopablo'],
}

const siteSettingsDoc = {
  _id: 'siteSettings',
  _type: 'siteSettings',
  siteTitle: 'Studio Studio',
  orgName: 'Studio Studio',
  orgAlternateName: 'Studio Studio NYC',
  orgDescription:
    "Studio Studio is an interactive installation company in New York City. Inaugural members of the New Museum's NEW INC, we create immersive experiences through collaboration with artists, engineers, and designers.",
  founder: { _type: 'reference', _ref: FOUNDER_ID },
  address: {
    locality: 'Brooklyn',
    region: 'NY',
    country: 'US',
  },
  memberOf: [
    { _key: 'newinc', name: 'NEW INC', url: 'https://www.newinc.org' },
    { _key: 'mana', name: 'Mana Contemporary', url: 'https://www.manacontemporary.com' },
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

async function main() {
  console.log(`Seeding → project=${projectId} dataset=${dataset}`)

  console.log('  · creating founder person document…')
  await client.createOrReplace(founderDoc)

  console.log('  · creating siteSettings singleton…')
  await client.createOrReplace(siteSettingsDoc)

  console.log('✓ Seed complete.')
  console.log('  Next steps: upload an Organization logo in Studio (siteSettings.logo).')
}

main().catch((err) => {
  console.error('✗ Seed failed:', err)
  process.exit(1)
})
