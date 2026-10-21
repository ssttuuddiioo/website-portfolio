'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MobileBar, MOBILE_ROUTES } from './mobile-bar'
import { BG, INK, BLUE, RULE, ink } from './landing-theme'

/* ============================================
   Mobile About, pared down.
   One screen of who and what, one image, then the short lists a visitor
   scans for: who we've worked with and what we do. The FAQ and the long
   footer stay on the desktop page.
   ============================================ */

const CLIENTS = [
  'HBO',
  'Netflix',
  'Google',
  'AT&T',
  'Audible',
  'Under Armour',
  'Intel',
  'Sony',
  'Dolby',
  'Mercedes-Benz Stadium',
  'Michigan Central Station',
  'Cox',
]

const SERVICES = [
  'Consulting',
  'Exhibitions and installations',
  'Commissions and collaborations',
  'Creative technology',
  'Lighting design',
  'Experiential production',
  'Mentorship',
]

export function MobileAbout() {
  return (
    <div className="ma">
      <section className="ma-pad ma-open">
        <p className="ma-label font-mono">About</p>
        <h1 className="ma-head">An art and technology studio in Brooklyn.</h1>
        <p className="ma-body">
          Studio Studio makes work for galleries, festivals, retail, brand
          pop-ups, and public space. Installations, websites, apps, and
          sometimes lamps that run other apps, for our own projects or for
          brands, agencies, and cultural institutions.
        </p>
      </section>

      <div className="ma-image">
        <Image
          src="/landing/opt/light-around-us2.avif"
          alt="Studio Studio installation work"
          fill
          sizes="100vw"
          priority
          style={{ objectFit: 'cover' }}
        />
      </div>

      <section className="ma-pad ma-block">
        <p className="ma-label font-mono">Founder</p>
        <p className="ma-body">
          Pablo Gnecco started the studio in 2015 as an inaugural member of NEW
          INC, the New Museum&rsquo;s incubator. The commercial work funds the
          art, and the art sharpens the commercial work.
        </p>
      </section>

      <section className="ma-pad ma-block">
        <p className="ma-label font-mono">Clients</p>
        <p className="ma-clients">{CLIENTS.join(', ')}</p>
      </section>

      <section className="ma-pad ma-block">
        <p className="ma-label font-mono">What we do</p>
        <ul className="ma-list">
          {SERVICES.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>

      <section className="ma-pad ma-end">
        <Link href={MOBILE_ROUTES.contact} className="ma-cta">
          <span>Start a project</span>
          <span aria-hidden>→</span>
        </Link>
      </section>

      <MobileBar page="about" />

      <style>{`
        .ma {
          --ma-edge: 20px;
          background: ${BG};
          color: ${INK};
          min-height: 100svh;
        }
        .ma-pad { padding-left: var(--ma-edge); padding-right: var(--ma-edge); }
        .ma-open { padding-top: calc(env(safe-area-inset-top) + var(--ma-edge)); padding-bottom: 36px; }
        .ma-block { padding-top: 32px; padding-bottom: 32px; border-top: 1px solid ${RULE}; margin: 0 var(--ma-edge); padding-left: 0; padding-right: 0; }
        .ma-image + .ma-block { border-top: 0; }
        .ma-end { padding-top: 8px; padding-bottom: calc(env(safe-area-inset-bottom) + 108px); }

        .ma-label {
          margin: 0 0 14px;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: ${ink(0.5)};
        }
        .ma-head {
          margin: 0;
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: clamp(40px, 12vw, 60px);
          line-height: 0.95;
          letter-spacing: -0.035em;
          color: #fff;
          text-wrap: balance;
        }
        .ma-body {
          margin: 20px 0 0;
          font-size: 18px;
          line-height: 1.4;
          color: ${ink(0.82)};
          text-wrap: pretty;
        }
        .ma-block .ma-body { margin-top: 0; }

        .ma-image {
          position: relative;
          aspect-ratio: 4 / 5;
          width: 100%;
          margin-bottom: 8px;
          overflow: hidden;
        }

        .ma-clients {
          margin: 0;
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: 24px;
          line-height: 1.2;
          letter-spacing: -0.02em;
          color: #fff;
        }

        .ma-list { list-style: none; margin: 0; padding: 0; }
        .ma-list li {
          padding: 12px 0;
          border-bottom: 1px solid ${RULE};
          font-size: 18px;
          color: ${INK};
        }
        .ma-list li:first-child { padding-top: 0; }
        .ma-list li:last-child { border-bottom: 0; }

        .ma-cta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 60px;
          padding: 0 22px;
          border-radius: 999px;
          background: ${BLUE};
          color: #fff;
          text-decoration: none;
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: 20px;
          letter-spacing: -0.01em;
        }
        .ma-cta:active { transform: scale(0.98); }
      `}</style>
    </div>
  )
}
