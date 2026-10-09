'use client'

import {
  type CSSProperties,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { LANDING_PROJECTS } from '@/lib/landing-projects'
import { IMAGE_SIZES } from '@/lib/landing-image-sizes'
import { INK, BG, BLUE, RULE, ink } from './landing-theme'

const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

const EASE = [0.22, 1, 0.36, 1] as const

// Three columns at every desktop width: the frames stay large enough to read
// as pictures rather than thumbnails.
const COLS = 3
// The site edge, between cards in both directions — the same 40px the page
// inset carries, so the margin and the gutter are one measure.
const GAP = 40
// The caption cell under each frame. Fixed, so the packing can count it
// without measuring anything.
const CAP_H = 52
// Frames keep their own proportions — that is what makes the columns run
// ragged — but a panorama or a tall phone shot is reined in, so no one entry
// shrinks to a sliver or runs a column on by itself.
const ASPECT_MIN = 0.7
const ASPECT_MAX = 1.8
// The hover mosaic steps through these resolutions — the frame redrawn this
// many pixels across, so the blocks grow from about 18px to 27px to 43px on a
// 1440 screen. Each must be listed in images.imageSizes in next.config, or the
// optimizer won't serve it.
const PIX_STEPS = [24, 16, 10]
// The beat between steps, in and back out.
const PIX_BEAT = 70
// How far (in entries) a project's second frame must land from its cover.
const MIN_SPREAD = 4

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v))

type Project = (typeof LANDING_PROJECTS)[number]
type Entry = { project: Project; src: string; aspect: number }

const entry = (project: Project, src: string): Entry => {
  const [w, h] = IMAGE_SIZES[src] ?? [4, 3]
  return { project, src, aspect: clamp(w / h, ASPECT_MIN, ASPECT_MAX) }
}

// Every project's cover, in index order.
const COVERS = LANDING_PROJECTS.map((p) => entry(p, p.image))
// And a second frame for each project that has more than one shot: the page's
// hero, or the first of its gallery.
const SECONDS = LANDING_PROJECTS.flatMap((p) => {
  const src = [p.pageHero, ...(p.images ?? [])].find(
    (s): s is string => Boolean(s) && s !== p.image,
  )
  return src ? [entry(p, src)] : []
})

/**
 * The covers keep the index order; the second frames are scattered through
 * them at random — fresh each visit — but never within MIN_SPREAD entries of
 * their own cover, so a project doesn't read as a pair.
 */
function scatter(): Entry[] {
  const out = [...COVERS]
  for (const second of SECONDS) {
    const h = out.findIndex((e) => e.project === second.project)
    const open: number[] = []
    for (let i = 0; i <= out.length; i++) {
      // Inserting at i puts the frame between out[i-1] and out[i], pushing
      // the cover along by one if it sits at or after i.
      const dist = i <= h ? h - i + 1 : i - h
      if (dist >= MIN_SPREAD) open.push(i)
    }
    const at = open.length
      ? open[Math.floor(Math.random() * open.length)]
      : out.length
    out.splice(at, 0, second)
  }
  return out
}

type Slot = { x: number; y: number; w: number; h: number }

/**
 * Packs the entries in order, each into whichever column is shortest so far —
 * so the sheet still reads roughly left to right, top to bottom. A card is its
 * frame, a 1px rule and its caption cell. Whole pixels throughout, so every
 * rule lands crisp.
 */
function pack(entries: Entry[], width: number) {
  const colW = Math.floor((width - GAP * (COLS - 1)) / COLS)
  const heights = new Array<number>(COLS).fill(0)
  const slots: Slot[] = entries.map(({ aspect }) => {
    const c = heights.indexOf(Math.min(...heights))
    const h = Math.round(colW / aspect)
    const slot = { x: c * (colW + GAP), y: heights[c], w: colW, h }
    heights[c] += h + 1 + CAP_H + GAP
    return slot
  })
  return { slots, height: Math.max(0, Math.max(...heights) - GAP) }
}

/* ---- one entry ---------------------------------------------------------- */

/**
 * One card of the index, drawn like a cell of the project page's ruled sheet:
 * a hairline frame, the image at its own proportions, ruled off from a caption
 * cell carrying the project's title and year. Everything else lives
 * one click away on the project's own page.
 */
function IndexEntry({
  project,
  src,
  index,
  slot,
}: {
  project: Project
  src: string
  index: number
  slot: Slot
}) {
  const reduce = useReducedMotion()
  const href = project.slug ? `/work/${project.slug}` : project.website
  const external = !project.slug && Boolean(project.website)

  const inner = (
    <>
      <span className="pgi-media" style={{ height: slot.h }}>
        <Image src={src} alt="" fill sizes="33vw" className="pgi-img" />
        {/* Plain <img>s, not next/image: the point is the tiny file itself,
            not a srcset that would pick a sharp one. Coarser steps stack
            above finer ones; each switches on a beat after the last, and off
            in the reverse order. */}
        {PIX_STEPS.map((w, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={w}
            src={`/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`}
            alt=""
            loading="lazy"
            decoding="async"
            className="pgi-pix"
            style={
              {
                '--pix-in': `${i * PIX_BEAT}ms`,
                '--pix-out': `${(PIX_STEPS.length - 1 - i) * PIX_BEAT}ms`,
              } as CSSProperties
            }
          />
        ))}
      </span>
      <span className="pgi-cap">
        <span className="pgi-title font-display">{project.title}</span>
        <span className="pgi-year">{project.year}</span>
      </span>
    </>
  )

  return (
    <motion.li
      className="pgi-cell"
      style={{ left: slot.x, top: slot.y, width: slot.w }}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      /* The whole sheet arrives at once when the toggle flips, so the cards
         stagger off that — it reads as the index assembling in the field the
         trail just left, rather than as 25 things appearing together. */
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduce ? 0 : 0.5,
        ease: EASE,
        delay: reduce ? 0 : 0.06 + index * 0.03,
      }}
    >
      {href ? (
        external ? (
          <a href={href} target="_blank" rel="noreferrer" className="pgi-link">
            {inner}
          </a>
        ) : (
          <Link href={href} className="pgi-link">
            {inner}
          </Link>
        )
      ) : (
        <span className="pgi-link">{inner}</span>
      )}
    </motion.li>
  )
}

