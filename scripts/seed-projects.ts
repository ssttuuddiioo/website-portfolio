/**
 * Seeds Sanity's project documents from the source files in content/projects.
 *
 *   SANITY_API_TOKEN=xxxx npm run seed:projects            write to Sanity
 *   npm run seed:projects -- --dry-run                     print, write nothing
 *
 * Each file becomes the project `project-<SLUG>`. Only the copy fields below
 * are written, so media, ordering, SEO and anything else set in Studio survive
 * a re-run: the document is created if missing, then those fields are set, and
 * any the file leaves empty are cleared. Re-run whenever the files change —
 * the files stay the source of truth for copy, Studio for everything else.
 *
 * MEDIA is not uploaded; add images in Studio.
 */

import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { createClient } from '@sanity/client'

const CONTENT_DIR = path.join(process.cwd(), 'content/projects')
const DRY_RUN = process.argv.includes('--dry-run')

const KEYS = [
  'TITLE',
  'SLUG',
  'YEAR',
  'YEAR DISPLAY',
  'CLIENT',
  'CLIENT URL',
  'LOCATION',
  'FEATURED',
  'DISCIPLINES',
  'SCOPE',
  'SUBTITLE',
  'BODY',
  'OUTCOME',
  'COLLABORATORS',
  'STACK',
  'MATERIALS',
  'CREDIT',
  'THANKS',
  'MEDIA',
] as const
type Key = (typeof KEYS)[number]

/** The fields this script owns. Everything else on the document is Studio's. */
const MANAGED = [
  'title',
  'slug',
  'subtitle',
  'client',
  'clientUrl',
  'year',
  'yearDisplay',
  'location',
  'featured',
  'disciplines',
  'scope',
  'body',
  'outcome',
  'stack',
  'materials',
  'collaborators',
  'credit',
  'thanks',
] as const

/* ---------------------------------------------------------------- parse --- */

/**
 * A file is a run of `KEY: value` lines. A key with nothing after the colon
 * opens a block that runs until the next key, so multi-paragraph fields (BODY)
 * and one-per-line fields (COLLABORATORS) read the same way. Only the known
 * keys open a field, so a body line that happens to contain a colon is safe.
 */
function parseFile(file: string): Partial<Record<Key, string>> {
  const out: Partial<Record<Key, string>> = {}
  let current: Key | null = null
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const match = line.match(/^([A-Z][A-Z ]*):(.*)$/)
    const key = match && KEYS.find((k) => k === match[1])
    if (key) {
      current = key
      out[key] = match[2].trim()
    } else if (match && /^[A-Z ]+$/.test(match[1])) {
      throw new Error(`${path.basename(file)}: unknown field "${match[1]}"`)
    } else if (current) {
      out[current] = `${out[current]}\n${line}`
    }
  }
  for (const k of Object.keys(out) as Key[]) out[k] = out[k]!.trim()
  return out
}

/**
 * Comma lists. With `capitalize`, an item whose first word is all lowercase
 * takes a capital ("sourced displays" → "Sourced displays") to match the rest of
 * the site; one that already has a capital anywhere ("iPad") is left alone.
 */
function list(value: string | undefined, { capitalize = false } = {}) {
  return (value ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (capitalize && /^[a-z][^\sA-Z]*(\s|$)/.test(s) ? s[0].toUpperCase() + s.slice(1) : s))
}

/** Paragraphs split on blank lines; wrapped lines inside one rejoin. */
function paragraphs(value: string | undefined) {
  return (value ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean)
}

function portableText(value: string | undefined) {
  return paragraphs(value).map((text, i) => ({
    _type: 'block',
    _key: `p${i}`,
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: `p${i}s`, text, marks: [] }],
  }))
}

/**
 * `Name — Role`, then an organization and/or a location. With four parts the
 * order is fixed. With three, the last is a location if it names a place one of
 * the projects is in (Atlanta, New York…) and an organization otherwise — so
 * "Zoo as Zoo — Artist — Atlanta" and "Matthew Gray — Interiors lead — JGN
 * Architecture" both land where they belong.
 */
function collaborators(value: string | undefined, places: Set<string>) {
  return (value ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line, i) => {
      const [name, role, a, b] = line.split(/\s+—\s+/)
      const third = a && !b && places.has(a) ? { location: a } : { organization: a }
      return {
        _key: `c${i}`,
        name,
        role,
        ...(b ? { organization: a, location: b } : a ? third : {}),
      }
    })
}

