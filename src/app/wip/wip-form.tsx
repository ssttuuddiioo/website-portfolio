'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BG, INK, ink } from '@/components/landing/landing-theme'

/**
 * The password field on the work-in-progress wall. On success the unlock cookie
 * is set server-side and the browser goes to whatever project page was asked
 * for — a hard navigation, so the middleware re-runs and now lets it through.
 */
export function WipForm({ from }: { from: string }) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [state, setState] = useState<'idle' | 'checking' | 'wrong'>('idle')

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setState('checking')

    const response = await fetch('/api/wip/unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    }).catch(() => null)

    if (!response?.ok) {
      setState('wrong')
      setPassword('')
      return
    }

    // Full navigation rather than router.push: the gate lives in middleware,
    // and only a fresh request carries the new cookie past it.
    window.location.href = from
    router.refresh()
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{ width: '100%', maxWidth: 420, marginTop: '2.5rem' }}
    >
      <label
        htmlFor="wip-password"
        className="font-mono"
        style={{
          display: 'block',
          fontSize: '0.7rem',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: ink(0.5),
          marginBottom: '0.6rem',
        }}
      >
        Password
      </label>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
        <input
          id="wip-password"
          type="password"
          name="password"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(event) => {
            setPassword(event.target.value)
            if (state === 'wrong') setState('idle')
          }}
          style={{
            flex: '1 1 200px',
            minWidth: 0,
            background: 'rgba(255,255,255,0.06)',
            border: `1px solid ${state === 'wrong' ? '#FF9B93' : ink(0.18)}`,
            borderRadius: 4,
            padding: '0.75rem 0.9rem',
            fontFamily: 'var(--font-display), sans-serif',
            fontSize: '1rem',
            color: INK,
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={state === 'checking' || password.length === 0}
          style={{
            padding: '0.75rem 1.6rem',
            background: INK,
            color: BG,
            border: 'none',
            borderRadius: 4,
            fontFamily: 'var(--font-display), sans-serif',
            fontSize: '0.95rem',
            fontWeight: 600,
            letterSpacing: '0.02em',
            cursor: state === 'checking' ? 'wait' : 'pointer',
            opacity: password.length === 0 ? 0.5 : 1,
            transition: 'opacity var(--duration-fast) var(--ease-smooth)',
          }}
        >
          {state === 'checking' ? 'Checking…' : 'Enter'}
        </button>
      </div>

      <p
        className="font-mono"
        style={{
          fontSize: '0.72rem',
          letterSpacing: '0.04em',
          color: state === 'wrong' ? '#FF9B93' : 'transparent',
          marginTop: '0.7rem',
          minHeight: '1rem',
        }}
        aria-live="polite"
      >
        {state === 'wrong' ? 'Not it. Try again.' : ' '}
      </p>
    </form>
  )
}
