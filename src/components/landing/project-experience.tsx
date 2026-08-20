'use client'

import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import type { PlaceholderProject } from '@/lib/placeholder-projects'
import { LandingSidebar, SocialRow } from './landing-sidebar'
import { INK, BG, BLUE } from './landing-theme'

const EASE = [0.22, 1, 0.36, 1] as const
const GUTTER = 'var(--gutter, 1.5rem)'
const MAXW = '1100px'

/* ---- small shared pieces (mirrors about/contact experiences) ------------ */

/**
 * Section label. Defaults to a <span>, but section labels pass `as="h2"` so the
 * page has a real heading outline — the styles below are fully explicit
 * (including `margin: 0`) so swapping the tag changes nothing visually.
 */
function Eyebrow({
  children,
  as: Tag = 'span',
}: {
  children: ReactNode
  as?: 'span' | 'h2'
}) {
  return (
    <Tag
      className="font-mono"
      style={{
        display: 'block',
        // margin/weight/line-height are neutralised against the <h2> UA
        // defaults. `inherit` (not a literal) so this matches exactly what the
        // original <span> resolved to from its ancestors.
        margin: 0,
        fontWeight: 'inherit',
        lineHeight: 'inherit',
        fontSize: '0.7rem',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: 'rgba(10,10,10,0.5)',
      }}
    >
      {children}
    </Tag>
  )
}

function Reveal({
  children,
  delay = 0,
  style,
}: {
  children: ReactNode
  delay?: number
  style?: React.CSSProperties
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: reduce ? 0 : 0.7,
        ease: EASE,
        delay: reduce ? 0 : delay,
      }}
      style={style}
    >
      {children}
    </motion.div>
  )
}

function FramedImage({
  src,
  alt,
  ratio,
  sizes,
  priority,
}: {
  src: string
  alt: string
  ratio: number
  sizes: string
  priority?: boolean
}) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: ratio,
        overflow: 'hidden',
        borderRadius: '20px',
        background: 'rgba(10,10,10,0.04)',
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  )
}

/**
 * A single Client/Project/Role/Collaborators cell in the hero meta bar.
 *
 * The "Project" cell passes `as="h1"` — the project title is the only text on
 * the page that names its subject, so it needs to be the page's heading. The
 * value styles are fully explicit (including `margin: 0`) so the tag swap is
 * visually inert.
 */
function MetaCell({
  label,
  value,
  as: Tag = 'span',
}: {
  label: string
  value: string
  as?: 'span' | 'h1'
}) {
  return (
    <div>
      <span
        className="font-mono"
        style={{
          display: 'block',
          fontSize: '0.62rem',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.62)',
          marginBottom: '0.45rem',
        }}
      >
        {label}
      </span>
      <Tag
        className="font-display"
        style={{
          display: 'block',
          margin: 0,
          fontSize: 'clamp(0.82rem, 1.3vw, 0.98rem)',
          fontWeight: 600,
          lineHeight: 1.3,
          color: '#ffffff',
        }}
      >
        {value}
      </Tag>
    </div>
  )
}

/* ---- page --------------------------------------------------------------- */

/**
 * Standalone project / case-study page. Built on the same warm visual language
 * as the /about and /contact experiences (warm shell, left-hand sidebar,
 * Reveal-on-scroll, 20px-framed imagery, shared footer band). Flow:
 * hero with overlaid metadata → About lede → Concept / Production →
 * paired detail images → full-width lead media → Similar projects → footer.
 */
