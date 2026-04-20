import { cache } from 'react'
import { client, isSanityConfigured } from '@/lib/sanity/client'
import { SITE_SETTINGS_ORG_QUERY } from '@/lib/sanity/queries'
import type { SiteSettingsForOrg } from '@/lib/sanity/types'

/**
 * Fetches the site-settings document with founder dereferenced.
 * Returns null when Sanity is unconfigured, the query fails, or no
 * document exists — JSON-LD generators fall back to hardcoded values.
 *
 * Wrapped in React `cache()` so multiple callers in the same request
 * (e.g. layout + page metadata) share a single fetch.
 */
export const getOrgSettings = cache(async (): Promise<SiteSettingsForOrg | null> => {
  if (!isSanityConfigured) return null
  try {
    const settings = await client.fetch<SiteSettingsForOrg | null>(SITE_SETTINGS_ORG_QUERY)
    return settings ?? null
  } catch {
    return null
  }
})
