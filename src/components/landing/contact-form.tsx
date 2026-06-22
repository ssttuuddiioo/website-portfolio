'use client'

import { useForm, ValidationError } from '@formspree/react'
import { INK, BLUE, BG } from './landing-theme'

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-mono), monospace',
  fontSize: '0.7rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'rgba(10,10,10,0.55)',
  marginBottom: '0.5rem',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.7)',
  border: '1px solid rgba(10,10,10,0.18)',
  borderRadius: 4,
  padding: '0.65rem 0.75rem',
  fontFamily: 'var(--font-display), sans-serif',
  fontSize: '1rem',
  color: INK,
  outline: 'none',
}

const errStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono), monospace',
  fontSize: '0.7rem',
  color: '#b3261e',
  marginTop: '0.4rem',
}

export function ContactForm() {
  const [state, handleSubmit] = useForm('xnjkavky')

  if (state.succeeded) {
    return (
      <p
        className="font-display"
        style={{ fontSize: '1.15rem', color: INK, maxWidth: '480px' }}
      >
        Thanks — we&apos;ll be in touch soon.
      </p>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        width: '100%',
        maxWidth: '480px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        textAlign: 'left',
      }}
    >
      <div>
        <label htmlFor="cf-name" style={labelStyle}>
          Name
        </label>
        <input id="cf-name" type="text" name="name" required style={inputStyle} />
      </div>

      <div>
        <label htmlFor="cf-email" style={labelStyle}>
          Email
        </label>
        <input
          id="cf-email"
          type="email"
          name="email"
          required
          style={inputStyle}
        />
        <ValidationError field="email" errors={state.errors} style={errStyle} />
      </div>

      <div>
        <label htmlFor="cf-message" style={labelStyle}>
          Message
        </label>
        <textarea
          id="cf-message"
          name="message"
          required
          rows={4}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
        <ValidationError
          field="message"
          errors={state.errors}
          style={errStyle}
        />
      </div>

      <ValidationError errors={state.errors} style={errStyle} />

      <button
        type="submit"
        disabled={state.submitting}
        style={{
          alignSelf: 'flex-start',
          marginTop: '0.5rem',
          padding: '0.85rem 2.25rem',
          background: INK,
          color: BG,
          border: 'none',
          borderRadius: 0,
          fontFamily: 'var(--font-mono), monospace',
          fontSize: '0.8rem',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          cursor: state.submitting ? 'default' : 'pointer',
          opacity: state.submitting ? 0.6 : 1,
          transition: 'opacity 200ms, background 200ms',
        }}
        onMouseEnter={(e) => {
          if (!state.submitting) e.currentTarget.style.background = BLUE
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = INK
        }}
      >
        {state.submitting ? 'Sending…' : 'Send'}
      </button>
    </form>
  )
}
