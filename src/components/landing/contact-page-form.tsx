'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from '@formspree/react'
import { INK, BG, BLUE, PAPER } from './landing-theme'

/**
 * The studio's Formspree endpoint — the same inbox the short contact form, the
 * mobile sheet and the newsletter post to. Formspree emails each submission
 * on, and drops any that fill the `_gotcha` honeypot, so there is no CAPTCHA.
 */
const FORM_ID = 'xnjkavky'

const TIMELINE = ['ASAP', '1–3 months', '3–6 months', '6+ months', 'Not sure']
const BUDGET = ['Under $10k', '$10–25k', '$25–50k', '$50–100k', '$100k+', 'Not sure']

/** The required fields, in the order they appear — the first one wrong takes focus. */
const REQUIRED = {
  name: 'Full name',
  email: 'Email',
  project: 'Describe your project',
} as const
type Required = keyof typeof REQUIRED
type Errors = Partial<Record<Required, string>>

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(form: HTMLFormElement): Errors {
  const data = new FormData(form)
  const value = (k: string) => String(data.get(k) ?? '').trim()
  const errors: Errors = {}
  if (!value('name')) errors.name = 'Please enter your name.'
  const email = value('email')
  if (!email) errors.email = 'Please enter your email.'
  else if (!EMAIL.test(email)) errors.email = 'That email doesn’t look right. Check for a typo.'
  if (!value('project')) errors.project = 'Tell us a little about the project.'
  return errors
}

/**
 * An optional single-choice question drawn as a blank like the text fields:
 * same rule, same type size, same height. A native select underneath, so the
 * keyboard and the phone pickers behave as expected.
 */
function Choice({ label, name, options }: { label: string; name: string; options: string[] }) {
  const id = `cpf-${name}`
  return (
    <div className="cpf-field">
      <label htmlFor={id} className="cpf-label font-mono">
        {label}
      </label>
      <select id={id} name={name} defaultValue="" className="cpf-input cpf-select">
        <option value="">Choose one</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  )
}

/**
 * The full project enquiry for /contact. Validates on submit rather than per
 * keystroke: an error appears under its field, the field is marked invalid and
 * described by it, focus moves to the first one, and a polite live region reads
 * the count — so the errors are announced as well as shown. Success and
 * failure both land inline; Formspree submits over fetch, so nothing reloads.
 */
