'use client'

import { useId, useState, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { LandingSidebar } from './landing-sidebar'
import { SiteFooter } from './site-footer'
import { StudioLockup } from './studio-lockup'
import { SERVICES } from './services-accordion'
import { AGENCY_LOGOS, CLIENT_LOGOS, type ClientLogo } from '@/lib/client-logos'
import { FAQS } from '@/lib/faqs'
import { INK, BG, BLUE, RULE } from './landing-theme'

const EASE = [0.22, 1, 0.36, 1] as const

/** Logo-grid columns. The last row is padded out with blank cells. */
const CLIENT_COLS = 6
const fillers = (n: number) => (CLIENT_COLS - (n % CLIENT_COLS)) % CLIENT_COLS
/**
 * Every mark covers about LOGO_AREA px² at a 1440px viewport: its height is
 * the square root of that area over its ratio, held between a floor and a
 * ceiling so a very long wordmark stays legible and a narrow one stays modest.
 * The height then scales with the viewport, within 0.8x to 1.25x.
 */
const LOGO_AREA = 1700
function logoHeight(ratio: number) {
  const h = Math.min(44, Math.max(13, Math.sqrt(LOGO_AREA / ratio)))
  return `clamp(${(h * 0.8).toFixed(1)}px, ${((h / 1440) * 100).toFixed(3)}vw, ${(h * 1.25).toFixed(1)}px)`
}
const pad = (n: number) => String(n).padStart(2, '0')

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: reduce ? 0 : 0.7, ease: EASE, delay: reduce ? 0 : delay }}
    >
      {children}
    </motion.div>
  )
}

/** A full-width bar that opens a section of the sheet: label, title, count. */
function SectionBar({ label, title, note }: { label?: string; title: string; note?: string }) {
  return (
    <div className="ab-bar">
      {label && <span className="ab-eyebrow font-mono">{label}</span>}
      <h2 className="ab-bartitle font-display">{title}</h2>
      {note && <span className="ab-eyebrow ab-barnote font-mono">{note}</span>}
    </div>
  )
}

/**
 * A Services or FAQ row, closed by default: number and title in the wide
 * column, a plus in the rail. Opening it lets the copy down in the rail. The
 * copy stays in the document while closed (inert, and collapsed to no height)
 * so the page still carries it for search and for the FAQ structured data.
 */
