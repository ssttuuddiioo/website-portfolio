/**
 * Regenerates public/og-default.jpg — the default social share card.
 *
 * The source is a 1000x1500 portrait AVIF; share cards are 1200x630 landscape,
 * so this takes a fixed horizontal band rather than a centre crop. The band is
 * positioned to keep the subject's head fully in frame with headroom above,
 * since several platforms crop the card further (X to ~2:1, some to square).
 *
 * JPEG, not AVIF/WebP: it's the one format every social scraper decodes.
 *
 * Requires sharp, which is NOT a declared dependency of this project — it is
 * only present transitively via Next's image optimisation. This is a one-off
 * asset tool, not part of the build, so it isn't worth adding to package.json
 * (doing so churns ~900 lines of lockfile and bumps the sharp version Next
 * itself uses). If the import fails: npm i -D sharp, run this, then uninstall.
 *
 * The committed public/og-default.jpg is the output — you only need to run
 * this if the source image or the crop changes.
 *
 * Run: node scripts/make-og-image.mjs
 */
import sharp from 'sharp'

const SRC = 'public/landing/opt/light-around-us2.avif'
const OUT = 'public/og-default.jpg'

const CARD = { width: 1200, height: 630 }
const CROP = { left: 0, top: 430, width: 1000, height: 525 }

const info = await sharp(SRC)
  .extract(CROP)
  .resize(CARD.width, CARD.height, { kernel: 'lanczos3' })
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(OUT)

console.log(`${OUT} — ${info.width}x${info.height}, ${Math.round(info.size / 1024)}KB`)