function buildDoc(fields: Partial<Record<Key, string>>, places: Set<string>, file: string) {
  const slug = fields.SLUG || path.basename(file, '.md')
  const year = Number(fields.YEAR)
  if (!fields.TITLE) throw new Error(`${file}: TITLE is required`)
  if (!Number.isInteger(year)) throw new Error(`${file}: YEAR must be a year`)
  if (fields['CLIENT URL'] && !/^https?:\/\//.test(fields['CLIENT URL'])) {
    throw new Error(`${file}: CLIENT URL must start with http(s)://`)
  }
  if (fields.MEDIA) {
    console.warn(`  ! ${file}: MEDIA is not uploaded by this script — add it in Studio`)
  }

  const values: Record<(typeof MANAGED)[number], unknown> = {
    title: fields.TITLE,
    slug: { _type: 'slug', current: slug },
    subtitle: fields.SUBTITLE,
    client: fields.CLIENT,
    clientUrl: fields['CLIENT URL'],
    year,
    yearDisplay: fields['YEAR DISPLAY'],
    location: fields.LOCATION,
    featured: fields.FEATURED?.toLowerCase() === 'yes',
    disciplines: list(fields.DISCIPLINES),
    scope: list(fields.SCOPE, { capitalize: true }),
    body: portableText(fields.BODY),
    outcome: paragraphs(fields.OUTCOME).join('\n\n'),
    stack: list(fields.STACK, { capitalize: true }),
    materials: fields.MATERIALS,
    collaborators: collaborators(fields.COLLABORATORS, places),
    credit: fields.CREDIT,
    thanks: fields.THANKS,
  }

  const isEmpty = (v: unknown) =>
    v === undefined || v === '' || (Array.isArray(v) && v.length === 0)
  const set = Object.fromEntries(Object.entries(values).filter(([, v]) => !isEmpty(v)))
  const unset = MANAGED.filter((k) => isEmpty(values[k]))

  return { _id: `project-${slug}`, slug, set, unset }
}

/* ------------------------------------------------------------------ run --- */

const files = readdirSync(CONTENT_DIR)
  .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
  .sort()
const parsed = files.map((f) => ({ file: f, fields: parseFile(path.join(CONTENT_DIR, f)) }))

// Every segment of every project's LOCATION — the places a collaborator's
// third field is matched against.
const places = new Set(
  parsed.flatMap(({ fields }) => (fields.LOCATION ?? '').split(',').map((s) => s.trim())),
)
const docs = parsed.map(({ file, fields }) => buildDoc(fields, places, file))

const dupes = docs.filter((d, i) => docs.findIndex((o) => o.slug === d.slug) !== i)
if (dupes.length) {
  console.error(`✗ Duplicate SLUG: ${dupes.map((d) => d.slug).join(', ')}`)
  process.exit(1)
}

async function main() {
  if (DRY_RUN) {
    console.log(JSON.stringify(docs, null, 2))
    console.log(`\n(dry run) ${docs.length} projects parsed, nothing written.`)
    return
  }

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  const token = process.env.SANITY_API_TOKEN
  if (!projectId) throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID in env')
  if (!token) throw new Error('Missing SANITY_API_TOKEN in env (needs write access)')

  const client = createClient({ projectId, dataset, apiVersion: '2024-01-01', token, useCdn: false })
  console.log(`Seeding ${docs.length} projects → project=${projectId} dataset=${dataset}`)

  // A project made by hand in Studio under one of these slugs would end up
  // beside the seeded one, and the page would show whichever came back first.
  const clashes = await client.fetch<{ _id: string; slug: string }[]>(
    `*[_type == "project" && slug.current in $slugs && !(_id in $ids) && !(_id in path("drafts.**"))]{_id, "slug": slug.current}`,
    { slugs: docs.map((d) => d.slug), ids: docs.map((d) => d._id) },
  )
  if (clashes.length) {
    throw new Error(
      `These slugs already belong to other documents — delete or rename them first:\n` +
        clashes.map((c) => `    ${c.slug} (${c._id})`).join('\n'),
    )
  }

  const tx = client.transaction()
  for (const doc of docs) {
    tx.createIfNotExists({ _id: doc._id, _type: 'project', ...doc.set })
    tx.patch(doc._id, (p) => (doc.unset.length ? p.set(doc.set).unset(doc.unset) : p.set(doc.set)))
    console.log(`  · ${doc.slug}`)
  }
  await tx.commit()
  console.log('✓ Seed complete. Pages pick it up within a minute (ISR + Sanity CDN).')
}

main().catch((err) => {
  console.error('✗ Seed failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
