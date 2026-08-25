'use client'

import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import type { PlaceholderProject } from '@/lib/placeholder-projects'
import { LandingSidebar } from './landing-sidebar'
import { SiteFooter } from './site-footer'
import { INK, BG, BLUE } from './landing-theme'

const EASE = [0.22, 1, 0.36, 1] as const
/**
 * The hairline every rule on the page is drawn in. The sheet is painted in it
 * and the cells are painted in the page ground, so a 1px grid gap is the rule —
 * no element ever draws a border of its own.
 */
const RULE = 'rgba(232, 228, 223, 0.16)'

/**
 * The masonry under the hero. Each slot is a column span on a 6-wide grid plus
 * its own aspect ratio, so no two neighbours share a shape and the rows still
 * close flush: 4+2, 2+4, then a full-width band. Slots are consumed in order
 * and the last tile always runs to the end of its row, so a project with fewer
 * frames than slots leaves no hole.
 */
const MASONRY_SLOTS = [
  { cols: 4, ratio: 3 / 2 },
  { cols: 2, ratio: 3 / 4 },
  { cols: 2, ratio: 1 },
  { cols: 4, ratio: 16 / 9 },
  { cols: 6, ratio: 21 / 9 },
]

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

/**
 * Section label. Defaults to a <span>, but section labels pass `as="h2"` so the
 * page has a real heading outline — the styles are fully explicit (including
 * `margin: 0`) so swapping the tag changes nothing visually.
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
        margin: 0,
        fontWeight: 'inherit',
        lineHeight: 'inherit',
        fontSize: '0.7rem',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: 'rgba(232, 228, 223, 0.5)',
      }}
    >
      {children}
    </Tag>
  )
}

/* ---- page --------------------------------------------------------------- */

/**
 * Standalone project / case-study page. The page is one ruled sheet, inset from
 * the viewport on every side: title strip, hero, masonry and the
 * similar-projects row are all rows of the same grid. Every division is a
 * hairline, and none are drawn as borders — the sheet paints itself in the rule
 * colour and each cell paints itself in the page ground, so a 1px grid gap *is*
 * the rule. One system, so nothing can fall out of alignment with anything
 * else.
 *
 * There is no brand bar: the title strip is the first row, sized so it centres
 * on the fixed nav dock (see .proj-titlebar) and the two read as one line.
 *
 * The media column takes whatever images the project has — the first as the
 * hero, the rest into the masonry. Most projects carry only the hero today, in
 * which case the masonry simply doesn't render.
 */
