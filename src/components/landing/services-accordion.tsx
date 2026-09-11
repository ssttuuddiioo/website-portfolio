'use client'

import { useEffect, useState } from 'react'
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useAnimationControls,
} from 'framer-motion'

interface Service {
  title: string
  body: string
  /** Fills "See ___ projects" on the bar's CTA. */
  cta: string
}

export const SERVICES: Service[] = [
  {
    title: 'Consulting',
    body: 'We help brands, agencies, and institutions work out what to make and how to make it. Sometimes that is the whole job and another team builds it.',
    cta: 'direction',
  },
  {
    title: 'Creative technology',
    body: 'Custom software and interactive systems: real-time graphics, sensor-driven rooms, and livestreamed pieces that remote audiences can control. Recent builds include touchscreen pledge kiosks for Cox and a web-based lighting controller for a venue.',
    cta: 'creative technology',
  },
  {
    title: 'Lighting design',
    body: 'Architectural and experiential lighting, as a standalone job or as part of a bigger build. LED systems, pixel mapping, DMX and sACN, and show programming. Most recently, the lighting and control system for LOOP in Atlanta.',
    cta: 'lighting',
  },
  {
    title: 'Experiential production',
    body: 'Large installations and brand experiences. We design them, build them, install them, and run them live when the job calls for it. Work for HBO, Netflix, Google, AT&T, Audible, Under Armour, Intel, Sony, Dolby, Mercedes-Benz Stadium, Michigan Central Station, and Cox.',
    cta: 'experiential',
  },
  {
    title: 'Exhibitions and installations',
    body: 'Our own work, shown in galleries and public space, usually built from light, sound, and interaction. We Are Stars / Somos Estrellas at The Gallery by Wish. Storybooth on Dexter Avenue in Montgomery.',
    cta: 'installation',
  },
  {
    title: 'Commissions and collaborations',
    body: 'Commissioned art for institutions and partners, and joint pieces with other artists and studios. 9to5.tv at The Goat Farm, with custom robots and a public livestream, started as one of these.',
    cta: 'commissioned',
  },
  {
    title: 'Mentorship',
    body: 'Mentoring through NYU ITP, the Steve Jobs Archive, and arts organizations, plus one-on-one time with artists, designers, and technologists on what they are making and how to build it.',
    cta: 'all',
  },
]

// Slight, deterministic off-kilter scatter — the resting "perfect balance"
// the stack sits at on load. The wiggle below is a transient deviation from
// these values; the bars always settle back here.
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

// Subtle settle: a hair of overshoot, settles fast — refined, not bouncy.
// Drives each bar's reflow (the "bump") and the expanding panel's height,
// so size + reposition ride one physics pass.
const SPRING = { type: 'spring', stiffness: 380, damping: 30, mass: 0.9 } as const
// Cap the cascade so the tail bar never visibly lags — keeps it tight.
const RIPPLE_STEP = 0.018
const RIPPLE_MAX = 0.09

// Tilt "wiggle" — on a pop, bars over-rotate past their rest tilt and oscillate
// back, like a physical stack readjusting itself. Amplitude is largest at the
// bar that was clicked and falls off with distance; each bar wiggles further
// into its own lean (sign of its rest rotation) for a coherent scatter.
const WIGGLE_PEAK = 4.5 // degrees of over-rotation at the clicked bar
const WIGGLE_FALLOFF = 0.62 // per bar of distance
const WIGGLE_DUR = 0.72 // seconds for the full settle
// Damped oscillation, expressed relative to rest: lean past, counter, ease in.
const WIGGLE_SHAPE = [0, 1, -0.42, 0.16, 0] as const
const WIGGLE_TIMES = [0, 0.26, 0.52, 0.74, 1] as const

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

interface ServiceBarProps {
  service: Service
  i: number
  open: number | null
  /** Index of the bar that triggered the latest pop (open or close). */
  pulseSource: number
  /** Increments on every click — re-fires the wiggle even on repeat sources. */
  pulseN: number
  onToggle: (i: number) => void
  reduce: boolean
}

