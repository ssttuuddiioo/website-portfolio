import type { Metadata } from 'next'
import Link from 'next/link'
import { BG, INK, RULE, ink } from '@/components/landing/landing-theme'
import { WipForm } from './wip-form'

export const metadata: Metadata = {
  title: 'Work in progress — Studio Studio',
  description: 'This part of the site is still being built.',
  // The wall stands at every project URL while the site is unfinished. Keeping
  // it out of the index means those URLs are not crawled as a password page and
  // can be indexed properly the day the wall comes down.
  robots: { index: false, follow: false },
}

/**
 * The work-in-progress wall. Every project page is rewritten here by the
 * middleware until the browser is unlocked; `from` carries the page that was
 * asked for so the visitor lands on it once they are through.
 */
export default async function WipPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>
}) {
  const { from } = await searchParams

  // Only ever send the visitor to a path on this site — never to whatever a
  // crafted ?from= puts in the query.
  const destination = from && /^\/(?!\/)/.test(from) ? from : '/'

  return (
    <main
      style={{
        background: BG,
        color: INK,
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 'var(--edge)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 640 }}>
        <p
          className="font-mono"
          style={{
            fontSize: '0.7rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: ink(0.5),
            margin: 0,
          }}
        >
          Work in progress
        </p>

        <h1
          className="font-display"
          style={{
            fontSize: 'clamp(2.2rem, 6vw, 3.8rem)',
            fontWeight: 700,
            lineHeight: 0.95,
            letterSpacing: '-0.03em',
            margin: '1.2rem 0 0',
          }}
        >
          This one&apos;s
          <br />
          not open yet.
        </h1>

        <p
          className="font-display"
          style={{
            fontSize: '1.05rem',
            lineHeight: 1.5,
            color: ink(0.7),
            maxWidth: '38ch',
            marginTop: '1.4rem',
          }}
        >
          The site is being rebuilt, so the project pages are behind a password
          while the writing and the edits land. Everything else is open — keep
          exploring. If you have the password, you know what to do.
        </p>

        <WipForm from={destination} />

        <div
          style={{
            borderTop: `1px solid ${RULE}`,
            marginTop: '2.5rem',
            paddingTop: '1.2rem',
            display: 'flex',
            gap: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="/"
            className="font-mono"
            style={{
              fontSize: '0.72rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: ink(0.6),
              textDecoration: 'none',
            }}
          >
            ← Back to the site
          </Link>
          <a
            href="mailto:pablo@studiostudio.nyc"
            className="font-mono"
            style={{
              fontSize: '0.72rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: ink(0.6),
              textDecoration: 'none',
            }}
          >
            Ask for access
          </a>
        </div>
      </div>
    </main>
  )
}
