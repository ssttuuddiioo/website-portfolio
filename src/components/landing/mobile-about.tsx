'use client'

import { useId, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MobileBar, MOBILE_ROUTES } from './mobile-bar'
import { SERVICES } from './services-accordion'
import { AGENCY_LOGOS, CLIENT_LOGOS, type ClientLogo } from '@/lib/client-logos'
import { FAQS } from '@/lib/faqs'
import { BG, INK, BLUE, RULE, ink } from './landing-theme'

/* ============================================
   Mobile About.
   The desktop page's sections in its order, set for a phone: the statement
   and photo, the agency and end-client logos, the founder with Pablo in the
   booth, services and the FAQ as rows that open on tap, and a way to start a
   project.
   ============================================ */

const pad = (n: number) => String(n).padStart(2, '0')

/** Three logos to a row; the last row is padded with blank cells. */
const COLS = 3
const fillers = (n: number) => (COLS - (n % COLS)) % COLS
/**
 * Each mark covers about LOGO_AREA px²: height is the square root of that
 * over the mark's ratio, held between a floor and a ceiling (as on desktop,
 * scaled to a phone's narrower cells).
 */
const LOGO_AREA = 900
const logoHeight = (ratio: number) =>
  `${Math.min(30, Math.max(10, Math.sqrt(LOGO_AREA / ratio))).toFixed(1)}px`

function LogoGrid({ label, logos }: { label: string; logos: ClientLogo[] }) {
  return (
    <>
      <p className="ma-label ma-sublabel font-mono">{label}</p>
      <div className="ma-logos">
        {logos.map((l) => (
          <div key={l.name} className="ma-logo">
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
          <div key={`f${i}`} className="ma-logo" aria-hidden />
        ))}
      </div>
    </>
  )
}

/** A service or question, closed until tapped. */
function ToggleRow({ index, title, body }: { index: number; title: string; body: string }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <li className={`ma-trow${open ? ' is-open' : ''}`}>
      <h3 className="ma-th">
        <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
          <span className="ma-num font-mono">{pad(index + 1)}</span>
          <span className="ma-ttitle">{title}</span>
          <span className="ma-plus" aria-hidden />
        </button>
      </h3>
      <div className="ma-collapse" id={id} inert={!open}>
        <div>
          <p className="ma-small">{body}</p>
        </div>
      </div>
    </li>
  )
}