function ToggleRow({
  index,
  title,
  body,
  titleClass,
}: {
  index: number
  title: string
  body: string
  titleClass: string
}) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const toggle = () => setOpen((o) => !o)
  return (
    <div className={`ab-split ab-trow${open ? ' is-open' : ''}`}>
      <h3 className="ab-th">
        <button
          type="button"
          className="ab-cell ab-rowhead"
          aria-expanded={open}
          aria-controls={id}
          onClick={toggle}
        >
          <span className="ab-num font-mono">{pad(index + 1)}</span>
          <span className={`${titleClass} font-display`}>{title}</span>
        </button>
      </h3>
      {/* The rail cell answers a click too, for the mouse; the button above
          is the control for keyboards and screen readers. */}
      <div className="ab-cell ab-tbody" onClick={toggle} aria-hidden={!open}>
        <span className="ab-plus" aria-hidden />
        <div className="ab-collapse" id={id} inert={!open}>
          <div>
            <p className="ab-small font-display">{body}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/** A labelled run of the logo grid, padded out to whole rows. */
function LogoGrid({ label, logos }: { label: string; logos: ClientLogo[] }) {
  return (
    <>
      <div className="ab-sublabel">
        <span className="ab-eyebrow font-mono">{label}</span>
      </div>
      <div className="ab-clients">
        {logos.map((l) => (
          <div key={l.name} className="ab-client">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={l.src}
              alt={l.name}
              className={l.src.endsWith('.svg') ? 'is-vector' : undefined}
              style={{ height: logoHeight(l.ratio) }}
            />
          </div>
        ))}
        {Array.from({ length: fillers(logos.length) }, (_, i) => (
          <div key={`f${i}`} className="ab-client" aria-hidden />
        ))}
      </div>
    </>
  )
}

/* ---- page --------------------------------------------------------------- */

/**
 * Standalone /about page, on the same ruled sheet as a project page: a head
 * row closed by the nav dock, then every section as rows of cells split on
 * the media | rail line, so the dock's left edge, the photo's edge and every
 * label column fall on one vertical rule down the page. The studio, the
 * founder, clients, services, a way to get in touch, and the FAQ, in that
 * order, then the footer.
 */
export function AboutExperience() {
  return (
    <>
      <LandingSidebar active="about" inPage={false} />

      <main style={{ position: 'relative', zIndex: 3 }}>
        <div className="ab-sheet">
          {/* ---- Head row ---------------------------------------------- */}
          <div className="ab-head">
            <div className="ab-mark">
              <StudioLockup />
            </div>
            <div className="ab-titlebar">
              <span className="ab-title font-display">About</span>
              <span className="ab-eyebrow font-mono">Brooklyn, NY · Since 2015</span>
            </div>
          </div>

          {/* ---- Studio: the statement over the work, the photo in the rail */}
          <section className="ab-split ab-hero">
            <div className="ab-cell ab-herotext">
              <Reveal>
                <h1 className="ab-headline font-display">
                  An art and technology studio in Brooklyn.
                </h1>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="ab-lede font-display">
                  We build installations, websites, apps, and sometimes lamps
                  that run other apps for our own projects or for brands,
                  agencies, and cultural institutions. Same tools, same care,
                  sometimes from concept to making the actual sausage.
                </p>
              </Reveal>
            </div>
            <div className="ab-photo">
              <Image
                src="/landing/opt/light-around-us2.avif"
                alt="Studio Studio installation work"
                fill
                sizes="(min-width: 900px) 40vw, 100vw"
                priority
                style={{ objectFit: 'cover' }}
              />
            </div>
          </section>

          {/* ---- Agencies, then clients: a ruled grid each, a cell per logo -- */}
          <section className="ab-group">
            <SectionBar
              title="Who we've made work with"
              note={`${AGENCY_LOGOS.length + CLIENT_LOGOS.length} and counting`}
            />
            <LogoGrid label="Agency clients" logos={AGENCY_LOGOS} />
            <LogoGrid label="End clients" logos={CLIENT_LOGOS} />
          </section>

          {/* ---- Founder: the opening sentence large as a lead, the rest at
              body size in columns beneath it; the facts in the rail. */}
          <section className="ab-split">
            <div className="ab-cell ab-founder">
              <span className="ab-eyebrow font-mono">Founder</span>
              <Reveal>
                <p className="ab-body font-display">
                  Pablo Gnecco started the studio in 2015 as an inaugural member
                  of NEW INC, the New Museum&apos;s incubator.
                </p>
              </Reveal>
              <Reveal delay={0.08}>
                <p className="ab-small ab-cols font-display">
                  We make experiences people haven&apos;t stood inside before:
                  rooms that answer back, objects that listen, screens that
                  stop feeling like screens. Each project is a chance to try
                  something new, and we make them with designers, fabricators,
                  and technologists we admire, putting a crew together around
                  each idea. Sometimes we run the whole job; sometimes we join a
                  team that&apos;s already on it.
                </p>
              </Reveal>
            </div>
            {/* The rail is Pablo in the booth, the full height of the row. */}
            <div className="ab-railphoto">
              <Image
                src="/landing/opt/sb-pablo.avif"
                alt="Pablo Gnecco in StoryBooth"
                fill
                sizes="(min-width: 900px) 37vw, 100vw"
                style={{ objectFit: 'cover', objectPosition: '45% 60%' }}
              />
            </div>
          </section>

          {/* ---- Services: numbered rows, the description in the rail ------
              id is live navigation: the footer's capability column links to
              /about#services. */}
          <section id="services" className="ab-group">
            <SectionBar title="Services" note={pad(SERVICES.length)} />
            {SERVICES.map((s, i) => (
              <ToggleRow
                key={s.title}
                index={i}
                title={s.title}
                body={s.body}
                titleClass="ab-servicetitle"
              />
            ))}
          </section>

          {/* ---- Get in touch: the contact page's pitch, in miniature -------
              Keeps its #contact anchor so older /about#contact links land. */}
          <section id="contact" className="ab-split ab-cta">
            <div className="ab-cell ab-ctapitch">
              <span className="ab-eyebrow font-mono">Get in touch</span>
              <h2 className="ab-ctahead font-display">Have a project in mind?</h2>
              <p className="ab-small font-display">
                Tell us a little about it and we&apos;ll set up a call.
              </p>
            </div>
            <div className="ab-cell ab-ctacell">
              <Link href="/contact" className="ab-ctabtn font-display">
                <span>Start a project</span>
                <span aria-hidden>→</span>
              </Link>
            </div>
          </section>

          {/* ---- FAQ: the question in the wide column, the answer in the rail */}
          <section className="ab-group">
            <SectionBar title="Frequently asked" note={pad(FAQS.length)} />
            {FAQS.map((f, i) => (
              <ToggleRow
                key={f.q}
                index={i}
                title={f.q}
                body={f.a}
                titleClass="ab-question"
              />
            ))}
          </section>
        </div>

        <SiteFooter statement={false} />
      </main>

      <style>{`
        /* The sheet: inset from every edge, painted in the rule colour with
           every cell in the ground, so each 1px gap is a hairline. */
        .ab-sheet {
          --cell-pad: clamp(1rem, 2vw, 1.75rem);
          /* The whole page sets in four sizes and two weights: the statement
             alone at XL and bold; titles, rows and the founder's story at L;
             every paragraph, name and button at M; labels in mono. */
          --ab-xl: clamp(3rem, 6.4vw, 7rem);
          --ab-l: clamp(1.5rem, 2.4vw, 2.25rem);
          --ab-l-lh: 1.1;
          --ab-l-ls: -0.025em;
          --ab-m: clamp(1rem, 1.15vw, 1.125rem);
          --ab-m-lh: 1.55;
          --ab-mono: clamp(0.62rem, 0.8vw, 0.7rem);
          margin: calc(var(--sheet-inset) + env(safe-area-inset-top))
                  var(--sheet-inset) var(--sheet-inset);
          display: grid;
          gap: 1px;
          background: ${RULE};
          border: 1px solid ${RULE};
          color: ${INK};
        }
        .ab-group { display: grid; gap: 1px; }

        .ab-eyebrow {
          font-size: var(--ab-mono);
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(232, 228, 223, 0.5);
        }

        /* Head row: the lockup in its own cell, then the title strip, which
           stops at the dock's left edge (--dock-w, published by the dock). */
        .ab-head {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          gap: 1px;
        }
        .ab-mark {
          background: ${BG};
          display: flex;
          align-items: center;
          min-height: var(--dock-h);
          padding: 0.75rem var(--cell-pad) 0.75rem calc(var(--cell-pad) + 0.4rem);
        }
        .ab-titlebar {
          background: ${BG};
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.4rem clamp(1rem, 2.5vw, 2rem);
          padding: 0.4rem calc(var(--dock-w, 26rem) + var(--cell-pad)) 0.4rem var(--cell-pad);
        }
        .ab-title {
          font-weight: 400;
          font-size: var(--ab-l);
          line-height: var(--ab-l-lh);
          letter-spacing: var(--ab-l-ls);
        }

        /* Every row splits on the rail line, so the column rule runs unbroken
           from the dock to the last question. */
        .ab-split {
          display: grid;
          grid-template-columns: minmax(0, 1fr) var(--rail-w);
          gap: 1px;
        }
        .ab-cell {
          background: ${BG};
          padding: clamp(1.5rem, 2.6vw, 2.25rem) var(--cell-pad);
        }

        /* Studio. With the head row it fills the first screen: the statement
           big at the top of its cell, the paragraph at the foot, the photo
           running the rail's full height beside them. */
        .ab-hero {
          min-height: calc(100svh - 2 * var(--sheet-inset) - var(--dock-h) - 3px);
        }
        .ab-herotext {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 3rem;
        }
        .ab-headline {
          margin: 0;
          max-width: 12ch;
          font-weight: 700;
          font-size: var(--ab-xl);
          line-height: 0.92;
          letter-spacing: -0.045em;
          color: #fff;
        }
        .ab-lede {
          margin: 0;
          max-width: 40ch;
          font-size: var(--ab-m);
          line-height: var(--ab-m-lh);
          color: rgba(232, 228, 223, 0.8);
        }
        .ab-photo {
          position: relative;
          min-height: 22rem;
          overflow: hidden;
          background: ${BG};
        }

        /* Founder */
        .ab-founder { display: grid; gap: clamp(1.25rem, 2vw, 1.75rem); align-content: start; }
        .ab-body {
          margin: 0;
          max-width: 30ch;
          font-size: var(--ab-l);
          line-height: 1.25;
          letter-spacing: var(--ab-l-ls);
          color: ${INK};
        }
        /* Two short columns once there's room, so the body reads as a block
           under the lead rather than a long ragged line. */
        .ab-cols { max-width: 62rem; }
        @media (min-width: 1200px) {
          .ab-cols { columns: 2; column-gap: clamp(2rem, 3vw, 3rem); }
        }
        .ab-railphoto {
          position: relative;
          min-height: 22rem;
          background: ${BG};
          overflow: hidden;
        }

        /* Section bars */
        .ab-bar {
          background: ${BG};
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 0.5rem clamp(1rem, 2.5vw, 2rem);
          padding: clamp(1.25rem, 2.4vw, 2rem) var(--cell-pad);
        }
        .ab-bartitle {
          margin: 0;
          font-weight: 400;
          font-size: var(--ab-l);
          line-height: var(--ab-l-lh);
          letter-spacing: var(--ab-l-ls);
          color: ${INK};
        }
        .ab-barnote { margin-left: auto; }

        /* Agencies and clients */
        .ab-sublabel {
          background: ${BG};
          padding: 0.7rem var(--cell-pad);
        }
        .ab-clients {
          display: grid;
          grid-template-columns: repeat(${CLIENT_COLS}, minmax(0, 1fr));
          gap: 1px;
        }
        .ab-client {
          background: ${BG};
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: clamp(6rem, 9vw, 8.5rem);
          padding: 1rem;
          text-align: center;
          isolation: isolate;
        }
        /* The files come in every colour on every ground. Greyscale, then
           invert, then lighten against the cell: dark type turns light and any
           white field behind it drops out, so they all sit on the ground like
           the set names beside them. */
        .ab-client img {
          width: auto;
          max-width: 78%;
          object-fit: contain;
          opacity: 0.6;
          filter: grayscale(1) invert(1);
          mix-blend-mode: lighten;
          transition: opacity 300ms;
        }
        .ab-client span {
          font-weight: 400;
          font-size: var(--ab-m);
          letter-spacing: 0;
          opacity: 0.5;
          transition: opacity 300ms;
        }
        /* Vector marks flatten to pure white whatever their colours (Cox's
           gradient would otherwise come out a dull grey). */
        .ab-client img.is-vector { filter: brightness(0) invert(1); }
        .ab-client:hover img,
        .ab-client:hover span { opacity: 1; }

        /* Services and FAQ rows: a number, then the line, in the wide column;
           the copy in the rail. */
        .ab-rowhead {
          display: grid;
          grid-template-columns: 3rem minmax(0, 1fr);
          align-items: baseline;
        }
        .ab-num { font-size: var(--ab-mono); letter-spacing: 0.18em; color: rgba(232, 228, 223, 0.4); }
        .ab-servicetitle {
          margin: 0;
          font-weight: 400;
          font-size: var(--ab-l);
          line-height: var(--ab-l-lh);
          letter-spacing: var(--ab-l-ls);
          transition: color 250ms;
        }
        /* Collapsible rows. The heading holds a button the size of its cell. */
        .ab-th { margin: 0; display: grid; }
        .ab-th button {
          all: unset;
          box-sizing: border-box;
          /* all: unset clears the cell's ground too; without it the sheet's
             rule colour shows through the whole cell. */
          background: ${BG};
          cursor: pointer;
          display: grid;
          grid-template-columns: 3rem minmax(0, 1fr);
          align-items: baseline;
          padding: clamp(1.25rem, 2.2vw, 1.75rem) var(--cell-pad);
        }
        .ab-th button:focus-visible { outline: 2px solid ${BLUE}; outline-offset: -2px; }
        .ab-servicetitle,
        .ab-question { transition: color 250ms; }
        .ab-trow:hover .ab-servicetitle,
        .ab-trow:hover .ab-question,
        .ab-trow.is-open .ab-servicetitle,
        .ab-trow.is-open .ab-question { color: ${BLUE}; }
        .ab-tbody {
          position: relative;
          cursor: pointer;
          padding-top: clamp(1.25rem, 2.2vw, 1.75rem);
          padding-bottom: clamp(1.25rem, 2.2vw, 1.75rem);
          padding-right: calc(var(--cell-pad) + 2.5rem);
        }
        /* Plus, turning to minus when open: the vertical stroke folds away. */
        .ab-plus {
          position: absolute;
          top: calc(clamp(1.25rem, 2.2vw, 1.75rem) + 0.45rem);
          right: var(--cell-pad);
          width: 14px;
          height: 14px;
        }
        .ab-plus::before,
        .ab-plus::after {
          content: '';
          position: absolute;
          left: 0;
          top: 6px;
          width: 14px;
          height: 2px;
          background: currentColor;
          transition: transform 350ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .ab-plus::after { transform: rotate(90deg); }
        .ab-trow.is-open .ab-plus::after { transform: rotate(0deg); }
        .ab-trow:hover .ab-plus,
        .ab-trow.is-open .ab-plus { color: ${BLUE}; }
        /* Collapses to nothing and opens to its content's height. */
        .ab-collapse {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 450ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .ab-trow.is-open .ab-collapse { grid-template-rows: 1fr; }
        .ab-collapse > div { overflow: hidden; min-height: 0; }
        @media (prefers-reduced-motion: reduce) {
          .ab-collapse, .ab-plus::before, .ab-plus::after { transition: none; }
        }
        .ab-question {
          margin: 0;
          max-width: 26ch;
          font-weight: 400;
          font-size: var(--ab-l);
          line-height: var(--ab-l-lh);
          letter-spacing: var(--ab-l-ls);
        }
        .ab-small {
          margin: 0;
          font-size: var(--ab-m);
          line-height: var(--ab-m-lh);
          color: rgba(232, 228, 223, 0.7);
        }

        /* Get in touch */
        .ab-ctapitch {
          display: grid;
          gap: 1rem;
          padding-top: clamp(2.5rem, 5vw, 4.5rem);
          padding-bottom: clamp(2.5rem, 5vw, 4.5rem);
        }
        .ab-ctahead {
          margin: 0;
          max-width: 14ch;
          font-weight: 400;
          font-size: var(--ab-l);
          line-height: var(--ab-l-lh);
          letter-spacing: var(--ab-l-ls);
          color: #fff;
        }
        .ab-ctacell { display: flex; align-items: flex-end; }
        .ab-ctabtn {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          height: 3.5rem;
          padding: 0 1.4rem;
          border-radius: 999px;
          background: ${BLUE};
          color: #fff;
          font-size: var(--ab-m);
          font-weight: 400;
          text-decoration: none;
          transition: transform 200ms;
        }
        .ab-ctabtn:hover { transform: translateY(-1px); }
        .ab-ctabtn:focus-visible { outline: 2px solid ${BLUE}; outline-offset: 3px; }
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
