'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import type { PlaceholderProject } from '@/lib/placeholder-projects'
import { LandingSidebar } from './landing-sidebar'
import { SiteFooter } from './site-footer'
import { ContactForm } from './contact-form'
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
 * close flush: 4+2, 2+4, a full-width band, then a pair of halves (near 6:5,
 * the shape of a browser screenshot). Slots are consumed in order
 * and the last tile always runs to the end of its row, so a project with fewer
 * frames than slots leaves no hole.
 */
const MASONRY_SLOTS = [
  { cols: 4, ratio: 3 / 2 },
  { cols: 2, ratio: 3 / 4 },
  { cols: 2, ratio: 1 },
  { cols: 4, ratio: 16 / 9 },
  { cols: 6, ratio: 21 / 9 },
  { cols: 3, ratio: 6 / 5 },
  { cols: 3, ratio: 6 / 5 },
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

/**
 * The case-study body, set in the rail's note style. Headings and quotes from
 * Studio fall back to paragraphs here — the rail is one voice, not a document.
 */
const STORY: PortableTextComponents = {
  block: ({ children }) => <p className="proj-note font-display">{children}</p>,
  marks: {
    link: ({ children, value }) => (
      <a href={value?.href} target="_blank" rel="noreferrer" className="proj-link">
        {children}
      </a>
    ),
  },
}

/* ---- page --------------------------------------------------------------- */

/** Standalone project / case-study page: the dock, the sheet, the footer. */
export function ProjectExperience({ project }: { project: PlaceholderProject }) {
  // Contact opens a panel under the head row rather than leaving the project:
  // the enquiry starts from the work that prompted it.
  const [contactOpen, setContactOpen] = useState(false)

  useEffect(() => {
    if (!contactOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContactOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [contactOpen])

  return (
    <>
      {/* Unpinned: on the sheet the dock is the head row's right-hand cell, so
          it scrolls away with the row rather than following the reader down a
          page it is no longer part of. The pill moves to contact while the
          panel is open. */}
      <LandingSidebar
        active={contactOpen ? 'contact' : 'work'}
        inPage={false}
        pinned={false}
        contactOpen={contactOpen}
        onToggleContact={() => setContactOpen((o) => !o)}
      />

      <main style={{ position: 'relative', zIndex: 3 }}>
        <ProjectSheet
          project={project}
          contactOpen={contactOpen}
          onCloseContact={() => setContactOpen(false)}
        />
        <SiteFooter />
      </main>

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

/**
 * The project page's ruled sheet. The page is one ruled sheet, inset from
 * the viewport on every side: title strip, hero, masonry and the
 * similar-projects row are all rows of the same grid. Every division is a
 * hairline, and none are drawn as borders — the sheet paints itself in the rule
 * colour and each cell paints itself in the page ground, so a 1px grid gap *is*
 * the rule. One system, so nothing can fall out of alignment with anything
 * else.
 *
 * There is no brand bar: the title strip is the first row, and it is exactly as
 * tall as the fixed nav dock, which sits flush in its right end — same top,
 * bottom and right rules — so the mark, the title and the menu are one row of
 * the grid rather than a strip with something floating over it.
 *
 * The media column takes whatever images the project has — the first as the
 * hero, the rest into the masonry. Most projects carry only the hero today, in
 * which case the masonry simply doesn't render.
 *
 * The homepage runs the same sheet below its fold (`embedded`), for whichever
 * project the trail rests on. There the dock isn't in the head row, the title
 * steps down to an h2 under the page's own h1, nothing claims priority loading,
 * and "View more work" opens the index in place when `onMoreWork` is given.
 * It stacks several sheets there, and `flip` puts the rail on the left of the
 * media rather than the right, so the stack alternates as it runs down;
 * `showSimilar` is off on all but the last, so similar projects close the
 * stack once instead of repeating under every sheet.
 *
 * The standalone page also hands it the contact panel's state: a row that
 * slides open under the head row when contact is pressed in the dock.
 */
export function ProjectSheet({
  project,
  embedded = false,
  flip = false,
  showSimilar = true,
  onMoreWork,
  contactOpen = false,
  onCloseContact,
}: {
  project: PlaceholderProject
  embedded?: boolean
  flip?: boolean
  showSimilar?: boolean
  onMoreWork?: () => void
  contactOpen?: boolean
  onCloseContact?: () => void
}) {
  const reduce = useReducedMotion()
  const contactRef = useRef<HTMLElement | null>(null)

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
  // The pair of halves closes the sequence; a project that leads with
  // screenshots moves it to the front, where they land side by side.
  const order = project.pairFirst
    ? [...MASONRY_SLOTS.slice(-2), ...MASONRY_SLOTS.slice(0, -2)]
    : MASONRY_SLOTS
  const masonry = rest.slice(0, order.length)
  // A last frame that opens a row runs the full width on its own, where its
  // slot's narrow ratio (a 2-column square) would become a towering crop — so it
  // takes a widescreen band instead.
  const slots = masonry.map((_, i) => {
    const slot = order[i]
    const opensRow =
      order.slice(0, i).reduce((cols, s) => cols + s.cols, 0) % 6 === 0
    return i === masonry.length - 1 && opensRow && slot.cols < 6
      ? { cols: 6, ratio: 16 / 9 }
      : slot
  })

  const collabs = project.collaborators.slice(0, 6)

  const Title = embedded ? 'h2' : 'h1'

  return (
    <>
      <div
        className={[
          'proj-sheet',
          embedded && 'proj-sheet--embedded',
          flip && 'proj-sheet--flip',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* Head row — the studio mark in a square, then the title strip.
            The row stands to the nav dock's own height, and the dock closes
            its right end, so mark, title and menu read as one ruled line. */}
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
              priority={!embedded}
              className="proj-marklogo"
            />
          </Link>
          <header className="proj-titlebar">
            <Title className="proj-title font-display">{project.title}</Title>
            <p className="proj-titlemeta font-mono">{project.category}</p>
          </header>
        </div>

        {/* Contact — a row of the sheet that slides open under the head row,
            split on the same media | rail line as the body below it, so the
            pitch sits over the work and the form over the rail. */}
        <AnimatePresence initial={false}>
          {onCloseContact && contactOpen && (
            <motion.section
              key="contact"
              ref={contactRef}
              id="project-contact"
              aria-labelledby="project-contact-title"
              className="proj-contact"
              variants={{ open: { height: 'auto' }, closed: { height: 0 } }}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}
              onAnimationComplete={(name) => {
                // Hand the cursor to the form once it has finished opening.
                if (name !== 'open') return
                contactRef.current
                  ?.querySelector<HTMLElement>('input:not([type="hidden"])')
                  ?.focus({ preventScroll: true })
              }}
            >
              <div className="proj-contactgrid">
                <div className="proj-contactpitch">
                  <div className="proj-contactbar">
                    <Eyebrow>Contact</Eyebrow>
                    <button
                      type="button"
                      onClick={onCloseContact}
                      className="proj-contactclose font-mono"
                    >
                      Close <span aria-hidden>×</span>
                    </button>
                  </div>
                  <h2
                    id="project-contact-title"
                    className="proj-contacthead font-display"
                  >
                    Looking for something like this?
                  </h2>
                  <p className="proj-note font-display">
                    Drop us a line and let&apos;s set up a call.
                  </p>
                </div>
                <div className="proj-contactform">
                  <ContactForm project={project.title} />
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <div className="proj-body">
          <div className="proj-media">
            <div className="proj-mediarun">
              {/* Hero — the frame the project leads with, full width of the
                  media column. */}
              {hero && (
                <div className="proj-hero">
                  <Image
                    src={hero}
                    alt={`${project.title} — ${project.client}`}
                    fill
                    priority={!embedded}
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
                        gridColumn: `span ${slots[i].cols}`,
                        aspectRatio: slots[i].ratio,
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
                        {project.yearDisplay ?? project.year}
                      </span>
                    </div>
                  </div>

                  {project.location && (
                    <div className="proj-reg">
                      <span className="proj-label font-mono">Location</span>
                      <span className="proj-value font-display">
                        {project.location}
                      </span>
                    </div>
                  )}

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

                  {/* The case study itself, for projects that come from
                      Sanity. Unlabelled: it reads on from the lede. */}
                  {project.body && project.body.length > 0 && (
                    <div className="proj-reg proj-story">
                      <PortableText value={project.body} components={STORY} />
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

                  {project.outcome && (
                    <div className="proj-reg">
                      <h2 className="proj-label font-mono">Outcome</h2>
                      <p className="proj-note font-display">{project.outcome}</p>
                    </div>
                  )}

                  {project.stack && project.stack.length > 0 && (
                    <div className="proj-reg">
                      <h2 className="proj-label font-mono">Stack</h2>
                      <ul className="proj-list">
                        {project.stack.map((item) => (
                          <li key={item} className="proj-value font-display">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {project.materials && (
                    <div className="proj-reg">
                      <h2 className="proj-label font-mono">Materials</h2>
                      <p className="proj-note font-display">{project.materials}</p>
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
                      {project.credit && (
                        <p className="proj-attrib font-display">{project.credit}</p>
                      )}
                    </div>
                  )}

                  {project.thanks && (
                    <div className="proj-reg">
                      <h2 className="proj-label font-mono">Thanks</h2>
                      <p className="proj-note font-display">{project.thanks}</p>
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
                  ) : onMoreWork ? (
                    <button
                      type="button"
                      onClick={onMoreWork}
                      className="proj-cta font-mono"
                    >
                      <span>View more work</span>
                      <span aria-hidden>→</span>
                    </button>
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
        {showSimilar && project.similarProjects.length > 0 && (
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

      <style>{`
      /* The sheet. Inset from every viewport edge, so the outer rule reads as
         a frame rather than as a browser artefact. It paints itself in the
         rule colour, every cell inside paints itself in the page ground, and
         a 1px grid gap is therefore a hairline — no cell draws a border of
         its own, so the rules are continuous and exactly one pixel. */
      .proj-sheet {
        /* --sheet-inset, --rule-w and --dock-h live in :root, because the
           fixed nav dock reads the same three: it insets to this frame and
           stands to --dock-h, so it lands squarely inside the head row's
           rules instead of floating over them. */
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

      /* Head-row height, and therefore the mark's side: the dock's own
         height, so the dock fills the right end of this row exactly — flush
         to its top, bottom and right rules. */
      .proj-sheet { --head-h: var(--dock-h); }
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
        /* The dock occupies the right end of this row. It publishes its
           measured width as --dock-w (see landing-sidebar), so the title
           runs up to its left edge and stops — never under it. The fallback
           covers the first paint, before the measurement lands. */
        padding-right: calc(var(--dock-w, 26rem) + var(--cell-pad));
      }
      /* Embedded on the homepage, the dock lives up in the header band, not
         in this row, so the title strip keeps its plain inset. */
      .proj-sheet--embedded .proj-titlebar { padding-right: var(--cell-pad); }
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

      /* The contact row. Clipped so it can open from nothing; inside, the same
         media | rail split as the body, so its middle hairline continues the
         one running down the page. */
      .proj-contact {
        background: ${BG};
        overflow: hidden;
      }
      .proj-contactgrid {
        display: grid;
        gap: 1px;
        background: ${RULE};
        grid-template-columns: 1fr;
      }
      @media (min-width: 900px) {
        .proj-contactgrid {
          grid-template-columns: minmax(0, 1fr) var(--rail-w);
        }
      }
      .proj-contactpitch,
      .proj-contactform {
        background: ${BG};
        padding: clamp(1.25rem, 2.6vw, 2.25rem) var(--cell-pad);
      }
      .proj-contactpitch {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .proj-contactbar {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: clamp(0.5rem, 2vw, 1.5rem);
      }
      .proj-contacthead {
        margin: 0;
        max-width: 14ch;
        font-weight: 400;
        font-size: clamp(1.9rem, 3.6vw, 3.2rem);
        line-height: 1.02;
        letter-spacing: -0.03em;
        color: ${INK};
      }
      .proj-contactclose {
        background: none;
        border: 0;
        padding: 0;
        cursor: pointer;
        font-size: 0.6rem;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: rgba(232, 228, 223, 0.5);
        transition: color 200ms;
      }
      .proj-contactclose:hover { color: ${BLUE}; }

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
          grid-template-columns: minmax(0, 1fr) var(--rail-w);
        }
        /* Flipped: rail left, media right. */
        .proj-sheet--flip .proj-body {
          grid-template-columns: var(--rail-w) minmax(0, 1fr);
        }
        .proj-sheet--flip .proj-rail { order: -1; }
      }

      /* The media column runs the full height of the body, which a long
         case study in the rail can make far taller than the frames. So the
         column paints the page ground, and the frames sit in a run of their
         own that is painted in the rule colour — its gaps are the hairlines
         between them, and a 1px shadow closes it underneath. Where the frames
         are the taller side, that shadow lands on the sheet's own rule. */
      .proj-media { background: ${BG}; }
      .proj-mediarun {
        display: grid;
        gap: 1px;
        background: ${RULE};
        box-shadow: 0 1px 0 ${RULE};
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
          top: calc(var(--sheet-inset) + var(--rule-w));
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

      /* The body runs as paragraphs in one register, spaced like prose
         rather than split into registers of their own. */
      .proj-story { gap: 0.9em; }
      .proj-link {
        color: inherit;
        text-decoration: underline;
        text-underline-offset: 0.2em;
        text-decoration-color: rgba(232, 228, 223, 0.3);
      }
      .proj-link:hover { color: ${BLUE}; }

      .proj-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }

      /* Attribution for work led in another role — a footnote to the
         credits, quieter than any credit line. */
      .proj-attrib {
        margin: 0.4rem 0 0;
        font-size: 0.78rem;
        line-height: 1.5;
        color: rgba(232, 228, 223, 0.45);
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
      button.proj-cta {
        border: 0;
        width: 100%;
        cursor: pointer;
        text-align: left;
      }
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
      /* Narrow: the dock centres along the top instead of closing the head
         row, so the title strip takes its normal inset back — and the sheet
         starts a dock's height further down, leaving the dock a clear band
         above it rather than sitting on the title. */
      @media (max-width: 767px) {
        .proj-titlebar { padding-right: var(--cell-pad); }
        .proj-sheet {
          margin-top: calc(
            var(--sheet-inset) + env(safe-area-inset-top) + var(--dock-h)
          );
        }
      }

      @media (max-width: 640px) {
        .proj-mtile {
          grid-column: 1 / -1 !important;
          aspect-ratio: 4 / 3 !important;
        }
        .proj-simgrid { grid-template-columns: minmax(0, 1fr); }
      }
      `}</style>
    </>
  )
}
