import type { Metadata } from 'next'
import Link from 'next/link'
import { INK } from '@/components/landing/landing-theme'

export const metadata: Metadata = {
  title: { absolute: 'Work — Studio Studio' },
  description: 'Selected work from Studio Studio.',
  alternates: { canonical: '/agency/work' },
  // Placeholder page. Crawlable (so the link from the homepage still passes
  // through) but kept out of the index until it holds real content — a
  // "Coming soon." page in the index is a thin result against our own name.
  // Remove this block when the page ships.
  robots: { index: false, follow: true },
}

export default function AgencyWorkPage() {
  return (
    <main
      style={{
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        padding: '0 var(--gutter, 1.5rem)',
        textAlign: 'center',
        color: INK,
      }}
    >
      <p
        className="font-mono"
        style={{
          fontSize: '0.72rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(232, 228, 223, 0.5)',
        }}
      >
        Work
      </p>
      <h1
        className="font-display"
        style={{
          fontWeight: 700,
          fontSize: 'clamp(2rem, 6vw, 4rem)',
          letterSpacing: '-0.03em',
          margin: 0,
        }}
      >
        Coming soon.
      </h1>
      <p
        className="font-display"
        style={{
          fontSize: 'clamp(0.95rem, 1.6vw, 1.15rem)',
          color: 'rgba(232, 228, 223, 0.62)',
          maxWidth: '40ch',
          margin: 0,
        }}
      >
        A full index of our installations, activations, and experiments is on the
        way.
      </p>
      <Link
        href="/agency"
        className="font-mono"
        style={{
          marginTop: '0.5rem',
          padding: '0.85rem 1.8rem',
          border: '1px solid rgba(232, 228, 223, 0.45)',
          borderRadius: '999px',
          fontSize: '0.74rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          textDecoration: 'none',
          color: INK,
        }}
      >
        ← Back
      </Link>
    </main>
  )
}
