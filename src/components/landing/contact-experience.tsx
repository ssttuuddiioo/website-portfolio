'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { LandingSidebar } from './landing-sidebar'
import { SiteFooter } from './site-footer'
import { ContactPageForm } from './contact-page-form'
import { INK, BG, BLUE, RULE } from './landing-theme'
import { LISTED_CONTACT_DETAILS } from '@/lib/contact-details'

const EASE = [0.22, 1, 0.36, 1] as const

/* ---- small shared pieces (mirrors about-experience) --------------------- */

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

/* ---- page --------------------------------------------------------------- */

/**
 * Standalone /contact page — where every "contact" on the site now leads,
 * apart from the quick panel on a project page. Built on the same visual
 * language as /about (warm shell, Reveal-on-scroll, the shared footer): the
 * enquiry form beside the direct details —
 * one column on a phone, two from md up. inPage={false} → sidebar links route
 * back to the homepage's /#sections.
 */
export function ContactExperience() {
  // The page leads with the details; the form waits behind "Get a quote".
  const [quoteOpen, setQuoteOpen] = useState(false)
  const reduce = useReducedMotion()
  return (
    <>
      {/* Unpinned, as on a project page: the dock closes the right end of
          the sheet's head row and scrolls away with it. */}
      <LandingSidebar active="contact" inPage={false} pinned={false} />

      <main style={{ position: 'relative', zIndex: 3 }}>
        {/* The project page's ruled sheet: a head row of mark, title and dock,
            then the pitch over the media column and the details in the rail,
            filling the first screen so the footer waits below the fold. */}
        <div className="contact-sheet">
          <div className="contact-headrow">
            <Link href="/" className="contact-mark" aria-label="Studio Studio — home">
              <Image
                src="/logo.png"
                alt=""
                width={1254}
                height={612}
                priority
                className="contact-marklogo"
              />
            </Link>
            <header className="contact-titlebar">
              <h1 className="contact-title font-display">Contact</h1>
              <p className="contact-titlemeta font-mono">Brooklyn, New York</p>
            </header>
          </div>

          <div className="contact-body">
            <div className="contact-pitch">
              <Reveal>
                <h2 className="contact-head font-display">
                  Have a project in mind?
                </h2>
                <p className="contact-note font-display">
                  Tell us a little about it and we&apos;ll set up a call.
                </p>
              </Reveal>
            </div>

            <div className="contact-right">
              <AnimatePresence mode="wait" initial={false}>
                {quoteOpen ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, y: reduce ? 0 : 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                  >
                    <button
                      type="button"
                      className="contact-back font-mono"
                      onClick={() => setQuoteOpen(false)}
                    >
                      <span aria-hidden>←</span> Back
                    </button>
                    <ContactPageForm />
                  </motion.div>
                ) : (
                  <motion.div
                    key="details"
                    className="contact-detailspane"
                    initial={{ opacity: 0, y: reduce ? 0 : 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                  >
                    <ul className="contact-list">
                      {LISTED_CONTACT_DETAILS.map((d) => (
                        <li key={d.label}>
                          <span className="contact-label font-mono">{d.label}</span>
                          {d.href ? (
                            <a
                              href={d.href}
                              className="contact-value font-display"
                              {...(d.external
                                ? { target: '_blank', rel: 'noreferrer' }
                                : {})}
                            >
                              {d.value}
                            </a>
                          ) : (
                            <span className="contact-value font-display">{d.value}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      className="contact-quote font-display"
                      onClick={() => setQuoteOpen(true)}
                    >
                      <span>Get a quote</span>
                      <span aria-hidden>→</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <SiteFooter />
      </main>

      <style>{`
        /* The sheet: inset from every edge like a project page's, painted in
           the rule colour with every cell in the ground, so the 1px gaps are
           the hairlines. It stands at least a screen tall. */
        .contact-sheet {
          --cell-pad: clamp(1rem, 2vw, 1.75rem);
          margin: calc(var(--sheet-inset) + env(safe-area-inset-top))
                  var(--sheet-inset) var(--sheet-inset);
          min-height: calc(100svh - 2 * var(--sheet-inset));
          display: grid;
          grid-template-rows: auto minmax(0, 1fr);
          gap: 1px;
          background: ${RULE};
          border: 1px solid ${RULE};
        }

        /* Head row: the dock's height, a square mark, then the title strip
           running up to the dock's left edge (--dock-w, set by the dock). */
        .contact-headrow {
          display: grid;
          grid-template-columns: var(--dock-h) minmax(0, 1fr);
          gap: 1px;
        }
        .contact-mark {
          background: ${BG};
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 22%;
          isolation: isolate;
        }
        .contact-marklogo {
          width: 100%;
          height: auto;
          filter: invert(1);
          mix-blend-mode: lighten;
        }
        .contact-titlebar {
          background: ${BG};
          min-height: var(--dock-h);
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.4rem clamp(1rem, 2.5vw, 2rem);
          padding: 0.4rem calc(var(--dock-w, 26rem) + var(--cell-pad)) 0.4rem var(--cell-pad);
        }
        .contact-title {
          margin: 0;
          font-weight: 400;
          font-size: clamp(1.4rem, 2.6vw, 2.1rem);
          line-height: 1;
          letter-spacing: -0.02em;
          color: ${INK};
        }
        .contact-titlemeta {
          margin: 0;
          font-size: clamp(0.66rem, 0.9vw, 0.78rem);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(232, 228, 223, 0.5);
        }

        /* Body: the pitch in the wide column, the details in the rail, whose
           hairline lines up with the dock's left edge above it. */
        .contact-body {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 1px;
        }
        @media (min-width: 900px) {
          .contact-body { grid-template-columns: minmax(0, 1fr) var(--rail-w); }
        }
        .contact-pitch,
        .contact-right {
          background: ${BG};
          padding: clamp(1.5rem, 3vw, 2.75rem) var(--cell-pad);
        }
        /* The question sits low in its cell, large, against the empty field. */
        .contact-pitch {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }
        .contact-head {
          margin: 0;
          max-width: 11ch;
          font-weight: 400;
          font-size: clamp(2.6rem, 6vw, 5.75rem);
          line-height: 0.96;
          letter-spacing: -0.04em;
          color: ${INK};
        }
        .contact-note {
          margin: clamp(1rem, 2vw, 1.5rem) 0 0;
          font-size: clamp(1rem, 1.4vw, 1.2rem);
          line-height: 1.5;
          color: rgba(232, 228, 223, 0.65);
        }
        .contact-right { display: flex; flex-direction: column; }
        .contact-right > div { flex: 1; display: flex; flex-direction: column; }
        /* Details at the top of the rail, the button at its foot. */
        .contact-detailspane { justify-content: space-between; }

        /* Details: one per row, label over value, ruled like the mobile list. */
        .contact-list { list-style: none; margin: 0; padding: 0; }
        .contact-list li {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          padding: 1rem 0;
          border-bottom: 1px solid ${RULE};
        }
        .contact-list li:first-child { padding-top: 0; }
        .contact-label {
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(232, 228, 223, 0.5);
        }
        .contact-value {
          font-size: clamp(1.15rem, 1.6vw, 1.4rem);
          color: ${INK};
          text-decoration: none;
          overflow-wrap: anywhere;
          transition: color 200ms;
        }
        a.contact-value:hover { color: ${BLUE}; }

        .contact-quote {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          height: 3.5rem;
          margin-top: clamp(2rem, 4vw, 3rem);
          padding: 0 1.4rem;
          border: 0;
          border-radius: 999px;
          background: ${BLUE};
          color: #fff;
          font-size: 1.15rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 200ms;
        }
        .contact-quote:hover { transform: translateY(-1px); }
        .contact-back {
          display: inline-flex;
          gap: 0.5rem;
          margin: 0 0 1.5rem;
          padding: 0;
          border: 0;
          background: none;
          cursor: pointer;
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(232, 228, 223, 0.6);
          transition: color 200ms;
        }
        .contact-back:hover { color: ${BLUE}; }
        .contact-value:focus-visible,
        .contact-quote:focus-visible,
        .contact-back:focus-visible {
          outline: 2px solid ${BLUE};
          outline-offset: 3px;
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
