'use client'

import { Fragment } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { LANDING_PROJECTS, type LandingProject } from '@/lib/landing-projects'
import { INK, BLUE } from './landing-theme'
import { SeeAllWork } from './see-all-work'

const EASE = [0.22, 1, 0.36, 1] as const

/** Every project, as a full editorial row. */
const FEATURED = LANDING_PROJECTS

/**
 * Description copy with any `descriptionLinks` phrases rendered as anchors.
 * Splits on the phrases so the surrounding text stays plain.
 */
function DescriptionText({
  text,
  links,
}: {
  text: string
  links?: LandingProject['descriptionLinks']
}) {
  if (!links || links.length === 0) return <>{text}</>

  const pattern = new RegExp(
    `(${links.map((l) => l.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
  )
  return (
    <>
      {text.split(pattern).map((part, i) => {
        const link = links.find((l) => l.text === part)
        return link ? (
          <a
            key={i}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            style={{ color: BLUE, textDecoration: 'underline' }}
          >
            {part}
          </a>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      })}
    </>
  )
}

/* ---- one project in the list -------------------------------------------- */

function ProjectRow({ project }: { project: LandingProject }) {
  const reduce = useReducedMotion()
  const href = project.slug ? `/work/${project.slug}` : undefined

  const media = (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: 4 / 3,
        overflow: 'hidden',
        background: 'rgba(10,10,10,0.04)',
      }}
    >
      <Image
        src={project.image}
        alt={project.title}
        fill
        sizes="(min-width: 900px) 36vw, 92vw"
        className="proj-img"
      />
    </div>
  )

  return (
    <motion.article
      className="proj-row"
      initial={{ opacity: 0, y: reduce ? 0 : 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: reduce ? 0 : 0.7, ease: EASE }}
    >
      {/* Media */}
      <div className="proj-media">
        {href ? (
          <Link href={href} aria-label={project.title}>
            {media}
          </Link>
        ) : (
          media
        )}
      </div>

      {/* Body — number + title, description, actions */}
      <div className="proj-body">
        <h3
          className="font-display"
          style={{
            margin: 0,
            fontWeight: 700,
            fontSize: 'clamp(1.25rem, 2vw, 1.6rem)',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: INK,
          }}
        >
          {href ? (
            <Link href={href} className="proj-title-link" style={{ color: 'inherit', textDecoration: 'none' }}>
              {project.title}
            </Link>
          ) : (
            project.title
          )}
        </h3>

        {project.description && (
          <p
            className="font-display"
            style={{
              margin: 'clamp(0.9rem, 1.6vw, 1.35rem) 0 0',
              maxWidth: '46ch',
              color: 'rgba(10,10,10,0.62)',
              fontSize: 'clamp(1rem, 1.35vw, 1.15rem)',
              lineHeight: 1.5,
            }}
          >
            <DescriptionText
              text={project.description}
              links={project.descriptionLinks}
            />
          </p>
        )}

        {project.services && project.services.length > 0 && (
          <ul className="proj-services font-mono">
            {project.services.map((service) => (
              <li key={service}>{service}</li>
            ))}
          </ul>
        )}

        {(href || project.website) && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.6rem',
              marginTop: 'clamp(1.25rem, 2.2vw, 1.85rem)',
            }}
          >
            {href && (
              <Link href={href} className="proj-pill font-mono">
                Case study
              </Link>
            )}
            {project.website && (
              <a
                href={project.website}
                target="_blank"
                rel="noreferrer"
                className="proj-pill proj-pill-soft font-mono"
              >
                Website
              </a>
            )}
          </div>
        )}
      </div>

      {/* Meta — year, category, client */}
      <div className="proj-meta font-mono">
        <span style={{ color: 'rgba(10,10,10,0.4)' }}>{project.year}</span>
        <span style={{ color: INK }}>{project.category}</span>
        <span style={{ color: 'rgba(10,10,10,0.4)' }}>{project.client}</span>
      </div>
    </motion.article>
  )
}

/* ---- section ------------------------------------------------------------ */

/**
 * Selected work — an ordered editorial list: image left, numbered title +
 * description + actions center, year/category/client right, dashed rules
 * between entries. Replaces the earlier uniform 3-up grid, which read as an
 * index and gave no project room to say what it was.
 */
export function AgencyFeaturedProjects() {
  return (
    <section
      style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: 'clamp(2.5rem, 6vw, 4.5rem) var(--gutter, 1.5rem) 2rem',
      }}
    >
      <style>{`
        .proj-row {
          display: grid;
          grid-template-areas: "media" "meta" "body";
          grid-template-columns: minmax(0, 1fr);
          gap: clamp(1rem, 3vw, 1.5rem);
          padding: clamp(2rem, 4.5vw, 3.5rem) 0;
          align-items: start;
        }
        .proj-row + .proj-row {
          border-top: 1px dashed rgba(10,10,10,0.22);
        }
        .proj-media { grid-area: media; }
        .proj-body  { grid-area: body; min-width: 0; }
        .proj-meta  { grid-area: meta; }

        .proj-img {
          object-fit: cover;
          transition: transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .proj-row:hover .proj-img { transform: scale(1.04); }
        .proj-title-link { transition: color 200ms; }
        .proj-title-link:hover { color: ${BLUE}; }

        .proj-services {
          display: flex;
          flex-wrap: wrap;
          gap: 0.3rem 0.85rem;
          margin: clamp(0.85rem, 1.5vw, 1.15rem) 0 0;
          padding: 0;
          list-style: none;
          font-size: 0.68rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(10,10,10,0.45);
        }
        .proj-services li + li::before {
          content: "·";
          padding-right: 0.85rem;
          opacity: 0.55;
        }

        .proj-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem 1rem;
          font-size: 0.72rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .proj-pill {
          display: inline-flex;
          align-items: center;
          padding: 0.6rem 1.15rem;
          border: 1px solid rgba(10,10,10,0.2);
          border-radius: 999px;
          color: ${INK};
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          white-space: nowrap;
          transition: border-color 200ms, color 200ms, background 200ms;
        }
        .proj-pill:hover { border-color: ${BLUE}; color: ${BLUE}; }
        .proj-pill-soft {
          background: rgba(10,10,10,0.05);
          border-color: transparent;
        }
        .proj-pill-soft:hover {
          background: rgba(31,68,255,0.08);
          border-color: transparent;
        }

        @media (min-width: 900px) {
          .proj-row {
            grid-template-areas: "media body meta";
            grid-template-columns: minmax(0, 0.95fr) minmax(0, 1fr) minmax(0, 0.34fr);
            gap: clamp(2rem, 4vw, 4rem);
          }
          .proj-meta {
            flex-direction: column;
            align-items: flex-end;
            text-align: right;
            gap: 0.45rem;
          }
        }
      `}</style>

      {/* The section has no visible title by design, but the project rows are
          <h3>s — without this the outline jumps h1 → h3. Hidden, not removed. */}
      <h2 className="sr-only">Selected work</h2>

      {FEATURED.map((p) => (
        <ProjectRow key={p.title} project={p} />
      ))}

      <SeeAllWork
        href="/agency/work"
        label="View All Projects"
        ballSize="clamp(300px, 36vw, 480px)"
        height="clamp(260px, 32vh, 420px)"
      />
    </section>
  )
}
