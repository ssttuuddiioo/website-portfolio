'use client'

import { useForm, ValidationError } from '@formspree/react'
import { INK, BLUE, BG, PAPER } from './landing-theme'

/* Reuses the studio's Formspree endpoint. A hidden `type` field tags these as
   list signups so they can be filtered from contact messages — swap in a
   dedicated newsletter form id here when one exists. */
const SUBSCRIBE_FORM_ID = 'xnjkavky'

/**
 * Inline email capture. `onDark` restyles it for a cobalt ground: the site
 * footer, and the panel that closes the ideas index and each idea. The default
 * styling is for the near-black page, matching the contact form.
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
          color: onDark ? PAPER : INK,
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
    background: onDark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.06)',
    border: `1px solid ${onDark ? 'rgba(255,255,255,0.45)' : 'rgba(232, 228, 223, 0.18)'}`,
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
    color: onDark ? '#FFD9D4' : '#FF9B93',
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
            background: onDark ? PAPER : INK,
            color: BG,
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
            e.currentTarget.style.background = BLUE
            e.currentTarget.style.color = PAPER
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = onDark ? PAPER : INK
            e.currentTarget.style.color = BG
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
        .sub-input::placeholder { color: rgba(232, 228, 223, 0.4); }
        .sub-input--dark::placeholder { color: rgba(255,255,255,0.6); }
        .sub-btn:hover .sub-arrow { transform: translateX(3px); }
      `}</style>
    </form>
  )
}
