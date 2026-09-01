/**
 * Writes the project copy to two spreadsheets, one row per project.
 *
 *   npm run copy:export
 *     → project-copy.csv              the 18 index entries
 *     → project-copy-case-studies.csv the 3 hand-authored case study pages
 *
 * Edit the cells in place. `npm run copy:diff` then reports what changed by
 * comparing the sheets against the committed source. See project-copy-schema.ts
 * for which file each sheet maps back to.
 */

import { writeFileSync } from 'node:fs'
import {
  INDEX_COLUMNS,
  STUDY_COLUMNS,
  indexRows,
  studyRows,
} from './project-copy-schema'

function cell(v: string) {
  return /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
}

function write(path: string, headers: string[], rows: string[][]) {
  const csv = [headers, ...rows].map((r) => r.map(cell).join(',')).join('\r\n')
  // BOM so Excel opens the UTF-8 without mangling accents.
  writeFileSync(path, '﻿' + csv + '\r\n')
  console.log(`✓ ${rows.length} projects × ${headers.length} columns → ${path}`)
}

write('project-copy.csv', INDEX_COLUMNS.map((c) => c.header), indexRows())
write('project-copy-case-studies.csv', STUDY_COLUMNS.map((c) => c.header), studyRows())
