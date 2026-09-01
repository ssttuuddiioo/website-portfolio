/**
 * The shared shape of the project-copy spreadsheets, so the exporter and the
 * diff read the same columns from the same place.
 *
 * Copy lives in two files, and the sheets mirror that split:
 *   - src/lib/landing-projects.ts     one row per project: the index entry the
 *                                     homepage list and /work show, which also
 *                                     generates most /work/[slug] pages.
 *   - src/lib/placeholder-projects.ts the three hand-authored case studies,
 *                                     whose longer copy overrides the
 *                                     generated page for those slugs.
 *
 * Both sheets are edited in place — there is no separate "new" column. The
 * committed source is the before picture, so `npm run copy:diff` recovers what
 * changed by comparing the sheet against it.
 */

import { LANDING_PROJECTS, type LandingProject } from '../src/lib/landing-projects'
import { PLACEHOLDER_PROJECTS, type PlaceholderProject } from '../src/lib/placeholder-projects'

/** List cells join on this; a credit splits its name from its role on `::`. */
export const LIST_SEP = ' | '
export const PAIR_SEP = ' :: '

export type Column = {
  /** Spreadsheet header. */
  header: string
  /** Reads the cell out of the project. */
  get: (p: never) => string
}

const list = (v: readonly unknown[] | undefined) => (v ?? []).join(LIST_SEP)

const credits = (v: readonly { name: string; role: string }[] | undefined) =>
  (v ?? []).map((c) => `${c.name}${PAIR_SEP}${c.role}`).join(LIST_SEP)

const str = (v: unknown) => (v === undefined || v === null ? '' : String(v))

/* ---------------------------------------------------------------- index --- */

export const INDEX_COLUMNS: { header: string; get: (p: LandingProject) => string }[] = [
  { header: 'slug (key, do not edit)', get: (p) => str(p.slug) },
  { header: 'Project', get: (p) => p.title },
  { header: 'Client', get: (p) => p.client },
  { header: 'Client short', get: (p) => str(p.clientShort) },
  { header: 'Category', get: (p) => p.category },
  { header: 'Year', get: (p) => str(p.year) },
  { header: 'Description', get: (p) => str(p.description) },
  { header: 'Services', get: (p) => list(p.services) },
  { header: 'Credits', get: (p) => credits(p.collaborators) },
  { header: 'Live site', get: (p) => str(p.website) },
  { header: 'Linked phrase', get: (p) => list(p.descriptionLinks?.map((l) => l.text)) },
  { header: 'Linked phrase URL', get: (p) => list(p.descriptionLinks?.map((l) => l.href)) },
]

export function indexRows() {
  return LANDING_PROJECTS.map((p) => INDEX_COLUMNS.map((c) => c.get(p)))
}

/* ----------------------------------------------------------- case study --- */

type SectionField = 'label' | 'leftLabel' | 'leftText' | 'rightLabel' | 'rightText' | 'items'

const SECTION_FIELDS: { field: SectionField; label: string }[] = [
  { field: 'label', label: 'label' },
  { field: 'leftLabel', label: 'left heading' },
  { field: 'leftText', label: 'left text' },
  { field: 'rightLabel', label: 'right heading' },
  { field: 'rightText', label: 'right text' },
  { field: 'items', label: 'tech list' },
]

/**
 * Only the section slots that actually carry text get a column — the image-only
 * sections have nothing to edit, so the sheet stays narrow. Numbering follows
 * the real section index, which is what the key needs to point at.
 */
function sectionColumns() {
  const studies = Object.values(PLACEHOLDER_PROJECTS)
  const max = Math.max(...studies.map((p) => p.sections.length))
  const cols: { header: string; get: (p: PlaceholderProject) => string }[] = []

  for (let i = 0; i < max; i++) {
    for (const { field, label } of SECTION_FIELDS) {
      const present = studies.some((p) => p.sections[i]?.[field] !== undefined)
      if (!present) continue
      cols.push({
        header: `Section ${i + 1} ${label}`,
        get: (p) => {
          const v = p.sections[i]?.[field]
          return Array.isArray(v) ? list(v) : str(v)
        },
      })
    }
  }
  return cols
}

export const STUDY_COLUMNS: { header: string; get: (p: PlaceholderProject) => string }[] = [
  { header: 'slug (key, do not edit)', get: (p) => p.slug },
  { header: 'Project', get: (p) => p.title },
  { header: 'Client', get: (p) => p.client },
  { header: 'Category', get: (p) => p.category },
  { header: 'Discipline', get: (p) => p.discipline },
  { header: 'Year', get: (p) => str(p.year) },
  { header: 'About', get: (p) => p.about },
  { header: 'Role', get: (p) => list(p.role) },
  { header: 'Credits', get: (p) => credits(p.collaborators) },
  { header: 'Live site', get: (p) => str(p.website) },
  ...sectionColumns(),
]

export function studyRows() {
  return Object.values(PLACEHOLDER_PROJECTS).map((p) => STUDY_COLUMNS.map((c) => c.get(p)))
}
