'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm, ValidationError } from '@formspree/react'
import { useLenis } from '@/lib/lenis-provider'
import { LISTED_CONTACT_DETAILS } from '@/lib/contact-details'
import { MobileBar } from './mobile-bar'
import { BG, INK, BLUE, RULE, ink } from './landing-theme'

/* ============================================
   Mobile Contact.
   Every way to reach the studio, listed and tappable. The quote form waits
   behind one button and opens as a sheet, so the page itself is just the
   details.
   ============================================ */

/** Same Formspree endpoint as the desktop forms, so it all lands in one inbox. */
const FORM_ID = 'xnjkavky'

export function MobileContact() {
  const lenis = useLenis()
  const [formOpen, setFormOpen] = useState(false)
  const [state, handleSubmit] = useForm(FORM_ID)
  const firstField = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!formOpen) return
    lenis?.stop()
    // Let the sheet start rising before the keyboard does.
    const t = window.setTimeout(() => firstField.current?.focus(), 350)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setFormOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(t)
      lenis?.start()
      window.removeEventListener('keydown', onKey)
    }
  }, [formOpen, lenis])

  const tab = formOpen ? 0 : -1

  return (
    <div className="mc">
      <section className="mc-pad mc-open">
        <h1 className="mc-head">Contact</h1>
      </section>

      <ul className="mc-list">
        {LISTED_CONTACT_DETAILS.map((d) => (
          <li key={d.label}>
            {d.href ? (
              <a
                href={d.href}
                className="mc-row"
                {...(d.external ? { target: '_blank', rel: 'noreferrer' } : {})}
              >
                <span className="mc-label font-mono">{d.label}</span>
                <span className="mc-value">{d.value}</span>
                {!d.external && (
                  <span className="mc-go" aria-hidden>
                    →
                  </span>
                )}
              </a>
            ) : (
              <div className="mc-row">
                <span className="mc-label font-mono">{d.label}</span>
                <span className="mc-value">{d.value}</span>
              </div>
            )}
          </li>
        ))}
      </ul>

      <section className="mc-pad mc-end">
        <button type="button" className="mc-quote" onClick={() => setFormOpen(true)}>
          <span>Get a quote</span>
          <span aria-hidden>→</span>
        </button>
      </section>

      <MobileBar page="contact" />

      {/* ---- Quote sheet ---- */}
      <div
        className={`mc-sheet${formOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Get a quote"
        aria-hidden={!formOpen}
        data-lenis-prevent
      >
        <div className="mc-sheet-head font-mono">
          <span>Get a quote</span>
          <button
            type="button"
            className="mc-close"
            onClick={() => setFormOpen(false)}
            tabIndex={tab}
          >
            Close ✕
          </button>
        </div>

        <div className="mc-pad mc-sheet-body">
          {state.succeeded ? (
            <p className="mc-done" role="status">
              Message sent. Thanks, we&rsquo;ll be in touch soon.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mc-form">
              <p className="mc-intro">
                Tell us a little about the project and we&rsquo;ll set up a call.
              </p>
              <input type="hidden" name="intent" value="project inquiry" />
              <input type="hidden" name="_subject" value="New project inquiry" />
              <input
                type="text"
                name="_gotcha"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                className="mc-gotcha"
              />

              <label className="mc-field">
                <span className="mc-label font-mono">Name</span>
                <input
                  ref={firstField}
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  tabIndex={tab}
                />
              </label>
              <label className="mc-field">
                <span className="mc-label font-mono">Email</span>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  tabIndex={tab}
                />
                <ValidationError field="email" errors={state.errors} className="mc-err" />
              </label>
              <label className="mc-field">
                <span className="mc-label font-mono">Project</span>
                <textarea
                  name="project"
                  rows={4}
                  placeholder="What are you making, and where will it live?"
                  required
                  tabIndex={tab}
                />
              </label>

              <ValidationError errors={state.errors} className="mc-err" />
              <button
                type="submit"
                className="mc-quote"
                disabled={state.submitting}
                tabIndex={tab}
              >
                <span>{state.submitting ? 'Sending' : 'Send'}</span>
                <span aria-hidden>→</span>
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        .mc {
          --mc-edge: 20px;
          background: ${BG};
          color: ${INK};
          min-height: 100svh;
        }
        .mc-pad { padding-left: var(--mc-edge); padding-right: var(--mc-edge); }
        .mc-open { padding-top: calc(env(safe-area-inset-top) + var(--mc-edge)); padding-bottom: 28px; }
        .mc-end { padding-top: 32px; padding-bottom: calc(env(safe-area-inset-bottom) + 108px); }

        .mc-head {
          margin: 0;
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: clamp(48px, 15vw, 72px);
          line-height: 0.9;
          letter-spacing: -0.04em;
          color: #fff;
        }
        .mc-label {
          display: block;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: ${ink(0.5)};
        }

        /* Details */
        .mc-list {
          list-style: none;
          margin: 0 var(--mc-edge);
          padding: 0;
          border-top: 1px solid ${RULE};
        }
        .mc-list li { border-bottom: 1px solid ${RULE}; }
        .mc-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          grid-template-areas: 'label go' 'value go';
          align-items: center;
          row-gap: 6px;
          padding: 16px 0;
          color: #fff;
          text-decoration: none;
          -webkit-tap-highlight-color: transparent;
        }
        .mc-row .mc-label { grid-area: label; }
        .mc-value {
          grid-area: value;
          min-width: 0;
          overflow-wrap: anywhere;
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: 22px;
          line-height: 1.15;
          letter-spacing: -0.02em;
        }
        .mc-go {
          grid-area: go;
          padding-left: 16px;
          font-size: 20px;
          color: ${ink(0.6)};
        }
        a.mc-row:active .mc-value,
        a.mc-row:active .mc-go { color: ${BLUE}; }

        /* The one button */
        .mc-quote {
          all: unset;
          box-sizing: border-box;
          cursor: pointer;
          display: flex;
          width: 100%;
          justify-content: space-between;
          align-items: center;
          height: 60px;
          padding: 0 22px;
          border-radius: 999px;
          background: ${BLUE};
          color: #fff;
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: 20px;
        }
        .mc-quote:disabled { opacity: 0.6; }
        .mc-quote:active { transform: scale(0.98); }

        /* Quote sheet */
        .mc-sheet {
          position: fixed;
          inset: 0;
          z-index: 50;
          background: ${BG};
          overflow-y: auto;
          overscroll-behavior: contain;
          visibility: hidden;
          transform: translateY(100%);
          transition:
            transform 550ms cubic-bezier(0.16, 1, 0.3, 1),
            visibility 0s 550ms;
        }
        .mc-sheet.is-open {
          visibility: visible;
          transform: none;
          transition: transform 550ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .mc-sheet-head {
          position: sticky;
          top: 0;
          z-index: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: calc(env(safe-area-inset-top) + 14px) var(--mc-edge) 14px;
          background: ${BG};
          border-bottom: 1px solid ${RULE};
          font-size: 13px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: ${ink(0.6)};
        }
        .mc-close {
          all: unset;
          cursor: pointer;
          padding: 8px 0 8px 16px;
          color: ${INK};
        }
        .mc-sheet-body { padding-top: 24px; padding-bottom: calc(env(safe-area-inset-bottom) + 32px); }
        .mc-intro {
          margin: 0 0 8px;
          font-size: 18px;
          line-height: 1.4;
          color: ${ink(0.82)};
        }

        .mc-form { display: flex; flex-direction: column; gap: 22px; }
        .mc-gotcha { position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0; }
        .mc-field { display: block; }
        .mc-field .mc-label { margin-bottom: 6px; }
        .mc-field input,
        .mc-field textarea {
          display: block;
          width: 100%;
          box-sizing: border-box;
          padding: 8px 0 10px;
          background: transparent;
          border: 0;
          border-bottom: 1px solid ${ink(0.3)};
          border-radius: 0;
          color: #fff;
          font: inherit;
          font-size: 18px; /* 16px+ keeps iOS from zooming on focus */
          outline: none;
          resize: none;
        }
        .mc-field textarea::placeholder { color: ${ink(0.35)}; }
        .mc-field input:focus,
        .mc-field textarea:focus { border-bottom-color: ${BLUE}; }
        .mc-err { color: #ff6b6b; font-size: 14px; margin-top: 6px; }

        .mc-done {
          margin: 0;
          padding: 8px 0;
          font-size: 22px;
          line-height: 1.3;
          color: #fff;
        }

        @media (prefers-reduced-motion: reduce) {
          .mc-sheet { transition-duration: 1ms; }
        }
      `}</style>
    </div>
  )
}
