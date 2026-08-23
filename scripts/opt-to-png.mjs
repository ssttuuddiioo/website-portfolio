/**
 * Converts every image in public/landing/opt to lossless PNG in public/landing/opt/png.
 * Source avif/webp are already lossy — PNG just stops any further loss, it can't undo it.
 *
 * Usage: node scripts/opt-to-png.mjs
 */
import { readdir, mkdir, stat } from 'node:fs/promises'
import { join, parse } from 'node:path'
import sharp from 'sharp'

const SRC = 'public/landing/opt'
const OUT = join(SRC, 'png')
const EXT = new Set(['.avif', '.webp', '.jpg', '.jpeg', '.png', '.tif', '.tiff', '.heic'])

await mkdir(OUT, { recursive: true })

const files = (await readdir(SRC, { withFileTypes: true }))
  .filter((e) => e.isFile() && EXT.has(parse(e.name).ext.toLowerCase()))
  .map((e) => e.name)
  .sort()

// Two sources can share a stem (foo.avif + foo.webp) — suffix the source format
// on every member of a clashing group so neither silently overwrites the other.
const stems = new Map()
for (const name of files) {
  const { name: stem } = parse(name)
  stems.set(stem, (stems.get(stem) ?? 0) + 1)
}

let done = 0
for (const name of files) {
  const { name: stem, ext } = parse(name)
  const suffix = stems.get(stem) > 1 ? `-${ext.slice(1).toLowerCase()}` : ''
  const out = join(OUT, `${stem}${suffix}.png`)
  const meta = await sharp(join(SRC, name)).metadata()
  await sharp(join(SRC, name))
    .png({ compressionLevel: 9, effort: 10 })
    .toFile(out)
  const kb = Math.round((await stat(out)).size / 1024)
  console.log(`${name.padEnd(30)} -> ${parse(out).base.padEnd(30)} ${meta.width}x${meta.height}  ${kb}KB`)
  done++
}
console.log(`\n${done} file${done === 1 ? '' : 's'} written to ${OUT}`)
