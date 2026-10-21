/**
 * Every way to reach the studio, in the order it's listed — on the mobile
 * Contact page and in the contact panel on project pages. A row with no `href`
 * shows as plain text; a row with an empty `value` is left out, so a detail
 * can be filled in here without touching either layout.
 */
export interface ContactDetail {
  label: string
  value: string
  href?: string
  external?: boolean
}

export const CONTACT_DETAILS: ContactDetail[] = [
  { label: 'Email', value: 'hello@studiostudio.nyc', href: 'mailto:hello@studiostudio.nyc' },
  { label: 'Phone', value: '', href: '' },
  { label: 'Instagram', value: '@yopablo', href: 'https://instagram.com/yopablo', external: true },
  { label: 'LinkedIn', value: '', href: '', external: true },
  { label: 'GitHub', value: 'ssttuuddiioo', href: 'https://github.com/ssttuuddiioo', external: true },
  { label: 'Studio', value: 'Brooklyn, New York' },
]

/** The details that have a value, ready to list. */
export const LISTED_CONTACT_DETAILS = CONTACT_DETAILS.filter((d) => d.value)
