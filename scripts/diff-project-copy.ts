/**
 * Reads the edited project-copy sheets and prints only the cells that differ
 * from the committed source — the worklist for applying edits back into
 * src/lib/landing-projects.ts and src/lib/placeholder-projects.ts.
 *
 *   npm run copy:diff                    both sheets, default filenames
 *   npm run copy:diff -- a.csv b.csv     index sheet, case-study sheet
 *
 * Rows are matched on the slug in the first column, so reordering the sheet or
 * deleting rows you did not touch is fine. A slug the source no longer has is
 * reported rather than silently skipped.
 */

import { existsSync, readFileSync } from 'node:fs'
import {
  INDEX_COLUMNS,
  STUDY_COLUMNS,
  indexRows,
  studyRows,
} from './project-copy-schema'

/** RFC 4180 — handles quoted cells containing commas, quotes and newlines. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  const s = text.replace(/^﻿/, '')

  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (quoted) {
      if (c === '"') {
        if (s[i + 1] === '"') { cell += '"'; i++ } else quoted = false
      } else cell += c
      continue
    }
    if (c === '"') quoted = true
    else if (c === ',') { row.push(cell); cell = '' }
    else if (c === '\r') { /* swallow — \n closes the row */ }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = '' }
    else cell += c
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row) }
  // A trailing newline leaves one empty trailing row.
  return rows.filter((r) => r.some((c) => c.trim() !== ''))
}

function compare(
  label: string,
  path: string,
  columns: { header: string }[],
  current: string[][],
) {
  if (!existsSync(path)) {
    console.log(`— ${label}: ${path} not found, skipped`)
    return 0
  }

  const rows = parseCsv(readFileSync(path, 'utf8'))
  const header = rows.shift()
  if (!header || !header[0].startsWith('slug')) {
    console.error(`✗ ${path} does not look like a copy export (first column should be the slug)`)
    process.exit(1)
  }
  if (header.length !== columns.length) {
    console.error(
      `✗ ${path} has ${header.length} columns, expected ${columns.length}. ` +
        `Re-export and re-apply the edits rather than adding or removing columns.`,
    )
    process.exit(1)
  }

  const bySlug = new Map(current.map((r) => [r[0], r]))
  let edits = 0

  for (const row of rows) {
    const slug = row[0].trim()
    const was = bySlug.get(slug)
    if (!was) {
      console.log(`⚠ ${label}: no project with slug "${slug}" — row skipped`)
      continue
    }
    for (let i = 1; i < columns.length; i++) {
      const before = (was[i] ?? '').trim()
      const after = (row[i] ?? '').trim()
      if (before === after) continue
      edits++
      console.log(`\n── ${row[1] || slug} · ${columns[i].header}   [${label}: ${slug}]`)
      console.log(`   was: ${before || '(empty)'}`)
      console.log(`   now: ${after || '(empty)'}`)
    }
  }
  return edits
}

const indexPath = process.argv[2] ?? 'project-copy.csv'
const studyPath = process.argv[3] ?? 'project-copy-case-studies.csv'

const total =
  compare('index', indexPath, INDEX_COLUMNS, indexRows()) +
  compare('case study', studyPath, STUDY_COLUMNS, studyRows())

console.log(`\n${total} edit${total === 1 ? '' : 's'}.`)
