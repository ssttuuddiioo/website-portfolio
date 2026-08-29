'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { LANDING_PROJECTS } from '@/lib/landing-projects'
import { INK, BG, BLUE, ink } from './landing-theme'

const EASE = [0.22, 1, 0.36, 1] as const

/* ---- one entry ---------------------------------------------------------- */

/**
 * One cell of the index: the frame, and the client's name on a ruled strip
 * under it. Nothing else — the title, the year, the description and the
 * services all live one click away on the project's own page.
 *
 * The frame is cropped to the grid's shared ratio. The index is a ruled sheet
 * now, so every cell is the same rectangle and the rules do the composing.
 */
function IndexEntry({
  project,
  index,
}: {
  project: (typeof LANDING_PROJECTS)[number]
  index: number
}) {
  const reduce = useReducedMotion()
  const href = project.slug ? `/work/${project.slug}` : project.website
  const external = !project.slug && Boolean(project.website)

  const inner = (
    <>
      <span className="pgi-media">
        <Image
          src={project.image}
          alt=""
          fill
          sizes="(min-width: 1200px) 20vw, (min-width: 900px) 33vw, (min-width: 560px) 50vw, 100vw"
          className="pgi-img"
        />
      </span>
      <span className="pgi-cap font-display">
        {project.clientShort ?? project.client}
      </span>
    </>
  )

  return (
    <motion.li
      className="pgi-cell"
      initial={reduce ? false : { opacity: 0, y: 14 }}
      /* The whole grid arrives at once when the toggle flips, so the entries
         stagger off that — it reads as the index assembling in the field the
         trail just left, rather than as 18 things appearing together. */
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduce ? 0 : 0.5,
        ease: EASE,
        delay: reduce ? 0 : 0.06 + index * 0.025,
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

/* ---- the grid ----------------------------------------------------------- */

const GRID_CSS = `
/* The page inset. The index runs the full width of the window rather than the
   site's 1440 measure — with no rules holding it together it wants the room,
   and the frames themselves carry the composition out to both edges. The side
   inset is the same 40px that runs between the entries, so the page margin and
   the gutter are one measure. */
.pgi-wrap {
  --pgi-inset: 40px;
  padding: clamp(2.5rem, 7vh, 5rem)
           calc(var(--pgi-inset) + env(safe-area-inset-right))
           calc(clamp(4rem, 10vh, 7rem) + env(safe-area-inset-bottom))
           calc(var(--pgi-inset) + env(safe-area-inset-left));
}

/* The index carries no rules at all: 40px of page between entries is what
   separates them, and the frames themselves do the composing. A part-filled
   last row simply runs out. */
.pgi-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 40px;
}
@media (min-width: 560px) {
  .pgi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 900px) {
  .pgi-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (min-width: 1200px) {
  .pgi-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); }
}

.pgi-cell {
  background: ${BG};
}
.pgi-link {
  display: grid;
  grid-template-rows: auto auto;
  color: inherit;
  text-decoration: none;
}

/* One ratio for every frame, so the rows keep a single baseline all the way
   down the sheet. The frames are cropped to it. */
.pgi-media {
  position: relative;
  display: block;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: ${ink(0.05)};
}
.pgi-img {
  object-fit: cover;
  transition: transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
}

/* The name, directly under the frame and flush with its left edge — with no
   rule to sit inside, an inset caption would read as adrift of the image. */
.pgi-cap {
  display: block;
  padding: clamp(0.6rem, 1vw, 0.85rem) 0 0;
  font-size: clamp(0.82rem, 0.95vw, 0.95rem);
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: ${INK};
  transition: color 200ms;
}

/* Hover marks the one entry and leaves the rest alone: the frame takes a small
   push in, and the name goes blue. Nothing dims — the index stays fully
   readable while the pointer crosses it. */
@media (hover: hover) {
  .pgi-cell:hover .pgi-img { transform: scale(1.015); }
  .pgi-cell:hover .pgi-cap { color: ${BLUE}; }
}

@media (prefers-reduced-motion: reduce) {
  .pgi-img, .pgi-cap { transition: none; }
}
`

/**
 * Every project as a frame and a client name, on one ruled sheet. It stands in
 * for the image trail on the landing page when the dock's grid mark is on —
 * same page, same lockup and nav, everything below it untouched.
 */
export function ProjectIndexGrid() {
  return (
    <>
      <style>{GRID_CSS}</style>
      <div className="pgi-wrap">
        <ul id="project-index" className="pgi-grid">
          {LANDING_PROJECTS.map((p, i) => (
            <IndexEntry key={p.title} project={p} index={i} />
          ))}
        </ul>
      </div>
    </>
  )
}
