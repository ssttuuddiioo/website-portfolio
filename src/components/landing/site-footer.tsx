'use client'

import Link from 'next/link'
import { SocialRow } from './landing-sidebar'
import { IKB, PAPER, paper } from './landing-theme'

/* ============================================
   Site footer — one full-bleed IKB block that
   closes every page. Drops in anywhere: it
   escapes whatever padded container it sits in
   via the 100vw breakout below, so callers
   don't have to hoist it out of their layout.
   ============================================ */

const SEE_MORE = [
  { label: 'Home', href: '/' },
  { label: 'Work', href: '/#work' },
  { label: 'About', href: '/about' },
  { label: 'Ideas', href: '/ideas' },
  { label: 'Contact', href: '/contact' },
]

// Mirrors the services stack on the homepage; all seven point at that section
// rather than pages that don't exist yet.
const CAPABILITIES = [
  'Consulting',
  'Creative technology',
  'Lighting design',
  'Experiential production',
  'Exhibitions and installations',
  'Commissions',
  'Mentorship',
]

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="font-mono"
      style={{
        fontSize: '0.72rem',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: paper(0.55),
      }}
    >
      {children}
    </span>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="site-footer-link font-display"
      style={{
        fontSize: 'clamp(0.95rem, 1.4vw, 1.1rem)',
        color: PAPER,
        textDecoration: 'none',
        width: 'fit-content',
      }}
    >
      {children}
    </Link>
  )
}

export function SiteFooter() {
  return (
    <div
      style={{
        // Break out of any centered/padded parent without knowing its padding.
        // The page shells set overflow-x: hidden, so 100vw can't add a
        // horizontal scrollbar.
        width: '100vw',
        marginLeft: 'calc(50% - 50vw)',
        background: IKB,
        color: PAPER,
        padding: 'clamp(4rem, 10vw, 8rem) var(--gutter, 1.5rem) clamp(2rem, 4vw, 3rem)',
      }}
    >
      <style>{`
        .site-footer-link { transition: opacity 200ms; }
        .site-footer-link:hover { opacity: 0.6; }
        .site-footer-inner {
          max-width: 1440px;
          margin: 0 auto;
        }
        .site-footer-statement {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        .site-footer-nav {
          display: grid;
          grid-template-columns: 1fr;
          gap: clamp(2.5rem, 6vw, 4rem);
          align-items: start;
        }
        .site-footer-cols {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: clamp(1.5rem, 4vw, 3rem);
        }
        .site-footer-legal {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 1.25rem;
        }
        @media (min-width: 768px) {
          .site-footer-statement {
            grid-template-columns: 1fr 1.6fr;
            gap: clamp(2rem, 6vw, 5rem);
          }
          .site-footer-nav {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>

      <div className="site-footer-inner">
        {/* Statement — label left, the practice in two paragraphs right. */}
        <div className="site-footer-statement">
          <span
            className="font-display"
            style={{ fontSize: 'clamp(0.95rem, 1.4vw, 1.1rem)', color: PAPER }}
          >
            Studio Studio
          </span>
          <div
            className="font-display"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
              lineHeight: 1.45,
              color: PAPER,
            }}
          >
            <p style={{ margin: 0 }}>
              Studio Studio is the creative technology practice of Pablo Gnecco.
              Experiential direction, lighting design, and custom software, made
              in Brooklyn, New York.
            </p>
            <p style={{ margin: 0 }}>
              We build installations and brand experiences from first concept
              through fabrication and on-site delivery, for brands, agencies, and
              institutions. Work for HBO, Google, Intel, Sony, Dolby,
              Mercedes-Benz Stadium, Michigan Central Station, and Cox.
            </p>
          </div>
        </div>

        <hr
          style={{
            border: 0,
            borderTop: `1px solid ${paper(0.28)}`,
            margin: 'clamp(3rem, 8vw, 6rem) 0 clamp(3rem, 7vw, 5rem)',
          }}
        />

        {/* Wordmark left, link columns right. */}
        <div className="site-footer-nav">
          <p
            className="font-display"
            style={{
              margin: 0,
              fontWeight: 700,
              fontSize: 'clamp(3rem, 8.5vw, 7.5rem)',
              lineHeight: 0.85,
              letterSpacing: '-0.045em',
              textTransform: 'uppercase',
              color: PAPER,
            }}
          >
            Studio
            <br />
            Studio
          </p>

          <div className="site-footer-cols">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <ColumnHeading>See More</ColumnHeading>
              {SEE_MORE.map((l) => (
                <FooterLink key={l.label} href={l.href}>
                  {l.label}
                </FooterLink>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <ColumnHeading>Capabilities</ColumnHeading>
              {CAPABILITIES.map((c) => (
                <FooterLink key={c} href="/#services">
                  {c}
                </FooterLink>
              ))}
            </div>
          </div>
        </div>

        {/* Legal rail. */}
        <div
          className="site-footer-legal"
          style={{ marginTop: 'clamp(4rem, 10vw, 8rem)' }}
        >
          <span
            className="font-mono"
            style={{
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: paper(0.6),
            }}
          >
            Brooklyn, New York
          </span>
          <span
            className="font-mono"
            style={{
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: paper(0.6),
            }}
          >
            © 2026 Studio Studio. All rights reserved.
          </span>
          <SocialRow
            size={22}
            gap="1.5rem"
            horizontal
            color={PAPER}
            restOpacity={0.7}
          />
        </div>
      </div>
    </div>
  )
}
