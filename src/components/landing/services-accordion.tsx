'use client'

import { useState } from 'react'

interface Service {
  title: string
  body: string
  /** Fills "See ___ projects" on the bar's CTA. */
  cta: string
}

const SERVICES: Service[] = [
  {
    title: 'Experiential production',
    body: 'We build large-scale installations and brand experiences from first concept through fabrication and on-site delivery. The full arc: design, build, install, run the thing live. Work for HBO, Google, Intel, Sony, Dolby, Mercedes-Benz Stadium, Michigan Central Station, and Cox.',
    cta: 'experiential',
  },
  {
    title: 'Creative technology',
    body: 'Custom software and interactive systems. Real-time graphics, sensor-driven environments, livestreamed and networked pieces that let people anywhere shape what happens in a room. Built on Three.js and React Three Fiber when a moment needs to react.',
    cta: 'creative technology',
  },
  {
    title: 'Lighting design',
    body: 'Light as its own discipline and as a layer inside a larger build. Architectural and experiential lighting that gives a space depth and direction.',
    cta: 'lighting',
  },
  {
    title: 'Creative direction and consulting',
    body: 'We help brands, agencies, and institutions figure out what an experience should be before anyone starts building. Strategy, concept, and direction from the front of the process.',
    cta: 'direction',
  },
  {
    title: 'Exhibitions and installations',
    body: 'Our own work, shown in galleries and public space. Light, sound, and interaction built into pieces a person steps inside. We Are Stars / Somos Estrellas at The Gallery by Wish. Storybooth on Dexter Avenue in Montgomery.',
    cta: 'installation',
  },
  {
    title: 'Commissions and collaborations',
    body: 'We take on commissioned art from institutions and partners, and work alongside other artists and studios on pieces that cross disciplines. 9to5.tv at The Goat Farm, with custom robots and a public livestream, came out of exactly this.',
    cta: 'commissioned',
  },
  {
    title: 'Teaching',
    body: 'We mentor at NYU ITP and the Steve Jobs Archive, working with people building at the edge of art and technology.',
    cta: 'all',
  },
]

// Slight, deterministic off-kilter scatter — gentle, Albers-controlled.
const ROTATIONS = [-0.9, 0.7, -0.5, 0.8, -0.7, 0.5, -0.9]
const OFFSETS = [-7, 9, -4, 6, -8, 5, -5]
// Asymmetric composition: each bar a different width + horizontal pull.
// Widths are a fraction of the container; align decides which edge it hugs.
const WIDTHS = ['78%', '92%', '64%', '88%', '72%', '96%', '58%']
const ALIGN: Array<'left' | 'center' | 'right'> = [
  'left',
  'right',
  'left',
  'center',
  'right',
  'left',
  'right',
]
// Subtle height variation via vertical padding.
const PADS_Y = [1.0, 1.25, 0.9, 1.15, 1.05, 1.3, 0.95]
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
      <style>{`
        @media (max-width: 640px) {
          .services-cta-word { display: none; }
        }
      `}</style>
      {SERVICES.map((service, i) => {
        const isOpen = open === i
        const align = ALIGN[i % ALIGN.length]
        return (
          <div
            key={service.title}
            style={{
              position: 'relative',
              background: BLUE,
              color: '#ffffff',
              mixBlendMode: BLENDS[i % BLENDS.length],
              // Asymmetric width + which edge the bar hugs — kept on expand.
              width: WIDTHS[i % WIDTHS.length],
              alignSelf:
                align === 'left'
                  ? 'flex-start'
                  : align === 'right'
                    ? 'flex-end'
                    : 'center',
              transition: `margin-top 500ms ${EASE}, width 500ms ${EASE}`,
              // Separated when collapsed (gentle gap, bars read as distinct);
              // open bar (and the one after it) gets extra breathing room.
              marginTop:
                i === 0
                  ? 0
                  : isOpen || open === i - 1
                    ? '32px'
                    : '10px',
              transform: `rotate(${ROTATIONS[i % ROTATIONS.length]}deg) translateX(${OFFSETS[i % OFFSETS.length]}px)`,
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
                gap: '1rem',
                padding: `${PADS_Y[i % PADS_Y.length]}rem 1.25rem`,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#ffffff',
                textAlign: 'left',
              }}
            >
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
              <span style={{ marginLeft: 'auto', display: 'flex' }}>
                <Chevron open={isOpen} />
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
              <div
                style={{
                  overflow: 'hidden',
                  minHeight: 0,
                  // Taller breathing room as the bar expands.
                  padding: '0.6rem 2rem 2.4rem 1.25rem',
                  opacity: isOpen ? 1 : 0,
                  transition: `opacity 400ms ${EASE}`,
                }}
              >
                <p
                  className="font-display"
                  style={{
                    margin: 0,
                    color: 'rgba(255,255,255,0.78)',
                    fontSize: 'clamp(0.9rem, 1.3vw, 1.05rem)',
                    lineHeight: 1.6,
                    maxWidth: '70ch',
                  }}
                >
                  {service.body}
                </p>
                <a
                  href="#work"
                  tabIndex={isOpen ? 0 : -1}
                  className="font-mono"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    marginTop: '1.6rem',
                    padding: '0.65rem 1.2rem',
                    border: '1px solid rgba(255,255,255,0.55)',
                    borderRadius: '999px',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    transition: `background 200ms ${EASE}, border-color 200ms ${EASE}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.14)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.9)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.55)'
                  }}
                >
                  See <span className="services-cta-word">{service.cta} </span>projects
                  <span aria-hidden>→</span>
                </a>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
