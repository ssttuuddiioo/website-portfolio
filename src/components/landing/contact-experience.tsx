'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { LandingSidebar } from './landing-sidebar'
import { SiteFooter } from './site-footer'
import { ContactPageForm } from './contact-page-form'
import { INK, BG, BLUE, RULE } from './landing-theme'
import { LISTED_CONTACT_DETAILS } from '@/lib/contact-details'

const EASE = [0.22, 1, 0.36, 1] as const
const GUTTER = 'var(--gutter, 1.5rem)'

/* ---- small shared pieces (mirrors about-experience) --------------------- */

function Eyebrow({
  children,
  as: Tag = 'span',
  id,
}: {
  children: ReactNode
  as?: 'span' | 'h1' | 'h2'
  id?: string
}) {
  return (
    <Tag
      id={id}
      className="font-mono"
      style={{
        display: 'block',
        margin: 0,
        fontWeight: 'inherit',
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
      <LandingSidebar active="contact" inPage={false} />

      <main style={{ position: 'relative', zIndex: 3 }}>
        {/* Top brand row — orientation + a way home. */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: `clamp(1.5rem, 4vw, 2.5rem) ${GUTTER} 0`,
          }}
        >
          <div style={{ width: '100%', maxWidth: '1100px' }}>
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

        <section
          style={{
            padding: `clamp(3rem, 8vw, 6rem) ${GUTTER} clamp(3rem, 7vw, 6rem)`,
          }}
        >
          <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto' }}>
            {/* One ruled sheet, built like the contact panel on a project page:
                the pitch and every direct detail on the left, the enquiry form
                on the right. */}
            <Reveal>
              <div className="contact-sheet">
                <div className="contact-pitch">
                  <Eyebrow as="h1">Contact</Eyebrow>
                  <h2 className="contact-head font-display">
                    Have a project in mind?
                  </h2>
                  <p className="contact-note font-display">
                    Tell us a little about it and we&apos;ll set up a call.
                  </p>
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
            </Reveal>
          </div>
        </section>

        <SiteFooter />
      </main>

      <style>{`
        /* The sheet paints itself in the rule colour and every cell in the
           ground, so the 1px gaps are the hairlines (as on a project page). */
        .contact-sheet {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 1px;
          background: ${RULE};
          border: 1px solid ${RULE};
        }
        @media (min-width: 900px) {
          .contact-sheet { grid-template-columns: minmax(0, 0.85fr) minmax(0, 1fr); }
        }
        .contact-pitch,
        .contact-right {
          background: ${BG};
          padding: clamp(1.5rem, 3vw, 2.5rem);
        }
        .contact-pitch {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .contact-head {
          margin: clamp(0.5rem, 2vw, 1.5rem) 0 0;
          max-width: 14ch;
          font-weight: 400;
          font-size: clamp(1.9rem, 3.6vw, 3.2rem);
          line-height: 1.02;
          letter-spacing: -0.03em;
          color: ${INK};
        }
        .contact-note {
          margin: 0;
          font-size: clamp(0.95rem, 1.3vw, 1.05rem);
          line-height: 1.5;
          color: rgba(232, 228, 223, 0.7);
        }

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
          margin-top: clamp(1.5rem, 3vw, 2rem);
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
