'use client'

import { useState, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { LandingSidebar, SocialRow } from './landing-sidebar'
import { ServicesAccordion } from './services-accordion'
import { ContactForm } from './contact-form'
import { LogoMarquee } from './logo-marquee'
import { FaqSection } from './faq-section'
import { ABOUT_TITLE } from './about-section'
import { INK, BG, BLUE } from './landing-theme'

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
        color: 'rgba(10,10,10,0.5)',
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

const TEAM = [
  {
    name: 'Pablo',
    role: 'Creative and Software',
    src: '/landing/team/pablo.avif',
  },
  {
    name: 'Mario',
    role: 'Strategy and Growth',
    src: '/landing/team/mario.avif',
  },
  {
    name: 'Mary',
    role: 'Communications',
    src: '/landing/team/mary.avif',
  },
] as const

/**
 * Square team portrait, matching the 1:1 source headshots. Falls back to the
 * person's initials on a tinted
 * plate if the photo is missing, so the section never renders a broken image.
 */
function Portrait({ src, name, role }: { src: string; name: string; role: string }) {
  const [failed, setFailed] = useState(false)
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: 1,
        overflow: 'hidden',
        borderRadius: '20px',
        background: 'rgba(10,10,10,0.06)',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      {failed ? (
        <span
          className="font-display"
          style={{
            fontWeight: 700,
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            letterSpacing: '-0.02em',
            color: 'rgba(10,10,10,0.25)',
          }}
        >
          {initials}
        </span>
      ) : (
        <Image
          src={src}
          alt={`${name}, ${role}`}
          fill
          sizes="(min-width: 768px) 340px, 92vw"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      )}
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
                {ABOUT_TITLE}
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p
                className="font-display"
                style={{
                  fontWeight: 500,
                  fontSize: 'clamp(1.05rem, 1.9vw, 1.45rem)',
                  lineHeight: 1.5,
                  color: 'rgba(10,10,10,0.7)',
                  margin: '1.75rem 0 0',
                  maxWidth: '52ch',
                }}
              >
                Studio Studio is a Brooklyn studio and a network of
                multidisciplinary collaborators. Experiential directors,
                creative technologists, lighting designers, fabricators, and
                producers who assemble around each project. We partner with
                brands, agencies, and institutions to turn ambitious ideas into
                rooms, screens, and stages people remember.
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
        </section>

        {/* ---- Team --------------------------------------------------------- */}
        <section
          style={{
            padding: `clamp(3rem, 7vw, 6rem) ${GUTTER}`,
          }}
        >
          <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto' }}>
            <Reveal style={{ marginBottom: 'clamp(2rem, 5vw, 3.5rem)' }}>
              <div style={{ textAlign: 'center' }}>
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
                  Our Team
                </h2>
              </div>
            </Reveal>

            <div
              className="about-team"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'clamp(1.5rem, 4vw, 3rem)',
                margin: '0 auto',
              }}
            >
              {TEAM.map((person, i) => (
                <Reveal key={person.name} delay={i * 0.08}>
                  <Portrait src={person.src} name={person.name} role={person.role} />
                  <div style={{ marginTop: '1.1rem' }}>
                    <h3
                      className="font-display"
                      style={{
                        fontWeight: 700,
                        fontSize: 'clamp(1.05rem, 1.8vw, 1.35rem)',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.15,
                        color: INK,
                        margin: 0,
                      }}
                    >
                      {person.name}
                    </h3>
                    <p
                      className="font-mono"
                      style={{
                        margin: '0.5rem 0 0',
                        fontSize: '0.7rem',
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: 'rgba(10,10,10,0.5)',
                      }}
                    >
                      {person.role}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---- Trusted by (logo marquee) ----------------------------------- */}
        <section style={{ padding: `clamp(2.5rem, 6vw, 4.5rem) 0` }}>
          <Reveal style={{ marginBottom: 'clamp(1.5rem, 3vw, 2.25rem)' }}>
            <div
              style={{
                padding: `0 ${GUTTER}`,
                textAlign: 'center',
              }}
            >
              <Eyebrow>Trusted by</Eyebrow>
            </div>
          </Reveal>
          <LogoMarquee />
        </section>

        {/* ---- Services ----------------------------------------------------- */}
        <section
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
            padding: `clamp(3rem, 7vw, 6rem) ${GUTTER} clamp(8rem, 14vh, 11rem)`,
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
                    color: 'rgba(10,10,10,0.7)',
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

          {/* Footer band — social over copyright, centered. */}
          <div
            className="flex flex-col items-center"
            style={{
              width: '100%',
              maxWidth: '1100px',
              margin: '0 auto',
              marginTop: 'clamp(4rem, 10vw, 8rem)',
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

      {/* Stack the team row on small screens. */}
      <style>{`
        @media (max-width: 767px) {
          .about-team { grid-template-columns: 1fr !important; }
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
