import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: { absolute: 'Work — Studio Studio' },
  description: 'Selected work from Studio Studio.',
  alternates: { canonical: '/agency/work' },
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
        color: '#0A0A0A',
      }}
    >
      <p
        className="font-mono"
        style={{
          fontSize: '0.72rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(10,10,10,0.5)',
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
          color: 'rgba(10,10,10,0.62)',
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
          border: '1px solid rgba(10,10,10,0.45)',
          borderRadius: '999px',
          fontSize: '0.74rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          textDecoration: 'none',
          color: '#0A0A0A',
        }}
      >
        ← Back
      </Link>
    </main>
  )
}
