'use client'

import { useState } from 'react'
import { INK } from './landing-theme'

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

interface Faq {
  q: string
  a: string
}

// Placeholder copy — drawn from the studio's actual practice. Swap for final
// answers (or move to the CMS) before launch.
const FAQS: Faq[] = [
  {
    q: 'What kinds of projects do you take on?',
    a: 'Installations, brand activations, exhibitions, and interactive environments — for rooms, screens, and stages. We work end to end: concept and creative direction, custom software and lighting, fabrication, and on-site delivery. Recent work spans clients like HBO, Intel, Dolby, and Michigan Central Station, alongside our own exhibited artwork.',
  },
  {
    q: 'Do you work with agencies and institutions, or only direct clients?',
    a: 'Both. We partner with brands and agencies as a production and creative-technology arm, and we take commissioned work from galleries, festivals, and cultural institutions. We are comfortable leading a project or plugging into a larger team.',
  },
  {
    q: 'What does a typical engagement look like?',
    a: 'It usually starts with a conversation about what the experience should be — before anyone builds anything. From there we move through concept, design, prototyping, fabrication, and install. Scope can be a single moment or a full multi-month production; we scale the team to fit.',
  },
  {
    q: 'What technologies do you work with?',
    a: 'Real-time graphics and interaction (Three.js, React Three Fiber, TouchDesigner), sensor-driven and networked systems, LED and pixel-mapped lighting (DMX/sACN), and custom web and kiosk software. We choose the stack around the idea, not the other way around.',
  },
  {
    q: 'Where are you based, and do you travel?',
    a: 'We are based at SRC_NYC, a shared studio in Brooklyn, New York. We design and build from there and travel to install and run work on-site wherever a project lives.',
  },
  {
    q: 'How do we start a project together?',
    a: 'Send a note through the form below with a rough sense of the idea, timeline, and budget. We will set up a call to figure out whether it is a fit and what the first step looks like.',
  },
]

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={{
        flexShrink: 0,
        transition: `transform 300ms ${EASE}`,
        transform: open ? 'rotate(45deg)' : 'none',
      }}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div style={{ width: '100%', maxWidth: '820px', margin: '0 auto' }}>
      {FAQS.map((faq, i) => {
        const isOpen = open === i
        return (
          <div
            key={faq.q}
            style={{ borderTop: '1px solid rgba(10,10,10,0.14)' }}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="font-display"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                padding: '1.5rem 0.25rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: INK,
                textAlign: 'left',
                fontWeight: 600,
                fontSize: 'clamp(1.05rem, 2vw, 1.4rem)',
                letterSpacing: '-0.01em',
                lineHeight: 1.25,
              }}
            >
              <span style={{ flex: 1 }}>{faq.q}</span>
              <Chevron open={isOpen} />
            </button>
            <div
              style={{
                display: 'grid',
                gridTemplateRows: isOpen ? '1fr' : '0fr',
                transition: `grid-template-rows 420ms ${EASE}`,
              }}
            >
              <div style={{ overflow: 'hidden', minHeight: 0 }}>
                <p
                  className="font-display"
                  style={{
                    margin: 0,
                    padding: '0 3rem 1.75rem 0.25rem',
                    color: 'rgba(10,10,10,0.66)',
                    fontSize: 'clamp(0.95rem, 1.4vw, 1.1rem)',
                    lineHeight: 1.6,
                    maxWidth: '66ch',
                    opacity: isOpen ? 1 : 0,
                    transition: `opacity 360ms ${EASE}`,
                  }}
                >
                  {faq.a}
                </p>
              </div>
            </div>
          </div>
        )
      })}
      <div style={{ borderTop: '1px solid rgba(10,10,10,0.14)' }} />
    </div>
  )
}
