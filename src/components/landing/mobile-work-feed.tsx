'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { LANDING_PROJECTS } from '@/lib/landing-projects'
import { useLenis } from '@/lib/lenis-provider'
import { MobileBar, MOBILE_ROUTES } from './mobile-bar'
import { BG, INK, BLUE, RULE, ink } from './landing-theme'

/* ============================================
   Mobile landing, alternate take.
   The work leads: every project is a full-bleed frame you scroll through,
   title set large on the image. A floating pill tracks where you are and
   opens the whole index, so any project is two taps away from anywhere.
   ============================================ */

const PROJECTS = LANDING_PROJECTS.filter((p) => p.slug)
const TOTAL = PROJECTS.length
/** How far an image drifts against the scroll, as a fraction of its card. */
const PARALLAX = 0.06
const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Heavy arrow for the project cards: square ends, and a bevel at the point so
 * the tip reads as a flat cut rather than a spike.
 */
function GoArrow({ size = 30 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3.4}
      strokeLinecap="butt"
      strokeLinejoin="bevel"
      style={{ display: 'block' }}
    >
      <path d="M2 12h19" />
      <path d="M13.5 4.5 21 12l-7.5 7.5" />
    </svg>
  )
}

export function MobileWorkFeed() {
  const lenis = useLenis()
  const [current, setCurrent] = useState(-1)
  const [indexOpen, setIndexOpen] = useState(false)
  const [pastHero, setPastHero] = useState(false)
  const cardRefs = useRef<(HTMLElement | null)[]>([])
  const wordRef = useRef<HTMLHeadingElement>(null)

  // The bar and the small mark wait until the big wordmark has scrolled off,
  // so the two marks never share the screen.
  useEffect(() => {
    const el = wordRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) =>
      setPastHero(!e.isIntersecting && e.boundingClientRect.top < 0),
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // The card crossing the middle of the screen is the current one; above the
  // first card nothing is, and the pill stays tucked away.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const i = Number((e.target as HTMLElement).dataset.i)
          if (e.isIntersecting) setCurrent(i)
          else if (i === 0 && e.boundingClientRect.top > 0) setCurrent(-1)
        }
      },
      { rootMargin: '-50% 0px -50% 0px' },
    )
    cardRefs.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [])

  // A little parallax: each frame's image drifts against the scroll, at most
  // PARALLAX of the card's height either way, by where the card sits on screen.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const update = () => {
      raf = 0
      const vh = window.innerHeight
      for (const card of cardRefs.current) {
        if (!card) continue
        const r = card.getBoundingClientRect()
        if (r.bottom < 0 || r.top > vh) continue
        // -1 as the card enters at the bottom, 1 as it leaves at the top.
        const t = (vh / 2 - (r.top + r.height / 2)) / (vh / 2 + r.height / 2)
        const el = card.querySelector<HTMLElement>('.mwf-par')
        if (el) el.style.transform = `translate3d(0, ${(t * PARALLAX * r.height).toFixed(1)}px, 0)`
      }
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  // Frames ease in once, as they first come up from the bottom.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('mwf-in')
            io.unobserve(e.target)
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    )
    cardRefs.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!indexOpen) return
    lenis?.stop()
    // Open on the project you were looking at, not the top of the list.
    document
      .querySelector('.mwf-row.is-current')
      ?.scrollIntoView({ block: 'center' })
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIndexOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      lenis?.start()
      window.removeEventListener('keydown', onKey)
    }
  }, [indexOpen, lenis])

  const barOn = pastHero && current >= 0

  return (
    <div className="mwf">
      {/* ---- Top bar ---- */}
      <header className="mwf-bar">
        <Link
          href="/"
          className={`mwf-mark${pastHero ? ' is-on' : ''}`}
          aria-label="Studio Studio, home"
        >
          studio
          <br />
          studio
        </Link>
      </header>

      {/* ---- Opening ---- */}
      <section className="mwf-hero">
        <h1 ref={wordRef} className="mwf-word" aria-label="Studio Studio">
          <span>studio</span>
          <span className="mwf-word-flip">studio</span>
        </h1>
        <p className="mwf-statement">
          An art and technology studio. Experiential direction, lighting
          design, and custom software, made in Brooklyn, New York.
        </p>
      </section>

      {/* ---- The work ---- */}
      <main className="mwf-feed">
        {PROJECTS.map((p, i) => (
          <article
            key={p.slug}
            id={`mwf-${p.slug}`}
            data-i={i}
            ref={(el) => {
              cardRefs.current[i] = el
            }}
            className="mwf-card"
          >
            <Link href={`/work/${p.slug}`} className="mwf-card-link">
              <div className="mwf-media">
                <div className="mwf-par">
                  <Image
                    src={p.image}
                    alt=""
                    fill
                    sizes="100vw"
                    priority={i < 2}
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              </div>
              <div className="mwf-scrim" aria-hidden />
              <div className="mwf-caption">
                <h2 className="mwf-title">{p.title}</h2>
                {(p.summary ?? p.tagline) && (
                  <p className="mwf-tagline">{p.summary ?? p.tagline}</p>
                )}
                <div className="mwf-meta font-mono">
                  <span>
                    {p.clientShort ?? p.client} · {p.year}
                  </span>
                  <span className="mwf-go" aria-hidden>
                    <GoArrow />
                  </span>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </main>

      {/* ---- Close ---- */}
      <footer className="mwf-foot">
        <p className="mwf-foot-line">Have something in mind?</p>
        <a href="mailto:hello@studiostudio.nyc" className="mwf-foot-mail">
          hello@studiostudio.nyc
        </a>
        <div className="mwf-foot-links font-mono">
          <Link href={MOBILE_ROUTES.about}>About</Link>
          <Link href={MOBILE_ROUTES.contact}>Contact</Link>
          <Link href="/work">All work</Link>
        </div>
      </footer>

      {/* ---- Floating bar ---- */}
      <MobileBar
        page="work"
        on={barOn}
        count={{ current: current + 1, total: TOTAL }}
        onIndex={() => setIndexOpen(true)}
      />

      {/* ---- Index sheet ---- */}
      <div
        className={`mwf-sheet${indexOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="All projects"
        aria-hidden={!indexOpen}
        data-lenis-prevent
      >
        <div className="mwf-sheet-head">
          <span className="font-mono">
            {TOTAL} projects
          </span>
          <button
            type="button"
            className="mwf-sheet-close font-mono"
            onClick={() => setIndexOpen(false)}
            tabIndex={indexOpen ? 0 : -1}
          >
            Close ✕
          </button>
        </div>
        <ol className="mwf-list">
          {PROJECTS.map((p, i) => (
            <li key={p.slug}>
              <Link
                href={`/work/${p.slug}`}
                className={`mwf-row${i === current ? ' is-current' : ''}`}
                tabIndex={indexOpen ? 0 : -1}
              >
                <span className="mwf-row-thumb">
                  <Image src={p.image} alt="" fill sizes="96px" style={{ objectFit: 'cover' }} />
                </span>
                <span className="mwf-row-text">
                  <span className="mwf-row-title">{p.title}</span>
                  <span className="mwf-row-meta font-mono">
                    {p.clientShort ?? p.client} · {p.year}
                  </span>
                </span>
                <span className="mwf-row-num font-mono">{pad(i + 1)}</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>

      <style>{`
        .mwf {
          --mwf-edge: 20px;
          background: ${BG};
          color: ${INK};
          min-height: 100svh;
        }

        /* Top bar. Difference blend keeps the mark legible over any frame. */
        .mwf-bar {
          position: fixed;
          inset: 0 0 auto 0;
          z-index: 30;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: calc(env(safe-area-inset-top) + 16px) var(--mwf-edge) 0;
          mix-blend-mode: difference;
          color: #fff;
          pointer-events: none;
        }
        .mwf-bar a { pointer-events: auto; color: inherit; text-decoration: none; }
        .mwf-mark {
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: 17px;
          line-height: 0.82;
          letter-spacing: -0.03em;
          opacity: 0;
          transition: opacity 400ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .mwf-mark.is-on { opacity: 1; }

        /* Opening */
        .mwf-hero {
          padding: calc(env(safe-area-inset-top) + var(--mwf-edge)) var(--mwf-edge) 40px;
        }
        .mwf-word {
          display: flex;
          flex-direction: column;
          margin: 0 0 0 -0.03em;
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: 21vw;
          line-height: 0.74;
          letter-spacing: -0.02em;
          text-transform: uppercase;
          color: #fff;
        }
        /* Turned on its head. The negative tracking trails the last glyph, so
           once rotated it hangs off the left; the margin puts the edges back
           on one line with the word above. */
        .mwf-word-flip {
          align-self: flex-start;
          margin: 0.16em 0 0 0.02em;
          transform: rotate(180deg);
        }
        .mwf-statement {
          margin: 28px 0 0;
          max-width: 21em;
          font-size: 19px;
          line-height: 1.3;
          color: ${ink(0.82)};
        }

        /* The work */
        .mwf-feed { display: flex; flex-direction: column; }
        .mwf-card { position: relative; }
        .mwf-card-link {
          position: relative;
          display: block;
          aspect-ratio: 4 / 5;
          max-height: 86svh;
          width: 100%;
          overflow: hidden;
          color: #fff;
          text-decoration: none;
          -webkit-tap-highlight-color: transparent;
        }
        .mwf-media {
          position: absolute;
          inset: 0;
          transform: scale(1.08);
          opacity: 0.001;
          transition:
            transform 1400ms cubic-bezier(0.16, 1, 0.3, 1),
            opacity 900ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .mwf-in .mwf-media { transform: scale(1); opacity: 1; }
        /* Overscan for the parallax: taller than the card by PARALLAX at
           each end, so the drift never shows an edge. */
        .mwf-par {
          position: absolute;
          inset: -6% 0;
          will-change: transform;
        }
        .mwf-card-link:active .mwf-media { transform: scale(0.985); transition-duration: 200ms; }
        .mwf-scrim {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(to bottom, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0) 22%),
            linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.25) 38%, rgba(0,0,0,0) 60%);
        }
        .mwf-caption {
          position: absolute;
          left: var(--mwf-edge);
          right: var(--mwf-edge);
          bottom: 20px;
          transform: translateY(14px);
          opacity: 0;
          transition:
            transform 900ms 150ms cubic-bezier(0.16, 1, 0.3, 1),
            opacity 700ms 150ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .mwf-in .mwf-caption { transform: none; opacity: 1; }
        .mwf-title {
          margin: 0;
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: clamp(38px, 11.5vw, 56px);
          line-height: 0.92;
          letter-spacing: -0.035em;
          text-wrap: balance;
        }
        .mwf-tagline {
          margin: 10px 0 0;
          max-width: 30em;
          text-wrap: pretty;
          font-size: 16px;
          line-height: 1.3;
          color: rgba(255,255,255,0.86);
        }
        .mwf-meta {
          margin-top: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.7);
        }
        .mwf-go {
          display: grid;
          place-items: center;
          flex: none;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #fff;
          color: ${BLUE};
          transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .mwf-card-link:active .mwf-go { transform: scale(0.92); }

        /* Close */
        .mwf-foot {
          padding: 72px var(--mwf-edge) calc(env(safe-area-inset-bottom) + 120px);
        }
        .mwf-foot-line { margin: 0; font-size: 19px; color: ${ink(0.6)}; }
        .mwf-foot-mail {
          display: block;
          margin-top: 6px;
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: 6.6vw;
          letter-spacing: -0.03em;
          color: #fff;
          text-decoration: none;
        }
        .mwf-foot-links {
          display: flex;
          gap: 22px;
          margin-top: 36px;
          padding-top: 14px;
          border-top: 1px solid ${RULE};
          font-size: 13px;
        }
        .mwf-foot-links a { color: ${ink(0.7)}; text-decoration: none; }

        /* Index sheet */
        .mwf-sheet {
          position: fixed;
          inset: 0;
          z-index: 50;
          background: ${BG};
          overflow-y: auto;
          overscroll-behavior: contain;
          visibility: hidden;
          transform: translateY(100%);
          transition:
            transform 550ms cubic-bezier(0.16, 1, 0.3, 1),
            visibility 0s 550ms;
        }
        .mwf-sheet.is-open {
          visibility: visible;
          transform: none;
          transition: transform 550ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .mwf-sheet-head {
          position: sticky;
          top: 0;
          z-index: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: calc(env(safe-area-inset-top) + 14px) var(--mwf-edge) 14px;
          background: ${BG};
          border-bottom: 1px solid ${RULE};
          font-size: 13px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: ${ink(0.6)};
        }
        .mwf-sheet-close {
          all: unset;
          cursor: pointer;
          padding: 8px 0 8px 16px;
          color: ${INK};
          letter-spacing: 0.08em;
        }
        .mwf-list { list-style: none; margin: 0; padding: 0 0 calc(env(safe-area-inset-bottom) + 24px); }
        .mwf-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 10px var(--mwf-edge);
          border-bottom: 1px solid ${RULE};
          color: ${INK};
          text-decoration: none;
        }
        .mwf-row:active { background: ${ink(0.06)}; }
        .mwf-row.is-current { background: ${ink(0.05)}; }
        .mwf-row.is-current .mwf-row-num { color: ${BLUE}; }
        .mwf-row-thumb {
          position: relative;
          flex: none;
          width: 64px;
          height: 64px;
          overflow: hidden;
          background: ${ink(0.08)};
        }
        .mwf-row-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
        .mwf-row-title {
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: 21px;
          line-height: 1.05;
          letter-spacing: -0.02em;
        }
        .mwf-row-meta {
          font-size: 11px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: ${ink(0.5)};
        }
        .mwf-row-num { font-size: 12px; color: ${ink(0.4)}; font-variant-numeric: tabular-nums; }

        @media (prefers-reduced-motion: reduce) {
          .mwf-media, .mwf-caption { transition: none; transform: none; opacity: 1; }
          .mwf-sheet { transition-duration: 1ms; }
        }
      `}</style>
    </div>
  )
}