export function ProjectExperience({ project }: { project: PlaceholderProject }) {
  const twoCol = project.sections.find((s) => s.type === 'two-column')
  const leftLabel = twoCol?.leftLabel ?? 'Concept'
  const rightLabel = twoCol?.rightLabel ?? 'Production'
  const leftText = twoCol?.leftText
  const rightText = twoCol?.rightText

  // Everything the project has, in reading order. Deduped: a generated page
  // uses its one frame as the hero and leaves mainMedia empty, but an authored
  // one occasionally repeats a frame between slots.
  const images = Array.from(
    new Set(
      [project.heroImage, project.mainMedia, ...project.supportingImages].filter(
        Boolean,
      ),
    ),
  )
  const [hero, ...rest] = images
  const masonry = rest.slice(0, MASONRY_SLOTS.length)

  const collabs = project.collaborators.slice(0, 6)

  return (
    <>
      <LandingSidebar active="work" inPage={false} />

      <main style={{ position: 'relative', zIndex: 3 }}>
        <div className="proj-sheet">
          {/* Head row — the studio mark in a square, then the title strip.
              Both are set to the nav dock's own height so the mark, the title
              and the menu all sit on one line. */}
          <div className="proj-head">
            <Link href="/" className="proj-mark" aria-label="Studio Studio — home">
              {/* The file is black type on an opaque white field, so it is
                  inverted (white type on black) and blended with `lighten`:
                  against the near-black cell the black field loses and the
                  white letterforms win, leaving the wordmark sitting directly
                  on the page ground with no block around it. */}
              <Image
                src="/logo.png"
                alt=""
                width={1254}
                height={612}
                priority
                className="proj-marklogo"
              />
            </Link>
            <header className="proj-titlebar">
              <h1 className="proj-title font-display">{project.title}</h1>
              <p className="proj-titlemeta font-mono">{project.category}</p>
            </header>
          </div>

          <div className="proj-body">
            <div className="proj-media">
              {/* Hero — the frame the project leads with, full width of the
                  media column. */}
              {hero && (
                <div className="proj-hero">
                  <Image
                    src={hero}
                    alt={`${project.title} — ${project.client}`}
                    fill
                    priority
                    sizes="(min-width: 900px) 74vw, 100vw"
                    className="object-cover"
                  />
                </div>
              )}

              {/* Masonry — the remaining frames, each on its own slot so the
                  run reads as a composed spread rather than a contact sheet. */}
              {masonry.length > 0 && (
                <div className="proj-masonry">
                  {masonry.map((src, i) => (
                    <div
                      key={src}
                      className="proj-mtile"
                      style={{
                        gridColumn: `span ${MASONRY_SLOTS[i].cols}`,
                        aspectRatio: MASONRY_SLOTS[i].ratio,
                      }}
                    >
                      <Image
                        src={src}
                        alt={`${project.title} — detail ${i + 1}`}
                        fill
                        sizes="(min-width: 900px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rail — the project's information, set as a stack of ruled
                registers on the same 1px system as the sheet around it. The
                column itself runs the full height of the body so the hairline
                against the media never stops short; the registers ride inside
                it and stick to the top on desktop. */}
            <aside className="proj-rail">
              <div className="proj-railinner">
                <Reveal>
                  <div className="proj-regs">
                    {project.about && (
                      <div className="proj-reg">
                        <p className="proj-lede font-display">{project.about}</p>
                      </div>
                    )}

                    {/* Client and year share a register, split by the same
                        hairline that divides media from rail. */}
                    <div className="proj-regrow">
                      <div className="proj-reg">
                        <span className="proj-label font-mono">Client</span>
                        <span className="proj-value font-display">
                          {project.client}
                        </span>
                      </div>
                      <div className="proj-reg">
                        <span className="proj-label font-mono">Year</span>
                        <span className="proj-value font-display">
                          {project.year}
                        </span>
                      </div>
                    </div>

                    {project.role.length > 0 && (
                      <div className="proj-reg">
                        <span className="proj-label font-mono">Roles</span>
                        <ol className="proj-roles">
                          {project.role.map((r, i) => (
                            <li key={r} className="proj-role">
                              <span className="proj-rolenum font-mono" aria-hidden>
                                {String(i + 1).padStart(2, '0')}
                              </span>
                              <span className="proj-value font-display">{r}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Concept / Production, where the project carries them —
                        further registers rather than a band of their own. */}
                    {leftText && (
                      <div className="proj-reg">
                        <h2 className="proj-label font-mono">{leftLabel}</h2>
                        <p className="proj-note font-display">{leftText}</p>
                      </div>
                    )}
                    {rightText && (
                      <div className="proj-reg">
                        <h2 className="proj-label font-mono">{rightLabel}</h2>
                        <p className="proj-note font-display">{rightText}</p>
                      </div>
                    )}

                    {collabs.length > 0 && (
                      <div className="proj-reg">
                        <h2 className="proj-label font-mono">Credits</h2>
                        <ul className="proj-credits">
                          {collabs.map((c) => (
                            <li key={c.name} className="proj-credit">
                              <span className="proj-value font-display">
                                {c.name}
                              </span>
                              <span className="proj-creditrole font-mono">
                                {c.role}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* The way onward, as a full-width register that fills on
                        hover — the same blue the nav pill uses. */}
                    {project.website ? (
                      <a
                        href={project.website}
                        target="_blank"
                        rel="noreferrer"
                        className="proj-cta font-mono"
                      >
                        <span>Visit site</span>
                        <span aria-hidden>↗</span>
                      </a>
                    ) : (
                      <Link href="/#work" className="proj-cta font-mono">
                        <span>View more work</span>
                        <span aria-hidden>→</span>
                      </Link>
                    )}
                  </div>
                </Reveal>
              </div>
            </aside>
          </div>

          {/* Similar projects — the same sheet continues: a label strip, then
              tiles on the grid's own module. */}
          {project.similarProjects.length > 0 && (
            <>
              <header className="proj-sectionbar">
                <Eyebrow as="h2">Similar projects</Eyebrow>
              </header>
              <div className="proj-simgrid">
                {project.similarProjects.map((sp) => (
                  <Link
                    key={sp.slug}
                    href={`/work/${sp.slug}`}
                    className="proj-simcard group"
                  >
                    <div className="proj-simmedia">
                      <Image
                        src={sp.image}
                        alt={sp.title}
                        fill
                        sizes="(min-width: 900px) 50vw, 100vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      />
                    </div>
                    <span className="proj-simcap font-display">{sp.title}</span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        <SiteFooter />
      </main>

      <style>{`
        /* The sheet. Inset from every viewport edge, so the outer rule reads as
           a frame rather than as a browser artefact. It paints itself in the
           rule colour, every cell inside paints itself in the page ground, and
           a 1px grid gap is therefore a hairline — no cell draws a border of
           its own, so the rules are continuous and exactly one pixel. */
        .proj-sheet {
          --sheet-inset: 15px;
          /* The nav dock is fixed at this offset and stands ~47px tall
             (0.35rem padding + 1px border around a 0.5rem/1.1rem li holding a
             0.95rem label). The title strip below matches centres with it. */
          --dock-top: clamp(1.4rem, 3.4vh, 2.4rem);
          --dock-half: 23.5px;

          margin: calc(var(--sheet-inset) + env(safe-area-inset-top))
                  calc(var(--sheet-inset) + env(safe-area-inset-right))
                  var(--sheet-inset)
                  calc(var(--sheet-inset) + env(safe-area-inset-left));
          background: ${RULE};
          border: 1px solid ${RULE};
          display: grid;
          gap: 1px;
        }

        /* Every cell of the sheet shares one inset, so the title, the rail text
           and the captions all sit on a single left edge down the page. */
        .proj-sheet { --cell-pad: clamp(1rem, 2vw, 1.75rem); }
        .proj-titlebar,
        .proj-sectionbar,
        .proj-simcap {
          background: ${BG};
        }

        /* Head-row height, and therefore the mark's side. Sized so the row's
           centre lands on the dock's: the row starts at the sheet inset, so
           half its height must equal the dock's centre minus that inset.
           Safe-area insets cancel — the dock and the sheet carry the same one. */
        .proj-sheet {
          --head-h: calc(
            2 * (var(--dock-top) + var(--dock-half) - var(--sheet-inset))
          );
        }
        .proj-head {
          display: grid;
          grid-template-columns: var(--head-h) minmax(0, 1fr);
          gap: 1px;
          background: ${RULE};
        }
        /* Square by construction: its width is the row height, and the grid
           stretches it to match. */
        .proj-mark {
          background: ${BG};
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 22%;
          isolation: isolate;
        }
        .proj-marklogo {
          width: 100%;
          height: auto;
          filter: invert(1);
          mix-blend-mode: lighten;
        }

        .proj-titlebar {
          min-height: var(--head-h);
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.4rem clamp(1rem, 2.5vw, 2rem);
          padding: 0.4rem var(--cell-pad);
          /* The dock floats over the top-right corner; leave it room. */
          padding-right: clamp(8rem, 16vw, 13rem);
        }
        .proj-title {
          margin: 0;
          font-weight: 400;
          font-size: clamp(1.4rem, 2.6vw, 2.1rem);
          line-height: 1;
          letter-spacing: -0.02em;
          color: ${INK};
        }
        .proj-titlemeta {
          margin: 0;
          font-size: clamp(0.66rem, 0.9vw, 0.78rem);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(232, 228, 223, 0.5);
        }

        .proj-sectionbar { padding: clamp(0.8rem, 1.6vw, 1.15rem) var(--cell-pad); }

        /* Media left, rail right. The rail is a fixed measure so the text never
           stretches past a comfortable line length on a wide display. */
        .proj-body {
          display: grid;
          gap: 1px;
          background: ${RULE};
          grid-template-columns: 1fr;
        }
        @media (min-width: 900px) {
          .proj-body {
            grid-template-columns: minmax(0, 1fr) clamp(23.75rem, 32.5%, 35rem);
          }
        }

        .proj-media {
          display: grid;
          gap: 1px;
          background: ${RULE};
          align-content: start;
        }
        .proj-hero {
          position: relative;
          background: ${BG};
          aspect-ratio: 16 / 10;
          overflow: hidden;
        }

        /* Six columns, so a slot can take 2, 3, 4 or the whole run. */
        .proj-masonry {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 1px;
          background: ${RULE};
        }
        .proj-mtile {
          position: relative;
          background: ${BG};
          overflow: hidden;
        }
        /* Whatever the count, the run finishes flush against the right edge. */
        .proj-mtile:last-child { grid-column-end: -1; }

        /* The rail column. Stretches the full height of the body — with
           align-self:start the sheet's rule colour would show through below it
           as a block — and carries the page ground; the registers inside supply
           their own rules. */
        .proj-rail { background: ${BG}; }
        .proj-railinner { padding: 0; }
        @media (min-width: 900px) {
          .proj-railinner {
            position: sticky;
            top: calc(var(--sheet-inset) + 1px);
          }
        }

        /* The register stack. Same trick as the sheet: the stack is painted in
           the rule colour, each register in the page ground, so the 1px gaps
           between them are hairlines running the full width of the rail. The
           trailing 1px of padding closes the block with a rule of its own. */
        .proj-regs {
          display: grid;
          gap: 1px;
          background: ${RULE};
          padding-bottom: 1px;
        }
        .proj-reg {
          background: ${BG};
          padding: clamp(1rem, 1.9vw, 1.5rem) var(--cell-pad);
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
        }
        /* Client | Year — split by the same hairline that divides the page. */
        .proj-regrow {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: ${RULE};
        }

        /* The lede carries the page's voice, so it is set larger and lighter
           than body copy and given a tighter measure than the rail's width. */
        .proj-lede {
          margin: 0;
          font-weight: 400;
          /* 1.5x the old measure. At this size the leading has to come in or
             the lines drift apart, and the tracking tightens with it. */
          font-size: clamp(1.53rem, 2.03vw, 1.92rem);
          line-height: 1.3;
          letter-spacing: -0.022em;
          color: rgba(232, 228, 223, 0.9);
        }

        /* One label style for every register, so Client, Roles, Credits and the
           concept notes all key off the same mark. */
        .proj-label {
          display: block;
          margin: 0;
          font-weight: 400;
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(232, 228, 223, 0.4);
        }
        .proj-value {
          font-size: clamp(0.92rem, 1.15vw, 1.02rem);
          font-weight: 500;
          line-height: 1.25;
          letter-spacing: -0.01em;
          color: ${INK};
        }

        /* Roles as a numbered spec list — the studio's own technical voice,
           and a far better read than a comma run. */
        .proj-roles {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .proj-role {
          display: grid;
          grid-template-columns: 1.6rem minmax(0, 1fr);
          align-items: baseline;
          gap: 0.35rem;
        }
        .proj-rolenum {
          font-size: 0.6rem;
          letter-spacing: 0.08em;
          color: rgba(232, 228, 223, 0.32);
          font-variant-numeric: tabular-nums;
        }

        .proj-note {
          margin: 0;
          font-size: clamp(0.86rem, 1.05vw, 0.95rem);
          line-height: 1.6;
          color: rgba(232, 228, 223, 0.66);
        }

        .proj-credits {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
        }
        /* Name left, role ranged right against it — the pair reads as a line of
           credits rather than as two stacked fields. */
        .proj-credit {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          justify-content: space-between;
          gap: 0.5rem 1rem;
        }
        .proj-creditrole {
          font-size: 0.6rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(232, 228, 223, 0.4);
        }

        /* The way onward. A register like the others until you touch it, then
           the whole row fills with the blue the nav pill uses. */
        .proj-cta {
          background: ${BG};
          padding: clamp(1rem, 1.9vw, 1.4rem) var(--cell-pad);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          font-size: 0.68rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: ${INK};
          text-decoration: none;
          transition: background 220ms cubic-bezier(0.22, 1, 0.36, 1),
                      color 220ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .proj-cta:hover { background: ${BLUE}; color: #fff; }
        .proj-cta span:last-child { transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1); }
        .proj-cta:hover span:last-child { transform: translateX(0.25rem); }

        /* A similar-projects card is a sheet cell like any other: its own
           ground, its caption ruled off from its image by the same 1px gap. */
        .proj-simgrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1px;
          background: ${RULE};
        }
        .proj-simcard {
          display: grid;
          gap: 1px;
          background: ${RULE};
          text-decoration: none;
        }
        .proj-simmedia {
          position: relative;
          background: ${BG};
          aspect-ratio: 16 / 10;
          overflow: hidden;
        }
        .proj-simcap {
          display: block;
          padding: clamp(0.7rem, 1.4vw, 1rem) var(--cell-pad);
          font-size: clamp(0.95rem, 1.4vw, 1.15rem);
          font-weight: 600;
          letter-spacing: -0.01em;
          color: ${INK};
          transition: color 200ms;
        }
        .proj-simcard:hover .proj-simcap { color: ${BLUE}; }

        /* Narrow: the masonry slots stop dividing usefully, so every frame
           takes the full run and keeps a single readable ratio. */
        @media (max-width: 640px) {
          .proj-mtile {
            grid-column: 1 / -1 !important;
            aspect-ratio: 4 / 3 !important;
          }
          .proj-simgrid { grid-template-columns: minmax(0, 1fr); }
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