export function ContactPageForm() {
  const [state, handleSubmit] = useForm(FORM_ID)
  const [errors, setErrors] = useState<Errors>({})
  const [announce, setAnnounce] = useState('')
  const doneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!state.succeeded) return
    doneRef.current?.focus()
  }, [state.succeeded])

  // Formspree checks the email too; its verdict shows in the same place ours do.
  const errorFor = (field: Required) =>
    errors[field] ?? state.errors?.getFieldErrors(field)[0]?.message
  const formErrors = state.errors?.getFormErrors() ?? []
  const failed = Boolean(state.errors)

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget
    const next = validate(form)
    const bad = (Object.keys(REQUIRED) as Required[]).filter((f) => next[f])
    setErrors(next)
    if (bad.length > 0) {
      e.preventDefault()
      setAnnounce(
        `${bad.length === 1 ? 'One field needs' : `${bad.length} fields need`} attention: ${bad
          .map((f) => REQUIRED[f])
          .join(', ')}.`,
      )
      ;(form.elements.namedItem(bad[0]) as HTMLElement | null)?.focus()
      return
    }
    setAnnounce('Sending…')
    return handleSubmit(e)
  }

  // Typing into a field clears its own error; the rest wait for the next send.
  const clear = (field: Required) => () => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const describe = (field: Required, hint?: string) => {
    const err = errorFor(field)
    const ids = [hint, err ? `cpf-${field}-error` : null].filter(Boolean).join(' ')
    return {
      'aria-invalid': err ? true : undefined,
      'aria-describedby': ids || undefined,
    } as const
  }

  const errorText = (field: Required) => {
    const err = errorFor(field)
    return err ? (
      <p id={`cpf-${field}-error`} className="cpf-error font-mono">
        {err}
      </p>
    ) : null
  }

  return (
    <>
      {/* One live region for the whole form, mounted throughout so screen
          readers pick up every change to it. */}
      <p className="sr-only" aria-live="polite">
        {state.succeeded ? 'Message sent. Thanks, we’ll be in touch soon.' : announce}
      </p>

      {state.succeeded ? (
        <div ref={doneRef} tabIndex={-1} className="cpf-done">
          <p className="font-display cpf-donehead">Thanks, we’ve got it.</p>
          <p className="font-display cpf-donebody">
            We’ll read it properly and be in touch soon to set up a call.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="cpf">
          <input type="hidden" name="intent" value="project inquiry" />
          <input type="hidden" name="_subject" value="New project inquiry" />

          {/* Honeypot. Off-screen and out of the tab order, so only a bot fills
              it — and Formspree discards any submission that does. */}
          <div aria-hidden className="cpf-trap">
            <label htmlFor="cpf-gotcha">Leave this field empty</label>
            <input id="cpf-gotcha" type="text" name="_gotcha" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="cpf-row">
            <div className="cpf-field">
              <label htmlFor="cpf-name" className="cpf-label font-mono">
                Name <span aria-hidden>*</span>
              </label>
              <input
                id="cpf-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                onInput={clear('name')}
                className="cpf-input"
                {...describe('name')}
              />
              {errorText('name')}
            </div>
            <div className="cpf-field">
              <label htmlFor="cpf-email" className="cpf-label font-mono">
                Email <span aria-hidden>*</span>
              </label>
              <input
                id="cpf-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                onInput={clear('email')}
                className="cpf-input"
                {...describe('email')}
              />
              {errorText('email')}
            </div>
          </div>

          <div className="cpf-field">
            <label htmlFor="cpf-project" className="cpf-label font-mono">
              Describe your project <span aria-hidden>*</span>
            </label>
            <textarea
              id="cpf-project"
              name="project"
              rows={4}
              required
              placeholder="What are you making, and where will it live?"
              onInput={clear('project')}
              className="cpf-input cpf-textarea"
              {...describe('project')}
            />
            {errorText('project')}
          </div>

          <div className="cpf-row">
            <Choice label="Timeline" name="timeline" options={TIMELINE} />
            <Choice label="Budget" name="budget" options={BUDGET} />
          </div>

          <label className="cpf-check font-display">
            <input type="checkbox" name="mailing_list" value="yes" />
            <span>Add me to the Studio Studio mailing list</span>
          </label>

          {failed && (
            <div role="alert" className="cpf-failed font-mono">
              {formErrors.length > 0
                ? formErrors.map((e) => <p key={e.message}>{e.message}</p>)
                : null}
              <p>
                That didn’t go through. Try again, or email{' '}
                <a href="mailto:hello@studiostudio.nyc">hello@studiostudio.nyc</a>.
              </p>
            </div>
          )}

          <p className="cpf-hint font-mono" aria-hidden>
            * Required
          </p>

          <button type="submit" disabled={state.submitting} className="cpf-submit font-mono">
            {state.submitting ? 'Sending…' : 'Send'}
            <span aria-hidden className="cpf-arrow">→</span>
          </button>
        </form>
      )}

      <style>{`
        /* Field look comes from the short contact form (contact-form.tsx):
           same label, same underline, same error colour, at a larger size.
           What's new is what that form never needed: chips, a checkbox, a
           focus state and an invalid state. */
        .cpf {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          text-align: left;
        }
        .cpf-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 2rem;
        }
        @media (min-width: 640px) {
          .cpf-row { grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 2.5rem; }
        }
        .cpf-field { display: flex; flex-direction: column; min-width: 0; }
        .cpf-label {
          display: block;
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(232, 228, 223, 0.55);
          margin-bottom: 0.35rem;
          padding: 0;
        }
        .cpf-input::placeholder { color: rgba(232, 228, 223, 0.3); }
        .cpf-input:hover:not(:focus-visible) { border-bottom-color: rgba(232, 228, 223, 0.5); }
        /* A rule, not a box: the line under each field is the whole field. */
        .cpf-input {
          width: 100%;
          background: transparent;
          border: 0;
          border-bottom: 1px solid rgba(232, 228, 223, 0.25);
          border-radius: 0;
          padding: 0.6rem 0 0.7rem;
          font-family: var(--font-display), sans-serif;
          font-size: clamp(1.1rem, 1.7vw, 1.4rem);
          letter-spacing: -0.01em;
          color: ${INK};
          outline: none;
          transition: border-color 200ms, box-shadow 200ms;
        }
        .cpf-check input:focus-visible,
        .cpf-submit:focus-visible {
          outline: 2px solid ${BLUE};
          outline-offset: 2px;
        }
        /* Focus thickens the rule and turns it blue, in place of a ring. */
        .cpf-input:focus-visible {
          border-bottom-color: ${BLUE};
          box-shadow: 0 1px 0 ${BLUE};
        }
        .cpf-input[aria-invalid='true'] { border-bottom-color: #FF9B93; }
        .cpf-input[aria-invalid='true']:focus-visible { box-shadow: 0 1px 0 #FF9B93; }
        /* Textareas start short and grow with what's typed, so the rule sits
           close under the text rather than below an empty block. */
        .cpf-textarea {
          resize: vertical;
          min-height: 2.6rem;
          field-sizing: content;
          line-height: 1.5;
        }
        /* Selects keep their native keyboard behaviour; only the look is ours.
           color-scheme dark gives the option list the page's ground, and the
           unchosen state reads as a placeholder. */
        .cpf-select {
          appearance: none;
          -webkit-appearance: none;
          color-scheme: dark;
          padding-right: 1.75rem;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none' stroke='%23E8E4DF' stroke-opacity='.6' stroke-width='1.4'%3E%3Cpath d='M2.5 4.5 6 8l3.5-3.5'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.25rem center;
          cursor: pointer;
        }
        .cpf-select:has(option[value='']:checked) { color: rgba(232, 228, 223, 0.3); }
        .cpf-select option { background: ${BG}; color: ${INK}; }
        .cpf-error {
          margin: 0.4rem 0 0;
          font-size: 0.7rem;
          color: #FF9B93;
        }
        .cpf-hint {
          margin: 0.4rem 0 0;
          font-size: 0.7rem;
          line-height: 1.5;
          color: rgba(232, 228, 223, 0.45);
        }
        .cpf-check {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          font-size: 0.95rem;
          color: rgba(232, 228, 223, 0.8);
          cursor: pointer;
        }
        .cpf-check input {
          width: 1.05rem;
          height: 1.05rem;
          margin: 0;
          flex: none;
          accent-color: ${BLUE};
          cursor: pointer;
        }
        .cpf-failed {
          font-size: 0.75rem;
          line-height: 1.5;
          color: #FF9B93;
        }
        .cpf-failed p { margin: 0; }
        .cpf-failed a { color: inherit; text-decoration: underline; }
        .cpf-submit {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          align-self: flex-start;
          margin-top: 0.25rem;
          padding: 0.85rem 2.25rem;
          background: ${INK};
          color: ${BG};
          border: none;
          border-radius: 0;
          font-size: 0.8rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          transition: opacity 200ms, background 200ms, color 200ms;
        }
        .cpf-submit:hover:not(:disabled) { background: ${BLUE}; color: ${PAPER}; }
        .cpf-submit:disabled { cursor: default; opacity: 0.6; }
        .cpf-arrow { transition: transform 200ms; }
        .cpf-submit:hover:not(:disabled) .cpf-arrow { transform: translateX(4px); }
        .cpf-trap {
          position: absolute;
          left: -10000px;
          width: 1px;
          height: 1px;
          overflow: hidden;
        }
        .cpf-done { outline: none; }
        .cpf-donehead {
          margin: 0 0 0.5rem;
          font-size: 1.15rem;
          color: ${INK};
        }
        .cpf-donebody {
          margin: 0;
          max-width: 36ch;
          font-size: 1rem;
          line-height: 1.6;
          color: rgba(232, 228, 223, 0.7);
        }
      `}</style>
    </>
  )
}
