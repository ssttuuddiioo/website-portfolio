'use client'

import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { LandingSidebar } from './landing-sidebar'
import { SiteFooter } from './site-footer'
import { ServicesAccordion } from './services-accordion'
import { ContactForm } from './contact-form'
import { LogoMarquee } from './logo-marquee'
import { FaqSection } from './faq-section'
import { INK, BG } from './landing-theme'

const EASE = [0.22, 1, 0.36, 1] as const
const GUTTER = 'var(--gutter, 1.5rem)'

/* ---- small shared pieces ------------------------------------------------ */

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
 * Standalone /about page. A normal top-to-bottom scroll (no wordmark
 * scroll-jacking): studio intro, a deeper "practice" write-up with imagery, a
 * scrolling client-logo marquee, the services accordion, an FAQ, and the
 * contact form + footer. Reached from the homepage about moment's "Learn More".
 */
export function AboutExperience() {
  return (
    <>
      {/* inPage={false} → nav links route back to the homepage's /#sections. */}
      <LandingSidebar active="about" inPage={false} />

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
                  maxWidth: '18ch',
                }}
              >
                An art and technology studio in Brooklyn.
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p
                className="font-display"
                style={{
                  margin: 'clamp(1.75rem, 3vw, 2.5rem) 0 0',
                  maxWidth: '46ch',
                  fontWeight: 500,
                  fontSize: 'clamp(1.1rem, 1.9vw, 1.45rem)',
                  lineHeight: 1.5,
                  color: 'rgba(232, 228, 223, 0.85)',
                }}
              >
                Studio Studio makes work for galleries, festivals, retail, brand
                pop-ups, and public space. We build installations, websites,
                apps, and sometimes lamps that run other apps for our own
                projects or for brands, agencies, and cultural institutions.
                Same tools, same care, sometimes from concept to making the
                actual sausage.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.15} style={{ marginTop: 'clamp(2.5rem, 6vw, 4.5rem)' }}>
            <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto' }}>
              <FramedImage
                src="/landing/opt/light-around-us2.avif"
                alt="Studio Studio installation work"
                ratio={16 / 9}
                sizes="(min-width: 1100px) 1100px, 92vw"
                priority
              />
            </div>
          </Reveal>

          {/* The founder note reads after the photo, in the right half on
              desktop so it answers the intro across the image. */}
          <style>{`
            .about-founder {
              margin-top: clamp(2rem, 4vw, 3rem);
            }
            @media (min-width: 900px) {
              .about-founder {
                width: 46%;
                margin-left: auto;
              }
            }
          `}</style>
          <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto' }}>
            <div className="about-founder">
              <Reveal delay={0.1}>
                <p
                  className="font-display"
                  style={{
                    margin: 0,
                    fontSize: 'clamp(0.98rem, 1.3vw, 1.12rem)',
                    lineHeight: 1.6,
                    color: 'rgba(232, 228, 223, 0.65)',
                  }}
                >
                  Pablo Gnecco started the studio in 2015 as an inaugural member
                  of NEW INC, the New Museum&apos;s incubator. The idea from day
                  one: the commercial work funds the art, and the art sharpens
                  the commercial work. We can run the whole production with a
                  crew we trust (fabricators, lighting designers, developers,
                  producers), or slot in next to an agency&apos;s team, a
                  fabrication shop, or an install crew that&apos;s already on
                  the job.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---- Clients and partners (logo marquee) ------------------------- */}
        <section style={{ padding: `clamp(2.5rem, 6vw, 4.5rem) 0` }}>
          <Reveal style={{ marginBottom: 'clamp(1.5rem, 3vw, 2.25rem)' }}>
            <div
              style={{
                padding: `0 ${GUTTER}`,
                textAlign: 'center',
              }}
            >
              <Eyebrow>Clients and partners</Eyebrow>
            </div>
          </Reveal>
          <LogoMarquee />
        </section>

        {/* ---- Services ----------------------------------------------------- */}
        {/* id is live navigation: the nav dock and the footer's capability
            column both link to /about#services. */}
        <section
          id="services"
          style={{
            padding: `clamp(3rem, 7vw, 6rem) ${GUTTER}`,
          }}
        >
          <Reveal style={{ marginBottom: 'clamp(2rem, 5vw, 3.5rem)' }}>
            <div style={{ maxWidth: '748px', margin: '0 auto', textAlign: 'center' }}>
              <Eyebrow>What we do</Eyebrow>
              <h2
                className="font-display"
                style={{
                  fontWeight: 700,
                  fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                  lineHeight: 1.05,
                  letterSpacing: '-0.03em',
                  color: INK,
                  margin: '1rem 0 0',
                }}
              >
                Services
              </h2>
            </div>
          </Reveal>
          <ServicesAccordion />
        </section>

        {/* ---- FAQ ---------------------------------------------------------- */}
        <section
          style={{
            padding: `clamp(3rem, 7vw, 6rem) ${GUTTER}`,
          }}
        >
          <Reveal style={{ marginBottom: 'clamp(2rem, 4vw, 3rem)' }}>
            <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
              <Eyebrow>Questions</Eyebrow>
              <h2
                className="font-display"
                style={{
                  fontWeight: 700,
                  fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                  lineHeight: 1.05,
                  letterSpacing: '-0.03em',
                  color: INK,
                  margin: '1rem 0 0',
                }}
              >
                Frequently asked
              </h2>
            </div>
          </Reveal>
          <FaqSection />
        </section>

        {/* ---- Contact + footer -------------------------------------------- */}
        <footer
          id="contact"
          style={{
            padding: `clamp(3rem, 7vw, 6rem) ${GUTTER} clamp(3rem, 8vh, 6rem)`,
          }}
        >
          <Reveal>
            <div
              className="grid grid-cols-1 md:grid-cols-2"
              style={{
                width: '100%',
                maxWidth: '1100px',
                margin: '0 auto',
                gap: 'clamp(2.5rem, 5vw, 5rem)',
                alignItems: 'start',
              }}
            >
              {/* Left — pitch + location. */}
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
                  Have a project in mind?
                </h2>
                <p
                  style={{
                    margin: 0,
                    maxWidth: '36ch',
                    fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)',
                    lineHeight: 1.6,
                    color: 'rgba(232, 228, 223, 0.7)',
                  }}
                >
                  Tell us a little about it and we&apos;ll set up a call.
                </p>
              </div>

              {/* Right — the form. */}
              <div>
                <ContactForm />
              </div>
            </div>
          </Reveal>

        </footer>

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
