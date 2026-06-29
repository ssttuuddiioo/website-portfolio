'use client'

import { useForm, ValidationError } from '@formspree/react'
import { INK, BLUE, BG } from './landing-theme'

/* Reuses the studio's Formspree endpoint. A hidden `type` field tags these as
   list signups so they can be filtered from contact messages — swap in a
   dedicated newsletter form id here when one exists. */
const SUBSCRIBE_FORM_ID = 'xnjkavky'

/**
 * Inline email capture. `onDark` restyles it to sit on the cobalt panel used at
 * the bottom of idea pages; the default light styling matches the contact form.
 */
export function SubscribeForm({ onDark = false }: { onDark?: boolean }) {
  const [state, handleSubmit] = useForm(SUBSCRIBE_FORM_ID)

  if (state.succeeded) {
    return (
      <p
        className="font-display"
        style={{
          fontSize: '1.1rem',
          fontWeight: 600,
          color: onDark ? BG : INK,
          margin: 0,
        }}
      >
        You&apos;re in. Talk soon. ✷
      </p>
    )
  }

  const inputStyle: React.CSSProperties = {
    flex: '1 1 220px',
    minWidth: 0,
    background: onDark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.7)',
    border: `1px solid ${onDark ? 'rgba(255,255,255,0.45)' : 'rgba(10,10,10,0.18)'}`,
    borderRadius: 4,
    padding: '0.75rem 0.9rem',
    fontFamily: 'var(--font-display), sans-serif',
    fontSize: '1rem',
    color: onDark ? '#fff' : INK,
    outline: 'none',
  }

  const errStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono), monospace',
    fontSize: '0.7rem',
    color: onDark ? '#FFD9D4' : '#b3261e',
    marginTop: '0.5rem',
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '520px' }}>
      <input type="hidden" name="type" value="newsletter subscription" />
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.65rem',
          alignItems: 'center',
        }}
      >
        <label htmlFor="sub-email" className="sr-only">
          Email address
        </label>
        <input
          id="sub-email"
          type="email"
          name="email"
          required
          placeholder="you@email.com"
          autoComplete="email"
          className={onDark ? 'sub-input sub-input--dark' : 'sub-input'}
          style={inputStyle}
        />
        <button
          type="submit"
          disabled={state.submitting}
          className="sub-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.6rem',
            background: onDark ? BG : INK,
            color: onDark ? INK : BG,
            border: 'none',
            borderRadius: 0,
            fontFamily: 'var(--font-mono), monospace',
            fontSize: '0.8rem',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            cursor: state.submitting ? 'default' : 'pointer',
            opacity: state.submitting ? 0.6 : 1,
            transition: 'opacity 200ms, background 200ms, color 200ms',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            if (state.submitting) return
            e.currentTarget.style.background = onDark ? INK : BLUE
            e.currentTarget.style.color = onDark ? BG : BG
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = onDark ? BG : INK
            e.currentTarget.style.color = onDark ? INK : BG
          }}
        >
          {state.submitting ? 'Sending…' : 'Keep me posted'}
          <span className="sub-arrow" aria-hidden style={{ transition: 'transform 200ms' }}>
            →
          </span>
        </button>
      </div>
      <ValidationError field="email" errors={state.errors} style={errStyle} />
      <ValidationError errors={state.errors} style={errStyle} />

      <style>{`
        .sub-input::placeholder { color: rgba(10,10,10,0.4); }
        .sub-input--dark::placeholder { color: rgba(255,255,255,0.6); }
        .sub-btn:hover .sub-arrow { transform: translateX(3px); }
      `}</style>
    </form>
  )
}

/**
 * Compact "stay in the loop" footer strip — a thin divider, a short pitch, and
 * the inline form side by side. Used at the bottom of the homepage and contact
 * page. Stacks on small screens.
 */
export function SubscribeStrip({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto', ...style }}>
      <div
        className="subscribe-strip"
        style={{
          borderTop: '1px solid rgba(10,10,10,0.12)',
          paddingTop: 'clamp(2rem, 4vw, 3rem)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem 2.5rem',
        }}
      >
        <div style={{ maxWidth: '34ch' }}>
          <span
            className="font-mono"
            style={{
              display: 'block',
              fontSize: '0.7rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(10,10,10,0.5)',
            }}
          >
            Stay in the loop
          </span>
          <p
            className="font-display"
            style={{
              margin: '0.65rem 0 0',
              fontSize: 'clamp(1rem, 1.5vw, 1.15rem)',
              lineHeight: 1.5,
              color: 'rgba(10,10,10,0.7)',
            }}
          >
            New projects and experiments in your inbox — only when there&apos;s
            something worth showing.
          </p>
        </div>
        <SubscribeForm />
      </div>
    </div>
  )
}