export function ProjectExperience({ project }: { project: PlaceholderProject }) {
  const twoCol = project.sections.find((s) => s.type === 'two-column')
  const leftLabel = twoCol?.leftLabel ?? 'Concept'
  const rightLabel = twoCol?.rightLabel ?? 'Production'
  const leftText = twoCol?.leftText
  const rightText = twoCol?.rightText

  const role = project.role.join(', ')
  const collabs = project.collaborators
    .map((c) => c.name)
    .slice(0, 4)
    .join(', ')

  const pair = project.supportingImages.slice(0, 2)

  return (
    <>
      <LandingSidebar active="work" inPage={false} />

      <main style={{ position: 'relative', zIndex: 3 }}>
        {/* Top brand row — orientation + a way home. */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: `clamp(1.5rem, 4vw, 2.5rem) ${GUTTER} 0`,
          }}
        >
          <div style={{ width: '100%', maxWidth: MAXW }}>
            <Link
              href="/"
              className="font-display"
              style={{
                fontWeight: 700,
                fontSize: '0.95rem',
                letterSpacing: '0.02em',
                color: INK,
                textDecoration: 'none',
              }}
            >
              Studio Studio
            </Link>
          </div>
        </div>

        {/* ---- Hero — framed image + overlaid metadata bar ----------------- */}
        <section
          style={{
            padding: `clamp(1.5rem, 4vw, 2.75rem) ${GUTTER} clamp(2rem, 5vw, 3.5rem)`,
          }}
        >
          <Reveal>
            <div style={{ width: '100%', maxWidth: MAXW, margin: '0 auto' }}>
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: 3 / 2,
                  overflow: 'hidden',
                  borderRadius: '20px',
                  background: 'rgba(10,10,10,0.04)',
                }}
              >
                <Image
                  src={project.heroImage}
                  alt={`${project.title} — ${project.client}`}
                  fill
                  priority
                  sizes="(min-width: 1100px) 1100px, 92vw"
                  className="object-cover"
                />

                {/* Legibility scrim — only the bottom band darkens. */}
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(to top, rgba(10,10,10,0.78) 0%, rgba(10,10,10,0.28) 26%, transparent 56%)',
                  }}
                />

                {/* Metadata bar — Client / Project / Role / Collaborators. */}
                <div
                  className="project-meta-grid"
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 'clamp(0.75rem, 2vw, 1.5rem)',
                    padding: 'clamp(1.25rem, 3vw, 2.25rem)',
                  }}
                >
                  <MetaCell label="Client" value={project.client} />
                  <MetaCell label="Project" value={project.title} as="h1" />
                  <MetaCell label="Role" value={role} />
                  <MetaCell label="Collaborators" value={collabs} />
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ---- About — eyebrow + large lede -------------------------------- */}
        <section
          style={{
            padding: `clamp(1.5rem, 4vw, 3rem) ${GUTTER} clamp(2.5rem, 6vw, 4.5rem)`,
          }}
        >
          <div style={{ width: '100%', maxWidth: MAXW, margin: '0 auto' }}>
            <Reveal>
              <Eyebrow as="h2">About</Eyebrow>
            </Reveal>
            <Reveal delay={0.05}>
              <p
                className="font-display"
                style={{
                  fontWeight: 500,
                  fontSize: 'clamp(1.5rem, 3.4vw, 2.6rem)',
                  lineHeight: 1.14,
                  letterSpacing: '-0.025em',
                  color: INK,
                  margin: '1.5rem 0 0',
                  maxWidth: '24ch',
                }}
              >
                {project.about}
              </p>
            </Reveal>
          </div>
        </section>

        {/* ---- Concept / Production — two columns -------------------------- */}
        {(leftText || rightText) && (
          <section
            style={{
              padding: `0 ${GUTTER} clamp(3rem, 7vw, 5.5rem)`,
            }}
          >
            <Reveal>
              <div
                className="project-two-col grid grid-cols-1 md:grid-cols-2"
                style={{
                  width: '100%',
                  maxWidth: MAXW,
                  margin: '0 auto',
                  gap: 'clamp(2rem, 5vw, 5rem)',
                  alignItems: 'start',
                }}
              >
                {leftText && (
                  <div className="flex flex-col" style={{ gap: '1rem' }}>
                    <Eyebrow as="h2">{leftLabel}</Eyebrow>
                    <p
                      className="font-display"
                      style={{
                        margin: 0,
                        fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)',
                        lineHeight: 1.6,
                        color: 'rgba(10,10,10,0.72)',
                      }}
                    >
                      {leftText}
                    </p>
                  </div>
                )}
                {rightText && (
                  <div className="flex flex-col" style={{ gap: '1rem' }}>
                    <Eyebrow as="h2">{rightLabel}</Eyebrow>
                    <p
                      className="font-display"
                      style={{
                        margin: 0,
                        fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)',
                        lineHeight: 1.6,
                        color: 'rgba(10,10,10,0.72)',
                      }}
                    >
                      {rightText}
                    </p>
                  </div>
                )}
              </div>
            </Reveal>
          </section>
        )}

        {/* ---- Paired detail images --------------------------------------- */}
        {pair.length > 0 && (
          <section
            style={{
              padding: `0 ${GUTTER} clamp(1.5rem, 3.5vw, 2.5rem)`,
            }}
          >
            <Reveal>
              <div
                className="project-pair grid grid-cols-1 md:grid-cols-2"
                style={{
                  width: '100%',
                  maxWidth: MAXW,
                  margin: '0 auto',
                  gap: 'clamp(1.5rem, 3.5vw, 2.5rem)',
                }}
              >
                {pair.map((src, i) => (
                  <FramedImage
                    key={src}
                    src={src}
                    alt={`${project.title} — detail ${i + 1}`}
                    ratio={3 / 2}
                    sizes="(min-width: 768px) 540px, 92vw"
                  />
                ))}
              </div>
            </Reveal>
          </section>
        )}

        {/* ---- Full-width lead media -------------------------------------- */}
        <section
          style={{
            padding: `clamp(1.5rem, 3.5vw, 2.5rem) ${GUTTER} clamp(3rem, 7vw, 5.5rem)`,
          }}
        >
          <Reveal>
            <div style={{ width: '100%', maxWidth: MAXW, margin: '0 auto' }}>
              <FramedImage
                src={project.mainMedia}
                alt={`${project.title} — full view`}
                ratio={16 / 9}
                sizes="(min-width: 1100px) 1100px, 92vw"
              />
            </div>
          </Reveal>
        </section>

        {/* ---- Similar projects ------------------------------------------- */}
        {project.similarProjects.length > 0 && (
          <section
            style={{
              padding: `0 ${GUTTER} clamp(4rem, 9vw, 7rem)`,
            }}
          >
            <div style={{ width: '100%', maxWidth: MAXW, margin: '0 auto' }}>
              <Reveal>
                <Eyebrow as="h2">Similar projects</Eyebrow>
              </Reveal>
              <Reveal delay={0.05} style={{ marginTop: 'clamp(1.5rem, 3vw, 2.25rem)' }}>
                <div
                  className="project-similar grid grid-cols-1 md:grid-cols-2"
                  style={{
                    gap: 'clamp(1.5rem, 3.5vw, 2.5rem)',
                  }}
                >
                  {project.similarProjects.map((sp) => (
                    <Link
                      key={sp.slug}
                      href={`/work/${sp.slug}`}
                      className="group"
                      style={{ textDecoration: 'none', display: 'block' }}
                    >
                      <div
                        style={{
                          position: 'relative',
                          width: '100%',
                          aspectRatio: 4 / 3,
                          overflow: 'hidden',
                          borderRadius: '20px',
                          background: 'rgba(10,10,10,0.04)',
                        }}
                      >
                        <Image
                          src={sp.image}
                          alt={sp.title}
                          fill
                          sizes="(min-width: 768px) 540px, 92vw"
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                        />
                      </div>
                      <span
                        className="font-display"
                        style={{
                          display: 'block',
                          marginTop: '0.9rem',
                          fontSize: 'clamp(1rem, 1.6vw, 1.2rem)',
                          fontWeight: 600,
                          letterSpacing: '-0.01em',
                          color: INK,
                        }}
                      >
                        {sp.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </Reveal>
            </div>
          </section>
        )}

        {/* ---- Footer band ------------------------------------------------- */}
        <footer
          style={{
            padding: `0 ${GUTTER} clamp(8rem, 14vh, 11rem)`,
          }}
        >
          <div
            className="flex flex-col items-center"
            style={{
              width: '100%',
              maxWidth: MAXW,
              margin: '0 auto',
              gap: '1.5rem',
            }}
          >
            <SocialRow size={24} gap="1.75rem" horizontal />
            <span
              className="font-mono"
              style={{
                color: INK,
                opacity: 0.55,
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              © 2026 Studio Studio · Brooklyn, NY
            </span>
          </div>
        </footer>
      </main>

      {/* On small screens the hero meta bar collapses to two columns. */}
      <style>{`
        @media (max-width: 640px) {
          .project-meta-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      {/* Background tint behind everything (matches the home shell). */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          background: BG,
          pointerEvents: 'none',
        }}
      />
    </>
  )
}