/* ---- the sheet ---------------------------------------------------------- */

const GRID_CSS = `
/* The page inset. The index runs the full width of the window rather than the
   site's 1440 measure — the cards carry the composition out to both edges. */
.pgi-wrap {
  padding: clamp(2.5rem, 7vh, 5rem)
           calc(${GAP}px + env(safe-area-inset-right))
           calc(clamp(4rem, 10vh, 7rem) + env(safe-area-inset-bottom))
           calc(${GAP}px + env(safe-area-inset-left));
}

/* Placed by pack(), not by the browser: entries stay in order in the markup
   (so tabbing and screen readers read the work in order) while the columns
   run ragged on screen. */
.pgi-grid {
  position: relative;
  list-style: none;
  margin: 0;
  padding: 0;
}

.pgi-cell {
  position: absolute;
  background: ${BG};
}
/* The card's frame, laid over its edges rather than around them, so it takes
   no room of its own and the image runs right up to the rule — the way frames
   meet the hairlines on the project page. */
.pgi-cell::after {
  content: '';
  position: absolute;
  inset: 0;
  border: 1px solid ${RULE};
  pointer-events: none;
}
.pgi-link {
  display: block;
  color: inherit;
  text-decoration: none;
}

.pgi-media {
  position: relative;
  display: block;
  overflow: hidden;
  background: ${ink(0.05)};
  /* Colour is pushed on the frame as a whole and eased, so it rises smoothly
     under the mosaic's steps rather than jumping with them. */
  transition: filter 350ms cubic-bezier(0.22, 1, 0.36, 1);
}
.pgi-img {
  object-fit: cover;
  transition: transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
}
/* The mosaic: the same frame at a few dozen pixels across, stretched back up
   with hard pixel edges. The steps wait invisible over the image and cut in
   one after another on hover — no fade, so each one lands as a bump. */
.pgi-pix {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  image-rendering: pixelated;
  opacity: 0;
  transition: transform 700ms cubic-bezier(0.22, 1, 0.36, 1),
              opacity 0s linear var(--pix-out);
}

/* The caption is a cell of its own, ruled off from the frame: title on the
   left, the year ranged right in the project page's label style. */
.pgi-cap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  height: ${CAP_H}px;
  border-top: 1px solid ${RULE};
  padding: 0 clamp(0.9rem, 1.4vw, 1.25rem);
  box-sizing: content-box;
}
.pgi-title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: clamp(0.92rem, 1.15vw, 1.05rem);
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: ${INK};
  transition: color 200ms;
}
.pgi-year {
  flex: none;
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  color: ${ink(0.4)};
  font-variant-numeric: tabular-nums;
}

/* Hover marks the one card and leaves the rest alone: the frame breaks up
   into a mosaic and warms in colour as it pushes in, and the title goes
   blue. Nothing
   dims — the rest of the index stays fully readable while the pointer crosses
   it. */
@media (hover: hover) {
  .pgi-cell:hover .pgi-media { filter: saturate(1.7); }
  .pgi-cell:hover .pgi-img { transform: scale(1.015); }
  .pgi-cell:hover .pgi-pix {
    transform: scale(1.015);
    opacity: 1;
    transition-delay: 0s, var(--pix-in);
  }
  .pgi-cell:hover .pgi-title { color: ${BLUE}; }
}

@media (prefers-reduced-motion: reduce) {
  .pgi-media, .pgi-img, .pgi-pix, .pgi-title { transition: none; }
}
`

/**
 * Every project as a frame and its title, packed as a masonry of ruled
 * cards. It stands in for the image trail on the landing page when the dock's
 * grid mark is on — same page, same lockup and nav, everything below it
 * untouched.
 */
export function ProjectIndexGrid() {
  const listRef = useRef<HTMLUListElement>(null)
  const [width, setWidth] = useState(0)
  // Drawn once per opening, so the scatter holds still through a resize. The
  // grid only ever mounts on the client (it follows a click or the #work
  // hash), so the random order never meets a server render.
  const [entries] = useState(scatter)

  useIsoLayoutEffect(() => {
    const el = listRef.current
    if (!el) return
    const measure = () => setWidth(el.clientWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const layout = width > 0 ? pack(entries, width) : null

  return (
    <>
      <style>{GRID_CSS}</style>
      <div className="pgi-wrap">
        <ul
          ref={listRef}
          id="project-index"
          className="pgi-grid"
          style={{ height: layout?.height ?? 0 }}
        >
          {layout &&
            entries.map(({ project, src }, i) => (
              <IndexEntry
                key={src}
                project={project}
                src={src}
                index={i}
                slot={layout.slots[i]}
              />
            ))}
        </ul>
      </div>
    </>
  )
}
