'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { LANDING_PROJECTS, type LandingProject } from '@/lib/landing-projects'
import { BLUE, PAPER, ink } from './landing-theme'

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * The six projects that open the work section as a big 2-up grid. Titles must
 * match `LANDING_PROJECTS` entries exactly — the editorial list below the grid
 * filters these out so nothing repeats.
 */
export const FEATURED_GRID_TITLES = [
  'LOOP',
  'StoryBooth',
  'Hope Hydration',
  'The Light Around Us',
  'Living Walls + AT&T',
  'Moment',
] as const

/** In the order listed above, not the order the source array happens to be in. */
const FEATURED_GRID: LandingProject[] = FEATURED_GRID_TITLES.map(
  (title) => LANDING_PROJECTS.find((p) => p.title === title),
).filter(Boolean) as LandingProject[]

/* ---- one card ----------------------------------------------------------- */

/**
 * Big media plate with the title and year set into its bottom corner. No
 * description, no services —
 * the grid is a hard cut of six, and the metadata lives on the detail pages.
 */
function FeatureCard({ project, index }: { project: LandingProject; index: number }) {
  const reduce = useReducedMotion()
  const href = project.slug ? `/work/${project.slug}` : project.website
  const external = !project.slug && Boolean(project.website)

  const inner = (
    <>
      <div className="feat-media">
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes="(min-width: 900px) 49vw, 98vw"
          className="feat-img"
        />
        {/* Scrim — the plates are photographic, so the corner lockup needs a
            floor under it to stay legible on light frames. */}
        <div className="feat-scrim" aria-hidden />
        <div className="feat-line">
          <h3 className="feat-title font-display">{project.title}</h3>
          <span className="feat-year font-mono">{project.year}</span>
        </div>
      </div>
    </>
  )

  return (
    <motion.article
      className="feat-card"
      initial={{ opacity: 0, y: reduce ? 0 : 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: reduce ? 0 : 0.7,
        ease: EASE,
        delay: reduce ? 0 : (index % 2) * 0.08,
      }}
    >
      {href ? (
        external ? (
          <a href={href} target="_blank" rel="noreferrer" className="feat-link">
            {inner}
          </a>
        ) : (
          <Link href={href} className="feat-link">
            {inner}
          </Link>
        )
      ) : (
        <div className="feat-link">{inner}</div>
      )}
    </motion.article>
  )
}

/* ---- section ------------------------------------------------------------ */

/**
 * Featured work — the first thing below the fold. Six projects on a big 2-up
 * grid, title and year only, ahead of the fuller editorial list.
 */
export function AgencyFeaturedGrid() {
  return (
    <section
      style={{
        // Wider frame and a much tighter gutter than the rest of the page, so
        // the six plates run nearly edge to edge and read as the loud opening
        // to the work section.
        maxWidth: '1800px',
        margin: '0 auto',
        paddingTop: 'clamp(3rem, 7vw, 5.5rem)',
        paddingBottom: 'clamp(1rem, 2vw, 2rem)',
        // Nearly edge to edge, so in landscape these would slide under the
        // notch without flooring the side padding at the inset.
        paddingLeft:
          'max(clamp(0.75rem, 1.6vw, 1.75rem), env(safe-area-inset-left, 0px))',
        paddingRight:
          'max(clamp(0.75rem, 1.6vw, 1.75rem), env(safe-area-inset-right, 0px))',
      }}
    >
      <style>{`
        .feat-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: clamp(0.75rem, 1.6vw, 1.75rem);
        }
        .feat-link {
          display: block;
          color: inherit;
          text-decoration: none;
        }
        .feat-media {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          overflow: hidden;
          background: ${ink(0.04)};
        }
        .feat-img {
          object-fit: cover;
          transition: transform 800ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .feat-card:hover .feat-img { transform: scale(1.04); }

        .feat-scrim {
          position: absolute;
          inset: auto 0 0 0;
          height: 55%;
          background: linear-gradient(
            to top,
            rgba(10, 10, 10, 0.72) 0%,
            rgba(10, 10, 10, 0.34) 45%,
            rgba(10, 10, 10, 0) 100%
          );
          pointer-events: none;
        }

        .feat-line {
          position: absolute;
          inset: auto 0 0 0;
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 1.5rem;
          padding: clamp(1rem, 2vw, 1.75rem);
        }
        .feat-title {
          margin: 0;
          font-weight: 400;
          font-size: clamp(1rem, 1.6vw, 1.5rem);
          line-height: 1.05;
          letter-spacing: -0.03em;
          color: ${PAPER};
          transition: color 200ms;
        }
        .feat-card:hover .feat-title { color: ${BLUE}; }
        .feat-year {
          flex: none;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          color: rgba(240, 240, 249, 0.7);
        }

        @media (min-width: 900px) {
          .feat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
      `}</style>

      {/* The cards are <h3>s, so the section needs its own heading to keep the
          outline from jumping h1 → h3. Hidden by design — the grid speaks. */}
      <h2 className="sr-only">Featured work</h2>

      <div className="feat-grid">
        {FEATURED_GRID.map((p, i) => (
          <FeatureCard key={p.title} project={p} index={i} />
        ))}
      </div>
    </section>
  )
}
