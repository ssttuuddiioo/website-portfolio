'use client'

import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { LandingSidebar } from './landing-sidebar'
import { SiteFooter } from './site-footer'
import { ContactForm } from './contact-form'
import { INK, BG, BLUE } from './landing-theme'

const EASE = [0.22, 1, 0.36, 1] as const
const GUTTER = 'var(--gutter, 1.5rem)'

/* ---- small shared pieces (mirrors about-experience) --------------------- */

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span
      className="font-mono"
      style={{
        display: 'block',
        fontSize: '0.7rem',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: 'rgba(232, 228, 223, 0.5)',
      }}
    >
      {children}
    </span>
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
        background: 'rgba(232, 228, 223, 0.04)',
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

/* ---- page --------------------------------------------------------------- */

/**
 * Standalone /contact page. Built on the same visual language as the /about
 * experience (warm shell, left-hand sidebar, Reveal-on-scroll, framed imagery):
 * an intro, the contact block (pitch + details on the left, form on the right),
 * and the shared footer band. inPage={false} → sidebar links route back to the
 * homepage's /#sections.
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

        {/* ---- Intro -------------------------------------------------------- */}
        <section
          style={{
            padding: `clamp(3rem, 8vw, 6rem) ${GUTTER} clamp(2rem, 5vw, 4rem)`,
          }}
        >
          <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto' }}>
            <Reveal>
              <Eyebrow>Contact</Eyebrow>
            </Reveal>
            <Reveal delay={0.05}>
              <h1
                className="font-display"
                style={{
                  fontWeight: 700,
                  fontSize: 'clamp(2.2rem, 6.5vw, 4.5rem)',
                  lineHeight: 1.02,
                  letterSpacing: '-0.03em',
                  color: INK,
                  margin: '1.25rem 0 0',
                  maxWidth: '15ch',
                }}
              >
                Let&apos;s make something together.
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p
                className="font-display"
                style={{
                  fontWeight: 500,
                  fontSize: 'clamp(1.05rem, 1.9vw, 1.45rem)',
                  lineHeight: 1.5,
                  color: 'rgba(232, 228, 223, 0.7)',
                  margin: '1.75rem 0 0',
                  maxWidth: '52ch',
                }}
              >
                Drop us a line or say hello.{' '}
                <a
                  href="mailto:hello@studiostudio.nyc"
                  style={{ color: BLUE, textDecoration: 'none' }}
                >
                  hello@studiostudio.nyc
                </a>
              </p>
            </Reveal>
          </div>
        </section>

        {/* ---- Contact block ----------------------------------------------- */}
        <section
          style={{
            padding: `clamp(2rem, 5vw, 4rem) ${GUTTER} clamp(3rem, 7vw, 6rem)`,
          }}
        >
          <Reveal>
            <div
              className="contact-grid grid grid-cols-1 md:grid-cols-2"
              style={{
                width: '100%',
                maxWidth: '1100px',
                margin: '0 auto',
                gap: 'clamp(2.5rem, 5vw, 5rem)',
                alignItems: 'start',
              }}
            >
              {/* Left — pitch + details. */}
              <div
                className="flex flex-col font-display"
                style={{ gap: '1.25rem', color: INK }}
              >
                <Eyebrow>Get in touch</Eyebrow>
                <h2
                  style={{
                    fontWeight: 700,
                    fontSize: 'clamp(1.8rem, 3.4vw, 2.8rem)',
                    lineHeight: 1.05,
                    letterSpacing: '-0.03em',
                    margin: 0,
                  }}
                >
                  Say hello.
                </h2>
                <p
                  style={{
                    margin: 0,
                    maxWidth: '38ch',
                    fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)',
                    lineHeight: 1.6,
                    color: 'rgba(232, 228, 223, 0.7)',
                  }}
                >
                  Use the form, or email us directly.
                </p>
                <a
                  href="mailto:hello@studiostudio.nyc"
                  className="font-display"
                  style={{
                    fontWeight: 600,
                    fontSize: 'clamp(1.15rem, 2.2vw, 1.6rem)',
                    letterSpacing: '-0.01em',
                    color: BLUE,
                    textDecoration: 'none',
                  }}
                >
                  hello@studiostudio.nyc
                </a>
              </div>

              {/* Right — the form. */}
              <div>
                <ContactForm />
              </div>
            </div>
          </Reveal>
        </section>

        {/* ---- Image ------------------------------------------------------- */}
        <section
          style={{
            padding: `0 ${GUTTER} clamp(3rem, 7vw, 6rem)`,
          }}
        >
          <Reveal>
            <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto' }}>
              <FramedImage
                src="/landing/opt/light-around-us2.avif"
                alt="Studio Studio installation work"
                ratio={16 / 9}
                sizes="(min-width: 1100px) 1100px, 92vw"
              />
            </div>
          </Reveal>
        </section>

        <SiteFooter />
      </main>

      {/* Stack the two-column block on small screens. */}
      <style>{`
        @media (max-width: 767px) {
          .contact-grid { grid-template-columns: 1fr !important; }
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
