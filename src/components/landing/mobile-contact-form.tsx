'use client'

import { useRef, useState } from 'react'
import { useForm, ValidationError } from '@formspree/react'
import { INK, BG, BLUE } from './landing-theme'

/**
 * Formspree endpoint. The same one the desktop contact and subscribe forms post
 * to — see contact-form.tsx / subscribe-form.tsx — so everything lands in one
 * inbox. The `intent` field below is what tells the two apart.
 */
const FORM_ID = 'xnjkavky'

/** The hairline everything here is divided by — the project page's own rule. */
const RULE = 'rgba(232, 228, 223, 0.16)'

/**
 * Contact, built on the same system as the project pages: one ruled sheet with
 * square corners, painted in the rule colour, every cell painted in the page
 * ground — so a 1px grid gap *is* the hairline and no element draws a border of
 * its own.
 *
 * Subscribing is the default because it asks for one thing and takes one tap.
 * Writing a message is a deliberate second step: the option opens the field
 * rather than the field sitting there empty, and the primary cell relabels, so
 * the button always says what it will do.
 */
export function MobileContactForm() {
  const [message, setMessage] = useState(false)
  const body = useRef<HTMLTextAreaElement>(null)
  const [state, handleSubmit] = useForm(FORM_ID)

  const open = () => {
    setMessage(true)
    // Wait for the row to start expanding before taking focus, so the keyboard
    // does not fight the transition.
    window.setTimeout(() => body.current?.focus(), 220)
  }

  const sheet = (
    <style>{`
      /* The sheet: painted in the rule colour, cells painted in the ground,
         1px gaps between them. Square throughout — nothing here is a pill. */
      .mcf {
        width: min(20rem, 84vw);
        margin: 0 auto;
        display: grid;
        gap: 1px;
        background: ${RULE};
        border: 1px solid ${RULE};
      }
      .mcf-cell { background: ${BG}; }

      .mcf-field {
        display: block;
        width: 100%;
        background: transparent;
        border: 0;
        border-radius: 0;
        padding: 0.8rem 0.85rem;
        color: ${INK};
        font-family: var(--font-mono), monospace;
        font-size: 0.76rem;
        line-height: 1.45;
        text-align: center;
        outline: none;
        -webkit-appearance: none;
      }
      .mcf-field::placeholder { color: rgba(232, 228, 223, 0.4); }
      .mcf-field:focus { background: rgba(232, 228, 223, 0.05); }
      textarea.mcf-field { resize: none; text-align: left; }

      /* The message cell expands from nothing on a row that animates its own
         height — no measuring, no max-height to outgrow. The negative margin
         eats one of the two gaps that would otherwise stack while it is shut,
         so the sheet never shows a double-weight rule. */
      .mcf-reveal {
        display: grid;
        grid-template-rows: 0fr;
        margin-top: -1px;
        transition: grid-template-rows 380ms cubic-bezier(0.22, 1, 0.36, 1),
                    margin-top 380ms cubic-bezier(0.22, 1, 0.36, 1);
      }
      .mcf-reveal[data-open='true'] { grid-template-rows: 1fr; margin-top: 0; }
      .mcf-reveal > div { overflow: hidden; }

      /* The action. Solid, because it is the one thing on the sheet that does
         something rather than collects something. */
      .mcf-submit {
        display: block;
        width: 100%;
        border: 0;
        border-radius: 0;
        padding: 0.9rem 0.85rem;
        background: ${INK};
        color: ${BG};
        font-family: var(--font-mono), monospace;
        font-size: 0.68rem;
        font-weight: 600;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        cursor: pointer;
        transition: background 200ms, color 200ms, opacity 200ms;
      }
      .mcf-submit:active { background: ${BLUE}; color: #fff; }
      .mcf-submit[disabled] { opacity: 0.55; }

      /* The second option: a cell like the others, deliberately quiet. */
      .mcf-toggle {
        display: block;
        width: 100%;
        border: 0;
        border-radius: 0;
        padding: 0.8rem 0.85rem;
        background: transparent;
        color: rgba(232, 228, 223, 0.6);
        font-family: var(--font-mono), monospace;
        font-size: 0.64rem;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        cursor: pointer;
        transition: color 200ms, background 200ms;
      }
      .mcf-toggle:active { color: ${INK}; background: rgba(232, 228, 223, 0.05); }

      .mcf-err {
        display: block;
        padding: 0 0.85rem 0.6rem;
        font-family: var(--font-mono), monospace;
        font-size: 0.6rem;
        color: rgba(232, 228, 223, 0.6);
      }

      .mcf-done { padding: 1.4rem 0.85rem; text-align: center; }
      .mcf-done-h {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 500;
        letter-spacing: -0.02em;
        color: ${INK};
      }
      .mcf-done-p {
        margin: 0.45rem 0 0;
        font-family: var(--font-mono), monospace;
        font-size: 0.64rem;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: rgba(232, 228, 223, 0.55);
      }
    `}</style>
  )

  if (state.succeeded) {
    return (
      <div className="mcf">
        {sheet}
        <div className="mcf-cell mcf-done">
          <p className="mcf-done-h font-display">Thank you.</p>
          <p className="mcf-done-p">
            {message ? 'We read everything, and we answer.' : "You're on the list."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <form className="mcf" onSubmit={handleSubmit}>
      {sheet}

      {/* Read from the mode rather than written by hand: setting this by ref in
          the toggle lost the value, because React re-runs the render afterwards
          and restores defaultValue. State is the mode already. */}
      <input
        type="hidden"
        name="intent"
        value={message ? 'message' : 'subscribe'}
        readOnly
      />

      <div className="mcf-cell">
        <input
          className="mcf-field"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="your email"
          aria-label="Your email address"
        />
        <ValidationError prefix="Email" field="email" errors={state.errors} className="mcf-err" />
      </div>

      <div className="mcf-reveal mcf-cell" data-open={message}>
        <div>
          {/* Disabled while collapsed, not merely un-required. A required field
              inside a zero-height row cannot be focused, and the browser refuses
              to submit while trying to point at it — so subscribing would fail
              silently. Disabling also keeps the empty message out of the
              payload entirely. */}
          <textarea
            ref={body}
            className="mcf-field"
            name="message"
            rows={3}
            required={message}
            disabled={!message}
            placeholder="what are you working on?"
            aria-label="Your message"
            aria-hidden={!message}
            tabIndex={message ? undefined : -1}
          />
        </div>
      </div>

      <button type="submit" className="mcf-submit" disabled={state.submitting}>
        {state.submitting ? 'Sending' : message ? 'Send message' : 'Subscribe'}
      </button>

      <button
        type="button"
        className="mcf-toggle mcf-cell"
        onClick={message ? () => setMessage(false) : open}
      >
        {message ? '← Just subscribe' : 'Or send a message →'}
      </button>
    </form>
  )
}
