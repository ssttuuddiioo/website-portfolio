'use client'

import { useState } from 'react'
import { FAQS } from '@/lib/faqs'
import { INK } from './landing-theme'

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

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
            style={{ borderTop: '1px solid rgba(232, 228, 223, 0.14)' }}
          >
            {/* Each question is a real heading wrapping its disclosure
                button — the standard accordion pattern. The <h3> is a bare
                block box (margin/font reset) so this is visually inert. */}
            <h3 style={{ margin: 0, font: 'inherit' }}>
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
            </h3>
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
                    color: 'rgba(232, 228, 223, 0.66)',
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
      <div style={{ borderTop: '1px solid rgba(232, 228, 223, 0.14)' }} />
    </div>
  )
}