function ServiceBar({
  service,
  i,
  open,
  pulseSource,
  pulseN,
  onToggle,
  reduce,
}: ServiceBarProps) {
  const isOpen = open === i
  const align = ALIGN[i % ALIGN.length]
  const rest = ROTATIONS[i % ROTATIONS.length]
  const x = OFFSETS[i % OFFSETS.length]
  const controls = useAnimationControls()

  // Distance from the opened bar drives the cascade delay, so the shove
  // travels down the stack a beat at a time instead of all at once.
  const dist = open === null ? 0 : Math.abs(i - open)
  const barTransition = reduce
    ? { duration: 0 }
    : { ...SPRING, delay: Math.min(dist * RIPPLE_STEP, RIPPLE_MAX) }
  const panelTransition = reduce
    ? { duration: 0 }
    : { ...SPRING, opacity: { duration: 0.25, ease: 'easeOut' } }

  // Fire the tilt wiggle whenever a bar is clicked (pulseN changes). The first
  // render (pulseN === 0) is the balanced load state — no wiggle there.
  useEffect(() => {
    if (pulseN === 0) return
    if (reduce) {
      controls.set({ rotate: rest })
      return
    }
    const d = Math.abs(i - pulseSource)
    const dir = rest < 0 ? -1 : 1
    const kick = WIGGLE_PEAK * Math.pow(WIGGLE_FALLOFF, d) * dir
    controls.start(
      { rotate: WIGGLE_SHAPE.map((m) => rest + kick * m) },
      {
        duration: WIGGLE_DUR,
        delay: Math.min(d * RIPPLE_STEP, RIPPLE_MAX),
        ease: 'easeOut',
        times: [...WIGGLE_TIMES],
      },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pulseN])

  return (
    // Outer: layout-only element. `layout="position"` springs the knock-on
    // repositioning of every sibling (the bump) but never scales, so nothing
    // distorts. The size change itself is driven by the panel below.
    <motion.div
      layout="position"
      transition={barTransition}
      style={{
        position: 'relative',
        // Asymmetric width + which edge the bar hugs — kept on expand.
        width: WIDTHS[i % WIDTHS.length],
        alignSelf:
          align === 'left'
            ? 'flex-start'
            : align === 'right'
              ? 'flex-end'
              : 'center',
        // Separated when collapsed (gentle gap, bars read as distinct);
        // open bar (and the one after it) gets extra breathing room.
        marginTop: i === 0 ? 0 : isOpen || open === i - 1 ? '32px' : '10px',
      }}
    >
      {/* Inner: the visible bar. Owns the animated tilt + the static x-offset
          as motion values, kept off the layout element so the wiggle never
          collides with Framer's layout projection (the rotation/FLIP gotcha). */}
      <motion.div
        animate={controls}
        initial={{ rotate: rest, x }}
        style={{
          background: BLUE,
          color: '#ffffff',
          // Constant radius: reads as a full pill when collapsed and morphs
          // into a softly-rounded rectangle as the bar grows on expand.
          borderRadius: '22px',
          mixBlendMode: BLENDS[i % BLENDS.length],
        }}
      >
        <button
          type="button"
          onClick={() => onToggle(i)}
          aria-expanded={isOpen}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: `${PADS_Y[i % PADS_Y.length]}rem 1.5rem`,
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
              lineHeight: 1,
              // Optical nudge: with line-height 1 the descenders push the ink
              // mass upward, so flex-centering reads slightly high. Drop it a
              // hair to sit true-centered in the collapsed pill.
              transform: 'translateY(0.06em)',
            }}
          >
            {service.title}
          </span>
          <span style={{ marginLeft: 'auto', display: 'flex' }}>
            <Chevron open={isOpen} />
          </span>
        </button>
        {/* Height springs from 0 → auto on the same spring as the reflow, so
            the bar's growth and the siblings' shove are one motion. */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={panelTransition}
              style={{ overflow: 'hidden' }}
            >
              <div
                style={{
                  // Generous gap below the title, matched left padding to the
                  // title, and roomy bottom — a clean, balanced panel.
                  padding: '1.5rem 2rem 2.4rem 1.5rem',
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
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

export function ServicesAccordion() {
  const [open, setOpen] = useState<number | null>(null)
  // Tracks which bar triggered the latest pop and a counter to re-fire the
  // wiggle on every click (including collapses and repeat taps).
  const [pulse, setPulse] = useState({ source: -1, n: 0 })
  const reduce = useReducedMotion() ?? false

  const toggle = (i: number) => {
    setOpen((prev) => (prev === i ? null : i))
    setPulse((p) => ({ source: i, n: p.n + 1 }))
  }

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
      {SERVICES.map((service, i) => (
        <ServiceBar
          key={service.title}
          service={service}
          i={i}
          open={open}
          pulseSource={pulse.source}
          pulseN={pulse.n}
          onToggle={toggle}
          reduce={reduce}
        />
      ))}
    </div>
  )
}