export function MobileAbout() {
  return (
    <div className="ma">
      <section className="ma-pad ma-open">
        <h1 className="ma-head">An art and technology studio in Brooklyn.</h1>
        <p className="ma-body">
          We build installations, websites, apps, and the occasional lamp that
          runs other apps. Some of it is our own work and some is for brands,
          agencies, and cultural institutions, and we treat it the same either
          way. Sometimes we&rsquo;re there from the first sketch to the last
          screw.
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

      <section className="ma-block">
        <h2 className="ma-title">Who we&rsquo;ve made work with</h2>
        <LogoGrid label="Agency clients" logos={AGENCY_LOGOS} />
        <LogoGrid label="End clients" logos={CLIENT_LOGOS} />
      </section>

      <section className="ma-block">
        <p className="ma-label font-mono">Founder</p>
        <p className="ma-body">
          Studio Studio was founded by Pablo Gnecco in 2015 as an inaugural
          member of NEW INC, the New Museum&rsquo;s incubator. We like making
          things we haven&rsquo;t made before, and we make them with people who
          know more than we do: designers, fabricators, technologists. Some
          jobs we run start to finish. On others we join a team that&rsquo;s
          already on it.
        </p>
      </section>
      <div className="ma-image ma-image--wide">
        <Image
          src="/landing/opt/sb-pablo.avif"
          alt="Pablo Gnecco in StoryBooth"
          fill
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: '45% 60%' }}
        />
      </div>

      <section className="ma-block" id="services">
        <h2 className="ma-title">Services</h2>
        <ul className="ma-rows">
          {SERVICES.map((s, i) => (
            <ToggleRow key={s.title} index={i} title={s.title} body={s.body} />
          ))}
        </ul>
      </section>

      <section className="ma-block ma-cta-block" id="contact">
        <h2 className="ma-title">Have a project in mind?</h2>
        <p className="ma-small">Tell us a little about it and we&rsquo;ll set up a call.</p>
        <Link href={MOBILE_ROUTES.contact} className="ma-cta">
          <span>Start a project</span>
          <span aria-hidden>→</span>
        </Link>
      </section>

      <section className="ma-block ma-end">
        <h2 className="ma-title">Frequently asked</h2>
        <ul className="ma-rows">
          {FAQS.map((f, i) => (
            <ToggleRow key={f.q} index={i} title={f.q} body={f.a} />
          ))}
        </ul>
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
        .ma-block {
          margin: 0 var(--ma-edge);
          padding: 32px 0;
          border-top: 1px solid ${RULE};
        }
        .ma-image + .ma-block { border-top: 0; }
        .ma-end { padding-bottom: calc(env(safe-area-inset-bottom) + 108px); }

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
        .ma-title {
          margin: 0 0 20px;
          font-family: var(--font-display), sans-serif;
          font-weight: 400;
          font-size: 28px;
          line-height: 1.1;
          letter-spacing: -0.025em;
          color: #fff;
        }
        .ma-body {
          margin: 20px 0 0;
          font-size: 18px;
          line-height: 1.45;
          color: ${ink(0.82)};
          text-wrap: pretty;
        }
        .ma-block .ma-body { margin-top: 0; }
        .ma-small {
          margin: 0;
          font-size: 16px;
          line-height: 1.55;
          color: ${ink(0.7)};
        }

        .ma-image {
          position: relative;
          aspect-ratio: 4 / 5;
          width: 100%;
          margin-bottom: 8px;
          overflow: hidden;
        }
        .ma-image--wide { aspect-ratio: 3 / 2; }

        /* Logos: a ruled grid, three to a row, every mark turned light. */
        .ma-sublabel { margin: 24px 0 10px; }
        .ma-title + .ma-sublabel { margin-top: 0; }
        .ma-logos {
          display: grid;
          grid-template-columns: repeat(${COLS}, minmax(0, 1fr));
          gap: 1px;
          background: ${RULE};
          border: 1px solid ${RULE};
        }
        .ma-logo {
          background: ${BG};
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 76px;
          padding: 10px;
          isolation: isolate;
        }
        .ma-logo img {
          width: auto;
          max-width: 82%;
          object-fit: contain;
          opacity: 0.7;
          filter: grayscale(1) invert(1);
          mix-blend-mode: lighten;
        }
        .ma-logo img.is-vector { filter: brightness(0) invert(1); }

        /* Services and FAQ: rows that open on tap. */
        .ma-rows { list-style: none; margin: 0; padding: 0; border-top: 1px solid ${RULE}; }
        .ma-trow { border-bottom: 1px solid ${RULE}; }
        .ma-th { margin: 0; }
        .ma-th button {
          all: unset;
          box-sizing: border-box;
          cursor: pointer;
          width: 100%;
          display: grid;
          grid-template-columns: 2.25rem minmax(0, 1fr) 14px;
          align-items: baseline;
          gap: 0 8px;
          padding: 16px 0;
          -webkit-tap-highlight-color: transparent;
        }
        .ma-th button:focus-visible { outline: 2px solid ${BLUE}; outline-offset: 2px; }
        .ma-num { font-size: 11px; letter-spacing: 0.1em; color: ${ink(0.4)}; }
        .ma-ttitle {
          font-family: var(--font-display), sans-serif;
          font-size: 20px;
          line-height: 1.2;
          letter-spacing: -0.015em;
          color: ${INK};
          transition: color 250ms;
        }
        .ma-trow.is-open .ma-ttitle { color: ${BLUE}; }
        .ma-plus { position: relative; width: 14px; height: 14px; align-self: center; color: ${INK}; }
        .ma-plus::before,
        .ma-plus::after {
          content: '';
          position: absolute;
          left: 0;
          top: 6px;
          width: 14px;
          height: 2px;
          background: currentColor;
          transition: transform 350ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .ma-plus::after { transform: rotate(90deg); }
        .ma-trow.is-open .ma-plus { color: ${BLUE}; }
        .ma-trow.is-open .ma-plus::after { transform: rotate(0deg); }
        .ma-collapse {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 400ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .ma-trow.is-open .ma-collapse { grid-template-rows: 1fr; }
        .ma-collapse > div { overflow: hidden; min-height: 0; }
        .ma-collapse .ma-small { padding: 0 0 18px 2.25rem; }

        /* Get in touch */
        .ma-cta-block .ma-title { margin-bottom: 10px; }
        .ma-cta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 60px;
          margin-top: 24px;
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

        @media (prefers-reduced-motion: reduce) {
          .ma-collapse, .ma-plus::before, .ma-plus::after { transition: none; }
        }
      `}</style>
    </div>
  )
}
