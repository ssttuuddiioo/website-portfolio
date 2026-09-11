'use client'

import Link from 'next/link'
import { SocialRow } from './landing-sidebar'
import { SubscribeForm } from './subscribe-form'
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

// Mirrors the services accordion on /about; all seven point at that section
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

export function SiteFooter({
  /**
   * The list signup sits in the footer, so it reaches every page from one
   * place. Pages that already close on a subscribe panel of their own (the
   * ideas index and each idea) pass false rather than stack two forms on two
   * cobalt grounds.
   */
  subscribe = true,
}: {
  subscribe?: boolean
} = {}) {
  return (
    <div
      // One per page — the landing reads this to turn on its white page frame
      // once the band comes up.
      id="site-footer"
      style={{
        // Break out of any centered/padded parent without knowing its padding.
        // The page shells set overflow-x: hidden, so 100vw can't add a
        // horizontal scrollbar.
        width: '100vw',
        marginLeft: 'calc(50% - 50vw)',
        background: IKB,
        color: PAPER,
        paddingTop: 'clamp(4rem, 10vw, 8rem)',
        // The root layout sets viewportFit: 'cover', so this block runs under
        // the notch in landscape and under the home indicator at the bottom.
        // It closes every page, so it's the one that has to clear them.
        paddingLeft: 'max(var(--gutter, 1.5rem), env(safe-area-inset-left, 0px))',
        paddingRight: 'max(var(--gutter, 1.5rem), env(safe-area-inset-right, 0px))',
        paddingBottom:
          'calc(clamp(2rem, 4vw, 3rem) + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <style>{`
        .site-footer-link { transition: opacity 200ms; }
        .site-footer-link:hover { opacity: 0.6; }
        .site-footer-arrow { display: inline-block; transition: transform 200ms; }
        .site-footer-link:hover .site-footer-arrow { transform: translateX(3px); }
        .site-footer-inner {
          max-width: 1440px;
          margin: 0 auto;
        }
        .site-footer-statement {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          align-items: start;
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
        /* The five See More links run in two columns of their own under the one
           heading. Column-major, so each column reads as a list top to bottom.
           A single column on a phone, where three columns of type across the
           footer would be unreadably narrow. */
        .site-footer-seemore {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.1rem clamp(1rem, 3vw, 2rem);
        }
        /* Subscribe rides the nav row's grid, not the statement's, so its copy
           and form start exactly where the See More heading does. */
        .site-footer-subscribe {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          align-items: start;
        }
        .site-footer-legal {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 1.25rem;
        }
        @media (min-width: 768px) {
          /* Every row on the same rail: the label, the wordmark and "Stay in
             the loop" in the left half; the copy, the links and the form in the
             right. This row used to run 1fr 1.6fr, which left its paragraphs
             out of line with everything below them. */
          .site-footer-statement {
            grid-template-columns: 1fr 1fr;
            gap: clamp(2.5rem, 6vw, 4rem);
          }
          .site-footer-nav {
            grid-template-columns: 1fr 1fr;
          }
          .site-footer-seemore {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            grid-template-rows: repeat(3, auto);
            grid-auto-flow: column;
            justify-items: start;
          }
          .site-footer-subscribe {
            grid-template-columns: 1fr 1fr;
            gap: clamp(2.5rem, 6vw, 4rem);
          }
          .site-footer-legal {
            flex-direction: row;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
          }
        }
      `}</style>

      <div className="site-footer-inner">
        {/* Label left, the practice in two paragraphs right — the same shape as
            the subscribe row further down. */}
        <div className="site-footer-statement">
          <span
            className="font-display"
            style={{ fontSize: 'clamp(0.95rem, 1.4vw, 1.1rem)', color: PAPER }}
          >
            About
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
              We make installations and brand experiences for companies,
              agencies, and cultural institutions.
              Work for HBO, Netflix, Google, AT&amp;T, Audible, Under Armour,
              Intel, Sony, Dolby, Mercedes-Benz Stadium, Michigan Central
              Station, and Cox.
            </p>
            <FooterLink href="/about">
              Learn more{' '}
              <span className="site-footer-arrow" aria-hidden>
                →
              </span>
            </FooterLink>
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
            <span style={{ display: 'block', width: 'fit-content' }}>Studio</span>
            {/* Second word inverted, the same lockup the header opens on. The
                box hugs the word so the rotation stays flush left instead of
                swinging the type to the far edge of the column. */}
            <span
              style={{
                display: 'block',
                width: 'fit-content',
                transform: 'rotate(180deg)',
              }}
            >
              Studio
            </span>
          </p>

          <div className="site-footer-cols">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <ColumnHeading>See More</ColumnHeading>
              <div className="site-footer-seemore">
                {SEE_MORE.map((l) => (
                  <FooterLink key={l.label} href={l.href}>
                    {l.label}
                  </FooterLink>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <ColumnHeading>Capabilities</ColumnHeading>
              {CAPABILITIES.map((c) => (
                <FooterLink key={c} href="/about#services">
                  {c}
                </FooterLink>
              ))}
            </div>
          </div>
        </div>

        {/* Subscribe — under the wordmark and links, over the legal rail
            that closes the footer. On the nav row's grid, so "Stay in the
            loop" sits under the wordmark and the copy + form start exactly
            where the See More heading does. */}
        {subscribe && (
          <>
            <hr
              style={{
                border: 0,
                borderTop: `1px solid ${paper(0.28)}`,
                margin: 'clamp(3.5rem, 9vw, 6rem) 0 clamp(2.5rem, 5vw, 3.5rem)',
              }}
            />
            <div className="site-footer-subscribe">
              <span
                className="font-display"
                style={{ fontSize: 'clamp(0.95rem, 1.4vw, 1.1rem)', color: PAPER }}
              >
                Stay in the loop
              </span>
              <div>
                <p
                  className="font-display"
                  style={{
                    margin: 0,
                    maxWidth: '46ch',
                    fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
                    lineHeight: 1.45,
                    color: PAPER,
                  }}
                >
                  New projects and experiments in your inbox. Only when
                  there&apos;s something worth showing.
                </p>
                <div style={{ marginTop: 'clamp(1.25rem, 2.5vw, 1.75rem)' }}>
                  <SubscribeForm onDark />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Legal rail. */}
        <div
          className="site-footer-legal"
          style={{ marginTop: 'clamp(3rem, 8vw, 5rem)' }}
        >
          <span
            className="font-mono"
            style={{
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: paper(0.6),
              // The city and state read as one unit; never broken over two
              // lines, however narrow the rail gets.
              whiteSpace: 'nowrap',
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
