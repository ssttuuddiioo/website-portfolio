'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { LandingSidebar, SOCIALS } from './landing-sidebar'
import { SiteFooter } from './site-footer'
import { ContactPageForm } from './contact-page-form'
import { INK, BG, BLUE } from './landing-theme'

const EASE = [0.22, 1, 0.36, 1] as const
const GUTTER = 'var(--gutter, 1.5rem)'
const EMAIL = 'hello@studiostudio.nyc'

/* ---- small shared pieces (mirrors about-experience) --------------------- */

function Eyebrow({
  children,
  as: Tag = 'span',
  id,
}: {
  children: ReactNode
  as?: 'span' | 'h2'
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
 * pitch across the top, then the full enquiry form beside the direct details —
 * one column on a phone, two from md up. inPage={false} → sidebar links route
 * back to the homepage's /#sections.
 */
export function ContactExperience() {
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
            {/* ---- Header ------------------------------------------------- */}
            <Reveal>
              <header
                className="flex flex-col font-display"
                style={{
                  gap: '1.25rem',
                  color: INK,
                  marginBottom: 'clamp(2.5rem, 5vw, 4rem)',
                }}
              >
                <Eyebrow>Contact</Eyebrow>
                <h1
                  style={{
                    fontWeight: 700,
                    fontSize: 'clamp(1.8rem, 3.4vw, 2.8rem)',
                    lineHeight: 1.05,
                    letterSpacing: '-0.03em',
                    margin: 0,
                  }}
                >
                  Let&apos;s build something together.
                </h1>
                <p
                  style={{
                    margin: 0,
                    maxWidth: '46ch',
                    fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)',
                    lineHeight: 1.6,
                    color: 'rgba(232, 228, 223, 0.7)',
                  }}
                >
                  We design and build installations, interactive experiences,
                  brand activations, and the software that runs them.
                </p>
              </header>
            </Reveal>

            <Reveal delay={0.08}>
              <div
                className="grid grid-cols-1 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]"
                style={{ gap: 'clamp(2.5rem, 5vw, 5rem)', alignItems: 'start' }}
              >
                {/* ---- Form ----------------------------------------------- */}
                <div>
                  <ContactPageForm />
                </div>

                {/* ---- Direct contact ------------------------------------- */}
                <aside aria-labelledby="direct-contact" className="contact-direct">
                  <Eyebrow as="h2" id="direct-contact">
                    Direct
                  </Eyebrow>
                  <dl className="contact-dl">
                    <div>
                      <dt className="contact-dt font-mono">General</dt>
                      <dd className="contact-dd font-display">
                        <a href={`mailto:${EMAIL}`} className="contact-email">
                          {EMAIL}
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt className="contact-dt font-mono">Location</dt>
                      <dd className="contact-dd font-display">Brooklyn, NY</dd>
                    </div>
                    <div>
                      <dt className="contact-dt font-mono">Social</dt>
                      <dd className="contact-dd font-display">
                        <ul className="contact-social">
                          {SOCIALS.filter((s) => !('contact' in s)).map((s) => (
                            <li key={s.label}>
                              <a href={s.href} target="_blank" rel="noreferrer">
                                {s.label}
                                <span aria-hidden> ↗</span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  </dl>
                </aside>
              </div>
            </Reveal>
          </div>
        </section>

        <SiteFooter />
      </main>

      <style>{`
        .contact-direct {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        @media (min-width: 768px) {
          .contact-direct { position: sticky; top: clamp(6rem, 12vh, 8rem); }
        }
        .contact-dl {
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 1.4rem;
        }
        .contact-dt {
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(232, 228, 223, 0.55);
          margin-bottom: 0.4rem;
        }
        .contact-dd {
          margin: 0;
          font-size: 1.05rem;
          line-height: 1.4;
          color: ${INK};
        }
        .contact-email {
          font-weight: 600;
          color: ${BLUE};
          text-decoration: none;
          overflow-wrap: anywhere;
        }
        .contact-email:hover { text-decoration: underline; text-underline-offset: 0.2em; }
        .contact-social {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .contact-social a {
          color: ${INK};
          text-decoration: none;
          transition: color 200ms;
        }
        .contact-social a:hover { color: ${BLUE}; }
        .contact-email:focus-visible,
        .contact-social a:focus-visible {
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
