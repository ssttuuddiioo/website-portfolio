'use client'

import Link from 'next/link'
import { INK, BLUE, ink } from './landing-theme'

/** Where the mobile bar and the mobile pages link to. */
export const MOBILE_ROUTES = {
  home: '/',
  about: '/about',
  contact: '/contact',
} as const

type Page = 'work' | 'about' | 'contact'

/**
 * The floating bar at the foot of every mobile page. On the work feed it
 * carries the count and opens the index; elsewhere the same slots lead back to
 * the work.
 */
export function MobileBar({
  page,
  on = true,
  count,
  onIndex,
}: {
  page: Page
  /** Slid out of view when false. */
  on?: boolean
  /** "07/19" on the work feed. */
  count?: { current: number; total: number }
  /** Opens the project index. Without it, the blue button goes to the work. */
  onIndex?: () => void
}) {
  const tab = on ? 0 : -1
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <nav
      className={`mb font-mono${on ? ' is-on' : ''}`}
      aria-label="Site"
      aria-hidden={!on}
    >
      {count && onIndex ? (
        <button
          type="button"
          className="mb-lead"
          onClick={onIndex}
          aria-label={`Project ${count.current} of ${count.total}, open index`}
          tabIndex={tab}
        >
          {pad(count.current)}
          <span className="mb-dim">/{pad(count.total)}</span>
        </button>
      ) : (
        <Link href={MOBILE_ROUTES.home} className="mb-lead mb-mark" tabIndex={tab}>
          studio
          <br />
          studio
        </Link>
      )}
      <Link
        href={MOBILE_ROUTES.about}
        className={`mb-link${page === 'about' ? ' is-here' : ''}`}
        aria-current={page === 'about' ? 'page' : undefined}
        tabIndex={tab}
      >
        About
      </Link>
      <Link
        href={MOBILE_ROUTES.contact}
        className={`mb-link${page === 'contact' ? ' is-here' : ''}`}
        aria-current={page === 'contact' ? 'page' : undefined}
        tabIndex={tab}
      >
        Contact
      </Link>
      {onIndex ? (
        <button type="button" className="mb-cta" onClick={onIndex} tabIndex={tab}>
          Index
        </button>
      ) : (
        <Link href={MOBILE_ROUTES.home} className="mb-cta" tabIndex={tab}>
          Work
        </Link>
      )}

      <style>{`
        .mb {
          position: fixed;
          z-index: 40;
          left: 12px;
          right: 12px;
          bottom: calc(env(safe-area-inset-bottom) + 12px);
          display: flex;
          align-items: center;
          gap: 4px;
          height: 52px;
          padding: 0 6px 0 18px;
          border-radius: 999px;
          background: rgba(20,20,20,0.72);
          backdrop-filter: blur(18px) saturate(1.4);
          -webkit-backdrop-filter: blur(18px) saturate(1.4);
          border: 1px solid rgba(255,255,255,0.1);
          color: ${INK};
          font-size: 13px;
          letter-spacing: 0.04em;
          transform: translateY(calc(100% + 24px));
          transition: transform 500ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .mb.is-on { transform: none; }
        .mb button { all: unset; box-sizing: border-box; cursor: pointer; }
        .mb a { text-decoration: none; }
        .mb .mb-lead {
          flex: 1;
          align-self: stretch;
          display: flex;
          align-items: center;
          color: ${INK};
          font-variant-numeric: tabular-nums;
        }
        .mb .mb-mark {
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: 14px;
          line-height: 0.82;
          letter-spacing: -0.03em;
          color: #fff;
        }
        .mb-dim { color: ${ink(0.45)}; }
        .mb-link {
          display: grid;
          place-items: center;
          height: 40px;
          padding: 0 12px;
          color: ${ink(0.8)};
        }
        .mb-link.is-here { color: #fff; text-decoration: underline !important; text-underline-offset: 5px; }
        .mb-link:active { color: #fff; }
        .mb .mb-cta {
          display: grid;
          place-items: center;
          height: 40px;
          margin-left: 4px;
          padding: 0 18px;
          border-radius: 999px;
          background: ${BLUE};
          color: #fff;
        }
        @media (prefers-reduced-motion: reduce) {
          .mb { transition-duration: 1ms; }
        }
      `}</style>
    </nav>
  )
}
