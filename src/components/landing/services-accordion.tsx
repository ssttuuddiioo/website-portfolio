'use client'

import { useState } from 'react'

interface Service {
  title: string
  body: string
}

const SERVICES: Service[] = [
  {
    title: 'Experiential production',
    body: 'We build large-scale installations and brand experiences from first concept through fabrication and on-site delivery. The full arc: design, build, install, run the thing live. Work for HBO, Google, Intel, Sony, Dolby, Mercedes-Benz Stadium, Michigan Central Station, and Cox.',
  },
  {
    title: 'Creative technology',
    body: 'Custom software and interactive systems. Real-time graphics, sensor-driven environments, livestreamed and networked pieces that let people anywhere shape what happens in a room. Built on Three.js and React Three Fiber when a moment needs to react.',
  },
  {
    title: 'Lighting design',
    body: 'Light as its own discipline and as a layer inside a larger build. Architectural and experiential lighting that gives a space depth and direction.',
  },
  {
    title: 'Creative direction and consulting',
    body: 'We help brands, agencies, and institutions figure out what an experience should be before anyone starts building. Strategy, concept, and direction from the front of the process.',
  },
  {
    title: 'Exhibitions and installations',
    body: 'Our own work, shown in galleries and public space. Light, sound, and interaction built into pieces a person steps inside. We Are Stars / Somos Estrellas at The Gallery by Wish. Storybooth on Dexter Avenue in Montgomery.',
  },
  {
    title: 'Commissions and collaborations',
    body: 'We take on commissioned art from institutions and partners, and work alongside other artists and studios on pieces that cross disciplines. 9to5.tv at The Goat Farm, with custom robots and a public livestream, came out of exactly this.',
  },
  {
    title: 'Teaching',
    body: 'We mentor at NYU ITP and the Steve Jobs Archive, working with people building at the edge of art and technology.',
  },
]

// Slight, deterministic off-kilter scatter.
const ROTATIONS = [-1.8, 1.3, -1.0, 1.6, -1.4, 0.9, -1.9]
const OFFSETS = [-12, 16, -7, 11, -14, 9, -9]
// One blue for every bar — overlaps mix to black/darker/lighter, no green.
const BLUE = '#081FF5'
// Each bar's overlap behaves differently (exclusion / difference / etc.).
const BLENDS = [
  'difference',
  'exclusion',
  'multiply',
  'overlay',
  'difference',
  'exclusion',
  'screen',
] as const
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={{
        flexShrink: 0,
        transition: `transform 300ms ${EASE}`,
        transform: open ? 'rotate(180deg)' : 'none',
      }}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

export function ServicesAccordion() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '748px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        // Isolate so bars read blue but blend where they overlap each other.
        isolation: 'isolate',
      }}
    >
      {SERVICES.map((service, i) => {
        const isOpen = open === i
        return (
          <div
            key={service.title}
            style={{
              position: 'relative',
              background: BLUE,
              color: '#ffffff',
              mixBlendMode: BLENDS[i % BLENDS.length],
              // Overlap when collapsed; open bar (and the one after it) gets
              // ~50px of breathing room above + below.
              marginTop:
                i === 0
                  ? 0
                  : isOpen || open === i - 1
                    ? '25px'
                    : '-14px',
              transform: `rotate(${ROTATIONS[i % ROTATIONS.length]}deg) translateX(${OFFSETS[i % OFFSETS.length]}px)`,
              transition: `margin-top 500ms ${EASE}`,
            }}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '2rem',
                padding: '1.1rem 2rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#ffffff',
                textAlign: 'left',
              }}
            >
              <Chevron open={isOpen} />
              <span
                className="font-display"
                style={{
                  fontWeight: 700,
                  fontSize: 'clamp(1.05rem, 2vw, 1.55rem)',
                  letterSpacing: '-0.01em',
                }}
              >
                {service.title}
              </span>
            </button>
            {/* CSS grid-rows expand — smooth, no measure/snap jump. */}
            <div
              style={{
                display: 'grid',
                gridTemplateRows: isOpen ? '1fr' : '0fr',
                transition: `grid-template-rows 500ms ${EASE}`,
              }}
            >
              <div style={{ overflow: 'hidden', minHeight: 0 }}>
                <p
                  className="font-display"
                  style={{
                    margin: 0,
                    padding: '0.2rem 2rem 1.5rem calc(2rem + 22px + 2rem)',
                    color: 'rgba(255,255,255,0.78)',
                    fontSize: 'clamp(0.9rem, 1.3vw, 1.05rem)',
                    lineHeight: 1.6,
                    maxWidth: '70ch',
                    opacity: isOpen ? 1 : 0,
                    transition: `opacity 400ms ${EASE}`,
                  }}
                >
                  {service.body}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
